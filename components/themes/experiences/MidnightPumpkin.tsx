"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MidnightPumpkin({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [simulatedHour, setSimulatedHour] = useState<number>(new Date().getHours());
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d8b4e2";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#faf5ff"];

  const isCursed = simulatedHour >= 0 && simulatedHour < 6;

  useEffect(() => {
     if (!isCursed && !isUnlocked) {
        setIsUnlocked(true);
        if (onComplete) {
           // Short delay before completion event to let them read it
           setTimeout(() => onComplete(), 2000);
        }
     }
  }, [isCursed, isUnlocked, onComplete]);

  // Generate some glitch effects
  const glitchX = isCursed ? (Math.random() - 0.5) * 20 : 0;
  const glitchY = isCursed ? (Math.random() - 0.5) * 20 : 0;
  const glitchSkew = isCursed ? (Math.random() - 0.5) * 10 : 0;

  return (
    <div 
      className={`w-full h-full relative overflow-hidden flex flex-col select-none p-4 md:p-8 items-center justify-center transition-all duration-[2000ms] ${
         isCursed ? "font-mono" : "font-serif"
      }`}
      style={{ 
         background: isCursed ? "#1a0505" : `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})`,
         filter: isCursed ? "contrast(150%) brightness(80%) sepia(50%) hue-rotate(-50deg) saturate(200%)" : "none"
      }} 
    >
      {/* Background Decor */}
      <AnimatePresence>
         {!isCursed && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 pointer-events-none opacity-30"
               style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor} 0%, transparent 60%)`
               }}
            />
         )}
         {isCursed && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 pointer-events-none opacity-20"
               style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
               }}
            />
         )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div 
         animate={isCursed ? {
            x: glitchX,
            y: glitchY,
            skewX: glitchSkew,
            rotate: glitchSkew / 2,
            scale: 0.95 + Math.random() * 0.1
         } : {
            x: 0, y: 0, skewX: 0, rotate: 0, scale: 1
         }}
         transition={{ 
            type: isCursed ? "spring" : "tween", 
            stiffness: 500, 
            damping: 10,
            duration: isCursed ? 0.1 : 1 
         }}
         className={`relative z-10 w-full max-w-2xl p-12 md:p-16 rounded-3xl flex flex-col items-center text-center transition-all duration-[2000ms] ${
            isCursed 
               ? "bg-red-900/40 border-[4px] border-red-600/50 text-red-500 shadow-[0_0_100px_rgba(220,38,38,0.5)]" 
               : "bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl text-slate-800"
         }`}
      >
         <h1 className={`text-4xl md:text-5xl mb-8 transition-colors duration-[2000ms] ${
            isCursed ? "font-black tracking-[1em] uppercase drop-shadow-[0_0_10px_red]" : "font-medium"
         }`}
            style={{ color: isCursed ? "#ff0000" : primaryColor }}
         >
            {isCursed ? "CURSED" : config.title}
         </h1>
         
         <p className={`text-xl leading-relaxed whitespace-pre-wrap transition-all duration-[2000ms] ${
            isCursed ? "tracking-[0.5em] blur-[2px] leading-tight font-bold" : ""
         }`}>
            {isCursed ? config.body.replace(/[aeiou]/gi, 'x').toUpperCase() : config.body}
         </p>

         {/* Curfew warning */}
         <AnimatePresence>
            {isCursed && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-12 text-xs font-black tracking-widest text-red-400 uppercase border border-red-500/30 bg-red-900/50 px-6 py-2 rounded-full"
               >
                  Midnight Curfew Active (0:00 - 6:00)
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-6 rounded-3xl flex flex-col items-center shadow-2xl z-50 transition-colors duration-1000 ${
            isCursed ? "bg-black/90 border-red-900/50" : "bg-slate-900/80 backdrop-blur-md border border-slate-700"
         }`}>
            <h2 className={`${isCursed ? "text-red-500" : "text-slate-400"} font-bold uppercase tracking-widest text-[10px] mb-4`}>
               Simulation: Local Time (Hours)
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xl">{simulatedHour < 6 || simulatedHour > 18 ? "🌙" : "☀️"}</span>
               <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  step="1" 
                  value={simulatedHour} 
                  onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                  className={`flex-1 ${isCursed ? "accent-red-600" : "accent-slate-400"}`}
               />
               <span className="text-xl">🕰️</span>
            </div>
            <div className={`mt-4 font-mono text-xs px-4 py-2 rounded-full border tracking-widest uppercase transition-colors ${
               isCursed ? "bg-red-950 text-red-400 border-red-900" : "bg-slate-800 text-slate-300 border-slate-700"
            }`}>
               Time: {simulatedHour.toString().padStart(2, '0')}:00 {isCursed ? "(PUMPKIN)" : "(ELEGANT)"}
            </div>
         </div>
      )}
      
    </div>
  );
}
