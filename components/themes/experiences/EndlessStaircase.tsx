"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
   "The air grows thin. You've been climbing for hours.",
   "Each step is a monolith of dark stone, worn smooth by centuries of desperate ascents.",
   "You look down. The ground is lost in a sea of thick, churning fog.",
   "Your lungs burn. The silence is absolute, save for the scrape of your boots.",
   "Why did you start this climb? The memory is slipping.",
   "Just one more step. And then another.",
   "The fog begins to thin above. A pale light bleeds through.",
   "You reach out. Your hand finds not stone, but a heavy wooden door."
];

export function EndlessStaircase({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8"; // Slate 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<"start" | "climbing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // We need to snap the user to the bottom of the scroll container right when climbing starts
  useEffect(() => {
     if (gameState === "climbing" && containerRef.current) {
        // Wait a tiny bit for the DOM to fully render the tall content
        setTimeout(() => {
           if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
           }
        }, 50);
     }
  }, [gameState]);

  const handleScroll = () => {
     if (gameState !== "climbing" || !containerRef.current) return;
     
     // Check if we reached the top
     if (containerRef.current.scrollTop <= 10) { // small buffer
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-[#1a1a1a] rounded-sm shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-[2px] pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Fog Gradient */}
         <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-[#1a1a1a] to-white/10 pointer-events-none" />

         {/* The Climb Container */}
         <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-auto overflow-x-hidden relative z-10 no-scrollbar"
            style={{ 
               // Only enable scrolling during active game state
               pointerEvents: gameState === "climbing" ? "auto" : "none" 
            }}
         >
            
            {/* The structural padding to force scrolling. 
                We use flex-col-reverse so the array maps from bottom to top. 
            */}
            <div className="w-full min-h-[400vh] flex flex-col-reverse justify-start pb-48 pt-48 items-center relative">
               
               {/* Center line (the edge of the stairs) */}
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />

               {STEPS.map((step, index) => {
                  // To simulate perspective, we could alternate left/right, 
                  // or just center them with generous vertical spacing.
                  return (
                     <div 
                        key={index} 
                        className="w-full min-h-[50vh] flex items-center justify-center relative px-8"
                     >
                        {/* Step Visual indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        <p 
                           className="text-center font-serif text-white/80 text-sm leading-loose relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        >
                           {step}
                        </p>
                     </div>
                  );
               })}

               {/* The final destination (Top of the mountain/stairs) */}
               <div className="w-full min-h-[50vh] flex items-center justify-center relative">
                  <div className="w-24 h-32 border-2 border-white/20 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                     <div className="w-full h-full bg-gradient-to-t from-transparent to-white/40" />
                  </div>
               </div>

            </div>

         </div>

         {/* Scroll Indicator (When at bottom) */}
         <AnimatePresence>
            {gameState === "climbing" && (
               <motion.div 
                  className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Scroll Up</div>
                  <motion.div 
                     className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
                     animate={{ y: [-10, 0, -10], opacity: [0.2, 1, 0.2] }}
                     transition={{ duration: 2, repeat: Infinity }}
                  />
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1.5 } }}
               >
                  <div className="flex flex-col gap-1 mb-8 opacity-40">
                     <div className="w-8 h-1 bg-white ml-4" />
                     <div className="w-8 h-1 bg-white ml-2" />
                     <div className="w-8 h-1 bg-white ml-0" />
                  </div>
                  
                  <h2 className="uppercase tracking-[0.3em] font-light mb-4 text-xl text-white font-mono">
                     The Ascent
                  </h2>
                  <p className="text-xs text-white/50 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Gravity pulls downwards. To read the story, you must fight it and climb upwards.
                  </p>
                  <button 
                     onClick={() => setGameState("climbing")}
                     className="px-8 py-3 uppercase tracking-widest text-[10px] font-bold text-black bg-white/90 hover:bg-white active:scale-95 transition-all shadow-xl"
                  >
                     Begin Climb
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/5 backdrop-blur-xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center bg-zinc-900 border border-white/10 p-8 shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  <div className="font-mono text-[10px] text-white/30 tracking-[0.3em] uppercase mb-8">
                     The Summit
                  </div>

                  <h1 className="text-2xl font-serif text-white mb-8 leading-tight tracking-wide">
                     {config.title}
                  </h1>
                  
                  <p className="text-sm leading-loose font-sans font-light text-white/70">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "climbing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/90 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Climb
            </h2>
            <button 
               onClick={() => {
                  if (containerRef.current) {
                     // Animate to top
                     containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md bg-white"
            >
               Helicopter Ride
            </button>
         </div>
      )}
      
    </div>
  );
}
