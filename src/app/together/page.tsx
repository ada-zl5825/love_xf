"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/data/config";
import { storage } from "@/lib/storage";
import LoveTimer from "@/components/LoveTimer";
import { useMusic } from "@/components/MusicProvider";
import TogetherBackdrop from "@/components/TogetherBackdrop";

type Status = "loading" | "ready" | "redirect";

export default function TogetherPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isPlaying, play, toggle: togglePlay } = useMusic();

  useEffect(() => {
    storage.getAcceptedAt().then((ts) => {
      if (ts) {
        setAcceptedAt(ts);
        setStatus("ready");
      } else {
        setStatus("redirect");
        router.replace("/");
      }
    });
  }, [router]);

  // Try to autoplay once the page becomes ready. Autoplay may be blocked
  // on some browsers without prior user interaction — in that case the
  // floating player button lets the user start it manually. If the audio
  // is already playing (e.g. user navigated back from /messages) this is
  // a no-op.
  useEffect(() => {
    if (status !== "ready") return;
    void play();
  }, [status, play]);

  if (status !== "ready" || !acceptedAt) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <motion.span
          className="text-sm tracking-wider text-rose-gold/40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ...
        </motion.span>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
      <TogetherBackdrop />

      {/* Decorative heart */}
      <motion.svg
        width="24"
        height="22"
        viewBox="0 0 28 26"
        fill="none"
        className="mb-8 text-rose-gold/30"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <path
          d="M14 26C13.65 26 13.318 25.871 13.065 25.639C12.124 24.776 11.218 23.964 10.42 23.247L10.414 23.242C7.394 20.522 4.796 18.181 2.968 15.871C0.924 13.283 0 10.836 0 8.154C0 5.546 0.844 3.146 2.376 1.378C3.93 -0.414 6.062 -0.5 7.84 0.5C9.194 1.264 10.34 2.478 11.186 3.95C11.58 4.637 12.44 5.5 14 5.5C15.56 5.5 16.42 4.637 16.814 3.95C17.66 2.478 18.806 1.264 20.16 0.5C21.938 -0.5 24.07 -0.414 25.624 1.378C27.156 3.146 28 5.546 28 8.154C28 10.836 27.076 13.283 25.032 15.871C23.204 18.181 20.608 20.522 17.588 23.24C16.788 23.96 15.878 24.774 14.936 25.64C14.682 25.871 14.35 26 14 26Z"
          fill="currentColor"
        />
      </motion.svg>

      {/* Title */}
      <motion.h1
        className="mb-3 font-serif text-2xl tracking-wide text-warm-white sm:text-3xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        {siteConfig.togetherTitle}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mb-14 max-w-xs text-center text-sm leading-relaxed tracking-wider text-rose-gold/50 sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {siteConfig.togetherSubtitle}
      </motion.p>

      {/* Timer */}
      <LoveTimer since={acceptedAt} />

      {/* Divider */}
      <motion.div
        className="mt-14 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <span
          className="block h-px w-10"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(183,110,121,0.2))",
          }}
        />
        <span className="block h-1 w-1 rounded-full bg-rose-gold/20" />
        <span
          className="block h-px w-10"
          style={{
            background:
              "linear-gradient(to left, transparent, rgba(183,110,121,0.2))",
          }}
        />
      </motion.div>

      {/* Met date footnote */}
      <motion.p
        className="mt-6 text-xs tracking-wider text-rose-gold/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        since {acceptedAt.slice(0, 10)}
      </motion.p>

      {/* Message wall entry */}
      <motion.button
        onClick={() => router.push("/messages")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="mt-10 flex w-56 items-center justify-center gap-2 rounded-full border border-rose-gold/15 bg-rose-gold/5 px-5 py-2 text-xs tracking-[0.15em] text-rose-gold/45 backdrop-blur-sm transition-all hover:border-rose-gold/25 hover:bg-rose-gold/10 hover:text-rose-gold/65"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        隐秘的角落
      </motion.button>

      {/* Menu toggle button (top-left) */}
      <motion.button
        aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        onClick={() => setMenuOpen((v) => !v)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="fixed left-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-rose-gold/15 bg-rose-gold/5 text-rose-gold/60 backdrop-blur-sm transition-all hover:border-rose-gold/30 hover:bg-rose-gold/10 hover:text-rose-gold/80"
      >
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          animate={{ rotate: menuOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {menuOpen ? (
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M4 7h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M4 12h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M4 17h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          )}
        </motion.svg>
      </motion.button>

      {/* Music player toggle (below menu button) */}
      <motion.button
        aria-label={isPlaying ? "暂停音乐" : "播放音乐"}
        onClick={togglePlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.7 }}
        className="fixed left-5 top-[68px] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-rose-gold/15 bg-rose-gold/5 text-rose-gold/60 backdrop-blur-sm transition-all hover:border-rose-gold/30 hover:bg-rose-gold/10 hover:text-rose-gold/80"
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect
              x="6"
              y="5"
              width="4"
              height="14"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="14"
              y="5"
              width="4"
              height="14"
              rx="1"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 5.14v13.72a1 1 0 001.52.86l11.14-6.86a1 1 0 000-1.72L9.52 4.28A1 1 0 008 5.14z"
              fill="currentColor"
            />
          </svg>
        )}
        {isPlaying && (
          <motion.span
            className="absolute inset-0 rounded-full border border-rose-gold/30"
            animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Side drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
            />

            {/* Drawer panel */}
            <motion.aside
              key="menu-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
              className="fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col border-r border-rose-gold/10 bg-black/60 px-5 pt-20 backdrop-blur-xl sm:w-72"
            >
              <p className="mb-6 pl-1 text-[10px] uppercase tracking-[0.3em] text-rose-gold/30">
                menu
              </p>

              {/* For-you page entry */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/for-you");
                }}
                className="flex w-full items-center gap-3 rounded-full border border-amber-200/15 bg-amber-100/5 px-5 py-2.5 text-xs tracking-[0.15em] text-amber-200/55 backdrop-blur-sm transition-all hover:border-amber-200/30 hover:bg-amber-100/10 hover:text-amber-200/80"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                还有一页，只写给你
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
