"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function Metronome({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [timeScale, setTimeScale] = useState<number>(mode === "editor-preview" ? 60 : 1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Real or simulated clock state
  const [simulatedTime, setSimulatedTime] = useState<number>(Date.now());
  const [beat, setBeat] = useState(0); // 0 to 1 progress of current second
  const [minuteProgress, setMinuteProgress] = useState(0); // 0 to 1 progress of current minute
  const [hourProgress, setHourProgress] = useState(0); // 0 to 1 progress of current hour

  const requestRef = useRef<number>(0);
  const lastRealTimeRef = useRef<number>(Date.now());
  const simulatedTimeRef = useRef<number>(Date.now());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8";

  useEffect(() => {
     // Unlock passively after 5 seconds of real-time viewing
     const timer = setTimeout(() => {
        setIsUnlocked(true);
        if (onComplete) onComplete();
     }, 5000);
     return () => clearTimeout(timer);
  }, [onComplete]);

  const updateClock = () => {
     const now = Date.now();
     const delta = now - lastRealTimeRef.current;
     lastRealTimeRef.current = now;

     simulatedTimeRef.current += (delta * timeScale);
     
     const date = new Date(simulatedTimeRef.current);
     const ms = date.getMilliseconds();
     const s = date.getSeconds();
     const m = date.getMinutes();
     const h = date.getHours();

     // Smooth progress calculations
     const secProg = ms / 1000;
     const minProg = (s + secProg) / 60;
     const hrProg = (m + minProg) / 60;

     setBeat(secProg);
     setMinuteProgress(minProg);
     setHourProgress(hrProg);
     setSimulatedTime(simulatedTimeRef.current);

     requestRef.current = requestAnimationFrame(updateClock);
  };

  useEffect(() => {
     lastRealTimeRef.current = Date.now();
     requestRef.current = requestAnimationFrame(updateClock);
     return () => cancelAnimationFrame(requestRef.current);
  }, [timeScale]);

  // Color mapping based on hour (0 to 23).
  // We'll interpolate hue from 0 to 360 over the day
  const dateObj = new Date(simulatedTime);
  const currentHour = dateObj.getHours();
  const hue = ((currentHour + hourProgress) / 24) * 360;
  
  const bgStyle = {
     background: `radial-gradient(circle at center, hsl(${hue}, 80%, 20%), hsl(${(hue + 60) % 360}, 100%, 5%))`
  };

  // The central beat pulse: expands quickly, fades out
  // The minute ring expands outwards slowly over 60 seconds

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-0"
      style={bgStyle} 
    >
      {/* Minute Ring (Expands over 60 seconds) */}
      <div 
         className="absolute top-1/2 left-1/2 rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-overlay"
         style={{
            width: `${100 + minuteProgress * 150}vmin`,
            height: `${100 + minuteProgress * 150}vmin`,
            opacity: 1 - minuteProgress
         }}
      />

      {/* Central Beat Pulse */}
      <div 
         className="absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"
         style={{
            width: '10vmin',
            height: '10vmin',
            backgroundColor: primaryColor,
            opacity: Math.max(0, 1 - beat * 2), // sharp fade
            transform: `scale(${1 + beat * 3})`,
            filter: "blur(10px)"
         }}
      />

      {/* Central Core */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_white] z-10" />

      {/* Content */}
      <motion.div 
         className="absolute bottom-32 z-30 w-[80%] max-w-xl text-center"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: isUnlocked ? 1 : 0, y: isUnlocked ? 0 : 20 }}
         transition={{ duration: 2 }}
      >
         <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.4em] text-white mb-6 font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {config.title}
         </h1>
         <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed tracking-widest font-serif">
            {config.body}
         </p>
      </motion.div>

      {/* Real/Simulated Time Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/40 font-mono text-sm tracking-[0.5em] tabular-nums z-20">
         {dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/60 backdrop-blur-xl border border-white/10 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Time Scale
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xs text-white/50">1x</span>
               <input 
                  type="range" 
                  min="1" 
                  max="3600" // Up to 1 hour per real second
                  step="1" 
                  value={timeScale} 
                  onChange={(e) => setTimeScale(parseInt(e.target.value))}
                  className="flex-1 accent-white"
               />
               <span className="text-xs text-white/50">3600x</span>
            </div>
            <div className="mt-4 font-mono text-xs px-4 py-2 border border-white/20 rounded-full tracking-widest uppercase text-white/80">
               {timeScale}x Speed
            </div>
         </div>
      )}
      
    </div>
  );
}
