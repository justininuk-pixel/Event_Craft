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

export function PaperAirplaneDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "✈️",
  recipient = "Passenger",
}: DeliveryProps) {
  const [launched, setLaunched] = useState(false);
  const [landed, setLanded] = useState(false);
  const [unfolded, setUnfolded] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerLaunch = () => {
    if (launched) return;
    setLaunched(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    audioManager.playSfx("/sfx/whoosh.mp3");

    // Flight stages
    // 1. Plane lands in center after 1100ms
    setTimeout(() => {
      setLanded(true);
    }, 1100);

    // 2. Unfolds from plane to sheet after 1600ms
    setTimeout(() => {
      setUnfolded(true);
      audioManager.playSfx("/sfx/paper-unfold.mp3");
    }, 1600);

    // 3. Complete reveal after 2500ms
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

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Airplane flight path */}
        {!landed && launched && (
          <motion.div
            className="absolute z-30"
            initial={{ x: "-100vw", y: "40vh", scale: 0.3, rotate: 30 }}
            animate={{
              x: ["-100vw", "40vw", "90vw", "10vw", "0vw"],
              y: ["40vh", "-20vh", "10vh", "-30vh", "0vh"],
              scale: [0.3, 1.2, 0.6, 1.5, 1.0],
              rotate: [30, -10, 45, -20, 0],
            }}
            transition={{
              duration: 1.1,
              ease: "easeInOut",
            }}
          >
            {/* SVG Airplane */}
            <svg
              className="w-20 h-20 fill-white drop-shadow-2xl"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </motion.div>
        )}

        {/* Landed & Unfolding Paper Card */}
        <AnimatePresence>
          {landed && (
            <motion.div
              className="absolute w-72 h-52 md:w-80 md:h-60 bg-zinc-50 rounded-lg shadow-2xl p-6 flex flex-col justify-between"
              style={{
                zIndex: 40,
                transformStyle: "preserve-3d",
                color: "#1f2937",
              }}
              initial={{ rotateX: 90, scale: 0.6, opacity: 0 }}
              animate={
                unfolded
                  ? { rotateX: 0, scale: 1.05, opacity: 1 }
                  : { rotateX: 45, scale: 0.9, opacity: 0.8 }
              }
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Folded paper creases */}
              {!unfolded && (
                <div className="absolute inset-0 bg-black/5 pointer-events-none rounded-lg z-20" />
              )}

              <div className="flex justify-between items-start">
                <span className="text-3xl">{emoji}</span>
                <span className="text-[8px] uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-1 rounded font-bold">
                  Air Mail
                </span>
              </div>
              <div className="text-center my-3">
                <span className="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1">
                  Soft landing card
                </span>
                <h4 className="font-sans text-md font-bold text-zinc-700">
                  To: {recipient}
                </h4>
              </div>
              <div className="text-[7px] text-zinc-400 text-center border-t border-zinc-100 pt-1">
                Flew in via CelebrationCraft
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-launch target */}
        {!launched && (
          <motion.div
            className="flex flex-col items-center cursor-pointer pointer-events-auto z-20"
            onClick={triggerLaunch}
            whileHover={{ scale: 1.05 }}
          >
            {/* Pulsing Target circle */}
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/40 flex items-center justify-center animate-spin-slow mb-4">
              <svg
                className="w-12 h-12 fill-white animate-pulse"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-wider animate-pulse">
              Tap to Launch Airplane
            </span>
          </motion.div>
        )}
      </div>

      {!launched && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the plane to send it flying
        </p>
      )}
    </div>
  );
}

export default PaperAirplaneDelivery;
