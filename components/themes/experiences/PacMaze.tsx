"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

// Map definition: 0=Dot, 1=Wall, 2=Empty (spawn points)
const RAW_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2], // Teleport row? Let's just block it.
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1], // Spawn points near 2
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Clean map
const MAP = RAW_MAP.map((row, y) => row.map((cell, x) => {
   // Close off teleports
   if (y === 7 && (x === 0 || x === 1 || x === 2 || x === 8 || x === 9 || x === 10)) return 1;
   return cell;
}));

const ROWS = MAP.length;
const COLS = MAP[0].length;

interface Point { x: number, y: number }
interface Ghost extends Point { id: number, type: "chase" | "random", color: string }

const START_POS = { x: 5, y: 9 }; // Near bottom center

export function PacMaze({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // Yellow 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#171717"]; // Neutral 900

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [player, setPlayer] = useState<Point>(START_POS);
  const [direction, setDirection] = useState<Point>({ x: 0, y: 0 }); // Intended direction
  const [ghosts, setGhosts] = useState<Ghost[]>([
     { id: 1, x: 1, y: 1, type: "chase", color: "#ef4444" }, // Red
     { id: 2, x: 9, y: 1, type: "random", color: "#ec4899" } // Pink
  ]);
  const [dots, setDots] = useState<Set<string>>(new Set());
  const [showPayload, setShowPayload] = useState(false);

  // Swipe detection
  const touchStartRef = useRef<Point | null>(null);

  // Initialization
  useEffect(() => {
     if (gameState === "start") {
        const initialDots = new Set<string>();
        for (let y = 0; y < ROWS; y++) {
           for (let x = 0; x < COLS; x++) {
              if (MAP[y][x] === 0) initialDots.add(`${x},${y}`);
           }
        }
        setDots(initialDots);
        setPlayer(START_POS);
        setDirection({ x: 0, y: 0 });
     }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
     if (gameState !== "playing") return;

     const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
           case "ArrowUp": case "w": setDirection({ x: 0, y: -1 }); break;
           case "ArrowDown": case "s": setDirection({ x: 0, y: 1 }); break;
           case "ArrowLeft": case "a": setDirection({ x: -1, y: 0 }); break;
           case "ArrowRight": case "d": setDirection({ x: 1, y: 0 }); break;
        }
     };

     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Main Game Loop (Player Move + Ghost Move + Collision)
  useEffect(() => {
     if (gameState !== "playing") return;

     const interval = setInterval(() => {
        // --- 1. Move Player ---
        setPlayer(prev => {
           // Try to move in direction
           let next = { x: prev.x + direction.x, y: prev.y + direction.y };
           
           // If wall, try to keep moving in same direction as before?
           // For simplicity in discrete 1-tile movement, just stop if wall.
           if (MAP[next.y] && MAP[next.y][next.x] !== 1) {
              return next;
           }
           return prev; // Hit wall
        });

     }, 250); // Player speed

     return () => clearInterval(interval);
  }, [gameState, direction]);

  // Ghost Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const interval = setInterval(() => {
        setGhosts(prevGhosts => prevGhosts.map(g => {
           // Find valid moves
           const moves: Point[] = [];
           const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
           
           for (const d of dirs) {
              const nx = g.x + d.x;
              const ny = g.y + d.y;
              if (MAP[ny] && MAP[ny][nx] !== 1) {
                 moves.push({ x: nx, y: ny });
              }
           }

           if (moves.length === 0) return g;

           if (g.type === "random") {
              const r = Math.floor(Math.random() * moves.length);
              return { ...g, x: moves[r].x, y: moves[r].y };
           } else {
              // Chase: pick move that minimizes distance to player
              // To do this we need current player ref... we can use the state directly if it's fresh enough,
              // or just use the current player state from dependency array (which forces re-evaluation).
              // Let's just use `player`.
              let bestMove = moves[0];
              let minDist = Infinity;
              for (const m of moves) {
                 const dist = Math.abs(m.x - player.x) + Math.abs(m.y - player.y);
                 if (dist < minDist) {
                    minDist = dist;
                    bestMove = m;
                 }
              }
              return { ...g, x: bestMove.x, y: bestMove.y };
           }
        }));
     }, 400); // Ghost speed (slightly slower than player)

     return () => clearInterval(interval);
  }, [gameState, player]); // depend on player to get latest pos for chase

  // Dot consumption & Collision
  useEffect(() => {
     if (gameState !== "playing") return;

     // Check dots
     const posKey = `${player.x},${player.y}`;
     if (dots.has(posKey)) {
        setDots(prev => {
           const next = new Set(prev);
           next.delete(posKey);
           if (next.size === 0) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }
           return next;
        });
     }

     // Check collision
     for (const g of ghosts) {
        if (g.x === player.x && g.y === player.y) {
           // Hit! Reset player
           setPlayer(START_POS);
           setDirection({ x: 0, y: 0 });
           // Flash effect?
           break;
        }
     }
  }, [player, ghosts, dots, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Touch Handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
     touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
     };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
     if (!touchStartRef.current || gameState !== "playing") return;
     
     const diffX = e.touches[0].clientX - touchStartRef.current.x;
     const diffY = e.touches[0].clientY - touchStartRef.current.y;

     if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
           // Horizontal
           setDirection({ x: diffX > 0 ? 1 : -1, y: 0 });
        } else {
           // Vertical
           setDirection({ x: 0, y: diffY > 0 ? 1 : -1 });
        }
        // Reset touch start to require a new distinct swipe, or just let it update continuously
        touchStartRef.current = {
           x: e.touches[0].clientX,
           y: e.touches[0].clientY
        };
     }
  };

  const handleTouchEnd = () => {
     touchStartRef.current = null;
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[3/4] flex flex-col transition-all duration-1000 ${gameState === "won" ? "scale-90 opacity-40 blur-sm pointer-events-none" : "scale-100 opacity-100"}`}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
      >
         
         <div className="text-center mb-6">
            <h2 className="text-3xl font-black uppercase tracking-widest" style={{ color: primaryColor }}>
               Pac-Maze
            </h2>
            <p className="text-white/60 font-medium px-4 text-sm mt-1">
               Eat all dots. Avoid the ghosts. Swipe or use arrow keys.
            </p>
         </div>

         {/* The Grid */}
         <div className="flex-1 w-full bg-black border-4 border-blue-900 rounded-lg p-2 relative overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.5)]">
            
            {/* Dots & Walls Layer */}
            <div 
               className="w-full h-full grid" 
               style={{ 
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`
               }}
            >
               {MAP.map((row, y) => 
                  row.map((cell, x) => {
                     const isWall = cell === 1;
                     const hasDot = dots.has(`${x},${y}`);
                     
                     return (
                        <div key={`cell-${x}-${y}`} className="flex items-center justify-center">
                           {isWall && (
                              <div className="w-[90%] h-[90%] bg-blue-900 rounded-sm shadow-[0_0_10px_rgba(30,58,138,0.8)]" />
                           )}
                           {hasDot && (
                              <div className="w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_5px_rgba(253,230,138,0.8)]" />
                           )}
                        </div>
                     )
                  })
               )}
            </div>

            {/* Entities Layer (Absolute positioning via % based on Grid) */}
            {gameState === "playing" && (
               <>
                  {/* Player */}
                  <motion.div 
                     className="absolute w-[10%] h-[8%] -ml-[5%] -mt-[4%] flex items-center justify-center z-20"
                     animate={{ 
                        left: `${(player.x + 0.5) * (100/COLS)}%`, 
                        top: `${(player.y + 0.5) * (100/ROWS)}%`,
                        rotate: direction.x === 1 ? 0 : direction.x === -1 ? 180 : direction.y === 1 ? 90 : direction.y === -1 ? -90 : 0
                     }}
                     transition={{ duration: 0.2 }}
                  >
                     {/* CSS Pacman Shape */}
                     <div 
                        className="w-full h-full rounded-full relative" 
                        style={{ backgroundColor: primaryColor }}
                     >
                        {/* Mouth animation */}
                        <motion.div 
                           className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-black origin-left"
                           animate={{ scaleY: [0.1, 0.8, 0.1] }}
                           transition={{ duration: 0.4, repeat: Infinity }}
                        />
                     </div>
                  </motion.div>

                  {/* Ghosts */}
                  {ghosts.map(g => (
                     <motion.div 
                        key={g.id}
                        className="absolute w-[10%] h-[8%] -ml-[5%] -mt-[4%] flex flex-col items-center justify-center z-10"
                        animate={{ 
                           left: `${(g.x + 0.5) * (100/COLS)}%`, 
                           top: `${(g.y + 0.5) * (100/ROWS)}%` 
                        }}
                        transition={{ duration: 0.35, ease: "linear" }}
                     >
                        {/* Ghost Shape */}
                        <div 
                           className="w-full h-full rounded-t-full relative"
                           style={{ backgroundColor: g.color }}
                        >
                           {/* Eyes */}
                           <div className="absolute top-[20%] left-[20%] w-[25%] h-[35%] bg-white rounded-full flex items-center justify-center">
                              <div className="w-[40%] h-[40%] bg-blue-900 rounded-full" />
                           </div>
                           <div className="absolute top-[20%] right-[20%] w-[25%] h-[35%] bg-white rounded-full flex items-center justify-center">
                              <div className="w-[40%] h-[40%] bg-blue-900 rounded-full" />
                           </div>
                           {/* Skirt */}
                           <div className="absolute -bottom-[1px] w-full flex justify-between px-[1px]">
                              <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-black" />
                              <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-black" />
                              <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-black" />
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </>
            )}

            {/* Start Overlay */}
            <AnimatePresence>
               {gameState === "start" && (
                  <motion.div 
                     className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                     exit={{ opacity: 0 }}
                  >
                     <button 
                        onClick={() => setGameState("playing")}
                        className="bg-yellow-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-yellow-400 active:scale-95 transition-all"
                     >
                        Play
                     </button>
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(234,179,8,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-yellow-600 font-black uppercase tracking-widest mb-6">Maze Cleared</div>
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
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setDots(new Set());
               }}
               className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
               Auto-Eat Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
