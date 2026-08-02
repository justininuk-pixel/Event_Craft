"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const MAX_HOURS = 48;

export function DecayingApology({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [elapsedHours, setElapsedHours] = useState<number>(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [phase, setPhase] = useState<"decaying" | "complete">("decaying");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6b7280";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f3f4f6"];

  const handleFreeze = () => {
     setIsFrozen(true);
     setPhase("complete");
     
     // Optionally slightly restore legibility as a reward
     setElapsedHours(prev => Math.max(0, prev - 12));

     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  // Calculate degradation based on elapsed hours
  // 0 hours = 1 opacity, 0px blur
  // 48 hours = 0 opacity, 10px blur
  const percentDecay = elapsedHours / MAX_HOURS;
  const currentOpacity = Math.max(0, 1 - percentDecay);
  const currentBlur = Math.min(10, percentDecay * 10);
  // Add grayscale
  const currentGrayscale = percentDecay * 100;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif select-none items-center justify-center p-8 transition-colors duration-1000"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <AnimatePresence mode="wait">
         {phase === "decaying" && (
            <motion.div
               key="decaying"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-12"
            >
               <motion.div 
                  className="w-full bg-white/50 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white"
                  style={{
                     filter: `blur(${currentBlur}px) grayscale(${currentGrayscale}%)`,
                     opacity: currentOpacity,
                     transition: isFrozen ? "all 2s ease" : "none"
                  }}
               >
                  <h1 className="text-3xl md:text-5xl font-medium text-slate-800 mb-6 leading-tight">
                     {config.title || "I'm Sorry"}
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed whitespace-pre-wrap">
                     {config.body}
                  </p>
               </motion.div>

               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFreeze}
                  className="px-10 py-4 rounded-full font-bold tracking-widest text-white shadow-xl bg-slate-800 hover:bg-slate-700 transition-colors uppercase text-sm"
               >
                  Freeze & Read
               </motion.button>
            </motion.div>
         )}

         {phase === "complete" && (
            <motion.div
               key="complete"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-10 w-full max-w-2xl flex flex-col items-center"
            >
               <div className="w-16 h-16 mb-6 rounded-full flex items-center justify-center text-3xl bg-white shadow-lg text-slate-800">
                  ❄️
               </div>
               <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8">
                  Time Frozen
               </h2>
               
               <div className="w-full bg-white p-12 rounded-3xl shadow-2xl border border-slate-200">
                  <h1 className="text-3xl md:text-4xl font-medium mb-6 leading-tight" style={{ color: primaryColor }}>
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                     {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && phase === "decaying" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Elapsed Time Since Creation
            </h2>
            <div className="flex w-full items-center gap-4 text-white">
               <span className="text-xs text-slate-400">0h</span>
               <input 
                  type="range" 
                  min="0" 
                  max="48" 
                  step="0.5" 
                  value={elapsedHours} 
                  onChange={(e) => setElapsedHours(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-400"
                  disabled={isFrozen}
               />
               <span className="text-xs text-slate-400">48h</span>
            </div>
            <div className="mt-2 text-white font-mono text-sm bg-slate-800 px-3 py-1 rounded">
               {elapsedHours.toFixed(1)} Hours Elapsed
            </div>
         </div>
      )}
      
    </div>
  );
}
