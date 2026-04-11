"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import MessageWall from "@/components/MessageWall";

export default function MessagesPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-dvh pb-8 pt-safe">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm tracking-wider text-rose-gold/50 transition-colors hover:text-rose-gold/70"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            返回
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-lg tracking-widest text-warm-white/80"
          >
            F&F的表白墙
          </motion.h1>

          <div className="w-12" />
        </div>

        {/* Gradient fade under header */}
        <div
          className="h-4 w-full"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-deep-dark), transparent)",
          }}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-8 text-center text-xs tracking-[0.2em] text-rose-gold/30"
      >
        “Tacit Love”
      </motion.p>

      {/* Wall */}
      <MessageWall />
    </main>
  );
}
