"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, BedDouble, Stars } from "lucide-react";

export function RemSleepCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#818cf8"; // indigo-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  // We need to parse a time input. HTML time input returns "HH:MM" (24-hour)
  const [wakeTimeStr, setWakeTimeStr] = useState<string>("07:00");
  const [cycleLength, setCycleLength] = useState<number>(90);
  const [fallAsleepTime, setFallAsleepTime] = useState<number>(15);

  const calculateSleepTimes = () => {
     const [hoursStr, minutesStr] = wakeTimeStr.split(':');
     if (!hoursStr || !minutesStr) return [];
     
     const wakeDate = new Date();
     wakeDate.setHours(parseInt(hoursStr, 10));
     wakeDate.setMinutes(parseInt(minutesStr, 10));
     wakeDate.setSeconds(0);
     wakeDate.setMilliseconds(0);

     const optimalTimes = [];
     
     // Calculate backwards. We want to show 4, 5, and 6 cycles.
     // Total time = (cycles * cycleLength) + fallAsleepTime
     for (let cycles = 6; cycles >= 3; cycles--) {
        const totalMinutesToSubtract = (cycles * cycleLength) + fallAsleepTime;
        const sleepDate = new Date(wakeDate.getTime() - totalMinutesToSubtract * 60000);
        
        optimalTimes.push({
           cycles,
           hoursOfSleep: (cycles * cycleLength) / 60,
           time: sleepDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        });
     }
     
     return optimalTimes;
  };

  const optimalTimes = useMemo(() => calculateSleepTimes(), [wakeTimeStr, cycleLength, fallAsleepTime]);

  const handleWakeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setWakeTimeStr(e.target.value);
     if (onComplete) onComplete(); // Trigger onComplete when they interact with the tool
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-slate-100"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 pointer-events-none overflow-hidden"
      >
         {/* Stars */}
         {Array.from({ length: 30 }).map((_, i) => (
            <div 
               key={i}
               className="absolute rounded-full bg-white"
               style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `twinkle ${Math.random() * 4 + 2}s infinite alternate`
               }}
            />
         ))}
         
         <div 
            className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
         />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); }
          100% { opacity: 0.8; transform: scale(1.2); }
        }
      `}} />

      <div className="w-full max-w-lg mx-auto flex flex-col h-full z-10 p-6 sm:p-10 relative">
         
         {/* Header */}
         <div className="text-center mb-10">
            <motion.div 
               animate={{ rotate: [0, -10, 10, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 mb-4 border border-white/10 shadow-lg"
            >
               <Moon size={40} style={{ color: primaryColor }} fill={primaryColor} fillOpacity={0.2} />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-white">
               {config.title || "Sleep Calculator"}
            </h2>
            <p className="text-indigo-200/60 font-medium">
               {config.body || "Wake up refreshed by completing full REM cycles."}
            </p>
         </div>

         {/* Inputs */}
         <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 mb-8 space-y-6">
            
            <div className="flex flex-col items-center gap-4">
               <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} />
                  I need to wake up at:
               </label>
               <div className="relative">
                  <input
                     type="time"
                     value={wakeTimeStr}
                     onChange={handleWakeTimeChange}
                     className="bg-black/40 border border-indigo-500/30 rounded-2xl px-6 py-4 text-4xl font-black text-white text-center focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all custom-time-input"
                     style={{ WebkitAppearance: 'none' }}
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest">
                     Fall Asleep Time
                  </label>
                  <select 
                     value={fallAsleepTime}
                     onChange={(e) => setFallAsleepTime(Number(e.target.value))}
                     className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
                  >
                     <option value={10}>10 mins</option>
                     <option value={15}>15 mins</option>
                     <option value={20}>20 mins</option>
                     <option value={30}>30 mins</option>
                  </select>
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest">
                     Cycle Length
                  </label>
                  <select 
                     value={cycleLength}
                     onChange={(e) => setCycleLength(Number(e.target.value))}
                     className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
                  >
                     <option value={80}>80 mins</option>
                     <option value={90}>90 mins</option>
                     <option value={100}>100 mins</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Results */}
         <div className="space-y-4">
            <h3 className="text-center text-xs font-bold text-indigo-400/80 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
               <Stars size={14} />
               Optimal Bedtimes
               <Stars size={14} />
            </h3>
            
            <AnimatePresence mode="popLayout">
               {optimalTimes.map((opt, i) => {
                  
                  // Highlight 5 and 6 cycles
                  const isOptimal = opt.cycles === 5 || opt.cycles === 6;
                  
                  return (
                     <motion.div
                        key={opt.cycles}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-5 rounded-2xl flex items-center justify-between border ${
                           isOptimal 
                              ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                              : 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 transition-opacity'
                        }`}
                     >
                        <div className="flex flex-col">
                           <span className={`text-2xl font-black tracking-tight ${isOptimal ? 'text-white' : 'text-slate-300'}`}>
                              {opt.time}
                           </span>
                           <span className="text-xs font-bold text-indigo-300/70 mt-1 flex items-center gap-1">
                              <BedDouble size={12} />
                              {opt.cycles} Cycles
                           </span>
                        </div>
                        
                        <div className={`text-right ${isOptimal ? 'text-indigo-300' : 'text-slate-500'}`}>
                           <span className="block font-bold text-lg">{opt.hoursOfSleep.toFixed(1)}</span>
                           <span className="block text-[10px] uppercase tracking-widest font-bold">Hours</span>
                        </div>
                        
                        {isOptimal && (
                           <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                              Recommended
                           </div>
                        )}
                     </motion.div>
                  )
               })}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
