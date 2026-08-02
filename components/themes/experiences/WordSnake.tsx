"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_WORD = "MAGIC";
const GRID_SIZE = 4;

// Generate grid with target word contiguous
const generateGrid = () => {
   const grid = Array(GRID_SIZE * GRID_SIZE).fill("");
   
   // A hardcoded valid path for "MAGIC" in 4x4
   // For example:
   // M A . .
   // . G I .
   // . . C .
   // . . . .
   const path = [0, 1, 5, 6, 10]; // M=0, A=1, G=5, I=6, C=10
   
   for (let i = 0; i < TARGET_WORD.length; i++) {
      grid[path[i]] = TARGET_WORD[i];
   }
   
   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   for (let i = 0; i < grid.length; i++) {
      if (grid[i] === "") {
         grid[i] = chars.charAt(Math.floor(Math.random() * chars.length));
      }
   }
   
   return grid;
};

const GRID = generateGrid();

export function WordSnake({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#9333ea"; // Purple 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#faf5ff"]; // Fuchsia 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "error">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // For SVG line drawing
  const [cellCenters, setCellCenters] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
     // Calculate cell centers
     const updateCenters = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cellW = rect.width / GRID_SIZE;
        const cellH = rect.height / GRID_SIZE;
        
        const centers = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
           const row = Math.floor(i / GRID_SIZE);
           const col = i % GRID_SIZE;
           centers.push({
              x: col * cellW + cellW / 2,
              y: row * cellH + cellH / 2
           });
        }
        setCellCenters(centers);
     };
     updateCenters();
     window.addEventListener('resize', updateCenters);
     return () => window.removeEventListener('resize', updateCenters);
  }, [gameState]);

  const getCellIndexFromEvent = (e: React.PointerEvent | PointerEvent) => {
     if (!containerRef.current) return -1;
     const rect = containerRef.current.getBoundingClientRect();
     
     // Handle both mouse and touch coordinates
     const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as React.PointerEvent).clientX;
     const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as React.PointerEvent).clientY;
     
     if (!clientX || !clientY) return -1;

     const x = clientX - rect.left;
     const y = clientY - rect.top;
     
     if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return -1;
     
     const cellW = rect.width / GRID_SIZE;
     const cellH = rect.height / GRID_SIZE;
     
     const col = Math.floor(x / cellW);
     const row = Math.floor(y / cellH);
     
     return row * GRID_SIZE + col;
  };

  const isAdjacent = (idx1: number, idx2: number) => {
     const r1 = Math.floor(idx1 / GRID_SIZE);
     const c1 = idx1 % GRID_SIZE;
     const r2 = Math.floor(idx2 / GRID_SIZE);
     const c2 = idx2 % GRID_SIZE;
     return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing" && gameState !== "error") return;
     if (gameState === "error") setGameState("playing");
     
     const idx = getCellIndexFromEvent(e);
     if (idx >= 0) {
        isDragging.current = true;
        setPath([idx]);
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     
     const idx = getCellIndexFromEvent(e);
     if (idx >= 0) {
        setPath(prev => {
           // If we're already at this cell, do nothing
           if (prev[prev.length - 1] === idx) return prev;
           
           // If we've already visited this cell, maybe allow backtracking? No, Boggle doesn't allow reuse.
           if (prev.includes(idx)) {
               // To allow backing up, if it's the previous cell, we could pop
               if (prev.length > 1 && prev[prev.length - 2] === idx) {
                  return prev.slice(0, -1);
               }
               return prev;
           }

           // Check adjacency
           if (isAdjacent(prev[prev.length - 1], idx)) {
              return [...prev, idx];
           }
           
           return prev;
        });
     }
  };

  const handlePointerUp = () => {
     if (!isDragging.current) return;
     isDragging.current = false;
     
     // Evaluate word
     const word = path.map(i => GRID[i]).join("");
     
     if (word === TARGET_WORD) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        setGameState("error");
        setTimeout(() => {
           if (gameState !== "won") {
              setPath([]);
              setGameState("playing");
           }
        }, 800);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Handle global pointer up in case they drag off the grid
  useEffect(() => {
     const upHandler = () => handlePointerUp();
     window.addEventListener('pointerup', upHandler);
     window.addEventListener('touchend', upHandler);
     return () => {
        window.removeEventListener('pointerup', upHandler);
        window.removeEventListener('touchend', upHandler);
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const currentWord = path.map(i => GRID[i]).join("");

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-square bg-white border border-purple-100 rounded-3xl shadow-[0_20px_50px_rgba(147,51,234,0.15)] transition-all duration-1000 flex flex-col items-center justify-center p-4 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         {/* Top HUD */}
         <div className="absolute top-4 w-full flex justify-center">
            <div className={`h-12 px-6 rounded-full flex items-center justify-center text-2xl font-black tracking-widest transition-colors ${gameState === 'error' ? 'bg-red-100 text-red-600' : gameState === 'won' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-700'}`}>
               {currentWord || "TRACE"}
            </div>
         </div>

         {/* The Grid */}
         <div 
            ref={containerRef}
            className="w-full h-full mt-16 relative grid grid-cols-4 grid-rows-4 gap-2 z-10 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
         >
            {/* SVG Path Layer */}
            {cellCenters.length > 0 && path.length > 1 && (
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <motion.polyline
                     points={path.map(idx => `${cellCenters[idx].x},${cellCenters[idx].y}`).join(' ')}
                     fill="none"
                     stroke={gameState === 'error' ? '#ef4444' : gameState === 'won' ? '#22c55e' : primaryColor}
                     strokeWidth="12"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="opacity-50"
                  />
               </svg>
            )}

            {GRID.map((char, i) => {
               const isSelected = path.includes(i);
               
               return (
                  <motion.div 
                     key={i}
                     className={`w-full h-full rounded-2xl flex items-center justify-center text-3xl font-black z-10 transition-colors ${isSelected ? (gameState === 'error' ? 'bg-red-500 text-white' : gameState === 'won' ? 'bg-green-500 text-white' : 'bg-purple-600 text-white shadow-lg scale-105') : 'bg-purple-50 text-purple-900 border border-purple-200'}`}
                     animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                     {char}
                  </motion.div>
               );
            })}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-purple-900 font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Word Snake
                  </div>
                  <div className="text-purple-700 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Trace the hidden word:<br/><span className="font-black text-2xl mt-2 block">{TARGET_WORD}</span>
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="bg-purple-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Start Tracing
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(147,51,234,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-purple-600 font-black uppercase tracking-widest mb-6 text-sm">Word Found</div>
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
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/50 backdrop-blur-xl border border-white p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setPath([0, 1, 5, 6, 10]); // M-A-G-I-C
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-purple-500 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
