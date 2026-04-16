"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { foryouContent } from "@/data/foryou";

const ENV_H = 180;

interface Props {
  onNext: () => void;
}

export default function EnvelopeEntry({ onNext }: Props) {
  const { title, lines, button } = foryouContent.screen1;
  const [opening, setOpening] = useState(false);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(onNext, 2200);
  }, [opening, onNext]);

  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="mb-4 font-serif text-xl tracking-wider text-amber-200/70"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {title}
      </motion.h1>

      <div className="mb-10 flex flex-col items-center gap-1">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-sm leading-loose tracking-wider text-warm-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.4 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {/* Envelope */}
      <motion.div
        className="relative cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        style={{ animation: opening ? "none" : "breath 3s ease-in-out infinite" }}
      >
        <div
          className="envelope-box"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleOpen()}
          aria-label={button}
          style={{
            backgroundColor: "#4a3530",
            boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}
        >
          <motion.div
            className="envelope-flap"
            style={{
              zIndex: opening ? 1 : 5,
              borderTopColor: "#3d2a26",
            }}
            animate={{ rotateX: opening ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />

          <motion.div
            className="envelope-letter-card"
            style={{ zIndex: opening ? 4 : 1 }}
            animate={{ y: opening ? -(ENV_H * 0.5) : 0 }}
            transition={{
              duration: 0.6,
              delay: opening ? 0.35 : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <div className="envelope-fake-lines">
              {[30, 80, 70, 55].map((w, i) => (
                <div key={i} style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="envelope-letter-fade" />
          </motion.div>

          <div
            className="envelope-pocket"
            style={{
              borderLeftColor: "#7a6055",
              borderRightColor: "#6a5045",
              borderBottomColor: "#5a4035",
            }}
          />
        </div>

        {!opening && (
          <motion.p
            className="mt-6 text-center font-serif text-xs tracking-[0.25em] text-amber-200/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            {button}
          </motion.p>
        )}
      </motion.div>

    </motion.div>
  );
}
