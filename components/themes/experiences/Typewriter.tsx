"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function Typewriter({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const fullText = config.body || "No text provided.";
  const CHARS_PER_TAP = 2;

  const playClack = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Noise burst synth for mechanical click
      osc.type = "square";
      osc.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05);

      filter.type = "bandpass";
      filter.frequency.value = 1000 + Math.random() * 500;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Ignore audio errors on some strict mobile browsers
    }
  }, []);

  const handleInput = useCallback(() => {
    if (isRevealed) return;
    
    playClack();
    
    setVisibleCount(prev => {
      const next = prev + CHARS_PER_TAP;
      if (next >= fullText.length) {
        setIsRevealed(true);
        setTimeout(() => onComplete?.(), 1000);
        return fullText.length;
      }
      return next;
    });
  }, [isRevealed, fullText.length, onComplete, playClack]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore meta keys to not disrupt normal browser usage too much if they try to do something else
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      handleInput();
    };
    
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleInput]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[#f4f1ea] text-black cursor-pointer touch-none select-none p-8 sm:p-12 md:p-16 flex flex-col font-mono"
      onPointerDown={handleInput}
    >
      
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col relative z-10">
        
        {/* Typewriter Output */}
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-lg sm:text-xl md:text-2xl leading-relaxed tracking-tight" style={{ color: palette.primary as string }}>
          {fullText.slice(0, visibleCount)}
          {!isRevealed && (
            <motion.span 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[10px] h-6 bg-black ml-1 align-middle"
              style={{ backgroundColor: palette.accent as string }}
            />
          )}
        </div>

        {/* Final Reveal Image/Title */}
        {isRevealed && (
          <motion.div 
            className="mt-8 border-t border-black/10 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {config.title && (
              <h1 className="text-3xl font-heading mb-6">{config.title}</h1>
            )}
            {config.mediaUrl && (
              <img 
                src={config.mediaUrl} 
                alt="Revealed" 
                className="w-full max-w-md h-auto object-cover shadow-lg rounded-sm sepia-[0.3]"
              />
            )}
          </motion.div>
        )}

      </div>

      {visibleCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <p className="text-black/20 text-2xl animate-pulse font-heading">
            Tap or Type...
          </p>
        </div>
      )}

    </div>
  );
}
