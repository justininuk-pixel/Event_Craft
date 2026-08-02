"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function FlashSaleBomb({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // Use a shorter 15-second timer in preview mode, otherwise 60 seconds
  const TOTAL_MS = (mode === "editor-preview" ? 15 : 60) * 1000;

  const [status, setStatus] = useState<"running" | "exploded">("running");
  const [timeLeft, setTimeLeft] = useState(TOTAL_MS);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];

  const updateTimer = () => {
     if (status === "exploded") return;
     const now = Date.now();
     const elapsed = now - startTimeRef.current;
     const remaining = Math.max(0, TOTAL_MS - elapsed);

     setTimeLeft(remaining);

     if (remaining <= 0) {
        setStatus("exploded");
        if (onComplete) {
           onComplete();
        }
     } else {
        requestRef.current = requestAnimationFrame(updateTimer);
     }
  };

  useEffect(() => {
     startTimeRef.current = Date.now();
     requestRef.current = requestAnimationFrame(updateTimer);
     return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     };
  }, []);

  const formatTime = (ms: number) => {
     const totalSeconds = ms / 1000;
     return totalSeconds.toFixed(2);
  };

  // Intensity factor from 0 to 1 as time runs out
  const urgency = 1 - (timeLeft / TOTAL_MS);
  
  // Exponential urgency for the last few seconds
  const shakeIntensity = urgency > 0.8 ? (urgency - 0.8) * 50 : 0;
  const rgbShift = urgency > 0.5 ? (urgency - 0.5) * 10 : 0;
  const noiseOpacity = urgency * 0.5;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none transition-colors duration-0"
      style={{ 
         backgroundColor: status === "exploded" ? "#000" : bgColors[0],
         filter: status === "running" ? `saturate(${100 + urgency * 100}%) contrast(${100 + urgency * 50}%)` : "none"
      }} 
    >
      <AnimatePresence>
         {status === "running" && (
            <motion.div
               key="running"
               initial={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.1, filter: "brightness(1000%)" }}
               transition={{ duration: 0.1 }}
               className="w-full h-full flex flex-col relative z-10"
               style={{
                  transform: `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`
               }}
            >
               {/* Noise Overlay */}
               <div 
                  className="absolute inset-0 pointer-events-none mix-blend-overlay z-50"
                  style={{
                     opacity: noiseOpacity,
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                  }}
               />

               {/* Chromatic Aberration Shadows applied to container */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20">
                  <div className="text-center" style={{ textShadow: `${rgbShift}px 0 0 rgba(255,0,0,0.8), -${rgbShift}px 0 0 rgba(0,255,255,0.8)` }}>
                     {/* Giant Timer */}
                     <div className="text-[15vw] md:text-9xl font-black tabular-nums tracking-tighter leading-none mb-12" style={{ color: primaryColor }}>
                        {formatTime(timeLeft)}
                     </div>

                     <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white mb-6">
                        {config.title}
                     </h1>
                     <p className="text-xl md:text-2xl font-bold text-slate-300 max-w-2xl mx-auto whitespace-pre-wrap">
                        {config.body}
                     </p>
                  </div>
               </div>

               {/* Flashing Warning Lights */}
               <motion.div 
                  className="absolute inset-0 pointer-events-none z-0"
                  animate={{ opacity: [0, urgency * 0.4, 0] }}
                  transition={{ duration: 1 - urgency * 0.9, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundColor: primaryColor, mixBlendMode: "screen" }}
               />
            </motion.div>
         )}

         {status === "exploded" && (
            <motion.div
               key="exploded"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="w-full h-full flex items-center justify-center relative z-20"
            >
               {/* Static Background */}
               <div 
                  className="absolute inset-0 opacity-80"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                  }}
               />
               <div className="bg-black/80 px-8 py-4 border border-red-900 shadow-2xl backdrop-blur-sm relative z-10">
                  <h2 className="text-red-600 font-mono text-xl md:text-3xl font-black uppercase tracking-[0.2em] animate-pulse">
                     [ DATA CORRUPTED ]
                  </h2>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
