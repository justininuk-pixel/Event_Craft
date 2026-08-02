"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerVibrate } from "../../../lib/utils/device";
import { audioManager } from "../../../lib/audio/manager";

interface InteractiveProps {
  yesText?: string;
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

const SEGMENTS = [
  "YES! 🎉",
  "OF COURSE! 💖",
  "ABSOLUTELY! 💍",
  "DEFINITELY! 🌟",
  "SURE! 🍕",
  "YUP! 👍",
  "INDEED! 👑",
  "I DO! 💐",
];

export function SpinTheWheel({
  yesText = "Continue ➔",
  onYes,
  palette,
}: InteractiveProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSegment, setWinningSegment] = useState("");

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinningSegment("");
    triggerVibrate([50, 30, 50]);
    audioManager.playSfx("/sfx/slot-machine-spin.mp3");

    // Deceleration calculation
    const spins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + extraDegrees;

    setRotation(totalRotation);

    // Dynamic ticking sound mimicking deceleration
    const spinDuration = 3500;
    let ticks = 0;
    const maxTicks = 20;

    const scheduleTick = (delay: number) => {
      if (ticks >= maxTicks) return;
      setTimeout(() => {
        audioManager.playSfx("/sfx/typewriter-key.mp3");
        triggerVibrate(20);
        ticks++;
        // Quadratic slowdown
        const nextDelay = delay * 1.25;
        scheduleTick(nextDelay);
      }, delay);
    };

    scheduleTick(60); // Start fast ticking

    setTimeout(() => {
      // Calculate resulting winning index
      // Normalise final rotation to a 0-360 value
      const finalDegrees = totalRotation % 360;
      // Invert angle because wheel spins counter-clockwise past the top pointer
      const pointerAngle = (360 - finalDegrees + 22.5) % 360; // Offset by half a slice (45/2 = 22.5)
      const segmentIndex = Math.floor(pointerAngle / 45) % 8;

      setWinningSegment(SEGMENTS[segmentIndex]);
      setSpinning(false);
      triggerVibrate(150);
      audioManager.playSfx("/sfx/confetti-pop.mp3");
    }, spinDuration);
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[400px]"
    >
      <h3
        className="text-lg font-black text-center mb-6 select-none z-10"
        style={{ color: palette.text }}
      >
        Spin the wheel of fortune! 🎡
      </h3>

      {/* The Spinning Wheel */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        {/* Top Pointer Pin */}
        <div className="absolute top-[-10px] w-6 h-8 bg-red-500 rounded-b-md z-30 shadow-md border-x border-b border-red-600 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>

        {/* Wheel Body */}
        <motion.div
          onClick={startSpin}
          className="w-56 h-56 rounded-full border-4 border-white shadow-2xl relative overflow-hidden cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: "easeOut" }}
        >
          {SEGMENTS.map((text, idx) => {
            const angle = idx * 45;
            // Palette segments colors
            const colors = [
              palette.primary,
              `${palette.primary}ee`,
              palette.secondary,
              `${palette.secondary}ee`,
              palette.accent,
              `${palette.accent}ee`,
              "#10b981",
              "#059669",
            ];

            return (
              <div
                key={idx}
                className="absolute inset-0 origin-center text-center flex items-start justify-center pt-4 font-sans text-[9px] md:text-[10px] font-black text-white"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: "polygon(50% 50%, 30% 0, 70% 0)",
                  backgroundColor: colors[idx % colors.length],
                }}
              >
                <span className="rotate-90 origin-center translate-y-6 block">
                  {text}
                </span>
              </div>
            );
          })}

          {/* Golden Center Hub */}
          <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center shadow-lg z-20">
            <span className="text-[10px] font-bold text-black uppercase tracking-wider">
              Spin
            </span>
          </div>
        </motion.div>
      </div>

      {/* Spinner Output Banner */}
      <AnimatePresence>
        {winningSegment && (
          <motion.div
            className="flex flex-col items-center z-25 mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
          >
            <div className="text-center text-sm font-black mb-2 animate-bounce">
              Result: <span style={{ color: palette.primary }}>{winningSegment}</span>
            </div>
            <button
              onClick={onYes}
              className="px-6 py-3 rounded-full font-bold text-white shadow-xl cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 transition-all text-sm select-none"
              style={{
                backgroundColor: palette.primary,
              }}
            >
              {yesText}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="text-[8px] opacity-40 font-mono select-none">
        {!winningSegment && !spinning
          ? "Tap center hub or wheel to spin"
          : spinning
          ? "Revolving possibilities..."
          : "A perfect match!"}
      </span>
    </div>
  );
}

export default SpinTheWheel;
