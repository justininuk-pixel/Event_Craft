"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audioManager } from "../../../lib/audio/manager";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface DeliveryProps {
  cardId?: string;
  onComplete: () => void;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string | string[];
    text: string;
    textSecondary: string;
  };
  emoji?: string;
  recipient?: string;
}

export function ScrollDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "📜",
  recipient = "Valued Guest",
}: DeliveryProps) {
  const [unfurled, setUnfurled] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerScroll = () => {
    if (unfurled) return;
    setUnfurled(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    audioManager.playSfx("/sfx/paper-unfold.mp3");

    // Hold scroll open for 3000ms, then complete
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleSkip = () => {
    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none"
      style={{
        background: Array.isArray(palette.background)
          ? `linear-gradient(135deg, ${palette.background.join(", ")})`
          : palette.background || "#0f0f15",
      }}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition duration-300 text-sm font-medium tracking-wide z-50 pointer-events-auto cursor-pointer"
      >
        Skip Intro ➔
      </button>

      {/* Interactive Unfurling Scroll */}
      <div className="relative w-80 h-96 md:w-96 md:h-[480px] flex items-center justify-center">
        {/* Parchment Body */}
        <motion.div
          className="absolute w-72 md:w-84 bg-[#f2e6d0] border-x-8 border-amber-900 shadow-2xl overflow-hidden rounded-sm"
          style={{
            backgroundImage: "radial-gradient(#f4ebd0 30%, #e2d2b5 100%)",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.15), 0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
          initial={{ height: 40 }}
          animate={unfurled ? { height: "90%" } : { height: 40 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* Parchment Content (Reveals as height expands) */}
          <div className="p-8 h-full flex flex-col justify-between items-center text-[#4a3319] text-center font-serif">
            <div className="text-4xl mt-2">{emoji}</div>
            <div className="flex-1 flex flex-col justify-center items-center my-6">
              <span className="text-xs uppercase tracking-widest text-amber-800/60 font-semibold mb-2">
                Hear Ye, Hear Ye!
              </span>
              <h2 className="text-xl md:text-2xl font-bold italic border-b-2 border-amber-800/20 pb-4 px-4 leading-normal">
                A Royal Scroll for
                <br />
                <span className="text-[#854d0e] not-italic font-black mt-2 block">
                  {recipient}
                </span>
              </h2>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-amber-800/40">
              CelebrationCraft Scroll Service
            </div>
          </div>
        </motion.div>

        {/* Top Roller Cylinders */}
        <motion.div
          className="absolute w-80 md:w-92 h-8 bg-amber-950 rounded-full shadow-lg border-y border-amber-900 flex items-center justify-between px-2 cursor-pointer z-30 pointer-events-auto"
          initial={{ y: 0 }}
          animate={unfurled ? { y: -180 } : { y: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onClick={triggerScroll}
        >
          <div className="w-3 h-6 bg-yellow-600 rounded-l-md" />
          {!unfurled && (
            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider animate-pulse">
              Tap to Unroll Scroll
            </span>
          )}
          <div className="w-3 h-6 bg-yellow-600 rounded-r-md" />
        </motion.div>

        {/* Bottom Roller Cylinders */}
        <motion.div
          className="absolute w-80 md:w-92 h-8 bg-amber-950 rounded-full shadow-lg border-y border-amber-900 flex items-center justify-between px-2 cursor-pointer z-30 pointer-events-auto"
          initial={{ y: 0 }}
          animate={unfurled ? { y: 180 } : { y: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onClick={triggerScroll}
        >
          <div className="w-3 h-6 bg-yellow-600 rounded-l-md" />
          <div className="w-3 h-6 bg-yellow-600 rounded-r-md" />
        </motion.div>
      </div>

      {!unfurled && (
        <p className="mt-8 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the scroll handle to unfurl
        </p>
      )}
    </div>
  );
}

export default ScrollDelivery;
