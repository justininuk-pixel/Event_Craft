"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "playing" | "won";
type Direction = "across" | "down";

interface CellData {
   isBlack: boolean;
   answer: string;
   number?: number;
}

// 5x5 Grid
// 1C A  K  E 2S
// 3R .  .  .  M
// 4E M  O  J  I
// 5E .  .  .  L
// 6D A  N  C  E

const GRID_LAYOUT: CellData[][] = [
   [
      { isBlack: false, answer: "C", number: 1 },
      { isBlack: false, answer: "A" },
      { isBlack: false, answer: "K" },
      { isBlack: false, answer: "E" },
      { isBlack: false, answer: "S", number: 2 },
   ],
   [
      { isBlack: false, answer: "R", number: 3 },
      { isBlack: true, answer: "" },
      { isBlack: true, answer: "" },
      { isBlack: true, answer: "" },
      { isBlack: false, answer: "M" },
   ],
   [
      { isBlack: false, answer: "E", number: 4 },
      { isBlack: false, answer: "M" },
      { isBlack: false, answer: "O" },
      { isBlack: false, answer: "J" },
      { isBlack: false, answer: "I" },
   ],
   [
      { isBlack: false, answer: "E", number: 5 },
      { isBlack: true, answer: "" },
      { isBlack: true, answer: "" },
      { isBlack: true, answer: "" },
      { isBlack: false, answer: "L" },
   ],
   [
      { isBlack: false, answer: "D", number: 6 },
      { isBlack: false, answer: "A" },
      { isBlack: false, answer: "N" },
      { isBlack: false, answer: "C" },
      { isBlack: false, answer: "E" },
   ],
];

const CLUES = {
   across: [
      { num: 1, clue: "Sweet baked celebration foods", row: 0, col: 0, length: 5 },
      { num: 4, clue: "A smiley face sent in a text", row: 2, col: 0, length: 5 },
      { num: 6, clue: "To move rhythmically to music", row: 4, col: 0, length: 5 },
   ],
   down: [
      { num: 1, clue: "A set of beliefs or aims", row: 0, col: 0, length: 5 },
      { num: 2, clue: "A happy expression on your face", row: 0, col: 4, length: 5 },
   ]
};

export function PersonalCrossword({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#cbd5e1"]; // Slate 300

  const [grid, setGrid] = useState<string[][]>(Array(5).fill(Array(5).fill("")));
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>({ r: 0, c: 0 });
  const [direction, setDirection] = useState<Direction>("across");
  const [gameState, setGameState] = useState<GameState>("playing");

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
     Array(5).fill(null).map(() => Array(5).fill(null))
  );

  // Check Win Condition
  useEffect(() => {
     let isWon = true;
     for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
           const cell = GRID_LAYOUT[r][c];
           if (!cell.isBlack && grid[r][c].toUpperCase() !== cell.answer) {
              isWon = false;
              break;
           }
        }
     }
     if (isWon && gameState === "playing") {
        setGameState("won");
    onComplete?.();
     }
  }, [grid, gameState]);

  useEffect(() => {
     if (gameState === "won" && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [gameState, onComplete]);

  const handleCellClick = (r: number, c: number) => {
     if (GRID_LAYOUT[r][c].isBlack || gameState === "won") return;

     if (selectedCell?.r === r && selectedCell?.c === c) {
        // Toggle direction
        setDirection(prev => prev === "across" ? "down" : "across");
     } else {
        setSelectedCell({ r, c });
     }
  };

  const getNextCell = (r: number, c: number, dir: Direction): {r: number, c: number} | null => {
     if (dir === "across") {
        if (c + 1 < 5 && !GRID_LAYOUT[r][c + 1].isBlack) return { r, c: c + 1 };
     } else {
        if (r + 1 < 5 && !GRID_LAYOUT[r + 1][c].isBlack) return { r: r + 1, c };
     }
     return null;
  };

  const getPrevCell = (r: number, c: number, dir: Direction): {r: number, c: number} | null => {
     if (dir === "across") {
        if (c - 1 >= 0 && !GRID_LAYOUT[r][c - 1].isBlack) return { r, c: c - 1 };
     } else {
        if (r - 1 >= 0 && !GRID_LAYOUT[r - 1][c].isBlack) return { r: r - 1, c };
     }
     return null;
  };

  const handleChange = (r: number, c: number, val: string) => {
     if (gameState === "won") return;
     const char = val.slice(-1).toUpperCase();
     if (!/^[A-Z]?$/.test(char)) return;

     const newGrid = [...grid.map(row => [...row])];
     newGrid[r][c] = char;
     setGrid(newGrid);

     // Auto advance
     if (char) {
        const next = getNextCell(r, c, direction);
        if (next) {
           setSelectedCell(next);
           inputRefs.current[next.r][next.c]?.focus();
        }
     }
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
     if (gameState === "won") return;
     
     if (e.key === "Backspace" && !grid[r][c]) {
        const prev = getPrevCell(r, c, direction);
        if (prev) {
           setSelectedCell(prev);
           inputRefs.current[prev.r][prev.c]?.focus();
        }
     } else if (e.key === "ArrowRight") {
        if (c + 1 < 5 && !GRID_LAYOUT[r][c+1].isBlack) {
           setSelectedCell({ r, c: c + 1 });
           setDirection("across");
           inputRefs.current[r][c+1]?.focus();
        }
     } else if (e.key === "ArrowLeft") {
        if (c - 1 >= 0 && !GRID_LAYOUT[r][c-1].isBlack) {
           setSelectedCell({ r, c: c - 1 });
           setDirection("across");
           inputRefs.current[r][c-1]?.focus();
        }
     } else if (e.key === "ArrowDown") {
        if (r + 1 < 5 && !GRID_LAYOUT[r+1][c].isBlack) {
           setSelectedCell({ r: r + 1, c });
           setDirection("down");
           inputRefs.current[r+1][c]?.focus();
        }
     } else if (e.key === "ArrowUp") {
        if (r - 1 >= 0 && !GRID_LAYOUT[r-1][c].isBlack) {
           setSelectedCell({ r: r - 1, c });
           setDirection("down");
           inputRefs.current[r-1][c]?.focus();
        }
     }
  };

  const isCellHighlighted = (r: number, c: number) => {
     if (!selectedCell) return false;
     if (GRID_LAYOUT[r][c].isBlack) return false;

     if (direction === "across") {
        // Is it in the same word across?
        if (r !== selectedCell.r) return false;
        // Check if there are black squares between
        const minC = Math.min(c, selectedCell.c);
        const maxC = Math.max(c, selectedCell.c);
        for (let i = minC; i <= maxC; i++) {
           if (GRID_LAYOUT[r][i].isBlack) return false;
        }
        return true;
     } else {
        // Down
        if (c !== selectedCell.c) return false;
        const minR = Math.min(r, selectedCell.r);
        const maxR = Math.max(r, selectedCell.r);
        for (let i = minR; i <= maxR; i++) {
           if (GRID_LAYOUT[i][c].isBlack) return false;
        }
        return true;
     }
  };

  const getActiveClueNum = () => {
     if (!selectedCell) return null;
     
     // Scan backwards to find the start of the word
     let startR = selectedCell.r;
     let startC = selectedCell.c;

     if (direction === "across") {
        while (startC > 0 && !GRID_LAYOUT[startR][startC - 1].isBlack) startC--;
     } else {
        while (startR > 0 && !GRID_LAYOUT[startR - 1][startC].isBlack) startR--;
     }

     return GRID_LAYOUT[startR][startC].number;
  };

  const activeClueNum = getActiveClueNum();

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000 p-4"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Payload Modal */}
      <AnimatePresence>
         {gameState === "won" && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
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
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className={`w-full max-w-lg transition-all duration-1000 ${gameState === "won" ? "opacity-30 blur-sm scale-95 pointer-events-none" : "opacity-100 scale-100"}`}>
         
         {/* Crossword Header */}
         <div className="text-center mb-8">
            <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900 drop-shadow-sm mb-2">
               Daily Crossword
            </h1>
            <p className="text-slate-700 font-serif italic">
               Solve the puzzle to unlock your message.
            </p>
         </div>

         {/* The Grid */}
         <div className="bg-slate-900 p-2 sm:p-3 rounded-xl shadow-2xl mb-8 border-4 border-slate-800">
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
               {GRID_LAYOUT.map((row, r) => (
                  row.map((cell, c) => {
                     const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                     const isHighlighted = isCellHighlighted(r, c);

                     if (cell.isBlack) {
                        return <div key={`${r}-${c}`} className="aspect-square bg-slate-900 rounded-sm" />;
                     }

                     return (
                        <div 
                           key={`${r}-${c}`} 
                           className="relative aspect-square"
                           onClick={() => {
                              handleCellClick(r, c);
                              inputRefs.current[r][c]?.focus();
                           }}
                        >
                           <input
                              ref={(el) => { inputRefs.current[r][c] = el; }}
                              type="text"
                              value={grid[r][c]}
                              onChange={(e) => handleChange(r, c, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, r, c)}
                              onFocus={() => handleCellClick(r, c)}
                              className={`absolute inset-0 w-full h-full text-center font-bold text-2xl sm:text-4xl uppercase caret-transparent transition-colors duration-200 outline-none rounded-sm border-2 ${
                                 isSelected 
                                    ? "bg-yellow-200 border-yellow-400 text-slate-900 shadow-inner z-10" 
                                    : isHighlighted
                                       ? "bg-blue-100 border-blue-200 text-slate-800"
                                       : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                              }`}
                           />
                           {cell.number && (
                              <span className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold text-slate-500 pointer-events-none z-20">
                                 {cell.number}
                              </span>
                           )}
                        </div>
                     );
                  })
               ))}
            </div>
         </div>

         {/* The Clues */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-slate-200">
            <div>
               <h3 className="font-black uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-200 pb-2">Across</h3>
               <ul className="space-y-2">
                  {CLUES.across.map(clue => (
                     <li 
                        key={clue.num} 
                        className={`text-sm sm:text-base cursor-pointer px-2 py-1 rounded transition-colors ${direction === "across" && activeClueNum === clue.num ? "bg-blue-100 font-bold text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
                        onClick={() => {
                           setDirection("across");
                           setSelectedCell({ r: clue.row, c: clue.col });
                           inputRefs.current[clue.row][clue.col]?.focus();
                        }}
                     >
                        <strong>{clue.num}.</strong> {clue.clue}
                     </li>
                  ))}
               </ul>
            </div>
            <div>
               <h3 className="font-black uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-200 pb-2">Down</h3>
               <ul className="space-y-2">
                  {CLUES.down.map(clue => (
                     <li 
                        key={clue.num} 
                        className={`text-sm sm:text-base cursor-pointer px-2 py-1 rounded transition-colors ${direction === "down" && activeClueNum === clue.num ? "bg-blue-100 font-bold text-blue-900" : "text-slate-700 hover:bg-slate-100"}`}
                        onClick={() => {
                           setDirection("down");
                           setSelectedCell({ r: clue.row, c: clue.col });
                           inputRefs.current[clue.row][clue.col]?.focus();
                        }}
                     >
                        <strong>{clue.num}.</strong> {clue.clue}
                     </li>
                  ))}
               </ul>
            </div>
         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  const newGrid = [...grid.map(row => [...row])];
                  for (let r = 0; r < 5; r++) {
                     for (let c = 0; c < 5; c++) {
                        if (!GRID_LAYOUT[r][c].isBlack) {
                           newGrid[r][c] = GRID_LAYOUT[r][c].answer;
                        }
                     }
                  }
                  setGrid(newGrid);
                  // The useEffect will catch the win state automatically on the next render
               }}
               className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-500 transition-colors"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
