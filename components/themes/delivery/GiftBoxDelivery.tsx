"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
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

export function GiftBoxDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "🎁",
  recipient = "Birthday Star",
}: DeliveryProps) {
  const [opened, setOpened] = useState(false);
  const [jiggling, setJiggling] = useState(false);
  const [lidLifted, setLidLifted] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);

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
    if (opened) return;
    setOpened(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // 1. Start Jiggle
    setJiggling(true);
    audioManager.playSfx("/sfx/gift-unwrap.mp3");

    // 2. Lift Lid & Pop Confetti after 600ms
    setTimeout(() => {
      setJiggling(false);
      setLidLifted(true);

      // Confetti Pop
      audioManager.playSfx("/sfx/confetti-pop.mp3");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 600);

    // 3. Slide Card out of box after 1200ms
    setTimeout(() => {
      setCardRevealed(true);
    }, 1200);

    // 4. Complete transition after 3500ms
    setTimeout(() => {
      onComplete();
    }, 3500);
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

      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* The Emerging Card */}
        <motion.div
          className="absolute w-64 h-48 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between"
          style={{
            zIndex: cardRevealed ? 30 : 5,
            bottom: "160px",
            color: "#1f2937",
          }}
          initial={{ y: 80, scale: 0.8, opacity: 0 }}
          animate={
            cardRevealed
              ? { y: -30, scale: 1.05, opacity: 1 }
              : opened
              ? { y: 40, scale: 0.9, opacity: 0.5 }
              : { y: 80, scale: 0.8, opacity: 0 }
          }
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-3xl">{emoji}</span>
            <div
              className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${palette.primary}15`,
                color: palette.primary,
              }}
            >
              Surprise!
            </div>
          </div>
          <div className="text-center my-3">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 block mb-1">
              A Gift of Celebration
            </span>
            <h4 className="font-sans text-md font-bold text-zinc-700">
              For {recipient}
            </h4>
          </div>
          <div className="text-[8px] text-zinc-400 text-center border-t border-zinc-50 pt-2">
            Open your special greeting
          </div>
        </motion.div>

        {/* 3D Gift Box Wrapper */}
        <motion.div
          className="relative w-48 h-48 cursor-pointer pointer-events-auto z-20"
          animate={
            jiggling
              ? {
                  rotate: [0, -6, 6, -6, 6, -3, 3, 0],
                  y: [0, -4, 0, -4, 0, -2, 0],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
          onClick={triggerOpen}
        >
          {/* GIFT LID */}
          <motion.div
            className="absolute top-0 left-[-4px] right-[-4px] h-12 rounded-t-sm shadow-md z-30"
            style={{
              backgroundColor: palette.secondary,
              borderBottom: `3px solid ${palette.accent}`,
              transformOrigin: "bottom left",
            }}
            animate={
              lidLifted
                ? {
                    y: -60,
                    rotate: -45,
                    opacity: 0,
                  }
                : { y: 0, rotate: 0 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Lid Ribbon Knot */}
            <div
              className="absolute left-1/2 top-[-16px] -translate-x-1/2 w-8 h-8 rounded-full border-4 border-amber-300"
              style={{ backgroundColor: palette.accent }}
            />
          </motion.div>

          {/* GIFT BOX BODY */}
          <div
            className="absolute top-10 left-0 w-full h-38 rounded-b-md shadow-2xl flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: palette.primary }}
          >
            {/* Wrapping Ribbon Cross */}
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6"
              style={{ backgroundColor: palette.accent }}
            />
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6"
              style={{ backgroundColor: palette.accent }}
            />

            {!opened && (
              <span className="text-white text-xs font-bold uppercase tracking-wider animate-pulse z-10 shadow-sm">
                Tap to Open
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {!opened && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the box to unwrap your gift
        </p>
      )}
    </div>
  );
}

export default GiftBoxDelivery;
