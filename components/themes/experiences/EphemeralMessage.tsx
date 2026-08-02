"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const DURATION_SECONDS = 10;

export function EphemeralMessage({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"waiting" | "reading" | "destroyed">("waiting");
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS * 1000);
  
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  const updateTimer = () => {
     const now = Date.now();
     const elapsed = now - startTimeRef.current;
     const remaining = Math.max(0, (DURATION_SECONDS * 1000) - elapsed);

     setTimeLeft(remaining);

     if (remaining <= 0) {
        setPhase("destroyed");
        if (onComplete) onComplete();
     } else {
        requestRef.current = requestAnimationFrame(updateTimer);
     }
  };

  const handleOpen = () => {
     if (phase !== "waiting") return;
     startTimeRef.current = Date.now();
     setPhase("reading");
     requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleReset = () => {
     setPhase("waiting");
     setTimeLeft(DURATION_SECONDS * 1000);
  };

  useEffect(() => {
     return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     };
  }, []);

  const timeSecs = (timeLeft / 1000).toFixed(2);
  const percentLeft = timeLeft / (DURATION_SECONDS * 1000);

  // Intensity of screen shake increases as time runs out
  const shakeIntensity = percentLeft < 0.3 ? (0.3 - percentLeft) * 20 : 0;
  const shakeX = phase === "reading" ? (Math.random() - 0.5) * shakeIntensity : 0;
  const shakeY = phase === "reading" ? (Math.random() - 0.5) * shakeIntensity : 0;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-mono select-none"
      style={{ background: phase === "destroyed" ? "#000" : `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <AnimatePresence mode="wait">
         {phase === "waiting" && (
            <motion.div
               key="waiting"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center"
            >
               <h1 className="text-3xl font-bold uppercase text-white mb-6 tracking-[0.2em]">
                  Classified Payload
               </h1>
               <div className="w-24 h-24 mb-12 border-4 border-yellow-500 rounded-full flex items-center justify-center text-4xl bg-yellow-500/20 text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  ⚠️
               </div>
               <p className="text-xl text-slate-300 font-bold uppercase tracking-widest max-w-md mx-auto mb-16 leading-relaxed">
                  This message will permanently self-destruct {DURATION_SECONDS} seconds after opening.
               </p>
               
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpen}
                  className="px-16 py-6 rounded-full font-black text-2xl uppercase tracking-[0.3em] text-white shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:shadow-[0_0_60px_rgba(239,68,68,1)] transition-all bg-red-600 border border-red-400"
               >
                  Open Now
               </motion.button>
            </motion.div>
         )}

         {phase === "reading" && (
            <motion.div
               key="reading"
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1, x: shakeX, y: shakeY }}
               exit={{ opacity: 0, filter: "brightness(2) contrast(2) blur(10px)", scale: 1.2 }}
               transition={{ duration: 0.2 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8"
            >
               {/* Shrinking Border */}
               <div className="absolute inset-4 border-[8px] pointer-events-none transition-colors duration-100"
                  style={{ 
                     borderColor: timeLeft < 3000 ? (Math.floor(Date.now() / 100) % 2 === 0 ? "white" : primaryColor) : primaryColor,
                     opacity: 0.5
                  }}
               />

               {/* Live Timer */}
               <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
                  <div className="bg-black/80 border border-red-500/50 backdrop-blur-md px-8 py-3 rounded-xl flex flex-col items-center">
                     <span className="text-red-500 font-black text-5xl tracking-widest">
                        {timeSecs}s
                     </span>
                  </div>
               </div>

               {/* Shrinking Progress Bar */}
               <div className="absolute top-0 left-0 h-2 bg-red-500" style={{ width: `${percentLeft * 100}%` }} />
               <div className="absolute bottom-0 right-0 h-2 bg-red-500" style={{ width: `${percentLeft * 100}%` }} />

               <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-10 rounded-xl border border-white/20 shadow-2xl mt-12 text-center">
                  <h2 className="text-3xl font-bold mb-6 text-white tracking-widest uppercase">
                     {config.title}
                  </h2>
                  <p className="text-xl text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                     {config.body}
                  </p>
               </div>
            </motion.div>
         )}

         {phase === "destroyed" && (
            <motion.div
               key="destroyed"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-black"
            >
               {/* Static Noise Overlay */}
               <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                  }}
               />

               <motion.div
                  initial={{ scale: 2, filter: "blur(20px)", opacity: 0 }}
                  animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center"
               >
                  <div className="text-6xl mb-6">💥</div>
                  <h2 className="text-4xl md:text-5xl font-black text-red-600 uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                     Payload Destroyed
                  </h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                     Trace completely erased.
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && phase === "destroyed" && (
         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
            <button 
               onClick={handleReset}
               className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-colors shadow-xl backdrop-blur-md"
            >
               Reset Simulation
            </button>
         </div>
      )}
      
    </div>
  );
}
