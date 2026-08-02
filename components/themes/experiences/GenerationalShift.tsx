"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";

const STORAGE_KEY = "eventcraft_generation_start";
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;

export function GenerationalShift({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [simulatedYears, setSimulatedYears] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // Rose
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"]; // Rose 50
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#881337"; // Rose 900

  useEffect(() => {
     if (mode === "editor-preview") return;

     const savedStart = localStorage.getItem(STORAGE_KEY);
     if (savedStart) {
        setElapsedMs(Date.now() - parseInt(savedStart, 10));
     } else {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setElapsedMs(0);
     }
  }, [mode]);

  useEffect(() => {
     if (onComplete) {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
     }
  }, [onComplete]);

  // Calculate Decay (0 to 1)
  const currentElapsedMs = mode === "editor-preview" 
     ? simulatedYears * (365.25 * 24 * 60 * 60 * 1000) 
     : elapsedMs;

  const decayFraction = Math.min(Math.max(currentElapsedMs / TEN_YEARS_MS, 0), 1);
  const grayscalePercent = decayFraction * 100;
  
  // Calculate a sepia tone effect that kicks in heavily towards the end
  const sepiaPercent = decayFraction * 50;
  // Decrease opacity slightly as it ages
  const opacity = 1 - (decayFraction * 0.1);
  // Add a slight blur/softness for extreme age
  const blur = decayFraction > 0.8 ? (decayFraction - 0.8) * 5 : 0;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center p-8 md:p-16 transition-colors duration-1000"
      style={{ backgroundColor: "#ffffff" }} // Force a neutral background wrapper so the filter works cleanly against it
    >
      {/* The Wrapper that receives the algorithmic decay filter */}
      <div 
         className="w-full max-w-2xl h-full relative flex flex-col rounded-3xl p-8 md:p-16 shadow-2xl transition-all duration-[2000ms] ease-out"
         style={{ 
            backgroundColor: bgColors[0], 
            color: textColor,
            filter: `grayscale(${grayscalePercent}%) sepia(${sepiaPercent}%) blur(${blur}px)`,
            opacity: opacity
         }}
      >
         {/* A mock "polaroid" or highly colorful nostalgic image block */}
         <div className="w-full h-48 md:h-64 rounded-xl mb-8 flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: primaryColor }}>
            {/* Some colorful geometric shapes to show off the decay */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply translate-x-1/4 translate-y-1/4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-white/80 text-4xl uppercase tracking-widest">
               Memory
            </div>
         </div>

         <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter" style={{ color: primaryColor }}>
            {config.title}
         </h1>
         <p className="text-lg md:text-xl font-serif leading-relaxed mb-8 flex-1">
            {config.body}
         </p>

         <div className="border-t border-current pt-4 opacity-50 flex justify-between font-mono text-[10px] uppercase tracking-widest">
            <span>Archived Record</span>
            <span>Degradation: {grayscalePercent.toFixed(1)}%</span>
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-200">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Years Elapsed (Color Decay)
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400 w-12 text-right">0 Yrs</span>
               <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.1" 
                  value={simulatedYears} 
                  onChange={(e) => setSimulatedYears(parseFloat(e.target.value))}
                  className="flex-1 accent-rose-500"
               />
               <span className="text-xs text-slate-400 w-12">10 Yrs</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-widest uppercase text-slate-500">
               Decay Multiplier: {decayFraction.toFixed(3)}
            </div>
         </div>
      )}
      
    </div>
  );
}
