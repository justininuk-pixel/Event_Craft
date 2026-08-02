"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function GroupFundraiser({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"filling" | "full" | "revealed">("filling");
  const [progress, setProgress] = useState(0); 

  const progressRef = useRef(0);
  const phaseRef = useRef(phase);

  useEffect(() => {
    progressRef.current = progress;
    phaseRef.current = phase;
  }, [progress, phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playDrop = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const basePitch = 300 + (progressRef.current * 5);
    osc.frequency.setValueAtTime(basePitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(basePitch + 200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playWin = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); 
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); 
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3); 
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }, []);

  const checkWinCondition = (newProgress: number) => {
    if (phaseRef.current !== "filling") return;

    if (newProgress >= 100) {
      setPhase("full");
      playWin();
      setTimeout(() => {
        setPhase("revealed");
        onComplete?.();
      }, 2000);
    }
  };

  const setScore = setProgress; 

  const handleContribute = () => {
    if (phase !== "filling") return;
    initAudio();
    playDrop();
    
    setScore(prev => {
      const next = prev + 3;
      checkWinCondition(next);
      return next;
    });
  };

  useEffect(() => {
    if (phase !== "filling") return;

    const interval = setInterval(() => {
      if (phaseRef.current !== "filling") return;
      
      const randomForce = Math.random() * 0.8; 
      
      setScore(prev => {
        const next = Math.min(100, prev + randomForce);
        if (next >= 100) {
          checkWinCondition(next);
        }
        return next;
      });

    }, 200);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex flex-col items-center justify-center">
      
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

      {/* Foreground Thermometer UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-between pb-12 pt-24"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            
            {/* The Thermometer Graphic */}
            <div className="flex-1 w-24 relative flex flex-col items-center justify-end mb-8">
              {/* Glass Tube */}
              <div className="absolute top-0 bottom-12 w-8 bg-black/40 rounded-t-full border-4 border-b-0 border-white/20 shadow-inner overflow-hidden z-10">
                {/* Mercury Fill */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-400 origin-bottom"
                  style={{ height: `${progress}%` }}
                  transition={{ type: "tween", ease: "linear", duration: 0.2 }}
                />
                
                {/* Measurement Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-30 z-20">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="w-1/2 h-[2px] bg-white ml-auto" />
                  ))}
                </div>
              </div>

              {/* Glass Bulb */}
              <div className="absolute bottom-0 w-24 h-24 bg-black/40 rounded-full border-4 border-white/20 shadow-inner flex items-center justify-center z-20 overflow-hidden">
                <div className="w-[88px] h-[88px] rounded-full bg-red-600 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                   <div className="absolute top-2 right-4 w-4 h-4 bg-white/40 rounded-full blur-[2px]" />
                </div>
              </div>
            </div>

            {/* Contribute Button */}
            <motion.button
              className="w-64 py-4 rounded-full font-heading font-black tracking-widest text-xl text-white shadow-[0_10px_0_#991b1b,0_15px_20px_rgba(0,0,0,0.5)] active:shadow-[0_0px_0_#991b1b,0_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[10px] transition-all bg-red-500"
              onPointerDown={handleContribute}
              disabled={phase !== "filling"}
              animate={{ 
                 scale: phase === "full" ? 0 : 1,
                 opacity: phase === "full" ? 0 : 1
              }}
            >
              CONTRIBUTE
            </motion.button>
            
            <motion.div 
              className="mt-8 font-mono text-white/50 tracking-widest text-sm"
              animate={{ opacity: phase === "full" ? 0 : 1 }}
            >
              GOAL: {Math.floor(progress)}%
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
