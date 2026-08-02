"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function SolsticeAlignment({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [isSolstice, setIsSolstice] = useState(false);
  const [simulatedSolstice, setSimulatedSolstice] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fcd34d"; // Amber 300
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // Slate 950

  useEffect(() => {
     // Check for solstice (approx June 20-22 and Dec 20-22)
     const date = new Date();
     const month = date.getMonth(); // 0-indexed (5 = June, 11 = Dec)
     const day = date.getDate();

     const isSummerSolstice = month === 5 && day >= 20 && day <= 22;
     const isWinterSolstice = month === 11 && day >= 20 && day <= 22;

     if (isSummerSolstice || isWinterSolstice) {
        setIsSolstice(true);
     }
  }, []);

  const isAligned = simulatedSolstice || isSolstice;

  useEffect(() => {
     if (isAligned && onComplete) {
        const timer = setTimeout(onComplete, 6000);
        return () => clearTimeout(timer);
     }
  }, [isAligned, onComplete]);

  // If not aligned, the light beam is completely skewed off-center.
  // If aligned, the light beam hits perfectly at 0 degrees.
  const lightAngle = isAligned ? 0 : 45;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden bg-black flex items-center justify-center transition-colors duration-[3000ms]"
      style={{ backgroundColor: isAligned ? bgColors[0] : "#000000" }}
    >
      {/* Background Starfield (visible when dark) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
         {Array.from({ length: 50 }).map((_, i) => (
            <div 
               key={i} 
               className="absolute bg-white rounded-full"
               style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random()
               }}
            />
         ))}
      </div>

      <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center perspective-[1000px]">
         
         {/* The Sun / Light Source */}
         <motion.div 
            className="absolute top-10 w-full h-[800px] pointer-events-none origin-top mix-blend-screen"
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ 
               rotate: lightAngle, 
               opacity: isAligned ? 0.8 : 0.2 
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
         >
            {/* The actual beam graphic */}
            <div 
               className="mx-auto w-32 h-full"
               style={{
                  background: `linear-gradient(to bottom, ${primaryColor} 0%, transparent 100%)`,
                  filter: "blur(20px)"
               }}
            />
         </motion.div>

         {/* The Stones */}
         <div className="relative w-[min(90%,400px)] max-w-full h-[400px] flex justify-between items-end z-10 border-b border-white/10 pb-4">
            
            {/* Left Pillar */}
            <div className="w-20 md:w-28 h-64 bg-zinc-900 border-l border-t border-zinc-700 shadow-2xl relative">
               {/* Inner shadow to give 3D depth */}
               <div className="absolute right-0 top-0 w-2 h-full bg-black/50" />
            </div>

            {/* Top Lintel (Broken, leaving a gap) */}
            <div className="absolute top-36 left-0 w-full h-16 flex justify-between">
               <div className="w-24 md:w-32 h-full bg-zinc-800 border-b border-r border-zinc-700" />
               <div className="w-24 md:w-32 h-full bg-zinc-800 border-b border-l border-zinc-700" />
            </div>

            {/* Central Altar (Holds the content) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-32 flex flex-col items-center justify-center text-center px-4">
               
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                     opacity: isAligned ? 1 : 0.05,
                     textShadow: isAligned ? `0 0 20px ${primaryColor}` : "none"
                  }}
                  transition={{ duration: 3, delay: isAligned ? 1 : 0 }}
               >
                  <h1 
                     className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2"
                     style={{ color: primaryColor }}
                  >
                     {config.title}
                  </h1>
                  <p 
                     className="text-sm md:text-base font-serif leading-relaxed"
                     style={{ color: primaryColor }}
                  >
                     {config.body}
                  </p>
               </motion.div>

               {!isAligned && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-[8px] uppercase tracking-[0.4em] w-full">
                     Awaiting Solstice
                  </div>
               )}
            </div>

            {/* Right Pillar */}
            <div className="w-20 md:w-28 h-64 bg-zinc-900 border-r border-t border-zinc-700 shadow-2xl relative">
               <div className="absolute left-0 top-0 w-2 h-full bg-black/50" />
            </div>

         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isAligned && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Astronomical Alignment
            </h2>
            <button 
               onClick={() => setSimulatedSolstice(true)}
               className="w-full bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-amber-400/50"
            >
               Align the Sun
            </button>
         </div>
      )}
      
    </div>
  );
}
