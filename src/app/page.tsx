"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Phase } from "@/types";
import EntryScreen from "@/components/EntryScreen";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");

  return (
    <div className="relative min-h-dvh">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <EntryScreen key="intro" onEnter={() => setPhase("heart")} />
        )}

        {phase === "heart" && (
          <div key="heart" className="flex min-h-dvh items-center justify-center">
            <p className="text-warm-white/50">HeartCanvas placeholder</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
