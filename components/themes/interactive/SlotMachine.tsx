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

const SYMBOLS = ["🍒", "🍋", "💎", "⭐", "🎁", "🔔", "❤️"];

export function SlotMachine({
  yesText = "Claim Prize! 🏆",
  promptText = "Spin to win a special surprise! 🎰",
  onYes,
  palette,
}: InteractiveProps) {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["⭐", "⭐", "⭐"]);
  const [jackpot, setJackpot] = useState(false);

  const startSpin = () => {
    if (spinning || jackpot) return;
    setSpinning(true);
    triggerVibrate([80, 50, 80]);
    audioManager.playSfx("/sfx/slot-machine-spin.mp3");

    // Spin durations for each reel
    const durations = [1200, 1800, 2400];
    const winningSymbols = ["❤️", "❤️", "❤️"];

    // Intervals to animate changing symbols
    const intervals = durations.map((dur, reelIdx) => {
      return setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[reelIdx] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
      }, 80);
    });

    // Stop reels one by one
    durations.forEach((dur, reelIdx) => {
      setTimeout(() => {
        clearInterval(intervals[reelIdx]);
        setReels((prev) => {
          const next = [...prev];
          next[reelIdx] = winningSymbols[reelIdx];
          return next;
        });

        // Play subtle key tick for stop
        audioManager.playSfx("/sfx/typewriter-key.mp3");
        triggerVibrate(30);

        // Final reel stopped
        if (reelIdx === 2) {
          setSpinning(false);
          setJackpot(true);
          triggerVibrate([100, 50, 200]);
          audioManager.playSfx("/sfx/confetti-pop.mp3");

          // Burst confetti
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }, dur);
    });
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-zinc-900 border-4 border-yellow-500 min-h-[380px]"
      style={{
        boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(234, 179, 8, 0.2)",
      }}
    >
      {/* Prompt */}
      <h3 className="text-md md:text-lg font-bold text-center text-yellow-400 select-none z-10 font-mono tracking-wider uppercase">
        {promptText}
      </h3>

      {/* The Slot Reels */}
      <div className="flex flex-row gap-4 my-6 bg-black border-2 border-zinc-800 p-4 rounded-xl shadow-inner relative w-full justify-center">
        {reels.map((symbol, idx) => (
          <div
            key={idx}
            className="w-20 h-24 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-4xl shadow-inner relative overflow-hidden font-bold select-none"
          >
            <motion.div
              key={symbol}
              initial={{ y: spinning ? -60 : 0, opacity: spinning ? 0.3 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.08, ease: "linear" }}
            >
              {symbol}
            </motion.div>
            {/* Reel divider line */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-zinc-800/40 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Jackpot Winner Banner */}
      <AnimatePresence>
        {jackpot && (
          <motion.div
            className="flex flex-col items-center z-15 my-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <div className="bg-yellow-500 text-black font-black uppercase text-xs md:text-sm tracking-widest px-6 py-2 rounded shadow-lg animate-bounce border-2 border-white">
              🎰 JACKPOT! 🎰
            </div>
            <button
              onClick={onYes}
              className="mt-6 px-8 py-3.5 rounded-full font-bold text-white bg-red-600 border border-red-500 shadow-xl cursor-pointer pointer-events-auto hover:bg-red-500 active:scale-95 transition-all text-sm select-none"
              style={{
                backgroundColor: palette.primary,
              }}
            >
              {yesText}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Lever button */}
      {!jackpot && (
        <motion.button
          onClick={startSpin}
          disabled={spinning}
          className={`w-32 py-3 rounded-full font-bold uppercase tracking-wider text-xs border cursor-pointer select-none ${
            spinning
              ? "bg-zinc-800 border-zinc-700 text-zinc-500"
              : "bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400 active:scale-95"
          } transition-all z-10`}
          whileTap={spinning ? {} : { scale: 0.95 }}
        >
          {spinning ? "Spinning..." : "Pull Lever 🕹️"}
        </motion.button>
      )}

      <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase">
        CelebrationCraft Casino Service
      </span>
    </div>
  );
}

export default SlotMachine;
