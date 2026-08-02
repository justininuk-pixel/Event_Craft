"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { X } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { Contribution } from "@/lib/themes/types";

const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";
const glass = "color-mix(in srgb, var(--exp-text) 5%, transparent)";

function rand(n: number): number {
  const x = Math.sin(n * 73.7) * 10000;
  return x - Math.floor(x);
}

const TOKENS = ["📜", "⭐", "💌", "✨", "🌟"];

export function WishJar({ theme, config, mode, palette, contributions = [] }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const wishes = contributions.filter((c) => (c as { status?: string }).status !== "hidden");
  const [open, setOpen] = useState<Contribution | null>(null);

  const count = compact ? 6 : wishes.length;

  return (
    <div className={clsx("w-full h-full flex flex-col items-center", compact ? "p-3" : "p-5")}>
      <header className="text-center shrink-0">
        <h1
          className={clsx("font-bold", compact ? "text-sm" : "text-xl sm:text-2xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {config.title || theme.content.title}
        </h1>
        {!compact && (
          <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>
            {wishes.length > 0 ? `${wishes.length} ${wishes.length === 1 ? "wish" : "wishes"} — tap one to read` : config.subtitle || "Drop a wish in the jar"}
          </p>
        )}
      </header>

      {/* Jar */}
      <div className={clsx("relative flex-1 min-h-0 w-full flex items-end justify-center", compact ? "mt-2" : "mt-3")}>
        <div
          className={clsx("relative rounded-b-[2.2rem] rounded-t-2xl overflow-hidden", compact ? "w-28 h-28" : "w-48 h-56")}
          style={{
            background: glass,
            border: `2px solid ${hairline}`,
            boxShadow: "inset 0 8px 24px rgba(255,255,255,0.15)",
          }}
        >
          {/* jar lid line */}
          <div className="absolute top-3 left-0 right-0 h-px" style={{ background: hairline }} />

          {/* tokens */}
          {(compact ? TOKENS.slice(0, count) : wishes).map((w, i) => {
            const token = compact ? (w as string) : TOKENS[i % TOKENS.length];
            const c = compact ? null : (w as Contribution);
            return (
              <motion.button
                key={c ? c.id : i}
                type="button"
                onClick={() => c && setOpen(c)}
                disabled={compact}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.06, 0.6), type: "spring", stiffness: 200, damping: 16 }}
                className={clsx("absolute", compact ? "text-base" : "text-2xl", !compact && "cursor-pointer hover:scale-110 transition-transform")}
                style={{
                  left: `${12 + rand(i + 1) * 64}%`,
                  bottom: `${6 + rand(i + 7) * (compact ? 50 : 60)}%`,
                  transform: `rotate(${(rand(i + 3) - 0.5) * 40}deg)`,
                }}
                aria-label="A wish"
              >
                {token}
              </motion.button>
            );
          })}

          {!compact && wishes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-3">
              <p className="text-xs" style={{ color: "var(--exp-text-secondary)" }}>
                The jar is empty —<br />add the first wish ✨
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Opened wish */}
      <AnimatePresence>
        {open && !compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xs w-full rounded-2xl p-5 shadow-2xl text-zinc-800"
              style={{ background: "#fffdf5", border: "1px solid rgba(0,0,0,0.1)" }}
            >
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-2xl text-center">💫</p>
              <p className="text-sm leading-relaxed text-center mt-2 whitespace-pre-wrap">{open.message}</p>
              <p className="text-xs font-bold text-center mt-3" style={{ color: palette.primary }}>
                — {open.display_name || "Someone"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WishJar;
