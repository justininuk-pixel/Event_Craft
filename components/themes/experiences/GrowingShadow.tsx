"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function GrowingShadow({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const date = new Date();
  const currentHourDecimal = date.getHours() + date.getMinutes() / 60;
  
  const [simulatedHour, setSimulatedHour] = useState<number>(currentHourDecimal);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#9ca3af"; // Stone color
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e5e7eb"]; // Ground color

  useEffect(() => {
     // Passive unlock after 3 seconds
     const timer = setTimeout(() => {
        setIsUnlocked(true);
        if (onComplete) onComplete();
     }, 3000);
     return () => clearTimeout(timer);
  }, [onComplete]);

  // Calculate sun position and shadow projection
  // We assume a simplistic diurnal arc:
  // Sun rises at 6:00 (hour 6), peaks at 12:00, sets at 18:00
  // Between 18:00 and 6:00, it's night (moonlight cast, or no shadow)
  
  let isNight = false;
  let activeHour = simulatedHour;
  
  if (simulatedHour < 6 || simulatedHour > 18) {
     isNight = true;
     // For night, maybe the moon casts a faint shadow, peaking at 00:00 (hour 24 or 0)
     // Let's remap night to a 6-18 scale for the moon
     activeHour = simulatedHour < 6 ? simulatedHour + 12 : simulatedHour - 12; 
  }

  // Active hour is 6 to 18.
  // Normalize to 0 to 1 (0 = 6am, 0.5 = noon, 1 = 6pm)
  const sunProgress = (activeHour - 6) / 12; 
  
  // Angle of the shadow. 
  // Morning (progress 0) sun is East, shadow points West (-90 deg).
  // Noon (progress 0.5) sun is South, shadow points North (0 deg).
  // Evening (progress 1) sun is West, shadow points East (90 deg).
  const shadowRotationDeg = -90 + (sunProgress * 180);

  // Length of the shadow based on sun elevation.
  // At noon (0.5), elevation is max (90 deg), shadow is shortest (scale 0.2).
  // At dawn/dusk, elevation is low, shadow is very long (scale 3).
  // Using a sine curve for elevation.
  const sunElevation = Math.sin(sunProgress * Math.PI);
  // Prevent division by zero
  const safeElevation = Math.max(0.1, sunElevation);
  const shadowLength = isNight ? (0.5 / safeElevation) : (1 / safeElevation);
  const shadowOpacity = isNight ? 0.2 : 0.6 * sunElevation;

  // Background gradient based on time of day
  const skyColor = isNight 
      ? "linear-gradient(to bottom, #111827, #1f2937)" 
      : `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})`;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000"
      style={{ background: skyColor }} 
    >
      {/* Texture Overlay */}
      <div 
         className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply"
         style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
         }}
      />

      {/* Engraved Message on the ground */}
      <motion.div 
         className="absolute z-10 w-[80%] max-w-2xl text-center"
         initial={{ opacity: 0 }}
         animate={{ opacity: isUnlocked ? (isNight ? 0.4 : 0.8) : 0 }}
         transition={{ duration: 2 }}
         style={{ 
            color: isNight ? "#94a3b8" : "#4b5563",
            textShadow: isNight ? "1px 1px 2px rgba(0,0,0,0.8)" : "1px 1px 1px rgba(255,255,255,0.8), -1px -1px 1px rgba(0,0,0,0.2)"
         }}
      >
         <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.3em] mb-8 font-serif">
            {config.title}
         </h1>
         <p className="text-lg md:text-2xl font-medium leading-relaxed tracking-widest uppercase">
            {config.body}
         </p>
      </motion.div>

      {/* Centerpiece: The Obelisk and its Shadow */}
      <div className="relative z-20 w-16 h-16 flex items-center justify-center mt-32">
         
         {/* The Cast Shadow */}
         <motion.div 
            className="absolute top-1/2 left-1/2 w-8 h-48 bg-black origin-top rounded-b-full blur-md"
            style={{
               marginLeft: "-16px", // half of width 32px
               opacity: shadowOpacity,
            }}
            animate={{
               rotate: shadowRotationDeg,
               scaleY: shadowLength,
               skewX: -shadowRotationDeg * 0.5 // Add some skew based on rotation for 3D effect
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
         />

         {/* The Obelisk (Top-down 3D fake) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 origin-center rotate-45 flex items-center justify-center">
            {/* Base */}
            <div className="w-16 h-16 bg-slate-300 absolute shadow-2xl border border-slate-400" />
            {/* Sides */}
            <div className="absolute w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[32px] border-b-slate-100 top-0 left-0 drop-shadow-md" />
            <div className="absolute w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-t-[32px] border-t-slate-400 bottom-0 left-0 drop-shadow-md" />
            <div className="absolute w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[32px] border-l-slate-200 top-0 left-0 drop-shadow-md" />
            <div className="absolute w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-r-[32px] border-r-slate-500 top-0 right-0 drop-shadow-md" />
            {/* Peak */}
            <div className="w-2 h-2 bg-slate-50 absolute z-10 rounded-sm" />
         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/80 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time of Day
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs text-slate-400">00:00</span>
               <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  step="0.1" 
                  value={simulatedHour} 
                  onChange={(e) => setSimulatedHour(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-800"
               />
               <span className="text-xs text-slate-400">24:00</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border tracking-widest uppercase bg-slate-100 text-slate-600 border-slate-300 rounded-full">
               {Math.floor(simulatedHour).toString().padStart(2, '0')}:
               {Math.floor((simulatedHour % 1) * 60).toString().padStart(2, '0')}
               {isNight ? " (Moonlight)" : " (Sunlight)"}
            </div>
         </div>
      )}
      
    </div>
  );
}
