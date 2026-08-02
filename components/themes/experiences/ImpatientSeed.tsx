"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type SeedStatus = "growing" | "dead" | "bloomed";
const STORAGE_KEY = "eventcraft_seed_planted_at";
const WAIT_TIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function ImpatientSeed({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [status, setStatus] = useState<SeedStatus>("growing");
  const [timeUntil, setTimeUntil] = useState("");
  const [simulatedSkip, setSimulatedSkip] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // Green
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#052e16"]; // Dark Green
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#f0fdf4";

  useEffect(() => {
     if (mode === "editor-preview" && simulatedSkip) {
        setStatus("bloomed");
        return;
     }

     const savedStart = localStorage.getItem(STORAGE_KEY);
     let plantedAt: number;

     if (savedStart) {
        plantedAt = parseInt(savedStart, 10);
     } else {
        plantedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, plantedAt.toString());
     }

     const interval = setInterval(() => {
        if (status === "dead") return;

        const now = Date.now();
        const diffMs = (plantedAt + WAIT_TIME_MS) - now;

        if (diffMs <= 0) {
           setStatus("bloomed");
           clearInterval(interval);
        } else {
           const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
           const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
           const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
           const s = Math.floor((diffMs % (1000 * 60)) / 1000);
           setTimeUntil(`${d}d ${h}h ${m}m ${s}s`);
        }
     }, 1000);

     return () => clearInterval(interval);
  }, [mode, simulatedSkip, status]);

  useEffect(() => {
     if (status === "bloomed" && onComplete) {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
     }
  }, [status, onComplete]);

  const handleSeedClick = () => {
     if (status === "growing") {
        setStatus("dead");
     }
  };

  const handleReplant = () => {
     localStorage.setItem(STORAGE_KEY, Date.now().toString());
     setStatus("growing");
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center p-8"
      style={{ 
         backgroundColor: status === "dead" ? "#450a0a" : status === "bloomed" ? "#ffffff" : bgColors[0],
         color: status === "dead" ? "#fca5a5" : status === "bloomed" ? "#1e293b" : textColor
      }} 
    >
      <AnimatePresence mode="wait">
         {status === "growing" && (
            <motion.div 
               key="growing"
               className="flex flex-col items-center justify-center w-full h-full relative z-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <h2 className="text-xl md:text-2xl font-serif mb-12 uppercase tracking-widest opacity-80">
                  Patience Required
               </h2>
               
               {/* The Seed Area - Only this triggers the death */}
               <motion.div 
                  className="w-48 h-48 rounded-full border-2 border-dashed border-green-900/50 flex flex-col items-center justify-center cursor-pointer relative group"
                  onClick={handleSeedClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
               >
                  {/* Warning Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-3 py-1 rounded whitespace-nowrap pointer-events-none">
                     Do not touch
                  </div>

                  <div className="w-24 h-12 bg-[#3f2e1c] rounded-t-full shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] border-b-4 border-[#2c1e0e] flex items-end justify-center overflow-hidden">
                     <motion.div 
                        className="w-2 h-4 rounded-full mb-1"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ height: ["16px", "20px", "16px"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-emerald-700/50 mt-4 font-bold">
                     Fragile Sprout
                  </div>
               </motion.div>

               <div className="mt-16 text-center">
                  <div className="font-mono text-3xl md:text-4xl tabular-nums tracking-tighter" style={{ color: primaryColor }}>
                     {timeUntil}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mt-2 font-bold">
                     Until Bloom
                  </div>
               </div>
            </motion.div>
         )}

         {status === "dead" && (
            <motion.div 
               key="dead"
               className="flex flex-col items-center justify-center text-center p-8 z-10"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
            >
               <div className="w-24 h-12 bg-[#2c1e0e] rounded-t-full shadow-[inset_0_-10px_20px_rgba(0,0,0,0.8)] border-b-4 border-[#1a1107] flex items-end justify-center overflow-hidden mb-8">
                  <div className="w-2 h-2 bg-amber-900 rounded-full mb-1 rotate-45 transform origin-bottom" />
               </div>

               <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-widest text-red-500">
                  You Disturbed It
               </h2>
               <p className="text-red-300 font-serif max-w-md mb-12 text-xl opacity-90">
                  The seed was fragile. By interfering before the time was up, you killed it.
               </p>

               <button 
                  onClick={handleReplant}
                  className="px-8 py-4 bg-red-950 border border-red-500/50 text-red-200 font-bold uppercase tracking-[0.2em] transition-all hover:bg-red-900 hover:text-white rounded-lg shadow-xl"
               >
                  Replant & Reset Timer
               </button>
            </motion.div>
         )}

         {status === "bloomed" && (
            <motion.div 
               key="bloomed"
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="text-8xl md:text-9xl mb-12"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
               >
                  🌸
               </motion.div>

               <div className="text-xs font-bold uppercase tracking-[0.4em] mb-6" style={{ color: primaryColor }}>
                  Patience Rewarded
               </div>
               
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8" style={{ color: primaryColor }}>
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90 max-w-2xl">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && status === "growing" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Wait
            </h2>
            <button 
               onClick={() => setSimulatedSkip(true)}
               className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-emerald-400/50 mb-2"
            >
               Time Travel 7 Days
            </button>
         </div>
      )}
      
    </div>
  );
}
