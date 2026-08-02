"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Vehicle = {
   id: number;
   type: "h" | "v"; // horizontal or vertical
   len: 2 | 3;
   x: number;
   y: number;
   isHero?: boolean;
   color: string;
};

// 6x6 Grid. 
// A relatively simple 5-6 move puzzle:
// Hero at (1,2) len 2.
// Blocker V at (3,1) len 3.
// Blocker H at (0,4) len 2.
// Blocker V at (2,4) len 2.
// Wait, standard Rush Hour coordinate system is usually top-left (0,0).
// Let's create a known layout that requires moving 1 block down, 1 block left, etc.
const INITIAL_VEHICLES: Vehicle[] = [
   { id: 0, type: "h", len: 2, x: 1, y: 2, isHero: true, color: "primary" }, // Target is to move to x=4, out to x=5. Right now blocked by V at x=3.
   { id: 1, type: "v", len: 3, x: 3, y: 1, color: "bg-yellow-400" }, // Blocks hero. Needs to move down to y=3. But y=3 is blocked by H at y=4 or something.
   { id: 2, type: "h", len: 2, x: 2, y: 4, color: "bg-blue-500" }, // Blocks V from moving down. Needs to move left.
   { id: 3, type: "v", len: 2, x: 1, y: 4, color: "bg-green-500" }, // Wait, if H moves left to x=0, it overlaps (0,4). Let's refine.
];
// Refined layout:
// Hero: H, len=2, x=1, y=2. Exit is at y=2, x=6.
// V1: V, len=3, x=3, y=1. Blocks Hero. To let Hero pass, V1 must move up to y=0 (impossible, y=0 is filled) OR down to y=3.
// To move V1 down to y=3, cells (3,3), (3,4), (3,5) must be empty.
// Let's put H1: H, len=2, x=3, y=4. So V1 is blocked.
// To move H1 right, we need empty space. Let's make H1 x=3, y=4. It can move right to x=4.
// Let's test this layout visually.

const PUZZLE: Vehicle[] = [
   { id: 0, type: "h", len: 2, x: 1, y: 2, isHero: true, color: "primary" },
   { id: 1, type: "v", len: 3, x: 4, y: 1, color: "bg-yellow-500" },
   { id: 2, type: "h", len: 2, x: 2, y: 4, color: "bg-emerald-500" },
   { id: 3, type: "v", len: 2, x: 2, y: 0, color: "bg-purple-500" },
   { id: 4, type: "h", len: 3, x: 0, y: 5, color: "bg-sky-500" },
];

const CELL_SIZE = 48; // px
const GRID_PADDING = 8;
const GRID_SIZE = 6;

export function TrafficJam({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef2f2"]; // Red 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(PUZZLE);

  // Helper to check if a specific grid cell is occupied (ignoring a specific vehicle ID)
  const isOccupied = (x: number, y: number, ignoreId: number, currentVehicles: Vehicle[]) => {
     if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        // Allow hero to exit at x=4 and move to x=5, wait, grid is 0-5. Hero exiting means moving right off the grid.
        // Actually, hero at x=4 occupies (4,2), (5,2). So x=5 is valid for hero. If it goes to x=5, it occupies (5,2) and (6,2).
        if (ignoreId === 0 && y === 2 && x === GRID_SIZE) return false;
        return true; // wall
     }
     
     for (const v of currentVehicles) {
        if (v.id === ignoreId) continue;
        if (v.type === "h") {
           if (y === v.y && x >= v.x && x < v.x + v.len) return true;
        } else {
           if (x === v.x && y >= v.y && y < v.y + v.len) return true;
        }
     }
     return false;
  };

  const handleDragEnd = (event: any, info: any, vehicle: Vehicle) => {
     if (gameState !== "playing") return;
     
     const moveX = info.offset.x;
     const moveY = info.offset.y;
     
     // Calculate how many cells we dragged
     const deltaCellsX = Math.round(moveX / CELL_SIZE);
     const deltaCellsY = Math.round(moveY / CELL_SIZE);
     
     let newX = vehicle.x;
     let newY = vehicle.y;
     
     if (vehicle.type === "h" && deltaCellsX !== 0) {
        // Move step by step to ensure no jumping over cars
        const step = Math.sign(deltaCellsX);
        const steps = Math.abs(deltaCellsX);
        for (let i = 0; i < steps; i++) {
           const checkX = step > 0 ? newX + vehicle.len : newX - 1;
           if (!isOccupied(checkX, newY, vehicle.id, vehicles)) {
              newX += step;
           } else {
              break;
           }
        }
     } else if (vehicle.type === "v" && deltaCellsY !== 0) {
        const step = Math.sign(deltaCellsY);
        const steps = Math.abs(deltaCellsY);
        for (let i = 0; i < steps; i++) {
           const checkY = step > 0 ? newY + vehicle.len : newY - 1;
           if (!isOccupied(newX, checkY, vehicle.id, vehicles)) {
              newY += step;
           } else {
              break;
           }
        }
     }
     
     const updated = vehicles.map(v => 
        v.id === vehicle.id ? { ...v, x: newX, y: newY } : v
     );
     
     setVehicles(updated);
     
     // Check win
     if (vehicle.isHero && newX >= GRID_SIZE - 2) {
        // Hero is length 2, so if x=4, it occupies 4 and 5. Wait, x=4 is touching the right edge.
        // If x=5, it's partially out. Let's say if x >= 4, it's out.
        // Standard rush hour, the exit is at x=4 (for length 2 car).
        if (newX >= 4) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     }
  };

  const resetPuzzle = () => {
     setVehicles(PUZZLE);
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
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-8 border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         <div className="w-full h-16 flex items-center justify-between px-6 bg-slate-800 border-b-4 border-slate-700 shrink-0">
            <span className="text-white font-black text-xl tracking-widest uppercase">Gridlock</span>
            <button 
               onClick={resetPuzzle}
               className="text-slate-400 font-bold text-xs bg-slate-900 px-3 py-1 rounded-md border border-slate-700 active:scale-95"
            >
               Reset
            </button>
         </div>

         <div className="flex-1 w-full bg-slate-700 relative flex items-center justify-center">
            
            {/* The Grid Board */}
            <div 
               className="relative bg-slate-800 rounded-lg shadow-inner"
               style={{ 
                  width: GRID_SIZE * CELL_SIZE + GRID_PADDING * 2, 
                  height: GRID_SIZE * CELL_SIZE + GRID_PADDING * 2,
                  padding: GRID_PADDING
               }}
            >
               {/* Exit Marker */}
               <div 
                  className="absolute bg-slate-900 right-[-12px] h-[48px] w-6 flex items-center pl-1 border-t-2 border-b-2 border-r-2 border-slate-600 rounded-r-md z-0"
                  style={{ top: GRID_PADDING + 2 * CELL_SIZE }}
               >
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] opacity-50" style={{ borderLeftColor: primaryColor }} />
               </div>

               {/* Grid Lines */}
               <div className="absolute inset-0 pointer-events-none p-[8px]">
                  {Array.from({ length: GRID_SIZE }).map((_, y) => (
                     Array.from({ length: GRID_SIZE }).map((_, x) => (
                        <div 
                           key={`cell-${x}-${y}`} 
                           className="absolute border border-slate-700/50"
                           style={{
                              left: x * CELL_SIZE,
                              top: y * CELL_SIZE,
                              width: CELL_SIZE,
                              height: CELL_SIZE
                           }}
                        />
                     ))
                  ))}
               </div>

               {/* Vehicles */}
               {vehicles.map(v => {
                  const width = v.type === "h" ? v.len * CELL_SIZE : CELL_SIZE;
                  const height = v.type === "v" ? v.len * CELL_SIZE : CELL_SIZE;
                  const left = v.x * CELL_SIZE + GRID_PADDING;
                  const top = v.y * CELL_SIZE + GRID_PADDING;

                  return (
                     <motion.div
                        key={v.id}
                        layout // Animate snaps
                        drag={v.type === "h" ? "x" : "y"}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(e, info, v)}
                        className={`absolute rounded-xl shadow-md border-2 border-black/20 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-10 ${v.isHero ? '' : v.color}`}
                        style={{
                           width: width - 4,
                           height: height - 4,
                           backgroundColor: v.isHero ? primaryColor : undefined,
                           // Instead of using Left/Top directly (which interferes with Framer's layout animations), 
                           // we can set x/y via layout
                           // Wait, Framer Motion 'layout' works well with flex or standard positioning, but since we are
                           // using absolute positioning based on grid, it's better to animate `x` and `y` props.
                           x: left,
                           y: top
                        }}
                     >
                        {/* Texture lines */}
                        {v.type === "h" && (
                           <div className="w-1/2 h-2 bg-black/10 rounded-full" />
                        )}
                        {v.type === "v" && (
                           <div className="w-2 h-1/2 bg-black/10 rounded-full" />
                        )}
                        {v.isHero && (
                           <div className="absolute right-2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white/60" />
                        )}
                     </motion.div>
                  );
               })}
            </div>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Traffic Jam
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Slide the blocking cars to clear a path to the exit on the right.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Clear Path
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(239,68,68,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Path Cleared</div>
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
                  setVehicles(v => v.map(car => car.isHero ? { ...car, x: 5 } : car));
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
