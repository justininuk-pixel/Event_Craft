"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { Contribution } from "@/lib/themes/types";

const NOTE_TINTS = [
  "#fef3c7",
  "#dbeafe",
  "#fce7f3",
  "#dcfce7",
  "#ede9fe",
  "#ffedd5",
];

function initials(name: string): string {
  const n = (name || "?").trim();
  return n ? n.charAt(0).toUpperCase() : "?";
}

interface GroupCardLayoutProps {
  contributions: Contribution[];
}

/**
 * Renders everyone's contributions as a warm wall of signed notes. Used in the
 * viewer for collaborative ("group") cards so contributions are actually shown.
 */
export function GroupCardLayout({ contributions }: GroupCardLayoutProps) {
  const visible = contributions.filter((c) => (c as { status?: string }).status !== "hidden");

  return (
    <section className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Messages from everyone
        </h3>
        <span className="text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {visible.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p className="font-semibold">No messages yet</p>
          <p className="text-xs mt-1">Be the first to sign this card 💌</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-3 [column-fill:_balance]">
          <AnimatePresence initial={false}>
            {visible.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-3 break-inside-avoid rounded-2xl p-4 shadow-sm text-zinc-800"
                style={{
                  background: (c as { color?: string }).color || NOTE_TINTS[i % NOTE_TINTS.length],
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.6}deg)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold shrink-0">
                    {initials(c.display_name)}
                  </span>
                  <span className="text-xs font-bold truncate">{c.display_name || "Someone"}</span>
                </div>

                {c.message && <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.message}</p>}

                {c.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo_url} alt={`From ${c.display_name}`} className="w-full rounded-xl mt-2 object-cover max-h-48" />
                )}

                {c.signature && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.signature} alt={`${c.display_name}'s signature`} className="h-12 mt-2 object-contain self-start" />
                )}

                {c.voice_url && (
                  <audio controls src={c.voice_url} className="w-full mt-2 h-9" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

export default GroupCardLayout;
