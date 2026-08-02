"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function FortuneCookie({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isBroken, setIsBroken] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d97706"; // Cookie color
  const requiredTaps = 5;

  // Split story into segments
  const segments = (config.body || "A journey of a thousand miles begins with a single step.\nGood things come to those who wait.\nThe fortune you seek is in another cookie.\nYou will find happiness in unexpected places.\nThis is the end of the fortunes.").split("\n").filter(s => s.trim() !== "");

  const handleTap = () => {
    if (isBroken || currentIndex >= segments.length) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= requiredTaps) {
       setIsBroken(true);
       if (currentIndex === segments.length - 1 && onComplete) {
          onComplete();
       }
    }
  };

  const handleNext = () => {
    setTapCount(0);
    setIsBroken(false);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="w-full h-full bg-red-950 relative flex flex-col items-center justify-center font-sans select-none overflow-hidden" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/red-squared.png')" }}>
      
      <div className="absolute top-12 left-0 right-0 text-center z-20">
         <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-md">
            {config.title || "Your Fortune"}
         </h1>
         <p className="text-red-200/60 font-bold uppercase tracking-widest text-xs">
            Cookie {Math.min(currentIndex + 1, segments.length)} of {segments.length}
         </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto p-4">
         
         <AnimatePresence mode="wait">
            {currentIndex < segments.length ? (
               <div key={currentIndex} className="relative w-64 h-64 flex items-center justify-center">
                  
                  {/* The Fortune Slip (Hidden until broken) */}
                  <motion.div 
                     className="absolute w-64 bg-white shadow-xl flex items-center justify-center p-4 border border-gray-200"
                     initial={{ scaleX: 0, opacity: 0 }}
                     animate={{ scaleX: isBroken ? 1 : 0, opacity: isBroken ? 1 : 0 }}
                     transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                     style={{ transformOrigin: "center" }}
                  >
                     <p className="text-red-900 font-serif font-bold text-center leading-relaxed whitespace-pre-wrap">
                        "{segments[currentIndex]}"
                     </p>
                  </motion.div>

                  {/* The Cookie Left Half */}
                  <motion.div 
                     className="absolute w-32 h-48 bg-amber-600 rounded-l-[100px] rounded-r-lg border-r-4 border-amber-800/50 shadow-2xl cursor-pointer flex items-center justify-center overflow-hidden"
                     style={{ 
                        left: "50%", 
                        x: "-100%",
                        backgroundColor: primaryColor,
                        boxShadow: "inset 10px 0 20px rgba(0,0,0,0.2)"
                     }}
                     animate={{
                        x: isBroken ? "-150%" : "-100%",
                        rotate: isBroken ? -20 : 0,
                        scale: isBroken ? 0.9 : 1 + (tapCount * 0.02)
                     }}
                     onClick={handleTap}
                     whileTap={{ scale: 0.95 }}
                  >
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noisy-grid.png')] mix-blend-overlay opacity-30" />
                     {/* Crease line */}
                     <div className="absolute right-0 h-full w-4 bg-amber-800/20 rounded-l-full blur-[2px]" />
                  </motion.div>

                  {/* The Cookie Right Half */}
                  <motion.div 
                     className="absolute w-32 h-48 bg-amber-600 rounded-r-[100px] rounded-l-lg border-l-4 border-amber-800/50 shadow-2xl cursor-pointer flex items-center justify-center overflow-hidden"
                     style={{ 
                        left: "50%", 
                        x: "0%",
                        backgroundColor: primaryColor,
                        boxShadow: "inset -10px 0 20px rgba(0,0,0,0.2)"
                     }}
                     animate={{
                        x: isBroken ? "50%" : "0%",
                        rotate: isBroken ? 20 : 0,
                        scale: isBroken ? 0.9 : 1 + (tapCount * 0.02)
                     }}
                     onClick={handleTap}
                     whileTap={{ scale: 0.95 }}
                  >
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noisy-grid.png')] mix-blend-overlay opacity-30" />
                     {/* Crease line */}
                     <div className="absolute left-0 h-full w-4 bg-amber-800/20 rounded-r-full blur-[2px]" />
                  </motion.div>

               </div>
            ) : (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
               >
                  <h2 className="text-2xl font-bold text-white mb-4">No more cookies.</h2>
                  <p className="text-red-200">The plate is empty.</p>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Next Button */}
         <div className="mt-24 h-16 flex items-center justify-center">
            <AnimatePresence>
               {isBroken && currentIndex < segments.length - 1 && (
                  <motion.button
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     onClick={handleNext}
                     className="px-8 py-4 bg-white text-red-900 font-black uppercase tracking-widest rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none hover:bg-gray-100 transition-all"
                  >
                     Next Cookie
                  </motion.button>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* Shake instruction */}
      {!isBroken && currentIndex < segments.length && (
         <div className="absolute bottom-12 text-center w-full animate-bounce pointer-events-none">
            <p className="text-white/60 font-bold uppercase tracking-widest text-sm">
               Tap to Break!
            </p>
         </div>
      )}

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isBroken && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setTapCount(requiredTaps);
                  setIsBroken(true);
                  if (currentIndex === segments.length - 1 && onComplete) {
                     onComplete();
                  }
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Crack (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
