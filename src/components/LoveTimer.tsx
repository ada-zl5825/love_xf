"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { timeSince } from "@/lib/date";

interface LoveTimerProps {
  since: string;
}

const UNITS: { key: keyof ReturnType<typeof timeSince>; label: string }[] = [
  { key: "days", label: "天" },
  { key: "hours", label: "时" },
  { key: "minutes", label: "分" },
  { key: "seconds", label: "秒" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function LoveTimer({ since }: LoveTimerProps) {
  const [elapsed, setElapsed] = useState(() => timeSince(since));

  useEffect(() => {
    setElapsed(timeSince(since));
    const id = setInterval(() => setElapsed(timeSince(since)), 1000);
    return () => clearInterval(id);
  }, [since]);

  return (
    <div className="flex items-baseline justify-center gap-2 sm:gap-4">
      {UNITS.map(({ key, label }, i) => {
        const value = elapsed[key];
        const display = key === "days" ? String(value) : pad(value);

        return (
          <motion.div
            key={key}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.6 }}
          >
            <span
              className="tabular-nums font-serif tracking-wide text-warm-white"
              style={{ fontSize: "clamp(2rem, 8vw, 4.5rem)" }}
            >
              {display}
            </span>
            <span className="mt-1 text-xs tracking-[0.2em] text-rose-gold/50 sm:text-sm">
              {label}
            </span>

          </motion.div>
        );
      })}
    </div>
  );
}
