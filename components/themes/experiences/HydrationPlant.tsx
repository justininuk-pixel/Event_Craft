"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sprout, CheckCircle, RotateCcw } from "lucide-react";

export function HydrationPlant({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#059669"; // emerald-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // emerald-50

  const goalGlasses = 8;
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [history, setHistory] = useState<{ date: string, count: number }[]>([]);
  
  // Simulate a hard midnight reset for demo/editor purposes by allowing a manual reset or using real Date checking
  useEffect(() => {
     // In a real app this would check if it's a new day since last log.
     // For this demo, we just rely on state.
  }, []);

  const handleDrink = () => {
     if (currentGlasses < goalGlasses) {
        setCurrentGlasses(prev => prev + 1);
        if (currentGlasses + 1 === goalGlasses) {
           if (onComplete) onComplete();
        }
     }
  };

  const handleMidnightReset = () => {
     // Harvest and reset
     setHistory(prev => [{ date: new Date().toLocaleDateString(), count: currentGlasses }, ...prev].slice(0, 5));
     setCurrentGlasses(0);
  };

  // Helper to render the plant SVG based on current progress
  const renderPlant = () => {
     const progress = currentGlasses / goalGlasses; // 0 to 1
     
     return (
        <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-2xl overflow-visible">
           {/* Pot */}
           <path d="M 60 250 L 140 250 L 120 290 L 80 290 Z" fill="#b45309" />
           <path d="M 50 240 L 150 240 L 150 250 L 50 250 Z" fill="#92400e" />
           <path d="M 60 240 Q 100 245 140 240" stroke="#78350f" strokeWidth="4" fill="none" />

           {/* Stem */}
           <motion.path 
              d="M 100 240 Q 90 150 100 60" 
              fill="none" 
              stroke={primaryColor} 
              strokeWidth="6" 
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.max(0.1, progress) }}
              transition={{ duration: 1, type: "spring" }}
           />

           {/* Leaves based on glasses (8 leaves max) */}
           <AnimatePresence>
              {currentGlasses >= 1 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 100 200 Q 130 200 130 180 Q 100 180 100 200" fill={primaryColor} />
              )}
              {currentGlasses >= 2 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 98 180 Q 60 180 60 150 Q 98 150 98 180" fill={primaryColor} />
              )}
              {currentGlasses >= 3 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 100 150 Q 140 140 140 110 Q 100 120 100 150" fill={primaryColor} />
              )}
              {currentGlasses >= 4 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 97 130 Q 50 120 50 90 Q 97 100 97 130" fill={primaryColor} />
              )}
              {currentGlasses >= 5 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 100 100 Q 140 80 130 50 Q 100 70 100 100" fill={primaryColor} />
              )}
              {currentGlasses >= 6 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 98 80 Q 50 60 60 30 Q 98 50 98 80" fill={primaryColor} />
              )}
              {currentGlasses >= 7 && (
                 <motion.path initial={{scale:0}} animate={{scale:1}} d="M 100 60 Q 120 30 110 10 Q 90 30 100 60" fill={primaryColor} />
              )}
              {currentGlasses >= 8 && (
                 <motion.circle initial={{scale:0}} animate={{scale:1}} cx="103" cy="20" r="15" fill="#f43f5e" /> // A flower blooms!
              )}
           </AnimatePresence>
        </svg>
     );
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-emerald-950 items-center justify-center"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* HUD Info */}
      <div className="absolute top-8 text-center max-w-sm w-full px-6 z-20">
         <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <Sprout size={24} />
         </div>
         <h2 className="text-3xl font-black tracking-tight mb-2">
            {config.title || "Hydration Plant"}
         </h2>
         <p className="text-emerald-700/80 font-bold uppercase tracking-widest text-xs">
            {config.body || "Drink water to grow your plant before midnight."}
         </p>
      </div>

      {/* Main Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center mt-20 relative w-full">
         
         <div className="absolute top-1/4 left-8 text-center hidden md:block">
            <span className="block text-4xl font-black tabular-nums">{currentGlasses}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Glasses</span>
         </div>
         <div className="absolute top-1/4 right-8 text-center hidden md:block opacity-50">
            <span className="block text-4xl font-black tabular-nums">{goalGlasses}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Goal</span>
         </div>

         <div className="w-64 h-96 relative">
            {renderPlant()}
            
            {/* Sparkles if complete */}
            <AnimatePresence>
               {currentGlasses >= goalGlasses && (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="absolute inset-0 pointer-events-none"
                  >
                     <div className="absolute top-0 right-10 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                     <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* Controls */}
      <div className="w-full max-w-sm mb-12 px-6 z-20 space-y-4">
         
         <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="font-bold text-emerald-700">{currentGlasses} drank</span>
            <span className="font-bold text-emerald-400">{goalGlasses} goal</span>
         </div>
         
         {/* Progress Bar */}
         <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden shadow-inner mb-6">
            <motion.div 
               className="h-full bg-emerald-500 rounded-full"
               initial={{ width: 0 }}
               animate={{ width: `${(currentGlasses / goalGlasses) * 100}%` }}
               transition={{ duration: 0.5 }}
            />
         </div>

         {currentGlasses < goalGlasses ? (
            <button
               onClick={handleDrink}
               className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
               style={{ backgroundColor: primaryColor }}
            >
               <Droplets strokeWidth={3} fill="currentColor" /> Drank Water
            </button>
         ) : (
            <div className="bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border border-emerald-200">
               <CheckCircle strokeWidth={3} /> Goal Reached!
            </div>
         )}
      </div>

      {/* Editor Bypass for Midnight Reset */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleMidnightReset}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               <RotateCcw size={12} /> Trigger Midnight Reset
            </button>
         </div>
      )}

      {/* History Log Overlay */}
      {history.length > 0 && (
         <div className="absolute bottom-4 left-4 z-20 text-xs font-bold text-emerald-600/50 hidden md:block">
            Harvest History:
            {history.map((h, i) => (
               <div key={i}>{h.date}: {h.count}/{goalGlasses}</div>
            ))}
         </div>
      )}

    </div>
  );
}
