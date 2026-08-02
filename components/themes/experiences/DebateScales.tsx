"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function DebateScales({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"voting" | "revealed">("voting");
  const [leftWeight, setLeftWeight] = useState(0);
  const [rightWeight, setRightWeight] = useState(0);
  const [userVoted, setUserVoted] = useState(false);

  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playDropSound = useCallback((side: "left" | "right") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    
    osc.type = "square";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    if (pan) {
      pan.pan.value = side === "left" ? -0.7 : 0.7;
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(ctx.destination);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
    }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const playWin = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); 
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.4); 
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }, []);

  const triggerWin = useCallback(() => {
    playWin();
    setTimeout(() => {
      setPhase("revealed");
      onComplete?.();
    }, 2000);
  }, [playWin, onComplete]);

  const handleDragEnd = (event: any, info: any) => {
    if (userVoted || phase !== "voting") return;

    const dropX = info.offset.x;
    
    if (dropX < -40) {
      setLeftWeight(prev => prev + 15);
      setUserVoted(true);
      playDropSound("left");
      triggerWin();
    } else if (dropX > 40) {
      setRightWeight(prev => prev + 15);
      setUserVoted(true);
      playDropSound("right");
      triggerWin();
    }
  };

  useEffect(() => {
    if (phase !== "voting" || userVoted) return;

    const interval = setInterval(() => {
      if (phaseRef.current !== "voting") return;
      
      if (Math.random() > 0.5) {
        setLeftWeight(prev => prev + Math.random() * 2);
      } else {
        setRightWeight(prev => prev + Math.random() * 2);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [phase, userVoted]);

  const rawDiff = rightWeight - leftWeight;
  const targetRotation = Math.max(-25, Math.min(25, rawDiff * 0.5));

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fafafa] touch-none select-none flex flex-col items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Scales UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            onPointerDown={initAudio}
          >
            
            <h2 className="absolute top-16 text-3xl md:text-4xl font-heading text-zinc-800 text-center px-8">
              Cast your vote.
            </h2>

            {/* The Seesaw */}
            <div className="relative w-full max-w-md h-48 mt-12 flex items-end justify-center">
              
              {/* The Fulcrum Base */}
              <div className="w-12 h-16 bg-zinc-800 absolute bottom-0 z-10 clip-triangle" 
                   style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} 
              />

              {/* The Plank */}
              <motion.div 
                className="w-full h-4 bg-[#b58b5e] absolute bottom-16 rounded-full border-b-4 border-[#8c6742] shadow-xl origin-center z-20"
                animate={{ rotate: targetRotation }}
                transition={{ type: "spring", stiffness: 50, damping: 10 }}
              >
                 {/* Left option text */}
                 <div className="absolute -top-12 left-4 px-4 py-2 bg-blue-500 rounded-lg text-white font-bold shadow-md origin-bottom transform -rotate-12">
                   Option A
                 </div>
                 {/* Right option text */}
                 <div className="absolute -top-12 right-4 px-4 py-2 bg-red-500 rounded-lg text-white font-bold shadow-md origin-bottom transform rotate-12">
                   Option B
                 </div>

                 {/* Left accumulated weight visual (abstract) */}
                 <div className="absolute top-4 left-8 flex gap-1 items-start flex-wrap-reverse w-24">
                   {Array.from({ length: Math.min(20, Math.floor(leftWeight / 2)) }).map((_, i) => (
                     <div key={i} className="w-4 h-4 bg-zinc-400 rounded-sm shadow-sm" />
                   ))}
                 </div>

                 {/* Right accumulated weight visual (abstract) */}
                 <div className="absolute top-4 right-8 flex gap-1 items-start flex-wrap-reverse w-24 justify-end">
                   {Array.from({ length: Math.min(20, Math.floor(rightWeight / 2)) }).map((_, i) => (
                     <div key={i} className="w-4 h-4 bg-zinc-400 rounded-sm shadow-sm" />
                   ))}
                 </div>
              </motion.div>

            </div>

            {/* Draggable Weight */}
            <AnimatePresence>
              {!userVoted && (
                <motion.div 
                  className="absolute bottom-24 w-16 h-16 bg-zinc-800 text-white font-bold flex items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing z-50 border-4 border-zinc-700"
                  drag
                  dragSnapToOrigin
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  10lb
                </motion.div>
              )}
            </AnimatePresence>
            
            {!userVoted && (
              <p className="absolute bottom-8 font-mono text-zinc-500 text-sm animate-pulse tracking-widest uppercase">
                Drag weight to a side
              </p>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
