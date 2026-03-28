"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Phase } from "@/types";
import EntryScreen from "@/components/EntryScreen";
import StoryTimeline from "@/components/StoryTimeline";
import LetterSection from "@/components/LetterSection";

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
          <HeartCanvas key="heart" onComplete={() => setPhase("story")} />
        )}

        {phase === "story" && (
          <StoryTimeline key="story">
            <LetterSection />
          </StoryTimeline>
        )}
      </AnimatePresence>
    </div>
  );
}
