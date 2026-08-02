"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

function getSeasonData(month: number) {
   // 0 = Jan, 11 = Dec
   if (month === 11 || month <= 1) {
      return {
         name: "Winter",
         skyColor: "linear-gradient(to bottom, #cbd5e1, #f1f5f9)",
         groundColor: "#f8fafc",
         leafColor: "#ffffff",
         leafScale: 0.2, // Barely any leaves, mostly snow
         trunkColor: "#475569",
         weather: "snow"
      };
   }
   if (month >= 2 && month <= 4) {
      return {
         name: "Spring",
         skyColor: "linear-gradient(to bottom, #7dd3fc, #bae6fd)",
         groundColor: "#86efac",
         leafColor: "#f472b6", // Pink blossoms
         leafScale: 0.8,
         trunkColor: "#57534e",
         weather: "petals"
      };
   }
   if (month >= 5 && month <= 7) {
      return {
         name: "Summer",
         skyColor: "linear-gradient(to bottom, #38bdf8, #7dd3fc)",
         groundColor: "#4ade80",
         leafColor: "#22c55e",
         leafScale: 1.1,
         trunkColor: "#44403c",
         weather: "clear"
      };
   }
   return {
      name: "Autumn",
      skyColor: "linear-gradient(to bottom, #fca5a5, #fed7aa)",
      groundColor: "#fbbf24",
      leafColor: "#ea580c",
      leafScale: 0.9,
      trunkColor: "#292524",
      weather: "falling_leaves"
   };
}

export function SeasonalTree({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";

  const handleReveal = () => {
     if (!isUnlocked) {
        setIsUnlocked(true);
        if (onComplete) onComplete();
     }
  };

  const season = getSeasonData(month);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif select-none items-center justify-end transition-all duration-1000"
      style={{ background: season.skyColor }}
    >
      {/* Weather particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <AnimatePresence>
            {season.weather === "snow" && [...Array(30)].map((_, i) => (
               <motion.div
                  key={`snow-${i}`}
                  initial={{ y: -20, x: Math.random() * 100 + "vw", opacity: 0 }}
                  animate={{ y: "100vh", opacity: [0, 1, 0] }}
                  transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                  className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
               />
            ))}
            {season.weather === "petals" && [...Array(20)].map((_, i) => (
               <motion.div
                  key={`petal-${i}`}
                  initial={{ y: -20, x: Math.random() * 100 + "vw", rotate: 0, opacity: 0 }}
                  animate={{ y: "100vh", x: `calc(${Math.random() * 100}vw + 50px)`, rotate: 360, opacity: [0, 1, 0] }}
                  transition={{ duration: Math.random() * 5 + 4, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                  className="absolute w-3 h-2 bg-pink-300 rounded-full blur-[1px]"
                  style={{ borderRadius: '50% 0 50% 0' }}
               />
            ))}
            {season.weather === "falling_leaves" && [...Array(15)].map((_, i) => (
               <motion.div
                  key={`leaf-${i}`}
                  initial={{ y: -20, x: Math.random() * 100 + "vw", rotate: 0, opacity: 0 }}
                  animate={{ y: "100vh", x: `calc(${Math.random() * 100}vw - 100px)`, rotate: -360, opacity: [0, 1, 0] }}
                  transition={{ duration: Math.random() * 6 + 3, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                  className="absolute w-4 h-3 bg-orange-500 rounded-full blur-[1px]"
                  style={{ borderRadius: '50% 0 50% 0' }}
               />
            ))}
         </AnimatePresence>
      </div>

      {/* The Sun/Moon/Decals */}
      <motion.div 
         className="absolute top-10 right-20 w-32 h-32 rounded-full mix-blend-overlay opacity-50 bg-white blur-xl"
      />

      {/* The Tree */}
      <div className="relative z-10 flex flex-col items-center mb-16">
         {/* Leaves/Canopy */}
         <div className="relative w-64 h-64 flex items-center justify-center -mb-12">
            {[...Array(5)].map((_, i) => (
               <motion.div
                  key={`canopy-${i}`}
                  className="absolute rounded-full"
                  style={{
                     width: 100 + Math.random() * 60,
                     height: 100 + Math.random() * 60,
                     top: Math.random() * 80,
                     left: 20 + i * 30,
                  }}
                  animate={{ 
                     backgroundColor: season.leafColor,
                     scale: season.leafScale,
                  }}
                  transition={{ duration: 1 }}
               />
            ))}
         </div>

         {/* Trunk */}
         <motion.div
            className="w-16 h-64 relative flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
            animate={{ backgroundColor: season.trunkColor }}
            transition={{ duration: 1 }}
            onClick={handleReveal}
         >
            {/* Roots */}
            <motion.div className="absolute -bottom-2 -left-8 w-16 h-4 rounded-full" animate={{ backgroundColor: season.trunkColor }} />
            <motion.div className="absolute -bottom-2 -right-8 w-16 h-4 rounded-full" animate={{ backgroundColor: season.trunkColor }} />
            
            {/* The Carving */}
            <div className="absolute top-20 text-center px-2 py-4 w-[140%] -ml-[20%] rounded-lg backdrop-blur-sm bg-black/20 border border-white/10 text-white/90 font-bold mix-blend-overlay">
               {isUnlocked ? (
                  <p className="text-sm font-sans drop-shadow-md whitespace-pre-wrap leading-tight">{config.body}</p>
               ) : (
                  <p className="text-xl uppercase tracking-widest opacity-80">{config.title || "TAP"}</p>
               )}
            </div>
         </motion.div>
      </div>

      {/* Ground */}
      <motion.div 
         className="absolute bottom-0 w-[150%] h-32 rounded-[100%] translate-y-16"
         animate={{ backgroundColor: season.groundColor }}
         transition={{ duration: 1 }}
      />

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-800 font-black uppercase tracking-widest text-[10px] mb-4 text-center">
               Simulation: Current Month
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs">Jan</span>
               <input 
                  type="range" 
                  min="0" 
                  max="11" 
                  step="1" 
                  value={month} 
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="flex-1 accent-slate-800"
               />
               <span className="text-xs">Dec</span>
            </div>
            <div className="mt-2 text-slate-800 font-black tracking-widest uppercase text-sm">
               {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month]} - {season.name}
            </div>
         </div>
      )}
      
    </div>
  );
}
