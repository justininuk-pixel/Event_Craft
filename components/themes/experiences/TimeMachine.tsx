"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_YEARS = 100;
const REAL_MS_PER_YEAR = 31536000000; // A real year in MS, for math purposes, but we scale it down heavily.
const BASE_MS_PER_VIRTUAL_YEAR = 10000; // At 1x speed, 1 virtual year takes 10 real seconds.

// Seasons colors
const SEASON_COLORS = {
   spring: "#bbf7d0", // Green 200
   summer: "#fef08a", // Yellow 200
   autumn: "#fed7aa", // Orange 200
   winter: "#e2e8f0"  // Slate 200
};

export function TimeMachine({
  config,
  palette,
  onComplete
}: ExperienceViewProps) {
  const [virtualYears, setVirtualYears] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const [isArrived, setIsArrived] = useState(false);
  
  const lastTimeRef = useRef<number>(Date.now());
  const rafId = useRef<number>(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#0f172a";

  useEffect(() => {
     if (isArrived) return;

     const updateTime = () => {
        const now = Date.now();
        const deltaMs = now - lastTimeRef.current;
        lastTimeRef.current = now;

        setVirtualYears(prev => {
           // deltaMs is real time passed. 
           // We multiply by timeScale.
           // Then divide by BASE_MS_PER_VIRTUAL_YEAR to get fraction of a virtual year.
           const addedYears = (deltaMs * timeScale) / BASE_MS_PER_VIRTUAL_YEAR;
           const newYears = prev + addedYears;
           
           if (newYears >= TARGET_YEARS) {
              return TARGET_YEARS;
           }
           return newYears;
        });

        if (virtualYears < TARGET_YEARS) {
           rafId.current = requestAnimationFrame(updateTime);
        }
     };

     rafId.current = requestAnimationFrame(updateTime);

     return () => cancelAnimationFrame(rafId.current);
  }, [timeScale, isArrived, virtualYears]);

  useEffect(() => {
     if (virtualYears >= TARGET_YEARS && !isArrived) {
        setIsArrived(true);
        if (onComplete) {
           setTimeout(onComplete, 3000);
        }
     }
  }, [virtualYears, isArrived, onComplete]);

  // Derived Simulation State
  // 1 year = 4 seasons
  const seasonCycle = (virtualYears % 1) * 4;
  let currentSeasonColor = SEASON_COLORS.spring;
  if (seasonCycle > 3) currentSeasonColor = SEASON_COLORS.winter;
  else if (seasonCycle > 2) currentSeasonColor = SEASON_COLORS.autumn;
  else if (seasonCycle > 1) currentSeasonColor = SEASON_COLORS.summer;

  // Tree growth (starts at 0.1 scale, ends at 1.5)
  const treeScale = 0.1 + (virtualYears / TARGET_YEARS) * 1.4;

  return (
    <div className="w-full h-full relative font-sans overflow-hidden flex flex-col">
      
      {/* Viewport Area */}
      <div 
         className="flex-1 relative flex flex-col items-center justify-center transition-colors duration-200"
         style={{ backgroundColor: isArrived ? "#ffffff" : currentSeasonColor }}
      >
         <AnimatePresence mode="wait">
            {!isArrived ? (
               <motion.div 
                  key="sim"
                  className="relative w-full h-full flex flex-col items-center justify-end pb-32"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                  {/* The Tree */}
                  <motion.div 
                     className="origin-bottom flex flex-col items-center"
                     style={{ scale: treeScale }}
                  >
                     <div className="w-32 h-32 rounded-full" style={{ backgroundColor: primaryColor }} />
                     <div className="w-6 h-16 bg-[#5c4033]" />
                  </motion.div>
                  
                  {/* Ground */}
                  <div className="absolute bottom-0 w-[200%] h-32 bg-black/10 rounded-t-[100%]" />

                  {/* Year Readout */}
                  <div className="absolute top-12 font-mono text-5xl md:text-7xl font-black opacity-20 tracking-tighter mix-blend-overlay">
                     Year {Math.floor(virtualYears)}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="future"
                  className="flex flex-col items-center justify-center text-center p-8 z-10 w-full max-w-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
               >
                  <div className="text-xs uppercase tracking-[0.4em] mb-4 font-bold" style={{ color: primaryColor }}>
                     Year 100 Reached
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8" style={{ color: textColor }}>
                     {config.title}
                  </h1>
                  <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90" style={{ color: textColor }}>
                     {config.body}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Control Panel */}
      <div className="h-48 md:h-64 bg-slate-900 border-t-4 border-slate-800 flex flex-col items-center justify-center p-8 relative z-20">
         <div className="w-full max-w-2xl bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col shadow-2xl">
            
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h2 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Time Scale Multiplier</h2>
                  <div className="text-emerald-400 font-mono text-3xl md:text-4xl">
                     {timeScale.toLocaleString()}x
                  </div>
               </div>
               <div className="text-right">
                  <h2 className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Virtual Progress</h2>
                  <div className="text-slate-300 font-mono text-xl">
                     {(virtualYears).toFixed(2)} / {TARGET_YEARS} yrs
                  </div>
               </div>
            </div>

            <input 
               type="range" 
               min="1" 
               max="10000" 
               step="1"
               value={timeScale}
               onChange={(e) => setTimeScale(parseInt(e.target.value))}
               disabled={isArrived}
               className="w-full h-4 bg-slate-800 rounded-full appearance-none outline-none overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer disabled:opacity-50"
            />
            
            <div className="flex justify-between w-full mt-2 text-[10px] text-slate-600 font-bold uppercase">
               <span>Real-Time (1x)</span>
               <span>Fast Forward (10,000x)</span>
            </div>

         </div>
      </div>
      
    </div>
  );
}
