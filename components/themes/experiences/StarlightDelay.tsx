"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "eventcraft_starlight_start";
const TARGET_TIME = 500; // 8 minutes 20 seconds = 500 seconds

type Status = "idle" | "traveling" | "arrived";

export function StarlightDelay({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsedTime, setElapsedTime] = useState(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // Amber/Sun
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#1e293b";

  useEffect(() => {
     // Check if there's a stored start time
     const savedStart = localStorage.getItem(STORAGE_KEY);
     if (savedStart && mode !== "editor-preview") {
        const diffMs = Date.now() - parseInt(savedStart, 10);
        const elapsedSecs = diffMs / 1000;
        
        if (elapsedSecs >= TARGET_TIME) {
           setStatus("arrived");
           setElapsedTime(TARGET_TIME);
        } else {
           setStatus("traveling");
           setElapsedTime(elapsedSecs);
        }
     }
  }, [mode]);

  useEffect(() => {
     let interval: NodeJS.Timeout;

     if (status === "traveling") {
        interval = setInterval(() => {
           const savedStart = localStorage.getItem(STORAGE_KEY);
           if (!savedStart) return;

           const diffMs = Date.now() - parseInt(savedStart, 10);
           const elapsedSecs = diffMs / 1000;

           if (elapsedSecs >= TARGET_TIME) {
              setStatus("arrived");
              setElapsedTime(TARGET_TIME);
              clearInterval(interval);
           } else {
              setElapsedTime(elapsedSecs);
           }
        }, 100); // 100ms for smooth sub-second updates if we want, but 1000 is fine too. We use 100 to make the bar smooth
     }

     return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
     if (status === "arrived" && onComplete) {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
     }
  }, [status, onComplete]);

  const handleStart = () => {
     localStorage.setItem(STORAGE_KEY, Date.now().toString());
     setStatus("traveling");
     setElapsedTime(0);
  };

  const handleHyperdrive = () => {
     // Artificial skip for editor
     const simulatedStart = Date.now() - (TARGET_TIME * 1000);
     localStorage.setItem(STORAGE_KEY, simulatedStart.toString());
     setStatus("arrived");
     setElapsedTime(TARGET_TIME);
  };

  const progress = Math.min(elapsedTime / TARGET_TIME, 1);
  const remainingSecs = Math.max(0, TARGET_TIME - elapsedTime);
  const mins = Math.floor(remainingSecs / 60);
  const secs = Math.floor(remainingSecs % 60);
  const ms = Math.floor((remainingSecs % 1) * 100);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-[3000ms] flex flex-col items-center justify-center"
      style={{ backgroundColor: status === "arrived" ? primaryColor : bgColors[0], color: status === "arrived" ? textColor : "#ffffff" }} 
    >
      {/* Stars Background */}
      {status !== "arrived" && (
         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            {Array.from({ length: 100 }).map((_, i) => (
               <div 
                  key={`star-${i}`} 
                  className="absolute bg-white rounded-full"
                  style={{
                     width: Math.random() * 2 + 1 + 'px',
                     height: Math.random() * 2 + 1 + 'px',
                     top: Math.random() * 100 + '%',
                     left: Math.random() * 100 + '%',
                     opacity: Math.random() * 0.8 + 0.2
                  }}
               />
            ))}
         </div>
      )}

      <AnimatePresence mode="wait">
         {status === "idle" && (
            <motion.div 
               key="idle"
               className="flex flex-col items-center justify-center z-10 p-6 text-center"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 1 }}
            >
               <h2 className="text-xl md:text-2xl text-slate-300 font-serif mb-4 uppercase tracking-widest">
                  Transmission Incoming
               </h2>
               <p className="text-slate-400 font-mono text-sm mb-12 max-w-sm">
                  Source: Sol (The Sun)<br/>
                  Distance: 1 Astronomical Unit<br/>
                  Speed of Light: 299,792 km/s
               </p>
               
               <button 
                  onClick={handleStart}
                  className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-[0.2em] text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
               >
                  Request Data
               </button>
            </motion.div>
         )}

         {status === "traveling" && (
            <motion.div 
               key="traveling"
               className="flex flex-col items-center justify-center w-full h-full relative z-10 px-8"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 2 }}
            >
               <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
               
               {/* The Photon */}
               <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none px-8">
                  <motion.div 
                     className="w-4 h-4 rounded-full bg-white shadow-[0_0_30px_10px_rgba(255,255,255,0.5)]"
                     style={{ 
                        marginLeft: `${progress * 100}%`,
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 30px 10px ${primaryColor}80`
                     }}
                  />
               </div>

               {/* Readout */}
               <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
                  <div className="font-mono text-4xl font-black text-slate-200 tracking-tighter mb-2">
                     {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}.<span className="text-xl opacity-50">{ms.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                     Photon In Transit
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2">
                     You may leave this page. The light will continue to travel.
                  </div>
               </div>
            </motion.div>
         )}

         {status === "arrived" && (
            <motion.div 
               key="arrived"
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 3, delay: 0.5 }} // delay for the bg color transition
            >
               <div className="text-xs font-bold uppercase tracking-[0.3em] mb-8 opacity-60">
                  Transmission Received
               </div>
               <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                  {config.title}
               </h1>
               <p className="text-lg md:text-2xl font-serif leading-relaxed opacity-90 max-w-xl font-medium">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && status === "traveling" && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Wait
            </h2>
            <button 
               onClick={handleHyperdrive}
               className="w-full bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-blue-400/50"
            >
               Engage Hyperdrive (Skip 8m20s)
            </button>
         </div>
      )}
      
    </div>
  );
}
