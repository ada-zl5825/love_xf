"use client";

import { motion } from "framer-motion";
import { foryouContent } from "@/data/foryou";

interface Props {
  onNext: () => void;
}

export default function OpeningStatement({ onNext }: Props) {
  const { title, paragraphs, button } = foryouContent.screen2;
  const totalDelay = 1.2 + paragraphs.length * 1.2;

  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="mb-10 font-serif text-lg tracking-wider text-warm-white/80"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {title}
      </motion.h2>

      <div className="flex flex-col items-center gap-4">
        {paragraphs.map((text, i) => (
          <motion.p
            key={i}
            className="max-w-sm text-center text-sm leading-relaxed tracking-wider text-warm-white/45"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.2 + i * 1.2 }}
          >
            {text}
          </motion.p>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        className="mt-14 text-xs tracking-[0.2em] text-amber-200/40 transition-colors hover:text-amber-200/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: totalDelay }}
      >
        {button}
      </motion.button>

      <motion.div
        className="mt-4 text-amber-200/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: totalDelay + 0.5 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M19 12l-7 7-7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
