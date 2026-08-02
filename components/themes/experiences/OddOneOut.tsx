"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const ROUNDS = 5;
const TIME_PER_ROUND = 5000; // ms

// Level definitions (Normal, Odd)
const LEVELS = [
   { normal: "🍎", odd: "🍓" }, // Easy
   { normal: "😃", odd: "😁" }, // Easy
   { normal: "🐻", odd: "🧸" }, // Medium
   { normal: "O", odd: "0" },   // Hard
   { normal: "🧐", odd: "🥸" }, // Hard
];

type GridItem = {
   id: number;
   content: string;
   isOdd: boolean;
};

export function OddOneOut({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef2f2"]; // Red 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [round, setRound] = useState(1);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(100); // Percentage
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const startRound = (r: number) => {
     setRound(r);
     setTimeLeft(100);
     
     const levelIdx = Math.min(r - 1, LEVELS.length - 1);
     const def = LEVELS[levelIdx];
     
     const newGrid: GridItem[] = [
        { id: 0, content: def.normal, isOdd: false },
        { id: 1, content: def.normal, isOdd: false },
        { id: 2, content: def.normal, isOdd: false },
        { id: 3, content: def.odd, isOdd: true },
     ];
     
     // Shuffle
     for (let i = newGrid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newGrid[i], newGrid[j]] = [newGrid[j], newGrid[i]];
     }
     
     // Re-assign IDs for Framer Motion layout animations if needed, but simple array index is fine here.
     setGrid(newGrid);
     
     // Start timer
     startTimeRef.current = Date.now();
     
     const updateTimer = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 100 - (elapsed / TIME_PER_ROUND) * 100);
        setTimeLeft(remaining);
        
        if (remaining > 0) {
           requestRef.current = requestAnimationFrame(updateTimer);
        } else {
           handleTimeout();
        }
     };
     
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
     requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleTimeout = () => {
     setGameState("lost");
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const startGame = () => {
     setGameState("playing");
     startRound(1);
  };

  const handleTap = (isOdd: boolean) => {
     if (gameState !== "playing") return;
     
     if (isOdd) {
        // Success
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        
        if (round >= ROUNDS) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           startRound(round + 1);
        }
     } else {
        // Failure
        setGameState("lost");
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     }
  };

  useEffect(() => {
     return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     };
  }, []);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Top HUD */}
         <div className="w-full h-16 flex items-center justify-between px-6 bg-slate-800 z-20 shrink-0">
            <div className="flex flex-col">
               <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Round</span>
               <span className="text-white font-black text-xl leading-none">{round} <span className="text-sm text-slate-500">/ {ROUNDS}</span></span>
            </div>
            
            {/* Timer Bar */}
            <div className="w-32 h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
               <motion.div 
                  className="h-full"
                  style={{ width: `${timeLeft}%`, backgroundColor: primaryColor }}
                  initial={{ width: "100%" }}
                  animate={{ width: `${timeLeft}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
               />
            </div>
         </div>

         {/* The Grid */}
         <div className="flex-1 w-full bg-slate-900 p-4 relative z-10 flex flex-col justify-center items-center">
            
            <div className="w-full aspect-square grid grid-cols-2 grid-rows-2 gap-4">
               <AnimatePresence mode="popLayout">
                  {grid.map((item, idx) => (
                     <motion.div
                        key={`${round}-${idx}`} // Force re-render/animation on round change
                        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center cursor-pointer active:scale-95"
                        onClick={() => handleTap(item.isOdd)}
                     >
                        <span className="text-6xl md:text-7xl pointer-events-none drop-shadow-sm font-sans">{item.content}</span>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>

         </div>

         {/* Start/Loss Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Odd One
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Spot the single different item.<br/>You have 5 seconds per round.
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Game
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-slate-300 font-black text-5xl uppercase tracking-widest drop-shadow-sm mb-2 text-center" style={{ color: primaryColor }}>
                     Oops
                  </div>
                  <div className="text-slate-400 font-bold mb-8">You missed it!</div>
                  <button 
                     onClick={startGame}
                     className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(239,68,68,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Eagle Eye</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  if (requestRef.current) cancelAnimationFrame(requestRef.current);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Spot Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
