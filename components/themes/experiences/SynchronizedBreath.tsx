"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "idle" | "inhale" | "hold" | "exhale" | "unlocked";

export function SynchronizedBreath({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  const phaseRef = useRef<Phase>("idle");
  const holdRef = useRef<boolean>(false);
  const startRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8"; // Sky blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Dark slate

  // Sync refs with state for loop access
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { holdRef.current = isHolding; }, [isHolding]);

  const INHALE_DUR = 4000;
  const HOLD_DUR = 7000;
  const EXHALE_DUR = 8000;

  const resetCycle = () => {
     setPhase("idle");
     setProgress(0);
     cancelAnimationFrame(animRef.current);
  };

  const startCycle = () => {
     setPhase("inhale");
     setProgress(0);
     startRef.current = Date.now();
     cancelAnimationFrame(animRef.current);
     animRef.current = requestAnimationFrame(tick);
  };

  const tick = () => {
     const now = Date.now();
     const elapsed = now - startRef.current;

     const p = phaseRef.current;
     const h = holdRef.current;

     // Rule checking
     if (p === "inhale") {
        if (!h) { resetCycle(); return; } // let go too early
        if (elapsed >= INHALE_DUR) {
           setPhase("hold");
           setProgress(0);
           startRef.current = now;
        } else {
           setProgress(elapsed / INHALE_DUR);
        }
     } else if (p === "hold") {
        if (!h) { resetCycle(); return; } // let go too early
        if (elapsed >= HOLD_DUR) {
           setPhase("exhale");
           setProgress(0);
           startRef.current = now;
        } else {
           setProgress(elapsed / HOLD_DUR);
        }
     } else if (p === "exhale") {
        if (h) { resetCycle(); return; } // didn't let go
        if (elapsed >= EXHALE_DUR) {
           setPhase("unlocked");
    onComplete?.();
           setProgress(1);
           if (onComplete) setTimeout(onComplete, 3000);
           return;
        } else {
           setProgress(elapsed / EXHALE_DUR);
        }
     }

     if (p !== "idle" && p !== "unlocked") {
        animRef.current = requestAnimationFrame(tick);
     }
  };

  // Handle pointer interactions
  const handlePointerDown = () => {
     setIsHolding(true);
     if (phase === "idle") {
        startCycle();
     } else if (phase === "exhale") {
        // Holding during exhale breaks the rule
        resetCycle();
     }
  };

  const handlePointerUp = () => {
     setIsHolding(false);
     if (phase === "inhale" || phase === "hold") {
        // Letting go during inhale or hold breaks the rule
        resetCycle();
     }
  };

  useEffect(() => {
     // Cleanup
     return () => cancelAnimationFrame(animRef.current);
  }, []);

  const getInstruction = () => {
     switch (phase) {
        case "idle": return "Hold circle to inhale";
        case "inhale": return "Inhale...";
        case "hold": return "Hold breath...";
        case "exhale": return "Release and exhale...";
        case "unlocked": return "Breath synced.";
     }
  };

  // Calculate circle size based on phase and progress
  const getCircleSize = () => {
     if (phase === "idle") return 150;
     if (phase === "unlocked") return 3000; // Explode out to cover screen
     if (phase === "inhale") return 150 + (progress * 150); // 150 to 300
     if (phase === "hold") return 300;
     if (phase === "exhale") return 300 - (progress * 150); // 300 back to 150
     return 150;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000 touch-none"
      style={{ backgroundColor: bgColors[0] }} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <AnimatePresence mode="wait">
         {phase !== "unlocked" ? (
            <motion.div 
               key="locked"
               className="flex flex-col items-center justify-center w-full h-full relative z-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
            >
               <h2 className="text-xl md:text-2xl text-slate-300 font-serif mb-12 h-8">
                  {getInstruction()}
               </h2>
               
               {/* The Breathing Circle */}
               <motion.div 
                  className="rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_50px_rgba(56,189,248,0.2)]"
                  style={{ 
                     backgroundColor: primaryColor,
                     width: getCircleSize(),
                     height: getCircleSize()
                  }}
                  animate={{ opacity: phase === "exhale" ? 0.5 : 1 }}
                  transition={{ duration: 0.1 }}
               >
                  {/* Inner pulsing core when holding */}
                  <motion.div 
                     className="w-1/2 h-1/2 bg-white/20 rounded-full"
                     animate={{ 
                        scale: isHolding ? [1, 1.2, 1] : 1,
                        opacity: isHolding ? [0.5, 1, 0.5] : 0
                     }}
                     transition={{ repeat: Infinity, duration: 1 }}
                  />
               </motion.div>

               {/* Ring timer indicator (optional, just for subtle feedback) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <svg width="400" height="400" className="rotate-[-90deg]">
                     <circle 
                        cx="200" cy="200" r="180" 
                        fill="none" 
                        stroke={primaryColor} 
                        strokeWidth="2" 
                        strokeDasharray={2 * Math.PI * 180}
                        strokeDashoffset={2 * Math.PI * 180 * (1 - progress)}
                     />
                  </svg>
               </div>
               
               <div className="mt-16 text-slate-500 font-mono text-sm opacity-50 uppercase tracking-widest">
                  {phase === "idle" ? "4 - 7 - 8" : 
                   phase === "inhale" ? "4" : 
                   phase === "hold" ? "7" : 
                   phase === "exhale" ? "8" : ""}
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="unlocked"
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl text-white mix-blend-difference"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 2, delay: 1 }}
            >
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-8">
                  {config.title}
               </h1>
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Expandable background for transition */}
      {phase === "unlocked" && (
         <motion.div 
            className="absolute inset-0 z-10"
            initial={{ backgroundColor: "transparent" }}
            animate={{ backgroundColor: primaryColor }}
            transition={{ duration: 1.5 }}
         />
      )}

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && phase !== "unlocked" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass
            </h2>
            <button 
               onClick={() => {
                  cancelAnimationFrame(animRef.current);
                  setPhase("unlocked");
    onComplete?.();
               }}
               className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-emerald-400/50"
               onPointerDown={(e) => e.stopPropagation()} // Prevent trigger of main mechanic
            >
               Skip Breathing Exercise
            </button>
         </div>
      )}
      
    </div>
  );
}
