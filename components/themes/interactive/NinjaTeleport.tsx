"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// 8 preset coordinates (percentages from top/left)
const PRESETS = [
  { top: "15%", left: "15%" },
  { top: "15%", left: "75%" },
  { top: "45%", left: "15%" },
  { top: "45%", left: "80%" },
  { top: "75%", left: "15%" },
  { top: "75%", left: "75%" },
  { top: "25%", left: "45%" },
  { top: "65%", left: "45%" },
];

export function NinjaTeleport({
  yesText = "Yes",
  noText = "No",
  promptText = "Be my partner in crime? 🍕",
  onYes,
  palette,
}: InteractiveProps) {
  const [teleportCount, setTeleportCount] = useState(0);
  const [positionIndex, setPositionIndex] = useState(6); // Start at index 6 (middle-top-ish)
  const [history, setHistory] = useState<number[]>([6]);

  const handleTeleport = () => {
    const nextCount = teleportCount + 1;
    setTeleportCount(nextCount);
    triggerVibrate(50);

    // Exclude current index + last 2 indices
    const excluded = new Set([positionIndex, ...history.slice(-2)]);
    const validIndices: number[] = [];
    for (let i = 0; i < PRESETS.length; i++) {
      if (!excluded.has(i)) {
        validIndices.push(i);
      }
    }

    // Pick random index from valid options
    const nextIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    setPositionIndex(nextIndex);
    setHistory((prev) => [...prev, nextIndex]);
  };

  const hasFled = teleportCount >= 8;

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[380px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-6 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      {/* YES BUTTON (Static in center) */}
      <div className="flex-1 flex items-center justify-center z-10">
        <motion.button
          onClick={onYes}
          className="px-8 py-3 rounded-full font-bold text-white shadow-xl pointer-events-auto cursor-pointer select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "17px",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {yesText} 🎉
        </motion.button>
      </div>

      {/* NO BUTTON (Teleports around using AnimatePresence) */}
      <div className="absolute inset-0 pointer-events-none w-full h-full">
        <AnimatePresence mode="wait">
          {!hasFled ? (
            <motion.button
              key={positionIndex}
              onMouseEnter={handleTeleport}
              onClick={handleTeleport}
              className="absolute p-3 px-5 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-pointer select-none"
              style={{
                backgroundColor: palette.secondary,
                top: PRESETS[positionIndex].top,
                left: PRESETS[positionIndex].left,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.4,
                opacity: 0,
                filter: "blur(5px)",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {noText}
            </motion.button>
          ) : (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs opacity-60 pointer-events-none z-10 w-full px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              💨 The &quot;No&quot; button teleported away! Only &quot;Yes&quot; remains.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {teleportCount > 0 && !hasFled && (
        <span className="text-[10px] opacity-40 absolute bottom-4 text-center select-none font-mono">
          Ninja dodges: {teleportCount}/8 🥷
        </span>
      )}
    </div>
  );
}

export default NinjaTeleport;
