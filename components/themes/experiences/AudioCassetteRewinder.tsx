"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Rewind, FastForward, Play, Pause } from "lucide-react";

export function AudioCassetteRewinder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"];
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b";
  const title = config.title || "Summer '94 Mix";

  const [spoolRotation, setSpoolRotation] = useState(0);
  const [isRewinding, setIsRewinding] = useState(false);
  const [progress, setProgress] = useState(75); // starts at 75% played
  const lastAngleRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  const handleSpoolDrag = (e: React.TouchEvent | React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-spool]");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const me = e as React.MouseEvent;
      if (me.buttons !== 1) return;
      clientX = me.clientX;
      clientY = me.clientY;
    }

    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);

    if (lastAngleRef.current !== null) {
      let delta = angle - lastAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      setSpoolRotation((prev) => prev + delta);
      setProgress((prev) => Math.max(0, Math.min(100, prev - delta * 0.2)));
      setIsRewinding(delta < 0);
    }

    lastAngleRef.current = angle;
  };

  const handleDragEnd = () => {
    lastAngleRef.current = null;
    setIsRewinding(false);
    if (progress < 5 && onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center font-mono overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>

      {/* Cassette Body */}
      <div className="relative w-full max-w-sm bg-[#e7e5e4] rounded-lg border-2 border-[#a8a29e] shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-6 mx-4">

        {/* Label */}
        <div className="w-full bg-white border border-stone-300 rounded p-3 mb-6 text-center shadow-inner">
          <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Side A</div>
          <div className="text-lg font-black text-stone-800 uppercase tracking-tight mt-1" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            {title}
          </div>
          <div className="flex justify-between text-[9px] text-stone-400 mt-2 px-4">
            <span>NR · HX PRO</span>
            <span>C-90</span>
          </div>
        </div>

        {/* Tape Window */}
        <div className="w-full bg-stone-800 rounded-sm p-3 flex items-center justify-center gap-8 border border-stone-900 shadow-inner relative overflow-hidden">
          {/* Tape visible through window */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 opacity-50" />

          {/* Left Spool */}
          <motion.div
            data-spool="left"
            className="w-16 h-16 rounded-full bg-white border-4 border-stone-400 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing relative z-10"
            style={{ rotate: spoolRotation }}
            onMouseMove={handleSpoolDrag}
            onTouchMove={handleSpoolDrag}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
          >
            <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-stone-600" />
            {/* Spoke lines */}
            <div className="absolute w-full h-px bg-stone-400 top-1/2" />
            <div className="absolute w-px h-full bg-stone-400 left-1/2" />
          </motion.div>

          {/* Tape between spools */}
          <div className="w-12 h-1 bg-amber-900/60 rounded-full relative z-10" />

          {/* Right Spool */}
          <motion.div
            className="w-16 h-16 rounded-full bg-white border-4 border-stone-400 shadow-lg flex items-center justify-center relative z-10"
            style={{ rotate: -spoolRotation * 0.8 }}
          >
            <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-stone-600" />
            <div className="absolute w-full h-px bg-stone-400 top-1/2" />
            <div className="absolute w-px h-full bg-stone-400 left-1/2" />
          </motion.div>
        </div>

        {/* Bottom screws */}
        <div className="flex justify-between mt-4 px-2">
          <div className="w-4 h-4 rounded-full bg-stone-400 border border-stone-500 shadow-inner flex items-center justify-center text-[8px] text-stone-600">+</div>
          <div className="w-4 h-4 rounded-full bg-stone-400 border border-stone-500 shadow-inner flex items-center justify-center text-[8px] text-stone-600">+</div>
        </div>
      </div>

      {/* Progress & Instructions */}
      <div className="mt-8 text-center">
        <div className="w-48 h-1 bg-stone-700 rounded-full mx-auto mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
        </div>
        <p className="text-stone-500 text-xs">{progress.toFixed(0)}% — {isRewinding ? "Rewinding..." : "Drag the left spool to rewind"}</p>
      </div>
    </div>
  );
}
