"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function EbbAndFlow({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [blurAmount, setBlurAmount] = useState(0);
  const [opacityAmount, setOpacityAmount] = useState(1);
  const [frequency, setFrequency] = useState(10); // Default 10-second wave cycle
  
  const rafId = useRef<number>(0);
  const startTime = useRef<number>(Date.now());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0891b2"; // Cyan 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfeff"]; // Cyan 50
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#083344"; // Cyan 950

  useEffect(() => {
     const updateWave = () => {
        const now = Date.now();
        const elapsed = now - startTime.current;
        
        // frequency is in seconds. We want a full cycle (0 to 2PI) to take `frequency` seconds.
        // Math.sin oscillates between -1 and 1.
        // We want a normalized value between 0 and 1.
        // (Math.sin(elapsed / 1000 * (Math.PI * 2) / frequency) + 1) / 2
        const elapsedSec = elapsed / 1000;
        const angularFreq = (Math.PI * 2) / frequency;
        
        const rawSin = Math.sin(elapsedSec * angularFreq);
        const normalized = (rawSin + 1) / 2; // 0.0 to 1.0

        // Map 0.0-1.0 to Blur: 0 = Clear (blur 0), 1 = Blurred (blur 20px)
        const currentBlur = normalized * 20;
        setBlurAmount(currentBlur);

        // Map 0.0-1.0 to Opacity: 0 = Solid (1.0), 1 = Faded (0.2)
        const currentOpacity = 1 - (normalized * 0.8);
        setOpacityAmount(currentOpacity);

        rafId.current = requestAnimationFrame(updateWave);
     };

     rafId.current = requestAnimationFrame(updateWave);

     return () => cancelAnimationFrame(rafId.current);
  }, [frequency]);

  useEffect(() => {
     if (onComplete) {
        // Complete after a few cycles
        const timer = setTimeout(onComplete, frequency * 3000);
        return () => clearTimeout(timer);
     }
  }, [onComplete, frequency]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0], color: textColor }}
    >
      
      {/* Background Water Effect */}
      <motion.div 
         className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
         style={{
            background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 70%)`
         }}
         animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
         transition={{ duration: frequency, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-3xl p-8 md:p-16 text-center relative z-10 flex flex-col items-center justify-center min-h-[50vh]">
         
         <div 
            style={{ 
               filter: `blur(${blurAmount}px)`, 
               opacity: opacityAmount,
               transform: `scale(${1 + (blurAmount * 0.01)})`,
               transition: "transform 0.1s linear, filter 0.1s linear, opacity 0.1s linear"
            }}
         >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8" style={{ color: primaryColor }}>
               {config.title}
            </h1>
            
            <p className="text-xl md:text-3xl font-serif leading-relaxed font-medium">
               {config.body}
            </p>

            <div className="mt-16 w-16 h-[2px] mx-auto opacity-50" style={{ backgroundColor: primaryColor }} />
            <p className="mt-8 text-sm uppercase tracking-widest font-bold opacity-60">
               Patience. Read when the wave recedes.
            </p>
         </div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-black/10 p-6 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Sine Wave Frequency
            </h2>
            
            <div className="flex w-full items-center gap-4 font-bold text-xs uppercase tracking-wider mb-2">
               <span className="text-slate-400 w-16 text-right">Frantic</span>
               <input 
                  type="range" 
                  min="2" 
                  max="30" 
                  step="1"
                  value={frequency} 
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="flex-1 accent-cyan-600"
               />
               <span className="text-slate-400 w-16">Calm</span>
            </div>

            <div className="flex justify-between w-full text-slate-400 font-mono text-[10px] mt-2">
               <span>Cycle: {frequency} seconds</span>
               <span>Current Blur: {blurAmount.toFixed(1)}px</span>
            </div>
         </div>
      )}
      
    </div>
  );
}
