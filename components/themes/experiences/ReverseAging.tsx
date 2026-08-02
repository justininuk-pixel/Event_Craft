"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ReverseAging({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // Simulating days remaining to target date
  // In a real app, this would be computed: Math.max(0, diffInDays(targetDate, today))
  const TOTAL_DAYS = 100;
  const [daysRemaining, setDaysRemaining] = useState<number>(mode === "editor-preview" ? 100 : 0);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Sprout green
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Sky

  useEffect(() => {
     if (daysRemaining <= 0 && onComplete) {
        onComplete();
     }
  }, [daysRemaining, onComplete]);

  // Stage Calculation (Reverse aging)
  // Stage 1: Ancient (100-80)
  // Stage 2: Mature (80-40)
  // Stage 3: Sapling (40-10)
  // Stage 4: Sprout (10-1)
  // Stage 5: Bloom (0)
  let stage = 1;
  let stageProgress = 0; // 0 to 1 within the stage
  
  if (daysRemaining <= 0) {
     stage = 5;
     stageProgress = 1;
  } else if (daysRemaining <= 10) {
     stage = 4;
     stageProgress = 1 - (daysRemaining / 10);
  } else if (daysRemaining <= 40) {
     stage = 3;
     stageProgress = 1 - ((daysRemaining - 10) / 30);
  } else if (daysRemaining <= 80) {
     stage = 2;
     stageProgress = 1 - ((daysRemaining - 40) / 40);
  } else {
     stage = 1;
     stageProgress = 1 - ((daysRemaining - 80) / 20);
  }

  // Visual Properties mapped to inverse progress (progress = 1 is newborn/bloom)
  const totalProgress = 1 - (daysRemaining / TOTAL_DAYS);

  // Tree dimensions get smaller as progress approaches 1
  const treeHeight = stage === 5 ? 0 : 250 - (totalProgress * 200); 
  const treeWidth = stage === 5 ? 0 : 150 - (totalProgress * 130);
  const leafOpacity = stage === 5 ? 0 : 1 - (totalProgress * 0.5);

  const getTreeColor = () => {
     if (stage === 1) return "#78350f"; // Ancient brown/grey
     if (stage === 2) return "#4d7c0f"; // Mature green
     if (stage === 3) return "#65a30d"; // Sapling light green
     if (stage === 4) return primaryColor; // Sprout bright green
     return primaryColor; // Bloom
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-end pb-32 transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      {/* Ground */}
      <div className="absolute bottom-0 w-[200%] h-32 bg-[#a16207] rounded-[100%] translate-y-16 blur-sm opacity-50" />
      <div className="absolute bottom-0 w-[150%] h-24 bg-[#ca8a04] rounded-[100%] translate-y-8" />

      {/* Days Tracker */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-40">
         <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Countdown</div>
         <div className="text-5xl font-black font-mono tracking-tighter text-slate-800">
            {Math.ceil(daysRemaining)}
         </div>
      </div>

      {/* The Entity (Tree Morph) */}
      <div className="relative flex items-end justify-center w-full z-20">
         
         <AnimatePresence>
            {/* The Bloom (Stage 5) */}
            {stage === 5 && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
                  className="absolute bottom-4 flex flex-col items-center justify-center z-30"
               >
                  <div 
                     className="w-48 h-48 rounded-full blur-[20px] mix-blend-screen absolute animate-pulse"
                     style={{ backgroundColor: primaryColor }}
                  />
                  {/* The Message revealed inside the bloom */}
                  <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,1)] border border-white max-w-sm text-center relative z-40">
                     <h2 className="text-3xl font-black uppercase tracking-widest text-slate-800 mb-4" style={{ color: primaryColor }}>
                        {config.title}
                     </h2>
                     <p className="text-lg text-slate-600 font-medium">
                        {config.body}
                     </p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* The Tree (Stages 1-4) */}
         <motion.div 
            className="origin-bottom relative flex flex-col items-center z-10"
            animate={{ 
               height: treeHeight, 
               width: treeWidth,
               opacity: stage === 5 ? 0 : 1
            }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.1 }}
         >
            {/* Trunk */}
            <motion.div 
               className="w-[10%] h-full rounded-t-full shadow-inner"
               animate={{ backgroundColor: getTreeColor() }}
               transition={{ duration: 0.1 }}
            />
            
            {/* Leaves (only show prominently in older stages) */}
            {stage < 4 && (
               <motion.div 
                  className="absolute top-0 w-full h-[60%] rounded-full -translate-y-1/2 opacity-80 mix-blend-multiply"
                  animate={{ 
                     backgroundColor: getTreeColor(),
                     scale: 1 - (stageProgress * 0.5),
                     opacity: leafOpacity
                  }}
                  transition={{ duration: 0.1 }}
               />
            )}
            {stage < 3 && (
               <motion.div 
                  className="absolute top-[20%] right-[-20%] w-[80%] h-[50%] rounded-full opacity-60 mix-blend-multiply"
                  animate={{ backgroundColor: getTreeColor(), opacity: leafOpacity }}
                  transition={{ duration: 0.1 }}
               />
            )}
            {stage < 3 && (
               <motion.div 
                  className="absolute top-[30%] left-[-20%] w-[80%] h-[50%] rounded-full opacity-60 mix-blend-multiply"
                  animate={{ backgroundColor: getTreeColor(), opacity: leafOpacity }}
                  transition={{ duration: 0.1 }}
               />
            )}

            {/* Wrinkles / Withering details for Ancient stage */}
            {stage === 1 && (
               <>
                  <div className="absolute bottom-4 left-1/2 -translate-x-[150%] w-4 h-8 bg-[#451a03]/20 rounded-full" />
                  <div className="absolute bottom-12 right-1/2 translate-x-[120%] w-3 h-6 bg-[#451a03]/20 rounded-full" />
               </>
            )}
         </motion.div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Days Remaining
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs text-slate-400">Day 100</span>
               <input 
                  type="range" 
                  min="0" 
                  max={TOTAL_DAYS} 
                  step="0.1" 
                  value={daysRemaining} 
                  onChange={(e) => setDaysRemaining(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 scale-x-[-1]" // Reverse direction so dragging right decreases days
               />
               <span className="text-xs text-slate-400">Day 0</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border border-slate-300 rounded-full tracking-widest uppercase text-slate-600 bg-slate-100">
               Stage {stage}: {stage === 1 ? "Ancient" : stage === 2 ? "Mature" : stage === 3 ? "Sapling" : stage === 4 ? "Sprout" : "Bloom"}
            </div>
         </div>
      )}
      
    </div>
  );
}
