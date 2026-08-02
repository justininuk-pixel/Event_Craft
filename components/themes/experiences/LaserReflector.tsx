"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Mirror = {
   id: string;
   x: number;
   y: number;
   rot: 0 | 1; // 0 = '/', 1 = '\'
};

const GRID_W = 6;
const GRID_H = 6;

// Dir: 0=Up, 1=Right, 2=Down, 3=Left
const DIRS = [
   [0, -1], // 0: Up
   [1, 0],  // 1: Right
   [0, 1],  // 2: Down
   [-1, 0]  // 3: Left
];

const EMITTER = { x: 0, y: 2, dir: 1 };
const RECEIVER = { x: 5, y: 2 };
const OBSTACLES = [
   { x: 2, y: 1 },
   { x: 2, y: 2 },
   { x: 2, y: 3 },
   { x: 2, y: 4 },
   { x: 3, y: 0 },
   { x: 4, y: 3 }
];

export function LaserReflector({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);

  // Mirrors start in "inventory" below the grid. Let's use y = 6 for inventory.
  const [mirrors, setMirrors] = useState<Mirror[]>([
     { id: "m1", x: 1, y: 6, rot: 1 },
     { id: "m2", x: 2, y: 6, rot: 0 },
     { id: "m3", x: 3, y: 6, rot: 1 },
     { id: "m4", x: 4, y: 6, rot: 0 },
  ]);

  const [laserPath, setLaserPath] = useState<{x: number, y: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raycasting logic
  useEffect(() => {
     if (gameState !== "playing" && gameState !== "won") return;

     const path = [{ x: EMITTER.x, y: EMITTER.y }];
     let currX = EMITTER.x;
     let currY = EMITTER.y;
     let currDir = EMITTER.dir;
     let isWon = false;

     // Limit to 50 steps to prevent infinite loops (e.g. bouncing back and forth)
     for (let step = 0; step < 50; step++) {
        const nextX = currX + DIRS[currDir][0];
        const nextY = currY + DIRS[currDir][1];

        // Bounds check (ignore inventory row y=6)
        if (nextX < 0 || nextX >= GRID_W || nextY < 0 || nextY >= GRID_H) {
           path.push({ x: nextX, y: nextY }); // draw to the edge
           break;
        }

        path.push({ x: nextX, y: nextY });
        currX = nextX;
        currY = nextY;

        // Check Obstacle
        if (OBSTACLES.some(o => o.x === currX && o.y === currY)) {
           break;
        }

        // Check Receiver
        if (currX === RECEIVER.x && currY === RECEIVER.y) {
           isWon = true;
           break;
        }

        // Check Mirror
        const mirror = mirrors.find(m => m.x === currX && m.y === currY);
        if (mirror) {
           if (mirror.rot === 0) {
              // '/' Mirror
              if (currDir === 0) currDir = 1; // Up -> Right
              else if (currDir === 1) currDir = 0; // Right -> Up
              else if (currDir === 2) currDir = 3; // Down -> Left
              else if (currDir === 3) currDir = 2; // Left -> Down
           } else {
              // '\' Mirror
              if (currDir === 0) currDir = 3; // Up -> Left
              else if (currDir === 1) currDir = 2; // Right -> Down
              else if (currDir === 2) currDir = 1; // Down -> Right
              else if (currDir === 3) currDir = 0; // Left -> Up
           }
        }
     }

     setLaserPath(path);

     if (isWon && gameState === "playing") {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }

  }, [mirrors, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Handle Dragging
  const handleDragEnd = (id: string, e: any, info: any) => {
     if (gameState === "won") return;

     // Calculate which cell we dropped into
     const container = containerRef.current;
     if (!container) return;
     
     const rect = container.getBoundingClientRect();
     // The grid is 6 columns, 7 rows (including inventory)
     // But wait, Framer Motion drag offset is local if not constrained, but we can just use `clientX/clientY`
     // relative to the container.
     const dropX = e.clientX || (e.touches && e.touches[0].clientX);
     const dropY = e.clientY || (e.touches && e.touches[0].clientY);
     
     if (dropX == null || dropY == null) return;

     const relX = dropX - rect.left;
     const relY = dropY - rect.top;
     
     const cellW = rect.width / GRID_W;
     const cellH = rect.height / 7; // 6 grid + 1 inventory

     const gridX = Math.floor(relX / cellW);
     const gridY = Math.floor(relY / cellH);

     setMirrors(prev => prev.map(m => {
        if (m.id !== id) return m;

        // Valid drop?
        let newX = m.x;
        let newY = m.y;
        
        if (gridX >= 0 && gridX < GRID_W && gridY >= 0 && gridY < 7) {
           // Ensure it's not an obstacle, emitter, receiver, or another mirror
           const isObstacle = OBSTACLES.some(o => o.x === gridX && o.y === gridY);
           const isEmitter = gridX === EMITTER.x && gridY === EMITTER.y;
           const isReceiver = gridX === RECEIVER.x && gridY === RECEIVER.y;
           const isOccupied = prev.some(other => other.id !== id && other.x === gridX && other.y === gridY);

           if (!isObstacle && !isEmitter && !isReceiver && !isOccupied) {
              newX = gridX;
              newY = gridY;
           }
        }
        return { ...m, x: newX, y: newY };
     }));
  };

  const handleMirrorTap = (id: string) => {
     if (gameState === "won") return;
     setMirrors(prev => prev.map(m => 
        m.id === id ? { ...m, rot: m.rot === 0 ? 1 : 0 } : m
     ));
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         ref={containerRef}
         className={`relative w-full max-w-sm aspect-[6/7] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Grid Background */}
         <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: 7 }).map((_, y) => (
               <div key={y} className="flex-1 flex border-b border-slate-800/50 last:border-0">
                  {Array.from({ length: GRID_W }).map((_, x) => (
                     <div key={x} className={`flex-1 border-r border-slate-800/50 last:border-0 ${y === 6 ? 'bg-slate-800/50' : ''}`} />
                  ))}
               </div>
            ))}
         </div>

         {/* Inventory Divider */}
         <div className="absolute left-0 w-full h-[2px] bg-slate-700" style={{ top: `${(6/7)*100}%` }} />

         {/* Grid Items (Obstacles, Emitter, Receiver) */}
         <div className="absolute inset-0 pointer-events-none">
            {OBSTACLES.map((obs, i) => (
               <div 
                  key={i}
                  className="absolute bg-slate-800 border-2 border-slate-700 flex items-center justify-center"
                  style={{
                     left: `${(obs.x / GRID_W) * 100}%`,
                     top: `${(obs.y / 7) * 100}%`,
                     width: `${100 / GRID_W}%`,
                     height: `${100 / 7}%`
                  }}
               >
                  <div className="w-1/2 h-1/2 bg-slate-700/50 rotate-45" />
               </div>
            ))}

            {/* Emitter */}
            <div 
               className="absolute flex items-center justify-center"
               style={{
                  left: `${(EMITTER.x / GRID_W) * 100}%`,
                  top: `${(EMITTER.y / 7) * 100}%`,
                  width: `${100 / GRID_W}%`,
                  height: `${100 / 7}%`
               }}
            >
               <div className="w-2/3 h-2/3 bg-slate-400 rounded-sm flex items-center justify-center shadow-lg relative">
                  <div className="absolute right-0 w-1/2 h-1 bg-red-500 rounded-r-full animate-pulse" />
               </div>
            </div>

            {/* Receiver */}
            <div 
               className="absolute flex items-center justify-center"
               style={{
                  left: `${(RECEIVER.x / GRID_W) * 100}%`,
                  top: `${(RECEIVER.y / 7) * 100}%`,
                  width: `${100 / GRID_W}%`,
                  height: `${100 / 7}%`
               }}
            >
               <div className={`w-2/3 h-2/3 rounded-full border-4 transition-colors duration-500 flex items-center justify-center ${gameState === 'won' ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,1)]' : 'border-slate-500 bg-slate-800'}`}>
                  <div className={`w-1/3 h-1/3 rounded-full transition-colors duration-500 ${gameState === 'won' ? 'bg-red-500' : 'bg-slate-600'}`} />
               </div>
            </div>
         </div>

         {/* Laser SVG Overlay */}
         {gameState !== "start" && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
               {laserPath.length > 1 && (
                  <motion.polyline
                     points={laserPath.map(p => `${(p.x + 0.5) * (100/GRID_W)}%, ${(p.y + 0.5) * (100/7)}%`).join(' ')}
                     fill="none"
                     stroke={primaryColor}
                     strokeWidth="4"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 0.3 }}
                     style={{ filter: `drop-shadow(0px 0px 6px ${primaryColor})` }}
                  />
               )}
            </svg>
         )}

         {/* Mirrors */}
         <div className="absolute inset-0 pointer-events-none">
            {mirrors.map(m => (
               <motion.div
                  key={m.id}
                  className="absolute pointer-events-auto flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                  style={{
                     width: `${100 / GRID_W}%`,
                     height: `${100 / 7}%`
                  }}
                  initial={false}
                  animate={{
                     left: `${(m.x / GRID_W) * 100}%`,
                     top: `${(m.y / 7) * 100}%`
                  }}
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(m.id, e, info)}
                  onTap={() => handleMirrorTap(m.id)}
               >
                  <motion.div 
                     className="w-2/3 h-2/3 bg-slate-300 rounded-sm shadow-xl flex items-center justify-center border-b-4 border-slate-500 relative overflow-hidden"
                     animate={{ rotate: m.rot === 0 ? 0 : 90 }}
                     transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                  >
                     <div className="absolute w-[120%] h-1.5 bg-sky-400 rotate-45 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  </motion.div>
               </motion.div>
            ))}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Laser Reflector
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag mirrors onto the grid.<br/>Tap to rotate.<br/>Hit the target.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="bg-red-500 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Power On
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
                  <div className="text-red-500 font-black uppercase tracking-widest mb-6 text-sm">Target Hit</div>
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
                  setMirrors([
                     { id: "m1", x: 1, y: 2, rot: 1 },
                     { id: "m2", x: 1, y: 5, rot: 0 },
                     { id: "m3", x: 3, y: 5, rot: 0 },
                     { id: "m4", x: 3, y: 2, rot: 1 },
                  ]);
               }}
               className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-red-400 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
