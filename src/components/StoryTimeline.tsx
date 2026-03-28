"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { storyNodes } from "@/data/story";
import StoryCard from "./StoryCard";

export default function StoryTimeline({
  children,
}: {
  children?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(Math.min(idx, storyNodes.length - 1));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative h-dvh"
    >
      {/* Side progress dots */}
      <div className="fixed right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
        {storyNodes.map((_, i) => (
          <motion.div
            key={i}
            className="flex h-2 w-2 items-center justify-center"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
          >
            <div
              className={`rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? "h-2 w-2 bg-rose-gold/70"
                  : "h-1 w-1 bg-rose-gold/25"
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Scrollable story cards */}
      <div
        ref={containerRef}
        className="h-full snap-y snap-mandatory overflow-y-auto"
      >
        {storyNodes.map((node, index) => (
          <StoryCard
            key={node.id}
            node={node}
            index={index}
            total={storyNodes.length}
          />
        ))}
        {children}
      </div>
    </motion.div>
  );
}
