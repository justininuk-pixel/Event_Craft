"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type DayState = "weekday" | "weekend";

export function WeekdayWarrior({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [actualDay, setActualDay] = useState<DayState>("weekday");
  const [simulatedDay, setSimulatedDay] = useState<DayState | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Violet for weekend

  useEffect(() => {
     // 0 = Sunday, 6 = Saturday
     const day = new Date().getDay();
     if (day === 0 || day === 6) {
        setActualDay("weekend");
     } else {
        setActualDay("weekday");
     }
  }, []);

  const activeDay = simulatedDay || actualDay;

  useEffect(() => {
     if (onComplete) {
        // Just a 5-second viewing period for the demo before completing
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
     }
  }, [activeDay, onComplete]);

  return (
    <div className="w-full h-full relative overflow-hidden transition-all duration-1000">
      
      <AnimatePresence mode="wait">
         {activeDay === "weekday" ? (
            <motion.div 
               key="weekday-view"
               className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-100 font-mono"
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 50 }}
               transition={{ duration: 0.5 }}
            >
               {/* Brutalist Weekday UI */}
               <div className="w-full max-w-3xl border-4 border-zinc-800 p-8 md:p-12 relative shadow-[10px_10px_0px_0px_rgba(39,39,42,1)]">
                  <div className="absolute -top-4 left-8 bg-zinc-950 px-4 text-xs font-bold tracking-[0.3em] uppercase text-zinc-500">
                     Professional Mode Active
                  </div>
                  
                  <div className="flex justify-between items-start mb-12 border-b-2 border-zinc-800 pb-8">
                     <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        Work.
                     </h1>
                     <div className="text-right">
                        <div className="text-[10px] tracking-widest text-zinc-500 uppercase mb-1">Status</div>
                        <div className="text-sm font-bold bg-zinc-800 px-3 py-1 inline-block">FOCUSED</div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="text-xs tracking-widest text-zinc-500 uppercase">Message Payload</div>
                     <p className="text-xl md:text-2xl leading-relaxed text-zinc-300">
                        {config.title} {/* Using Title for Weekday message */}
                     </p>
                  </div>

                  <div className="mt-16 pt-8 border-t-2 border-zinc-800 flex items-center justify-between opacity-50">
                     <div className="text-[10px] tracking-widest uppercase">System: Operational</div>
                     <div className="w-3 h-3 bg-zinc-400 rounded-sm animate-pulse" />
                  </div>
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="weekend-view"
               className="absolute inset-0 flex flex-col items-center justify-center p-8 font-sans"
               style={{ 
                  background: `radial-gradient(circle at center, ${primaryColor}40 0%, #0f172a 100%)`,
                  backgroundColor: "#0f172a"
               }}
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 50 }}
               transition={{ duration: 0.5 }}
            >
               {/* Relaxed Weekend UI */}
               <div className="w-full max-w-2xl text-center relative z-10">
                  <motion.div 
                     className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-12 shadow-lg"
                     animate={{ y: [0, -10, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                     Weekend Mode Active 🍹
                  </motion.div>

                  <h1 
                     className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50"
                  >
                     Relax.
                  </h1>

                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-left">
                     {/* Decorative blob */}
                     <div 
                        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
                        style={{ backgroundColor: primaryColor }}
                     />

                     <div className="relative z-10">
                        <div className="text-[10px] tracking-widest text-white/40 uppercase mb-4 font-bold">Personal Note</div>
                        <p className="text-xl md:text-2xl leading-relaxed text-white/90 font-serif">
                           {config.body} {/* Using Body for Weekend message */}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Ambient particles for weekend */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  {Array.from({ length: 15 }).map((_, i) => (
                     <motion.div 
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-white/20"
                        style={{ 
                           left: `${Math.random() * 100}%`, 
                           top: `${Math.random() * 100}%` 
                        }}
                        animate={{
                           y: [0, Math.random() * -100 - 50],
                           opacity: [0, 1, 0]
                        }}
                        transition={{
                           duration: Math.random() * 5 + 5,
                           repeat: Infinity,
                           ease: "linear",
                           delay: Math.random() * 5
                        }}
                     />
                  ))}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Dual State Rendering
            </h2>
            <div className="flex w-full gap-2">
               <button 
                  onClick={() => setSimulatedDay("weekday")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border ${
                     activeDay === "weekday" ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/20 hover:bg-white/10"
                  }`}
               >
                  Force Weekday
               </button>
               <button 
                  onClick={() => setSimulatedDay("weekend")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border ${
                     activeDay === "weekend" ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/20 hover:bg-white/10"
                  }`}
               >
                  Force Weekend
               </button>
            </div>
            {simulatedDay !== null && (
               <button 
                  onClick={() => setSimulatedDay(null)}
                  className="mt-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
               >
                  Reset to Actual ({actualDay})
               </button>
            )}
         </div>
      )}
      
    </div>
  );
}
