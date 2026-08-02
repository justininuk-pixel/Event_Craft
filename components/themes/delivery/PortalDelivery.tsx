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

export function PortalDelivery({
  cardId,
  onComplete,
  emoji = "🌀",
  recipient = "Dimensional Traveler",
}: DeliveryProps) {
  const [active, setActive] = useState(false);
  const [cardEmerges, setCardEmerges] = useState(false);
  const [portalClosed, setPortalClosed] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerPortal = () => {
    if (active) return;
    setActive(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // 1. Play opening sound
    audioManager.playSfx("/sfx/magic-sparkle.mp3");

    // 2. Card emerges after 700ms
    setTimeout(() => {
      setCardEmerges(true);
      audioManager.playSfx("/sfx/whoosh.mp3");
    }, 700);

    // 3. Portal closes/shrinks after 2200ms
    setTimeout(() => {
      setPortalClosed(true);
    }, 2200);

    // 4. Complete whole reveal after 3000ms
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
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none bg-[#090514]"
    >
      {/* Space stardust background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)] pointer-events-none z-10" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-950/40 backdrop-blur-md text-purple-300 hover:bg-purple-950/60 transition duration-300 text-sm font-medium tracking-wide z-50 pointer-events-auto cursor-pointer"
      >
        Skip Vortex ➔
      </button>

      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* Swirling Portal Ring */}
        <AnimatePresence>
          {active && !portalClosed && (
            <motion.div
              className="absolute w-56 h-56 rounded-full border-4 border-dashed border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.7)] bg-gradient-to-tr from-purple-900/40 via-[#ff00a0]/30 to-indigo-900/40"
              style={{ zIndex: 15 }}
              animate={{ rotate: 360, scale: [0, 1.2, 1.0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 0.6, ease: "easeOut" },
              }}
            />
          )}
        </AnimatePresence>

        {/* Emerging Dimensional Card */}
        <AnimatePresence>
          {cardEmerges && (
            <motion.div
              className="absolute w-64 h-52 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between"
              style={{
                zIndex: 30,
                color: "#1f2937",
              }}
              initial={{ scale: 0, rotate: -45, z: -200, opacity: 0 }}
              animate={{ scale: 1.05, rotate: 0, z: 50, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 85, damping: 12 }}
            >
              <div className="flex justify-between items-center text-purple-500">
                <span className="text-3xl">{emoji}</span>
                <span className="text-[8px] uppercase tracking-widest font-bold bg-purple-100 px-2 py-0.5 rounded">
                  PORTAL LINK
                </span>
              </div>
              <div className="text-center my-3">
                <span className="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1">
                  Trans-dimensional card
                </span>
                <h4 className="font-sans text-md font-bold text-zinc-700">
                  To: {recipient}
                </h4>
              </div>
              <div className="text-[7px] text-zinc-400 text-center border-t border-zinc-100 pt-1">
                Delivered across timelines by CelebrationCraft
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portal Activation Trigger */}
        {!active && (
          <motion.div
            className="flex flex-col items-center cursor-pointer pointer-events-auto z-20"
            onClick={triggerPortal}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 rounded-full border-4 border-purple-500 bg-purple-950 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] text-2xl animate-pulse">
              🌀
            </div>
            <span className="text-purple-400 text-xs font-bold uppercase tracking-wider mt-4 animate-pulse">
              Tear Open Rift
            </span>
          </motion.div>
        )}
      </div>

      {!active && (
        <p className="mt-4 text-purple-400/70 text-xs tracking-widest animate-pulse">
          TEMPORAL ANOMALY DETECTED. ACTIVATE LINK CORE.
        </p>
      )}
    </div>
  );
}

export default PortalDelivery;
