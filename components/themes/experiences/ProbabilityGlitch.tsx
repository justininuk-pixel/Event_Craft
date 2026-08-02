"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ProbabilityGlitch({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#09090b"]; // zinc-950
  
  const [history, setHistory] = useState<("H" | "T")[]>([]);
  const [flipping, setFlipping] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const handleFlip = () => {
     if (flipping) return;
     setFlipping(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     
     setTimeout(() => {
        const result: "H" | "T" = Math.random() > 0.5 ? "H" : "T";
        const newHistory = [result, ...history];
        setHistory(newHistory);
        setFlipping(false);

        // Check anomaly: 5 of the same in a row
        if (newHistory.length >= 5) {
           const last5 = newHistory.slice(0, 5);
           if (last5.every(v => v === "H") || last5.every(v => v === "T")) {
              setGlitching(true);
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
              if (onComplete) setTimeout(onComplete, 6000);
           } else {
              setGlitching(false);
           }
        }
     }, 1000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-zinc-950 text-white" 
      style={{ 
         backgroundColor: bgColors[0],
         filter: glitching ? 'url(#glitch-filter)' : 'none'
      }}
    >
      
      {/* SVG Displacement Filter for Anomaly */}
      <svg className="hidden">
         <filter id="glitch-filter">
            <feTurbulence type="fractalNoise" baseFrequency={glitching ? "0.05 0.5" : "0"} numOctaves="2" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" in="noise" result="coloredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={glitching ? 30 : 0} xChannelSelector="R" yChannelSelector="G" />
         </filter>
      </svg>

      <div className="pt-12 text-center z-10">
         <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">
            {glitching ? "ANOMALY DETECTED" : "Random Generator"}
         </h2>
      </div>

      {/* The Coin */}
      <div className="flex-1 flex items-center justify-center relative z-10">
         <motion.button
            onClick={handleFlip}
            disabled={flipping}
            animate={{ 
               rotateY: flipping ? 1800 : 0, 
               scale: flipping ? 1.5 : 1,
               y: flipping ? -100 : 0 
            }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] ${
               glitching ? 'bg-red-900 border-red-500 text-red-100 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-zinc-800 border-zinc-600'
            }`}
            style={{ transformStyle: "preserve-3d" }}
         >
            <span className="text-4xl font-black">{history[0] || "?"}</span>
         </motion.button>
      </div>

      {/* History Track */}
      <div className="h-32 p-4 flex flex-col items-center justify-start z-10 border-t border-zinc-900">
         <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">History</div>
         <div className="flex gap-2 overflow-x-auto w-full justify-center hide-scrollbar">
            <AnimatePresence>
               {history.map((res, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: Math.max(1 - i * 0.1, 0.2), scale: 1 }}
                     className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        res === "H" ? "bg-zinc-700 text-zinc-300" : "bg-zinc-900 text-zinc-500 border border-zinc-700"
                     } ${glitching && i < 5 ? "bg-red-500 text-white animate-pulse" : ""}`}
                  >
                     {res}
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Glitch Overlay effects */}
      {glitching && (
         <div className="absolute inset-0 pointer-events-none mix-blend-difference z-50 overflow-hidden">
            <div className="absolute top-1/4 left-0 w-full h-2 bg-white animate-pulse opacity-50" style={{ transform: 'rotate(-5deg)' }} />
            <div className="absolute top-2/4 left-0 w-full h-8 bg-red-500 animate-bounce opacity-20" />
            <div className="absolute bottom-1/4 left-0 w-full h-1 bg-white animate-ping opacity-50" />
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-red-500 opacity-20 whitespace-nowrap blur-sm">ERROR</h1>
         </div>
      )}

    </div>
  );
}
