"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function HourlyChime({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeUntil, setTimeUntil] = useState("");
  const [simulatedUnlock, setSimulatedUnlock] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#b45309"; // Amber 700 (Wood)
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // Amber 50
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#451a03"; // Amber 950

  useEffect(() => {
     const checkTime = () => {
        const now = new Date();
        const mins = now.getMinutes();
        const secs = now.getSeconds();

        if (mins === 0 || simulatedUnlock) {
           setIsUnlocked(true);
    onComplete?.();
        } else {
           setIsUnlocked(false);
           
           // Calculate time until next top of hour
           const minsLeft = 59 - mins;
           const secsLeft = 59 - secs;
           
           setTimeUntil(`${minsLeft.toString().padStart(2, '0')}:${secsLeft.toString().padStart(2, '0')}`);
        }
     };

     checkTime();
     const interval = setInterval(checkTime, 1000);
     return () => clearInterval(interval);
  }, [simulatedUnlock]);

  useEffect(() => {
     if (isUnlocked && onComplete) {
        // Since the window is exactly 60 seconds, we shouldn't auto-complete too fast if we want them to read it.
        // But for editor mode, 5s is fine.
        const timer = setTimeout(onComplete, 8000);
        return () => clearTimeout(timer);
     }
  }, [isUnlocked, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      {/* The Cuckoo Clock Frame */}
      <div 
         className="relative w-64 h-80 md:w-80 md:h-96 rounded-t-full rounded-b-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center p-6 border-b-8 border-r-8 border-black/20"
         style={{ backgroundColor: primaryColor }}
      >
         {/* Roof detail */}
         <div className="absolute -top-4 w-[110%] h-8 bg-amber-900 rounded-md shadow-lg" />
         
         {/* Clock Face */}
         <div className="w-32 h-32 rounded-full bg-amber-100 border-4 border-amber-900 mt-20 flex items-center justify-center relative shadow-inner">
            <div className="w-3 h-3 bg-amber-900 rounded-full z-10" />
            <div className="absolute w-1 h-12 bg-amber-900 origin-bottom rounded-t-md -translate-y-6 rotate-0" /> {/* Hour hand at 12 */}
            <div className="absolute w-1 h-14 bg-amber-800 origin-bottom rounded-t-md -translate-y-7 rotate-45" /> {/* Min hand */}
         </div>

         {/* The Doors (Top Area) */}
         <div className="absolute top-8 w-24 h-24 bg-black/80 rounded-t-full overflow-hidden flex items-end justify-center shadow-inner border border-amber-900/50">
            <AnimatePresence>
               {isUnlocked && (
                  <motion.div 
                     className="w-12 h-12 bg-white rounded-full mb-2 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                     initial={{ y: 50, scale: 0.5 }}
                     animate={{ y: 0, scale: 1 }}
                     exit={{ y: 50, scale: 0.5 }}
                     transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                     🐦
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Left Door */}
            <motion.div 
               className="absolute top-0 left-0 w-1/2 h-full bg-amber-800 origin-left border-r border-amber-950/50 flex items-center justify-end pr-1"
               animate={{ rotateY: isUnlocked ? -100 : 0 }}
               transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
               <div className="w-1 h-1 bg-amber-950 rounded-full" />
            </motion.div>

            {/* Right Door */}
            <motion.div 
               className="absolute top-0 right-0 w-1/2 h-full bg-amber-800 origin-right border-l border-amber-950/50 flex items-center justify-start pl-1"
               animate={{ rotateY: isUnlocked ? 100 : 0 }}
               transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
               <div className="w-1 h-1 bg-amber-950 rounded-full" />
            </motion.div>
         </div>

         {/* Pendulum */}
         <motion.div 
            className="absolute -bottom-16 w-4 h-24 bg-amber-700 origin-top flex flex-col items-center"
            animate={{ rotate: [-15, 15] }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, ease: "easeInOut" }}
         >
            <div className="absolute -bottom-6 w-12 h-12 rounded-full bg-amber-600 border-4 border-amber-800 shadow-md" />
         </motion.div>
      </div>

      {/* The Content Banner */}
      <div className="mt-24 h-48 w-full max-w-2xl flex flex-col items-center text-center">
         <AnimatePresence mode="wait">
            {!isUnlocked ? (
               <motion.div 
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
               >
                  <div className="font-mono text-5xl md:text-6xl font-light tabular-nums tracking-tighter opacity-80">
                     {timeUntil}
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] font-bold mt-4 opacity-50">
                     Until Next Chime
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="unlocked"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
               >
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 opacity-60">
                     The Chime Rings
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                     {config.title}
                  </h1>
                  <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
                     {config.body}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isUnlocked && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Wait
            </h2>
            <button 
               onClick={() => setSimulatedUnlock(true)}
               className="w-full bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-amber-400/50"
            >
               Force Top of Hour
            </button>
         </div>
      )}
      
    </div>
  );
}
