"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 4;
const EMPTY_TILE = 15; // 0-14 are tiles 1-15. 15 is empty.

const getSolvedState = () => Array.from({ length: 16 }, (_, i) => i);

const getScrambledState = () => {
   const state = getSolvedState();
   
   // Scramble by performing 100 random valid moves
   // This guarantees the puzzle is solvable.
   let emptyIdx = 15;
   for (let i = 0; i < 150; i++) {
      const row = Math.floor(emptyIdx / GRID_SIZE);
      const col = emptyIdx % GRID_SIZE;
      const neighbors = [];
      if (row > 0) neighbors.push(emptyIdx - GRID_SIZE); // Up
      if (row < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE); // Down
      if (col > 0) neighbors.push(emptyIdx - 1); // Left
      if (col < GRID_SIZE - 1) neighbors.push(emptyIdx + 1); // Right
      
      const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap
      [state[emptyIdx], state[swapIdx]] = [state[swapIdx], state[emptyIdx]];
      emptyIdx = swapIdx;
   }
   
   return state;
};

export function FifteenPuzzle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // Sky 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0f9ff"]; // Sky 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [tiles, setTiles] = useState<number[]>([]);

  useEffect(() => {
     setTiles(getScrambledState());
  }, []);

  const handleTileTap = (index: number) => {
     if (gameState !== "playing") return;
     
     const emptyIdx = tiles.indexOf(EMPTY_TILE);
     if (emptyIdx === -1) return;
     
     const row1 = Math.floor(index / GRID_SIZE);
     const col1 = index % GRID_SIZE;
     const row2 = Math.floor(emptyIdx / GRID_SIZE);
     const col2 = emptyIdx % GRID_SIZE;
     
     const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
     
     if (isAdjacent) {
        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setTiles(newTiles);
        
        // Check win condition
        const isWon = newTiles.every((val, i) => val === i);
        if (isWon) {
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

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-square bg-slate-200 border-8 border-slate-300 rounded-2xl shadow-[inset_0_5px_20px_rgba(0,0,0,0.1),_0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center p-2 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         <div className="w-full h-full relative">
            {tiles.map((tileValue, index) => {
               if (tileValue === EMPTY_TILE) return null; // Don't render the empty space
               
               const row = Math.floor(index / GRID_SIZE);
               const col = index % GRID_SIZE;
               
               // Calculate correct position of this tile to display its number
               // Wait, tileValue *is* the number (0 = 1, 1 = 2, etc.)
               
               return (
                  <motion.div
                     key={tileValue}
                     layout
                     transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     className="absolute p-1 cursor-pointer"
                     style={{
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                        left: `${col * (100 / GRID_SIZE)}%`,
                        top: `${row * (100 / GRID_SIZE)}%`,
                     }}
                     onTap={() => handleTileTap(index)}
                  >
                     <div 
                        className="w-full h-full bg-white rounded-lg shadow-md flex items-center justify-center border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all"
                        style={{ color: primaryColor }}
                     >
                        <span className="text-3xl font-black">{tileValue + 1}</span>
                     </div>
                  </motion.div>
               );
            })}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-slate-800 font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     15-Puzzle
                  </div>
                  <div className="text-slate-500 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Slide the tiles to put them in numerical order from 1 to 15.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Game
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(255,255,255,0.2)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-slate-400 font-black uppercase tracking-widest mb-6 text-sm">Puzzle Solved</div>
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
                  setTiles(getSolvedState());
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
