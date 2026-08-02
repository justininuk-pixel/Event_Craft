"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const STREAK_GOAL = 5;

export function DigitalStreak({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [streak, setStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [phase, setPhase] = useState<"tracking" | "complete">("tracking");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];

  const handleCheckIn = () => {
     if (hasCheckedInToday) return;
     
     const nextStreak = streak + 1;
     setStreak(nextStreak);
     setHasCheckedInToday(true);
     setIsBroken(false);

     if (nextStreak >= STREAK_GOAL) {
        setTimeout(() => {
           setPhase("complete");
           if (onComplete) onComplete();
        }, 1500);
     }
  };

  const handleSimulateNextDay = () => {
     if (!hasCheckedInToday) {
        // If they didn't check in today and we advance a day, they missed a day.
        handleSimulateMissedDay();
     } else {
        // Safe to advance
        setHasCheckedInToday(false);
     }
  };

  const handleSimulateMissedDay = () => {
     setIsBroken(true);
     setStreak(0);
     setHasCheckedInToday(false);
     
     // Reset broken state after animation
     setTimeout(() => setIsBroken(false), 2000);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center p-8 transition-colors duration-1000"
      style={{ background: `linear-gradient(135deg, ${isBroken ? "#450a0a" : bgColors[0]}, ${isBroken ? "#000000" : (bgColors[1] || bgColors[0])})` }} 
    >
      <AnimatePresence mode="wait">
         {phase === "tracking" && (
            <motion.div
               key="tracking"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-12"
            >
               <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-2">
                     Daily Streak
                  </h1>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-sm">
                     Check in for {STREAK_GOAL} consecutive days.
                  </p>
               </div>

               {/* Streak Trackers */}
               <div className="flex gap-4 md:gap-8 justify-center">
                  {[...Array(STREAK_GOAL)].map((_, i) => {
                     const isFilled = i < streak;
                     return (
                        <motion.div
                           key={i}
                           className="relative w-12 h-12 md:w-16 md:h-16 border-2 transform rotate-45"
                           style={{ 
                              borderColor: isFilled ? primaryColor : "rgba(255,255,255,0.2)",
                              boxShadow: isFilled ? `0 0 20px ${primaryColor}` : "none"
                           }}
                           animate={isBroken ? { 
                              x: (Math.random() - 0.5) * 100, 
                              y: (Math.random() - 0.5) * 100 + 100,
                              rotate: Math.random() * 360,
                              opacity: 0,
                              transition: { duration: 0.5 }
                           } : {
                              x: 0, y: 0, opacity: 1, rotate: 45
                           }}
                        >
                           <motion.div
                              className="absolute inset-0"
                              style={{ backgroundColor: primaryColor }}
                              initial={{ scale: 0 }}
                              animate={{ scale: isFilled ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                           />
                        </motion.div>
                     );
                  })}
               </div>

               <AnimatePresence>
                  {isBroken && (
                     <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 font-black text-2xl uppercase tracking-widest absolute top-1/2 -translate-y-1/2"
                     >
                        Streak Broken!
                     </motion.p>
                  )}
               </AnimatePresence>

               {/* Check-In Button */}
               <motion.button
                  whileHover={{ scale: hasCheckedInToday ? 1 : 1.05 }}
                  whileTap={{ scale: hasCheckedInToday ? 1 : 0.95 }}
                  onClick={handleCheckIn}
                  disabled={hasCheckedInToday || isBroken}
                  className={`mt-8 px-12 py-4 rounded-full font-black text-xl uppercase tracking-widest transition-all ${
                     hasCheckedInToday 
                     ? "bg-white/10 text-white/30 cursor-not-allowed border border-white/10" 
                     : "text-white shadow-xl"
                  }`}
                  style={{ backgroundColor: hasCheckedInToday ? "transparent" : primaryColor }}
               >
                  {hasCheckedInToday ? "Checked In ✓" : "Check In Today"}
               </motion.button>
            </motion.div>
         )}

         {phase === "complete" && (
            <motion.div
               key="complete"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-10 w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center text-4xl shadow-lg" style={{ backgroundColor: primaryColor, color: "white" }}>
                  🔥
               </div>
               <h1 className="text-3xl font-black uppercase text-slate-800 mb-2">
                 Perfect Streak
               </h1>
               <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-sm">
                  {STREAK_GOAL} Days Completed
               </p>
               
               <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {config.title}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && phase === "tracking" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation Controls (Editor Only)
            </h2>
            <div className="flex w-full gap-4">
               <button 
                  onClick={handleSimulateNextDay}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors"
               >
                  Advance 1 Day
               </button>
               <button 
                  onClick={handleSimulateMissedDay}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 rounded-lg text-sm font-bold transition-colors"
               >
                  Miss 1 Day (Break)
               </button>
            </div>
         </div>
      )}
      
    </div>
  );
}
