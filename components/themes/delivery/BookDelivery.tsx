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

export function BookDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "📖",
  recipient = "Reader",
}: DeliveryProps) {
  const [opened, setOpened] = useState(false);
  const [pageIndex, setPageIndex] = useState(0); // 0 = closed, 1 = cover open, 2 = page 1 flipped, 3 = page 2 flipped, 4 = revealed

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerBook = () => {
    if (opened) return;
    setOpened(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    audioManager.playSfx("/sfx/paper-unfold.mp3");

    // Page flip timing sequence
    // Flip Cover
    setPageIndex(1);

    // Flip Page 1
    setTimeout(() => {
      setPageIndex(2);
      audioManager.playSfx("/sfx/paper-unfold.mp3");
    }, 900);

    // Flip Page 2
    setTimeout(() => {
      setPageIndex(3);
      audioManager.playSfx("/sfx/paper-unfold.mp3");
    }, 1800);

    // Reveal final page content
    setTimeout(() => {
      setPageIndex(4);
    }, 2700);

    // Complete whole intro
    setTimeout(() => {
      onComplete();
    }, 4000);
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

      <div className="relative w-80 h-96 md:w-96 md:h-[420px] flex items-center justify-center">
        {/* Book Container with perspective */}
        <div
          className="relative w-64 h-80 md:w-72 md:h-90 transform-style-3d shadow-2xl rounded-lg"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {/* UNDERLYING RIGHT BOOK BASE (Back cover & inner sheets) */}
          <div
            className="absolute inset-0 w-full h-full rounded-r-lg p-6 flex flex-col justify-between bg-zinc-50 border-y border-r border-zinc-200"
            style={{
              transform: "translateZ(-3px)",
              boxShadow: "inset -15px 0 20px rgba(0,0,0,0.05)",
            }}
          >
            {/* Spine Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/25 to-transparent" />

            {/* Revealed Greeting Content */}
            {pageIndex >= 3 ? (
              <div className="flex flex-col justify-between h-full text-[#2d3748] font-serif text-center pt-8">
                <span className="text-5xl">{emoji}</span>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#a0aec0]">
                    Chapter Final
                  </span>
                  <h3 className="text-lg md:text-xl font-bold mt-2 italic text-[#1a202c]">
                    For {recipient}
                  </h3>
                </div>
                <div className="text-[9px] text-zinc-400">The Story Begins...</div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-zinc-300">
                <span className="text-sm">Reading...</span>
              </div>
            )}
          </div>

          {/* INNER FLIPPING PAGES */}
          <AnimatePresence>
            {/* Page 2 */}
            {pageIndex >= 2 && pageIndex < 4 && (
              <motion.div
                key="book-page-2"
                className="absolute inset-0 origin-left bg-zinc-100 border-y border-r border-zinc-300 p-6 flex items-center justify-center text-center font-serif text-[#4a5568]"
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "inset -10px 0 20px rgba(0,0,0,0.05)",
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                exit={{ rotateY: -180 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="scale-x-[-1] pointer-events-none">
                  <h4 className="text-md font-bold mb-2">A Special Message</h4>
                  <p className="text-xs text-zinc-500 italic">Inside this cover lies a message curated just for you.</p>
                </div>
              </motion.div>
            )}

            {/* Page 1 */}
            {pageIndex >= 1 && pageIndex < 3 && (
              <motion.div
                key="book-page-1"
                className="absolute inset-0 origin-left bg-zinc-50 border-y border-r border-zinc-200 p-6 flex items-center justify-center text-center font-serif text-[#4a5568]"
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "inset -10px 0 20px rgba(0,0,0,0.05)",
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                exit={{ rotateY: -180 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="scale-x-[-1] pointer-events-none">
                  <h4 className="text-lg font-bold mb-2">Once Upon A Time</h4>
                  <span className="text-3xl">✨</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FRONT BOOK COVER */}
          <motion.div
            className="absolute inset-0 w-full h-full origin-left rounded-lg shadow-2xl flex flex-col justify-between p-6 overflow-hidden text-white z-40 cursor-pointer pointer-events-auto"
            style={{
              backgroundColor: palette.primary,
              border: `2px solid ${palette.secondary}44`,
              borderLeftWidth: "6px",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            animate={
              opened
                ? {
                    rotateY: -180,
                    z: 10,
                  }
                : { rotateY: 0, z: 0 }
            }
            transition={{ duration: 0.9, ease: "easeInOut" }}
            onClick={triggerBook}
          >
            {/* Gold Gilt Borders */}
            <div className="absolute inset-2 border border-amber-300/40 rounded pointer-events-none" />

            <div className="text-center mt-6">
              <span className="text-4xl block mb-2">{emoji}</span>
              <h2 className="font-serif text-lg font-bold tracking-wide leading-tight px-2">
                A Magical Card
              </h2>
              <div className="h-0.5 w-12 bg-amber-400 mx-auto my-3" />
              <p className="text-[10px] text-amber-200 uppercase tracking-widest">
                Dedicated to
              </p>
              <p className="font-serif italic text-sm text-zinc-100 font-semibold truncate mt-1">
                {recipient}
              </p>
            </div>

            <div className="text-center text-[8px] text-amber-200/60 font-semibold tracking-wider uppercase">
              Click Cover to Open
            </div>
          </motion.div>
        </div>
      </div>

      {!opened && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the cover to read your card
        </p>
      )}
    </div>
  );
}

export default BookDelivery;
