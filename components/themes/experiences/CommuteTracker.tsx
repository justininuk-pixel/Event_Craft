"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function CommuteTracker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const date = new Date();
  const currentHourDecimal = date.getHours() + date.getMinutes() / 60;
  
  const [simulatedTime, setSimulatedTime] = useState<number>(mode === "editor-preview" ? 12 : currentHourDecimal);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // Neon light color
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1f2937"]; // Dark street color

  // Store is OPEN between 08:00 - 09:00 AND 17:00 - 18:00
  const isMorningCommute = simulatedTime >= 8 && simulatedTime < 9;
  const isEveningCommute = simulatedTime >= 17 && simulatedTime < 18;
  const isOpen = isMorningCommute || isEveningCommute;

  useEffect(() => {
     if (isOpen && onComplete) {
        // Automatically mark complete after a few seconds of being open
        const timer = setTimeout(() => {
           onComplete();
        }, 5000);
        return () => clearTimeout(timer);
     }
  }, [isOpen, onComplete]);

  // Determine time of day purely for background styling
  const isNight = simulatedTime < 6 || simulatedTime > 19;
  
  const formatTime = (decimalHours: number) => {
     const hrs = Math.floor(decimalHours);
     const mins = Math.floor((decimalHours % 1) * 60);
     const ampm = hrs >= 12 ? 'PM' : 'AM';
     const displayHrs = hrs % 12 || 12;
     return `${displayHrs}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000"
      style={{ 
         backgroundColor: isNight ? "#0f172a" : bgColors[0],
         backgroundImage: `radial-gradient(circle at 50% 0%, ${isOpen ? primaryColor + '40' : 'transparent'} 0%, transparent 70%)`
      }} 
    >
      {/* Texture Overlay */}
      <div 
         className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
         style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
         }}
      />

      {/* The Storefront */}
      <div className="relative w-full max-w-2xl px-6 z-10 flex flex-col items-center">
         
         {/* The Sign */}
         <motion.div 
            className="mb-12 relative"
            animate={{ 
               y: isOpen ? 0 : 20,
            }}
         >
            {/* Hanging chains */}
            <div className="absolute -top-12 left-8 w-1 h-12 bg-slate-800" />
            <div className="absolute -top-12 right-8 w-1 h-12 bg-slate-800" />
            
            <div 
               className={`px-12 py-6 border-8 rounded-xl bg-slate-900 shadow-2xl transition-all duration-1000 ${isOpen ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]'}`}
            >
               <h1 
                  className={`text-5xl md:text-7xl font-black tracking-widest font-mono transition-colors duration-1000`}
                  style={{
                     color: isOpen ? "#10b981" : "#dc2626",
                     textShadow: isOpen ? "0 0 20px #10b981" : "none"
                  }}
               >
                  {isOpen ? "OPEN" : "CLOSED"}
               </h1>
            </div>
            
            {!isOpen && (
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[120%] bg-white text-black font-bold text-center py-2 text-sm md:text-base border-2 border-black rotate-2 shadow-lg">
                  HOURS: 8AM-9AM & 5PM-6PM
               </div>
            )}
         </motion.div>

         {/* The Content (Inside the store) */}
         <AnimatePresence mode="wait">
            {isOpen ? (
               <motion.div 
                  key="content"
                  initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center w-full shadow-2xl"
               >
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-6">
                     {config.title}
                  </h2>
                  <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            ) : (
               <motion.div 
                  key="shutter"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full h-32 md:h-64 bg-slate-800 rounded-lg flex flex-col justify-evenly p-4 border border-slate-700 shadow-inner"
               >
                  {/* Corrugated shutter lines */}
                  {Array.from({ length: 10 }).map((_, i) => (
                     <div key={i} className="w-full h-2 bg-slate-900 rounded-full opacity-50" />
                  ))}
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Current Time Display */}
      <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-md text-white font-mono px-4 py-2 rounded-lg border border-white/10 font-bold tracking-widest z-20">
         {formatTime(simulatedTime)}
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time of Day
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs text-slate-400">00:00</span>
               <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  step="0.05" 
                  value={simulatedTime} 
                  onChange={(e) => setSimulatedTime(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500"
               />
               <span className="text-xs text-slate-400">23:59</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border border-slate-300 rounded-full tracking-widest uppercase text-slate-600 bg-slate-100">
               {formatTime(simulatedTime)}
            </div>
         </div>
      )}
      
    </div>
  );
}
