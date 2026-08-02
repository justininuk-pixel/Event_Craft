"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const BINGO_STRINGS = [
  "Someone says 'Synergy'",
  "Dog barks in background",
  "You're on mute!",
  "Awkward silence",
  "Can you see my screen?",
  "Let's take this offline",
  "Sorry, I was on mute",
  "Hard stop at :30",
  "Circling back",
  "Loud typing",
  "Child walks into frame",
  "Echo/feedback",
  "Can everyone hear me?",
  "Next slide please",
  "Bandwidth issues",
  "I'll give you time back",
  "Low hanging fruit",
  "Pivot",
  "Align on this",
  "Unprecedented times",
  "Deep dive",
  "Touch base",
  "Ping me later",
  "At the end of the day"
];

const getInitialBoard = () => {
  const board = [...BINGO_STRINGS];
  board.splice(12, 0, "FREE SPACE");
  return board;
};

export function SharedBingoBoard({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"playing" | "bingo" | "revealed">("playing");
  const [toggled, setToggled] = useState<boolean[]>(() => {
    const init = Array(25).fill(false);
    init[12] = true;
    return init;
  });
  const [board] = useState<string[]>(getInitialBoard);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playDab = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playFanfare = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4);
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }, []);

  const checkForBingo = (newToggled: boolean[]) => {
    const lines = [
      [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
      [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
      [0,6,12,18,24], [4,8,12,16,20]
    ];

    for (const line of lines) {
      if (line.every(idx => newToggled[idx])) {
        return true;
      }
    }
    return false;
  };

  const handleToggle = (index: number) => {
    if (phase !== "playing") return;
    if (index === 12) return; 

    initAudio();
    playDab();

    setToggled(prev => {
      const next = [...prev];
      next[index] = !next[index];
      
      if (checkForBingo(next)) {
        setPhase("bingo");
        playFanfare();
      }
      
      return next;
    });
  };

  const handleBingoClick = () => {
    setPhase("revealed");
    onComplete?.();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-orange-100 touch-none select-none flex flex-col items-center justify-center font-sans">
      
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
            className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-full"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Bingo UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-2 py-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            onPointerDown={initAudio}
          >
            
            <h1 className="text-4xl md:text-5xl font-black text-orange-600 mb-6 tracking-widest drop-shadow-sm">BINGO</h1>

            {/* The Grid */}
            <div className={`grid grid-cols-5 gap-1 md:gap-2 w-full max-w-lg bg-orange-800 p-2 rounded-xl shadow-xl transition-opacity duration-500 ${phase === "bingo" ? 'opacity-30' : 'opacity-100'}`}>
              {board.map((text, i) => {
                const isToggled = toggled[i];
                const isFree = i === 12;
                
                return (
                  <motion.div
                    key={i}
                    className={`relative w-full aspect-square flex items-center justify-center p-1 rounded cursor-pointer overflow-hidden
                      ${isToggled ? 'bg-orange-200' : 'bg-orange-50'}
                    `}
                    onPointerDown={() => handleToggle(i)}
                    whileTap={{ scale: isFree ? 1 : 0.95 }}
                  >
                    <span className={`text-[9px] md:text-xs leading-tight text-center font-bold select-none ${isToggled ? 'text-orange-900' : 'text-orange-700'}`}>
                      {text}
                    </span>
                    
                    {/* The Dabber Mark */}
                    <AnimatePresence>
                      {isToggled && (
                        <motion.div 
                          className="absolute inset-0 m-auto w-4/5 h-4/5 bg-red-500/60 rounded-full mix-blend-multiply"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </div>

            {/* BINGO Button Overlay */}
            <AnimatePresence>
              {phase === "bingo" && (
                <motion.button
                  className="absolute z-50 px-12 py-6 bg-red-600 text-white font-black text-5xl md:text-7xl rounded-full shadow-[0_10px_0_#991b1b,0_20px_30px_rgba(0,0,0,0.5)] active:shadow-[0_0px_0_#991b1b,0_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[10px] transition-all tracking-widest border-4 border-white"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [-10, 5, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  onPointerDown={handleBingoClick}
                >
                  BINGO!
                </motion.button>
              )}
            </AnimatePresence>
            
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
