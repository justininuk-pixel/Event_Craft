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

export function LetterDelivery({
  cardId,
  onComplete,
  palette,
  emoji = "✉️",
  recipient = "Mail Recipient",
}: DeliveryProps) {
  const [opened, setOpened] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [mailSlidesOut, setMailSlidesOut] = useState(false);
  const [flagDown, setFlagDown] = useState(false);

  // Check second-visit skip
  useEffect(() => {
    if (cardId && typeof window !== "undefined") {
      const isDelivered = localStorage.getItem(`delivered-${cardId}`);
      if (isDelivered === "true") {
        onComplete();
      }
    }
  }, [cardId, onComplete]);

  const triggerMailbox = () => {
    if (opened) return;
    setOpened(true);

    if (cardId && typeof window !== "undefined") {
      localStorage.setItem(`delivered-${cardId}`, "true");
    }

    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    // 1. Lower flag
    setFlagDown(true);

    // 2. Open door after 300ms
    setTimeout(() => {
      setDoorOpen(true);
      audioManager.playSfx("/sfx/paper-unfold.mp3");
    }, 300);

    // 3. Slide letter out after 800ms
    setTimeout(() => {
      setMailSlidesOut(true);
    }, 800);

    // 4. Complete after 3000ms
    setTimeout(() => {
      onComplete();
    }, 3000);
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
        {/* The Letter Sliding Out */}
        <motion.div
          className="absolute w-56 h-40 bg-zinc-50 border border-zinc-200 rounded-md shadow-2xl p-4 flex flex-col justify-between"
          style={{
            zIndex: mailSlidesOut ? 30 : 5,
            bottom: "160px",
            color: "#1f2937",
          }}
          initial={{ z: -100, y: 30, scale: 0.5, opacity: 0 }}
          animate={
            mailSlidesOut
              ? { z: 50, y: -40, scale: 1.1, opacity: 1 }
              : opened
              ? { z: -50, y: 10, scale: 0.7, opacity: 0.4 }
              : { z: -100, y: 30, scale: 0.5, opacity: 0 }
          }
          transition={{ type: "spring", stiffness: 70, damping: 12 }}
        >
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-2xl">{emoji}</span>
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[9px] text-red-600 font-bold">
              1
            </div>
          </div>
          <div className="text-center my-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 block mb-1">
              Special Delivery
            </span>
            <h4 className="font-serif text-sm font-bold text-zinc-800 line-clamp-1">
              To: {recipient}
            </h4>
          </div>
          <div className="text-[7px] text-zinc-400 text-center border-t border-zinc-100 pt-1">
            Hand delivered via CelebrationCraft
          </div>
        </motion.div>

        {/* 3D Mailbox Assembly */}
        <div
          className="relative w-48 h-48 cursor-pointer pointer-events-auto z-20"
          style={{ perspective: "1000px" }}
          onClick={triggerMailbox}
        >
          {/* MAILBOX ARCH BODY */}
          <div
            className="absolute inset-0 w-full h-32 rounded-t-full shadow-2xl overflow-hidden"
            style={{ backgroundColor: palette.primary }}
          >
            {/* Interior shadow for hollow box look */}
            <div className="absolute inset-x-2 bottom-0 top-6 bg-black/40 rounded-t-full" />
          </div>

          {/* FRONT DOOR FLAP */}
          <motion.div
            className="absolute bottom-16 left-0 w-full h-32 rounded-t-full origin-bottom border-b-4 border-black/10 z-20 shadow-md"
            style={{
              backgroundColor: palette.secondary,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            animate={doorOpen ? { rotateX: 95 } : { rotateX: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Mailbox Handle latch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-zinc-400 rounded-b-md shadow-inner" />
          </motion.div>

          {/* RED INCOMING MAIL FLAG */}
          <motion.div
            className="absolute right-[-10px] top-6 w-3 h-16 origin-bottom rounded-full z-15 shadow-sm"
            style={{ backgroundColor: palette.accent }}
            animate={flagDown ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Flag flagboard */}
            <div className="absolute top-0 right-[-6px] w-6 h-6 bg-red-600 rounded-sm" />
          </motion.div>

          {/* Mailbox post stand */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-16 bg-zinc-800 shadow-inner" />
        </div>
      </div>

      {!opened && (
        <p className="mt-4 text-white/75 text-sm font-medium tracking-wide animate-pulse">
          Click the mailbox to check the mail
        </p>
      )}
    </div>
  );
}

export default LetterDelivery;
