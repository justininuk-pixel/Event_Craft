"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Metrics {
   days: number;
   hours: number;
   minutes: number;
   seconds: number;
}

export function LifespanCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#09090b"]; // Zinc 950
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#f4f4f5";

  // Simulation for editor mode
  useEffect(() => {
     if (mode === "editor-preview") {
        const thirtyYearsAgo = new Date();
        thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
        setBirthDate(thirtyYearsAgo);
     }
  }, [mode]);

  useEffect(() => {
     if (!birthDate) return;

     const calculateMetrics = () => {
        const now = Date.now();
        const start = birthDate.getTime();
        const diffMs = now - start;

        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        setMetrics({
           days: totalDays,
           hours: totalHours,
           minutes: totalMinutes,
           seconds: totalSeconds
        });
     };

     calculateMetrics();
     const interval = setInterval(calculateMetrics, 1000);

     return () => clearInterval(interval);
  }, [birthDate]);

  useEffect(() => {
     if (metrics && onComplete && !hasCompleted) {
        setHasCompleted(true);
        const timer = setTimeout(onComplete, 8000);
        return () => clearTimeout(timer);
     }
  }, [metrics, onComplete, hasCompleted]);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (inputValue) {
        // Create date at midnight local time to avoid timezone offset issues
        const [year, month, day] = inputValue.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
           setBirthDate(date);
        }
     }
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      <AnimatePresence mode="wait">
         {!birthDate ? (
            <motion.div 
               key="input-phase"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-md text-center"
            >
               <h1 className="text-3xl md:text-4xl font-serif mb-8 text-white/90">
                  When did your time begin?
               </h1>
               <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <input 
                     type="date"
                     required
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     className="bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-xl text-white outline-none focus:border-white/50 transition-colors text-center"
                     style={{ colorScheme: "dark" }}
                  />
                  <button 
                     type="submit"
                     className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:opacity-80"
                     style={{ backgroundColor: primaryColor, color: "#fff" }}
                  >
                     Calculate Lifespan
                  </button>
               </form>
            </motion.div>
         ) : metrics ? (
            <motion.div 
               key="visualization-phase"
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="w-full flex flex-col items-center justify-between h-full py-12"
            >
               <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-right">
                     
                     <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
                        <motion.div 
                           className="font-mono text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
                           key={`days-${metrics.days}`}
                           initial={{ y: -10, opacity: 0.5 }}
                           animate={{ y: 0, opacity: 1 }}
                        >
                           {metrics.days.toLocaleString()}
                        </motion.div>
                        <div className="text-xs uppercase tracking-[0.4em] font-bold opacity-40 mt-2" style={{ color: primaryColor }}>
                           Days Lived
                        </div>
                     </div>

                     <div className="flex flex-col">
                        <motion.div 
                           className="font-mono text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
                           key={`hours-${metrics.hours}`}
                           initial={{ y: -10, opacity: 0.5 }}
                           animate={{ y: 0, opacity: 1 }}
                        >
                           {metrics.hours.toLocaleString()}
                        </motion.div>
                        <div className="text-xs uppercase tracking-[0.4em] font-bold opacity-40 mt-2" style={{ color: primaryColor }}>
                           Hours Lived
                        </div>
                     </div>

                     <div className="flex flex-col border-t border-white/10 pt-8 md:border-r md:pr-8">
                        <motion.div 
                           className="font-mono text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
                           key={`minutes-${metrics.minutes}`}
                           initial={{ y: -10, opacity: 0.5 }}
                           animate={{ y: 0, opacity: 1 }}
                        >
                           {metrics.minutes.toLocaleString()}
                        </motion.div>
                        <div className="text-xs uppercase tracking-[0.4em] font-bold opacity-40 mt-2" style={{ color: primaryColor }}>
                           Minutes Lived
                        </div>
                     </div>

                     <div className="flex flex-col border-t border-white/10 pt-8">
                        <motion.div 
                           className="font-mono text-6xl md:text-8xl font-black tabular-nums tracking-tighter"
                           style={{ color: primaryColor }}
                           key={`seconds-${metrics.seconds}`}
                           initial={{ scale: 1.1 }}
                           animate={{ scale: 1 }}
                           transition={{ duration: 0.5 }}
                        >
                           {metrics.seconds.toLocaleString()}
                        </motion.div>
                        <div className="text-xs uppercase tracking-[0.4em] font-bold opacity-40 mt-2 text-white">
                           Seconds Lived
                        </div>
                     </div>

                  </div>
               </div>

               <motion.div 
                  className="text-center max-w-2xl mt-12 bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1 }}
               >
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4">
                     {config.title}
                  </h2>
                  <p className="text-lg md:text-xl font-serif leading-relaxed opacity-90">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         ) : null}
      </AnimatePresence>

      {/* Editor Context Badge */}
      {mode === "editor-preview" && birthDate && (
         <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/50">
            Simulated Input: 30 Years Ago
         </div>
      )}
      
    </div>
  );
}
