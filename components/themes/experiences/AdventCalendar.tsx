"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_DOORS = 12;
const CURRENT_DAY = 6; // Simulated current day

export function AdventCalendar({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [openedDoors, setOpenedDoors] = useState<number[]>([]);
  const [shakingDoor, setShakingDoor] = useState<number | null>(null);
  const [phase, setPhase] = useState<"building" | "complete">("building");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#064e3b"];

  const handleDoorClick = (day: number) => {
     if (day > CURRENT_DAY) {
        // Locked
        setShakingDoor(day);
        setTimeout(() => setShakingDoor(null), 500);
        return;
     }

     if (!openedDoors.includes(day)) {
        const nextOpened = [...openedDoors, day];
        setOpenedDoors(nextOpened);
        
        // If all allowed doors are opened
        if (nextOpened.length === CURRENT_DAY) {
           setPhase("complete");
           setTimeout(() => {
              if (onComplete) onComplete();
           }, 2000);
        }
     }
  };

  const doors = Array.from({ length: TOTAL_DOORS }, (_, i) => i + 1);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center p-4 md:p-8"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      
      {/* Decorative Snow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         {[...Array(50)].map((_, i) => (
            <motion.div
               key={i}
               initial={{ y: -20, x: Math.random() * 100 + "%" }}
               animate={{ y: "100vh", x: `calc(${Math.random() * 100}% + ${Math.random() * 100 - 50}px)` }}
               transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 10
               }}
               className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
            />
         ))}
      </div>

      <AnimatePresence mode="wait">
         {phase === "building" && (
            <motion.div
               key="building"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8"
            >
               <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg text-center">
                  Countdown to {config.title || "The Event"}
               </h1>
               
               <p className="text-white/80 font-bold uppercase tracking-widest text-sm text-center">
                  Simulation: Today is Day {CURRENT_DAY}
               </p>

               <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
                  {doors.map((day) => {
                     const isOpened = openedDoors.includes(day);
                     const isLocked = day > CURRENT_DAY;
                     const isShaking = shakingDoor === day;
                     
                     return (
                        <div 
                           key={day}
                           className="relative aspect-square md:aspect-[3/4] perspective-1000"
                        >
                           {/* The interior content of the box */}
                           <div className="absolute inset-0 bg-zinc-900 rounded-lg shadow-inner flex flex-col items-center justify-center p-2 border border-white/10">
                              <span className="text-2xl opacity-50">
                                 {day % 3 === 0 ? "🎁" : day % 2 === 0 ? "❄️" : "🍬"}
                              </span>
                              <span className="text-white/50 font-bold text-xs mt-2 uppercase text-center hidden md:block">
                                 {isOpened ? "Revealed!" : ""}
                              </span>
                           </div>

                           {/* The Door Front */}
                           <motion.div
                              onClick={() => handleDoorClick(day)}
                              className={`absolute inset-0 rounded-lg shadow-xl flex flex-col items-center justify-center cursor-pointer border-2 transition-colors origin-left
                                 ${isOpened ? 'pointer-events-none' : 'hover:border-white/50'}
                              `}
                              style={{ 
                                 backgroundColor: primaryColor,
                                 borderColor: "rgba(255,255,255,0.2)",
                                 // Simple CSS 3D transform for opening
                                 transform: isOpened ? 'rotateY(-110deg)' : 'rotateY(0deg)',
                                 transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                              }}
                              animate={isShaking ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                           >
                              <span className="text-4xl md:text-5xl font-black text-white/90 drop-shadow-md font-serif">
                                 {day}
                              </span>
                              
                              {isLocked && !isOpened && (
                                 <div className="absolute bottom-2 right-2 opacity-50">
                                    🔒
                                 </div>
                              )}
                           </motion.div>
                        </div>
                     );
                  })}
               </div>
            </motion.div>
         )}

         {phase === "complete" && (
            <motion.div
               key="complete"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-6"
               >
                  🌟
               </motion.div>
               <h1 className="text-3xl font-black uppercase text-slate-800 mb-2">
                 The Time Has Come
               </h1>
               <p className="text-slate-500 font-bold mb-8">
                  You've unlocked the final message.
               </p>
               
               <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h2 className="text-xl font-bold mb-2 text-slate-800" style={{ color: primaryColor }}>
                    {config.title}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
