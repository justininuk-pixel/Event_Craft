"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Wheat, Sprout, ShieldAlert, Timer } from "lucide-react";

export function PomodoroFarm({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef2f2"]; // red-50

  const WORK_SECONDS = 25 * 60; // 25 mins
  
  const [timeLeft, setTimeLeft] = useState(WORK_SECONDS);
  const [status, setStatus] = useState<"idle" | "running" | "failed" | "success">("idle");
  const [basket, setBasket] = useState<number>(0);

  useEffect(() => {
     let interval: NodeJS.Timeout;
     
     if (status === "running") {
        interval = setInterval(() => {
           setTimeLeft(prev => {
              if (prev <= 1) {
                 setStatus("success");
                 setBasket(b => b + 1);
                 if (onComplete) onComplete();
                 return 0;
              }
              return prev - 1;
           });
        }, 1000);
     }
     
     return () => clearInterval(interval);
  }, [status, onComplete]);

  const handleStart = () => {
     setTimeLeft(WORK_SECONDS);
     setStatus("running");
  };

  const handleFail = () => {
     setStatus("failed");
  };

  const handleReset = () => {
     setTimeLeft(WORK_SECONDS);
     setStatus("idle");
  };

  const progress = 1 - (timeLeft / WORK_SECONDS);
  
  const formatTime = (secs: number) => {
     const m = Math.floor(secs / 60);
     const s = secs % 60;
     return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine which growth stage to show
  let growthStage = 0; // 0=seed, 1=sprout, 2=plant, 3=fruit
  if (status === "running") {
     if (progress > 0.75) growthStage = 3;
     else if (progress > 0.5) growthStage = 2;
     else if (progress > 0.1) growthStage = 1;
  } else if (status === "success") {
     growthStage = 4; // harvest ready
  }

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* HUD: Basket & Goal */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-2xl font-black tracking-tight mb-1 text-red-950 flex items-center gap-2">
               <Wheat size={24} style={{ color: primaryColor }} />
               {config.title || "Focus Farm"}
            </h2>
            <p className="text-red-800/60 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Grow a tomato. Don't quit early."}
            </p>
         </div>
         
         <div className="bg-white/80 backdrop-blur border border-red-100 px-4 py-2 rounded-2xl shadow-sm text-center flex flex-col items-center min-w-[80px]">
            <span className="text-2xl font-black tabular-nums text-red-500">{basket}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-300">Harvest</span>
         </div>
      </div>

      {/* Main Farm Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
         
         {/* The Dirt Patch */}
         <div className="absolute bottom-1/4 w-64 h-24 bg-amber-900 rounded-[100%] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center border-b-8 border-amber-950">
            
            <AnimatePresence mode="wait">
               
               {status === "idle" && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     className="text-amber-700/50 flex flex-col items-center"
                  >
                     <Sprout size={32} className="mb-2" />
                     <span className="text-xs font-bold uppercase tracking-widest">Ready to Plant</span>
                  </motion.div>
               )}

               {status === "running" && (
                  <motion.div 
                     key={`grow-${growthStage}`}
                     initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                     animate={{ opacity: 1, scale: 1, y: 0 }} 
                     exit={{ opacity: 0, scale: 1.2 }}
                     className="absolute bottom-8 flex flex-col items-center"
                  >
                     {growthStage === 0 && <div className="w-4 h-3 bg-amber-200 rounded-full shadow-inner" />}
                     {growthStage === 1 && <Sprout size={48} className="text-emerald-400" />}
                     {growthStage === 2 && <Sprout size={64} className="text-emerald-500" />}
                     {growthStage === 3 && (
                        <div className="relative">
                           <Sprout size={80} className="text-emerald-600" />
                           <div className="absolute top-4 right-2 w-4 h-4 bg-red-400 rounded-full shadow-sm" />
                        </div>
                     )}
                  </motion.div>
               )}

               {status === "success" && (
                  <motion.div 
                     key="success"
                     initial={{ opacity: 0, scale: 0.5, y: 50 }} 
                     animate={{ opacity: 1, scale: 1, y: -20 }} 
                     className="absolute bottom-12 flex flex-col items-center"
                  >
                     <div className="w-24 h-24 bg-red-500 rounded-full shadow-xl border-4 border-red-600 flex items-start justify-center pt-2 relative overflow-hidden">
                        <div className="absolute top-2 w-8 h-8 bg-white/30 rounded-full blur-md left-2" />
                        <Sprout size={32} className="text-emerald-700 -mt-6" />
                     </div>
                     <span className="mt-4 bg-white px-4 py-1 rounded-full text-xs font-bold text-red-500 uppercase tracking-widest shadow-lg animate-bounce">
                        Harvested!
                     </span>
                  </motion.div>
               )}

               {status === "failed" && (
                  <motion.div 
                     key="failed"
                     initial={{ opacity: 0, rotate: -20 }} 
                     animate={{ opacity: 1, rotate: 90, y: 20 }} 
                     className="absolute bottom-8 flex flex-col items-center opacity-50 grayscale"
                  >
                     <Sprout size={48} className="text-emerald-800" />
                  </motion.div>
               )}

            </AnimatePresence>
         </div>

         {/* Timer Display */}
         <div className="absolute top-1/3 flex flex-col items-center z-30">
            <AnimatePresence mode="wait">
               {status === "running" && (
                  <motion.div 
                     initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                     className="bg-white/90 backdrop-blur px-8 py-4 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center"
                  >
                     <div className="text-6xl font-black tabular-nums tracking-tighter text-slate-800">
                        {formatTime(timeLeft)}
                     </div>
                     
                     <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${progress * 100}%` }} />
                     </div>
                  </motion.div>
               )}
               {status === "failed" && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                     className="bg-red-950 text-red-200 px-8 py-6 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-[250px]"
                  >
                     <ShieldAlert size={32} className="mb-4 text-red-500" />
                     <h3 className="font-black text-xl mb-2">Plant Died</h3>
                     <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed">
                        You stopped focusing early. The plant withered.
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* Action Controls */}
      <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center z-30">
         {status === "idle" && (
            <button
               onClick={handleStart}
               className="w-full max-w-sm py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
               style={{ backgroundColor: primaryColor }}
            >
               <Play fill="currentColor" /> Plant Seed
            </button>
         )}

         {status === "running" && (
            <button
               onClick={handleFail}
               className="w-full max-w-sm py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-xl bg-slate-800 hover:bg-red-600 transition-colors"
            >
               <Square fill="currentColor" /> Give Up (Kills Plant)
            </button>
         )}

         {(status === "failed" || status === "success") && (
            <button
               onClick={handleReset}
               className="w-full max-w-sm py-4 rounded-2xl font-black text-slate-800 bg-white border-2 border-slate-200 text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
               <Timer /> Try Again
            </button>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && status === "running" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
            <button 
               onClick={() => setTimeLeft(WORK_SECONDS * 0.4)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Fast Forward 60%
            </button>
            <button 
               onClick={() => setTimeLeft(2)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Finish Now
            </button>
         </div>
      )}

    </div>
  );
}
