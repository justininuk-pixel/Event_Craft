"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { ThemePalette } from "@/lib/themes/types";

function bg(p: ThemePalette): string {
  const b = p.background;
  if (Array.isArray(b)) return b.length === 1 ? b[0] : `linear-gradient(160deg, ${b.join(", ")})`;
  return b;
}

interface SurpriseGateProps {
  sender?: string;
  palette: ThemePalette;
  onOpen: () => void;
}

/** A "tap to open" suspense gate shown before the delivery animation. */
export function SurpriseGate({ sender, palette, onOpen }: SurpriseGateProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-6 transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden select-none"
      style={{ background: bg(palette), color: palette.text }}
      aria-label="Open your surprise"
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-1/2 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: palette.primary }}
      />

      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${palette.primary} 28%, transparent)`,
          border: `2px solid ${palette.accent}`,
        }}
      >
        <Gift className="w-12 h-12" style={{ color: palette.accent }} />
      </motion.div>

      <h2 className="relative mt-6 text-2xl font-extrabold leading-tight" style={{ color: palette.text }}>
        You have a surprise{sender ? <> from {sender}</> : ""}!
      </h2>
      <p className="relative mt-2 text-sm opacity-80" style={{ color: palette.textSecondary }}>
        Something special is waiting just for you.
      </p>

      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-lg"
        style={{ background: palette.primary, color: "#ffffff" }}
      >
        Tap to open ✨
      </motion.span>
    </button>
  );
}

export default SurpriseGate;
