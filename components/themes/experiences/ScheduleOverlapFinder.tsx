"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Crosshair } from "lucide-react";

// 7 days * 24 hours * 2 half-hours = 336 slots (simplified for demo to 7 slots x 4 blocks = 28 blocks)
// 0 = free, 1 = busy
const p1Schedule = [0, 1, 0, 0, 1, 1, 0,   1, 1, 0, 0, 0, 0, 1,   0, 0, 1, 1, 0, 0, 0,   1, 1, 1, 0, 0, 1, 1];
const p2Schedule = [1, 1, 0, 1, 1, 0, 0,   0, 1, 0, 1, 1, 0, 1,   0, 1, 1, 0, 0, 1, 1,   1, 0, 1, 0, 1, 1, 0];
const p3Schedule = [0, 1, 0, 0, 0, 1, 1,   1, 0, 0, 1, 0, 0, 1,   0, 1, 1, 0, 0, 1, 0,   0, 1, 1, 0, 1, 1, 1];

export function ScheduleOverlapFinder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [phase, setPhase] = useState<"stacked" | "carving" | "result">("stacked");

  const overlap = p1Schedule.map((val, i) => (val | p2Schedule[i] | p3Schedule[i])); // Bitwise OR

  const handleStart = () => {
     setPhase("carving");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     
     setTimeout(() => {
        setPhase("result");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (onComplete) setTimeout(onComplete, 5000);
     }, 2000);
  };

  const getDayLabel = (i: number) => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][i % 7];

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-950 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 flex justify-between items-center bg-slate-900 border-b border-slate-800">
         <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Users size={16} /> Sync
         </h2>
         <span className="text-[10px] text-slate-500 font-mono">3 Schedules</span>
      </div>

      <div className="flex-1 flex flex-col relative z-10 p-6 justify-center">
         
         <div className="relative w-full max-w-sm mx-auto grid grid-cols-7 gap-1">
            {/* Headers */}
            {Array.from({ length: 7 }).map((_, i) => (
               <div key={`h-${i}`} className="text-[8px] text-center font-bold text-slate-600 mb-2 uppercase">{getDayLabel(i)}</div>
            ))}
            
            {/* The Grid */}
            {overlap.map((val, i) => {
               // val 0 = free for everyone
               const isFree = val === 0;

               let displayClass = "bg-slate-800"; // default stacked

               if (phase === "carving") {
                  displayClass = isFree ? "bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" : "bg-slate-900 opacity-20";
               } else if (phase === "result") {
                  displayClass = isFree ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] scale-110 z-10" : "bg-slate-950 opacity-10";
               } else {
                  // Stacked phase: visually complicated
                  displayClass = (p1Schedule[i] ? "bg-blue-900 " : "") + (p2Schedule[i] ? "bg-rose-900 mix-blend-screen " : "") + (p3Schedule[i] ? "bg-amber-900 mix-blend-screen " : "");
                  if (!p1Schedule[i] && !p2Schedule[i] && !p3Schedule[i]) displayClass = "bg-emerald-900/30 border border-emerald-500/20"; // the target
               }

               return (
                  <motion.div 
                     key={i} 
                     layout
                     transition={{ duration: 0.5, delay: phase === "carving" ? i * 0.02 : 0 }}
                     className={`aspect-square rounded-sm transition-all duration-300 ${displayClass}`}
                  />
               )
            })}
         </div>

         <AnimatePresence>
            {phase === "result" && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-32 left-0 w-full text-center"
               >
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-full font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                     <Crosshair size={16} /> Time Found
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800">
         {phase === "stacked" && (
            <button 
               onClick={handleStart}
               className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
               Find Overlap
            </button>
         )}
         {phase !== "stacked" && (
            <button 
               disabled
               className="w-full py-4 bg-slate-800 text-slate-500 rounded-xl font-bold uppercase tracking-widest cursor-not-allowed"
            >
               Calculated
            </button>
         )}
      </div>

    </div>
  );
}
