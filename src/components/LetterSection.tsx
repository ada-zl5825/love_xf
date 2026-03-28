"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { letterContent } from "@/data/letter";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.4, delayChildren: 1.2 },
  },
};

const paragraphVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function LetterSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const closingDelay =
    1.2 + letterContent.paragraphs.length * 0.4 + 0.3;

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh snap-start items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-md">
        {/* Envelope flap — 3D fold open */}
        <div
          className="relative h-12 w-full sm:h-14"
          style={{ perspective: "600px" }}
        >
          <motion.div
            className="absolute inset-x-0 bottom-0 h-full origin-bottom"
            style={{
              background:
                "linear-gradient(to top, rgba(183,110,121,0.12), rgba(183,110,121,0.03))",
              clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 180, opacity: 0 }}
            animate={isInView ? { rotateX: 0, opacity: 1 } : {}}
            transition={{
              rotateX: {
                duration: 1.4,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.3, delay: 0.2 },
            }}
          />
        </div>

        {/* Letter paper */}
        <motion.div
          className="letter-paper relative overflow-hidden rounded-b-md border border-rose-gold/10 px-8 pb-10 pt-8 sm:px-12 sm:pb-14 sm:pt-10"
          style={{ borderTopColor: "transparent" }}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Greeting */}
          <motion.h3
            className="mb-8 text-center font-serif text-xl tracking-widest text-rose-gold/75 sm:mb-10"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {letterContent.greeting}
          </motion.h3>

          {/* Decorative divider */}
          <motion.div
            className="mx-auto mb-8 h-px w-12 sm:mb-10"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(183,110,121,0.3), transparent)",
            }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.1 }}
          />

          {/* Paragraphs — staggered fade-in */}
          <motion.div
            className="space-y-5 sm:space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {letterContent.paragraphs.map((text, i) => (
              <motion.p
                key={i}
                className="indent-[2em] font-serif text-sm leading-[2.2] text-warm-white/60 sm:text-base sm:leading-[2]"
                variants={paragraphVariants}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* Closing & signature */}
          <motion.div
            className="mt-10 text-right sm:mt-12"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: closingDelay }}
          >
            <p className="font-serif text-sm tracking-wider text-warm-white/40 sm:text-base">
              {letterContent.closing}
            </p>
            {letterContent.signature && (
              <p className="mt-2 font-serif text-sm text-rose-gold/50 sm:text-base">
                {letterContent.signature}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
