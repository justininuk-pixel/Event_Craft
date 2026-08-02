"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { audioManager } from "../../../lib/audio/manager";
import { triggerVibrate } from "../../../lib/utils/device";

interface InteractiveProps {
  yesText?: string;
  noText?: string;
  promptText?: string;
  onYes: () => void;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string | string[];
    text: string;
    textSecondary: string;
  };
}

// 9 puzzle piece offset coordinates for shattering
const SHATTER_DIRECTIONS = [
  { x: -80, y: -80, rotate: -45 },
  { x: 0, y: -100, rotate: 15 },
  { x: 80, y: -80, rotate: 60 },
  { x: -100, y: 0, rotate: -90 },
  { x: 0, y: 0, rotate: 180 }, // Center
  { x: 100, y: 0, rotate: 45 },
  { x: -80, y: 80, rotate: -30 },
  { x: 0, y: 100, rotate: 120 },
  { x: 80, y: 80, rotate: -75 },
];

export function PuzzlePieces({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you be my partner? 💖",
  onYes,
  palette,
}: InteractiveProps) {
  const [shattered, setShattered] = useState(false);
  const [reassembling, setReassembling] = useState(false);
  const [completed, setCompleted] = useState(false);

  const triggerShatter = () => {
    if (shattered) return;
    setShattered(true);
    triggerVibrate(100);
    audioManager.playSfx("/sfx/confetti-pop.mp3");

    // 1. Reassemble after 1000ms
    setTimeout(() => {
      setReassembling(true);
    }, 1000);

    // 2. Complete reassembly after 2200ms
    setTimeout(() => {
      setCompleted(true);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 },
      });
    }, 2200);
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[350px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-10 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      <div className="flex flex-row items-center justify-center gap-12 w-full relative min-h-[140px]">
        {/* YES BUTTON (Default or final completed state) */}
        <motion.button
          onClick={onYes}
          className="px-8 py-3 rounded-full font-bold text-white shadow-xl z-20 pointer-events-auto cursor-pointer select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "17px",
          }}
          animate={completed ? { scale: 1.25 } : { scale: 1.0 }}
          whileHover={{ scale: completed ? 1.3 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {completed ? "Yes! Absolutely! 🎉" : yesText}
        </motion.button>

        {/* INTERACTIVE NO BUTTON / SHATTERED PUZZLE PIECES */}
        <AnimatePresence>
          {!completed && (
            <div className="relative w-28 h-12 flex items-center justify-center">
              {!shattered ? (
                // Original NO Button
                <motion.button
                  onClick={triggerShatter}
                  className="absolute px-6 py-3 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-pointer select-none"
                  style={{
                    backgroundColor: palette.secondary,
                    fontSize: "16px",
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {noText}
                </motion.button>
              ) : (
                // Shattering / Reassembling Pieces
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  {SHATTER_DIRECTIONS.map((dir, idx) => {
                    // Reassemble moves them back to center, morphed as "Y-E-S" segments
                    const targetX = reassembling ? -70 : dir.x; // pull left towards YES button
                    const targetY = reassembling ? 0 : dir.y;
                    const targetScale = reassembling ? 0.0 : 1.0;
                    const targetRotate = reassembling ? 0 : dir.rotate;

                    return (
                      <motion.div
                        key={idx}
                        className="absolute w-4 h-4 rounded-sm shadow-md"
                        style={{
                          backgroundColor: palette.accent,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                        initial={{ x: 0, y: 0, rotate: 0 }}
                        animate={{
                          x: targetX,
                          y: targetY,
                          rotate: targetRotate,
                          scale: targetScale,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: reassembling ? 90 : 250,
                          damping: reassembling ? 12 : 10,
                        }}
                      />
                    );
                  })}

                  {reassembling && (
                    <motion.span
                      className="absolute text-[10px] text-zinc-400 font-mono animate-pulse"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Reassembling...
                    </motion.span>
                  )}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <span className="text-[9px] opacity-40 select-none z-10 mt-6 font-mono">
        {completed ? "Logic override complete! 💥" : "Caution: High kinetic energy!"}
      </span>
    </div>
  );
}

export default PuzzlePieces;
