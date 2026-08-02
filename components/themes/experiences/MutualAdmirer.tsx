"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MutualAdmirer({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"decision" | "waiting" | "matched" | "revealed">("decision");
  const [receiverStatus, setReceiverStatus] = useState<"unknown" | "yes">("unknown");
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playSound = useCallback((type: "click" | "match") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      const freqs = [440, 554.37, 659.25, 880]; 
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1 + (i*0.05));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.0);
      });
    }
  }, []);

  const handleYes = () => {
    if (phase !== "decision") return;
    initAudio();
    playSound("click");
    setReceiverStatus("yes");
    setPhase("waiting");

    setTimeout(() => {
       playSound("match");
       setPhase("matched");
       
       setTimeout(() => {
          setPhase("revealed");
          if (onComplete) onComplete();
       }, 3000);
    }, 4000);
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-rose-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/40 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-rose-900/50">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-full border-4 border-rose-400"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-rose-100 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-rose-950/80 backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
          >
            
            {phase === "decision" && (
              <motion.div 
                className="flex flex-col items-center max-w-sm w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-6xl mb-8 animate-pulse text-rose-500">🔒</div>
                <h2 className="text-3xl font-heading text-rose-100 mb-8 text-center leading-snug">
                  Do you have feelings for the sender?
                </h2>
                
                <button
                  onPointerDown={handleYes}
                  className="w-full py-6 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 active:scale-95 transition-all font-black text-white text-2xl tracking-widest shadow-[0_0_40px_rgba(225,29,72,0.4)] border border-rose-400"
                >
                  YES
                </button>
                
                <p className="mt-8 text-rose-300/50 text-sm text-center">
                  This is double-blind. They won't know you pressed YES unless they also pressed YES.
                </p>
              </motion.div>
            )}

            {phase === "waiting" && (
              <motion.div 
                className="flex flex-col items-center max-w-sm w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
              >
                <div className="w-24 h-24 border-4 border-rose-500 border-t-rose-200 rounded-full animate-spin mb-8" />
                <h2 className="text-2xl font-heading text-rose-200 mb-4 text-center animate-pulse">
                  Waiting for sender...
                </h2>
                <p className="text-rose-400/80 text-center">
                  Your choice is locked in. If they also feel the same, the content will unlock.
                </p>
              </motion.div>
            )}

            {phase === "matched" && (
              <motion.div 
                className="flex flex-col items-center max-w-sm w-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
              >
                <motion.div 
                  className="text-9xl mb-8 drop-shadow-[0_0_30px_rgba(244,63,94,1)]"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 5 }}
                >
                  💖
                </motion.div>
                <h2 className="text-4xl font-heading text-white mb-4 text-center drop-shadow-md">
                  IT'S A MATCH!
                </h2>
                <p className="text-rose-200 text-center text-lg">
                  Unlocking secret content...
                </p>
              </motion.div>
            )}

            {phase !== "matched" && (
              <button
                onClick={handleReveal}
                className="absolute bottom-12 text-rose-500/50 hover:text-rose-300 transition-colors text-xs font-bold tracking-widest border border-rose-900/50 px-4 py-2 rounded-full"
              >
                SKIP / REVEAL CONTENT
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
