"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const TOTAL_HEIGHT_PX = 200000; // 200,000px height to enforce a long scroll.
const MARATHON_MILES = 26.2;

export function MarathonScroll({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFinished, setHasFinished] = useState(false);

  const { scrollYProgress } = useScroll({
     container: containerRef
  });

  // Smooth out the progress reading for the HUD
  const smoothProgress = useSpring(scrollYProgress, {
     stiffness: 100,
     damping: 30,
     restDelta: 0.001
  });

  const currentMile = useTransform(smoothProgress, [0, 1], [0, MARATHON_MILES]);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316"; // Orange 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff7ed"]; // Orange 50

  useEffect(() => {
     // Listen for scroll progress reaching the absolute bottom (1.0)
     const unsubscribe = scrollYProgress.on("change", (latest) => {
        if (latest >= 0.999 && !hasFinished) {
           setHasFinished(true);
           if (onComplete) {
              setTimeout(onComplete, 5000);
           }
        }
     });

     return () => unsubscribe();
  }, [scrollYProgress, hasFinished, onComplete]);

  const handleTeleport = () => {
     if (containerRef.current) {
        containerRef.current.scrollTo({
           top: TOTAL_HEIGHT_PX,
           behavior: "smooth"
        });
     }
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden bg-zinc-900">
      
      {/* 
         The Scroll Container
         Must be absolute inset-0 and overflow-y-scroll to allow useScroll to track it properly
         since the parent ExperienceHost might restrict scrolling.
      */}
      <div 
         ref={containerRef}
         className="absolute inset-0 overflow-y-auto overflow-x-hidden scroll-smooth"
      >
         {/* The massive scroll track */}
         <div 
            style={{ height: `${TOTAL_HEIGHT_PX}px`, backgroundColor: bgColors[0] }} 
            className="w-full relative"
         >
            
            {/* Start Line */}
            <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center pointer-events-none">
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-zinc-900">
                  The Marathon
               </h1>
               <div className="w-24 h-2 bg-zinc-900 mb-8" />
               <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase">
                  Scroll {MARATHON_MILES} Miles to unlock the message.
               </p>
               <motion.div 
                  className="mt-16 text-zinc-400"
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               >
                  ↓
               </motion.div>
            </div>

            {/* Subtle Mile Markers scattered down the track */}
            {Array.from({ length: 26 }).map((_, i) => {
               const mile = i + 1;
               const topPercentage = (mile / MARATHON_MILES) * 100;
               return (
                  <div 
                     key={mile}
                     className="absolute w-full flex flex-col items-center justify-center opacity-10 pointer-events-none"
                     style={{ top: `${topPercentage}%` }}
                  >
                     <div className="w-32 h-[1px] bg-zinc-900 mb-2" />
                     <div className="font-mono text-4xl font-black text-zinc-900">
                        Mile {mile}
                     </div>
                  </div>
               );
            })}

            {/* Finish Line (The Payload) */}
            <div className="absolute bottom-0 left-0 w-full h-screen flex flex-col items-center justify-center">
               
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ root: containerRef, margin: "0px 0px -200px 0px" }}
                  transition={{ duration: 1 }}
                  className="text-center p-8 max-w-2xl"
               >
                  <div className="text-sm font-bold tracking-[0.3em] uppercase mb-8" style={{ color: primaryColor }}>
                     Finish Line Reached
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 text-zinc-900">
                     {config.title}
                  </h1>
                  
                  <p className="text-2xl font-serif leading-relaxed text-zinc-700">
                     {config.body}
                  </p>

                  <div className="mt-16 font-mono text-zinc-400 text-xs">
                     Distance Traveled: 200,000 pixels.
                  </div>
               </motion.div>

            </div>

         </div>
      </div>

      {/* Fixed HUD Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-black/10 flex items-center gap-4 z-40 pointer-events-none">
         <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
            Progress
         </div>
         <div className="font-mono font-black text-xl" style={{ color: primaryColor }}>
            <motion.span>{currentMile}</motion.span> / 26.2
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !hasFinished && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Scroll
            </h2>
            <button 
               onClick={handleTeleport}
               className="w-full bg-white text-black text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-zinc-200 transition-colors"
            >
               Teleport to Finish Line
            </button>
         </div>
      )}

      {/* Confetti overlay upon finish */}
      {hasFinished && (
         <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
               <motion.div 
                  key={i}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{ 
                     backgroundColor: i % 2 === 0 ? primaryColor : "#3b82f6",
                     left: `${Math.random() * 100}%`,
                     top: "-5%"
                  }}
                  animate={{ 
                     y: ["0vh", "110vh"],
                     rotate: [0, Math.random() * 360 + 360],
                     x: [0, (Math.random() - 0.5) * 100]
                  }}
                  transition={{ 
                     duration: Math.random() * 3 + 2, 
                     repeat: Infinity,
                     delay: Math.random() * 2
                  }}
               />
            ))}
         </div>
      )}
      
    </div>
  );
}
