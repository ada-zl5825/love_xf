"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { StoryNode } from "@/types";

interface StoryCardProps {
  node: StoryNode;
  index: number;
  total: number;
}

const ease = [0.25, 0.1, 0.25, 1] as const;

function formatDate(dateStr: string) {
  return dateStr.replace(/-/g, ".");
}

export default function StoryCard({ node, index, total }: StoryCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="relative flex h-dvh snap-start snap-always flex-col items-center justify-center px-8"
    >
      <div className="flex flex-col items-center">
        <motion.span
          className="mb-8 font-sans text-[10px] tracking-[0.3em] text-rose-gold/25"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {String(index + 1).padStart(2, "0")} — {String(total).padStart(2, "0")}
        </motion.span>

        {node.date && (
          <motion.time
            className="mb-4 font-sans text-xs tracking-[0.2em] text-rose-gold/45"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {formatDate(node.date)}
          </motion.time>
        )}

        <motion.h2
          className="mb-5 text-center font-serif text-2xl leading-snug tracking-wide text-warm-white sm:text-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease }}
        >
          {node.title}
        </motion.h2>

        <motion.div
          className="mb-6 h-px w-10"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(183,110,121,0.4), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        <motion.p
          className="max-w-xs text-center font-serif text-base leading-[1.9] text-warm-white/55 sm:max-w-sm sm:text-lg sm:leading-[2]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.5, ease }}
        >
          {node.description}
        </motion.p>

        {node.image && (
          <motion.div
            className="mt-8 max-w-sm overflow-hidden rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <img
              src={node.image}
              alt={node.title}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        )}
      </div>

      {index === 0 && (
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-[10px] tracking-[0.2em] text-rose-gold/25">
            滑动继续
          </span>
          <motion.span
            className="text-xs text-rose-gold/25"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </section>
  );
}
