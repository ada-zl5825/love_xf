"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Phase } from "@/types";
import EntryScreen from "@/components/EntryScreen";
import StoryTimeline from "@/components/StoryTimeline";
import LetterSection from "@/components/LetterSection";
import ProposalSection from "@/components/ProposalSection";

const HeartCanvas = dynamic(() => import("@/components/HeartCanvas"), {
  ssr: false,
});

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");

  return (
    <div className="relative min-h-dvh">
      {phase !== "story" && (
        <HeartCanvas
          started={phase === "heart"}
          onComplete={() => setPhase("story")}
        />
      )}

      <AnimatePresence>
        {phase === "intro" && (
          <EntryScreen key="intro" onEnter={() => setPhase("heart")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "story" && (
          <StoryTimeline key="story">
            <LetterSection />
            <ProposalSection />
          </StoryTimeline>
        )}
      </AnimatePresence>
    </div>
  );
}
