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
import { useMusic } from "@/components/MusicProvider";

const HeartCanvas = dynamic(() => import("@/components/HeartCanvas"), {
  ssr: false,
});

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [hasAccepted, setHasAccepted] = useState(false);
  const { play } = useMusic();

  useEffect(() => {
    storage.getAcceptedAt().then((ts) => {
      if (ts) setHasAccepted(true);
    });
  }, []);

  const handleEnter = () => {
    // Kick off background music on the first user gesture; browsers
    // block autoplay until the user has interacted with the page.
    void play();
    setPhase("heart");
  };

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
          <EntryScreen key="intro" onEnter={handleEnter} />
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
