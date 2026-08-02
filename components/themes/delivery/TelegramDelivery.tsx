"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

export function TelegramDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "📠",
  recipient = "OPERATOR",
}: DeliveryProps) {
  const [started, setStarted] = useState(false);
  const [printedText, setPrintedText] = useState("");

  const fullText = `TELEGRAM RECEIVED. STOP. SPECIAL CARD FOR ${recipient.toUpperCase()}. STOP. OPEN IMMEDIATELY. STOP.`;

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerTelegram = () => {
    if (started) return;
    setStarted(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // Rapid character feed loop
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 1000);
        return;
      }

      setPrintedText(fullText.substring(0, charIndex + 1));
      charIndex++;

      // Play SFX every few characters to avoid overwhelming overlapping audio
      if (charIndex % 3 === 0) {
        audioManager.playSfx("/sfx/typewriter-key.mp3");
      }
    }, 60);
  };

  const handleSkip = () => {
    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden select-none bg-zinc-900"
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

      <div className="relative w-80 h-96 md:w-[420px] md:h-96 flex flex-col items-center justify-center">
        {/* Ticker Tape Feed Paper */}
        <motion.div
          className="w-72 md:w-96 bg-[#FAF0D7] border-y border-[#dfd5bc] shadow-2xl p-6 font-mono text-zinc-800 text-xs md:text-sm relative"
          initial={{ height: 60, opacity: 0 }}
          animate={started ? { height: 200, opacity: 1 } : { height: 60, opacity: 0.8 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div className="border-b-2 border-dashed border-zinc-400 pb-2 mb-4 text-center font-bold text-[10px] tracking-wider text-zinc-500">
            --- VINTAGE TELEGRAPH SERVICE ---
          </div>

          {/* Typing Content */}
          <div className="min-h-16 text-zinc-700 leading-relaxed uppercase whitespace-pre-wrap select-text font-black tracking-wide">
            {printedText}
            {started && printedText.length < fullText.length && (
              <span className="animate-pulse font-sans">|</span>
            )}
          </div>

          {/* Emoji wax print */}
          <div className="absolute right-4 bottom-4 text-3xl opacity-75">
            {emoji}
          </div>
        </motion.div>

        {/* Vintage Telegraph Key Standee */}
        {!started && (
          <motion.div
            className="mt-8 flex flex-col items-center cursor-pointer pointer-events-auto z-20"
            onClick={triggerTelegram}
            whileHover={{ scale: 1.05 }}
          >
            {/* Round metal button */}
            <div className="w-16 h-16 rounded-full border-4 border-amber-500/50 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 flex items-center justify-center shadow-lg text-2xl">
              🔑
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-wider mt-4 animate-pulse">
              Press Key to Print Telegram
            </span>
          </motion.div>
        )}
      </div>

      {!started && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the telegraph key to receive telegram
        </p>
      )}
    </div>
  );
}

export default TelegramDelivery;
