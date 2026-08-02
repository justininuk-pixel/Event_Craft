"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";

const STORAGE_KEY = "eventcraft_century_start";

export function CenturyClock({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [simulatedDecades, setSimulatedDecades] = useState(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // Amber/Gold
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // Stone 900
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#d6d3d1"; // Stone 300

  // Constants
  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
  const MS_PER_YEAR = MS_PER_WEEK * 52;
  const MS_PER_DECADE = MS_PER_YEAR * 10;
  const MS_PER_CENTURY = MS_PER_DECADE * 10;

  useEffect(() => {
     if (mode === "editor-preview") return;

     const savedStart = localStorage.getItem(STORAGE_KEY);
     let startTime = 0;
     
     if (savedStart) {
        startTime = parseInt(savedStart, 10);
     } else {
        startTime = Date.now();
        localStorage.setItem(STORAGE_KEY, startTime.toString());
     }

     let animationFrame: number;

     const tick = () => {
        setElapsedMs(Date.now() - startTime);
        animationFrame = requestAnimationFrame(tick);
     };

     animationFrame = requestAnimationFrame(tick);

     return () => cancelAnimationFrame(animationFrame);
  }, [mode]);

  useEffect(() => {
     if (onComplete) {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
     }
  }, [onComplete]);

  // Calculate current elapsed
  const currentElapsedMs = mode === "editor-preview" 
     ? simulatedDecades * MS_PER_DECADE 
     : elapsedMs;

  // Week hand (fastest, full rotation = 1 year)
  // Usually second hand completes in 60s. Here, it completes in 52 weeks.
  const weekRotation = (currentElapsedMs % MS_PER_YEAR) / MS_PER_YEAR * 360;

  // Year hand (medium, full rotation = 1 decade)
  const yearRotation = (currentElapsedMs % MS_PER_DECADE) / MS_PER_DECADE * 360;

  // Decade hand (slowest, full rotation = 1 century)
  const decadeRotation = (currentElapsedMs % MS_PER_CENTURY) / MS_PER_CENTURY * 360;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col md:flex-row items-center justify-center p-8 gap-12"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      
      {/* The Century Clock Face */}
      <div className="relative w-[min(85%,400px)] max-w-full aspect-square rounded-full border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex-shrink-0 bg-slate-900 flex items-center justify-center">
         
         {/* Center Pin */}
         <div className="absolute w-4 h-4 bg-slate-700 rounded-full z-30 shadow-md" />

         {/* Markings */}
         {Array.from({ length: 10 }).map((_, i) => (
            <div 
               key={i} 
               className="absolute w-full h-full"
               style={{ transform: `rotate(${i * 36}deg)` }}
            >
               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-700 rounded-full" />
               <div 
                  className="absolute top-10 left-1/2 -translate-x-1/2 text-slate-600 font-serif font-bold text-xs md:text-sm"
                  style={{ transform: `rotate(-${i * 36}deg)` }} // keep numbers upright
               >
                  {i === 0 ? "100" : i * 10}
               </div>
            </div>
         ))}

         {/* Decade Hand (Hour) */}
         <div 
            className="absolute top-1/2 left-1/2 w-2 h-[25%] origin-bottom bg-slate-400 rounded-full z-10 transition-transform duration-200 ease-linear"
            style={{ 
               transform: `translate(-50%, -100%) rotate(${decadeRotation}deg)`,
               boxShadow: "0 0 10px rgba(0,0,0,0.5)"
            }}
         />

         {/* Year Hand (Minute) */}
         <div 
            className="absolute top-1/2 left-1/2 w-1.5 h-[35%] origin-bottom bg-slate-500 rounded-full z-10 transition-transform duration-200 ease-linear"
            style={{ 
               transform: `translate(-50%, -100%) rotate(${yearRotation}deg)`,
               boxShadow: "0 0 10px rgba(0,0,0,0.5)"
            }}
         />

         {/* Week Hand (Second) */}
         <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-[45%] origin-bottom rounded-full z-20 transition-transform duration-200 ease-linear"
            style={{ 
               transform: `translate(-50%, -100%) rotate(${weekRotation}deg)`,
               backgroundColor: primaryColor,
               boxShadow: `0 0 15px ${primaryColor}`
            }}
         />
      </div>

      {/* The Content */}
      <div className="flex flex-col max-w-lg relative z-10">
         <div className="text-xs font-bold uppercase tracking-[0.4em] opacity-50 mb-6 font-mono">
            Scale: 1 Rotation = 100 Years
         </div>
         <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter" style={{ color: primaryColor }}>
            {config.title}
         </h1>
         <p className="text-lg md:text-xl font-serif leading-relaxed opacity-90">
            {config.body}
         </p>
         
         <div className="mt-12 p-4 border border-slate-800 rounded-xl bg-black/20 backdrop-blur-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Chronometer Status</h3>
            <ul className="text-xs font-mono text-slate-400 space-y-1">
               <li>Thin Hand : 1 Rev = 1 Year</li>
               <li>Mid Hand  : 1 Rev = 1 Decade</li>
               <li>Thick Hand: 1 Rev = 1 Century</li>
            </ul>
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-300">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time Travel
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400 w-16 text-right">Decade 0</span>
               <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.01" 
                  value={simulatedDecades} 
                  onChange={(e) => setSimulatedDecades(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500"
               />
               <span className="text-xs text-slate-400 w-16">Century</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-widest uppercase text-slate-500">
               Decades Elapsed: {simulatedDecades.toFixed(2)}
            </div>
         </div>
      )}
      
    </div>
  );
}
