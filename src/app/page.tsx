"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Phase } from "@/types";
import { storage } from "@/lib/storage";
import EntryScreen from "@/components/EntryScreen";
import StoryTimeline from "@/components/StoryTimeline";
import LetterSection from "@/components/LetterSection";
import ProposalSection from "@/components/ProposalSection";
import TogetherEntry from "@/components/TogetherEntry";

const HeartCanvas = dynamic(() => import("@/components/HeartCanvas"), {
  ssr: false,
});

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    storage.getAcceptedAt().then((ts) => {
      if (ts) setHasAccepted(true);
    });
  }, []);

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
            {hasAccepted ? <TogetherEntry /> : <ProposalSection />}
          </StoryTimeline>
        )}
      </AnimatePresence>
    </div>
  );
}
