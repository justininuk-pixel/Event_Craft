"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "eventcraft_vinyl_plays";
const MAX_PLAYS = 20;

export function VinylDegradation({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedPlays, setSimulatedPlays] = useState<number | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316"; // Orange
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#27272a"]; // Zinc 800
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#fafafa";

  useEffect(() => {
     if (mode === "editor-preview") return;

     const saved = localStorage.getItem(STORAGE_KEY);
     if (saved) {
        setPlayCount(parseInt(saved, 10));
     }
  }, [mode]);

  const activePlayCount = simulatedPlays !== null ? simulatedPlays : playCount;
  const isBroken = activePlayCount >= MAX_PLAYS;

  const handlePlay = () => {
     if (isBroken || isPlaying) return;

     setIsPlaying(true);
     const newCount = activePlayCount + 1;
     
     if (mode !== "editor-preview") {
        setPlayCount(newCount);
        localStorage.setItem(STORAGE_KEY, newCount.toString());
     } else {
        setSimulatedPlays(newCount);
     }

     // Simulate track ending
     setTimeout(() => {
        setIsPlaying(false);
        if (onComplete && newCount >= MAX_PLAYS) {
           onComplete();
        }
     }, 4000);
  };

  // Calculate degradation metrics
  const degradationRatio = activePlayCount / MAX_PLAYS; // 0 to 1
  
  // Scratch overlay opacity
  const scratchOpacity = degradationRatio * 0.8;
  
  // Color desaturation
  const grayscale = degradationRatio * 100;
  
  // Wobble/pitch fluctuation visually represented by scale/rotate jitter
  const wobbleX = isPlaying ? (Math.random() * 4 - 2) * degradationRatio : 0;
  const wobbleY = isPlaying ? (Math.random() * 4 - 2) * degradationRatio : 0;
  
  // UI Noise
  const textBlur = degradationRatio > 0.8 ? 1 : 0;

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }} 
    >
      
      {!isBroken ? (
         <div className="flex flex-col items-center max-w-2xl w-full z-10" style={{ filter: `grayscale(${grayscale}%)` }}>
            
            {/* Record Player Visual */}
            <motion.div 
               className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-black relative bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-12 flex items-center justify-center cursor-pointer overflow-hidden"
               onClick={handlePlay}
               animate={{ 
                  rotate: isPlaying ? 360 : 0,
                  x: wobbleX,
                  y: wobbleY
               }}
               transition={{ 
                  rotate: { repeat: isPlaying ? Infinity : 0, duration: 2, ease: "linear" },
                  x: { repeat: isPlaying ? Infinity : 0, duration: 0.1, ease: "linear" },
                  y: { repeat: isPlaying ? Infinity : 0, duration: 0.1, ease: "linear" }
               }}
            >
               {/* Grooves */}
               {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                     key={i}
                     className="absolute border border-white/5 rounded-full"
                     style={{ 
                        width: `${100 - (i * 10)}%`, 
                        height: `${100 - (i * 10)}%` 
                     }}
                  />
               ))}

               {/* Center Label */}
               <div className="w-24 h-24 rounded-full relative flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <div className="w-3 h-3 bg-white rounded-full z-10 shadow-inner" />
                  <div className="absolute text-[8px] font-bold uppercase tracking-widest text-black/50 w-full text-center top-4">
                     Track 01
                  </div>
               </div>

               {/* Dynamic Scratches */}
               <div 
                  className="absolute inset-0 pointer-events-none opacity-0 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im4iPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjUiIG51bU9jdGF2ZXM9IjEiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]"
                  style={{ opacity: scratchOpacity }}
               />
               
               {/* Deep physical scratches */}
               {degradationRatio > 0.5 && (
                  <>
                     <div className="absolute w-full h-px bg-white/20 rotate-45 transform origin-center mix-blend-overlay" style={{ top: "40%" }} />
                     <div className="absolute w-full h-px bg-white/10 -rotate-12 transform origin-center mix-blend-overlay" style={{ top: "60%" }} />
                  </>
               )}
            </motion.div>

            {/* Tonearm (Visual flavor) */}
            <motion.div 
               className="absolute top-24 -right-12 w-4 h-48 bg-slate-400 rounded-full origin-top z-20 shadow-2xl border-r-2 border-slate-300 hidden md:block"
               initial={{ rotate: -20 }}
               animate={{ rotate: isPlaying ? 15 : -20 }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
            >
               <div className="absolute bottom-0 -left-2 w-8 h-12 bg-slate-800 rounded-sm border border-slate-600">
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
               </div>
            </motion.div>

            <div 
               className="text-center transition-all"
               style={{ 
                  color: textColor,
                  filter: `blur(${textBlur}px)`,
                  opacity: isPlaying && degradationRatio > 0.7 ? Math.random() * 0.5 + 0.5 : 1
               }}
            >
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                  {config.title}
               </h1>
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90 mb-8 max-w-xl">
                  {config.body}
               </p>

               <button 
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] border-2 transition-all"
                  style={{ 
                     borderColor: primaryColor, 
                     color: primaryColor,
                     opacity: isPlaying ? 0.5 : 1 
                  }}
               >
                  {isPlaying ? "Playing..." : "Drop Needle"}
               </button>

               <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
                  Plays Remaining: {MAX_PLAYS - activePlayCount} / {MAX_PLAYS}
               </div>
            </div>
         </div>
      ) : (
         <motion.div 
            className="flex flex-col items-center justify-center text-center p-8 z-10 w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
         >
            {/* Broken Record Visual */}
            <div className="relative w-48 h-48 mb-12">
               <div className="absolute left-0 w-24 h-48 bg-[#111] rounded-l-full border-l-4 border-t-4 border-b-4 border-black -rotate-12 translate-y-4 -translate-x-2" />
               <div className="absolute right-0 w-24 h-48 bg-[#111] rounded-r-full border-r-4 border-t-4 border-b-4 border-black rotate-12 -translate-y-4 translate-x-2" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs text-white/20 whitespace-nowrap">
                  MEDIA DESTROYED
               </div>
            </div>

            <h2 className="text-3xl font-black text-slate-500 uppercase tracking-widest mb-4">
               Unrecoverable
            </h2>
            <p className="text-slate-600 font-serif">
               The media has been played too many times. The grooves are destroyed. The content is lost.
            </p>
         </motion.div>
      )}

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/80 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl text-slate-300">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Media Wear
            </h2>
            <div className="flex w-full items-center gap-4 font-bold">
               <span className="text-xs text-slate-400 w-12 text-right">0</span>
               <input 
                  type="range" 
                  min="0" 
                  max={MAX_PLAYS} 
                  step="1" 
                  value={activePlayCount} 
                  onChange={(e) => setSimulatedPlays(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
               />
               <span className="text-xs text-slate-400 w-12 text-red-500">{MAX_PLAYS} (Break)</span>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-widest uppercase text-slate-500">
               Play Count: {activePlayCount}
            </div>
         </div>
      )}
      
    </div>
  );
}
