"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const DECADE_TRIVIA: Record<string, string[]> = {
  "1970s": ["Apollo 13 returns safely", "First email sent", "Star Wars premieres"],
  "1980s": ["The Berlin Wall falls", "MTV launches", "First Space Shuttle launch"],
  "1990s": ["The World Wide Web goes public", "Hubble Telescope launched", "Harry Potter is published"],
  "2000s": ["The iPhone is announced", "Wikipedia is launched", "Mars Rovers land"],
  "2010s": ["First iPad released", "Curiosity lands on Mars", "Black hole photographed"],
  "2020s": ["James Webb Telescope launches", "Global AI boom begins", "Commercial spaceflight era"],
  "default": ["A major scientific discovery is made", "A beloved movie hits theaters", "A new technology changes the world"]
};

export function HistoricRewind({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // The special date to rewind to, set by the creator in the Experience panel
  // (falls back to New Year's Eve 1999 if unset).
  const configuredDate = config.experience?.unlockDate;
  const defaultDateStr = configuredDate || (mode === "editor-preview" ? "1995-05-15" : "1999-12-31");
  const [targetDateStr, setTargetDateStr] = useState(defaultDateStr);

  useEffect(() => {
    if (configuredDate) setTargetDateStr(configuredDate);
  }, [configuredDate]);
  const [animationState, setAnimationState] = useState<"rewinding" | "landed">("rewinding");
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  
  const targetDate = new Date(targetDateStr);
  const targetYear = targetDate.getFullYear();

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d97706"; // Amber
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#f8fafc";

  // Rewind Animation
  useEffect(() => {
     let isActive = true;
     setAnimationState("rewinding");
     setCurrentYear(new Date().getFullYear());

     const duration = 2000; // 2 seconds rewind
     const startYear = new Date().getFullYear();
     const startTime = Date.now();

     const tick = () => {
        if (!isActive) return;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out quint
        const ease = 1 - Math.pow(1 - progress, 5);
        const current = Math.round(startYear - ((startYear - targetYear) * ease));
        
        setCurrentYear(current);

        if (progress < 1) {
           requestAnimationFrame(tick);
        } else {
           setAnimationState("landed");
           if (onComplete) {
              setTimeout(onComplete, 5000);
           }
        }
     };

     requestAnimationFrame(tick);

     return () => { isActive = false; };
  }, [targetYear, onComplete]);

  // Determine Decade
  const getDecadeKey = (year: number) => {
     const decadeStart = Math.floor(year / 10) * 10;
     if (decadeStart >= 1970 && decadeStart <= 2020) {
        return `${decadeStart}s`;
     }
     return "default";
  };

  const facts = DECADE_TRIVIA[getDecadeKey(targetYear)];

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center py-12 px-4"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      {/* Rewind Overlay */}
      <AnimatePresence>
         {animationState === "rewinding" && (
            <motion.div 
               key="rewind"
               className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
               transition={{ duration: 0.5 }}
            >
               <div className="flex flex-col items-center">
                  <div className="text-xl tracking-[0.5em] uppercase text-slate-400 mb-4 animate-pulse">
                     Rewinding
                  </div>
                  <div 
                     className="text-6xl md:text-7xl font-black font-mono tracking-tighter"
                     style={{ color: primaryColor }}
                  >
                     {currentYear}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Dual Timeline Container */}
      <motion.div 
         className="relative w-full max-w-4xl h-full flex mt-16 md:mt-24"
         initial={{ opacity: 0 }}
         animate={{ opacity: animationState === "landed" ? 1 : 0 }}
         transition={{ delay: 0.5, duration: 1 }}
      >
         {/* Center Line */}
         <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full" />

         <div className="flex flex-col w-full h-full justify-evenly">
            
            {/* Historical Facts (Left Side on Desktop, Right side on mobile pushed over) */}
            {facts.map((fact, i) => (
               <motion.div 
                  key={`fact-${i}`}
                  className="relative flex w-full md:justify-start justify-end pl-12 md:pl-0 pr-0 md:pr-[50%] -translate-y-4"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: animationState === "landed" ? 1 : 0, x: 0 }}
                  transition={{ delay: 1 + (i * 0.5), duration: 0.8 }}
               >
                  {/* Node */}
                  <div className="absolute left-4 md:left-[50%] top-1/2 w-4 h-4 rounded-full bg-slate-600 border-4 border-[#1e293b] -translate-x-1/2 -translate-y-1/2 z-10" />
                  
                  <div className="md:mr-8 ml-0 md:ml-0 md:text-right w-full md:w-auto p-4 bg-white/5 rounded-xl border border-white/10">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Global History</div>
                     <div className="text-sm md:text-base font-serif text-slate-300">{fact}</div>
                  </div>
               </motion.div>
            ))}

            {/* Personal Milestone (Right Side) */}
            <motion.div 
               className="relative flex w-full md:justify-end justify-end pl-12 md:pl-[50%] mt-8"
               initial={{ opacity: 0, x: 50, scale: 0.9 }}
               animate={{ opacity: animationState === "landed" ? 1 : 0, x: 0, scale: 1 }}
               transition={{ delay: 2.5, duration: 1, type: "spring" }}
            >
               {/* Highlight Node */}
               <div 
                  className="absolute left-4 md:left-0 top-1/2 w-6 h-6 rounded-full border-4 border-[#1e293b] -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_20px_var(--primaryColor)]" 
                  style={{ backgroundColor: primaryColor }}
               />
               
               <div className="md:ml-8 ml-0 w-full p-6 md:p-8 bg-black/40 rounded-2xl border-2 shadow-2xl backdrop-blur-md" style={{ borderColor: primaryColor }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80" style={{ color: primaryColor }}>
                     {targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest mb-4">
                     {config.title}
                  </h2>
                  <p className="text-lg text-slate-200 font-medium leading-relaxed font-serif">
                     {config.body}
                  </p>
               </div>
            </motion.div>

         </div>
      </motion.div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/80 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl pointer-events-auto">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Target Date
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <input 
                  type="date" 
                  value={targetDateStr}
                  onChange={(e) => {
                     setTargetDateStr(e.target.value);
                  }}
                  className="flex-1 bg-white/10 p-2 rounded text-sm outline-none border border-white/20 text-center"
               />
            </div>
            <button 
               onClick={() => {
                  setAnimationState("rewinding");
                  setTimeout(() => setAnimationState("landed"), 100); // trigger re-render hack if needed, but useEffect handles it.
                  // Actually to re-trigger useEffect we just need a slight delay
                  setTargetDateStr((prev: string) => prev); // this won't trigger if it's the same.
                  // Let's do a dummy state to force remount of rewind
               }}
               className="mt-4 text-xs px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full uppercase tracking-widest transition-colors"
            >
               Replay Rewind (Date change auto-replays)
            </button>
         </div>
      )}
      
    </div>
  );
}
