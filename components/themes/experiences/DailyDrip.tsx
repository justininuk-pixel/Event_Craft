"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function DailyDrip({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // Parse body into paragraphs
  const rawBody = config.body || "This is a default message.\n\nIt needs multiple paragraphs to demonstrate the drip.\n\nHere is paragraph three.";
  let paragraphs = rawBody.split(/\n\s*\n/).filter(p => p.trim() !== "");
  if (paragraphs.length === 0) {
      paragraphs = ["No content provided."];
  }

  const [daysElapsed, setDaysElapsed] = useState<number>(0);
  const [isFullyUnlocked, setIsFullyUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  useEffect(() => {
     if (daysElapsed >= paragraphs.length - 1 && !isFullyUnlocked) {
        setIsFullyUnlocked(true);
        if (onComplete) {
           setTimeout(() => onComplete(), 1000);
        }
     }
  }, [daysElapsed, paragraphs.length, isFullyUnlocked, onComplete]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif select-none"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />

      {/* Header */}
      <div className="w-full py-8 text-center bg-white/50 backdrop-blur-md border-b border-black/5 shadow-sm relative z-20">
         <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-slate-800">
            {config.title || "The Daily Drip"}
         </h1>
         <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase mt-2">
            Reading Progress: {Math.min(daysElapsed + 1, paragraphs.length)} / {paragraphs.length}
         </p>
      </div>

      {/* Content Scroller */}
      <div className="flex-1 overflow-y-auto px-4 py-12 md:px-12 relative scroll-smooth pb-48">
         <div className="max-w-2xl mx-auto flex flex-col gap-12">
            <AnimatePresence>
               {paragraphs.map((paragraph, index) => {
                  const isLocked = index > daysElapsed;
                  const daysUntilUnlock = index - daysElapsed;

                  return (
                     <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                     >
                        {/* Time Marker */}
                        <div className="absolute -left-4 md:-left-12 top-0 h-full flex flex-col items-center">
                           <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: isLocked ? "#cbd5e1" : primaryColor }} />
                           {index < paragraphs.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-200 absolute top-4 bottom-0 -z-10" />
                           )}
                        </div>

                        {/* Paragraph Content */}
                        <div 
                           className={`transition-all duration-1000 ${isLocked ? "select-none" : ""}`}
                           style={{
                              filter: isLocked ? "blur(8px) grayscale(50%)" : "blur(0px) grayscale(0%)",
                              opacity: isLocked ? 0.3 : 1,
                              pointerEvents: isLocked ? "none" : "auto",
                              transform: isLocked ? "scale(0.98)" : "scale(1)"
                           }}
                        >
                           <p className="text-lg md:text-xl leading-relaxed text-slate-700 whitespace-pre-wrap">
                              {paragraph}
                           </p>
                        </div>

                        {/* Lock Overlay */}
                        {isLocked && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
                                 <span className="text-slate-400">🔒</span>
                                 <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                                    Unlocks in {daysUntilUnlock} Day{daysUntilUnlock !== 1 ? 's' : ''}
                                 </span>
                              </div>
                           </div>
                        )}
                     </motion.div>
                  );
               })}
            </AnimatePresence>
            
            {isFullyUnlocked && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-12 p-8 text-center border-t border-slate-200"
               >
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                     End of Transmission
                  </p>
               </motion.div>
            )}
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-3xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Days Elapsed
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xs text-slate-500">Day 0</span>
               <input 
                  type="range" 
                  min="0" 
                  max={paragraphs.length - 1} 
                  step="1" 
                  value={daysElapsed} 
                  onChange={(e) => setDaysElapsed(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-400"
               />
               <span className="text-xs text-slate-500">Day {paragraphs.length - 1}</span>
            </div>
            <div className="mt-4 text-indigo-300 font-mono text-xs bg-slate-800 px-4 py-2 rounded-full border border-slate-700 tracking-widest uppercase">
               Currently on Day {daysElapsed}
            </div>
         </div>
      )}
      
    </div>
  );
}
