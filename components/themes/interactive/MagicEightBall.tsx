"use client";

import React, { useState, useEffect } from "react";
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
  promptText?: string;
}

const ANSWERS = [
  "YES DEFINITELY",
  "WITHOUT A DOUBT",
  "SIGNS POINT TO YES",
  "ABSOLUTELY",
  "MOST LIKELY",
  "YOU BET",
  "IT IS CERTAIN",
  "OUTLOOK GOOD",
];

export function MagicEightBall({
  yesText = "Proceed ➔",
  promptText,
  onYes,
  palette,
}: InteractiveProps) {
  const [shaking, setShaking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  const triggerShake = () => {
    if (shaking) return;
    setShaking(true);
    setRevealed(false);
    triggerVibrate([80, 50, 80]);
    audioManager.playSfx("/sfx/heartbeat.mp3"); // shake wobble thud sound fallback

    setTimeout(() => {
      const randomAnswer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(randomAnswer);
      setShaking(false);
      setRevealed(true);
      triggerVibrate(120);
      audioManager.playSfx("/sfx/typewriter-key.mp3");
    }, 1200);
  };

  // Accelerometer shake detection for mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastX = 0, lastY = 0, lastZ = 0;
    const threshold = 15; // Shake acceleration threshold

    const handleMotion = (e: DeviceMotionEvent) => {
      if (shaking || revealed) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
        triggerShake();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaking, revealed]);

  const requestMotionPermission = async () => {
    // @ts-expect-error DeviceMotionEvent requestPermission is platform-specific
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        // @ts-expect-error DeviceMotionEvent requestPermission is platform-specific
        const response = await DeviceMotionEvent.requestPermission();
        if (response === "granted") {
          // permission granted
        }
      } catch (e) {
        console.warn("DeviceMotion request failed", e);
      }
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[380px]"
      onClick={requestMotionPermission}
    >
      <h3
        className="text-lg font-black text-center mb-6 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText || "Ask the Magic 8-Ball your question... 🎱"}
      </h3>

      {/* 3D Magic 8-ball Spherical container */}
      <div className="flex-1 flex items-center justify-center relative my-4">
        <motion.div
          onClick={triggerShake}
          className="w-48 h-48 rounded-full bg-zinc-950 shadow-2xl flex items-center justify-center cursor-pointer border border-zinc-800/50 relative"
          animate={
            shaking
              ? {
                  rotate: [0, -10, 10, -10, 10, -5, 5, 0],
                  scale: [1, 0.95, 1.05, 0.95, 1],
                  x: [0, -6, 6, -6, 6, -3, 3, 0],
                  y: [0, 6, -6, 6, -6, 3, -3, 0],
                }
              : {}
          }
          transition={{ duration: 1.0, ease: "easeInOut" }}
        >
          {/* Inner details */}
          {!revealed ? (
            // Number 8 circle
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-inner">
              <span className="text-black text-4xl font-extrabold font-serif">8</span>
            </div>
          ) : (
            // Blue glowing window
            <motion.div
              className="w-24 h-24 rounded-full bg-blue-950 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center p-3 relative overflow-hidden"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
            >
              {/* Inner blue triangle */}
              <div
                className="w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-b-[62px] border-b-cyan-500/80 flex items-center justify-center relative"
                style={{ filter: "drop-shadow(0 0 10px rgba(6,182,212,0.8))" }}
              >
                <div className="absolute top-[28px] left-[-30px] w-[60px] text-center text-[7px] leading-[8px] font-black text-white font-mono tracking-tighter select-none">
                  {answer}
                </div>
              </div>
            </motion.div>
          )}

          {/* Spherical Reflection overlay */}
          <div className="absolute top-2 left-6 w-12 h-6 bg-white/10 rounded-full blur-[1px]" />
        </motion.div>
      </div>

      {/* Confirmation Actions */}
      <AnimatePresence>
        {revealed && (
          <motion.button
            onClick={onYes}
            className="px-6 py-3.5 rounded-full font-bold text-white shadow-xl cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 transition-all text-sm select-none z-20 mb-2"
            style={{
              backgroundColor: palette.primary,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {yesText}
          </motion.button>
        )}
      </AnimatePresence>

      <span className="text-[8px] opacity-40 font-mono select-none">
        {!revealed && !shaking
          ? "Click sphere or shake phone to roll"
          : shaking
          ? "Consulting gravity dimensions..."
          : "Signs say yes!"}
      </span>
    </div>
  );
}

export default MagicEightBall;
