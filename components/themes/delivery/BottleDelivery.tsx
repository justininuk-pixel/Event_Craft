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

export function BottleDelivery({
  cardId,
  onComplete,
  emoji = "🍾",
  recipient = "Castaway",
}: DeliveryProps) {
  const [opened, setOpened] = useState(false);
  const [corkPopped, setCorkPopped] = useState(false);
  const [scrollEmerging, setScrollEmerging] = useState(false);
  const [scrollUnfurled, setScrollUnfurled] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerBottle = () => {
    if (opened) return;
    setOpened(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // 1. Pop Cork
    setCorkPopped(true);
    audioManager.playSfx("/sfx/cork-pop.mp3");

    // 2. Float scroll out of neck after 1000ms
    setTimeout(() => {
      setScrollEmerging(true);
    }, 1000);

    // 3. Unfurl scroll after 1800ms
    setTimeout(() => {
      setScrollUnfurled(true);
      audioManager.playSfx("/sfx/paper-unfold.mp3");
    }, 1800);

    // 4. Complete whole intro after 4000ms
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
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none bg-gradient-to-b from-sky-400 via-sky-300 to-blue-500"
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition duration-300 text-sm font-medium tracking-wide z-50 pointer-events-auto cursor-pointer"
      >
        Skip Intro ➔
      </button>

      {/* Floating Bottle Workspace */}
      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* Animated Background Waves */}
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10">
          <svg className="w-full h-full fill-blue-600/60 animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 C30,35 70,45 100,40 L100,100 L0,100 Z" />
          </svg>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-25">
          <svg className="w-full h-full fill-blue-700/80" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 C40,42 60,55 100,50 L100,100 L0,100 Z" />
          </svg>
        </div>

        {/* Emerged Scroll */}
        <AnimatePresence>
          {scrollEmerging && (
            <motion.div
              className="absolute w-64 h-48 bg-[#f5eacf] border border-amber-900/10 shadow-2xl rounded-sm p-4 flex flex-col justify-between"
              style={{
                zIndex: 30,
                color: "#4a3319",
                fontFamily: "serif",
              }}
              initial={{ y: 50, scale: 0.1, opacity: 0 }}
              animate={
                scrollUnfurled
                  ? { y: -100, scale: 1.05, opacity: 1 }
                  : { y: 0, scale: 0.4, opacity: 0.8 }
              }
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center text-amber-800">
                <span className="text-2xl">{emoji}</span>
                <span className="text-[7px] uppercase tracking-widest bg-amber-900/10 px-2 py-0.5 rounded font-bold">
                  Message in Bottle
                </span>
              </div>
              <div className="text-center my-2">
                <span className="text-[7px] uppercase tracking-wider text-amber-800/60 block mb-0.5">
                  Washed Ashore
                </span>
                <h4 className="font-bold text-sm italic truncate">
                  For {recipient}
                </h4>
              </div>
              <div className="text-[7px] text-amber-800/40 text-center border-t border-amber-900/10 pt-1">
                CelebrationCraft Marine Delivery
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Glass Bottle */}
        <motion.div
          className="relative w-36 h-64 flex flex-col items-center cursor-pointer pointer-events-auto z-15"
          animate={
            !opened
              ? {
                  y: [0, -10, 0],
                  rotate: [0, -4, 4, 0],
                }
              : { scale: 1.1 }
          }
          transition={
            !opened
              ? {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.4 }
          }
          onClick={triggerBottle}
        >
          {/* CORK PIECE */}
          <motion.div
            className="w-6 h-8 bg-amber-800 rounded-t-sm shadow-inner z-30"
            style={{ originY: "bottom" }}
            animate={corkPopped ? { y: -80, rotate: 45, opacity: 0 } : { y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* BOTTLE NECK */}
          <div className="w-10 h-16 bg-emerald-200/50 border-x-2 border-t-2 border-emerald-300/40 rounded-t-md shadow-inner backdrop-blur-[1px] relative">
            {/* Liquid overlay */}
            <div className="absolute inset-0 bg-emerald-100/20" />
          </div>

          {/* BOTTLE BODY */}
          <div className="w-28 h-44 bg-emerald-200/40 border-2 border-emerald-300/35 rounded-3xl shadow-2xl relative flex items-center justify-center overflow-hidden backdrop-blur-[2px]">
            {/* Water reflections */}
            <div className="absolute top-2 left-3 w-4 h-36 bg-white/20 rounded-full blur-[1px]" />

            {/* Scroll inside the bottle (hides when emerging) */}
            {!scrollEmerging && (
              <motion.div
                className="w-8 h-28 bg-[#fbf5e6] border border-amber-800/30 rounded-md rotate-12 flex flex-col justify-center items-center shadow-inner"
                animate={opened ? { opacity: 0, scale: 0.5 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-6 h-0.5 bg-red-500 mb-6" />
                <div className="w-6 h-0.5 bg-red-500" />
              </motion.div>
            )}

            {!opened && (
              <span className="absolute text-[8px] text-white font-black uppercase tracking-widest animate-pulse z-20 bg-emerald-900/30 px-2 py-1 rounded">
                Uncork Bottle
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {!opened && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the bottle to pop the cork
        </p>
      )}
    </div>
  );
}

export default BottleDelivery;
