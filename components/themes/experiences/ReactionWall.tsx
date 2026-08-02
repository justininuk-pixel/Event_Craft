"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { Contribution } from "@/lib/themes/types";

const NOTE_TINTS = ["#fde68a", "#bfdbfe", "#fbcfe8", "#bbf7d0", "#ddd6fe", "#fed7aa"];
const FALLBACK = ["🎉", "❤️", "⭐", "🙌", "🥳", "🔥"];

function firstEmoji(s?: string): string | null {
  if (!s) return null;
  const m = s.match(/\p{Extended_Pictographic}/u);
  return m ? m[0] : null;
}

const DEMO = [
  { id: "d1", display_name: "Mia", message: "You're the best! 🎉" },
  { id: "d2", display_name: "Leo", message: "Congrats!! ⭐" },
  { id: "d3", display_name: "Ava", message: "So happy for you ❤️" },
  { id: "d4", display_name: "Sam", message: "Let's celebrate 🥳" },
];

export function ReactionWall({ theme, config, mode, contributions = [] }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const real = contributions.filter((c) => (c as { status?: string }).status !== "hidden");
  const items = (compact ? (DEMO as unknown as Contribution[]) : real);

  return (
    <div className={clsx("w-full h-full flex flex-col", compact ? "p-3" : "p-5")}>
      <header className="text-center shrink-0">
        <h1
          className={clsx("font-bold", compact ? "text-sm" : "text-xl sm:text-2xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {config.title || theme.content.title}
        </h1>
        {!compact && (
          <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>
            {real.length > 0 ? `${real.length} on the wall` : config.subtitle || "Everyone leaves their mark"}
          </p>
        )}
      </header>

      <div className={clsx("flex-1 min-h-0 overflow-y-auto", compact ? "mt-2" : "mt-3")}>
        {!compact && real.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <span className="text-3xl">🧱</span>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--exp-text)" }}>The wall is empty</p>
            <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>Be the first to leave a note ✨</p>
          </div>
        ) : (
          <div className={clsx("columns-2", compact ? "gap-1.5" : "sm:columns-3 gap-2")}>
            <AnimatePresence initial={false}>
              {items.map((c, i) => {
                const stamp = firstEmoji(c.message) || FALLBACK[i % FALLBACK.length];
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={clsx("mb-2 break-inside-avoid rounded-xl shadow-sm text-zinc-800", compact ? "p-2" : "p-3")}
                    style={{
                      background: NOTE_TINTS[i % NOTE_TINTS.length],
                      transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.2}deg)`,
                    }}
                  >
                    <div className={clsx("text-center", compact ? "text-lg" : "text-2xl")}>{stamp}</div>
                    {c.message && (
                      <p className={clsx("leading-snug text-center", compact ? "text-[8px] mt-0.5" : "text-xs mt-1")}>
                        {c.message}
                      </p>
                    )}
                    <p className={clsx("font-bold text-center opacity-70", compact ? "text-[7px] mt-0.5" : "text-[10px] mt-1.5")}>
                     , {c.display_name || "Someone"}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReactionWall;
