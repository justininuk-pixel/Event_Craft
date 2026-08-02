"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { isMobileViewport, triggerVibrate } from "../../../lib/utils/device";

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

interface Position {
  x: number;
  y: number;
}

export function BouncingDVD({
  yesText = "Yes",
  noText = "No",
  promptText = "Are you sure? 🥹",
  onYes,
  palette,
}: InteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [noPos, setNoPos] = useState<Position>({ x: 50, y: 50 });
  const [history, setHistory] = useState<Position[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const button = noButtonRef.current;
    if (!container || !button) return;

    const isMobile = isMobileViewport();
    const startSpeed = isMobile ? 1.5 : 2.5;

    // Vectors
    let px = Math.random() * 80 + 20;
    let py = Math.random() * 80 + 20;
    let vx = (Math.random() > 0.5 ? 1 : -1) * startSpeed;
    let vy = (Math.random() > 0.5 ? 1 : -1) * startSpeed;
    let currentSpeedMultiplier = 1.0;

    let animId: number;

    const update = () => {
      const cRect = container.getBoundingClientRect();
      const bRect = button.getBoundingClientRect();

      const limitW = cRect.width - bRect.width;
      const limitH = cRect.height - bRect.height;

      // Update positions
      px += vx * currentSpeedMultiplier;
      py += vy * currentSpeedMultiplier;

      let hit = false;

      // Collisions
      if (px <= 0) {
        px = 0;
        vx = -vx;
        hit = true;
      } else if (px >= limitW) {
        px = limitW;
        vx = -vx;
        hit = true;
      }

      if (py <= 0) {
        py = 0;
        vy = -vy;
        hit = true;
      } else if (py >= limitH) {
        py = limitH;
        vy = -vy;
        hit = true;
      }

      if (hit) {
        // Boost speed by 5% up to 3x cap
        currentSpeedMultiplier = Math.min(currentSpeedMultiplier * 1.05, 3.0);
        triggerVibrate(30);
      }

      setNoPos({ x: px, y: py });

      // Track historical steps for mobile ghost trails
      if (isMobile) {
        setHistory((prev) => [{ x: px, y: py }, ...prev.slice(0, 4)]);
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[360px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-6 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      {/* YES BUTTON (Anchored static in center) */}
      <div className="flex-1 flex items-center justify-center z-10">
        <motion.button
          onClick={onYes}
          className="px-8 py-4 rounded-full font-bold text-white shadow-2xl pointer-events-auto cursor-pointer flex items-center justify-center select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "18px",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {yesText} 💖
        </motion.button>
      </div>

      {/* NO BUTTON BOUNCER (Transform: translate) */}
      <div className="absolute inset-0 pointer-events-none w-full h-full">
        {/* Render mobile ghost trails */}
        {history.map((pos, idx) => (
          <div
            key={idx}
            className="absolute p-3 px-5 rounded-full font-bold text-white bg-red-500/20 border border-red-500/10"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              opacity: 0.4 - idx * 0.1,
              backgroundColor: `${palette.secondary}44`,
              borderColor: `${palette.secondary}22`,
            }}
          >
            {noText}
          </div>
        ))}

        {/* Real button */}
        <button
          ref={noButtonRef}
          className="absolute p-3 px-5 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-default select-none transition-colors duration-200"
          style={{
            backgroundColor: palette.secondary,
            transform: `translate(${noPos.x}px, ${noPos.y}px)`,
          }}
        >
          {noText}
        </button>
      </div>
    </div>
  );
}

export default BouncingDVD;
