"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function AutonomousMelt({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [meltPercentage, setMeltPercentage] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  useEffect(() => {
     if (meltPercentage >= 100 && !isUnlocked) {
        setIsUnlocked(true);
        setTimeout(() => {
           if (onComplete) onComplete();
        }, 2000);
     }
  }, [meltPercentage, isUnlocked, onComplete]);

  // Ice visual effects based on melt
  const currentBlur = Math.max(0, 16 - (meltPercentage / 100) * 16);
  // The inset pushes from the top down. 0% melt = inset(0% 0 0 0), 100% melt = inset(100% 0 0 0)
  const clipInset = `${meltPercentage}% 0 0 0`;
  const iceOpacity = Math.max(0, 1 - (meltPercentage / 100) * 0.8); // drops to 0.2 before disappearing

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center p-8 transition-colors duration-1000"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" />

      {/* The Target Content (Bottom Layer) */}
      <div className="relative z-0 w-full max-w-2xl bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center text-center">
         <h1 className="text-4xl font-black uppercase text-slate-800 mb-6 tracking-widest" style={{ color: primaryColor }}>
            {config.title}
         </h1>
         <p className="text-xl text-slate-600 font-medium leading-relaxed">
            {config.body}
         </p>
      </div>

      {/* The Ice Block Overlay (Top Layer) */}
      <AnimatePresence>
         {meltPercentage < 100 && (
            <motion.div
               className="absolute z-10 w-full max-w-2xl h-full max-h-[400px] rounded-2xl border-2 border-white/40 pointer-events-none overflow-hidden"
               style={{
                  clipPath: `inset(${clipInset})`,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  backdropFilter: `blur(${currentBlur}px)`,
                  opacity: iceOpacity,
                  boxShadow: "inset 0 0 50px rgba(255,255,255,0.8)"
               }}
            >
               {/* Ice Cracks/Details */}
               <div className="absolute top-10 left-10 w-32 h-1 bg-white/50 rotate-45" />
               <div className="absolute top-20 right-16 w-24 h-1 bg-white/40 -rotate-12" />
               <div className="absolute bottom-10 left-1/2 w-40 h-1 bg-white/30 rotate-3" />
               
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl drop-shadow-[0_0_20px_white]">🧊</span>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {isUnlocked && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-12 z-20 bg-green-500/20 border border-green-500/50 text-green-100 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl backdrop-blur-md"
            >
               Fully Revealed
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Ice Melt Progress
            </h2>
            <div className="flex w-full items-center gap-4 text-white">
               <span className="text-xl">🧊</span>
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.5" 
                  value={meltPercentage} 
                  onChange={(e) => setMeltPercentage(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400"
               />
               <span className="text-xl">💧</span>
            </div>
            <div className="mt-2 text-cyan-200 font-mono text-sm bg-slate-800 px-3 py-1 rounded border border-slate-700">
               {meltPercentage.toFixed(1)}% Melted
            </div>
         </div>
      )}
      
    </div>
  );
}
