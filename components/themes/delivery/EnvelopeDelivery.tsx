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

export function EnvelopeDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "💌",
  recipient = "Someone Special",
}: DeliveryProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [startFlap, setStartFlap] = useState(false);
  const [startSlide, setStartSlide] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerOpen = () => {
    if (isOpened) return;
    setIsOpened(true);

    // Set local delivery flag
    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // Play envelope SFX
    audioManager.playSfx("/sfx/envelope-open.mp3");

    // Sequence timing
    // 1. Crack Seal
    setSealCracked(true);

    // 2. Open Flap after 400ms
    setTimeout(() => {
      setStartFlap(true);
    }, 400);

    // 3. Slide card up after 900ms
    setTimeout(() => {
      setStartSlide(true);
    }, 1000);

    // 4. Complete whole reveal after 2500ms
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

      {/* 3D Envelope Container */}
      <div
        className="relative w-80 h-64 md:w-[420px] md:h-80 flex items-center justify-center"
        style={{ perspective: "1500px" }}
      >
        {/* ENVELOPE BACK & BODY */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg shadow-2xl transition-transform duration-500"
          style={{
            backgroundColor: palette.primary,
            border: `2px solid ${palette.secondary}33`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Internal shadow card slot pocket */}
          <div className="absolute inset-x-2 bottom-2 top-8 bg-black/15 rounded-md overflow-hidden" />

          {/* THE CARD SLIDING OUT */}
          <motion.div
            className="absolute inset-x-4 h-56 md:h-72 bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between"
            style={{
              bottom: "8px",
              transformStyle: "preserve-3d",
              zIndex: startSlide ? 30 : 5,
              color: "#1f2937",
            }}
            animate={
              startSlide
                ? {
                    y: -150,
                    scale: 1.05,
                    rotateX: 10,
                  }
                : { y: 0, scale: 0.95 }
            }
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 15,
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-4xl">{emoji}</span>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: `${palette.accent}22`,
                  color: palette.accent,
                }}
              >
                CC
              </div>
            </div>
            <div className="my-auto text-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
                You received a card
              </span>
              <h3 className="font-serif text-lg md:text-xl font-semibold text-zinc-800 line-clamp-2 leading-snug">
                For {recipient}
              </h3>
            </div>
            <div className="text-[9px] text-zinc-400 text-center border-t border-zinc-100 pt-2">
              CelebrationCraft Interactive card
            </div>
          </motion.div>

          {/* FRONT DIAGONAL FOLDS (Left/Right pockets) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            style={{
              clipPath: "polygon(0 0, 0 100%, 50% 50%)",
              backgroundColor: palette.secondary,
              opacity: 0.9,
            }}
          />
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 50% 50%)",
              backgroundColor: palette.secondary,
              opacity: 0.9,
            }}
          />
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            style={{
              clipPath: "polygon(0 100%, 100% 100%, 50% 50%)",
              backgroundColor: palette.primary,
              filter: "brightness(0.9)",
            }}
          />

          {/* ENVELOPE TOP FLAP */}
          <div
            className="absolute left-0 right-0 top-0 h-1/2 origin-top transition-transform duration-700 z-10"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backgroundColor: palette.primary,
              transformStyle: "preserve-3d",
              transform: startFlap ? "rotateX(180deg) translateY(-1px)" : "rotateX(0deg)",
              zIndex: startFlap ? 2 : 25,
            }}
          />

          {/* INTERACTIVE WAX SEAL BUTTON */}
          <AnimatePresence>
            {!isOpened && (
              <motion.button
                onClick={triggerOpen}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-amber-300 bg-red-700 hover:bg-red-600 active:scale-95 transition cursor-pointer z-40 text-white select-none pointer-events-auto"
                style={{
                  transformStyle: "preserve-3d",
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl md:text-3xl animate-bounce mt-1">
                  {emoji}
                </span>
                <span className="text-[7px] uppercase tracking-wider font-bold -mt-0.5">
                  Open
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* CRACKED SEAL EFECTS */}
          {sealCracked && !startSlide && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl z-40 pointer-events-none opacity-50 animate-ping">
              💥
            </div>
          )}
        </div>
      </div>

      {/* Helper text prompt */}
      {!isOpened && (
        <p className="mt-8 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the seal to open your card
        </p>
      )}
    </div>
  );
}

export default EnvelopeDelivery;
