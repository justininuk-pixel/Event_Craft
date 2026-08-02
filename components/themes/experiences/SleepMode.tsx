"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function SleepMode({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const date = new Date();
  const currentHourDecimal = date.getHours() + date.getMinutes() / 60;
  
  // Default to 12 PM in preview, otherwise use real time
  const [simulatedTime, setSimulatedTime] = useState<number>(mode === "editor-preview" ? 12 : currentHourDecimal);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#1e293b";

  // Asleep between 23:00 and 07:00
  const isSleeping = simulatedTime >= 23 || simulatedTime < 7;

  useEffect(() => {
     if (!isSleeping && onComplete) {
        // Automatically mark complete after a few seconds of being awake
        const timer = setTimeout(() => {
           onComplete();
        }, 5000);
        return () => clearTimeout(timer);
     }
  }, [isSleeping, onComplete]);

  const formatTime = (decimalHours: number) => {
     const hrs = Math.floor(decimalHours);
     const mins = Math.floor((decimalHours % 1) * 60);
     const ampm = hrs >= 12 ? 'PM' : 'AM';
     const displayHrs = hrs % 12 || 12;
     return `${displayHrs}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center"
      style={{ backgroundColor: isSleeping ? "#0f172a" : bgColors[0] }} 
    >
      <AnimatePresence mode="wait">
         {isSleeping ? (
            <motion.div 
               key="asleep"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
               className="w-full h-full flex flex-col items-center justify-center relative z-10"
            >
               {/* Starry Night CSS */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                  {Array.from({ length: 50 }).map((_, i) => (
                     <div 
                        key={`star-${i}`} 
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                           width: Math.random() * 3 + 1 + 'px',
                           height: Math.random() * 3 + 1 + 'px',
                           top: Math.random() * 100 + '%',
                           left: Math.random() * 100 + '%',
                           animationDuration: (Math.random() * 3 + 1) + 's',
                           animationDelay: (Math.random() * 2) + 's'
                        }}
                     />
                  ))}
               </div>

               {/* Sleeping Mascot (Moon) */}
               <motion.div 
                  className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               >
                  {/* Crescent Moon */}
                  <div className="absolute inset-0 rounded-full bg-transparent shadow-[inset_-20px_0_0_0_#fde047] md:shadow-[inset_-30px_0_0_0_#fde047]" />
                  {/* Zzzs */}
                  <motion.div 
                     className="absolute -top-4 right-0 text-white font-bold text-2xl font-mono"
                     animate={{ opacity: [0, 1, 0], y: [0, -20, -40], x: [0, 10, 20], scale: [0.5, 1, 1.5] }}
                     transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 0 }}
                  >
                     Z
                  </motion.div>
                  <motion.div 
                     className="absolute top-2 -right-6 text-white font-bold text-xl font-mono"
                     animate={{ opacity: [0, 1, 0], y: [0, -20, -40], x: [0, 10, 20], scale: [0.5, 1, 1.5] }}
                     transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1 }}
                  >
                     z
                  </motion.div>
                  <motion.div 
                     className="absolute top-8 -right-10 text-white font-bold text-lg font-mono"
                     animate={{ opacity: [0, 1, 0], y: [0, -20, -40], x: [0, 10, 20], scale: [0.5, 1, 1.5] }}
                     transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 2 }}
                  >
                     z
                  </motion.div>
               </motion.div>

               <h2 className="text-2xl md:text-4xl text-slate-300 font-serif font-medium tracking-wide text-center px-6">
                  It's late. Go to sleep. <br/>
                  <span className="text-lg md:text-xl text-slate-500 mt-4 block">This will still be here tomorrow.</span>
               </h2>
            </motion.div>
         ) : (
            <motion.div 
               key="awake"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
               className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative z-10"
               style={{ color: textColor }}
            >
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-6">
                  {config.title}
               </h1>
               <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-2xl opacity-80 font-serif">
                  {config.body}
               </p>
               
               <div className="mt-12 w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                     className="h-full rounded-full"
                     style={{ backgroundColor: primaryColor }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 5, ease: "linear" }}
                  />
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-800">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time of Day
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400">00:00</span>
               <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  step="0.1" 
                  value={simulatedTime} 
                  onChange={(e) => setSimulatedTime(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-500"
               />
               <span className="text-xs text-slate-400">24:00</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border border-slate-300 rounded-full tracking-widest uppercase text-slate-600 bg-slate-100">
               {formatTime(simulatedTime)} - {isSleeping ? "Asleep" : "Awake"}
            </div>
         </div>
      )}
      
    </div>
  );
}
