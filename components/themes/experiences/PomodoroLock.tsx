"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "focusing" | "failed" | "unlocked";

export function PomodoroLock({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [status, setStatus] = useState<Status>("idle");
  const TARGET_TIME = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(TARGET_TIME);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red for Pomodoro
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // Zinc 900
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#fafafa";

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Handle Visibility Tracking
  useEffect(() => {
     if (mode === "editor-preview") return;

     const handleVisibilityChange = () => {
        if (document.hidden && statusRef.current === "focusing") {
           setStatus("failed");
        }
     };

     document.addEventListener("visibilitychange", handleVisibilityChange);
     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mode]);

  // Handle Timer
  useEffect(() => {
     let interval: NodeJS.Timeout;

     if (status === "focusing") {
        interval = setInterval(() => {
           setTimeLeft((prev) => {
              if (prev <= 1) {
                 setStatus("unlocked");
    onComplete?.();
                 clearInterval(interval);
                 return 0;
              }
              return prev - 1;
           });
        }, 1000);
     }

     return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
     if (status === "unlocked" && onComplete) {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
     }
  }, [status, onComplete]);

  const handleStart = () => {
     setStatus("focusing");
     setTimeLeft(TARGET_TIME);
  };

  const handleTryAgain = () => {
     setStatus("idle");
     setTimeLeft(TARGET_TIME);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-[2000ms] flex flex-col items-center justify-center"
      style={{ 
         backgroundColor: status === "failed" ? "#7f1d1d" : status === "unlocked" ? "#ffffff" : bgColors[0],
         color: status === "failed" ? "#fca5a5" : status === "unlocked" ? "#1e293b" : textColor
      }} 
    >
      <AnimatePresence mode="wait">
         {status === "idle" && (
            <motion.div 
               key="idle"
               className="flex flex-col items-center justify-center text-center p-8 z-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
            >
               {/* Pomodoro Icon */}
               <div className="w-24 h-24 mb-8 text-rose-500 opacity-80 border-4 border-current rounded-[40%] flex items-center justify-center relative bg-rose-500/10">
                  <div className="w-4 h-6 border-2 border-current rounded-full absolute -top-4" />
               </div>

               <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest text-slate-200">
                  Focus Required
               </h2>
               <p className="text-slate-400 font-serif max-w-md mb-12">
                  To unlock this content, you must complete a 25-minute focus session. If you leave this tab or minimize the browser, you will fail.
               </p>

               <button 
                  onClick={handleStart}
                  className="px-10 py-5 rounded-full text-white font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  style={{ backgroundColor: primaryColor }}
               >
                  Begin 25:00 Session
               </button>
            </motion.div>
         )}

         {status === "focusing" && (
            <motion.div 
               key="focusing"
               className="flex flex-col items-center justify-center w-full h-full relative z-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               {/* Progress Ring */}
               <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="none" 
                        stroke="#334155" 
                        strokeWidth="4" 
                     />
                     <circle 
                        cx="50%" cy="50%" r="48%" 
                        fill="none" 
                        stroke={primaryColor} 
                        strokeWidth="4" 
                        strokeDasharray="301.59" // 2 * PI * 48 (approx depending on SVG bounds, better done with specific viewbox)
                        strokeDashoffset="0"
                        style={{
                           strokeDasharray: "1000",
                           strokeDashoffset: 1000 - (1000 * (1 - (timeLeft / TARGET_TIME)))
                        }}
                        className="transition-all duration-1000 ease-linear"
                     />
                  </svg>
                  <div className="font-mono text-5xl md:text-6xl font-light text-slate-300 tabular-nums">
                     {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                  </div>
               </div>
               
               <div className="mt-12 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
                  Do not leave this tab
               </div>
            </motion.div>
         )}

         {status === "failed" && (
            <motion.div 
               key="failed"
               className="flex flex-col items-center justify-center text-center p-8 z-10 w-full h-full bg-red-950/50"
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
            >
               <div className="text-red-500 mb-6 border-4 border-red-500 rounded-full w-24 h-24 flex items-center justify-center font-bold text-4xl">
                  !
               </div>
               <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-red-100">
                  Focus Broken
               </h2>
               <p className="text-red-300/80 font-serif max-w-md mb-12 text-xl">
                  You left the tab. The session has been terminated.
               </p>

               <button 
                  onClick={handleTryAgain}
                  className="px-8 py-4 border-2 border-red-400 text-red-200 font-bold uppercase tracking-[0.2em] transition-all hover:bg-red-400 hover:text-red-900 rounded-full"
               >
                  Try Again
               </button>
            </motion.div>
         )}

         {status === "unlocked" && (
            <motion.div 
               key="unlocked"
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5 }}
            >
               <div className="text-xs font-bold uppercase tracking-[0.4em] mb-8 text-emerald-600">
                  Focus Achieved
               </div>
               
               <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-8 text-slate-900">
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed max-w-2xl text-slate-700">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && status !== "unlocked" && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Wait
            </h2>
            <button 
               onClick={() => {
                  setStatus("unlocked");
    onComplete?.();
                  setTimeLeft(0);
               }}
               className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-emerald-400/50 mb-2"
            >
               Bypass Focus Session
            </button>
            {status === "focusing" && (
               <button 
                  onClick={() => setStatus("failed")}
                  className="w-full bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-red-400/50"
               >
                  Simulate Tab Leave
               </button>
            )}
         </div>
      )}
      
    </div>
  );
}
