"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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

export function EvadingButton({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you be mine? 💖",
  onYes,
  palette,
}: InteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [yesScale, setYesScale] = useState(1);
  const [evasionCount, setEvasionCount] = useState(0);

  const lastEvadeTime = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 28 });
  const springY = useSpring(y, { stiffness: 400, damping: 28 });

  const triggerEvasion = (clientX: number, clientY: number) => {
    const button = noButtonRef.current;
    const container = containerRef.current;
    if (!button || !container) return;

    // Cooldown check (400ms)
    const now = Date.now();
    if (now - lastEvadeTime.current < 400) return;
    lastEvadeTime.current = now;

    triggerVibrate(60);
    setEvasionCount((c) => c + 1);
    setYesScale((s) => Math.min(s + 0.1, 1.6));

    const rect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const pad = 24;
    const maxW = Math.max(20, containerRect.width / 2 - rect.width / 2 - pad);
    const maxH = Math.max(20, containerRect.height / 2 - rect.height / 2 - pad);

    // Candidate positions relative to container center
    const candidates = [
      { x: -maxW, y: -maxH },
      { x: maxW, y: -maxH },
      { x: -maxW, y: maxH },
      { x: maxW, y: maxH },
      { x: 0, y: -maxH },
      { x: 0, y: maxH },
      { x: -maxW, y: 0 },
      { x: maxW, y: 0 },
    ];

    // Compute distance from cursor for each candidate position in viewport coordinates
    const candidatesWithDist = candidates.map((c) => {
      const bx = containerRect.left + containerRect.width / 2 + c.x;
      const by = containerRect.top + containerRect.height / 2 + c.y;
      const dx = clientX - bx;
      const dy = clientY - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { ...c, dist };
    });

    // Sort by distance descending
    candidatesWithDist.sort((a, b) => b.dist - a.dist);

    // Pick from the top 3 candidates to add variety/playfulness while ensuring the button is far away
    const pool = candidatesWithDist.slice(0, 3);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    // Add a tiny random jitter (within 12px) that keeps it inside bounds
    const jitterX = (Math.random() - 0.5) * 24;
    const jitterY = (Math.random() - 0.5) * 24;
    const rx = Math.max(-maxW, Math.min(maxW, chosen.x + jitterX));
    const ry = Math.max(-maxH, Math.min(maxH, chosen.y + jitterY));

    x.set(rx);
    y.set(ry);
  };

  const handleMouseEnter = (e?: React.MouseEvent | MouseEvent) => {
    if (e) {
      triggerEvasion(e.clientX, e.clientY);
    } else {
      // Fallback if no event coordinates
      const button = noButtonRef.current;
      const container = containerRef.current;
      if (!button || !container) return;
      const rect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const pad = 24;
      const maxW = Math.max(20, containerRect.width / 2 - rect.width / 2 - pad);
      const maxH = Math.max(20, containerRect.height / 2 - rect.height / 2 - pad);
      const rx = (Math.random() - 0.5) * maxW * 2;
      const ry = (Math.random() - 0.5) * maxH * 2;
      x.set(rx);
      y.set(ry);
    }
  };

  // Handle desktop mouse movement to evade
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const button = noButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();

      // Button center
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;

      const dx = e.clientX - bx;
      const dy = e.clientY - by;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Evasion radius (95px)
      if (distance < 95) {
        triggerEvasion(e.clientX, e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  // Mobile strategy: Teleport randomly on touch
  const handleTouch = () => {
    const button = noButtonRef.current;
    const container = containerRef.current;
    if (!button || !container) return;

    triggerVibrate(80);
    setEvasionCount((c) => c + 1);
    setYesScale((s) => Math.min(s + 0.08, 1.6));

    const rect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const pad = 30;
    const maxW = containerRect.width / 2 - rect.width / 2 - pad;
    const maxH = containerRect.height / 2 - rect.height / 2 - pad;

    // Pick random position inside bounds
    const rx = (Math.random() - 0.5) * maxW * 2;
    const ry = (Math.random() - 0.5) * maxH * 2;

    x.set(rx);
    y.set(ry);
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[300px]"
    >
      <h3
        className="text-xl md:text-2xl font-black text-center mb-10 select-none px-4"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      <div className="flex flex-row items-center justify-center gap-4 w-full relative flex-wrap">
        {/* YES BUTTON (Grows a little on every dodge) */}
        <motion.button
          onClick={onYes}
          className="px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg pointer-events-auto cursor-pointer inline-flex items-center justify-center text-center leading-tight select-none min-w-[128px] max-w-[180px]"
          style={{
            backgroundColor: palette.primary,
            fontSize: "15px",
          }}
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          whileHover={{ scale: yesScale * 1.04 }}
          whileTap={{ scale: yesScale * 0.96 }}
        >
          {yesText}
        </motion.button>

        {/* NO BUTTON (Evades/Springs away) */}
        <motion.button
          ref={noButtonRef}
          onTouchStart={handleTouch}
          onMouseEnter={(e) => handleMouseEnter(e)}
          onClick={(e) => handleMouseEnter(e)}
          className="px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg pointer-events-auto cursor-pointer inline-flex items-center justify-center text-center leading-tight select-none min-w-[128px] max-w-[180px]"
          style={{
            backgroundColor: palette.secondary,
            x: springX,
            y: springY,
            fontSize: "15px",
          }}
          whileTap={{ scale: 0.95 }}
        >
          {noText}
        </motion.button>
      </div>

      {evasionCount > 0 && (
        <span className="text-[10px] opacity-40 absolute bottom-4 text-center select-none">
          Dodge count: {evasionCount} ⚡
        </span>
      )}
    </div>
  );
}

export default EvadingButton;
