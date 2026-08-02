"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function AnnualReview({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeUntil, setTimeUntil] = useState("");
  const [simulatedTimeTravel, setSimulatedTimeTravel] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d946ef"; // Fuchsia
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // Zinc 900
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#fafafa";

  useEffect(() => {
     const checkDate = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        // Lock opens only on Dec 31
        if ((currentMonth === 11 && currentDay === 31) || simulatedTimeTravel) {
           setIsUnlocked(true);
    onComplete?.();
           if (onComplete) setTimeout(onComplete, 3000);
        } else {
           setIsUnlocked(false);
           
           // Calculate time until next Dec 31
           const currentYear = now.getFullYear();
           const nextDec31 = new Date(currentYear, 11, 31);
           
           if (now > nextDec31) {
              nextDec31.setFullYear(currentYear + 1);
           }
           
           const diffMs = nextDec31.getTime() - now.getTime();
           const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
           const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
           const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
           const s = Math.floor((diffMs % (1000 * 60)) / 1000);

           setTimeUntil(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
        }
     };

     checkDate();
     const interval = setInterval(checkDate, 1000);
     return () => clearInterval(interval);
  }, [simulatedTimeTravel, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-[2000ms] flex flex-col items-center justify-center"
      style={{ backgroundColor: isUnlocked ? bgColors[0] : "#000000" }} 
    >
      <AnimatePresence mode="wait">
         {!isUnlocked ? (
            <motion.div 
               key="locked"
               className="flex flex-col items-center justify-center w-full h-full text-center relative z-10 px-6"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
               transition={{ duration: 1 }}
            >
               {/* Massive Vault Door Visual */}
               <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] border-slate-800 flex items-center justify-center relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] bg-slate-900 mb-12">
                  <div className="absolute inset-0 rounded-full border border-slate-700 m-2 pointer-events-none" />
                  
                  {/* Keyhole / Lock Core */}
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center shadow-inner">
                     <div className="w-2 h-6 bg-slate-800 rounded-sm" />
                  </div>

                  {/* Spinning Ring */}
                  <motion.div 
                     className="absolute inset-0 rounded-full border-t-4 border-l-4 border-transparent pointer-events-none"
                     style={{ borderTopColor: primaryColor }}
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                  />
               </div>

               <h2 className="text-xl md:text-2xl text-slate-300 font-serif mb-4 uppercase tracking-widest">
                  Annual Vault Locked
               </h2>
               <p className="text-slate-500 text-sm max-w-sm mb-6">
                  This experience is designed as an annual ritual. It will only open on December 31st.
               </p>
               
               <div className="font-mono text-2xl md:text-4xl text-slate-200 tracking-tighter" style={{ color: primaryColor }}>
                  {timeUntil}
               </div>
               <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 mt-2">
                  Time Until Dec 31
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="unlocked"
               className="flex flex-col items-center justify-center w-full h-full relative z-20 p-8 text-center"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5, delay: 0.5 }}
            >
               {/* Celebration Confetti Overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-[length:100px_100px]" />

               <div className="text-xs font-bold uppercase tracking-[0.4em] mb-8" style={{ color: primaryColor }}>
                  The Vault is Open
               </div>
               
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8" style={{ color: textColor }}>
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed max-w-2xl opacity-90" style={{ color: textColor }}>
                  {config.body}
               </p>

               <div className="mt-16 text-[10px] font-mono tracking-widest opacity-40 uppercase">
                  See you next year.
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isUnlocked && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Time Travel
            </h2>
            <button 
               onClick={() => setSimulatedTimeTravel(true)}
               className="w-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-indigo-400/50"
            >
               Time Travel to Dec 31
            </button>
         </div>
      )}
      
    </div>
  );
}
