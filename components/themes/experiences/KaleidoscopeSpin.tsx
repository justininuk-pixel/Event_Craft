"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function KaleidoscopeSpin({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [visualAngle, setVisualAngle] = useState(0);
  const [momentum, setMomentum] = useState(0);

  const dialRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const momentumRef = useRef(0);
  const reqRef = useRef<number>(0);

  const MOMENTUM_THRESHOLD = 5000; // degrees per second equivalent

  useEffect(() => {
    if (isRevealed) return;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (isRevealed) return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Decay momentum continuously
      momentumRef.current *= 0.95; // Friction

      setMomentum(momentumRef.current);
      setVisualAngle(prev => prev + momentumRef.current * (dt / 16));

      if (momentumRef.current > MOMENTUM_THRESHOLD) {
        setIsRevealed(true);
        onComplete?.();
        return;
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isRevealed, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRevealed) return;
    const a = getAngle(e.clientX, e.clientY);
    lastAngleRef.current = a;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRevealed || lastAngleRef.current === null) return;
    
    const currentAngle = getAngle(e.clientX, e.clientY);
    let delta = currentAngle - lastAngleRef.current;
    
    // Fix wraparound (-180 to 180)
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    momentumRef.current += delta * 2; // build momentum
    
    lastAngleRef.current = currentAngle;
  };

  const handlePointerUp = () => {
    lastAngleRef.current = null;
  };

  const getAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  const bgUrl = config.mediaUrl || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800";

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center p-8"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: palette.background as string 
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Kaleidoscope Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1 }}
          >
            
            <p className="absolute top-12 font-mono text-zinc-400 tracking-widest uppercase text-sm animate-pulse">
              Spin to shatter
            </p>

            {/* The Kaleidoscope Assembly */}
            <div 
              ref={dialRef}
              className="relative w-80 h-80 rounded-full overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)] cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              style={{
                transform: `rotate(${visualAngle}deg)`
              }}
            >
              
              {/* Base image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgUrl})` }}
              />

              {/* Duplicate 1 (Screen Blend) */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ 
                  backgroundImage: `url(${bgUrl})`,
                  transform: 'rotate(120deg) scale(1.1)',
                  mixBlendMode: 'screen'
                }}
              />

              {/* Duplicate 2 (Screen Blend) */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ 
                  backgroundImage: `url(${bgUrl})`,
                  transform: 'rotate(240deg) scale(1.1)',
                  mixBlendMode: 'lighten'
                }}
              />

              {/* Dynamic distortion overlay based on momentum */}
              <div 
                className="absolute inset-0 transition-opacity duration-75 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  mixBlendMode: 'overlay',
                  opacity: Math.min(1, Math.abs(momentum) / MOMENTUM_THRESHOLD)
                }}
              />

            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-24 w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ width: `${Math.min(100, (Math.abs(momentum) / MOMENTUM_THRESHOLD) * 100)}%` }}
              />
            </div>

            <p className="absolute bottom-12 font-mono text-zinc-500 text-xs tracking-widest text-center">
              Keep spinning to build momentum
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
