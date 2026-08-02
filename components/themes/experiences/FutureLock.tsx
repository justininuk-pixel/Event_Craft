"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function FutureLock({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // Initialize target date to 10 days from now
  const [targetDate, setTargetDate] = useState<number>(() => Date.now() + 10 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState<number>(targetDate - Date.now());
  const [phase, setPhase] = useState<"locked" | "unlocked">("locked");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  const requestRef = useRef<number>(0);

  const updateTimer = (time?: number) => {
     const now = Date.now();
     const difference = targetDate - now;

     if (difference <= 0) {
        setTimeLeft(0);
        if (phase === "locked") {
           setPhase("unlocked");
           setTimeout(() => {
              if (onComplete) onComplete();
           }, 2000);
        }
     } else {
        setTimeLeft(difference);
        requestRef.current = requestAnimationFrame(updateTimer);
     }
  };

  useEffect(() => {
     if (phase === "locked") {
        requestRef.current = requestAnimationFrame(updateTimer);
     }
     return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     };
  }, [targetDate, phase]);

  const handleSimulateSkip = () => {
     setTargetDate(Date.now() + 3000); // 3 seconds from now
  };

  // Format time components
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const ms = Math.floor((timeLeft % 1000) / 10); // 2 digits

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-mono select-none items-center justify-center p-4 md:p-8"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
         {phase === "locked" && (
            <motion.div
               key="locked"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
               transition={{ duration: 1 }}
               className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center gap-12"
            >
               <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800 shadow-2xl relative overflow-hidden">
                  <motion.div 
                     className="absolute w-1 h-10 bg-red-500 origin-bottom"
                     style={{ bottom: "50%" }}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="w-3 h-3 bg-white rounded-full z-10" />
               </div>

               <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">
                     Time Capsule
                  </h1>
                  
                  <div className="flex items-end justify-center gap-2 md:gap-6 text-white font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                     <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-8xl">{formatNumber(days)}</span>
                        <span className="text-xs md:text-sm text-slate-500 mt-2 tracking-widest">DAYS</span>
                     </div>
                     <span className="text-4xl md:text-6xl text-slate-700 pb-6">:</span>
                     <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-8xl">{formatNumber(hours)}</span>
                        <span className="text-xs md:text-sm text-slate-500 mt-2 tracking-widest">HOURS</span>
                     </div>
                     <span className="text-4xl md:text-6xl text-slate-700 pb-6">:</span>
                     <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-8xl">{formatNumber(minutes)}</span>
                        <span className="text-xs md:text-sm text-slate-500 mt-2 tracking-widest">MINS</span>
                     </div>
                     <span className="text-4xl md:text-6xl text-slate-700 pb-6">:</span>
                     <div className="flex flex-col items-center">
                        <span className="text-5xl md:text-8xl" style={{ color: timeLeft < 10000 ? primaryColor : "white" }}>
                           {formatNumber(seconds)}
                        </span>
                        <span className="text-xs md:text-sm text-slate-500 mt-2 tracking-widest">SECS</span>
                     </div>
                     <span className="text-4xl md:text-6xl text-slate-700 pb-6 hidden md:block">.</span>
                     <div className="flex flex-col items-center hidden md:flex">
                        <span className="text-4xl md:text-6xl text-slate-400">{formatNumber(ms)}</span>
                        <span className="text-xs text-slate-600 mt-2 tracking-widest">MS</span>
                     </div>
                  </div>
               </div>

               <p className="text-slate-500 uppercase tracking-widest text-sm text-center max-w-md">
                  This content is mathematically locked until the target timestamp is reached.
               </p>
            </motion.div>
         )}

         {phase === "unlocked" && (
            <motion.div
               key="unlocked"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-12 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="w-20 h-20 mb-8 rounded-full border-4 flex items-center justify-center text-4xl bg-slate-800"
                  style={{ borderColor: primaryColor }}
               >
                  🔓
               </motion.div>
               <h1 className="text-3xl md:text-4xl font-bold uppercase text-white mb-4 tracking-widest">
                 Vault Opened
               </h1>
               <p className="text-slate-400 font-bold mb-10 tracking-widest text-sm">
                  The wait is over.
               </p>
               
               <div className="w-full bg-slate-950/50 rounded-xl p-8 border border-slate-800 shadow-inner">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                    {config.title}
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && phase === "locked" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <button 
               onClick={handleSimulateSkip}
               className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/50 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors shadow-lg"
            >
               Simulate Time Skip (3s)
            </button>
            <p className="text-white/40 text-[10px] mt-2 uppercase tracking-widest text-center">
               Forces countdown to 00:00:03
            </p>
         </div>
      )}
      
    </div>
  );
}
