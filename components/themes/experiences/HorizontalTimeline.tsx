"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";

type TimelineEvent = {
   year: string;
   title: string;
   text: string;
};

const EVENTS: TimelineEvent[] = [
   { year: "1994", title: "The Foundation", text: "Before the digital age consumed us, we laid the groundwork in analog silence." },
   { year: "2002", title: "First Contact", text: "The signal broke through the noise. It was faint, but undeniable." },
   { year: "2015", title: "The Divergence", text: "They said it was a mistake. We knew it was the next step in evolution." },
   { year: "2026", title: "Convergence", text: "The timeline caught up with us. The payload is finally ready." },
];

export function HorizontalTimeline({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // Sky 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // Slate 100

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track horizontal scroll progress
  const { scrollXProgress } = useScroll({ container: scrollRef });
  
  // Smooth it out for the progress bar
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Intercept vertical wheel scrolling and translate to horizontal
  useEffect(() => {
     const container = scrollRef.current;
     if (!container) return;

     const handleWheel = (e: WheelEvent) => {
        // If the user scrolls vertically (deltaY != 0), we want to scroll the container horizontally
        if (e.deltaY !== 0) {
           e.preventDefault();
           container.scrollLeft += e.deltaY;
        }
     };

     // { passive: false } is required to preventDefault
     container.addEventListener("wheel", handleWheel, { passive: false });
     return () => container.removeEventListener("wheel", handleWheel);
  }, [gameState]);

  // Check win condition
  useEffect(() => {
     if (gameState !== "playing") return;
     const unsubscribe = scrollXProgress.on("change", (latest) => {
        if (latest > 0.98) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     });
     return () => unsubscribe();
  }, [scrollXProgress, gameState]);

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
         className={`relative w-[320px] h-[480px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Top Progress Bar */}
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-20">
            <motion.div 
               className="h-full origin-left"
               style={{ scaleX, backgroundColor: primaryColor }}
            />
         </div>

         {/* The Horizontal Scroll Canvas */}
         <div 
            ref={scrollRef}
            className="absolute inset-0 overflow-x-auto overflow-y-hidden no-scrollbar flex"
            style={{ 
               scrollBehavior: 'smooth',
               // Need to enable momentum scrolling on iOS
               WebkitOverflowScrolling: 'touch',
               // Snapping can make it feel more cohesive
               scrollSnapType: 'x mandatory'
            }}
         >
            {/* The extremely wide content layer */}
            {/* We pad the end so the user has to scroll past the last item to hit 1.0 progress */}
            <div className="flex h-full items-center relative pr-[80vw]">
               
               {/* Background Timeline Axis / Ruler */}
               <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-slate-200" />

               {/* Events */}
               {EVENTS.map((ev, i) => (
                  <div 
                     key={i}
                     className="w-[280px] shrink-0 h-full flex flex-col justify-end pb-16 px-6 relative"
                     style={{ scrollSnapAlign: 'center' }}
                  >
                     {/* The Content Card */}
                     <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-sm mb-12 relative">
                        {/* Connecting Line to Timeline */}
                        <div className="absolute -bottom-12 left-6 w-[2px] h-12 bg-slate-200" />
                        
                        <h3 className="font-black text-slate-800 text-lg mb-2">{ev.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{ev.text}</p>
                     </div>

                     {/* The Timeline Marker */}
                     <div className="absolute bottom-[60px] left-10 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: primaryColor }} />
                        <span className="mt-2 font-mono font-bold text-slate-400 text-xs">{ev.year}</span>
                     </div>
                  </div>
               ))}

               {/* The Final Destination Marker (Empty space) */}
               <div className="w-[100px] shrink-0 h-full flex flex-col justify-end pb-16 relative">
                  <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30">
                     <div className="w-4 h-4 rounded-full border-4 border-white bg-slate-300 z-10 animate-pulse" />
                     <span className="mt-2 font-mono font-bold text-slate-400 text-[10px] uppercase tracking-widest">End</span>
                  </div>
               </div>

            </div>
         </div>

         {/* Scroll Hint */}
         {gameState === "playing" && (
            <motion.div 
               style={{ opacity: useTransform(scrollXProgress, [0, 0.1], [1, 0]) }}
               className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none z-30"
            >
               <span className="text-[10px] uppercase tracking-widest font-bold bg-white/80 text-slate-500 backdrop-blur-md px-3 py-1 rounded-full animate-bounce shadow-sm border border-slate-200">
                  Swipe Left to Travel
               </span>
            </motion.div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-slate-800">
                     Chronicle
                  </h2>
                  <p className="text-xs text-slate-500 mb-12 text-center px-8 leading-relaxed">
                     Travel across the horizontal axis of time to unlock the payload.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Begin Journey
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden rounded-2xl"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 50 }}
               >
                  <div className="font-mono uppercase tracking-[0.3em] mb-4 text-[10px] text-slate-400">Present Day</div>
                  <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight text-slate-800 tracking-tight">
                     {config.title}
                  </h1>
                  <div className="w-12 h-[2px] mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg leading-relaxed text-slate-600">
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
               Auto-Scroll Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
