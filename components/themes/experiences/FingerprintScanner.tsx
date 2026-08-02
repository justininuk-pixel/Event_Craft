"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";

export function FingerprintScanner({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [accessGranted, setAccessGranted] = useState(false);

  const HOLD_DURATION_MS = 3000;
  const lastTimeRef = useRef(0);
  const reqRef = useRef<number>(0);
  const holdingRef = useRef(false);

  // Sync ref with state so the RAF loop has latest value
  useEffect(() => {
    holdingRef.current = isHolding;
  }, [isHolding]);

  useEffect(() => {
    if (isRevealed || accessGranted) return;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setProgress(prev => {
        if (holdingRef.current) {
          // Increase progress
          const next = prev + (dt / HOLD_DURATION_MS);
          if (next >= 1.0) {
            setAccessGranted(true);
            setTimeout(() => {
              setIsRevealed(true);
              onComplete?.();
            }, 1000);
            return 1.0;
          }
          return next;
        } else {
          // Drain progress rapidly
          const next = prev - (dt / (HOLD_DURATION_MS / 3)); // Drain 3x faster than fill
          return Math.max(0, next);
        }
      });

      if (!accessGranted) {
        reqRef.current = requestAnimationFrame(loop);
      }
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isRevealed, accessGranted, onComplete]);

  // Touch event handlers
  const handleDown = (e: React.PointerEvent) => {
    if (isRevealed || accessGranted) return;
    setIsHolding(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleUp = (e: React.PointerEvent) => {
    setIsHolding(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center p-8">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-1000 z-10"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          backgroundColor: palette.background as string 
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-2xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Scanner Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            
            <p className={`font-mono mb-16 tracking-widest uppercase text-sm transition-colors duration-300 ${accessGranted ? 'text-green-400' : 'text-cyan-500/50'}`}>
              {accessGranted ? "Access Granted" : "Identity Verification Required"}
            </p>

            <div 
              className="relative w-64 h-64 flex items-center justify-center rounded-full cursor-pointer"
              onPointerDown={handleDown}
              onPointerUp={handleUp}
              onPointerLeave={handleUp}
              onPointerCancel={handleUp}
              style={{ touchAction: 'none' }}
            >
              
              {/* The Fingerprint Icon */}
              <Fingerprint 
                size={120} 
                strokeWidth={1.5}
                className="transition-colors duration-300 z-10 pointer-events-none"
                style={{ 
                  color: accessGranted ? '#4ade80' : isHolding ? palette.accent as string : '#3f3f46',
                  filter: (isHolding || accessGranted) ? `drop-shadow(0 0 10px ${accessGranted ? '#4ade80' : palette.accent})` : 'none'
                }}
              />

              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                {/* Background Ring */}
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="48%" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="2"
                />
                {/* Foreground Ring */}
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="48%" 
                  fill="none" 
                  stroke={accessGranted ? '#4ade80' : palette.accent as string}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 123}`} // approx circumference
                  strokeDashoffset={`${2 * Math.PI * 123 * (1 - progress)}`}
                  className="transition-all duration-75"
                />
              </svg>

              {/* Laser Scanner Line (only visible when holding) */}
              {isHolding && !accessGranted && (
                <motion.div 
                  className="absolute left-0 w-full h-[2px] z-20 pointer-events-none"
                  style={{ 
                    backgroundColor: palette.accent as string,
                    boxShadow: `0 0 15px ${palette.accent}, 0 0 5px ${palette.accent}`
                  }}
                  animate={{ top: ['20%', '80%', '20%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Active Pulse Glow */}
              <div 
                className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none -z-10"
                style={{ 
                  background: `radial-gradient(circle, ${accessGranted ? 'rgba(74, 222, 128, 0.2)' : `${palette.accent}33`} 0%, transparent 70%)`,
                  opacity: (isHolding || accessGranted) ? 1 : 0,
                  transform: `scale(${1 + progress * 0.2})`
                }}
              />

            </div>

            <p className="mt-16 font-mono text-zinc-600 text-xs tracking-widest animate-pulse">
              Press and hold scanner
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
