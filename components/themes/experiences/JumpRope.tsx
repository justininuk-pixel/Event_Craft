"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_JUMPS = 5;
const ROPE_SPEED = 0.06; // radians per frame
const JUMP_DURATION = 40; // frames
const GROUND_Y = 320;
const JUMP_HEIGHT = 100;
const ROPE_RADIUS_Y = 120;
const ROPE_RADIUS_X = 140;

export function JumpRope({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // Emerald 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [jumpsLeft, setJumpsLeft] = useState(TARGET_JUMPS);
  const [playerY, setPlayerY] = useState(GROUND_Y);
  const [ropeAngle, setRopeAngle] = useState(0);

  const engineRef = useRef<{
     animationId: number;
     ropeAngle: number;
     jumpState: { active: boolean; frames: number };
     hasPassedNadir: boolean;
     active: boolean;
     jumpsRemaining: number;
  }>({
     animationId: 0,
     ropeAngle: 0,
     jumpState: { active: false, frames: 0 },
     hasPassedNadir: false,
     active: false,
     jumpsRemaining: TARGET_JUMPS
  });

  const startGame = () => {
     setGameState("playing");
     setJumpsLeft(TARGET_JUMPS);
     
     engineRef.current = {
        animationId: 0,
        ropeAngle: 0,
        jumpState: { active: false, frames: 0 },
        hasPassedNadir: false,
        active: true,
        jumpsRemaining: TARGET_JUMPS
     };
     
     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        // Update Rope
        sim.ropeAngle = (sim.ropeAngle + ROPE_SPEED) % (Math.PI * 2);
        
        // Update Player Jump
        let currentY = GROUND_Y;
        if (sim.jumpState.active) {
           sim.jumpState.frames++;
           const t = sim.jumpState.frames / JUMP_DURATION; // 0 to 1
           
           // Parabola: 4 * h * t * (1 - t) gives 0 at t=0, h at t=0.5, 0 at t=1
           currentY = GROUND_Y - (4 * JUMP_HEIGHT * t * (1 - t));
           
           if (sim.jumpState.frames >= JUMP_DURATION) {
              sim.jumpState.active = false;
              sim.jumpState.frames = 0;
              currentY = GROUND_Y;
           }
        }
        
        // Collision Detection
        // Nadir is around PI/2 (if 0 is right, PI/2 is bottom)
        const isNearNadir = sim.ropeAngle > (Math.PI / 2) - 0.2 && sim.ropeAngle < (Math.PI / 2) + 0.2;
        
        if (isNearNadir) {
           if (!sim.hasPassedNadir) {
              // The rope is passing the feet right now
              sim.hasPassedNadir = true;
              
              // Is player in the air?
              if (currentY < GROUND_Y - 20) { // Give a little threshold tolerance
                 // Success
                 sim.jumpsRemaining--;
                 if (sim.jumpsRemaining <= 0) {
                    sim.active = false;
                    setGameState("won");
    onComplete?.();
                    setTimeout(() => setShowPayload(true), 1500);
                 }
              } else {
                 // Hit the feet!
                 sim.active = false;
                 setGameState("lost");
              }
           }
        } else {
           // Reset flag when away from nadir
           if (sim.ropeAngle < (Math.PI / 2) - 0.5 || sim.ropeAngle > (Math.PI / 2) + 0.5) {
              sim.hasPassedNadir = false;
           }
        }
        
        // Update React State
        setPlayerY(currentY);
        setRopeAngle(sim.ropeAngle);
        setJumpsLeft(sim.jumpsRemaining);
        
        if (sim.active) {
           sim.animationId = requestAnimationFrame(loop);
        }
     };
     
     engineRef.current.animationId = requestAnimationFrame(loop);
  };

  useEffect(() => {
     return () => {
        if (engineRef.current.animationId) {
           cancelAnimationFrame(engineRef.current.animationId);
        }
     };
  }, []);

  const handleTap = () => {
     if (gameState !== "playing" || engineRef.current.jumpState.active) return;
     
     engineRef.current.jumpState.active = true;
     engineRef.current.jumpState.frames = 0;
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Calculate SVG Rope path
  // The posts are at (80, 200) and (240, 200)
  // The rope sweeps a 3D volume. We fake it by changing the Y-control point of a quadratic bezier.
  const ropeY = 200 + Math.sin(ropeAngle) * ROPE_RADIUS_Y;
  // To make it look like an arc, we use the control point at (160, ropeY + something)
  const cpY = 200 + Math.sin(ropeAngle) * (ROPE_RADIUS_Y * 1.5);
  // Z-index trick: if ropeAngle is between 0 and PI, it's swinging "down/front" (in front of player)
  // if PI to 2PI, it's swinging "up/back" (behind player)
  const isFront = Math.sin(ropeAngle) > 0;

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         onPointerDown={handleTap}
         className={`relative w-[320px] h-[480px] bg-slate-100 border-4 border-slate-300 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col cursor-pointer ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Scenery */}
         <div className="absolute inset-0 pointer-events-none flex flex-col">
            <div className="h-[220px] bg-sky-200" />
            <div className="flex-1 bg-emerald-100 border-t-4 border-emerald-300" />
         </div>

         {/* HUD */}
         <div className="absolute top-6 w-full flex justify-center z-30 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-2xl text-slate-800 shadow-sm border border-white">
               {jumpsLeft}
            </div>
         </div>

         {/* The Game Area */}
         <div className="absolute inset-0 z-20 pointer-events-none">
            
            {/* The Posts / Characters swinging the rope */}
            <div className="absolute w-12 h-24 bg-slate-800 rounded-t-full bottom-[160px] left-[40px] shadow-lg flex flex-col items-center pt-2">
               <div className="w-8 h-8 bg-slate-300 rounded-full" />
            </div>
            
            <div className="absolute w-12 h-24 bg-slate-800 rounded-t-full bottom-[160px] right-[40px] shadow-lg flex flex-col items-center pt-2">
               <div className="w-8 h-8 bg-slate-300 rounded-full" />
            </div>

            {/* Back Rope */}
            {!isFront && (
               <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
                  <path 
                     d={`M 60 220 Q 160 ${cpY} 260 220`}
                     fill="none"
                     stroke={primaryColor}
                     strokeWidth="4"
                     strokeLinecap="round"
                  />
               </svg>
            )}

            {/* The Player */}
            <div 
               className="absolute w-16 h-16 left-1/2 -ml-8 flex flex-col items-center justify-end drop-shadow-xl"
               style={{ top: playerY - 64 }}
            >
               {/* Head */}
               <div className="w-10 h-10 bg-amber-200 rounded-full border-4 border-amber-300 relative">
                  <div className="absolute top-2 left-1 w-2 h-2 bg-slate-800 rounded-full" />
                  <div className="absolute top-2 right-1 w-2 h-2 bg-slate-800 rounded-full" />
                  {/* Sweat drop if near target */}
                  {jumpsLeft <= 2 && (
                     <div className="absolute top-0 -right-2 w-2 h-3 bg-blue-400 rounded-full rounded-t-none animate-bounce" />
                  )}
               </div>
               {/* Body */}
               <div className="w-12 h-6 bg-red-500 rounded-full -mt-2 shadow-inner" />
            </div>

            {/* Front Rope */}
            {isFront && (
               <svg className="absolute inset-0 w-full h-full drop-shadow-md">
                  <path 
                     d={`M 60 220 Q 160 ${cpY} 260 220`}
                     fill="none"
                     stroke={primaryColor}
                     strokeWidth="6"
                     strokeLinecap="round"
                  />
               </svg>
            )}

         </div>

         {/* Start/Loss Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Double Dutch
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap to jump. Clear the rope {TARGET_JUMPS} times.
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Jumping
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-5xl uppercase tracking-widest drop-shadow-sm mb-2 text-center">
                     Tripped
                  </div>
                  <div className="text-red-300 font-bold mb-8">You hit the rope!</div>
                  <button 
                     onClick={startGame}
                     className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
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
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(16,185,129,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Perfect Rhythm</div>
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
                  if (engineRef.current.animationId) cancelAnimationFrame(engineRef.current.animationId);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Jump Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
