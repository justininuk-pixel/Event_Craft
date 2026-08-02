"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

// Helper to calculate moon phase
// Returns 0 to 1 (0 = New, 0.5 = Full, 1 = New)
function getRealLunarPhase(): number {
   const LUNAR_MONTH = 29.53058867;
   // A known new moon date (e.g. Jan 6, 2000, 18:14 UTC)
   const NEW_MOON_TIMESTAMP = 947182440000;
   const diff = Date.now() - NEW_MOON_TIMESTAMP;
   const days = diff / (1000 * 60 * 60 * 24);
   let phase = (days % LUNAR_MONTH) / LUNAR_MONTH;
   if (phase < 0) phase += 1;
   return phase;
}

export function LunarPhaseLink({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<number>(getRealLunarPhase());
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fcd34d";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"];

  useEffect(() => {
     // A full moon is exactly 0.5, but we give a +/- 0.05 margin (about 1.5 days on either side)
     const distanceToFull = Math.abs(phase - 0.5);
     if (distanceToFull <= 0.05 && !isUnlocked) {
        setIsUnlocked(true);
        if (onComplete) {
           setTimeout(() => onComplete(), 2000);
        }
     } else if (distanceToFull > 0.05 && isUnlocked) {
        // In case they scrub the slider back
        setIsUnlocked(false);
     }
  }, [phase, isUnlocked, onComplete]);

  // Visual calculations based on phase (0 to 1)
  // Distance from new moon (0) to full moon (0.5) to new moon (1)
  const fullness = 1 - Math.abs((phase - 0.5) * 2); // 0 = New, 1 = Full
  
  // Shadow X offset to simulate terminator line
  // -100% to 100%
  const shadowX = (0.5 - phase) * 200;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif select-none p-4 md:p-8 items-center justify-center transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      {/* Starry Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
         {[...Array(50)].map((_, i) => (
            <div 
               key={i}
               className="absolute bg-white rounded-full"
               style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
               }}
            />
         ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
         <motion.h1 
            className="text-2xl font-bold uppercase tracking-[0.3em] text-slate-400 mb-12"
            animate={{ opacity: isUnlocked ? 1 : 0.5 }}
         >
            The Lunar Link
         </motion.h1>

         {/* The Moon & Content Area */}
         <div className="relative w-full aspect-square md:aspect-video rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-8 md:p-16">
            
            {/* The Text Content */}
            <div className="relative z-20 text-center flex flex-col items-center gap-6 mix-blend-screen text-white">
               <h2 className="text-3xl md:text-5xl font-medium leading-tight">
                  {config.title}
               </h2>
               <p className="text-lg md:text-2xl text-slate-300 whitespace-pre-wrap leading-relaxed max-w-lg">
                  {config.body}
               </p>
            </div>

            {/* The Shadow Overlay that obscures text */}
            {/* It acts inversely to fullness. If fullness is 1, shadow is invisible. If fullness is 0, shadow is black. */}
            <motion.div 
               className="absolute inset-0 z-30 pointer-events-none"
               animate={{
                  background: isUnlocked 
                     ? "transparent" 
                     : `radial-gradient(ellipse at ${50 + shadowX}% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,1) ${fullness * 100 + 10}%, rgba(0,0,0,1) 100%)`
               }}
               transition={{ duration: 0 }} // React to slider instantly
            />
            
            {/* Ambient Moon Glow (Behind Text) */}
            <motion.div
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
               animate={{
                  width: 300 * fullness + 50,
                  height: 300 * fullness + 50,
                  backgroundColor: primaryColor,
                  opacity: fullness * 0.4
               }}
            />
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-3xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Lunar Phase
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xl">🌑</span>
               <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={phase} 
                  onChange={(e) => setPhase(parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400"
               />
               <span className="text-xl">🌑</span>
            </div>
            <div className="flex w-full justify-between px-10 text-[10px] text-slate-500 uppercase tracking-widest -mt-2 mb-2">
               <span>New</span>
               <span className="text-yellow-400">Full</span>
               <span>New</span>
            </div>
            <div className="mt-2 text-yellow-300 font-mono text-xs bg-slate-800 px-4 py-2 rounded-full border border-slate-700 tracking-widest uppercase">
               Phase: {phase.toFixed(2)} ({isUnlocked ? "UNLOCKED" : "LOCKED"})
            </div>
         </div>
      )}
      
    </div>
  );
}
