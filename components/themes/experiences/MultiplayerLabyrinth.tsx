"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const MAZE_SIZE = 10;
const CELL_SIZE = 30; // visual sizing

type CellType = "empty" | "wall" | "red_door" | "blue_door" | "start" | "goal";

// A 10x10 maze grid
const MAZE_GRID: string[] = [
   "S W W W W W W W W W",
   "E E E E E W W E E W",
   "W W W W R W W E W W",
   "W E E E E B E E E W",
   "W E W W W W W W E W",
   "W E E E E E E W E W",
   "W W W W W W R W E W",
   "W E E E E W E E E W",
   "W E W W B W W W W W",
   "W E E E E E E E E G"
];

function getCell(x: number, y: number): CellType {
   if (y < 0 || y >= MAZE_SIZE || x < 0 || x >= MAZE_SIZE) return "wall";
   const row = MAZE_GRID[y].split(" ");
   const char = row[x];
   switch (char) {
      case "S": return "start";
      case "G": return "goal";
      case "W": return "wall";
      case "R": return "red_door";
      case "B": return "blue_door";
      default: return "empty";
   }
}

export function MultiplayerLabyrinth({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"playing" | "won">("playing");
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 }); // grid coordinates
  const [redOpen, setRedOpen] = useState(false);
  const [blueOpen, setBlueOpen] = useState(false);

  const controls = useAnimation();

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  useEffect(() => {
     // animate ball to current position smoothly
     controls.start({
        x: ballPos.x * CELL_SIZE,
        y: ballPos.y * CELL_SIZE,
        transition: { type: "spring", stiffness: 300, damping: 20 }
     });

     if (getCell(ballPos.x, ballPos.y) === "goal") {
        setPhase("won");
        setTimeout(() => {
           if (onComplete) onComplete();
        }, 2000);
     }
  }, [ballPos, controls, onComplete]);

  // Keyboard controls for easier testing / fallback
  useEffect(() => {
     if (phase !== "playing") return;

     const handleKeyDown = (e: KeyboardEvent) => {
        let nx = ballPos.x;
        let ny = ballPos.y;

        if (e.key === "ArrowUp") ny -= 1;
        else if (e.key === "ArrowDown") ny += 1;
        else if (e.key === "ArrowLeft") nx -= 1;
        else if (e.key === "ArrowRight") nx += 1;
        else return;

        tryMove(nx, ny);
     };

     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ballPos, phase, redOpen, blueOpen]);

  const tryMove = (nx: number, ny: number) => {
     const cell = getCell(nx, ny);
     if (cell === "wall") return; // blocked
     if (cell === "red_door" && !redOpen) return; // blocked
     if (cell === "blue_door" && !blueOpen) return; // blocked
     
     setBallPos({ x: nx, y: ny });
  };

  // Touch/swipe logic (simplified d-pad for the maze)
  const moveUp = () => tryMove(ballPos.x, ballPos.y - 1);
  const moveDown = () => tryMove(ballPos.x, ballPos.y + 1);
  const moveLeft = () => tryMove(ballPos.x - 1, ballPos.y);
  const moveRight = () => tryMove(ballPos.x + 1, ballPos.y);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center bg-zinc-950 p-4"
    >
      <div 
         className="absolute inset-0 opacity-40 pointer-events-none" 
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      <AnimatePresence mode="wait">
         {phase === "playing" && (
            <motion.div
               key="playing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative z-10 w-full max-w-2xl h-full flex flex-col items-center justify-center gap-8"
            >
               <h1 className="text-xl font-black uppercase tracking-widest text-center text-zinc-400">
                  Team Labyrinth
               </h1>
               
               <div className="flex w-full items-center justify-center gap-8 md:gap-16">
                  
                  {/* Left Side: Buttons (User 2 Simulation) */}
                  <div className="flex flex-col gap-6">
                     <button
                        onPointerDown={() => setRedOpen(true)}
                        onPointerUp={() => setRedOpen(false)}
                        onPointerLeave={() => setRedOpen(false)}
                        className={`w-20 h-20 rounded-full font-bold shadow-xl border-4 transition-transform active:scale-90 ${redOpen ? "bg-red-500 border-red-300 shadow-[0_0_20px_red]" : "bg-red-900 border-red-700"}`}
                     >
                        RED
                     </button>
                     <button
                        onPointerDown={() => setBlueOpen(true)}
                        onPointerUp={() => setBlueOpen(false)}
                        onPointerLeave={() => setBlueOpen(false)}
                        className={`w-20 h-20 rounded-full font-bold shadow-xl border-4 transition-transform active:scale-90 ${blueOpen ? "bg-blue-500 border-blue-300 shadow-[0_0_20px_blue]" : "bg-blue-900 border-blue-700"}`}
                     >
                        BLUE
                     </button>
                  </div>

                  {/* Right Side: Maze (User 1 Simulation) */}
                  <div 
                     className="relative bg-zinc-900 border-4 border-zinc-700 rounded-lg shadow-2xl p-1"
                     style={{ width: MAZE_SIZE * CELL_SIZE + 8, height: MAZE_SIZE * CELL_SIZE + 8 }}
                  >
                     {/* Draw Grid */}
                     {MAZE_GRID.map((row, y) => (
                        <div key={y} className="flex">
                           {row.split(" ").map((char, x) => (
                              <div 
                                 key={`${x}-${y}`} 
                                 style={{ width: CELL_SIZE, height: CELL_SIZE }}
                                 className="flex items-center justify-center"
                              >
                                 {char === "W" && <div className="w-full h-full bg-zinc-700 rounded-sm" />}
                                 {char === "R" && <div className={`w-full h-2/3 transition-colors ${redOpen ? "bg-red-500/20" : "bg-red-500"}`} />}
                                 {char === "B" && <div className={`w-full h-2/3 transition-colors ${blueOpen ? "bg-blue-500/20" : "bg-blue-500"}`} />}
                                 {char === "G" && <div className="text-xl">🏆</div>}
                              </div>
                           ))}
                        </div>
                     ))}
                     
                     {/* The Ball */}
                     <motion.div
                        animate={controls}
                        className="absolute top-1 left-1 bg-white rounded-full shadow-[0_0_10px_white]"
                        style={{ width: CELL_SIZE * 0.8, height: CELL_SIZE * 0.8, margin: CELL_SIZE * 0.1 }}
                     />
                  </div>
               </div>

               {/* Mobile D-Pad Controls for Ball */}
               <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
                  <div />
                  <button onClick={moveUp} className="bg-white/10 p-4 rounded-xl active:bg-white/30">↑</button>
                  <div />
                  <button onClick={moveLeft} className="bg-white/10 p-4 rounded-xl active:bg-white/30">←</button>
                  <button onClick={moveDown} className="bg-white/10 p-4 rounded-xl active:bg-white/30">↓</button>
                  <button onClick={moveRight} className="bg-white/10 p-4 rounded-xl active:bg-white/30">→</button>
               </div>
               <p className="hidden md:block text-zinc-500 font-bold text-sm mt-4">Use Arrow Keys to move the ball. Click & Hold buttons to open doors.</p>
            </motion.div>
         )}

         {phase === "won" && (
            <motion.div
               key="won"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/20 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-6xl mb-6"
               >
                  🏆
               </motion.div>
               <h1 className="text-3xl font-black uppercase text-white mb-2">
                 Escape Successful
               </h1>
               <p className="text-zinc-400 font-bold mb-8">
                  Great teamwork.
               </p>
               
               <div className="w-full bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    {config.title}
                  </h2>
                  <p className="text-zinc-300">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
