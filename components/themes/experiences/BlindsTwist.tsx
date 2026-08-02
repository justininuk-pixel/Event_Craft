"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function BlindsTwist({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"closed" | "opening" | "revealed">("closed");
  const [slatAngle, setSlatAngle] = useState(0); 

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playClick = useCallback((pitch: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const handleWandDrag = (event: any, info: any) => {
    if (phase === "revealed") return;
    if (phase === "closed") setPhase("opening");

    setSlatAngle(prev => {
      const delta = -info.delta.y * 0.5;
      const next = Math.max(0, Math.min(90, prev + delta));
      
      if (Math.floor(next) !== Math.floor(prev)) {
         playClick(400 + next * 5);
      }

      if (next >= 90 && prev < 90) {
        setTimeout(() => {
          setPhase("revealed");
          onComplete?.();
        }, 1000);
      }
      return next;
    });
  };

  const slats = Array.from({ length: 15 });

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex items-center justify-center" style={{ perspective: 1000 }}>
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : (slatAngle / 90),
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.95)',
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

      {/* Foreground Blinds Layer */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {slats.map((_, i) => (
              <motion.div 
                key={i}
                className="w-full flex-1 bg-zinc-200 border-b border-zinc-400 shadow-sm"
                style={{ 
                  transformOrigin: 'top',
                  transformStyle: 'preserve-3d',
                  rotateX: slatAngle,
                  boxShadow: `0 ${slatAngle / 10}px ${slatAngle / 5}px rgba(0,0,0,0.5)`
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Wand Control */}
      {phase !== "revealed" && (
        <motion.div
          className="absolute left-8 top-1/4 bottom-1/4 w-6 bg-zinc-300 rounded-full border border-zinc-400 shadow-xl z-30 flex flex-col items-center justify-center cursor-ns-resize pointer-events-auto"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          onDrag={handleWandDrag}
          onPointerDown={initAudio}
          style={{
             backgroundImage: 'linear-gradient(to right, #e4e4e7, #ffffff, #a1a1aa)'
          }}
        >
          {/* Ridges on the wand */}
          <div className="w-full flex-1 flex flex-col justify-around py-4 opacity-50">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="w-full h-[2px] bg-zinc-500" />
            ))}
          </div>
          
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-mono font-bold text-zinc-300 uppercase whitespace-nowrap opacity-70 drop-shadow-md">
            Swipe Up/Down to twist
          </div>
        </motion.div>
      )}
      
    </div>
  );
}
