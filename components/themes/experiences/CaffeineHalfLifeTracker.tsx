"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Coffee, Zap, Moon, Plus } from "lucide-react";

type Drink = {
  id: string;
  name: string;
  mg: number;
};

const PRESETS: Drink[] = [
   { id: "d1", name: "Coffee (8oz)", mg: 95 },
   { id: "d2", name: "Espresso", mg: 64 },
   { id: "d3", name: "Energy Drink", mg: 150 },
   { id: "d4", name: "Black Tea", mg: 47 },
];

export function CaffeineHalfLifeTracker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const [logs, setLogs] = useState<{ timestamp: number, mg: number }[]>([]);
  const [currentCaffeine, setCurrentCaffeine] = useState<number>(0);
  
  const halfLifeHours = 5; // Standard caffeine half-life
  
  // Update the caffeine level every second
  useEffect(() => {
     const interval = setInterval(() => {
        let total = 0;
        const now = Date.now();
        logs.forEach(log => {
           const hoursElapsed = (now - log.timestamp) / (1000 * 60 * 60);
           // Exponential decay formula: N(t) = N0 * (1/2)^(t/t_half)
           const remaining = log.mg * Math.pow(0.5, hoursElapsed / halfLifeHours);
           total += remaining;
        });
        setCurrentCaffeine(total);
     }, 1000);

     return () => clearInterval(interval);
  }, [logs]);

  const handleLogDrink = (mg: number) => {
     setLogs(prev => [...prev, { timestamp: Date.now(), mg }]);
     setCurrentCaffeine(prev => prev + mg);
     if (onComplete) onComplete();
  };

  // Editor bypass - inject 150mg 4 hours ago
  const handleEditorInject = () => {
     const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
     setLogs(prev => [...prev, { timestamp: fourHoursAgo, mg: 150 }]);
     if (onComplete) onComplete();
  };

  const isJittery = currentCaffeine > 100;
  const isSleepable = currentCaffeine < 30;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-amber-900"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Effect based on caffeine level */}
      <motion.div 
         className="absolute inset-0 pointer-events-none opacity-20"
         animate={{ 
            background: isJittery 
               ? "repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 2px, transparent 2px, transparent 10px)" 
               : "repeating-linear-gradient(45deg, transparent 0px, transparent 2px, transparent 2px, transparent 10px)"
         }}
      />

      <div className="w-full max-w-md mx-auto flex flex-col h-full z-10 p-6">
         
         {/* Header */}
         <div className="text-center mb-8 pt-8">
            <motion.div 
               animate={isJittery ? { x: [-2, 2, -2, 2, 0], y: [-2, 2, -2, 2, 0] } : {}}
               transition={isJittery ? { repeat: Infinity, duration: 0.1 } : {}}
               className="inline-flex items-center justify-center p-4 rounded-full bg-amber-200 mb-4 shadow-lg border border-amber-300"
            >
               <Zap size={32} style={{ color: primaryColor }} />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight mb-1 text-amber-950">
               {config.title || "Caffeine Half-Life"}
            </h2>
            <p className="text-amber-700/80 font-bold uppercase tracking-widest text-xs">
               {config.body || "Tracking Exponential Decay"}
            </p>
         </div>

         {/* The Big Number */}
         <div className="flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-amber-100 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
               <Coffee size={120} />
            </div>
            
            <span className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2 z-10">Active in Bloodstream</span>
            
            <motion.div 
               animate={isJittery ? { rotate: [-1, 1, -1, 1, 0] } : {}}
               transition={isJittery ? { repeat: Infinity, duration: 0.2 } : {}}
               className="text-7xl font-black tracking-tighter text-amber-950 flex items-baseline gap-2 z-10"
            >
               {currentCaffeine.toFixed(1)} <span className="text-2xl text-amber-500">mg</span>
            </motion.div>

            <div className={`mt-6 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors z-10 ${
               isSleepable ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
            }`}>
               {isSleepable ? (
                  <>
                     <Moon size={16} />
                     Sleep should be possible
                  </>
               ) : (
                  <>
                     <Zap size={16} />
                     Currently inhibiting sleep
                  </>
               )}
            </div>
         </div>

         {/* Add Drink Buttons */}
         <div className="grid grid-cols-2 gap-3 mt-auto">
            {PRESETS.map(drink => (
               <button
                  key={drink.id}
                  onClick={() => handleLogDrink(drink.mg)}
                  className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-200 hover:border-amber-400 p-4 rounded-2xl flex flex-col items-start gap-2 transition-all active:scale-95 text-left"
               >
                  <div className="flex items-center justify-between w-full">
                     <span className="font-bold text-amber-900 leading-tight">{drink.name}</span>
                     <div className="w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                        <Plus size={14} strokeWidth={3} />
                     </div>
                  </div>
                  <span className="text-sm font-black text-amber-600">{drink.mg}mg</span>
               </button>
            ))}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && currentCaffeine === 0 && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleEditorInject}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Inject 150mg (4hrs ago)
            </button>
         </div>
      )}

    </div>
  );
}
