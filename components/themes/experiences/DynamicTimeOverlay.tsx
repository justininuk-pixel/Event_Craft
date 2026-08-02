"use client";

import React, { useState } from "react";

type Slot = "morning" | "day" | "evening" | "night";

function slotFor(hour: number): Slot {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Subtle, semi-transparent tints layered over the card background so the same
// card feels different depending on the recipient's local time of day.
const TINTS: Record<Slot, { gradient: string; greeting: string }> = {
  morning: {
    gradient: "linear-gradient(180deg, rgba(255,214,165,0.28), rgba(255,170,120,0.10) 45%, transparent)",
    greeting: "Good morning",
  },
  day: {
    gradient: "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(160,210,255,0.10) 50%, transparent)",
    greeting: "Good afternoon",
  },
  evening: {
    gradient: "linear-gradient(180deg, rgba(255,150,90,0.26), rgba(180,80,140,0.14) 55%, transparent)",
    greeting: "Good evening",
  },
  night: {
    gradient: "linear-gradient(180deg, rgba(20,20,60,0.42), rgba(40,30,90,0.22) 55%, transparent)",
    greeting: "Good evening",
  },
};

/**
 * Renders a time-of-day tint over the experience. Reads the recipient's local
 * time once at mount (lazy initializer keeps it off the render path).
 */
export function DynamicTimeOverlay({ recipient }: { recipient?: string }) {
  const [slot] = useState<Slot>(() => slotFor(new Date().getHours()));
  const tint = TINTS[slot];

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: tint.gradient, mixBlendMode: "soft-light" }}
      />
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-[2] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide pointer-events-none"
        style={{
          background: "color-mix(in srgb, var(--exp-text) 12%, transparent)",
          color: "var(--exp-text)",
        }}
      >
        {tint.greeting}
        {recipient ? `, ${recipient}` : ""}
      </div>
    </>
  );
}

export default DynamicTimeOverlay;
