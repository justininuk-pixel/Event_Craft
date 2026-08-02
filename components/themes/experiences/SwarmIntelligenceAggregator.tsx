"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Calculator } from "lucide-react";

export function SwarmIntelligenceAggregator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const actualValue = 347; // e.g., jellybeans in a jar

  // Synthetic array of 50 terrible guesses ranging from 50 to 800
  const generateGuesses = () => {
     const arr = [];
     for(let i=0; i<50; i++) {
        // Skewed random distribution
        const guess = Math.floor(Math.random() * 700) + 50; 
        arr.push(guess);
     }
     // Ensure median is close to actual for the demo's 'magic' effect
     arr.push(345, 346, 348, 349); 
     return arr;
  };

  const [guesses] = useState<number[]>(generateGuesses());
  const [calculated, setCalculated] = useState(false);

  // Math
  const sorted = [...guesses].sort((a,b) => a-b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const mean = Math.round(guesses.reduce((a,b)=>a+b, 0) / guesses.length);

  const handleCalculate = () => {
     setCalculated(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 100, 20]);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-zinc-900 text-zinc-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-zinc-800 bg-zinc-950">
         <h2 className="text-xl font-black uppercase tracking-widest text-violet-400 flex justify-center items-center gap-2">
            <Users size={24} /> Wisdom of Crowds
         </h2>
         <p className="text-xs text-zinc-500 mt-1">Aggregating {guesses.length} inaccurate guesses.</p>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
         
         <AnimatePresence mode="wait">
            {!calculated ? (
               <motion.div key="input" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full space-y-6 text-center">
                  
                  <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-2xl">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Live Guesses Stream</div>
                     <div className="flex flex-wrap gap-2 justify-center h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-800/50 z-10" />
                        {guesses.map((g, i) => (
                           <motion.span 
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (i % 20) * 0.05 }}
                              className="text-xs bg-zinc-700/50 px-2 py-1 rounded text-zinc-400"
                           >
                              {g}
                           </motion.span>
                        ))}
                     </div>
                  </div>

                  <button 
                     onClick={handleCalculate}
                     className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-900/50 flex justify-center items-center gap-2"
                  >
                     <Calculator size={18} /> Calculate Median
                  </button>
               </motion.div>
            ) : (
               <motion.div key="result" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                  
                  <div className="mb-12 text-center">
                     <div className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] mb-2">Crowd Median</div>
                     <div className="text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] mb-2">{Math.round(median)}</div>
                     <div className="text-sm text-emerald-400 font-bold tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 inline-block px-4 py-1 rounded-full">
                        Actual: {actualValue}
                     </div>
                  </div>

                  <div className="relative h-12 w-full mt-12 bg-zinc-800/50 rounded-full border border-zinc-700 overflow-hidden">
                     {/* Plot individual guesses as dots */}
                     {guesses.map((g, i) => {
                        const leftPct = Math.min(100, Math.max(0, (g / 800) * 100));
                        return (
                           <div 
                              key={i} 
                              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500/30 blur-[1px]"
                              style={{ left: `${leftPct}%` }}
                           />
                        )
                     })}

                     {/* The Median Line */}
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "150%" }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="absolute top-1/2 -translate-y-1/2 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] z-10"
                        style={{ left: `${(median / 800) * 100}%` }}
                     />
                     <div className="absolute -bottom-6 text-[10px] text-zinc-500 translate-x-[-50%]" style={{ left: `${(median / 800) * 100}%` }}>Median</div>

                     {/* The Mean Line */}
                     <div 
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-rose-500/50 z-0"
                        style={{ left: `${(mean / 800) * 100}%` }}
                     />
                     <div className="absolute -top-6 text-[10px] text-rose-500/50 translate-x-[-50%]" style={{ left: `${(mean / 800) * 100}%` }}>Mean</div>
                  </div>

                  <div className="mt-12 text-center text-[10px] text-zinc-500 max-w-xs mx-auto">
                     Individual guesses vary wildly, but the median aggregate filters out the noise to arrive at an astonishingly accurate consensus.
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
