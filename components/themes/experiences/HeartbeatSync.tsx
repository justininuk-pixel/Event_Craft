"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export function HeartbeatSync({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [hits, setHits] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const BPM = 60;
  const MS_PER_BEAT = 60000 / BPM;
  const TOLERANCE = 250;
  const REQUIRED_HITS = 4;

  const playThump = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(60, ctx.currentTime); // Low thump
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Ignore
    }
  }, []);

  // Visual pulse loop
  useEffect(() => {
    if (isRevealed) return;

    let reqId: number;
    const loop = () => {
      const now = performance.now();
      const cyclePos = now % MS_PER_BEAT;
      
      // Visual pulse trigger right on the beat
      if (cyclePos < 50 && !pulse) {
        setPulse(true);
        setTimeout(() => setPulse(false), 150);
        // Play thump automatically.
        playThump();
      }
      
      reqId = requestAnimationFrame(loop);
    };
    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [pulse, isRevealed, playThump, MS_PER_BEAT]);

  const handleTap = () => {
    if (isRevealed) return;

    const now = performance.now();
    const cyclePos = now % MS_PER_BEAT;
    
    // Distance from the nearest beat
    const distToBeat = Math.min(cyclePos, MS_PER_BEAT - cyclePos);

    if (distToBeat <= TOLERANCE) {
      // Hit!
      setFeedback("hit");
      setHits(prev => {
        const next = prev + 1;
        if (next >= REQUIRED_HITS) {
          setIsRevealed(true);
          setTimeout(() => onComplete?.(), 1000);
        }
        return next;
      });
    } else {
      // Miss!
      setFeedback("miss");
      setHits(0); // Reset
    }

    setTimeout(() => setFeedback(null), 300);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex items-center justify-center p-8"
      onPointerDown={handleTap}
    >
      
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
            className="w-48 h-48 object-cover rounded-full shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Heart Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1 }}
          >
            
            <p className="text-white/40 font-heading mb-16 tracking-widest uppercase text-sm">
              Tap to the rhythm
            </p>

            <motion.div
              animate={{
                scale: pulse ? 1.2 : 1,
                opacity: pulse ? 1 : 0.7,
                x: feedback === "miss" ? [0, -10, 10, -10, 10, 0] : 0, // shake on miss
              }}
              transition={{ duration: feedback === "miss" ? 0.3 : 0.1 }}
              className="relative"
            >
              <Heart 
                size={96} 
                className="text-red-600 transition-colors duration-300" 
                style={{ 
                  fill: feedback === "hit" ? "#dc2626" : "transparent",
                  filter: `drop-shadow(0 0 ${hits * 10 + 10}px rgba(220, 38, 38, 0.8))`
                }}
              />
              
              {/* Inner glow that grows with hits */}
              <div 
                className="absolute inset-0 rounded-full bg-red-500 blur-2xl -z-10 transition-all duration-300"
                style={{ opacity: hits * 0.2 }}
              />
            </motion.div>

            {/* Hit/Miss visual indicator */}
            <div className="h-8 mt-12 flex items-center justify-center">
              {feedback === "hit" && <span className="text-green-400 font-mono font-bold animate-pulse text-xl tracking-widest">+1</span>}
              {feedback === "miss" && <span className="text-red-500 font-mono animate-pulse">Miss</span>}
            </div>

            {/* Progress dots */}
            <div className="flex gap-4 mt-8">
              {Array.from({ length: REQUIRED_HITS }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${i < hits ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white/10'}`} 
                />
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
