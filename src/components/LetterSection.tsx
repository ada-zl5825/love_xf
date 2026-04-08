"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";
import { letterContent } from "@/data/letter";

type LetterPhase = "closed" | "opening" | "reading";

const ENV_H = 180;

function FloatingHeart({
  delay,
  left,
  size,
}: {
  delay: number;
  left: string;
  size: number;
}) {
  return (
    <motion.div
      className="envelope-heart"
      style={{ position: "absolute", bottom: 0, left, width: size, height: size }}
      initial={{ opacity: 1, y: 0 }}
      animate={{
        opacity: [1, 1, 1, 0],
        y: -260,
        x: [0, 18, -12, 22, -5],
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut",
        opacity: { duration: 3, delay, times: [0, 0.3, 0.7, 1] },
        x: { duration: 3, delay, ease: "easeInOut" },
      }}
    />
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.35, delayChildren: 0.5 } },
};

const paragraphFade: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function LetterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const [phase, setPhase] = useState<LetterPhase>("closed");

  const handleOpen = useCallback(() => {
    if (phase !== "closed") return;
    setPhase("opening");
    setTimeout(() => setPhase("reading"), 2200);
  }, [phase]);

  const closingDelay = 0.5 + letterContent.paragraphs.length * 0.35 + 0.4;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-dvh snap-start items-center justify-center px-6 py-16"
    >
      <AnimatePresence mode="wait">
        {phase !== "reading" ? (
          <motion.div
            key="envelope-phase"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.9 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="envelope-box"
              onClick={handleOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpen()}
              aria-label="点击打开信封"
            >
              {/* Flap — rotateX 0 → 180 on open */}
              <motion.div
                className="envelope-flap"
                style={{ zIndex: phase === "opening" ? 1 : 5 }}
                animate={{ rotateX: phase === "opening" ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Mini letter card that slides up */}
              <motion.div
                className="envelope-letter-card"
                style={{ zIndex: phase === "opening" ? 4 : 1 }}
                animate={{ y: phase === "opening" ? -(ENV_H * 0.5) : 0 }}
                transition={{
                  duration: 0.6,
                  delay: phase === "opening" ? 0.35 : 0,
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

              {/* Pocket (front V-shape) */}
              <div className="envelope-pocket" />

              {/* Floating hearts on open */}
              {phase === "opening" && (
                <div className="envelope-hearts-wrap">
                  <FloatingHeart delay={0.5} left="18%" size={16} />
                  <FloatingHeart delay={0.7} left="52%" size={22} />
                  <FloatingHeart delay={0.6} left="72%" size={13} />
                </div>
              )}
            </div>

            {phase === "closed" && (
              <motion.p
                className="mt-6 cursor-pointer font-serif text-xs tracking-[0.25em] text-rose-gold/40"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.8 }}
                onClick={handleOpen}
              >
                点击信封
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="letter-phase"
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="letter-paper">
              <div className="letter-ruled-area">
                <motion.h3
                  className="letter-line text-center font-serif text-lg tracking-widest"
                  style={{
                    color: "#6b4050",
                    marginBottom: "var(--letter-line-h)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {letterContent.greeting}
                </motion.h3>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {letterContent.paragraphs.map((text, i) => (
                    <motion.p
                      key={i}
                      className="letter-line indent-[2em] font-serif text-sm sm:text-base"
                      style={{ color: "#3a3535" }}
                      variants={paragraphFade}
                    >
                      {text}
                    </motion.p>
                  ))}
                </motion.div>

                <motion.div
                  className="letter-line text-right"
                  style={{
                    marginTop: "var(--letter-line-h)",
                    color: "#6b4050",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: closingDelay }}
                >
                  <p className="font-serif text-sm tracking-wider sm:text-base">
                    {letterContent.closing}
                  </p>
                  {letterContent.signature && (
                    <p
                      className="font-serif text-sm sm:text-base"
                      style={{ color: "#8a5060" }}
                    >
                      {letterContent.signature}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
