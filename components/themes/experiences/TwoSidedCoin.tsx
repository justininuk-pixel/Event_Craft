"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const STORY_A = [
   "I saw her standing by the door. She looked terrified.",
   "I tried to approach, to offer help, but she stepped back.",
   "When the lights flickered, she reached into her coat.",
   "I had no choice. I had to run."
];

const STORY_B = [
   "He was staring at me again. Unblinking. Cold.",
   "He took a step forward. I tried to put distance between us.",
   "The power failed. In a panic, I reached for my flashlight.",
   "When the lights came back, he was gone."
];

export function TwoSidedCoin({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // We use a single invisible scroll container on top to drive both visual faces
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  
  // Transform scroll progress to visual Y translation for the content
  // Content height is large, so we move it up as we scroll
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  // Detect when scroll reaches bottom
  useEffect(() => {
     if (gameState !== "playing") return;
     const unsubscribe = scrollYProgress.on("change", (latest) => {
        if (latest > 0.99) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     });
     return () => unsubscribe();
  }, [scrollYProgress, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0], perspective: 1200 }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-2xl shadow-2xl transition-all duration-1000 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ transformStyle: 'preserve-3d' }}
      >
         
         {/* 3D Flipping Card */}
         <motion.div 
            className="absolute inset-0 rounded-2xl"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
         >
            
            {/* Side A (Front) */}
            <div 
               className="absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col items-center justify-start p-8 shadow-inner"
               style={{ backfaceVisibility: 'hidden' }}
            >
               <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-12">Perspective A</div>
               
               <motion.div className="flex flex-col gap-12 w-full" style={{ y: contentY }}>
                  {STORY_A.map((text, i) => (
                     <p key={i} className="text-xl font-serif text-slate-800 leading-relaxed text-center">
                        {text}
                     </p>
                  ))}
                  {/* Padding at bottom for scroll effect */}
                  <div className="h-48" />
               </motion.div>
            </div>

            {/* Side B (Back) */}
            <div 
               className="absolute inset-0 bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-start p-8 shadow-inner"
               style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
               <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-12">Perspective B</div>
               
               <motion.div className="flex flex-col gap-12 w-full" style={{ y: contentY }}>
                  {STORY_B.map((text, i) => (
                     <p key={i} className="text-xl font-serif text-slate-200 leading-relaxed text-center">
                        {text}
                     </p>
                  ))}
                  {/* Padding at bottom for scroll effect */}
                  <div className="h-48" />
               </motion.div>
            </div>
         </motion.div>

         {/* Invisible Scroll Driver (Overlay) */}
         {gameState === "playing" && (
            <div 
               ref={scrollRef}
               className="absolute inset-0 z-20 overflow-y-auto no-scrollbar"
            >
               {/* Extremely tall invisible div to force scroll height */}
               <div style={{ height: "300%" }} />
            </div>
         )}

         {/* Flip Button (Fixed UI outside the 3D card but visually inside the viewport) */}
         {gameState === "playing" && (
            <button 
               onClick={() => setIsFlipped(!isFlipped)}
               className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center border border-white/40 transition-colors active:scale-95"
               style={{ color: isFlipped ? '#fff' : '#0f172a' }}
            >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            </button>
         )}

         {/* Scroll Hint */}
         {gameState === "playing" && (
            <motion.div 
               style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
               className="absolute bottom-24 left-0 w-full flex justify-center pointer-events-none z-30"
            >
               <span className="text-[10px] uppercase tracking-widest font-bold bg-black/20 text-white backdrop-blur-md px-3 py-1 rounded-full animate-bounce">
                  Scroll Down
               </span>
            </motion.div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-white">
                     Dual Perspective
                  </h2>
                  <p className="text-xs text-white/70 mb-12 text-center px-8 uppercase tracking-widest leading-relaxed">
                     Scroll to read. Spin the card to see the other side.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Begin Reading
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden rounded-2xl"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="font-sans uppercase tracking-[0.3em] mb-4 text-[10px] text-slate-400">The Truth</div>
                  <h1 className="text-3xl md:text-4xl font-serif mb-6 leading-tight text-slate-900">
                     {config.title}
                  </h1>
                  <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg leading-relaxed font-sans text-slate-600">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-500 font-sans font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-3 rounded-xl active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Read Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
