"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

function getSkyColor(hour: number) {
   if (hour >= 6 && hour < 9) return "linear-gradient(to bottom, #87CEEB, #FFD700)"; // Morning
   if (hour >= 9 && hour < 16) return "linear-gradient(to bottom, #4CA1AF, #C4E0E5)"; // Day
   if (hour >= 16 && hour < 19) return "linear-gradient(to bottom, #ff7e5f, #feb47b)"; // Sunset
   return "linear-gradient(to bottom, #0f2027, #203a43)"; // Night
}

function getSunPos(hour: number) {
   // Map hour to an arc from left to right
   // 6 AM is left, 12 PM is top, 18 PM is right
   if (hour < 6 || hour > 18) return { y: 200, opacity: 0 }; // Hidden
   const percent = (hour - 6) / 12; // 0 to 1
   const angle = percent * Math.PI; // 0 to 180 degrees
   const r = 40; // arc radius in viewport units roughly
   return {
      x: `calc(50vw - ${Math.cos(angle) * r}vw)`,
      y: `calc(50vh - ${Math.sin(angle) * r}vh)`,
      opacity: 1
   };
}

export function SunriseSunsetSync({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [hour, setHour] = useState<number>(12);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
     // If not in editor preview, use real time
     if (mode !== "editor-preview") {
        setHour(new Date().getHours() + new Date().getMinutes() / 60);
     }
  }, [mode]);

  useEffect(() => {
     // Unlock condition: Night time (after 7 PM or before 6 AM)
     if (hour >= 19 || hour < 6) {
        if (!isUnlocked) {
           setIsUnlocked(true);
           setTimeout(() => {
              if (onComplete) onComplete();
           }, 3000);
        }
     }
  }, [hour, isUnlocked, onComplete]);

  const isNight = hour >= 19 || hour < 6;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-all duration-1000 ease-in-out"
      style={{ background: getSkyColor(hour) }}
    >
      
      {/* Sun */}
      <motion.div
         className="absolute w-24 h-24 bg-yellow-300 rounded-full blur-[2px] shadow-[0_0_50px_yellow]"
         animate={{ ...getSunPos(hour) }}
         transition={{ type: "tween", duration: 0.5 }}
      />

      {/* Stars (Only visible at night) */}
      <AnimatePresence>
         {isNight && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 pointer-events-none"
            >
               {[...Array(100)].map((_, i) => (
                  <motion.div
                     key={i}
                     className="absolute w-1 h-1 bg-white rounded-full"
                     style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.8 + 0.2
                     }}
                     animate={{ opacity: [0.2, 1, 0.2] }}
                     transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                  />
               ))}
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Hidden Message */}
      <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center text-center">
         <motion.div
            animate={{ opacity: isNight ? 1 : 0.05 }}
            transition={{ duration: 2 }}
            className="flex flex-col items-center"
         >
            {/* We draw the text using a "starry" font or just glowing white text that blends into the bright day sky */}
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-6">
               {config.title || "The Stars Align"}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
               {config.body}
            </p>
         </motion.div>
         
         {!isNight && (
            <p className="mt-12 text-black/40 font-bold uppercase tracking-widest text-sm backdrop-blur-sm bg-white/20 px-4 py-2 rounded-full">
               Return when the sun sets to reveal the message.
            </p>
         )}
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">
               Simulation: Time of Day
            </h2>
            <div className="flex w-full items-center gap-4 text-white">
               <span>☀️</span>
               <input 
                  type="range" 
                  min="0" 
                  max="23.99" 
                  step="0.1" 
                  value={hour} 
                  onChange={(e) => setHour(parseFloat(e.target.value))}
                  className="flex-1 accent-white"
               />
               <span>🌙</span>
            </div>
            <div className="mt-2 text-white/80 font-mono text-sm">
               {Math.floor(hour).toString().padStart(2, '0')}:{Math.floor((hour % 1) * 60).toString().padStart(2, '0')}
            </div>
         </div>
      )}
      
    </div>
  );
}
