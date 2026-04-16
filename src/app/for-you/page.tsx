"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import EnvelopeEntry from "@/components/foryou/EnvelopeEntry";

const OpeningStatement = dynamic(
  () => import("@/components/foryou/OpeningStatement"),
  { ssr: false },
);
const SongClosing = dynamic(
  () => import("@/components/foryou/SongClosing"),
  { ssr: false },
);

type Screen = "envelope" | "opening" | "scroll";

export default function ForYouPage() {
  const [screen, setScreen] = useState<Screen>("envelope");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [particles, setParticles] = useState<
    { w: number; h: number; x: number; y: number; dur: number; delay: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        w: 2 + Math.random() * 4,
        h: 2 + Math.random() * 4,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dur: 18 + Math.random() * 12,
        delay: -Math.random() * 20,
      })),
    );
  }, []);

  const playBgm = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const handleEnvelopeOpen = useCallback(() => {
    playBgm();
    setScreen("opening");
  }, [playBgm]);

  const handleContinue = useCallback(() => {
    setScreen("scroll");
  }, []);

  return (
    <div
      className="relative min-h-dvh"
      style={{
        background: "linear-gradient(180deg, #0f0f12 0%, #15161a 100%)",
      }}
    >
      <audio ref={audioRef} src="/music/薛之谦 - 陪你去流浪.mp3" loop preload="auto" />

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-amber-200/[0.2]"
            style={{
              width: p.w,
              height: p.h,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `float-slow ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Warm-gold ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute top-[20%] left-[25%] h-72 w-72 rounded-full blur-[100px] animate-float-slow"
          style={{ backgroundColor: "rgba(201,169,110,0.04)" }}
        />
        <div
          className="absolute top-[55%] right-[20%] h-56 w-56 rounded-full blur-[80px] animate-float-medium"
          style={{ backgroundColor: "rgba(201,169,110,0.03)" }}
        />
        <div
          className="absolute top-[40%] left-[60%] h-64 w-64 rounded-full blur-[90px] animate-float-drift"
          style={{ backgroundColor: "rgba(183,110,121,0.025)" }}
        />
      </div>

      {/* Screens 1–2: click-driven transitions */}
      <AnimatePresence mode="wait">
        {screen === "envelope" && (
          <EnvelopeEntry key="envelope" onNext={handleEnvelopeOpen} />
        )}
        {screen === "opening" && (
          <OpeningStatement key="opening" onNext={handleContinue} />
        )}
      </AnimatePresence>

      {/* Screens 3–6: scroll-snap */}
      {screen === "scroll" && (
        <motion.div
          className="h-dvh snap-y snap-mandatory overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SongClosing />
        </motion.div>
      )}
    </div>
  );
}
