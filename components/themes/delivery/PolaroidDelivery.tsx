"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function PolaroidDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "📸",
  recipient = "Subject",
}: DeliveryProps) {
  const [active, setActive] = useState(false);
  const [shotTaken, setShotTaken] = useState(false);
  const [photoDeveloping, setPhotoDeveloping] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerCamera = () => {
    if (active) return;
    setActive(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // 1. Flash & Shutter SFX
    audioManager.playSfx("/sfx/camera-shutter.mp3");
    setShotTaken(true);

    // 2. Start chemical image development fade after 500ms
    setTimeout(() => {
      setPhotoDeveloping(true);
    }, 500);

    // 3. Complete reveal after 3000ms
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
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none bg-zinc-900"
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

      {/* Screen flash layer */}
      {shotTaken && !photoDeveloping && (
        <motion.div
          className="absolute inset-0 bg-white z-40 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* The Polaroid Photo Film Frame */}
        <AnimatePresence>
          {shotTaken && (
            <motion.div
              className="absolute w-64 h-80 bg-zinc-50 border border-zinc-200 shadow-2xl p-4 pb-12 flex flex-col rounded-sm origin-top"
              style={{ zIndex: 35, color: "#1f2937" }}
              initial={{ y: -400, rotate: -10 }}
              animate={{ y: 0, rotate: 0 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{ type: "spring", stiffness: 85, damping: 14 }}
            >
              {/* Photo Area */}
              <div className="relative w-full h-56 bg-zinc-800 rounded-sm overflow-hidden flex items-center justify-center">
                {/* Developing Image Content */}
                <motion.div
                  className="w-full h-full flex flex-col justify-center items-center bg-gradient-to-br from-amber-100 to-amber-200/50"
                  style={{
                    color: palette.primary,
                  }}
                  animate={photoDeveloping ? { filter: "brightness(1) contrast(1)" } : { filter: "brightness(4) contrast(0.1)" }}
                  transition={{ duration: 2.2, ease: "easeIn" }}
                >
                  <span className="text-5xl mb-2 filter drop-shadow">{emoji}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                    Captured Moment
                  </span>
                </motion.div>

                {/* Overlaid White chemical cover fading away */}
                {!photoDeveloping && (
                  <div className="absolute inset-0 bg-white" />
                )}
              </div>

              {/* White Card Title space (Handwritten caption) */}
              <div className="flex-1 flex flex-col justify-center items-center font-serif mt-2 border-t border-zinc-200/40">
                <span className="text-xs italic text-zinc-500">For {recipient}</span>
                <span className="text-[7px] text-zinc-400 font-mono tracking-widest mt-1">
                  DEV: {photoDeveloping ? "RESOLVED" : "DEVELOPING"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vintage Camera Lens button */}
        {!shotTaken && (
          <motion.div
            className="flex flex-col items-center cursor-pointer pointer-events-auto z-20"
            onClick={triggerCamera}
            whileHover={{ scale: 1.05 }}
          >
            {/* Camera body and glass lens */}
            <div className="relative w-20 h-16 bg-zinc-800 rounded-lg shadow-2xl flex items-center justify-center border-t-4 border-amber-500">
              <div className="w-10 h-10 rounded-full border-4 border-zinc-700 bg-zinc-950 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-cyan-400/40" />
              </div>
              {/* Red flash bulb */}
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-wider mt-4 animate-pulse">
              Press Shutter to Snap Photo
            </span>
          </motion.div>
        )}
      </div>

      {!shotTaken && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the camera lens to develop your card
        </p>
      )}
    </div>
  );
}

export default PolaroidDelivery;
