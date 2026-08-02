"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function CampfireStory({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  // Fire intensity ranges from 100 (full bright) down to 0 (pitch black)
  const [fireIntensity, setFireIntensity] = useState(100);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316";

  // Dim the fire over time
  useEffect(() => {
    if (mode === "editor-preview") return;

    const timer = setInterval(() => {
      setFireIntensity(prev => Math.max(0, prev - 1));
    }, 100); // lose 1% intensity every 100ms (10 seconds to full dark)

    return () => clearInterval(timer);
  }, [mode]);

  // Tap to add a log
  const handleStokeFire = () => {
    setFireIntensity(prev => Math.min(100, prev + 30));
  };

  const handleFinish = () => {
    if (!hasCompleted) {
       setHasCompleted(true);
       if (onComplete) onComplete();
    }
  };

  // Derive light radius and opacity based on intensity
  // At 100%, radius is huge. At 0%, radius is 0.
  const lightRadius = Math.max(0, fireIntensity * 4); // 400px at max
  const darkOverlayOpacity = 1 - (fireIntensity / 100);

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative flex flex-col items-center justify-center font-serif text-white select-none overflow-hidden">
      
      {/* Background texture (only visible where there is light) */}
      <div 
         className="absolute inset-0 z-0 opacity-20 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-paper.png')" }} 
      />

      {/* The Story Container (Requires light to be seen) */}
      <div 
         className="absolute inset-0 z-10 p-8 pt-24 overflow-y-auto no-scrollbar pb-64"
         style={{
            // Use CSS Masking to restrict visibility to the light radius around the fire at the bottom
            maskImage: `radial-gradient(circle ${lightRadius}px at 50% 80%, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${lightRadius}px at 50% 80%, black 0%, transparent 100%)`,
         }}
      >
         <div className="max-w-lg mx-auto text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-wider" style={{ color: primaryColor }}>
               {config.title || "The Embers"}
            </h1>
            
            <div className="text-lg leading-loose text-zinc-300 font-medium whitespace-pre-wrap px-4">
               {config.body || "It's cold out here. \n\nThe kind of cold that sinks into your bones. But as long as we keep the fire going, the darkness stays at bay. \n\nEvery log we add buys us a little more time. A little more light to see each other's faces."}
            </div>

            <div className="pt-12">
               <button 
                  onClick={handleFinish}
                  className="px-6 py-2 border-2 border-white/20 rounded hover:bg-white/10 transition-colors uppercase tracking-widest text-sm font-bold"
               >
                  Let it Burn Out (Finish)
               </button>
            </div>
         </div>
      </div>

      {/* The Campfire Element */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center">
         
         {/* Flame Click Target */}
         <motion.button
            onClick={handleStokeFire}
            className="relative w-32 h-32 flex items-center justify-center cursor-pointer active:scale-95 group"
            animate={{ scale: 0.8 + (fireIntensity / 100) * 0.4 }}
         >
            {/* The Glow */}
            <div 
               className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-300"
               style={{ 
                  backgroundColor: primaryColor,
                  opacity: fireIntensity / 100
               }} 
            />

            {/* The Fire Icon */}
            {fireIntensity > 0 ? (
               <Flame 
                  size={64} 
                  fill={primaryColor} 
                  color="#fff" 
                  className="relative z-10 animate-pulse" 
               />
            ) : (
               <div className="text-zinc-600 font-bold uppercase text-xs tracking-widest">
                  Cold Ashes
               </div>
            )}

            {/* Hint text */}
            <div className="absolute -bottom-6 w-32 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
               Tap to add log
            </div>
         </motion.button>

         {/* Wood logs graphic */}
         <div className="w-16 h-4 bg-[#3e2723] rounded border-2 border-[#1b100c] mt-2 relative z-20">
            <div className="absolute top-0 left-2 w-12 h-4 bg-[#3e2723] rounded border-2 border-[#1b100c] -rotate-12 transform origin-left" />
            <div className="absolute top-0 left-0 w-14 h-4 bg-[#3e2723] rounded border-2 border-[#1b100c] rotate-12 transform origin-right" />
         </div>

      </div>

      {/* Global Darkness Overlay */}
      <div 
         className="absolute inset-0 z-40 pointer-events-none bg-black transition-opacity duration-100 ease-linear"
         style={{ opacity: darkOverlayOpacity * 0.95 }} // Never 100% pitch black, always leave a tiny hint
      />

      {/* Warning text when dying */}
      {fireIntensity < 20 && fireIntensity > 0 && (
         <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-pulse text-red-500 font-bold uppercase tracking-widest text-xs">
            The fire is dying...
         </div>
      )}

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setFireIntensity(100)}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Keep Max (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
