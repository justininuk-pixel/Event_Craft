"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2 } from "lucide-react";

const distances = ["1 block", "2 blocks", "3 blocks", "until the next intersection", "until you see a red car", "until you hit a dead end"];
const directions = ["North", "South", "East", "West", "Left", "Right"];

export function RandomWalkGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [step, setStep] = useState(0);
  const [instruction, setInstruction] = useState<string | null>(null);

  const generateMove = () => {
    const dist = distances[Math.floor(Math.random() * distances.length)];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    setInstruction(`Walk ${dist} ${dir}.`);
    setStep(prev => prev + 1);
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    
    if (step >= 5 && onComplete) {
       // Just as an example, after 6 moves we consider it done
       setTimeout(onComplete, 5000);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-900 text-slate-200 justify-center items-center p-6" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

      <div className="absolute top-12 w-full text-center z-10">
         <Navigation2 size={24} className="mx-auto mb-2 text-blue-500" />
         <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Procedural Exploration</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
         <AnimatePresence mode="wait">
            {!instruction ? (
               <motion.div 
                 key="start"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="text-center"
               >
                  <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
                     Relinquish control. Let the algorithm guide your physical movement through the city.
                  </p>
                  <button 
                     onClick={generateMove}
                     className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all active:scale-95"
                  >
                     Generate Route
                  </button>
               </motion.div>
            ) : (
               <motion.div 
                 key={step}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="w-full max-w-sm bg-slate-800 border-2 border-slate-700 p-8 rounded-xl shadow-2xl text-center"
               >
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-4">Directive #{step}</div>
                  <h3 className="text-3xl font-black text-white leading-snug mb-8 uppercase">
                     {instruction}
                  </h3>
                  <button 
                     onClick={generateMove}
                     className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold uppercase tracking-widest transition-all active:scale-95"
                  >
                     I have arrived. Next move.
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
