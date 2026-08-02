"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";

const STORAGE_KEY = "eventcraft_glacial_start";
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;

export function GlacialPace({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [simulatedYears, setSimulatedYears] = useState(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // Cyan
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#334155";

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
        const now = Date.now();
        setElapsedMs(now - startTime);
        animationFrame = requestAnimationFrame(tick);
     };

     animationFrame = requestAnimationFrame(tick);

     return () => cancelAnimationFrame(animationFrame);
  }, [mode]);

  useEffect(() => {
     if (onComplete) {
        // Since this takes 10 years, we auto complete it for the system flow
        // The theme is a joke about long term tracking.
        const timer = setTimeout(onComplete, 10000);
        return () => clearTimeout(timer);
     }
  }, [onComplete]);

  // Use simulation if editor, else real time
  const currentElapsedMs = mode === "editor-preview" 
     ? simulatedYears * (365.25 * 24 * 60 * 60 * 1000) 
     : elapsedMs;

  const progressDecimal = Math.min(currentElapsedMs / TEN_YEARS_MS, 1);
  const percentageStr = (progressDecimal * 100).toFixed(9);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center p-8 md:p-16"
      style={{ backgroundColor: bgColors[0], color: textColor }} 
    >
      <div className="w-full max-w-4xl flex flex-col items-center z-10 text-center">
         <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-50 mb-8 border border-current px-4 py-1 rounded-full">
            Decade Tracker Activated
         </div>
         
         <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-6">
            {config.title}
         </h1>
         <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-80 mb-16 max-w-2xl">
            {config.body}
         </p>

         {/* The Glacial Progress Bar */}
         <div className="w-full relative h-16 md:h-24 border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner">
            
            {/* Grid markings */}
            <div className="absolute inset-0 flex">
               {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-slate-200 h-full relative">
                     <span className="absolute bottom-1 left-2 text-[10px] text-slate-400 font-mono">
                        Year {i + 1}
                     </span>
                  </div>
               ))}
            </div>

            {/* The fill */}
            <div 
               className="h-full relative shadow-[0_0_20px_rgba(14,165,233,0.5)]"
               style={{ 
                  width: `${progressDecimal * 100}%`,
                  backgroundColor: primaryColor,
                  // In real-time this CSS transition will effectively do nothing since it moves sub-pixel per frame
                  // But for the editor slider, it gives a nice scrub feel
                  transition: mode === "editor-preview" ? "width 0.1s linear" : "none" 
               }}
            >
               {/* Glowing edge */}
               <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm" />
            </div>
         </div>

         {/* Hyper-precise readout */}
         <div className="mt-8 font-mono text-3xl md:text-5xl font-light tabular-nums tracking-tighter">
            {percentageStr}%
         </div>
         <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-40">
            Progress Calculated in Real-Time
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-800">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Years Elapsed (0-10)
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400">Y0</span>
               <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.0001" 
                  value={simulatedYears} 
                  onChange={(e) => setSimulatedYears(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500"
               />
               <span className="text-xs text-slate-400">Y10</span>
            </div>
            <div className="mt-4 text-[10px] text-slate-400 font-mono text-center max-w-xs">
               In the actual experience, the bar moves so slowly that the user must take screenshots weeks apart to verify movement.
            </div>
         </div>
      )}
      
    </div>
  );
}
