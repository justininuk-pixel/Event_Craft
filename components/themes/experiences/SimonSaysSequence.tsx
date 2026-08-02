"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function SimonSaysSequence({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"idle" | "demonstrating" | "waiting_for_input" | "success" | "failure">("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playTone = useCallback((index: number, type: 'success' | 'fail' | 'normal' = 'normal') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const freqs = [392.00, 329.63, 261.63, 196.00];
    
    if (type === 'fail') {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      return;
    }

    if (type === 'success') {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      return;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(freqs[index], ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, []);

  useEffect(() => {
    const newSeq = Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 4));
    setSequence(newSeq);
  }, []);

  const playSequence = useCallback(async () => {
    setPhase("demonstrating");
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < sequence.length; i++) {
      setActiveQuadrant(sequence[i]);
      playTone(sequence[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveQuadrant(null);
      await new Promise(r => setTimeout(r, 150));
    }

    setPhase("waiting_for_input");
  }, [sequence, playTone]);

  const handleStart = () => {
    initAudio();
    playSequence();
  };

  const handleQuadrantTap = (index: number) => {
    if (phase !== "waiting_for_input") return;
    initAudio();

    setActiveQuadrant(index);
    playTone(index);
    setTimeout(() => setActiveQuadrant(null), 200);

    const newInput = [...playerInput, index];
    setPlayerInput(newInput);

    const isCorrect = newInput.every((val, i) => val === sequence[i]);
    
    if (!isCorrect) {
      setPhase("failure");
      playTone(0, 'fail');
      setTimeout(() => {
        setPlayerInput([]);
        playSequence();
      }, 1500);
      return;
    }

    if (newInput.length === sequence.length) {
      setPhase("success");
      playTone(0, 'success');
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  };

  const quadrantColors = [
    { base: 'bg-green-700', active: 'bg-green-400 shadow-[0_0_30px_#4ade80]' },
    { base: 'bg-red-700', active: 'bg-red-400 shadow-[0_0_30px_#f87171]' },
    { base: 'bg-yellow-600', active: 'bg-yellow-300 shadow-[0_0_30px_#fde047]' },
    { base: 'bg-blue-700', active: 'bg-blue-400 shadow-[0_0_30px_#60a5fa]' },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "success" ? 1 : 0,
          transform: phase === "success" ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Simon Grid */}
      <AnimatePresence>
        {phase !== "success" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
          >
            
            <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-md aspect-square rounded-full p-4 bg-zinc-900 shadow-2xl border-8 border-zinc-800">
              {quadrantColors.map((color, i) => (
                <div 
                  key={i}
                  className={`
                    w-full h-full cursor-pointer transition-all duration-75 border border-white/10
                    ${activeQuadrant === i ? color.active : color.base}
                    ${i === 0 ? 'rounded-tl-full' : i === 1 ? 'rounded-tr-full' : i === 2 ? 'rounded-bl-full' : 'rounded-br-full'}
                  `}
                  onPointerDown={() => handleQuadrantTap(i)}
                />
              ))}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-zinc-950 rounded-full border-4 border-zinc-800 flex items-center justify-center shadow-inner">
              {phase === "idle" && (
                <button 
                  onClick={handleStart}
                  className="font-mono text-zinc-400 tracking-widest uppercase text-xs py-2 px-4 rounded-full bg-zinc-800 active:bg-zinc-700"
                >
                  Start
                </button>
              )}
              {phase === "demonstrating" && <div className="font-mono text-blue-400 text-xs tracking-widest uppercase animate-pulse">Watch</div>}
              {phase === "waiting_for_input" && <div className="font-mono text-green-400 text-xs tracking-widest uppercase animate-pulse">Play</div>}
              {phase === "failure" && <div className="font-mono text-red-500 text-xs tracking-widest uppercase font-bold animate-bounce">Error</div>}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
