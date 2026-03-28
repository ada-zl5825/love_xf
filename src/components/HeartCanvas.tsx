"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

interface HeartCanvasProps {
  onExplode: () => void;
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
}

const COUNT = 3000;
const EDGE_COUNT = Math.round(COUNT * 0.3);
const ASSEMBLE_MS = 2200;
const THICKNESS = 5;
const ROT_SPEED = 0.0004;

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

export default function HeartCanvas({ onExplode }: HeartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onExplode);
  cbRef.current = onExplode;

  const S = useRef({
    ps: [] as PState[],
    raf: 0,
    t0: 0,
    exploding: false,
    explodeT: 0,
    ready: false,
    rotY: 0,
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
      const elt = st.exploding ? now - st.explodeT : 0;
      // ~88 BPM heartbeat with sharp pulse (心动节奏)
      const BEAT_MS = 682;
      const beatPhase = (elapsed % BEAT_MS) / BEAT_MS;
      const beatPulse = Math.pow(Math.sin(beatPhase * Math.PI), 4);
      const beat = st.exploding ? 1 : 1 + 0.055 * beatPulse;

      let assembled = 0;
      let anyVisible = false;
      const pos = posAttr.array as Float32Array;
      const op = opAttr.array as Float32Array;

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];

        if (st.exploding) {
          p.wx += p.vx;
          p.wy += p.vy;
          p.wz += p.vz;
          p.vx *= 0.984;
          p.vy *= 0.984;
          p.vz *= 0.984;
          p.vy -= 0.015;

          p.opacity =
            elt < 120
              ? Math.min(1, p.maxOpacity * (1.3 - elt / 400))
              : p.maxOpacity * Math.max(0, 1 - (elt - 120) / 2000);
        } else {
          const pe = Math.max(0, elapsed - p.delay);
          const prog = Math.min(1, pe / ASSEMBLE_MS);
          const e = easeOutCubic(prog);

          const l = 0.04 + e * 0.06;
          const wSeed = p.delay * 9;
          const driftX = Math.sin(elapsed * 0.0015 + wSeed) * 0.4;
          const driftY = Math.cos(elapsed * 0.0013 + wSeed * 1.3) * 0.4;
          const driftZ = Math.sin(elapsed * 0.0011 + wSeed * 0.7) * 0.3;
          p.wx += (p.lx * beat + driftX - p.wx) * l;
          p.wy += (p.ly * beat + driftY - p.wy) * l;
          p.wz += (p.lz * beat + driftZ - p.wz) * l;

          p.opacity = e * p.maxOpacity;
          if (prog >= 1) assembled++;

          const tw = 0.92 + 0.08 * Math.sin(elapsed * 0.004 + p.delay * 3);
          p.opacity *= tw;
        }

        const i3 = i * 3;
        pos[i3] = p.wx;
        pos[i3 + 1] = p.wy;
        pos[i3 + 2] = p.wz;
        op[i] = p.opacity;

        if (p.opacity >= 0.005) anyVisible = true;
      }

      posAttr.needsUpdate = true;
      opAttr.needsUpdate = true;

      if (!st.exploding) {
        st.rotY = elapsed * ROT_SPEED;
        st.ready = assembled > particles.length * 0.4;
      } else if (!anyVisible || elt > 2500) {
        cbRef.current();
        return;
      }
      points.rotation.y = st.rotY;

      if (composer) {
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
    if (st.exploding || !st.ready) return;

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
    />
  );
}
