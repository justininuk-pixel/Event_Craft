"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function GravityWell({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you go to prom with me? 💃",
  onYes,
  palette,
}: InteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const [merged, setMerged] = useState(false);
  const [spiralActive, setSpiralActive] = useState(false);

  // Monitor mouse movements to calculate pull forces
  useEffect(() => {
    if (merged || spiralActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      const yesBtn = yesButtonRef.current;
      if (!container || !yesBtn) return;

      const containerRect = container.getBoundingClientRect();
      const yesRect = yesBtn.getBoundingClientRect();

      // YES center
      const yx = yesRect.left - containerRect.left + yesRect.width / 2;
      const yy = yesRect.top - containerRect.top + yesRect.height / 2;

      // Mouse position relative to container
      const mx = e.clientX - containerRect.left;
      const my = e.clientY - containerRect.top;

      // NO default center sits about 80px to the right of YES
      const noDefaultX = yx + 100;
      const noDefaultY = yy;

      // Distance from mouse to default NO location
      const dxMouseNo = mx - noDefaultX;
      const dyMouseNo = my - noDefaultY;
      const distMouseNo = Math.sqrt(dxMouseNo * dxMouseNo + dyMouseNo * dyMouseNo);

      if (distMouseNo < 100) {
        // Pull NO button towards YES button
        const pullFactor = (100 - distMouseNo) / 100; // 0 to 1
        const pullDistance = pullFactor * 70; // pull up to 70px towards YES

        // Pull vector towards YES
        const vx = yx - noDefaultX;
        const vy = yy - noDefaultY;
        const len = Math.sqrt(vx * vx + vy * vy);

        if (len > 0) {
          const px = (vx / len) * pullDistance;
          const py = (vy / len) * pullDistance;
          setNoOffset({ x: px, y: py });
        }

        // Trigger escape counter if user moves cursor away quickly
        if (pullFactor > 0.8 && escapeCount < 3) {
          setTimeout(() => {
            setEscapeCount((c) => {
              const next = c + 1;
              if (next >= 3) {
                // Trigger spiral merge!
                setSpiralActive(true);
                triggerVibrate(150);
                setTimeout(() => {
                  setMerged(true);
                  setSpiralActive(false);
                }, 1000);
              }
              return next;
            });
          }, 200);
        }
      } else {
        // Rest state
        setNoOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [merged, spiralActive, escapeCount]);

  // Mobile fallback: touch triggers immediate merge steps
  const handleTouchNo = () => {
    if (merged || spiralActive) return;
    triggerVibrate(80);
    const nextCount = escapeCount + 1;
    setEscapeCount(nextCount);

    if (nextCount >= 3) {
      setSpiralActive(true);
      setTimeout(() => {
        setMerged(true);
        setSpiralActive(false);
      }, 1000);
    } else {
      // Pull button slightly towards Yes on tap
      setNoOffset((prev) => ({ x: prev.x - 30, y: prev.y }));
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[350px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-10 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      {/* Gravity particles sucking into YES */}
      {!merged && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full">
            <defs>
              <radialGradient id="grav-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={palette.primary} stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx="40%"
              cy="60%"
              r="80"
              fill="url(#grav-glow)"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      <div className="flex flex-row items-center justify-center gap-12 w-full relative min-h-[100px]">
        {/* YES BUTTON (Grows as gravity well expands) */}
        <motion.button
          ref={yesButtonRef}
          onClick={onYes}
          className="px-8 py-3 rounded-full font-bold text-white shadow-xl z-20 pointer-events-auto cursor-pointer select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "17px",
          }}
          animate={merged ? { scale: 1.5, x: 25 } : { scale: 1.0 + escapeCount * 0.15 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
        >
          {yesText} 💖
        </motion.button>

        {/* NO BUTTON (Drawn to Yes, spirals on merge) */}
        <AnimatePresence>
          {!merged && (
            <motion.button
              onClick={handleTouchNo}
              className="px-6 py-3 rounded-full font-bold text-white shadow-lg z-15 pointer-events-auto cursor-pointer select-none"
              style={{
                backgroundColor: palette.secondary,
                fontSize: "16px",
              }}
              animate={
                spiralActive
                  ? {
                      x: -90,
                      y: 0,
                      rotate: 720,
                      scale: 0.1,
                      opacity: 0,
                    }
                  : {
                      x: noOffset.x,
                      y: noOffset.y,
                    }
              }
              transition={
                spiralActive
                  ? { duration: 1.0, ease: "easeInOut" }
                  : { type: "spring", stiffness: 150, damping: 15 }
              }
            >
              {noText}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <span className="text-[9px] opacity-40 select-none z-10 mt-10">
        {merged ? "Gravity singularity reached! 🌀" : `Escape vector force: ${escapeCount}/3`}
      </span>
    </div>
  );
}

export default GravityWell;
