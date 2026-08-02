"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Droplet, Plus, Info } from "lucide-react";

export function CalorieGlassVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const liquidColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  const maxCalories = 2000;
  const [currentCalories, setCurrentCalories] = useState(1200);
  const [isSpilling, setIsSpilling] = useState(false);
  const [recentAdd, setRecentAdd] = useState(0);

  const fillPercentage = Math.min((currentCalories / maxCalories) * 100, 100);
  const overflowPercentage = Math.max(0, ((currentCalories - maxCalories) / maxCalories) * 100);

  const handleAddFood = (cals: number) => {
     const newTotal = currentCalories + cals;
     setCurrentCalories(newTotal);
     setRecentAdd(cals);
     
     if (newTotal > maxCalories && !isSpilling) {
        setIsSpilling(true);
        if (onComplete) onComplete();
     } else if (newTotal <= maxCalories) {
        setIsSpilling(false);
     }
  };

  const handleReset = () => {
     setCurrentCalories(0);
     setIsSpilling(false);
  };

  // Generate random spills when overflowing
  const spills = isSpilling ? Array.from({ length: Math.min(10, overflowPercentage / 2 + 3) }) : [];

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start pointer-events-none">
         <div className="bg-white/80 backdrop-blur border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-1 flex items-center gap-2">
               <Utensils size={16} />
               {config.title || "Calorie Budget"}
            </h2>
            <div className="flex items-baseline gap-2">
               <span className={`text-3xl font-black tracking-tight ${currentCalories > maxCalories ? 'text-red-500' : 'text-slate-800'}`}>
                  {currentCalories}
               </span>
               <span className="text-sm font-bold text-slate-400">/ {maxCalories} kcal</span>
            </div>
         </div>
      </div>

      {/* Main Glass Visual */}
      <div className="flex-1 flex flex-col justify-end items-center pb-24 relative z-10">
         
         <AnimatePresence>
            {recentAdd > 0 && (
               <motion.div 
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  key={`drop-${Date.now()}`}
                  className="absolute top-32 z-40 bg-white px-4 py-2 rounded-full font-black text-xl shadow-xl flex items-center gap-2"
                  style={{ color: liquidColor }}
               >
                  <Plus size={20} strokeWidth={4} /> {recentAdd}
               </motion.div>
            )}
         </AnimatePresence>

         {/* The Glass Container */}
         <div className="relative flex flex-col items-center">
            
            {/* The Brim Line */}
            <div className="absolute top-0 w-[120%] border-t-2 border-dashed border-red-500 opacity-50 z-20 flex justify-end">
               <span className="text-[10px] font-bold text-red-500 bg-white px-1 -mt-2 mr-2">BRIM</span>
            </div>

            {/* Glass Structure */}
            <div 
               className="w-48 sm:w-64 h-80 sm:h-96 border-4 border-t-0 rounded-b-3xl relative"
               style={{ 
                  borderColor: "rgba(0,0,0,0.1)", 
                  backgroundColor: "rgba(255,255,255,0.5)",
                  overflow: "visible" // CRITICAL: allows spilling
               }}
            >
               {/* Shine Effect */}
               <div className="absolute top-4 bottom-4 left-4 w-4 bg-white/40 rounded-full blur-sm z-20" />
               <div className="absolute top-4 bottom-4 right-4 w-1 bg-white/20 rounded-full blur-[1px] z-20" />

               {/* The Liquid */}
               <motion.div 
                  className="absolute bottom-0 left-0 right-0 rounded-b-2xl origin-bottom"
                  animate={{ height: `${fillPercentage}%` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                  style={{ backgroundColor: liquidColor }}
               >
                  {/* Liquid Surface */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 -mt-2 rounded-[50%]" />
                  {/* Internal Bubbles */}
                  {Array.from({length: 5}).map((_, i) => (
                     <motion.div 
                        key={i}
                        className="absolute bottom-4 bg-white/30 rounded-full"
                        style={{ left: `${20 + i*15}%`, width: 8, height: 8 }}
                        animate={{ y: [0, -100, 0], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                     />
                  ))}
               </motion.div>

               {/* Spilling Animation elements rendered outside the normal flow via overflow:visible */}
               <AnimatePresence>
                  {isSpilling && spills.map((_, i) => (
                     <motion.div
                        key={`spill-${i}`}
                        className="absolute w-4 h-4 rounded-full z-30"
                        style={{ backgroundColor: liquidColor, top: 0 }}
                        initial={{ 
                           x: i % 2 === 0 ? -10 : "100%", 
                           y: 0,
                           opacity: 1,
                           scale: 1 + Math.random()
                        }}
                        animate={{ 
                           x: i % 2 === 0 ? -40 - (Math.random()*40) : `calc(100% + ${10 + Math.random()*40}px)`, 
                           y: 400 + Math.random() * 100, // Fall down screen
                           opacity: [1, 1, 0]
                        }}
                        transition={{ 
                           duration: 1.5 + Math.random(), 
                           repeat: Infinity,
                           delay: Math.random() * 2,
                           ease: "easeIn"
                        }}
                     />
                  ))}
               </AnimatePresence>

            </div>
         </div>

         {/* Alert Message */}
         <AnimatePresence>
            {isSpilling && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 bg-red-50 text-red-600 px-6 py-3 rounded-full font-bold flex items-center gap-2 border border-red-200 shadow-sm"
               >
                  <Droplet size={18} fill="currentColor" />
                  Warning: Calorie Spill
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Quick Add Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
         <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
            {[100, 250, 500, 800].map(cals => (
               <button
                  key={cals}
                  onClick={() => handleAddFood(cals)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-xl flex flex-col items-center gap-1 transition-transform active:scale-95"
               >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest"><Plus size={10} className="inline" /> Add</span>
                  {cals}
               </button>
            ))}
         </div>
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleReset}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Empty Glass (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
