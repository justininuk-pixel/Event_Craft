"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ScreenTimeTax({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const TOTAL_BATTERY = 60; // 60 seconds
  const [batteryTime, setBatteryTime] = useState(TOTAL_BATTERY);
  const [isLocked, setIsLocked] = useState(false);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#1e293b";

  // Simulate long article
  const paragraphs = Array.from({ length: 15 }).fill(config.body || "Loading content...") as string[];

  useEffect(() => {
     if (isLocked && onComplete) {
        onComplete();
     }
  }, [isLocked, onComplete]);

  const updateBattery = () => {
     if (isLocked) return;

     const now = Date.now();
     const delta = now - lastTimeRef.current;
     lastTimeRef.current = now;

     setBatteryTime((prev) => {
        const next = prev - (delta / 1000);
        if (next <= 0) {
           setIsLocked(true);
           return 0;
        }
        return next;
     });

     requestRef.current = requestAnimationFrame(updateBattery);
  };

  useEffect(() => {
     lastTimeRef.current = Date.now();
     requestRef.current = requestAnimationFrame(updateBattery);
     return () => cancelAnimationFrame(requestRef.current);
  }, [isLocked]); // Added isLocked to dependency array so it doesn't run if locked initially via slider

  const batteryPercentage = (batteryTime / TOTAL_BATTERY) * 100;
  const isCritical = batteryPercentage < 20;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      <AnimatePresence>
         {!isLocked ? (
            <motion.div 
               key="content"
               className="w-full h-full overflow-y-auto pt-24 pb-32 px-6 md:px-12 relative scroll-smooth"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <div className="max-w-2xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
                     {config.title}
                  </h1>
                  
                  {paragraphs.map((p, i) => (
                     <p key={i} className="text-lg md:text-xl font-medium leading-relaxed mb-8 opacity-80">
                        {p}
                     </p>
                  ))}
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="lockout"
               className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center p-8 text-center"
               initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
               animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            >
               <div className="w-24 h-12 border-4 border-slate-700 rounded-lg relative mb-6">
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-2 h-4 bg-slate-700 rounded-r" />
                  <div className="w-full h-full p-1">
                     <div className="w-0 h-full bg-slate-700" />
                  </div>
                  {/* Red X over battery */}
                  <div className="absolute inset-0 flex items-center justify-center text-red-600 text-4xl font-black rotate-12">
                     X
                  </div>
               </div>
               <h2 className="text-white text-3xl font-black uppercase tracking-widest mb-4">
                  Screen Time Exceeded
               </h2>
               <p className="text-slate-400 font-mono">
                  Your daily reading allowance has been depleted. Please return tomorrow.
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Persistent HUD (Battery Meter) */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start pointer-events-none z-30">
         <div className="font-bold text-sm tracking-widest uppercase opacity-50 bg-white/10 backdrop-blur px-3 py-1 rounded-full">
            The Daily Reader
         </div>
         <div className="flex items-center gap-3 bg-black/80 text-white backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/10">
            <span className={`font-mono font-bold text-sm ${isCritical ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
               {Math.ceil(batteryTime)}s
            </span>
            <div className={`w-12 h-5 border-2 rounded relative ${isCritical ? 'border-red-500' : 'border-slate-400'}`}>
               <div className={`absolute right-[-4px] top-1/2 -translate-y-1/2 w-1 h-2 rounded-r ${isCritical ? 'bg-red-500' : 'bg-slate-400'}`} />
               <div className="w-full h-full p-0.5">
                  <motion.div 
                     className="h-full origin-left"
                     style={{ backgroundColor: isCritical ? '#ef4444' : '#10b981' }}
                     animate={{ width: `${batteryPercentage}%` }}
                     transition={{ duration: 0.1, ease: "linear" }}
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/80 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl pointer-events-auto">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Battery Remaining
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xs text-slate-400">0s</span>
               <input 
                  type="range" 
                  min="0" 
                  max={TOTAL_BATTERY} 
                  step="0.1" 
                  value={batteryTime} 
                  onChange={(e) => {
                     setBatteryTime(parseFloat(e.target.value));
                     setIsLocked(parseFloat(e.target.value) <= 0);
                  }}
                  className="flex-1 accent-emerald-500"
               />
               <span className="text-xs text-slate-400">60s</span>
            </div>
         </div>
      )}
      
    </div>
  );
}
