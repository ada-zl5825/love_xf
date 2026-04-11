"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/storage";
import type { Message } from "@/types";

const NOTE_PALETTES = [
  { bg: "rgba(182, 114, 124, 0.12)", border: "rgba(183,110,121,0.25)" },
  { bg: "rgba(232,160,180,0.10)", border: "rgba(232,160,180,0.22)" },
  { bg: "rgba(138,80,96,0.14)", border: "rgba(138,80,96,0.25)" },
  { bg: "rgba(238, 172, 133, 0.1)", border: "rgba(237, 227, 230, 0.2)" },
  { bg: "rgba(151, 222, 244, 0.12)", border: "rgba(234, 157, 195, 0.22)" },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function NoteCard({ msg, index }: { msg: Message; index: number }) {
  const palette = NOTE_PALETTES[msg.color % NOTE_PALETTES.length];
  const rotation = (seededRandom(msg.id) - 0.5) * 4;
  const date = new Date(msg.created_at);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className="group relative break-inside-avoid"
      style={{ rotate: `${rotation}deg` }}
    >
      <div
        className="relative rounded-lg p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.02]"
        style={{
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        }}
      >
        {/* Pin dot */}
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-rose-gold/40 shadow-sm" />

        <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-warm-white/85">
          {msg.content}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wider text-rose-gold/50">
            — {msg.author}
          </span>
          <span className="text-[10px] tracking-wider text-rose-gold/25">
            {dateStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MessageWall() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchMessages = useCallback(async () => {
    const msgs = await storage.getMessages();
    setMessages(msgs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async () => {
    const trimAuthor = author.trim() || "匿名";
    const trimContent = content.trim();
    if (!trimContent) return;

    setSending(true);
    const color = Math.floor(Math.random() * NOTE_PALETTES.length);
    const msg = await storage.addMessage(trimAuthor, trimContent, color);
    if (msg) {
      setMessages((prev) => [msg, ...prev]);
    }
    setContent("");
    setSending(false);
    setShowForm(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 pb-28">
      {/* Messages masonry grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.span
            className="text-sm tracking-wider text-rose-gold/40"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ...
          </motion.span>
        </div>
      ) : messages.length === 0 ? (
        <motion.div
          className="flex flex-col items-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm tracking-wider text-rose-gold/35">
            还没有留言，来写下第一条吧
          </p>
        </motion.div>
      ) : (
        <div className="columns-2 gap-3 space-y-3">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <NoteCard key={msg.id} msg={msg} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating add button */}
      <AnimatePresence>
        {!showForm && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm(true)}
            className="fixed bottom-8 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-rose-gold/30 bg-rose-gold/15 text-rose-gold backdrop-blur-md"
            style={{ boxShadow: "0 4px 24px rgba(183,110,121,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message form overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowForm(false);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-2xl border-t border-rose-gold/15 bg-deep-dark/95 px-6 pb-8 pt-5 backdrop-blur-lg"
            >
              {/* Handle bar */}
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-rose-gold/20" />

              <h3 className="mb-4 text-center font-serif text-base tracking-wider text-warm-white/80">
                留下你的话
              </h3>

              <input
                type="text"
                placeholder="你的名字（选填）"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={20}
                className="mb-3 w-full rounded-lg border border-rose-gold/15 bg-rose-gold/5 px-4 py-2.5 text-sm text-warm-white/90 placeholder-rose-gold/30 outline-none transition-colors focus:border-rose-gold/30"
              />

              <textarea
                placeholder="写下你想说的话..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={200}
                rows={4}
                className="mb-4 w-full resize-none rounded-lg border border-rose-gold/15 bg-rose-gold/5 px-4 py-2.5 text-sm leading-relaxed text-warm-white/90 placeholder-rose-gold/30 outline-none transition-colors focus:border-rose-gold/30"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-gold/25">
                  {content.length}/200
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-full px-5 py-2 text-sm tracking-wider text-rose-gold/50 transition-colors hover:text-rose-gold/70"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || sending}
                    className="rounded-full border border-rose-gold/30 bg-rose-gold/15 px-6 py-2 text-sm tracking-wider text-rose-gold transition-all hover:bg-rose-gold/25 disabled:opacity-40"
                  >
                    {sending ? "..." : "发送"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
