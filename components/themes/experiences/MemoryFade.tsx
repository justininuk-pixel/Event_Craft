"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "eventcraft_memory_fade_start";

export function MemoryFade({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const TOTAL_BLOCKS = 7;
  const [daysElapsed, setDaysElapsed] = useState(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#334155";

  // Split body into exactly 7 chunks
  const blocks = useMemo(() => {
     const words = (config.body || "This is a memory. It will fade. Appreciate it while you can.").split(' ');
     const chunks: string[] = Array(TOTAL_BLOCKS).fill("");
     
     // Distribute words roughly evenly
     const wordsPerChunk = Math.ceil(words.length / TOTAL_BLOCKS);
     for (let i = 0; i < words.length; i++) {
        const chunkIndex = Math.min(Math.floor(i / wordsPerChunk), TOTAL_BLOCKS - 1);
        chunks[chunkIndex] += (chunks[chunkIndex] ? " " : "") + words[i];
     }
     return chunks;
  }, [config.body]);

  useEffect(() => {
     if (mode === "editor-preview") return;

     const savedStart = localStorage.getItem(STORAGE_KEY);
     const now = Date.now();
     
     if (savedStart) {
        const diffMs = now - parseInt(savedStart, 10);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        setDaysElapsed(Math.min(days, TOTAL_BLOCKS));
     } else {
        localStorage.setItem(STORAGE_KEY, now.toString());
        setDaysElapsed(0);
     }
  }, [mode]);

  useEffect(() => {
     if (onComplete) {
        // Just mark complete automatically after a few seconds
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
     }
  }, [onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center p-8 md:p-16"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      
      <motion.div 
         className="w-full max-w-3xl flex flex-col items-start relative z-10 h-full"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 2 }}
      >
         <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase" style={{ color: primaryColor }}>
            {daysElapsed >= TOTAL_BLOCKS ? "[REDACTED]" : config.title}
         </h1>

         <div className="flex flex-col gap-6 w-full text-lg md:text-2xl font-serif leading-relaxed">
            {blocks.map((block, i) => {
               const isFaded = i < daysElapsed;
               
               return (
                  <div key={i} className="relative w-full">
                     {isFaded ? (
                        <motion.div 
                           className="w-full h-8 md:h-12 bg-slate-200/50 rounded flex items-center px-4 overflow-hidden"
                           initial={{ opacity: 1 }}
                        >
                           <motion.div 
                              className="text-xs font-mono tracking-[0.2em] uppercase opacity-40 text-slate-500"
                              animate={{ x: [0, -10, 5, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.2, repeatDelay: Math.random() * 5 }}
                           >
                              [DATA LOST]
                           </motion.div>
                        </motion.div>
                     ) : (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: (i - daysElapsed) * 0.2, duration: 1 }}
                        >
                           {block || "..."}
                        </motion.div>
                     )}
                  </div>
               );
            })}
         </div>

         {/* Integrity Status HUD */}
         <div className="absolute bottom-8 right-0 font-mono text-xs text-slate-400 text-right">
            Memory Integrity: {Math.round(((TOTAL_BLOCKS - daysElapsed) / TOTAL_BLOCKS) * 100)}%
            <br />
            Blocks Corrupted: {daysElapsed} / {TOTAL_BLOCKS}
         </div>
      </motion.div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-800">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Days Elapsed
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400">Day 0</span>
               <input 
                  type="range" 
                  min="0" 
                  max={TOTAL_BLOCKS} 
                  step="1" 
                  value={daysElapsed} 
                  onChange={(e) => setDaysElapsed(parseInt(e.target.value))}
                  className="flex-1 accent-slate-500"
               />
               <span className="text-xs text-slate-400">Day 7</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border border-slate-300 rounded-full tracking-widest uppercase text-slate-600 bg-slate-100">
               {TOTAL_BLOCKS - daysElapsed} pieces remaining
            </div>
         </div>
      )}
      
    </div>
  );
}
