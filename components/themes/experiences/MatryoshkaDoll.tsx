"use client";

import React, { useState, useCallback, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MatryoshkaDoll({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const TOTAL_LAYERS = 6;
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playChime = useCallback((pitchMultiplier: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300 * pitchMultiplier, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const handleTap = () => {
    if (isRevealed) return;
    initAudio();
    
    if (currentLayer < TOTAL_LAYERS - 1) {
      playChime(1 + currentLayer * 0.2);
      setCurrentLayer(prev => prev + 1);
    } else {
      playChime(2.5); 
      setIsRevealed(true);
      onComplete?.();
    }
  };

  const colors = [
    palette.primary,
    palette.secondary,
    palette.accent,
    '#f43f5e', 
    '#3b82f6', 
    '#10b981', 
  ];

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center"
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

      {/* Foreground Nested Containers */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatePresence>
              {Array.from({ length: TOTAL_LAYERS }).map((_, idx) => {
                const layerIndex = TOTAL_LAYERS - 1 - idx; 
                
                if (layerIndex < currentLayer) return null;

                const depthScale = 1 - (layerIndex * 0.15); 
                const visualScale = depthScale * (1 + (currentLayer * 0.15)); 
                const baseSize = 250;

                const isTop = layerIndex === currentLayer;

                return (
                  <motion.div
                    key={layerIndex}
                    className={`absolute flex items-center justify-center rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer ${isTop ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    style={{
                      width: baseSize,
                      height: baseSize,
                      backgroundColor: colors[layerIndex % colors.length] as string,
                      border: `8px solid rgba(255,255,255,0.2)`
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: visualScale, opacity: 1 }}
                    exit={{ scale: visualScale * 1.5, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      opacity: { duration: 0.3 }
                    }}
                    onTap={isTop ? handleTap : undefined}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-black/30 pointer-events-none" />
                    
                    <motion.div 
                      className="absolute inset-2 border-2 border-white/20 rounded-2xl pointer-events-none border-dashed"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20 + layerIndex * 5, repeat: Infinity, ease: "linear" }}
                    />
                    
                    <span className="font-mono text-white/50 text-6xl font-bold pointer-events-none mix-blend-overlay">
                      {TOTAL_LAYERS - layerIndex}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <p className="absolute bottom-24 left-1/2 -translate-x-1/2 font-mono text-zinc-400 tracking-widest uppercase text-sm pointer-events-none drop-shadow-md animate-pulse z-30 bg-black/50 px-4 py-2 rounded-full">
              Keep tapping
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
