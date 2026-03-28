"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { daysBetween } from "@/lib/date";
import { siteConfig } from "@/data/config";

interface HeartCanvasProps {
  onComplete: () => void;
}

interface PState {
  lx: number;
  ly: number;
  lz: number;
  wx: number;
  wy: number;
  wz: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  delay: number;
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  rz: number;
  reformDelay: number;
}

const COUNT = 3000;
const EDGE_COUNT = Math.round(COUNT * 0.3);
const ASSEMBLE_MS = 2200;
const THICKNESS = 5;
const ROT_SPEED = 0.0004;
const EXPLODE_TO_REFORM_MS = 900;
const REFORM_MS = 1800;
const REFORM_STAGGER = 500;
const HOLD_MS = 2500;
const FADE_MS = 800;
const TEXT_WORLD_WIDTH = 28;

const PALETTE: [number, number, number][] = [
  [183 / 255, 110 / 255, 121 / 255],
  [232 / 255, 160 / 255, 180 / 255],
  [240 / 255, 198 / 255, 212 / 255],
  [245 / 255, 240 / 255, 235 / 255],
  [210 / 255, 145 / 255, 160 / 255],
];

function hx(t: number) {
  const s = Math.sin(t);
  return 16 * s * s * s;
}

function hy(t: number) {
  return -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );
}

function arcLengthSample(n: number): number[] {
  const R = 2000;
  const c = new Float64Array(R + 1);
  let px = hx(0),
    py = hy(0);
  for (let i = 1; i <= R; i++) {
    const t = (i / R) * Math.PI * 2;
    const x = hx(t),
      y = hy(t);
    c[i] = c[i - 1] + Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  const total = c[R];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    let lo = 0,
      hi = R;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (c[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const prev = Math.max(0, lo - 1);
    const seg = c[lo] - c[prev];
    const f = seg > 0 ? (target - c[prev]) / seg : 0;
    out.push(((prev + f) / R) * Math.PI * 2);
  }
  return out;
}

function easeOutCubic(x: number) {
  return 1 - (1 - x) ** 3;
}

function sampleTextPositions(
  text: string,
  count: number,
  worldWidth: number,
): { x: number; y: number }[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Array.from({ length: count }, () => ({ x: 0, y: 0 }));

  const fontSize = 160;
  canvas.width = 1;
  canvas.height = 1;
  ctx.font = `bold ${fontSize}px sans-serif`;
  const measured = ctx.measureText(text).width;

  const pad = 40;
  const W = Math.ceil(measured + pad * 2);
  const H = Math.ceil(fontSize * 1.8);
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { x: number; y: number }[] = [];
  let minX = W,
    maxX = 0,
    minY = H,
    maxY = 0;

  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        pts.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (pts.length === 0) {
    return Array.from({ length: count }, () => ({ x: 0, y: 0 }));
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const tw = maxX - minX || 1;
  const scale = worldWidth / tw;

  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const p = pts[Math.floor(Math.random() * pts.length)];
    result.push({
      x: (p.x - cx) * scale,
      y: -(p.y - cy) * scale,
    });
  }
  return result;
}

const VERT = /* glsl */ `
attribute float aSize;
attribute float aOpacity;
attribute vec3 aColor;

varying float vOpacity;
varying vec3 vColor;

void main() {
  vOpacity = aOpacity;
  vColor = aColor;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (220.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAG = /* glsl */ `
varying float vOpacity;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export default function HeartCanvas({ onComplete }: HeartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  const S = useRef({
    ps: [] as PState[],
    raf: 0,
    t0: 0,
    exploding: false,
    explodeT: 0,
    ready: false,
    rotY: 0,
    reforming: false,
    reformT: 0,
    holdStart: 0,
    fading: false,
    fadeT: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const st = S.current;
    let w = window.innerWidth;
    let h = window.innerHeight;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // --- Camera (responsive to aspect ratio) ---
    const aspect = w / h;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
    const camZ = aspect < 1 ? 35 + (1 / aspect - 1) * 22 : 35;
    camera.position.set(0, -2, camZ);
    camera.lookAt(0, -2, 0);

    // --- Scene ---
    const scene = new THREE.Scene();

    // --- Post-processing (with Safari/iOS fallback) ---
    let composer: EffectComposer | null = null;
    try {
      const c = new EffectComposer(renderer);
      c.addPass(new RenderPass(scene, camera));
      c.addPass(
        new UnrealBloomPass(new THREE.Vector2(w, h), 0.3, 0.15, 0.55),
      );
      c.addPass(new OutputPass());
      composer = c;
    } catch {
      composer = null;
    }

    // --- Generate particles ---
    const edgeTs = arcLengthSample(EDGE_COUNT);
    const positions = new Float32Array(COUNT * 3);
    const colorsArr = new Float32Array(COUNT * 3);
    const sizesArr = new Float32Array(COUNT);
    const opacitiesArr = new Float32Array(COUNT);
    const particles: PState[] = [];

    for (let i = 0; i < COUNT; i++) {
      const isEdge = i < EDGE_COUNT;
      const t = isEdge ? edgeTs[i] : Math.random() * Math.PI * 2;
      const spread = isEdge
        ? 0.94 + Math.random() * 0.12
        : 0.05 + Math.random() * 0.91;

      const x2d = hx(t) * spread;
      const y2d = hy(t) * spread;
      const maxZ = THICKNESS * Math.sqrt(Math.max(0, 1 - spread * spread));
      const lz = (Math.random() * 2 - 1) * maxZ * (isEdge ? 0.3 : 1);

      const [cr, cg, cb] = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      const p: PState = {
        lx: x2d,
        ly: -y2d,
        lz,
        wx: (Math.random() - 0.5) * 70,
        wy: (Math.random() - 0.5) * 70,
        wz: (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
        vz: 0,
        size: isEdge
          ? 0.3 + Math.random() * 0.4
          : 0.25 + Math.random() * 0.55,
        opacity: 0,
        maxOpacity: isEdge
          ? 0.55 + Math.random() * 0.45
          : 0.3 + Math.random() * 0.5,
        delay: Math.random() * 700,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        reformDelay: 0,
      };
      particles.push(p);

      const i3 = i * 3;
      positions[i3] = p.wx;
      positions[i3 + 1] = p.wy;
      positions[i3 + 2] = p.wz;
      colorsArr[i3] = cr;
      colorsArr[i3 + 1] = cg;
      colorsArr[i3 + 2] = cb;
      sizesArr[i] = p.size;
      opacitiesArr[i] = 0;
    }
    st.ps = particles;

    // --- Geometry + Material ---
    const geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    const opAttr = new THREE.BufferAttribute(opacitiesArr, 1);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colorsArr, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizesArr, 1));
    geometry.setAttribute("aOpacity", opAttr);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    st.t0 = performance.now();

    // --- Animation loop ---
    function frame() {
      const now = performance.now();
      const elapsed = now - st.t0;
      const pos = posAttr.array as Float32Array;
      const op = opAttr.array as Float32Array;

      if (st.fading) {
        // Phase 4 — fade out text, then signal completion
        const fp = Math.min(1, (now - st.fadeT) / FADE_MS);
        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const wSeed = p.delay * 9;
          const driftX = Math.sin(elapsed * 0.0012 + wSeed) * 0.3;
          const driftY = Math.cos(elapsed * 0.001 + wSeed * 1.3) * 0.3;
          const driftZ = Math.sin(elapsed * 0.0009 + wSeed * 0.7) * 0.2;
          const tw =
            0.92 + 0.08 * Math.sin(elapsed * 0.004 + p.delay * 3);

          const i3 = i * 3;
          pos[i3] = p.tx + driftX;
          pos[i3 + 1] = p.ty + driftY;
          pos[i3 + 2] = p.tz + driftZ;
          op[i] =
            p.maxOpacity * 0.85 * tw * (1 - easeOutCubic(fp));
        }
        posAttr.needsUpdate = true;
        opAttr.needsUpdate = true;
        if (labelRef.current) {
          labelRef.current.style.opacity = String(
            1 - easeOutCubic(fp),
          );
        }
        if (fp >= 1) {
          cbRef.current();
          return;
        }
      } else if (st.reforming) {
        // Phase 3 — particles converge to "XXX 天" text
        const rt = now - st.reformT;
        let allDone = true;

        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const pe = Math.max(0, rt - p.reformDelay);
          const prog = Math.min(1, pe / REFORM_MS);
          const e = easeOutCubic(prog);

          const wSeed = p.delay * 9;
          const driftX = Math.sin(elapsed * 0.0012 + wSeed) * 0.3;
          const driftY = Math.cos(elapsed * 0.001 + wSeed * 1.3) * 0.3;
          const driftZ = Math.sin(elapsed * 0.0009 + wSeed * 0.7) * 0.2;
          const driftScale = prog > 0.6 ? (prog - 0.6) / 0.4 : 0;

          p.wx =
            p.rx + (p.tx - p.rx) * e + driftX * driftScale;
          p.wy =
            p.ry + (p.ty - p.ry) * e + driftY * driftScale;
          p.wz =
            p.rz + (p.tz - p.rz) * e + driftZ * driftScale;

          const tw =
            0.92 + 0.08 * Math.sin(elapsed * 0.004 + p.delay * 3);
          p.opacity =
            p.maxOpacity * 0.85 * Math.min(1, prog / 0.3) * tw;

          if (prog < 1) allDone = false;

          const i3 = i * 3;
          pos[i3] = p.wx;
          pos[i3 + 1] = p.wy;
          pos[i3 + 2] = p.wz;
          op[i] = p.opacity;
        }

        posAttr.needsUpdate = true;
        opAttr.needsUpdate = true;

        if (labelRef.current) {
          labelRef.current.style.opacity = String(
            Math.min(1, rt / 600),
          );
        }

        points.rotation.y += (0 - points.rotation.y) * 0.08;

        if (allDone && !st.holdStart) st.holdStart = now;
        if (st.holdStart && now - st.holdStart >= HOLD_MS) {
          st.fading = true;
          st.fadeT = now;
        }
      } else if (st.exploding) {
        // Phase 2 — particles fly outward, then transition to reform
        const elt = now - st.explodeT;

        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          p.wx += p.vx;
          p.wy += p.vy;
          p.wz += p.vz;
          p.vx *= 0.984;
          p.vy *= 0.984;
          p.vz *= 0.984;
          p.vy -= 0.015;

          p.opacity = p.maxOpacity * Math.max(0.15, 1 - elt / 2500);

          const i3 = i * 3;
          pos[i3] = p.wx;
          pos[i3 + 1] = p.wy;
          pos[i3 + 2] = p.wz;
          op[i] = p.opacity;
        }

        posAttr.needsUpdate = true;
        opAttr.needsUpdate = true;

        if (elt >= EXPLODE_TO_REFORM_MS) {
          st.reforming = true;
          st.reformT = now;

          const cosR = Math.cos(points.rotation.y);
          const sinR = Math.sin(points.rotation.y);
          const days = daysBetween(siteConfig.metDate);
          const targets = sampleTextPositions(
            `${days}天`,
            COUNT,
            TEXT_WORLD_WIDTH,
          );

          for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            const wX = p.wx * cosR + p.wz * sinR;
            const wZ = -p.wx * sinR + p.wz * cosR;
            p.rx = wX;
            p.ry = p.wy;
            p.rz = wZ;
            p.wx = wX;
            p.wz = wZ;
            p.tx = targets[i].x;
            p.ty = targets[i].y - 2;
            p.tz = (Math.random() - 0.5) * 0.8;
            p.reformDelay = Math.random() * REFORM_STAGGER;
            const i3 = i * 3;
            pos[i3] = wX;
            pos[i3 + 2] = wZ;
          }
          posAttr.needsUpdate = true;
          points.rotation.y = 0;
        }
      } else {
        // Phase 1 — assembly + heartbeat
        const BEAT_MS = 682;
        const beatPhase = (elapsed % BEAT_MS) / BEAT_MS;
        const beatPulse = Math.pow(Math.sin(beatPhase * Math.PI), 4);
        const beat = 1 + 0.055 * beatPulse;

        let assembled = 0;

        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const pe = Math.max(0, elapsed - p.delay);
          const prog = Math.min(1, pe / ASSEMBLE_MS);
          const e = easeOutCubic(prog);

          const l = 0.04 + e * 0.06;
          const wSeed = p.delay * 9;
          const driftX = Math.sin(elapsed * 0.0015 + wSeed) * 0.4;
          const driftY =
            Math.cos(elapsed * 0.0013 + wSeed * 1.3) * 0.4;
          const driftZ =
            Math.sin(elapsed * 0.0011 + wSeed * 0.7) * 0.3;
          p.wx += (p.lx * beat + driftX - p.wx) * l;
          p.wy += (p.ly * beat + driftY - p.wy) * l;
          p.wz += (p.lz * beat + driftZ - p.wz) * l;

          p.opacity = e * p.maxOpacity;
          if (prog >= 1) assembled++;

          const tw =
            0.92 + 0.08 * Math.sin(elapsed * 0.004 + p.delay * 3);
          p.opacity *= tw;

          const i3 = i * 3;
          pos[i3] = p.wx;
          pos[i3 + 1] = p.wy;
          pos[i3 + 2] = p.wz;
          op[i] = p.opacity;
        }

        posAttr.needsUpdate = true;
        opAttr.needsUpdate = true;

        st.rotY = elapsed * ROT_SPEED;
        st.ready = assembled > particles.length * 0.4;
        points.rotation.y = st.rotY;
      }

      const useBloom = !st.reforming && !st.fading;
      if (useBloom && composer) {
        try {
          composer.render();
        } catch {
          composer = null;
          renderer.render(scene, camera);
        }
      } else {
        renderer.render(scene, camera);
      }
      st.raf = requestAnimationFrame(frame);
    }

    st.raf = requestAnimationFrame(frame);

    // --- Resize ---
    function handleResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const a = w / h;
      camera.aspect = a;
      camera.position.z = a < 1 ? 35 + (1 / a - 1) * 22 : 35;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer?.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("resize", handleResize);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      composer?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    const st = S.current;
    if (st.exploding || st.reforming || st.fading || !st.ready) return;

    st.exploding = true;
    st.explodeT = performance.now();

    for (const p of st.ps) {
      const dx = p.wx;
      const dy = p.wy + 2;
      const dz = p.wz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const speed = 1.5 + Math.random() * 4;
      p.vx = (dx / dist) * speed + (Math.random() - 0.5) * 1.5;
      p.vy = (dy / dist) * speed + (Math.random() - 0.5) * 1.5;
      p.vz = (dz / dist) * speed + (Math.random() - 0.5) * 1.5;
    }
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-10 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={handleClick}
    >
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-x-0 z-20 text-center"
        style={{ top: "27%", opacity: 0 }}
      >
        <p
          className="text-xl font-light tracking-[0.15em] md:text-2xl"
          style={{ color: "rgba(240, 198, 212, 0.85)" }}
        >
          这是我们认识的第
        </p>
      </div>
    </motion.div>
  );
}
