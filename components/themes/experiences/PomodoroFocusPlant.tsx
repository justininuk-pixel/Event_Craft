"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Skull } from "lucide-react";

export function PomodoroFocusPlant({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf4ff"]; // fuchsia-50

  const DURATION = 25 * 60; // 25 minutes
  const DEMO_DURATION = 25; // 25 seconds for demo purposes
  
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use a ref to catch visibility changes immediately without stale closures
  const stateRef = useRef({ isActive, isDead });
  useEffect(() => {
     stateRef.current = { isActive, isDead };
  }, [isActive, isDead]);

  useEffect(() => {
     const handleVisibility = () => {
        if (document.hidden && stateRef.current.isActive && !stateRef.current.isDead) {
           setIsDead(true);
           setIsActive(false);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([500, 200, 500]);
        }
     };

     document.addEventListener("visibilitychange", handleVisibility);
     return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
     let interval: NodeJS.Timeout;

     if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
           setTimeLeft(prev => {
              if (prev <= 1) {
                 setIsActive(false);
                 setIsSuccess(true);
    onComplete?.();
                 if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100, 50, 300]);
                 if (onComplete) setTimeout(onComplete, 5000);
                 return 0;
              }
              return prev - 1;
           });
        }, 1000); // 1 second real time
     }

     return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const startTimer = () => {
     setIsActive(true);
     setIsDead(false);
     setIsSuccess(false);
     setTimeLeft(DEMO_DURATION);
  };

  const progress = 1 - (timeLeft / DEMO_DURATION);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-fuchsia-50 text-fuchsia-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Sun/Light Source */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 ${isDead ? 'bg-gray-400 opacity-20' : 'bg-amber-300 opacity-40'}`} />

      <div className="p-6 text-center z-10 border-b border-fuchsia-100 bg-white/50 backdrop-blur-sm">
         <h2 className="text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2">
            Focus Plant
         </h2>
         <p className="text-[10px] text-fuchsia-500 mt-1 uppercase font-bold">Do not switch tabs. Or it dies.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-6 w-full z-10">
         
         <div className="relative w-48 h-64 flex flex-col items-center justify-end border-b-4 border-amber-900 px-4 mb-8">
            
            <AnimatePresence mode="wait">
               {isDead ? (
                  <motion.div 
                     key="dead"
                     initial={{ opacity: 0, rotate: -90, y: 50 }}
                     animate={{ opacity: 1, rotate: -90, y: 50 }}
                     className="text-gray-400 flex flex-col items-center mb-4 origin-bottom"
                  >
                     <Skull size={48} className="mb-2" />
                     <div className="w-2 h-24 bg-gray-400 rounded-full" />
                  </motion.div>
               ) : (
                  <motion.div 
                     key="alive"
                     className="relative flex flex-col items-center origin-bottom w-2"
                     style={{ height: `${20 + progress * 150}px` }}
                  >
                     {/* Stem */}
                     <div className="absolute bottom-0 w-full h-full bg-emerald-500 rounded-t-full transition-all duration-1000" />
                     
                     {/* Leaves based on progress */}
                     {progress > 0.2 && (
                        <div className="absolute bottom-8 -left-4 w-6 h-3 bg-emerald-400 rounded-l-full rounded-tr-full rotate-[-30deg] origin-right transition-all duration-1000" />
                     )}
                     {progress > 0.5 && (
                        <div className="absolute bottom-16 -right-4 w-6 h-3 bg-emerald-400 rounded-r-full rounded-tl-full rotate-[30deg] origin-left transition-all duration-1000" />
                     )}
                     {progress > 0.8 && (
                        <div className="absolute bottom-24 -left-6 w-8 h-4 bg-emerald-400 rounded-l-full rounded-tr-full rotate-[-20deg] origin-right transition-all duration-1000" />
                     )}

                     {/* Bloom */}
                     {isSuccess && (
                        <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           transition={{ type: "spring", bounce: 0.5 }}
                           className="absolute -top-6 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,114,182,0.6)] z-10"
                        >
                           <div className="w-6 h-6 bg-yellow-300 rounded-full" />
                        </motion.div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Pot */}
            <div className="absolute -bottom-4 w-full h-8 bg-amber-800 rounded-b-xl border-t border-amber-900" />
         </div>

         {/* Timer Text */}
         <div className="text-4xl font-mono font-black mb-8">
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
         </div>

         {(!isActive && !isSuccess) ? (
            <button 
               onClick={startTimer}
               className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
               <Leaf size={18} /> {isDead ? "Replant Seed" : "Plant Seed"}
            </button>
         ) : isSuccess ? (
            <div className="text-emerald-500 font-bold uppercase tracking-widest text-sm bg-emerald-50 px-6 py-2 rounded-full border border-emerald-200">
               Session Complete
            </div>
         ) : (
            <div className="text-fuchsia-400 font-bold uppercase tracking-widest text-xs animate-pulse">
               Focusing... (Do not leave)
            </div>
         )}

      </div>
    </div>
  );
}
