"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const MAP_W = 1000;
const MAP_H = 1000;
const VIEW_W = 320;
const VIEW_H = 480;

const REQUIRED_LOCK_FRAMES = 180; // 3 seconds at 60fps
const HIT_RADIUS = 40;

export function TargetReticle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#eff6ff"]; // Blue 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [lockProgress, setLockProgress] = useState(0); // 0 to 100
  
  // React State for rendering
  const [camPos, setCamPos] = useState({ x: MAP_W / 2 - VIEW_W / 2, y: MAP_H / 2 - VIEW_H / 2 });
  const [targetPos, setTargetPos] = useState({ x: MAP_W / 2, y: MAP_H / 2 });

  const engineRef = useRef<{
     animationId: number;
     camX: number;
     camY: number;
     targetX: number;
     targetY: number;
     targetVX: number;
     targetVY: number;
     lockFrames: number;
     active: boolean;
     pointerId: number | null;
     lastPointerX: number;
     lastPointerY: number;
  }>({
     animationId: 0,
     camX: MAP_W / 2 - VIEW_W / 2,
     camY: MAP_H / 2 - VIEW_H / 2,
     targetX: MAP_W / 2,
     targetY: MAP_H / 2,
     targetVX: 0,
     targetVY: 0,
     lockFrames: 0,
     active: false,
     pointerId: null,
     lastPointerX: 0,
     lastPointerY: 0
  });

  const startGame = () => {
     setGameState("playing");
     setLockProgress(0);
     
     engineRef.current.active = true;
     engineRef.current.lockFrames = 0;
     engineRef.current.camX = MAP_W / 2 - VIEW_W / 2;
     engineRef.current.camY = MAP_H / 2 - VIEW_H / 2;
     
     // Start target slightly off-center
     engineRef.current.targetX = MAP_W / 2 + 100;
     engineRef.current.targetY = MAP_H / 2 - 100;
     engineRef.current.targetVX = (Math.random() - 0.5) * 4;
     engineRef.current.targetVY = (Math.random() - 0.5) * 4;
     
     let frameCount = 0;

     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        frameCount++;
        
        // --- Target AI ---
        // Every 30 frames, slightly adjust velocity vector
        if (frameCount % 30 === 0) {
           sim.targetVX += (Math.random() - 0.5) * 2;
           sim.targetVY += (Math.random() - 0.5) * 2;
           
           // Cap speed
           const speed = Math.hypot(sim.targetVX, sim.targetVY);
           if (speed > 4) {
              sim.targetVX = (sim.targetVX / speed) * 4;
              sim.targetVY = (sim.targetVY / speed) * 4;
           }
        }
        
        // Move Target
        sim.targetX += sim.targetVX;
        sim.targetY += sim.targetVY;
        
        // Bounce off map edges
        if (sim.targetX < 50) { sim.targetX = 50; sim.targetVX *= -1; }
        if (sim.targetX > MAP_W - 50) { sim.targetX = MAP_W - 50; sim.targetVX *= -1; }
        if (sim.targetY < 50) { sim.targetY = 50; sim.targetVY *= -1; }
        if (sim.targetY > MAP_H - 50) { sim.targetY = MAP_H - 50; sim.targetVY *= -1; }
        
        // --- Hit Detection ---
        const reticleMapX = sim.camX + VIEW_W / 2;
        const reticleMapY = sim.camY + VIEW_H / 2;
        
        const dist = Math.hypot(reticleMapX - sim.targetX, reticleMapY - sim.targetY);
        
        if (dist < HIT_RADIUS) {
           sim.lockFrames += 1;
           if (sim.lockFrames >= REQUIRED_LOCK_FRAMES) {
              sim.active = false;
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }
        } else {
           sim.lockFrames = Math.max(0, sim.lockFrames - 2); // Drains faster than it fills
        }
        
        // --- Update React State ---
        setCamPos({ x: sim.camX, y: sim.camY });
        setTargetPos({ x: sim.targetX, y: sim.targetY });
        setLockProgress(Math.min(100, (sim.lockFrames / REQUIRED_LOCK_FRAMES) * 100));
        
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

  // --- Pan Controls ---
  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     engineRef.current.pointerId = e.pointerId;
     engineRef.current.lastPointerX = e.clientX;
     engineRef.current.lastPointerY = e.clientY;
     (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     const sim = engineRef.current;
     if (sim.pointerId !== e.pointerId) return;
     
     const dx = e.clientX - sim.lastPointerX;
     const dy = e.clientY - sim.lastPointerY;
     
     // Invert: dragging left moves camera right (feels like pulling the map)
     sim.camX -= dx;
     sim.camY -= dy;
     
     // Clamp camera to map bounds
     sim.camX = Math.max(0, Math.min(MAP_W - VIEW_W, sim.camX));
     sim.camY = Math.max(0, Math.min(MAP_H - VIEW_H, sim.camY));
     
     sim.lastPointerX = e.clientX;
     sim.lastPointerY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
     if (engineRef.current.pointerId === e.pointerId) {
        engineRef.current.pointerId = null;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Map elements position
  const targetScreenX = targetPos.x - camPos.x;
  const targetScreenY = targetPos.y - camPos.y;

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}
         className={`relative w-[320px] h-[480px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col cursor-grab active:cursor-grabbing ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* The Map Surface */}
         <div 
            className="absolute"
            style={{
               width: MAP_W,
               height: MAP_H,
               transform: `translate(${-camPos.x}px, ${-camPos.y}px)`,
               backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.05) 2px, transparent 0)`,
               backgroundSize: '40px 40px'
            }}
         >
            {/* Grid Lines for reference */}
            <div className="w-full h-full opacity-10 pointer-events-none"
               style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                  backgroundSize: '100px 100px'
               }}
            />
         </div>

         {/* Target */}
         {gameState === "playing" && (
            <div 
               className="absolute w-12 h-12 -ml-6 -mt-6 pointer-events-none z-10"
               style={{
                  left: targetScreenX,
                  top: targetScreenY
               }}
            >
               <motion.div 
                  className="w-full h-full rounded-full border-4 border-dashed"
                  style={{ borderColor: primaryColor }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               />
               <div className="absolute inset-0 m-auto w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
         )}

         {/* Central Reticle */}
         <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            
            {/* Lock Progress Circle */}
            <svg className="absolute w-32 h-32 -rotate-90">
               <circle 
                  cx="64" cy="64" r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
               />
               <circle 
                  cx="64" cy="64" r="50"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="6"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * lockProgress) / 100}
                  className="transition-all duration-100 ease-linear"
               />
            </svg>

            {/* Crosshair */}
            <div className={`relative w-16 h-16 transition-colors duration-200 ${lockProgress > 95 ? 'text-green-500' : lockProgress > 0 ? 'text-white' : 'text-slate-500'}`}>
               <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-current" />
               <div className="absolute left-0 right-0 top-1/2 -mt-[1px] h-[2px] bg-current" />
               <div className="absolute inset-0 border-2 border-current rounded-full opacity-50" />
               
               {/* Center dot */}
               <div className="absolute inset-0 m-auto w-1 h-1 bg-current rounded-full" />
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
                     Lock On
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag to pan the camera.<br/>Keep the target in your sights for 3 seconds.
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Engage Tracker
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
                  className="bg-slate-900 border border-slate-700 p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(59,130,246,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Target Acquired</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-300 font-serif leading-relaxed">
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
                  setLockProgress(100);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Lock Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
