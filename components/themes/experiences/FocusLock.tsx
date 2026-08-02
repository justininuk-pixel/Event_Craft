"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";

export function FocusLock({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isUnlocked, setIsUnlocked] = useState(false);
  const reqRef = useRef<number>(0);
  const pressingRef = useRef(false);
  const progressRef = useRef(0);

  const HOLD_DURATION_MS = 3000;

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (isUnlocked) return;

      if (pressingRef.current) {
        // Increment progress
        progressRef.current = Math.min(1, progressRef.current + dt / HOLD_DURATION_MS);
      } else {
        // Drain quickly
        progressRef.current = Math.max(0, progressRef.current - (dt / (HOLD_DURATION_MS / 3)));
      }

      setProgress(progressRef.current);

      if (progressRef.current >= 1 && !isUnlocked) {
        setIsUnlocked(true);
        onComplete?.();
      } else {
        reqRef.current = requestAnimationFrame(loop);
      }
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isUnlocked, onComplete]);

  const handlePointerDown = () => {
    pressingRef.current = true;
    setIsPressing(true);
  };

  const handlePointerUp = () => {
    pressingRef.current = false;
    setIsPressing(false);
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] select-none">
      
      {/* Background Revealed Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[var(--exp-primary)]">
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-secondary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text-secondary)] whitespace-pre-wrap">
          {config.body}
        </p>
      </div>

      {/* Foreground Lock Layer */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-black/60 touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <p className="text-white/80 font-heading text-xl mb-12 animate-pulse">
              Press and hold to unlock
            </p>

            <div className="relative flex items-center justify-center cursor-pointer">
              {/* SVG Progress Ring */}
              <svg
                width="160"
                height="160"
                className="-rotate-90 drop-shadow-xl"
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={palette.accent as string || "#ffffff"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* The Lock Icon */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md"
                animate={{ scale: isPressing ? 0.9 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Fingerprint size={64} style={{ color: isPressing ? palette.accent as string : 'white' }} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
