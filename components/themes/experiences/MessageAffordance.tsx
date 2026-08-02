"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X } from "lucide-react";
import { CardConfig, ThemePalette, Theme } from "@/lib/themes/types";
import { getRevealStyle } from "@/lib/themes/revealStyle";

/**
 * Many of the "mini-app" experiences (games, generative/AI pieces, data-viz) are fully
 * self-contained and never render the creator's personalised message. That means a card you
 * carefully wrote a note for would show the recipient none of it. This affordance is layered on
 * top of those experiences by ExperienceHost: a small, non-intrusive envelope button that opens
 * the sender's actual message. It only appears when there's a real message to show.
 */
export function MessageAffordance({
  theme,
  config,
  palette,
}: {
  theme: Theme;
  config: CardConfig;
  palette: ThemePalette;
}) {
  const [open, setOpen] = useState(false);

  const title = (config.title || theme.content.title || "").trim();
  const body = (config.body || theme.content.body || "").trim();
  const recipient = (config.recipient || "").trim();
  const sender = (config.sender || "").trim();

  // Nothing worth showing → render nothing (keeps pure novelty experiences clean).
  if (!title && !body) return null;

  const primary = (palette.primary as string) || "#7c3aed";
  const text = (palette.text as string) || "#f8fafc";
  const rev = getRevealStyle(config);

  return (
    <div className="absolute inset-0 z-[60] pointer-events-none">
      {/* Trigger, bottom-right, out of the way of most game controls */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Read the message"
        className="pointer-events-auto absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        style={{ background: `${primary}e6`, color: "#fff" }}
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Message</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-auto absolute inset-0 flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm max-h-[80%] overflow-y-auto rounded-2xl p-6 shadow-2xl"
              style={{ background: rev.bg || (palette.background as string) || "#111827", color: text, textAlign: rev.align }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close message"
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: `${primary}22`, color: text }}
              >
                <X className="w-4 h-4" />
              </button>

              {recipient && (
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: primary }}>
                  For {recipient}
                </p>
              )}
              {title && (
                <h2
                  className="font-heading font-bold mb-3 leading-tight"
                  style={{ fontFamily: "var(--exp-font-heading)", fontSize: `${rev.scale * 1.5}rem`, color: rev.titleColor }}
                >
                  {title}
                </h2>
              )}
              {body && (
                <p
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "var(--exp-font-body)", fontSize: `${rev.scale * 0.9}rem`, color: rev.bodyColor || (palette.textSecondary as string) || text }}
                >
                  {body}
                </p>
              )}
              {sender && (
                <p className="text-sm font-semibold mt-4" style={{ color: primary }}>
                 , {sender}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MessageAffordance;
