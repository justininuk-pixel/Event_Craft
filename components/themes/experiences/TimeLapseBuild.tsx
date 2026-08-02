"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function TimeLapseBuild({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // In a real app, this would be derived from the DB creation date vs Date.now()
  const TOTAL_DAYS = 30;
  
  const [simulatedDays, setSimulatedDays] = useState<number>(mode === "editor-preview" ? 0 : TOTAL_DAYS);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // Brick color
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#bae6fd"]; // Sky color

  useEffect(() => {
     if (simulatedDays >= TOTAL_DAYS && !isUnlocked) {
        setIsUnlocked(true);
        if (onComplete) {
           setTimeout(() => onComplete(), 1500);
        }
     } else if (simulatedDays < TOTAL_DAYS && isUnlocked) {
        setIsUnlocked(false);
     }
  }, [simulatedDays, isUnlocked, onComplete]);

  // Generate 30 blocks that form a house structure
  // Using an isometric-ish CSS projection
  const blocks = useMemo(() => {
     const b = [];
     
     // 5 layers of 6 blocks (3x2 grid)
     const rows = 3;
     const cols = 2;
     const layers = 5;
     
     let dayIndex = 1;
     for (let l = 0; l < layers; l++) {
        for (let r = 0; r < rows; r++) {
           for (let c = 0; c < cols; c++) {
              // Create roof shape for top layer
              const isRoof = l === layers - 1;
              const isDoor = l === 0 && r === 1 && c === 1;
              
              b.push({
                 day: dayIndex++,
                 x: c * 40 - r * 40,
                 y: c * 20 + r * 20 - l * 40,
                 z: -r * 10 - c * 10,
                 isRoof,
                 isDoor
              });
           }
        }
     }
     
     return b;
  }, []);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col">
         {/* Clouds / BG elements could go here */}
      </div>

      <div className="text-center absolute top-12 md:top-24 w-full px-4 z-30">
         <h2 className="text-slate-600 font-bold uppercase tracking-widest text-sm mb-2 opacity-70">
            Construction Log
         </h2>
         <div className="text-4xl font-black text-slate-800 font-mono tracking-tighter">
            DAY {Math.floor(simulatedDays).toString().padStart(2, '0')} / {TOTAL_DAYS}
         </div>
         {isUnlocked && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-md mx-auto border border-slate-200"
            >
               <h1 className="text-2xl font-bold uppercase text-slate-800 mb-2">{config.title}</h1>
               <p className="text-slate-600 font-medium whitespace-pre-wrap">{config.body}</p>
            </motion.div>
         )}
      </div>

      {/* The Building Site */}
      <div className="relative mt-32 w-64 h-64 flex items-center justify-center z-20">
         
         {/* Foundation/Ground */}
         <div className="absolute top-[80px] w-48 h-48 bg-emerald-600/20 rotate-45 skew-x-12 scale-y-50 rounded shadow-[0_0_50px_rgba(16,185,129,0.3)]" />

         <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
            <AnimatePresence>
               {blocks.map((block) => {
                  const isVisible = simulatedDays >= block.day;
                  if (!isVisible) return null;

                  return (
                     <motion.div
                        key={block.day}
                        initial={{ opacity: 0, y: block.y - 100, scale: 0.5 }}
                        animate={{ opacity: 1, y: block.y, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12, mass: 0.5 }}
                        className="absolute left-1/2 top-1/2 w-[40px] h-[40px]"
                        style={{
                           marginLeft: block.x,
                           zIndex: block.z + 100,
                        }}
                     >
                        {/* Fake Isometric Block CSS */}
                        <div className="relative w-full h-full">
                           {/* Top face */}
                           <div 
                              className="absolute w-[40px] h-[40px] border border-black/10 origin-bottom-left"
                              style={{ 
                                 backgroundColor: block.isRoof ? "#b91c1c" : block.isDoor ? "#451a03" : primaryColor,
                                 transform: "rotateX(60deg) rotateZ(-45deg)",
                                 top: "-20px", left: "0px",
                                 filter: "brightness(1.2)"
                              }}
                           />
                           {/* Left face */}
                           <div 
                              className="absolute w-[40px] h-[40px] border border-black/10 origin-top-left"
                              style={{ 
                                 backgroundColor: block.isRoof ? "#991b1b" : block.isDoor ? "#78350f" : primaryColor,
                                 transform: "skewY(30deg)",
                                 top: "0px", left: "0px",
                                 filter: "brightness(0.9)"
                              }}
                           />
                           {/* Right face */}
                           <div 
                              className="absolute w-[40px] h-[40px] border border-black/10 origin-top-right"
                              style={{ 
                                 backgroundColor: block.isRoof ? "#7f1d1d" : block.isDoor ? "#451a03" : primaryColor,
                                 transform: "skewY(-30deg)",
                                 top: "0px", left: "40px",
                                 filter: "brightness(0.7)"
                              }}
                           />
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time-Lapse Progress
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs text-slate-400">Day 0</span>
               <input 
                  type="range" 
                  min="0" 
                  max={TOTAL_DAYS} 
                  step="1" 
                  value={simulatedDays} 
                  onChange={(e) => setSimulatedDays(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500"
               />
               <span className="text-xs text-slate-400">Day {TOTAL_DAYS}</span>
            </div>
         </div>
      )}
      
    </div>
  );
}
