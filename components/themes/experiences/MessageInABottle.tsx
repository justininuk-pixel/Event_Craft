"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Waves } from "lucide-react";

export function MessageInABottle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const tapsNeeded = 30; // Effort required
  const [taps, setTaps] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [waves, setWaves] = useState<{id: number, x: number, y: number}[]>([]);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#bae6fd"];

  const handleOceanTap = (e: React.MouseEvent) => {
    if (isOpen) return;

    // Add a wave visual at the tap location
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setWaves(prev => [...prev, { id: Date.now(), x, y }]);
    
    setTaps(prev => {
       const next = prev + 1;
       if (next >= tapsNeeded) {
          // It reached the shore
          setTimeout(() => {
             setIsOpen(true);
             if (onComplete) onComplete();
          }, 500); // small delay before opening
       }
       return next;
    });

    // Cleanup old waves
    setTimeout(() => {
       setWaves(prev => prev.filter(w => w.id !== Date.now()));
    }, 1000);
  };

  // Bottle progression (0 to 1)
  const progress = Math.min(1, taps / tapsNeeded);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif select-none overflow-hidden cursor-pointer"
      style={{ backgroundColor: bgColors[0] }}
      onClick={handleOceanTap}
    >
      
      {/* The Ocean / Water texture */}
      <div 
         className="absolute inset-0 z-0 opacity-20"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/water.png')" }} 
      />

      {/* The Shoreline (Bottom of screen) */}
      <div 
         className="absolute bottom-0 left-0 w-full h-[20%] z-10 bg-[#fef08a] border-t-8 border-[#fde047] shadow-[0_-10px_20px_rgba(0,0,0,0.1)]"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/sand.png')" }}
      />

      {/* The Waves from Tapping */}
      {waves.map(wave => (
         <motion.div
            key={wave.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute z-10 pointer-events-none rounded-full border-2 border-white"
            style={{ 
               left: wave.x - 20, 
               top: wave.y - 20, 
               width: 40, 
               height: 40 
            }}
         />
      ))}

      {/* The Bottle */}
      <motion.div 
         className="absolute left-1/2 z-20"
         // Start near top (10%), move to shore (75%)
         animate={{ 
            top: `${10 + (progress * 65)}%`,
            x: "-50%",
            rotate: Math.sin(taps) * 15 // bobbing rotation
         }}
         transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
         <div className="relative w-16 h-32 flex flex-col items-center">
            {/* Cork */}
            <div className="w-4 h-4 bg-amber-800 rounded-t shadow-sm" />
            {/* Neck */}
            <div className="w-6 h-8 bg-green-200/60 backdrop-blur-sm border-x-2 border-white/40" />
            {/* Body */}
            <div className="w-16 h-20 bg-green-200/60 backdrop-blur-sm border-2 border-white/40 rounded-b-xl shadow-lg relative overflow-hidden flex items-center justify-center">
               <div className="absolute top-1 right-2 w-2 h-12 bg-white/30 rounded-full blur-[1px]" />
               {/* Paper inside */}
               <div className="w-10 h-14 bg-[#fef3c7] rotate-6 border border-[#fcd34d] shadow-inner opacity-90" />
            </div>
         </div>
      </motion.div>

      {/* Instruction text if they haven't figured it out */}
      <AnimatePresence>
         {taps === 0 && !isOpen && (
            <motion.div 
               className="absolute top-1/4 w-full text-center z-30 pointer-events-none text-blue-900 font-bold uppercase tracking-widest text-sm"
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
            >
               Tap the water to create waves
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Message Modal (when opened) */}
      <AnimatePresence>
         {isOpen && (
            <motion.div 
               className="absolute inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-6"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <motion.div 
                  className="bg-[#fef3c7] w-full max-w-md p-8 md:p-12 shadow-2xl relative"
                  initial={{ scale: 0.8, y: 50, rotate: -2 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
               >
                  <h2 className="text-2xl font-bold mb-6 text-amber-900" style={{ color: primaryColor }}>
                     {config.title || "Found Message"}
                  </h2>
                  <p className="text-amber-900 leading-loose text-lg whitespace-pre-wrap font-medium">
                     {config.body || "To whoever finds this...\n\nThe journey was long, but the current was true. I hope this reaches you in time."}
                  </p>
                  
                  {/* Decorative stamp */}
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-red-500/30 rounded-full flex items-center justify-center rotate-12 opacity-50">
                     <Waves className="text-red-500" />
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isOpen && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  setTaps(tapsNeeded);
                  setIsOpen(true);
                  if (onComplete) onComplete();
               }}
               className="bg-black/20 text-blue-900 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               Wash Ashore (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
