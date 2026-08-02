"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type AgeEra = "modern" | "retro";

export function NostalgiaFilter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [actualEra, setActualEra] = useState<AgeEra>("modern");
  const [simulatedEra, setSimulatedEra] = useState<AgeEra | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";

  useEffect(() => {
     // In a real implementation, we would compare Date.now() against config.createdAt (if available)
     // For this demo, we assume the link is "fresh" and thus modern, unless simulated.
     setActualEra("modern");
  }, []);

  const activeEra = simulatedEra || actualEra;

  useEffect(() => {
     if (onComplete) {
        // Complete after a 10 second viewing period for the demo
        const timer = setTimeout(onComplete, 10000);
        return () => clearTimeout(timer);
     }
  }, [activeEra, onComplete]);

  return (
    <div className="w-full h-full relative overflow-hidden transition-all duration-0">
      
      <AnimatePresence mode="wait">
         {activeEra === "modern" ? (
            <motion.div 
               key="modern-view"
               className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-50 text-zinc-900 font-sans"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
            >
               {/* Modern Sleek UI */}
               <div className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl p-12 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 text-center relative overflow-hidden">
                  
                  {/* Subtle modern gradient blob */}
                  <div 
                     className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none"
                     style={{ backgroundColor: primaryColor }}
                  />

                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-semibold mb-6">
                     Modern Architecture Rendering
                  </div>

                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ color: primaryColor }}>
                     {config.title}
                  </h1>

                  <p className="text-lg md:text-xl text-zinc-600 leading-relaxed font-medium">
                     {config.body}
                  </p>

                  <div className="mt-12 pt-6 border-t border-zinc-200">
                     <button 
                        className="px-8 py-3 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                        style={{ backgroundColor: primaryColor }}
                     >
                        Continue
                     </button>
                  </div>
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="retro-view"
               className="absolute inset-0 p-8 overflow-y-auto"
               style={{ 
                  backgroundColor: "#000080", // Classic Navy Blue
                  fontFamily: '"Times New Roman", Times, serif',
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')", // Mock starry background
                  color: "#ffff00" // Classic bright yellow
               }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.1 }} // Immediate cut, no smooth fading in 1999
            >
               {/* 1999 Geocities Retro UI */}
               <div className="w-full max-w-4xl mx-auto border-[10px] border-double border-red-500 bg-black p-8 text-center mt-8">
                  
                  {/* Custom CSS marquee to satisfy TypeScript instead of the deprecated marquee tag */}
                  <style>
                     {`
                        @keyframes marquee {
                           0% { transform: translateX(100%); }
                           100% { transform: translateX(-100%); }
                        }
                     `}
                  </style>
                  <div className="overflow-hidden bg-red-900 py-2 border-2 border-green-400 mb-8 whitespace-nowrap">
                     <div 
                        className="text-3xl font-bold text-green-400 tracking-widest inline-block"
                        style={{ animation: 'marquee 10s linear infinite' }}
                     >
                        *** WELCOME TO MY HOMEPAGE ***
                     </div>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold mb-8 underline" style={{ textShadow: "4px 4px 0px red" }}>
                     {config.title}
                  </h1>

                  <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 mb-8" />

                  <p className="text-2xl leading-loose font-bold mb-12">
                     {config.body}
                  </p>

                  <div className="w-full h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 mb-8" />

                  <div className="flex flex-col items-center gap-4 mt-12">
                     <div className="text-sm font-bold text-white uppercase bg-blue-800 px-4 py-1 border-2 border-white border-outset cursor-pointer hover:bg-blue-700 active:border-inset">
                        Click Here To Enter!
                     </div>

                     <div className="mt-8 text-cyan-300 font-bold border-t border-dashed border-cyan-300 pt-4">
                        You are visitor number:
                        <div className="font-mono text-4xl bg-black text-red-500 border-4 border-gray-500 inline-block px-4 py-1 ml-4 shadow-[inset_0_0_10px_rgba(0,0,0,1)] tracking-widest">
                           001337
                        </div>
                     </div>
                     <div className="text-[10px] text-gray-500 mt-4">
                        Best viewed in Netscape Navigator 4.0 at 800x600 resolution.
                     </div>
                  </div>

               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Time Machine
            </h2>
            <div className="flex w-full gap-2">
               <button 
                  onClick={() => setSimulatedEra("modern")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border ${
                     activeEra === "modern" ? "bg-white text-black border-white" : "bg-transparent text-white/60 border-white/20 hover:bg-white/10"
                  }`}
               >
                  Brand New
               </button>
               <button 
                  onClick={() => setSimulatedEra("retro")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border ${
                     activeEra === "retro" ? "bg-red-600 text-yellow-300 border-red-500 font-serif" : "bg-transparent text-white/60 border-white/20 hover:bg-white/10"
                  }`}
               >
                  5 Years Old
               </button>
            </div>
         </div>
      )}
      
    </div>
  );
}
