"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass, DollarSign } from "lucide-react";

export function LifeEnergyCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316"; // orange-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafaf9"]; // stone-50

  const itemName = config.title || "New Smartphone";
  const itemCost = 1200;
  const hourlyWage = 25; // post-tax

  const trueCostHours = Math.ceil(itemCost / hourlyWage);

  const [revealed, setRevealed] = useState(false);
  const [hoursCounted, setHoursCounted] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (revealed && hoursCounted < trueCostHours) {
      // Animate counting up quickly
      const interval = Math.max(10, 1500 / trueCostHours);
      timer = setTimeout(() => {
         setHoursCounted(prev => {
            const next = prev + 1;
            if (next >= trueCostHours && onComplete) setTimeout(onComplete, 4000);
            return next;
         });
      }, interval);
    }
    return () => clearTimeout(timer);
  }, [revealed, hoursCounted, trueCostHours, onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-stone-50 text-stone-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
        
        <div className="mb-12">
           <h2 className="text-3xl font-black tracking-tight mb-2">{itemName}</h2>
           <div className="inline-flex items-center justify-center gap-1 bg-stone-200 px-4 py-2 rounded-full font-mono text-xl font-bold">
              <DollarSign size={20} className="text-stone-500" />
              {itemCost.toLocaleString()}
           </div>
        </div>

        <AnimatePresence mode="wait">
           {!revealed ? (
              <motion.div key="button" exit={{ opacity: 0, scale: 0.9 }}>
                 <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                    Based on your actual take-home pay of ${hourlyWage}/hr, calculate the true cost of this purchase.
                 </p>
                 <button 
                   onClick={() => setRevealed(true)}
                   className="px-8 py-4 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform"
                 >
                   Calculate True Cost
                 </button>
              </motion.div>
           ) : (
              <motion.div 
                key="result" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                 <Hourglass size={48} className="text-orange-500 mb-6 animate-pulse" />
                 
                 <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">This will cost you</div>
                 
                 <div className="text-7xl font-black text-stone-900 font-mono flex items-baseline gap-2 mb-8">
                    {hoursCounted}
                    <span className="text-2xl text-stone-400">Hours</span>
                 </div>
                 
                 <p className="text-sm text-stone-600 font-serif italic max-w-xs leading-relaxed">
                    of your actual life, working at your job.
                 </p>
              </motion.div>
           )}
        </AnimatePresence>

      </div>

      {/* Progress Bar showing shifts */}
      <div className="h-16 bg-stone-200 flex items-end">
         {revealed && (
            <div className="w-full h-full flex flex-col justify-end p-2 pb-4">
               <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2 ml-1">Work Shifts (8hr)</div>
               <div className="flex gap-1 h-6 w-full">
                  {Array.from({ length: Math.ceil(trueCostHours / 8) }).map((_, i) => {
                     // Check if this shift is fully/partially covered by current hoursCounted
                     const shiftStart = i * 8;
                     const shiftEnd = (i + 1) * 8;
                     let fill = 0;
                     if (hoursCounted >= shiftEnd) fill = 1;
                     else if (hoursCounted > shiftStart) fill = (hoursCounted - shiftStart) / 8;

                     return (
                        <div key={i} className="flex-1 bg-stone-300 rounded overflow-hidden relative">
                           <div 
                              className="absolute top-0 bottom-0 left-0 bg-orange-500 transition-all duration-75"
                              style={{ width: `${fill * 100}%` }}
                           />
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
