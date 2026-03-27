"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Phase } from "@/types";
import EntryScreen from "@/components/EntryScreen";

const HeartCanvas = dynamic(() => import("@/components/HeartCanvas"), {
  ssr: false,
});

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");

  return (
    <div className="relative min-h-dvh">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <EntryScreen key="intro" onEnter={() => setPhase("heart")} />
        )}

        {phase === "heart" && (
          <HeartCanvas key="heart" onExplode={() => setPhase("explode")} />
        )}

        {phase === "explode" && (
          <div
            key="explode"
            className="flex min-h-dvh items-center justify-center"
          >
            <p className="text-warm-white/50">DaysCounter placeholder</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
