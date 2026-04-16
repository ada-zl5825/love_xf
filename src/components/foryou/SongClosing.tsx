"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { foryouContent } from "@/data/foryou";

const carouselImages = [
  "/images/track-1374056689.jpg",
  "/images/track_1.jpeg",
  "/images/track_2.jpeg",
  "/images/track_3.jpeg",
  "/images/track_4.jpeg",
  "/images/track_5.jpeg",
  "/images/track_6.jpeg",
  "/images/track_7.jpeg",
  "/images/track_8.jpeg",
  "/images/track_9.png",
];

export default function SongClosing() {
  const { songTitle, songArtist, albumCover, lyrics, closing } =
    foryouContent.screen3;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="flex min-h-dvh snap-start flex-col items-center justify-center px-6 py-16"
    >
      {/* Rotating album cover with photo carousel */}
      <motion.div
        className="relative mb-8 h-40 w-40 overflow-hidden rounded-full shadow-lg"
        initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
        animate={
          inView
            ? { opacity: 1, scale: 1, rotate: 360 }
            : { opacity: 0, scale: 0.8 }
        }
        transition={
          inView
            ? {
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                rotate: { duration: 20, ease: "linear", repeat: Infinity },
              }
            : { duration: 0.8 }
        }
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={carouselImages[imgIdx]}
            alt={songTitle}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        </AnimatePresence>
      </motion.div>

      <motion.h2
        className="mb-2 font-serif text-base tracking-wider text-warm-white/60"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {songTitle}
      </motion.h2>

      {songArtist && (
        <motion.p
          className="mb-6 text-xs tracking-wider text-warm-white/30"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {songArtist}
        </motion.p>
      )}

      <motion.div
        className="mb-12 max-w-xs text-center text-sm leading-loose tracking-wider text-warm-white/35"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {lyrics.split("\n").map((line, i) => (
          <p key={i} className={line === "" ? "h-4" : ""}>
            {line}
          </p>
        ))}
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        {closing.map((text, i) => (
          <motion.p
            key={i}
            className="text-xs tracking-wider"
            style={{ color: "rgba(201,178,122,0.45)" }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 + i * 0.4 }}
          >
            {text}
          </motion.p>
        ))}
      </div>

      <motion.p
        className="mt-20 text-[10px] tracking-[0.2em] text-warm-white/15"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 2 }}
      >
        lzf❤️xf
      </motion.p>
    </section>
  );
}
