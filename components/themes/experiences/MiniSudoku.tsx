"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type CellValue = number | null;
type Grid = CellValue[][];

// A valid 4x4 mini sudoku template
// 1 3 | 2 4
// 4 2 | 1 3
// ---------
// 2 4 | 3 1
// 3 1 | 4 2

// The initial puzzle state (null means empty)
const INITIAL_PUZZLE: Grid = [
  [1, null, null, 4],
  [null, 2, 1, null],
  [null, 1, 4, null],
  [4, null, null, 2]
];

const SOLVED_PUZZLE: Grid = [
  [1, 3, 2, 4],
  [4, 2, 1, 3],
  [2, 4, 3, 1],
  [3, 1, 4, 2]
];

export function MiniSudoku({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Violet 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // Slate 100

  const [grid, setGrid] = useState<Grid>(JSON.parse(JSON.stringify(INITIAL_PUZZLE)));
  const [won, setWon] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCellChange = (r: number, c: number, val: string) => {
     if (won) return;
     if (INITIAL_PUZZLE[r][c] !== null) return; // read only

     const newGrid = [...grid];
     newGrid[r] = [...newGrid[r]];

     if (val === "") {
        newGrid[r][c] = null;
     } else {
        const num = parseInt(val, 10);
        if (num >= 1 && num <= 4) {
           newGrid[r][c] = num;
        }
     }

     setGrid(newGrid);
     setErrorMsg("");
  };

  const validateGrid = () => {
     // Check if full
     for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
           if (grid[r][c] === null) return; // Not full yet
        }
     }

     let isValid = true;

     // Check Rows & Cols
     for (let i = 0; i < 4; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        for (let j = 0; j < 4; j++) {
           rowSet.add(grid[i][j]);
           colSet.add(grid[j][i]);
        }
        if (rowSet.size !== 4 || colSet.size !== 4) isValid = false;
     }

     // Check 2x2 Blocks
     for (let br = 0; br < 2; br++) {
        for (let bc = 0; bc < 2; bc++) {
           const blockSet = new Set();
           for (let i = 0; i < 2; i++) {
              for (let j = 0; j < 2; j++) {
                 blockSet.add(grid[br * 2 + i][bc * 2 + j]);
              }
           }
           if (blockSet.size !== 4) isValid = false;
        }
     }

     if (isValid) {
        setWon(true);
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        setErrorMsg("Something isn't right... keep trying!");
     }
  };

  useEffect(() => {
     validateGrid();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Container */}
      <div className={`relative w-full max-w-sm flex flex-col items-center transition-all duration-1000 ${won ? "scale-90 opacity-40 blur-sm pointer-events-none" : "scale-100 opacity-100"}`}>
         
         <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 mb-2">
               Logic Lock
            </h2>
            <p className="text-slate-600 font-medium px-4">
               Fill the grid with 1-4. No repeats in any row, column, or 2x2 block.
            </p>
         </div>

         {/* Grid */}
         <div className="bg-slate-800 p-2 rounded-2xl shadow-2xl relative">
            
            {/* The 4x4 Grid Container */}
            <div className="grid grid-cols-4 grid-rows-4 gap-1 bg-slate-900 border-4 border-slate-900 rounded-xl overflow-hidden relative">
               
               {/* 2x2 Block Dividers (Visual overlay) */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-900 -translate-y-1/2 pointer-events-none z-10" />
               <div className="absolute top-0 left-1/2 w-1 h-full bg-slate-900 -translate-x-1/2 pointer-events-none z-10" />

               {grid.map((row, r) => 
                  row.map((cell, c) => {
                     const isLocked = INITIAL_PUZZLE[r][c] !== null;
                     return (
                        <div 
                           key={`${r}-${c}`} 
                           className="w-16 h-16 sm:w-20 sm:h-20 bg-white flex items-center justify-center"
                        >
                           {isLocked ? (
                              <span className="text-3xl sm:text-4xl font-black text-slate-800 select-none">
                                 {cell}
                              </span>
                           ) : (
                              <input
                                 type="text"
                                 inputMode="numeric"
                                 pattern="[1-4]*"
                                 maxLength={1}
                                 value={cell || ""}
                                 onChange={(e) => handleCellChange(r, c, e.target.value)}
                                 className="w-full h-full text-center text-3xl sm:text-4xl font-black outline-none focus:bg-violet-50 transition-colors"
                                 style={{ color: primaryColor }}
                              />
                           )}
                        </div>
                     )
                  })
               )}
            </div>

         </div>

         {/* Error Message */}
         <div className="h-8 mt-6">
            <AnimatePresence>
               {errorMsg && !won && (
                  <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-red-500 font-bold uppercase tracking-wider text-sm"
                  >
                     {errorMsg}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-violet-500 font-black uppercase tracking-widest mb-6">Vault Unlocked</div>
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
      {mode === "editor-preview" && !won && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-black/10 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-sm">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGrid(JSON.parse(JSON.stringify(SOLVED_PUZZLE)));
               }}
               className="w-full bg-violet-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-violet-400 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
