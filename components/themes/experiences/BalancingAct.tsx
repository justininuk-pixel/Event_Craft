"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

const WIN_TIME = 10; // seconds
const GRAVITY = 15; // Angular acceleration scale
const TILT_FORCE = 12; // Force applied by user tap/arrow keys
const MAX_ANGLE = 75; // Angle at which pole falls

export function BalancingAct({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [gameState, setGameState] = useState<GameState>("start");
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  // Physics state
  const physRef = useRef({ angle: 0, angularVelocity: 0 });
  const inputRef = useRef({ left: false, right: false });
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const gameTimeRef = useRef<number>(0);

  const initGame = () => {
     // Start with a slight random tilt so it doesn't just sit perfectly still
     physRef.current = { 
        angle: (Math.random() - 0.5) * 10, 
        angularVelocity: 0 
     };
     inputRef.current = { left: false, right: false };
     gameTimeRef.current = 0;
     setTimeSurvived(0);
     setCurrentAngle(physRef.current.angle);
     setGameState("playing");
  };

  // Main Loop
  useEffect(() => {
     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        if (gameState === "playing") {
           gameTimeRef.current += dt;
           setTimeSurvived(gameTimeRef.current);

           if (gameTimeRef.current >= WIN_TIME) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           } else {
              const state = physRef.current;
              const input = inputRef.current;

              // Apply simulated gravity (pendulum physics: angular acceleration = (g/L) * sin(theta))
              // We'll use a simplified model
              const angleRad = state.angle * (Math.PI / 180);
              let angularAcceleration = Math.sin(angleRad) * GRAVITY;

               // Increase difficulty over time
               const difficultyMult = 1 + (gameTimeRef.current / WIN_TIME) * 0.5;
               angularAcceleration *= difficultyMult;

              // Apply user input
              if (input.left) angularAcceleration -= TILT_FORCE;
              if (input.right) angularAcceleration += TILT_FORCE;

              // Damping
              state.angularVelocity *= 0.98;

              // Update physics
              state.angularVelocity += angularAcceleration * dt * 10;
              state.angle += state.angularVelocity * dt * 10;

              setCurrentAngle(state.angle);

              // Check loss
              if (Math.abs(state.angle) > MAX_ANGLE) {
                 setGameState("lost");
              }
           }
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") inputRef.current.left = true;
        if (e.key === "ArrowRight") inputRef.current.right = true;
     };
     const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") inputRef.current.left = false;
        if (e.key === "ArrowRight") inputRef.current.right = false;
     };
     
     window.addEventListener("keydown", handleKeyDown);
     window.addEventListener("keyup", handleKeyUp);
     
     return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
     };
  }, []);

  // Device Orientation (Tilt)
  useEffect(() => {
     const handleOrientation = (e: DeviceOrientationEvent) => {
        if (gameState !== "playing" || !e.gamma) return;
        
        // gamma is the left-to-right tilt in degrees, where right is positive
        const tilt = e.gamma;
        
        // If device is tilted left (-gamma), we want to push pole left (negative acceleration)
        // If device is tilted right (+gamma), we want to push pole right (positive acceleration)
        // Apply a small force based on tilt
        
        // Disable arrow key inputs if using gyro to prevent double force, or just let them combine
        // We'll just directly influence the angular acceleration in the loop, or set a fake input state
        // Let's set the input state based on threshold
        if (tilt < -10) {
           inputRef.current.left = true;
           inputRef.current.right = false;
        } else if (tilt > 10) {
           inputRef.current.right = true;
           inputRef.current.left = false;
        } else {
           // Deadzone
           inputRef.current.left = false;
           inputRef.current.right = false;
        }
     };

     // Only listen if supported (some modern browsers block this without permission)
     if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation);
     }
     
     return () => {
        if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
           window.removeEventListener("deviceorientation", handleOrientation);
        }
     };
  }, [gameState]);


  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Area Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[2/3] shadow-2xl overflow-hidden bg-slate-900 transition-all duration-1000 flex flex-col ${gameState === "won" ? "border-2 border-transparent" : "border-8 border-slate-800 rounded-[2rem]"}`}
      >
         
         {/* The Payload Area (Hidden initially, then fills screen) */}
         <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${showPayload ? "h-full bg-slate-900 p-8 flex flex-col justify-center items-center z-40" : "h-0 opacity-0"}`}>
            <motion.div 
               animate={showPayload ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
               transition={{ duration: 1 }}
               className="text-center w-full"
            >
               <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-md mb-6">
                  {config.title}
               </h1>
               <p className="text-xl text-slate-300 font-serif leading-relaxed">
                  {config.body}
               </p>
            </motion.div>
         </div>

         {/* Physics Visuals (Pole) */}
         <div className={`flex-1 relative flex justify-center items-end pb-12 transition-opacity duration-1000 ${showPayload ? "opacity-0" : "opacity-100"}`}>
            
            {/* The Finger/Base */}
            <div className="absolute bottom-8 w-16 h-8 bg-slate-700 rounded-t-full shadow-inner z-10" />
            <div className="absolute bottom-0 w-24 h-8 bg-slate-800 rounded-t-xl" />

            {/* The Pole Container */}
            <div 
               className="absolute bottom-[2.5rem] flex flex-col items-center justify-end origin-bottom"
               style={{ 
                  height: "70%",
                  transform: `rotate(${currentAngle}deg)`,
                  transition: gameState === "playing" ? "none" : "transform 0.5s ease-out"
               }}
            >
               {/* The Pole itself */}
               <div 
                  className="w-6 h-full rounded-t-full shadow-2xl relative overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
               >
                  {/* Styling details */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/20 via-transparent to-white/20" />
                  <div className="absolute top-2 left-1 right-1 h-8 rounded-full bg-white/30" />
                  {/* Stripes */}
                  <div className="absolute top-[20%] w-full h-4 bg-black/10" />
                  <div className="absolute top-[50%] w-full h-4 bg-black/10" />
                  <div className="absolute top-[80%] w-full h-4 bg-black/10" />
               </div>
            </div>
         </div>

         {/* HUD */}
         <div className={`absolute top-4 left-0 w-full px-6 flex justify-between z-20 pointer-events-none transition-opacity ${showPayload ? "opacity-0" : "opacity-100"}`}>
            <div className="text-white font-mono font-bold text-xl drop-shadow-md">
               TIME: {Math.max(0, WIN_TIME - Math.floor(timeSurvived))}
            </div>
         </div>

         {/* Touch Controls Overlay */}
         <div className={`absolute inset-0 z-10 flex transition-opacity ${gameState === "playing" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div 
               className="flex-1" 
               onPointerDown={() => inputRef.current.left = true}
               onPointerUp={() => inputRef.current.left = false}
               onPointerLeave={() => inputRef.current.left = false}
            />
            <div 
               className="flex-1"
               onPointerDown={() => inputRef.current.right = true}
               onPointerUp={() => inputRef.current.right = false}
               onPointerLeave={() => inputRef.current.right = false}
            />
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Balancing Act
                  </div>
                  <div className="text-blue-200 font-bold text-center px-8 mb-8 text-sm">
                     Tap LEFT or RIGHT sides of the screen (or use arrow keys) to keep the pole balanced!
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); initGame(); }}
                     className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase hover:scale-105 active:scale-95 transition-transform"
                  >
                     Start Balance
                  </button>
               </motion.div>
            )}

            {/* Lost Overlay */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Fell Over
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     {Math.floor(timeSurvived)}s Survived
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); initGame(); }}
                     className="bg-white text-red-900 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setTimeSurvived(WIN_TIME);
                  gameTimeRef.current = WIN_TIME;
                  setCurrentAngle(0);
                  physRef.current.angle = 0;
                  physRef.current.angularVelocity = 0;
               }}
               className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
