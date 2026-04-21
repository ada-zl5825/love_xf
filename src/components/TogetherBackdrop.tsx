"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const IMAGES = [
  "/images/315.jpg",
  "/images/306.PNG",
  "/images/312.JPG",
  "/images/403.jpeg",
  "/images/406.jpeg",
  "/images/408.jpeg",
  "/images/410_1.jpeg",
  "/images/410.jpeg",
];

// How long each slide stays fully visible before cross-fading to the next.
const SLIDE_INTERVAL_MS = 6500;
// Cross-fade duration between slides.
const FADE_DURATION_S = 1.8;

export default function TogetherBackdrop() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      {/* Slideshow */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: FADE_DURATION_S, ease: "easeInOut" },
            scale: { duration: SLIDE_INTERVAL_MS / 1000 + 1, ease: "linear" },
          }}
        >
          <Image
            src={IMAGES[index]}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Uniform dark wash so lighter photos don't overpower text */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Radial vignette: slightly lighter in the middle where the photo sits,
          darker at the edges to anchor the chrome (menu button, buttons). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(10,10,15,0.55) 55%, rgba(10,10,15,0.85) 100%)",
        }}
      />

      {/* Subtle warm tint to match the rose-gold palette */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(183,110,121,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Reuse existing grain for cohesion with the rest of the site */}
      <div className="noise-texture absolute inset-0 opacity-40" />
    </div>
  );
}
