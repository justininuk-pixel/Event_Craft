"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const BOARD_W = 320;
const BOARD_H = 480;
const PEG_RADIUS = 6;
const BALL_RADIUS = 10;
const ROWS = 9;
const COLS = 7;
const GRAVITY = 0.5;
const BOUNCE_DAMP = 0.6;
const FRICTION = 0.99;

// Generate Pegs
const PEGS: { x: number, y: number }[] = [];
const startY = 80;
const ySpacing = 40;
const xSpacing = 40;

for (let r = 0; r < ROWS; r++) {
   const isOffset = r % 2 !== 0;
   const colsInRow = isOffset ? COLS - 1 : COLS;
   
   for (let c = 0; c < colsInRow; c++) {
      const xOffset = isOffset ? xSpacing / 2 : 0;
      const x = (BOARD_W - ((COLS - 1) * xSpacing)) / 2 + c * xSpacing + xOffset;
      const y = startY + r * ySpacing;
      PEGS.push({ x, y });
   }
}

// Bins at the bottom (x coordinates for dividers)
const BINS = 5;
const binWidth = BOARD_W / BINS;
const WIN_BIN = 2; // The middle bin

export function PlinkoDrop({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // Amber 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#451a03"]; // Amber 950

  const [gameState, setGameState] = useState<"start" | "dropping" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [ballPos, setBallPos] = useState<{ x: number, y: number } | null>(null);

  const engineRef = useRef<{
     x: number,
     y: number,
     vx: number,
     vy: number,
     active: boolean,
     animationId: number
  }>({
     x: 0, y: 0, vx: 0, vy: 0, active: false, animationId: 0
  });

  const dropBall = (startX: number) => {
     if (gameState === "dropping" || gameState === "won") return;
     
     setGameState("dropping");
     setBallPos({ x: startX, y: 20 });
     
     engineRef.current = {
        x: startX,
        y: 20,
        vx: (Math.random() - 0.5) * 2, // Slight random horizontal nudge
        vy: 0,
        active: true,
        animationId: 0
     };

     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;

        // Apply forces
        sim.vy += GRAVITY;
        sim.vx *= FRICTION;
        sim.vy *= FRICTION;

        // Move
        sim.x += sim.vx;
        sim.y += sim.vy;

        // Wall collisions
        if (sim.x - BALL_RADIUS < 0) {
           sim.x = BALL_RADIUS;
           sim.vx *= -BOUNCE_DAMP;
        } else if (sim.x + BALL_RADIUS > BOARD_W) {
           sim.x = BOARD_W - BALL_RADIUS;
           sim.vx *= -BOUNCE_DAMP;
        }

        // Peg collisions
        for (let i = 0; i < PEGS.length; i++) {
           const p = PEGS[i];
           const dx = sim.x - p.x;
           const dy = sim.y - p.y;
           const distSq = dx*dx + dy*dy;
           const minDist = BALL_RADIUS + PEG_RADIUS;
           
           if (distSq < minDist * minDist) {
              const dist = Math.sqrt(distSq);
              // Resolve overlap
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;
              
              sim.x += nx * overlap;
              sim.y += ny * overlap;

              // Reflect velocity
              const dot = sim.vx * nx + sim.vy * ny;
              sim.vx = (sim.vx - 2 * dot * nx) * BOUNCE_DAMP;
              sim.vy = (sim.vy - 2 * dot * ny) * BOUNCE_DAMP;

              // Add a tiny random jitter to prevent perfect vertical loops
              sim.vx += (Math.random() - 0.5) * 1.5;
           }
        }

        // Floor collision / Bin evaluation
        if (sim.y > BOARD_H - BALL_RADIUS) {
           sim.y = BOARD_H - BALL_RADIUS;
           sim.vy *= -0.3; // Tiny bounce on bottom
           sim.vx = 0;

           // Calculate which bin it landed in
           const binIndex = Math.floor(sim.x / binWidth);
           
           sim.active = false;
           
           // Slight delay before ending
           setTimeout(() => {
              if (binIndex === WIN_BIN) {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 1500);
              } else {
                 setGameState("lost");
              }
           }, 800);
        }

        setBallPos({ x: sim.x, y: sim.y });

        if (sim.active) {
           sim.animationId = requestAnimationFrame(loop);
        }
     };

     engineRef.current.animationId = requestAnimationFrame(loop);
  };

  // Cleanup loop
  useEffect(() => {
     return () => {
        if (engineRef.current.animationId) {
           cancelAnimationFrame(engineRef.current.animationId);
        }
     };
  }, []);

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
         className={`relative w-[320px] h-[480px] bg-amber-900 border-4 border-amber-800 rounded-xl shadow-[inset_0_20px_50px_rgba(0,0,0,0.5),_0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Wood Texture simulation */}
         <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
               backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`
            }}
         />

         {/* Drop Zones (Top) */}
         <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-around z-20">
            {[1, 2, 3].map(col => (
               <button
                  key={col}
                  onClick={() => dropBall(BOARD_W * (col / 4))}
                  disabled={gameState === "dropping" || gameState === "won"}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${gameState !== 'start' && gameState !== 'lost' ? 'opacity-0 pointer-events-none' : 'border-amber-400 bg-amber-500/20 hover:bg-amber-500/50 cursor-pointer animate-pulse'}`}
               >
                  <span className="text-amber-300 text-xs font-black">↓</span>
               </button>
            ))}
         </div>

         {/* Pegs */}
         {PEGS.map((p, i) => (
            <div 
               key={i}
               className="absolute rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-amber-300 pointer-events-none"
               style={{
                  width: PEG_RADIUS * 2,
                  height: PEG_RADIUS * 2,
                  left: p.x - PEG_RADIUS,
                  top: p.y - PEG_RADIUS,
                  boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.5)'
               }}
            />
         ))}

         {/* Ball */}
         {ballPos && (
            <div 
               className="absolute rounded-full z-10"
               style={{
                  width: BALL_RADIUS * 2,
                  height: BALL_RADIUS * 2,
                  left: ballPos.x - BALL_RADIUS,
                  top: ballPos.y - BALL_RADIUS,
                  backgroundColor: primaryColor,
                  boxShadow: 'inset -3px -3px 6px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.5), 0 5px 10px rgba(0,0,0,0.4)',
                  transition: gameState === 'won' ? 'all 1s ease' : 'none'
               }}
            />
         )}

         {/* Bins (Bottom) */}
         <div className="absolute bottom-0 left-0 w-full h-24 flex items-end">
            {Array.from({ length: BINS }).map((_, i) => (
               <div 
                  key={i}
                  className="h-full flex-1 border-r border-amber-800/50 last:border-0 relative"
               >
                  {/* Bin Text */}
                  <div className={`absolute bottom-2 w-full text-center font-black uppercase tracking-widest text-[10px] ${i === WIN_BIN ? 'text-amber-400' : 'text-amber-950/50'}`}>
                     {i === WIN_BIN ? 'WIN' : 'LOSE'}
                  </div>
                  {/* Winning Glow */}
                  {i === WIN_BIN && (
                     <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent pointer-events-none" />
                  )}
               </div>
            ))}
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-2">
                     Missed!
                  </div>
                  <button 
                     onClick={() => {
                        setGameState("start");
                        setBallPos(null);
                     }}
                     className="mt-6 bg-red-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(245,158,11,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-amber-500 font-black uppercase tracking-widest mb-6 text-sm">Jackpot</div>
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
      {mode === "editor-preview" && gameState === "dropping" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  engineRef.current.active = false;
                  setBallPos({ x: (WIN_BIN + 0.5) * binWidth, y: BOARD_H - BALL_RADIUS });
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-amber-500 text-amber-950 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-amber-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
