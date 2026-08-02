"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

type StoryBeat = {
   depthProgress: number; // 0 to 1, where it should appear
   text: string;
   type: "fish" | "jelly" | "angler";
};

const STORY_BEATS: StoryBeat[] = [
   { depthProgress: 0.1, text: "The surface gets further away...", type: "fish" },
   { depthProgress: 0.25, text: "It's getting darker down here.", type: "fish" },
   { depthProgress: 0.45, text: "The pressure builds.", type: "jelly" },
   { depthProgress: 0.7, text: "Almost no light reaches this far.", type: "jelly" },
   { depthProgress: 0.85, text: "Are you sure you want to go deeper?", type: "angler" },
];

export function SubmarineDescent({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // Sky 500
  // Instead of static bgColors, we interpolate based on scroll.
  const surfaceColor = primaryColor;
  const twilightColor = "#1e3a8a"; // Blue 900
  const abyssColor = "#000000";

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within the tall container
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Map scroll progress to background color
  const backgroundColor = useTransform(
     scrollYProgress,
     [0, 0.4, 0.9],
     [surfaceColor, twilightColor, abyssColor]
  );
  
  // Map scroll progress to a depth meter (0m to -10994m)
  const depthValue = useTransform(scrollYProgress, [0, 1], [0, 10994]);
  // We need state to render the number
  const [currentDepth, setCurrentDepth] = useState(0);

  useEffect(() => {
     return depthValue.onChange((v) => setCurrentDepth(Math.floor(v)));
  }, [depthValue]);

  // When the bottom is reached, trigger win
  const isBottomInView = useInView(bottomRef, { root: containerRef, amount: 0.5 });

  useEffect(() => {
     if (gameState === "playing" && isBottomInView) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  }, [isBottomInView, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: "#020617" }} // Outer hull color
    >
      
      {/* Game Viewport Container - The "Porthole" */}
      <motion.div 
         className={`relative w-[320px] h-[480px] rounded-[50px] border-[12px] border-[#334155] shadow-[inset_0_0_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-[2px] pointer-events-none" : "scale-100"}`}
         style={{ backgroundColor }}
      >
         
         {/* Floating Bubbles Overlay (Fixed) */}
         <div className="absolute inset-0 pointer-events-none z-10 flex justify-around">
            {[...Array(5)].map((_, i) => (
               <motion.div 
                  key={i}
                  className="w-2 h-2 rounded-full border border-white/30"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "-100%", opacity: [0, 1, 0] }}
                  transition={{ 
                     duration: 3 + Math.random() * 2, 
                     repeat: Infinity, 
                     delay: Math.random() * 5,
                     ease: "linear"
                  }}
                  style={{ x: Math.random() * 40 - 20 }}
               />
            ))}
         </div>

         {/* Fixed HUD Overlay */}
         {gameState === "playing" && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
               <div className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-white font-mono text-xs shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  DEPTH: -{currentDepth.toLocaleString()}m
               </div>
            </div>
         )}

         {/* The Scrollable Ocean Column */}
         <div 
            ref={containerRef}
            className="w-full h-full overflow-y-auto no-scrollbar relative z-20"
         >
            {/* The actual height of the ocean (400vh equivalent) */}
            <div className="w-full relative" style={{ height: "4000px" }}>
               
               {/* Surface gradient hint */}
               <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/20 to-transparent" />

               {/* Story Beats scattered down the column */}
               {STORY_BEATS.map((beat, i) => (
                  <div 
                     key={i} 
                     className="absolute w-full px-8 flex justify-center text-center"
                     style={{ top: `${beat.depthProgress * 100}%` }}
                  >
                     {/* 
                        Use framer-motion whileInView to fade them in as we scroll past. 
                        They are part of the scrolling content, so they move up.
                     */}
                     <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ root: containerRef, margin: "-100px 0px -100px 0px" }}
                        transition={{ duration: 1 }}
                        className="flex flex-col items-center gap-4"
                     >
                        {beat.type === "fish" && (
                           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><path d="M12 4c-5 0-9 4-9 8s4 8 9 8c3.5 0 6.5-1.5 8-4l3 1v-10l-3 1c-1.5-2.5-4.5-4-8-4z"/><circle cx="15" cy="10" r="1"/></svg>
                        )}
                        {beat.type === "jelly" && (
                           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><path d="M6 12v3a2 2 0 0 0 2 2v2"/><path d="M10 12v5a2 2 0 0 0 2 2v2"/><path d="M14 12v5a2 2 0 0 1-2 2v2"/><path d="M18 12v3a2 2 0 0 1-2 2v2"/></svg>
                        )}
                        {beat.type === "angler" && (
                           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"><circle cx="5" cy="5" r="2" fill="yellow"/><path d="M7 5h4a6 6 0 0 1 6 6v1l5 2v-4l-5 2c-1.5-2-4-3-6-3h-4"/><path d="M11 11c-4 0-7 3-7 6s3 6 7 6 6-2.5 7-5l4 1v-8l-4 1c-1-2.5-4-5-7-5z"/><circle cx="14" cy="15" r="1"/></svg>
                        )}
                        <p className="text-white/80 font-serif italic text-sm drop-shadow-md">
                           {beat.text}
                        </p>
                     </motion.div>
                  </div>
               ))}

               {/* The Ocean Floor (Trigger for Win State) */}
               <div 
                  ref={bottomRef} 
                  className="absolute bottom-0 left-0 w-full h-[400px] flex flex-col justify-center items-center pointer-events-none"
               >
                  <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center animate-pulse mb-4">
                     <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest font-mono">
                     Trench Floor
                  </div>
               </div>

            </div>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-12 h-12 mb-6 text-white animate-bounce">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-white">
                     The Descent
                  </h2>
                  <p className="text-xs text-white/80 mb-12 text-center px-8 leading-relaxed font-sans">
                     Scroll down to dive into the abyss and uncover what lies beneath.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded uppercase tracking-widest text-[10px] font-bold text-white shadow-lg active:scale-95 transition-all bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30"
                  >
                     Begin Dive
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </motion.div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 2 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative"
                  initial={{ scale: 0.9, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  {/* Bioluminescent glow effect behind the text */}
                  <div 
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[60px] opacity-30 pointer-events-none"
                     style={{ backgroundColor: primaryColor }}
                  />

                  <div className="font-mono text-[10px] text-white/50 tracking-[0.3em] uppercase mb-8">
                     Discovery Log
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-serif text-white mb-8 leading-tight tracking-wide">
                     {config.title}
                  </h1>
                  
                  <p className="text-sm leading-loose font-sans font-light text-white/80 border-l border-white/20 pl-4 text-left">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 flex flex-col items-center shadow-2xl z-50 rounded-lg pointer-events-auto">
            <h2 className="text-slate-400 font-sans font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Scroll
            </h2>
            <button 
               onClick={() => {
                  if (containerRef.current) {
                     containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
                  }
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-2 rounded-md active:scale-95 transition-transform shadow-md border border-white/10"
               style={{ backgroundColor: twilightColor }}
            >
               Dive to Bottom
            </button>
         </div>
      )}
      
    </div>
  );
}
