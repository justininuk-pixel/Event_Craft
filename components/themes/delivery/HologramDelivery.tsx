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

export function HologramDelivery({
  cardId,
  onComplete,
  emoji = "🛸",
  recipient = "OPERATOR-01",
}: DeliveryProps) {
  const [active, setActive] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerHologram = () => {
    if (active) return;
    setActive(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    audioManager.playSfx("/sfx/magic-sparkle.mp3");

    // Hologram projection completes after 2500ms
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  const handleSkip = () => {
    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none bg-zinc-950"
    >
      {/* Sci-fi background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-950/40 backdrop-blur-md text-cyan-400 hover:bg-cyan-950/60 transition duration-300 text-sm font-medium tracking-wide z-50 pointer-events-auto cursor-pointer"
      >
        Skip Transmission ➔
      </button>

      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* Swirling hologram emitter base */}
        <div className="absolute bottom-12 w-48 h-4 bg-cyan-500/20 rounded-full border border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
          <div className="w-16 h-1 bg-cyan-400 rounded-full animate-ping" />
        </div>

        {/* Projected Hologram Card */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute w-64 h-52 bg-cyan-950/40 border-2 border-cyan-400/40 rounded-xl p-6 flex flex-col justify-between backdrop-blur-sm"
              style={{
                zIndex: 30,
                bottom: "96px",
                color: "#22d3ee",
                boxShadow: "0 0 40px rgba(6, 182, 212, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.2)",
              }}
              initial={{ y: 50, scaleY: 0, opacity: 0, filter: "blur(10px)" }}
              animate={{
                y: 0,
                scaleY: 1,
                opacity: [0, 0.8, 0.5, 0.9, 0.7, 1], // flickering projection effect
                filter: "blur(0px)",
              }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Scanline Sweep overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.15)_2px,transparent_2px)] bg-[size:100%_16px] pointer-events-none animate-pulse rounded-xl" />

              <div className="flex justify-between items-start">
                <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  {emoji}
                </span>
                <span className="text-[8px] uppercase tracking-widest font-mono border border-cyan-400/60 px-2 py-0.5 rounded">
                  SYS.INIT
                </span>
              </div>
              <div className="text-center font-mono my-3">
                <span className="text-[7px] uppercase tracking-widest opacity-60 block mb-1">
                  -- DECRYPTING SECURE CARD --
                </span>
                <h4 className="font-bold text-sm tracking-wide uppercase truncate">
                  REC: {recipient}
                </h4>
              </div>
              <div className="text-[7px] font-mono opacity-50 text-center border-t border-cyan-400/20 pt-2">
                HOLOGRAPHIC DATA INBOUND
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emitter trigger */}
        {!active && (
          <motion.div
            className="flex flex-col items-center cursor-pointer pointer-events-auto z-20"
            onClick={triggerHologram}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/40 bg-cyan-950 hover:bg-cyan-900 active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] text-2xl font-mono text-cyan-400">
              ⚡
            </div>
            <span className="text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mt-4 animate-pulse">
              Initiate Projection
            </span>
          </motion.div>
        )}
      </div>

      {!active && (
        <p className="mt-4 text-cyan-400/70 font-mono text-xs tracking-widest animate-pulse">
          PROJECTOR STANDBY. DEPRESS CORE SWITCH.
        </p>
      )}
    </div>
  );
}

export default HologramDelivery;
