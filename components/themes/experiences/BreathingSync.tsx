"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Heart } from "lucide-react";

type BreathingPhase = "inhale" | "hold-in" | "exhale" | "hold-out";

export function BreathingSync({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8"; // sky-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#082f49"]; // sky-900

  // The recorded rhythm: [inhale, hold, exhale, hold] in ms
  const rhythm = (config.experience as any)?.rhythm || [4000, 7000, 8000, 1000]; // Default: 4-7-8 breathing

  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [isPlaying, setIsPlaying] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
     if (!isPlaying) return;

     let timeoutId: NodeJS.Timeout;

     const runPhase = (currentPhase: BreathingPhase) => {
        setPhase(currentPhase);
        
        let duration = 0;
        let nextPhase: BreathingPhase = "inhale";

        switch(currentPhase) {
           case "inhale":
              duration = rhythm[0];
              nextPhase = "hold-in";
              break;
           case "hold-in":
              duration = rhythm[1];
              nextPhase = "exhale";
              break;
           case "exhale":
              duration = rhythm[2];
              nextPhase = "hold-out";
              break;
           case "hold-out":
              duration = rhythm[3] || 0;
              nextPhase = "inhale";
              break;
        }

        // If a phase has 0 duration, skip it instantly (though setTimeout(..., 0) takes a tick)
        timeoutId = setTimeout(() => {
           if (currentPhase === "hold-out" || (currentPhase === "exhale" && !rhythm[3])) {
              setCycles(c => {
                 const nc = c + 1;
                 if (nc >= 3 && onComplete) {
                    onComplete();
                 }
                 return nc;
              });
           }
           runPhase(nextPhase);
        }, duration);
     };

     runPhase("inhale");

     return () => clearTimeout(timeoutId);
  }, [isPlaying, rhythm, onComplete]);

  // Derived animation states based on phase
  let scale = 1;
  let opacity = 0.5;
  let transitionDuration = 0;
  let instruction = "";

  switch(phase) {
     case "inhale":
        scale = 1.5;
        opacity = 1;
        transitionDuration = rhythm[0] / 1000;
        instruction = "Breathe In";
        break;
     case "hold-in":
        scale = 1.5;
        opacity = 1;
        transitionDuration = rhythm[1] / 1000;
        instruction = "Hold";
        break;
     case "exhale":
        scale = 0.8;
        opacity = 0.5;
        transitionDuration = rhythm[2] / 1000;
        instruction = "Breathe Out";
        break;
     case "hold-out":
        scale = 0.8;
        opacity = 0.5;
        transitionDuration = (rhythm[3] || 0) / 1000;
        instruction = "Hold";
        break;
  }

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {!isPlaying ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 relative">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(56,189,248,0.3)] border-2" style={{ borderColor: primaryColor, color: primaryColor }}>
               <Wind size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4">
               {config.title || "Breathe with me."}
            </h2>
            <p className="text-white/70 font-medium mb-12">
               {config.body || "I recorded my exact breathing rhythm for you. When you're ready, let's sync our lungs."}
            </p>
            <button 
               onClick={() => setIsPlaying(true)}
               className="py-4 px-12 rounded-full font-bold text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-all text-lg tracking-widest uppercase"
               style={{ backgroundColor: primaryColor }}
            >
               Start
            </button>
         </div>
      ) : (
         <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
            
            <AnimatePresence mode="wait">
               <motion.div 
                  key={instruction}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-24 text-4xl font-black tracking-widest uppercase text-white/90 drop-shadow-lg"
               >
                  {instruction}
               </motion.div>
            </AnimatePresence>

            <div className="relative w-64 h-64 flex items-center justify-center mt-12">
               {/* Ambient Glow behind orb */}
               <motion.div 
                  className="absolute inset-0 rounded-full blur-[50px] opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ scale }}
                  transition={{ duration: transitionDuration, ease: "linear" }}
               />

               {/* The Orb */}
               <motion.div 
                  className="relative w-48 h-48 rounded-full border-4 flex items-center justify-center shadow-inner overflow-hidden"
                  style={{ 
                     borderColor: primaryColor,
                     background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 80%)`
                  }}
                  animate={{ scale, opacity }}
                  transition={{ duration: transitionDuration, ease: "linear" }}
               >
                  {/* Internal waves/texture */}
                  <motion.div 
                     className="absolute inset-0 opacity-30"
                     style={{
                        background: 'repeating-radial-gradient(circle at 50% 50%, transparent, rgba(255,255,255,0.2) 10%, transparent 20%)',
                     }}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <Heart size={48} fill="white" className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] opacity-80" />
               </motion.div>
            </div>

            <div className="absolute bottom-16 text-white/40 font-bold text-sm tracking-widest uppercase">
               Cycle {cycles + 1}
            </div>

         </div>
      )}

    </div>
  );
}
