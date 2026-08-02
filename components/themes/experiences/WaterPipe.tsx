"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type PipeType = "straight" | "L" | "T" | "cross";
type Pipe = {
   type: PipeType;
   rot: number; // 0, 1, 2, 3 (0=0deg, 1=90deg, 2=180deg, 3=270deg)
};

// Represents openings for rot=0. [Top, Right, Bottom, Left]
const PIPE_OPENINGS: Record<PipeType, boolean[]> = {
   "straight": [true, false, true, false],
   "L": [true, true, false, false],
   "T": [true, true, false, true],
   "cross": [true, true, true, true],
};

const GRID_SIZE = 5;

// Hardcoded solvable 5x5 pipe layout
// Source is at (0, 2)
// Drain is at (4, 2)
const SOLVABLE_LAYOUT: PipeType[] = [
   "L", "straight", "straight", "L", "straight",
   "straight", "T", "L", "cross", "L",
   "T", "straight", "cross", "T", "straight",
   "L", "L", "T", "straight", "T",
   "straight", "straight", "straight", "straight", "straight"
];

// Let's make a simpler explicit layout that we know connects top-center to bottom-center.
// Top-center is idx 2. Bottom-center is idx 22.
const PUZZLE: PipeType[] = [
   "L", "L", "straight", "L", "L",       // 0  1  2  3  4
   "straight", "L", "L", "L", "straight",// 5  6  7  8  9
   "L", "T", "cross", "T", "L",          // 10 11 12 13 14
   "straight", "L", "straight", "L", "straight", // 15 16 17 18 19
   "L", "L", "straight", "L", "L",       // 20 21 22 23 24
];

const getOpenings = (type: PipeType, rot: number) => {
   const base = PIPE_OPENINGS[type];
   const rotated = [false, false, false, false];
   for (let i = 0; i < 4; i++) {
      rotated[(i + rot) % 4] = base[i];
   }
   return rotated;
};

export function WaterPipe({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#eff6ff"]; // Blue 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [grid, setGrid] = useState<Pipe[]>([]);
  const [connected, setConnected] = useState<Set<number>>(new Set());

  // Initialize
  useEffect(() => {
     const initGrid = PUZZLE.map(type => ({
        type,
        rot: Math.floor(Math.random() * 4)
     }));
     setGrid(initGrid);
  }, []);

  const evaluateConnections = (currentGrid: Pipe[]) => {
     const newConnected = new Set<number>();
     const queue = [2]; // Source is always at index 2 (Top Center)
     
     // Check if source pipe even points up
     const sourceOpenings = getOpenings(currentGrid[2].type, currentGrid[2].rot);
     if (sourceOpenings[0]) {
        newConnected.add(2);
     } else {
        return newConnected;
     }

     const visited = new Set<number>([2]);

     while (queue.length > 0) {
        const curr = queue.shift()!;
        const r = Math.floor(curr / GRID_SIZE);
        const c = curr % GRID_SIZE;
        const currOpenings = getOpenings(currentGrid[curr].type, currentGrid[curr].rot);

        // Neighbors: 0=Top, 1=Right, 2=Bottom, 3=Left
        const neighbors = [
           { idx: curr - GRID_SIZE, r: r - 1, c: c, myDir: 0, theirDir: 2 },
           { idx: curr + 1, r: r, c: c + 1, myDir: 1, theirDir: 3 },
           { idx: curr + GRID_SIZE, r: r + 1, c: c, myDir: 2, theirDir: 0 },
           { idx: curr - 1, r: r, c: c - 1, myDir: 3, theirDir: 1 },
        ];

        for (const n of neighbors) {
           if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
              if (!visited.has(n.idx)) {
                 if (currOpenings[n.myDir]) {
                    const theirOpenings = getOpenings(currentGrid[n.idx].type, currentGrid[n.idx].rot);
                    if (theirOpenings[n.theirDir]) {
                       visited.add(n.idx);
                       newConnected.add(n.idx);
                       queue.push(n.idx);
                    }
                 }
              }
           }
        }
     }
     
     return newConnected;
  };

  const handleTileTap = (index: number) => {
     if (gameState !== "playing") return;

     const newGrid = [...grid];
     newGrid[index].rot = (newGrid[index].rot + 1) % 4;
     setGrid(newGrid);

     const newConnected = evaluateConnections(newGrid);
     setConnected(newConnected);

     // Win condition: Connected set includes the drain (index 22) and the drain points down.
     if (newConnected.has(22)) {
        const drainOpenings = getOpenings(newGrid[22].type, newGrid[22].rot);
        if (drainOpenings[2]) { // drain points down
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  const renderPipe = (pipe: Pipe, isConnected: boolean) => {
     const color = isConnected ? primaryColor : "#94a3b8"; // Slate 400
     const stroke = 8;
     
     return (
        <motion.div 
           className="w-full h-full relative"
           animate={{ rotate: pipe.rot * 90 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
           <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Straight */}
              {pipe.type === "straight" && (
                 <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
              )}
              {/* L */}
              {pipe.type === "L" && (
                 <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter" />
              )}
              {/* T */}
              {pipe.type === "T" && (
                 <>
                    <line x1="50" y1="0" x2="50" y2="50" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
                 </>
              )}
              {/* Cross */}
              {pipe.type === "cross" && (
                 <>
                    <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth={stroke} strokeLinecap="square" />
                 </>
              )}
              {/* Center Joint Circle */}
              <circle cx="50" cy="50" r="10" fill={color} />
           </svg>
        </motion.div>
     );
  };

  // Run initial evaluation when playing starts
  useEffect(() => {
     if (gameState === "playing" && grid.length > 0) {
        setConnected(evaluateConnections(grid));
     }
  }, [gameState, grid.length]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-[16px] border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center p-4 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Source Indicator */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-blue-500 rounded-b-lg flex items-center justify-center overflow-hidden z-10" style={{ backgroundColor: primaryColor }}>
            <motion.div 
               className="w-full h-2 bg-white/50"
               animate={{ y: [ -10, 10 ] }}
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
         </div>

         {/* Drain Indicator */}
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 rounded-t-lg z-10">
            {gameState === "won" && (
               <motion.div 
                  className="w-full h-full"
                  initial={{ backgroundColor: "#334155" }}
                  animate={{ backgroundColor: primaryColor }}
               />
            )}
         </div>

         {/* The Grid */}
         <div className="w-full aspect-square relative grid grid-cols-5 grid-rows-5 gap-1 bg-slate-800 p-2 rounded-xl">
            {grid.map((pipe, idx) => (
               <div 
                  key={idx}
                  className="w-full h-full bg-slate-900 rounded-md cursor-pointer hover:bg-slate-800/80 active:scale-95 transition-all overflow-hidden"
                  onClick={() => handleTileTap(idx)}
               >
                  {renderPipe(pipe, connected.has(idx))}
               </div>
            ))}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-xl"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Pipe Flow
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap pipes to rotate them.<br/>Connect the water to the drain.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Flow
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Water Connected</div>
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
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  // Connect straight down the middle for a fake win
                  const newGrid = [...grid];
                  for(let i=0; i<5; i++) {
                     newGrid[i*5 + 2] = { type: "straight", rot: 0 };
                  }
                  setGrid(newGrid);
                  setConnected(new Set([2, 7, 12, 17, 22]));
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
