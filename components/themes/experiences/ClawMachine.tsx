"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "idle" | "dropping" | "retracting" | "won";

interface Prize {
   id: number;
   xPos: number; // 0 to 100 percentage
   isTarget: boolean;
   color: string;
}

export function ClawMachine({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [clawX, setClawX] = useState(50); // Percentage 0-100
  const [clawY, setClawY] = useState(10); // Percentage 10-80
  const [clawSpeed, setClawSpeed] = useState(40); // Base speed
  const [hasGrabbed, setHasGrabbed] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const requestRef = useRef<number>(0);
  const directionRef = useRef<number>(1);
  const dropStartTimeRef = useRef<number>(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"];

  // Generate Prizes (1 target, 6 duds)
  const [prizes] = useState<Prize[]>(() => {
     const arr: Prize[] = [];
     const targetIndex = Math.floor(Math.random() * 7);
     
     for (let i = 0; i < 7; i++) {
        arr.push({
           id: i,
           xPos: 10 + (i * 13) + (Math.random() * 4 - 2), // Spread them out
           isTarget: i === targetIndex,
           color: i === targetIndex ? primaryColor : "#cbd5e1" // Highlight target
        });
     }
     return arr;
  });

  const targetPrize = prizes.find(p => p.isTarget)!;

  // Animation Loop
  useEffect(() => {
     let lastTime = performance.now();

     const animate = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        if (gameState === "idle") {
           // Move horizontally
           setClawX(prev => {
              let nextX = prev + (clawSpeed * dt * directionRef.current);
              if (nextX > 95) {
                 nextX = 95;
                 directionRef.current = -1;
              } else if (nextX < 5) {
                 nextX = 5;
                 directionRef.current = 1;
              }
              return nextX;
           });
        } else if (gameState === "dropping") {
           // Drop vertically
           const elapsed = time - dropStartTimeRef.current;
           const dropDuration = 1000; // 1 second to drop
           const progress = Math.min(elapsed / dropDuration, 1);
           
           // Easing out
           const newY = 10 + (progress * 70); 
           setClawY(newY);

           if (progress >= 1) {
              // Reached bottom, check collision
              // Hitbox is roughly +/- 4% horizontally
              if (Math.abs(clawX - targetPrize.xPos) < 4) {
                 setHasGrabbed(true);
              }
              setGameState("retracting");
              dropStartTimeRef.current = time; // Reuse for retract timing
           }
        } else if (gameState === "retracting") {
           // Retract vertically
           const elapsed = time - dropStartTimeRef.current;
           const retractDuration = 1500; // 1.5 seconds to retract (slower)
           const progress = Math.min(elapsed / retractDuration, 1);
           
           const newY = 80 - (progress * 70);
           setClawY(newY);

           if (progress >= 1) {
              if (hasGrabbed) {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 500);
              } else {
                 setGameState("idle");
              }
           }
        }

        requestRef.current = requestAnimationFrame(animate);
     };

     requestRef.current = requestAnimationFrame(animate);
     return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, clawSpeed, clawX, targetPrize.xPos, hasGrabbed]);

  const handleDrop = () => {
     if (gameState === "idle") {
        setGameState("dropping");
        dropStartTimeRef.current = performance.now();
     }
  };

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
      
      {/* Arcade Cabinet Screen */}
      <div className="relative w-full max-w-2xl h-[60vh] bg-sky-100 border-[16px] border-zinc-800 rounded-t-3xl shadow-2xl overflow-hidden shadow-[inset_0_20px_50px_rgba(0,0,0,0.2)]">
         
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwTDIwIDIwWk0yMCAwTDAgMjBaIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 pointer-events-none" />

         {/* The Top Track */}
         <div className="absolute top-0 left-0 w-full h-[10%] bg-zinc-700 border-b-4 border-zinc-900 shadow-xl" />

         {/* The Claw System */}
         <div 
            className="absolute top-0 w-12 flex flex-col items-center transition-transform"
            style={{ 
               left: `${clawX}%`, 
               transform: 'translateX(-50%)',
               height: `${clawY}%`
            }}
         >
            {/* Trolley */}
            <div className="w-16 h-4 bg-zinc-600 rounded-full border-2 border-zinc-800 shadow-md z-20" />
            
            {/* String/Cable */}
            <div className="flex-1 w-1 bg-zinc-400 border-x border-zinc-500 origin-top scale-y-100 z-10" />
            
            {/* The Claw Hand */}
            <div className="relative w-16 h-12 z-20">
               {/* Center hub */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-600 rounded-full border-2 border-zinc-800" />
               {/* Left Prong */}
               <motion.div 
                  className="absolute top-4 left-0 w-4 h-10 border-l-4 border-b-4 border-zinc-700 rounded-bl-xl origin-top-right"
                  animate={{ rotate: gameState === "dropping" ? 20 : (hasGrabbed ? -10 : 0) }}
               />
               {/* Right Prong */}
               <motion.div 
                  className="absolute top-4 right-0 w-4 h-10 border-r-4 border-b-4 border-zinc-700 rounded-br-xl origin-top-left"
                  animate={{ rotate: gameState === "dropping" ? -20 : (hasGrabbed ? 10 : 0) }}
               />
            </div>
         </div>

         {/* The Prize Pit */}
         <div className="absolute bottom-0 left-0 w-full h-[25%] bg-blue-100/50 backdrop-blur-sm border-t-2 border-white/50 flex items-end pb-2 px-8 overflow-hidden z-0">
            {prizes.map(p => {
               // If it's the target and we've grabbed it, it moves with the claw
               const isGrabbedTarget = hasGrabbed && p.isTarget;
               
               if (isGrabbedTarget) {
                  return null; // Rendered inside the claw instead
               }

               return (
                  <div 
                     key={p.id}
                     className="absolute bottom-2 w-12 h-12 rounded-full shadow-lg border-4 border-white/20 flex items-center justify-center"
                     style={{ 
                        left: `${p.xPos}%`,
                        transform: 'translateX(-50%)',
                        backgroundColor: p.color
                     }}
                  >
                     <div className="w-8 h-4 bg-white/30 rounded-full absolute top-1 blur-[1px]" />
                  </div>
               );
            })}
         </div>

         {/* Grabbed Target Rendered with Claw */}
         {hasGrabbed && (
            <div 
               className="absolute w-12 h-12 rounded-full shadow-lg border-4 border-white/20 flex items-center justify-center z-10"
               style={{ 
                  left: `${clawX}%`,
                  top: `calc(${clawY}% - 12px)`, // Offset to sit in claws
                  transform: 'translateX(-50%)',
                  backgroundColor: targetPrize.color
               }}
            >
               <div className="w-8 h-4 bg-white/30 rounded-full absolute top-1 blur-[1px]" />
            </div>
         )}
         
      </div>

      {/* Control Panel */}
      <div className="w-full max-w-2xl bg-zinc-900 p-8 rounded-b-3xl shadow-2xl flex flex-col items-center border-t-4 border-zinc-700">
         <button
            onClick={handleDrop}
            disabled={gameState !== "idle"}
            className="w-32 h-32 rounded-full border-[8px] border-red-900 bg-red-500 shadow-[0_8px_0_#7f1d1d,0_15px_20px_rgba(0,0,0,0.5)] active:shadow-[0_0px_0_#7f1d1d,0_5px_10px_rgba(0,0,0,0.5)] active:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:bg-red-400"
         >
            <span className="text-white font-black text-2xl uppercase tracking-tighter drop-shadow-md">
               Drop
            </span>
         </button>
         <div className="text-zinc-500 text-[10px] uppercase tracking-widest mt-6 font-bold">
            Aim for the glowing capsule
         </div>
      </div>

      {/* Payload Modal */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <motion.div 
                  className="bg-white p-12 rounded-3xl max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
                  
                  <div className="w-20 h-20 mx-auto rounded-full mb-8 flex items-center justify-center shadow-inner border-4 border-slate-100" style={{ backgroundColor: primaryColor }}>
                     <span className="text-3xl">🏆</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900">
                     {config.title}
                  </h1>
                  
                  <p className="text-xl text-slate-600 font-serif leading-relaxed">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !showPayload && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-black/10 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Claw Speed
            </h2>
            <div className="flex w-full items-center gap-4">
               <span className="text-slate-400 text-xs font-mono">Slow</span>
               <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  step="5"
                  value={clawSpeed} 
                  onChange={(e) => setClawSpeed(parseInt(e.target.value))}
                  className="flex-1 accent-red-500"
               />
               <span className="text-slate-400 text-xs font-mono">Fast</span>
            </div>
         </div>
      )}
      
    </div>
  );
}
