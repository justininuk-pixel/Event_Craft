"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function AgingPortrait({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [yearsElapsed, setYearsElapsed] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Determine actual image to show, or use a default portrait
  // We check if image is available, otherwise Unsplash
  const imageUrl = config.mediaUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80";

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafaf9"];

  useEffect(() => {
     // Trigger onComplete simply by viewing the portrait in its current state
     if (!isUnlocked && onComplete) {
        setIsUnlocked(true);
        setTimeout(() => onComplete(), 2000);
     }
  }, [isUnlocked, onComplete]);

  // CSS Filter calculations
  // At 100 years: sepia 100%, contrast 70%, brightness 80%, grayscale 50%
  const percent = yearsElapsed / 100;
  const sepiaVal = percent * 100;
  const contrastVal = 100 - (percent * 30);
  const brightnessVal = 100 - (percent * 20);
  const grayscaleVal = percent * 50;
  const blurVal = percent * 1.5;

  const filterString = `sepia(${sepiaVal}%) contrast(${contrastVal}%) brightness(${brightnessVal}%) grayscale(${grayscaleVal}%) blur(${blurVal}px)`;

  // Vignette calculation
  const vignetteOpacity = percent * 0.8;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif select-none p-4 md:p-8 items-center justify-center transition-colors duration-1000"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      {/* SVG Filters Definition */}
      <svg className="hidden">
         <defs>
            <filter id="film-grain">
               <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
               <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 -1" result="coloredNoise" />
               <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
            </filter>
         </defs>
      </svg>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
         
         {/* Vintage Frame */}
         <div className="relative p-6 bg-[#f5deb3] rounded-sm shadow-2xl w-full aspect-[3/4] flex items-center justify-center mb-8 border-[16px] border-[#8b4513] border-ridge relative overflow-hidden">
            
            {/* The Actual Photo */}
            <motion.div
               className="w-full h-full bg-cover bg-center transition-all duration-[2000ms]"
               style={{
                  backgroundImage: `url(${imageUrl})`,
                  filter: filterString
               }}
            />

            {/* Grain Overlay */}
            <motion.div 
               className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-[2000ms]"
               style={{ opacity: percent * 0.6, filter: "url(#film-grain)" }}
            />

            {/* Vignette Overlay */}
            <motion.div
               className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]"
               style={{
                  opacity: vignetteOpacity,
                  background: "radial-gradient(circle, transparent 40%, rgba(60,30,0,0.8) 120%)"
               }}
            />
            
            {/* Scratch Overlay (Simulated with simple CSS gradients) */}
            <motion.div
               className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-[2000ms]"
               style={{
                  opacity: percent * 0.3,
                  backgroundImage: `
                     linear-gradient(to right, transparent 20%, rgba(255,255,255,0.4) 20.2%, transparent 20.4%),
                     linear-gradient(to right, transparent 75%, rgba(255,255,255,0.2) 75.1%, transparent 75.3%)
                  `
               }}
            />
         </div>

         {/* Plaque / Text */}
         <div className="bg-[#fff8dc] px-8 py-4 shadow-lg border border-[#deb887] relative">
            {/* Plaque Screws */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#cd853f] shadow-inner" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#cd853f] shadow-inner" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#cd853f] shadow-inner" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#cd853f] shadow-inner" />

            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#5c4033] mb-2" style={{ fontFamily: "Georgia, serif" }}>
               {config.title || "Timeless"}
            </h2>
            <p className="text-sm font-medium text-[#8b4513] italic">
               {config.body}
            </p>
         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md border border-slate-300 p-6 rounded-2xl flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-600 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Years Elapsed
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs">Now</span>
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={yearsElapsed} 
                  onChange={(e) => setYearsElapsed(parseInt(e.target.value))}
                  className="flex-1 accent-[#8b4513]"
               />
               <span className="text-xs">+100y</span>
            </div>
            <div className="mt-2 text-[#8b4513] font-mono text-xs bg-[#f5deb3] px-3 py-1 rounded border border-[#deb887] tracking-widest uppercase">
               {yearsElapsed} Years Old
            </div>
         </div>
      )}
      
    </div>
  );
}
