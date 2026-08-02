"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#ef4444", "#10b981", "#3b82f6"]; // Red, Green, Blue

type Ball = {
   id: string; // Unique ID for Framer Motion layoutId
   colorIdx: number;
};

type TubeState = Ball[];

// Generate a random solvable board by shuffling backward from a solved state
const generateBoard = (): TubeState[] => {
   // 1. Solved state
   let board: TubeState[] = [
      Array.from({ length: 4 }).map((_, i) => ({ id: `r-${i}`, colorIdx: 0 })),
      Array.from({ length: 4 }).map((_, i) => ({ id: `g-${i}`, colorIdx: 1 })),
      Array.from({ length: 4 }).map((_, i) => ({ id: `b-${i}`, colorIdx: 2 })),
      []
   ];

   // 2. Shuffle backward
   const SHUFFLES = 60;
   for (let s = 0; s < SHUFFLES; s++) {
      // Pick a random non-empty tube
      const nonEmptyTubes = board.map((t, i) => ({ t, i })).filter(x => x.t.length > 0);
      if (nonEmptyTubes.length === 0) continue;
      
      const sourceObj = nonEmptyTubes[Math.floor(Math.random() * nonEmptyTubes.length)];
      const sourceIdx = sourceObj.i;
      
      // Pick a random non-full tube (different from source)
      const nonFullTubes = board.map((t, i) => ({ t, i })).filter(x => x.t.length < 4 && x.i !== sourceIdx);
      if (nonFullTubes.length === 0) continue;
      
      const destObj = nonFullTubes[Math.floor(Math.random() * nonFullTubes.length)];
      const destIdx = destObj.i;
      
      // Move (any move is valid backwards)
      const ball = board[sourceIdx][board[sourceIdx].length - 1];
      
      // Apply move
      board[sourceIdx] = board[sourceIdx].slice(0, -1);
      board[destIdx] = [...board[destIdx], ball];
   }

   return board;
};

export function ColorSorter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Violet 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f5f3ff"]; // Violet 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [tubes, setTubes] = useState<TubeState[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);

  useEffect(() => {
     setTubes(generateBoard());
  }, []);

  const handleTubeClick = (tubeIndex: number) => {
     if (gameState !== "playing") return;

     if (selectedTube === null) {
        // Select if not empty
        if (tubes[tubeIndex].length > 0) {
           setSelectedTube(tubeIndex);
        }
     } else {
        // Deselect if same
        if (selectedTube === tubeIndex) {
           setSelectedTube(null);
           return;
        }

        // Try to move
        const sourceTube = tubes[selectedTube];
        const destTube = tubes[tubeIndex];
        const ballToMove = sourceTube[sourceTube.length - 1];

        // Validation
        const isDestNotFull = destTube.length < 4;
        const isDestEmpty = destTube.length === 0;
        const isSameColor = !isDestEmpty && destTube[destTube.length - 1].colorIdx === ballToMove.colorIdx;

        if (isDestNotFull && (isDestEmpty || isSameColor)) {
           // Valid Move
           const newTubes = [...tubes];
           newTubes[selectedTube] = sourceTube.slice(0, -1);
           newTubes[tubeIndex] = [...destTube, ballToMove];
           
           setTubes(newTubes);
           setSelectedTube(null);
           checkWin(newTubes);
        } else {
           // Invalid move: shake the tube or just deselect
           setSelectedTube(null);
        }
     }
  };

  const checkWin = (currentTubes: TubeState[]) => {
     const isWon = currentTubes.every(tube => {
        if (tube.length === 0) return true;
        if (tube.length !== 4) return false;
        const firstColor = tube[0].colorIdx;
        return tube.every(ball => ball.colorIdx === firstColor);
     });

     if (isWon) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  };

  const restart = () => {
     setTubes(generateBoard());
     setSelectedTube(null);
     setGameState("playing");
  };

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
         className={`relative w-[320px] h-[480px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         <div className="w-full h-16 flex items-center justify-between px-6 shrink-0 z-10 border-b border-white/10">
            <span className="text-white font-black tracking-widest uppercase">Sort</span>
            <button 
               onClick={restart}
               className="text-slate-400 font-bold text-xs bg-white/10 px-3 py-1 rounded-md hover:bg-white/20 active:scale-95 transition-colors"
            >
               Restart
            </button>
         </div>

         {/* The Lab Area */}
         <div className="flex-1 w-full relative flex items-end justify-center pb-12 gap-2 px-4 z-10">
            
            {tubes.map((tube, i) => (
               <div 
                  key={i}
                  onClick={() => handleTubeClick(i)}
                  className={`relative w-14 h-[220px] rounded-b-full border-b-[6px] border-l-[3px] border-r-[3px] border-white/20 flex flex-col-reverse items-center justify-start pb-2 px-1 gap-1 cursor-pointer transition-colors ${selectedTube === i ? 'bg-white/10' : 'bg-transparent'}`}
                  style={{
                     // Lip of the tube
                     boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                  }}
               >
                  {/* Tube Lip */}
                  <div className="absolute top-[-4px] left-[-4px] right-[-4px] h-2 bg-white/20 rounded-full" />
                  
                  {tube.map((ball, ballIndex) => {
                     const isTop = ballIndex === tube.length - 1;
                     const isSelected = selectedTube === i && isTop;
                     
                     return (
                        <motion.div
                           layoutId={ball.id}
                           key={ball.id}
                           initial={false}
                           animate={{
                              y: isSelected ? -30 : 0
                           }}
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           className="w-10 h-10 rounded-full shrink-0 shadow-lg relative z-20"
                           style={{ 
                              backgroundColor: COLORS[ball.colorIdx],
                              boxShadow: `inset -5px -5px 15px rgba(0,0,0,0.5), inset 5px 5px 15px rgba(255,255,255,0.5)`
                           }}
                        />
                     );
                  })}
               </div>
            ))}
            
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Alchemy
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap a tube to move its top element. Sort all identical elements into their own tubes.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Begin Sorting
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(139,92,246,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Reaction Complete</div>
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
                  setTubes([
                     Array.from({ length: 4 }).map((_, i) => ({ id: `s-r-${i}`, colorIdx: 0 })),
                     Array.from({ length: 4 }).map((_, i) => ({ id: `s-g-${i}`, colorIdx: 1 })),
                     Array.from({ length: 4 }).map((_, i) => ({ id: `s-b-${i}`, colorIdx: 2 })),
                     []
                  ]);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Sort Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
