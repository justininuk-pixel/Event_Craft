"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export function ParallaxDeepDive({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#06b6d4"; // Cyan 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#083344"]; // Cyan 950

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
     container: scrollRef
  });

  // Map 0 -> 1 scroll progress to 0 -> 5000px depth
  const depthTransform = useTransform(scrollYProgress, [0, 1], [0, 5000]);

  useEffect(() => {
     // Check if reached end
     const unsubscribe = scrollYProgress.onChange(v => {
        if (v > 0.99 && gameState === "playing") {
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

  // Layers positioned at specific Z depths
  const layers = [
     { z: 0, content: <div className="text-4xl font-black text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Welcome</div> },
     { z: -1000, content: <div className="text-6xl text-cyan-400 rotate-12 blur-[1px]">★</div> },
     { z: -1500, content: <div className="text-xl text-white italic bg-black/50 p-4 rounded-xl backdrop-blur-sm border border-white/10">The deeper you go...</div> },
     { z: -2500, content: <div className="text-8xl text-pink-500/50 -rotate-12 blur-[2px]">✦</div> },
     { z: -3500, content: <div className="text-2xl text-white font-bold tracking-[0.5em] uppercase">The closer you get</div> },
     { z: -4500, content: <div className="w-32 h-32 border-4 rounded-full flex items-center justify-center animate-pulse" style={{ borderColor: primaryColor }}><div className="text-white text-xs tracking-widest">GATE</div></div> },
  ];

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-slate-950 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Starfield/Particles (Fixed) */}
         <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

         {/* 3D Scene Wrapper */}
         <div className="absolute inset-0 overflow-hidden" style={{ perspective: '800px' }}>
            
            {/* The Camera Container that moves forward */}
            <motion.div 
               className="w-full h-full transform-style-preserve-3d"
               style={{ z: depthTransform }}
            >
               {/* Elements placed at negative Z */}
               {layers.map((layer, i) => {
                  // To fade out elements as they pass behind the camera, we can use useTransform
                  // Element passes camera when depthTransform (Camera Z) > absolute(layer.z)
                  const fadeOutZ = Math.abs(layer.z) - 100;
                  const passedZ = Math.abs(layer.z) + 100;
                  
                  const opacity = useTransform(
                     depthTransform, 
                     [0, fadeOutZ, passedZ], 
                     [1, 1, 0]
                  );

                  return (
                     <motion.div
                        key={i}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                           transform: `translateZ(${layer.z}px)`,
                           opacity 
                        }}
                     >
                        {layer.content}
                     </motion.div>
                  );
               })}
            </motion.div>
         </div>

         {/* Foreground Scroll Container (Invisible, intercepts touch/wheel) */}
         {gameState === "playing" && (
            <div 
               ref={scrollRef}
               className="absolute inset-0 overflow-y-auto overflow-x-hidden z-20 snap-y snap-mandatory scroll-smooth"
               style={{ WebkitOverflowScrolling: 'touch' }}
            >
               {/* 
                 A very tall invisble div to create native scroll events.
                 At 400vh, the user must swipe/scroll significantly to reach the bottom.
               */}
               <div style={{ height: '400vh' }}>
                  {/* Scroll Instruction Hint */}
                  <div className="sticky top-[80%] left-0 w-full flex justify-center pointer-events-none opacity-50 animate-bounce">
                     <div className="flex flex-col items-center gap-1 text-white">
                        <span className="text-xs uppercase tracking-widest font-bold">Scroll Down</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Dive
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Scroll to travel deeper into the void.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Begin Descent
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
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-slate-900 border border-slate-800 p-10 md:p-14 rounded-2xl max-w-2xl w-full text-center shadow-[0_0_100px_rgba(6,182,212,0.2)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.3, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  <div className="font-bold uppercase tracking-[0.3em] mb-6 text-[10px]" style={{ color: primaryColor }}>You have arrived</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-300 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Dive Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
