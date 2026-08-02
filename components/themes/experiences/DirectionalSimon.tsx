"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";
const DIRS: Direction[] = ["up", "down", "left", "right"];
const SEQUENCE_LENGTH = 5;

export function DirectionalSimon({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // Rose 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff1f2"]; // Rose 50

  const [gameState, setGameState] = useState<"start" | "showingSequence" | "awaitingInput" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeDir, setActiveDir] = useState<Direction | null>(null);

  const startSequence = () => {
     // Generate random sequence
     const seq = Array.from({ length: SEQUENCE_LENGTH }, () => DIRS[Math.floor(Math.random() * DIRS.length)]);
     setSequence(seq);
     setGameState("showingSequence");
     setInputIndex(0);
     setActiveDir(null);

     // Flash sequence
     let step = 0;
     const flashInterval = setInterval(() => {
        if (step >= seq.length) {
           clearInterval(flashInterval);
           setActiveDir(null);
           setGameState("awaitingInput");
           return;
        }

        // Show direction
        setActiveDir(seq[step]);
        
        // Hide direction slightly before showing next
        setTimeout(() => {
           setActiveDir(null);
        }, 400);

        step++;
     }, 800);
  };

  const handleDragEnd = (e: any, info: any) => {
     if (gameState !== "awaitingInput") return;
     
     const dx = info.offset.x;
     const dy = info.offset.y;
     
     // Must be a significant swipe
     if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

     let swipeDir: Direction;
     if (Math.abs(dx) > Math.abs(dy)) {
        swipeDir = dx > 0 ? "right" : "left";
     } else {
        swipeDir = dy > 0 ? "down" : "up";
     }

     // Visual feedback for the swipe
     setActiveDir(swipeDir);
     setTimeout(() => setActiveDir(null), 300);

     if (swipeDir === sequence[inputIndex]) {
        if (inputIndex + 1 === sequence.length) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           setInputIndex(prev => prev + 1);
        }
     } else {
        setGameState("lost");
        setTimeout(() => setGameState("start"), 1500);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Arrow rendering logic
  const getArrowTransform = (dir: Direction) => {
     switch (dir) {
        case "up": return "rotate(-90deg)";
        case "right": return "rotate(0deg)";
        case "down": return "rotate(90deg)";
        case "left": return "rotate(180deg)";
     }
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-[12px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* HUD */}
         <div className="absolute top-8 text-center w-full z-10 pointer-events-none">
            {gameState === "showingSequence" && (
               <div className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Memorize</div>
            )}
            {gameState === "awaitingInput" && (
               <div className="text-white font-bold uppercase tracking-widest text-sm">Your Turn ({inputIndex}/{SEQUENCE_LENGTH})</div>
            )}
            {gameState === "lost" && (
               <div className="text-red-500 font-black uppercase tracking-widest text-xl animate-bounce">Wrong!</div>
            )}
         </div>

         {/* Center Display */}
         <div className="relative w-48 h-48 rounded-full bg-slate-800 border-8 border-slate-700 flex items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
            <AnimatePresence mode="wait">
               {activeDir && (
                  <motion.div
                     key={activeDir}
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 1.5, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="absolute w-24 h-24 flex items-center justify-center"
                     style={{ transform: getArrowTransform(activeDir) }}
                  >
                     <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: primaryColor, filter: `drop-shadow(0 0 10px ${primaryColor})` }}>
                        <path d="M12 4l-8 8h6v8h4v-8h6z" />
                     </svg>
                  </motion.div>
               )}
            </AnimatePresence>
            
            {!activeDir && gameState === "awaitingInput" && (
               <div className="text-slate-600 font-black uppercase tracking-widest text-xs animate-pulse">Swipe</div>
            )}
         </div>

         {/* Full Screen Swipe Catcher */}
         {gameState === "awaitingInput" && (
            <motion.div 
               className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
               drag
               dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
               dragElastic={1}
               onDragEnd={handleDragEnd}
               whileDrag={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            />
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Swipe Simon
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Memorize the arrow sequence.<br/>Repeat it with swipes.
                  </div>
                  <button 
                     onClick={startSequence}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(244,63,94,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Sequence Accepted</div>
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
      {mode === "editor-preview" && (gameState === "showingSequence" || gameState === "awaitingInput") && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
