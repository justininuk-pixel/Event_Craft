"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "idle" | "playing" | "won" | "lost";

interface Tile {
   row: number;
   col: number;
   isMine: boolean;
   isRevealed: boolean;
   isFlagged: boolean;
   neighborMines: number;
}

const GRID_SIZE = 10;
const NUM_MINES = 15;

const MINE_COLORS = [
   "",
   "text-blue-600",
   "text-green-600",
   "text-red-600",
   "text-purple-600",
   "text-orange-600",
   "text-teal-600",
   "text-black",
   "text-gray-600"
];

export function MineSweeper({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [board, setBoard] = useState<Tile[][]>([]);
  const [flagsRemaining, setFlagsRemaining] = useState(NUM_MINES);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#cbd5e1"]; // Slate 300

  // Initialize empty board
  const initBoard = useCallback(() => {
     const newBoard: Tile[][] = [];
     for (let r = 0; r < GRID_SIZE; r++) {
        const row: Tile[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
           row.push({
              row: r,
              col: c,
              isMine: false,
              isRevealed: false,
              isFlagged: false,
              neighborMines: 0
           });
        }
        newBoard.push(row);
     }
     setBoard(newBoard);
     setGameState("idle");
     setFlagsRemaining(NUM_MINES);
     setIsFullyRevealed(false);
  }, []);

  useEffect(() => {
     initBoard();
  }, [initBoard]);

  const placeMines = (firstRow: number, firstCol: number, currentBoard: Tile[][]) => {
     let minesPlaced = 0;
     while (minesPlaced < NUM_MINES) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        
        // Prevent mine on first click, or if already a mine
        if (!currentBoard[r][c].isMine && !(Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1)) {
           currentBoard[r][c].isMine = true;
           minesPlaced++;
        }
     }

     // Calculate neighbor counts
     for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
           if (!currentBoard[r][c].isMine) {
              let count = 0;
              for (let dr = -1; dr <= 1; dr++) {
                 for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && currentBoard[nr][nc].isMine) {
                       count++;
                    }
                 }
              }
              currentBoard[r][c].neighborMines = count;
           }
        }
     }
  };

  const revealTile = (r: number, c: number) => {
     if (gameState === "won" || gameState === "lost" || board[r][c].isRevealed || board[r][c].isFlagged) {
        return;
     }

     const newBoard = [...board.map(row => [...row])];

     if (gameState === "idle") {
        placeMines(r, c, newBoard);
        setGameState("playing");
     }

     if (newBoard[r][c].isMine) {
        // Game Over
        newBoard[r][c].isRevealed = true;
        setGameState("lost");
        setBoard(newBoard);
        return;
     }

     // Flood fill empty spaces
     const queue = [{ r, c }];
     let tilesRevealedThisClick = 0;

     while (queue.length > 0) {
        const current = queue.shift()!;
        if (!newBoard[current.r][current.c].isRevealed && !newBoard[current.r][current.c].isFlagged) {
           newBoard[current.r][current.c].isRevealed = true;
           tilesRevealedThisClick++;

           if (newBoard[current.r][current.c].neighborMines === 0) {
              for (let dr = -1; dr <= 1; dr++) {
                 for (let dc = -1; dc <= 1; dc++) {
                    const nr = current.r + dr;
                    const nc = current.c + dc;
                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                       queue.push({ r: nr, c: nc });
                    }
                 }
              }
           }
        }
     }

     setBoard(newBoard);

     // Check Win Condition
     let totalRevealed = 0;
     for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
           if (newBoard[i][j].isRevealed) totalRevealed++;
        }
     }

     if (totalRevealed === (GRID_SIZE * GRID_SIZE) - NUM_MINES) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setIsFullyRevealed(true), 1500); // Wait a moment then drop the whole grid
     }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
     e.preventDefault();
     if (gameState === "won" || gameState === "lost" || board[r][c].isRevealed) return;

     const newBoard = [...board.map(row => [...row])];
     const tile = newBoard[r][c];

     if (tile.isFlagged) {
        tile.isFlagged = false;
        setFlagsRemaining(prev => prev + 1);
     } else if (flagsRemaining > 0) {
        tile.isFlagged = true;
        setFlagsRemaining(prev => prev - 1);
     }

     setBoard(newBoard);
  };

  // Trigger completion
  useEffect(() => {
     if (isFullyRevealed && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [isFullyRevealed, onComplete]);


  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex items-center justify-center transition-colors duration-1000 select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* The Payload (Hidden beneath the grid) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0">
         <motion.div 
            className="text-center max-w-3xl bg-white/50 backdrop-blur-3xl p-12 rounded-3xl shadow-2xl border border-white/40"
            animate={{ 
               scale: isFullyRevealed ? 1 : 0.95,
               opacity: isFullyRevealed ? 1 : 0.3
            }}
            transition={{ duration: 1 }}
         >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900">
               {config.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 font-serif leading-relaxed">
               {config.body}
            </p>
         </motion.div>
      </div>

      {/* The Minesweeper UI Overlay */}
      <AnimatePresence>
         {!isFullyRevealed && (
            <motion.div 
               className="relative z-10 w-full max-w-[600px] aspect-square p-2 bg-slate-300 border-[6px] border-l-slate-100 border-t-slate-100 border-r-slate-500 border-b-slate-500 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
               exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
               transition={{ duration: 1 }}
            >
               
               {/* Header Info */}
               <div className="h-16 mb-2 border-4 border-l-slate-500 border-t-slate-500 border-r-slate-100 border-b-slate-100 bg-slate-200 flex items-center justify-between px-4">
                  {/* Mine Counter */}
                  <div className="font-mono text-3xl font-bold text-red-600 bg-black px-2 border-2 border-slate-500">
                     {String(flagsRemaining).padStart(3, '0')}
                  </div>

                  {/* Reset Button */}
                  <button 
                     onClick={initBoard}
                     className="w-10 h-10 bg-slate-300 border-4 border-l-slate-100 border-t-slate-100 border-r-slate-500 border-b-slate-500 active:border-l-slate-500 active:border-t-slate-500 active:border-r-slate-100 active:border-b-slate-100 flex items-center justify-center text-xl hover:bg-slate-200"
                  >
                     {gameState === "lost" ? "😵" : gameState === "won" ? "😎" : "🙂"}
                  </button>

                  {/* Timer (Fake, just zeros for visual completion) */}
                  <div className="font-mono text-3xl font-bold text-red-600 bg-black px-2 border-2 border-slate-500">
                     000
                  </div>
               </div>

               {/* The Grid */}
               <div 
                  className="flex-1 border-4 border-l-slate-500 border-t-slate-500 border-r-slate-100 border-b-slate-100 bg-slate-400 relative"
               >
                  {/* The grid is built out of buttons */}
                  {board.map((row, r) => (
                     <div key={`row-${r}`} className="flex h-[10%] w-full">
                        {row.map((tile, c) => (
                           <div 
                              key={`tile-${r}-${c}`}
                              className="w-[10%] h-full relative"
                           >
                              {/* The revealed state (transparent hole to payload) */}
                              <div className={`absolute inset-0 border border-slate-400/30 flex items-center justify-center ${tile.isMine && tile.isRevealed ? "bg-red-500" : ""}`}>
                                 {tile.isRevealed && !tile.isMine && tile.neighborMines > 0 && (
                                    <span className={`font-black text-lg ${MINE_COLORS[tile.neighborMines]}`}>
                                       {tile.neighborMines}
                                    </span>
                                 )}
                                 {tile.isRevealed && tile.isMine && (
                                    <span className="text-black text-xl drop-shadow-md">💣</span>
                                 )}
                              </div>

                              {/* The unrevealed covering block */}
                              {!tile.isRevealed && (
                                 <button
                                    onClick={() => revealTile(r, c)}
                                    onContextMenu={(e) => toggleFlag(e, r, c)}
                                    className="absolute inset-0 bg-slate-300 border-[3px] border-l-slate-100 border-t-slate-100 border-r-slate-500 border-b-slate-500 hover:bg-slate-200 active:border-l-slate-500 active:border-t-slate-500 active:border-r-slate-100 active:border-b-slate-100 flex items-center justify-center"
                                 >
                                    {tile.isFlagged && <span className="text-red-600 drop-shadow-sm text-sm">🚩</span>}
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isFullyRevealed && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setIsFullyRevealed(true);
               }}
               className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-500 transition-colors"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
