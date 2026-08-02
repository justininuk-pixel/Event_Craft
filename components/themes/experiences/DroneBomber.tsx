"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GAME_W = 320;
const GAME_H = 480;
const SCROLL_SPEED = 4; // px per frame
const FALL_TIME = 90; // frames (~1.5s at 60fps)
const TARGET_Y_START = -200;
const DRONE_Y = 400;

export function DroneBomber({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // Sky 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e0f2fe"]; // Sky 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [groundOffset, setGroundOffset] = useState(0);
  const [targetY, setTargetY] = useState(TARGET_Y_START);
  const [packageState, setPackageState] = useState<{ active: boolean; y: number; scale: number; droppedAt: number; frames: number }>({
     active: false, y: DRONE_Y, scale: 1, droppedAt: 0, frames: 0
  });

  const engineRef = useRef<{
     animationId: number;
     groundY: number;
     targetY: number;
     pkg: { active: boolean; y: number; scale: number; frames: number };
     active: boolean;
  }>({
     animationId: 0,
     groundY: 0,
     targetY: TARGET_Y_START,
     pkg: { active: false, y: DRONE_Y, scale: 1, frames: 0 },
     active: false
  });

  const startGame = () => {
     setGameState("playing");
     
     engineRef.current = {
        animationId: 0,
        groundY: 0,
        targetY: TARGET_Y_START,
        pkg: { active: false, y: DRONE_Y, scale: 1, frames: 0 },
        active: true
     };
     
     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        // Update Ground & Target
        sim.groundY = (sim.groundY + SCROLL_SPEED) % 100;
        sim.targetY += SCROLL_SPEED;
        
        // Update Package
        if (sim.pkg.active) {
           sim.pkg.frames++;
           
           // Physics: Package moves UP screen initially (matching drone ground speed), 
           // but decelerates relative to the ground.
           // Let's model it simpler:
           // It visually drifts UP away from drone (since ground is scrolling DOWN).
           // Drift speed starts high and decays to 0.
           const t = sim.pkg.frames / FALL_TIME; // 0 to 1
           
           sim.pkg.y = DRONE_Y - (1 - Math.pow(1 - t, 2)) * 180; // Ease out quadratic drift
           sim.pkg.scale = 1 - 0.6 * t; // Shrinks to 0.4
           
           if (sim.pkg.frames >= FALL_TIME) {
              // Landed!
              sim.pkg.active = false;
              
              // Hit detection
              const pkgHitY = sim.pkg.y;
              // Target is drawn with center at targetY
              if (Math.abs(pkgHitY - sim.targetY) < 40) {
                 sim.active = false;
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 1500);
              } else {
                 sim.active = false;
                 setGameState("lost");
              }
           }
        } else {
           // Target goes off screen without dropping
           if (sim.targetY > GAME_H + 100) {
              sim.active = false;
              setGameState("lost");
           }
        }
        
        // Update React State
        setGroundOffset(sim.groundY);
        setTargetY(sim.targetY);
        setPackageState({ ...sim.pkg, droppedAt: 0 }); // Just copying values
        
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

  const handlePointerDown = () => {
     if (gameState !== "playing" || engineRef.current.pkg.active) return;
     
     engineRef.current.pkg = {
        active: true,
        y: DRONE_Y,
        scale: 1,
        frames: 0
     };
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
         onPointerDown={handlePointerDown}
         className={`relative w-[320px] h-[480px] bg-emerald-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col cursor-pointer ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Scrolling Ground Pattern */}
         <div 
            className="absolute inset-0 w-full h-[200%] pointer-events-none opacity-20"
            style={{
               backgroundImage: `radial-gradient(circle at 10px 10px, #000 2px, transparent 0)`,
               backgroundSize: '40px 40px',
               transform: `translateY(${groundOffset - 40}px)`
            }}
         />
         
         <div 
            className="absolute inset-0 w-full h-[200%] pointer-events-none opacity-10"
            style={{
               backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .3) 25%, rgba(0, 0, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .3) 75%, rgba(0, 0, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .3) 25%, rgba(0, 0, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .3) 75%, rgba(0, 0, 0, .3) 76%, transparent 77%, transparent)`,
               backgroundSize: '50px 50px',
               transform: `translateY(${groundOffset - 50}px)`
            }}
         />

         {/* Target Pad */}
         <div 
            className="absolute left-1/2 -ml-12 w-24 h-24 border-4 border-dashed rounded-full flex items-center justify-center"
            style={{ 
               top: targetY - 48,
               borderColor: primaryColor,
               backgroundColor: `${primaryColor}33` // 20% opacity
            }}
         >
            <div className="w-4 h-4 bg-white rounded-full" />
            <div className="absolute font-black text-[10px] tracking-widest text-white mt-12 uppercase drop-shadow-md">Drop Zone</div>
         </div>

         {/* The Package (When Dropped) */}
         {packageState.active && (
            <div 
               className="absolute left-1/2 -ml-6 w-12 h-12 bg-amber-700 border-2 border-amber-900 shadow-lg flex items-center justify-center"
               style={{ 
                  top: packageState.y - 24,
                  transform: `scale(${packageState.scale})`,
                  opacity: 1
               }}
            >
               <div className="w-full h-1 bg-amber-900 absolute top-1/2 -mt-[2px]" />
               <div className="h-full w-1 bg-amber-900 absolute left-1/2 -ml-[2px]" />
            </div>
         )}

         {/* The Drone (Fixed near bottom) */}
         <div 
            className="absolute left-1/2 -ml-16 w-32 h-32 pointer-events-none drop-shadow-2xl"
            style={{ top: DRONE_Y - 64 }}
         >
            {/* Drone Body */}
            <div className="absolute inset-0 m-auto w-16 h-16 bg-slate-200 rounded-2xl border-4 border-slate-300 shadow-inner flex items-center justify-center">
               {/* Package Holder (if not dropped) */}
               {!packageState.active && (
                  <div className="w-8 h-8 bg-amber-700 border-2 border-amber-900">
                     <div className="w-full h-1 bg-amber-900 absolute top-1/2 -mt-[2px]" />
                     <div className="h-full w-1 bg-amber-900 absolute left-1/2 -ml-[2px]" />
                  </div>
               )}
            </div>
            
            {/* Arms & Props */}
            <div className="absolute top-2 left-2 w-10 h-10 border-[6px] border-slate-400 rounded-full flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }} className="w-8 h-2 bg-slate-800/30 rounded-full" />
            </div>
            <div className="absolute top-2 right-2 w-10 h-10 border-[6px] border-slate-400 rounded-full flex items-center justify-center">
               <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }} className="w-8 h-2 bg-slate-800/30 rounded-full" />
            </div>
            <div className="absolute bottom-2 left-2 w-10 h-10 border-[6px] border-slate-400 rounded-full flex items-center justify-center">
               <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }} className="w-8 h-2 bg-slate-800/30 rounded-full" />
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 border-[6px] border-slate-400 rounded-full flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }} className="w-8 h-2 bg-slate-800/30 rounded-full" />
            </div>
         </div>

         {/* Start/Loss Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Drone Drop
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap once to drop the package.<br/>Account for momentum!
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Flight
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
                     Missed
                  </div>
                  <div className="text-red-300 font-bold mb-8">The package missed the target.</div>
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Direct Hit</div>
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
               Auto-Hit Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
