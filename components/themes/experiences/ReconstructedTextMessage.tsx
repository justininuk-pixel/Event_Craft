"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function ReconstructedTextMessage({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f3f4f6"];
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const title = config.title || "The First Message";
  const targetMessage = config.body || "I had a really great time tonight.";

  // Exclude spaces for the draggable pieces
  const letters = targetMessage.split("");
  const scrambledLetters = letters.filter(l => l !== " ").sort(() => Math.random() - 0.5);

  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [activeLetter, setActiveLetter] = useState<{ char: string, sourceIdx: number } | null>(null);

  const handleSlotClick = (targetIdx: number) => {
    if (!activeLetter) return;
    
    // Check if correct
    if (letters[targetIdx].toLowerCase() === activeLetter.char.toLowerCase() && !placedIndices.includes(targetIdx)) {
      setPlacedIndices((prev) => {
        const next = [...prev, targetIdx];
        if (next.length === letters.filter(l => l !== " ").length && onComplete) {
          setTimeout(onComplete, 1500);
        }
        return next;
      });
      setActiveLetter(null);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    } else {
      // Wrong placement
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 20]);
      setActiveLetter(null);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 text-center border-b border-gray-200 shadow-sm z-20">
        <h2 className="text-sm font-bold text-gray-900 flex items-center justify-center gap-2">
          <MessageCircle size={14} className="text-blue-500" /> {title}
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Reconstruct the memory</p>
      </div>

      {/* Target area (iMessage bubble) */}
      <div className="p-6 mt-8 w-full flex justify-end z-10">
        <div 
          className="max-w-[85%] rounded-2xl rounded-tr-none px-4 py-3 shadow-md min-h-[60px] flex flex-wrap gap-1 content-start"
          style={{ backgroundColor: primaryColor }}
        >
          {letters.map((char, i) => {
            if (char === " ") {
              return <div key={`space-${i}`} className="w-3 h-6" />;
            }
            
            const isPlaced = placedIndices.includes(i);
            
            return (
              <div 
                key={`slot-${i}`}
                onClick={() => handleSlotClick(i)}
                className={`w-6 h-8 rounded flex items-center justify-center font-bold text-lg transition-colors ${
                  isPlaced 
                    ? "text-white" 
                    : "bg-white/20 border border-white/30 text-transparent cursor-pointer"
                } ${activeLetter && !isPlaced ? "hover:bg-white/40 ring-2 ring-white" : ""}`}
              >
                {isPlaced ? char : char}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrambled Letters Pool */}
      <div className="mt-auto bg-gray-100 border-t border-gray-200 p-6 flex flex-wrap justify-center gap-2 z-10 h-1/3 overflow-y-auto">
        <AnimatePresence>
          {scrambledLetters.map((char, i) => {
            // Count how many of this character exist, and how many have been placed
            const totalOfChar = letters.filter(l => l.toLowerCase() === char.toLowerCase()).length;
            const placedOfChar = placedIndices.filter(idx => letters[idx].toLowerCase() === char.toLowerCase()).length;
            
            // If this instance of the character in the pool exceeds the remaining needed, hide it.
            // (We assign a deterministic "index" to each char in the pool to decide if it's "used")
            const myOrder = scrambledLetters.slice(0, i + 1).filter(l => l.toLowerCase() === char.toLowerCase()).length;
            const isUsed = myOrder <= placedOfChar;

            if (isUsed) return null;

            const isActive = activeLetter?.sourceIdx === i;

            return (
              <motion.button
                key={`pool-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isActive ? 1.2 : 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveLetter(isActive ? null : { char, sourceIdx: i })}
                className={`w-10 h-10 rounded-lg shadow bg-white border-b-2 flex items-center justify-center text-xl font-bold transition-colors ${
                  isActive ? "border-blue-500 text-blue-500 ring-2 ring-blue-500/50" : "border-gray-300 text-gray-700"
                }`}
              >
                {char.toUpperCase()}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
