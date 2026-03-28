"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/data/config";
import { storage } from "@/lib/storage";

export default function ProposalSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const router = useRouter();

  const handleAccept = async () => {
    await storage.setAcceptedAt(new Date().toISOString());
    router.push("/together");
  };

  const handleDecline = () => {
    const section = ref.current;
    if (!section) return;
    const scrollContainer = section.parentElement;
    if (scrollContainer) {
      scrollContainer.scrollBy({
        top: -scrollContainer.clientHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh snap-start items-center justify-center px-6 py-16"
    >
      <div className="flex flex-col items-center text-center">
        {/* Decorative heart ornament */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <svg
            width="28"
            height="26"
            viewBox="0 0 28 26"
            fill="none"
            className="text-rose-gold/40"
          >
            <path
              d="M14 26C13.65 26 13.318 25.871 13.065 25.639C12.124 24.776 11.218 23.964 10.42 23.247L10.414 23.242C7.394 20.522 4.796 18.181 2.968 15.871C0.924 13.283 0 10.836 0 8.154C0 5.546 0.844 3.146 2.376 1.378C3.93 -0.414 6.062 -0.5 7.84 0.5C9.194 1.264 10.34 2.478 11.186 3.95C11.58 4.637 12.44 5.5 14 5.5C15.56 5.5 16.42 4.637 16.814 3.95C17.66 2.478 18.806 1.264 20.16 0.5C21.938 -0.5 24.07 -0.414 25.624 1.378C27.156 3.146 28 5.546 28 8.154C28 10.836 27.076 13.283 25.032 15.871C23.204 18.181 20.608 20.522 17.588 23.24C16.788 23.96 15.878 24.774 14.936 25.64C14.682 25.871 14.35 26 14 26Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>

        {/* Divider lines */}
        <motion.div
          className="mb-12 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span
            className="block h-px w-10"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(183,110,121,0.3))",
            }}
          />
          <span className="block h-1 w-1 rounded-full bg-rose-gold/25" />
          <span
            className="block h-px w-10"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(183,110,121,0.3))",
            }}
          />
        </motion.div>

        {/* Proposal question */}
        <motion.p
          className="mx-auto mb-16 max-w-xs font-serif text-xl leading-relaxed tracking-wide text-warm-white sm:max-w-sm sm:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        >
          {siteConfig.proposalQuestion}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            onClick={handleAccept}
            className="group relative min-h-[44px] min-w-[160px] cursor-pointer rounded-full border border-rose-gold/40 bg-rose-gold/15 px-10 py-3.5 font-serif text-lg tracking-widest text-warm-white backdrop-blur-sm transition-colors hover:border-rose-gold/60 hover:bg-rose-gold/25"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
          >
            <span className="relative z-10">{siteConfig.acceptButton}</span>
            <span className="absolute inset-0 rounded-full bg-rose-gold/15 blur-md animate-[breath_3s_ease-in-out_infinite]" />
          </motion.button>

          <motion.button
            onClick={handleDecline}
            className="min-h-[44px] cursor-pointer px-6 py-2 font-serif text-sm tracking-wider text-rose-gold/40 transition-colors hover:text-rose-gold/60"
            whileTap={{ scale: 0.96 }}
          >
            {siteConfig.declineButton}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
