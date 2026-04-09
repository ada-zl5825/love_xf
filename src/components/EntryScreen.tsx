"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/config";

interface EntryScreenProps {
  onEnter: () => void;
}

export default function EntryScreen({ onEnter }: EntryScreenProps) {
  return (
    <motion.section
      className="fixed inset-0 z-20 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8 }}
    >
      <motion.p
        className="mb-4 text-sm tracking-[0.3em] uppercase text-rose-gold/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        For XF
      </motion.p>

      <motion.h1
        className="mb-16 max-w-md text-center font-serif text-2xl leading-relaxed tracking-wide text-warm-white sm:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
      >
        {siteConfig.entryTitle}
      </motion.h1>

      <motion.button
        onClick={onEnter}
        className="group relative min-h-[44px] min-w-[44px] cursor-pointer rounded-full border border-rose-gold/30 bg-rose-gold/10 px-10 py-3 font-serif text-lg tracking-widest text-warm-white backdrop-blur-sm transition-colors hover:border-rose-gold/50 hover:bg-rose-gold/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="relative z-10">{siteConfig.entryButton}</span>
        <span className="absolute inset-0 rounded-full bg-rose-gold/15 blur-md animate-[breath_3s_ease-in-out_infinite]" />
      </motion.button>

      <motion.div
        className="absolute bottom-[env(safe-area-inset-bottom,12px)] pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span className="inline-block animate-bounce text-xs text-rose-gold/30">
          ↑
        </span>
      </motion.div>
    </motion.section>
  );
}
