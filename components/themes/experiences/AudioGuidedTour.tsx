"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type TourSlide = {
   time: number; // Start time in seconds
   text: string;
   color: string;
};

// 20-second guided tour
const TIMELINE: TourSlide[] = [
   { time: 0, text: "Breathe in.", color: "#1e1b4b" }, // indigo-950
   { time: 4, text: "Let the tension go.", color: "#312e81" }, // indigo-900
   { time: 8, text: "Listen to the silence.", color: "#064e3b" }, // emerald-950
   { time: 12, text: "You are exactly where you need to be.", color: "#022c22" }, // emerald-900
   { time: 17, text: "Open your eyes.", color: "#0f172a" }, // slate-900
];

const TOTAL_DURATION = 20;

export function AudioGuidedTour({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#a855f7"; // Purple 500

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);
  const reqRef = useRef<number>(0);
  const isBypassed = useRef(false);

  // Procedural audio generation
  const startAudio = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     const ctx = audioCtxRef.current;
     if (ctx.state === 'suspended') {
        ctx.resume();
     }

     // Create a soothing drone
     const osc1 = ctx.createOscillator();
     const osc2 = ctx.createOscillator();
     const gain = ctx.createGain();
     const filter = ctx.createBiquadFilter();

     osc1.type = 'sine';
     osc2.type = 'triangle';
     
     // Deep drone frequencies
     osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
     osc2.frequency.setValueAtTime(65.41 * 1.01, ctx.currentTime); // Slight detune
     
     // Slowly rise pitch at 10s
     osc1.frequency.linearRampToValueAtTime(130.81, ctx.currentTime + 10); // C3
     osc2.frequency.linearRampToValueAtTime(130.81 * 1.01, ctx.currentTime + 10);

     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(400, ctx.currentTime);
     filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 20);

     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // Fade in
     gain.gain.setValueAtTime(0.3, ctx.currentTime + TOTAL_DURATION - 2);
     gain.gain.linearRampToValueAtTime(0, ctx.currentTime + TOTAL_DURATION); // Fade out

     osc1.connect(filter);
     osc2.connect(filter);
     filter.connect(gain);
     gain.connect(ctx.destination);

     osc1.start();
     osc2.start();
     osc1.stop(ctx.currentTime + TOTAL_DURATION + 1);
     osc2.stop(ctx.currentTime + TOTAL_DURATION + 1);
     
     return ctx;
  };

  const updateLoop = () => {
     if (!audioCtxRef.current || isBypassed.current) return;
     
     const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
     setProgress(Math.min(elapsed / TOTAL_DURATION, 1));
     
     // Find the correct slide
     let newIndex = 0;
     for (let i = 0; i < TIMELINE.length; i++) {
        if (elapsed >= TIMELINE[i].time) {
           newIndex = i;
        }
     }
     
     if (newIndex !== currentSlideIndex) {
        setCurrentSlideIndex(newIndex);
     }

     if (elapsed >= TOTAL_DURATION) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        reqRef.current = requestAnimationFrame(updateLoop);
     }
  };

  const handleStart = () => {
     setGameState("playing");
     const ctx = startAudio();
     startTimeRef.current = ctx.currentTime;
     reqRef.current = requestAnimationFrame(updateLoop);
  };

  useEffect(() => {
     return () => {
        cancelAnimationFrame(reqRef.current);
        if (audioCtxRef.current) {
           audioCtxRef.current.close();
        }
     };
  }, []);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-serif flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: '#000' }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Dynamic Background */}
         <AnimatePresence mode="wait">
            <motion.div
               key={`bg-${currentSlideIndex}`}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 2 }}
               className="absolute inset-0 z-0"
               style={{ backgroundColor: TIMELINE[currentSlideIndex]?.color || '#000' }}
            />
         </AnimatePresence>

         {/* Foreground Content */}
         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center">
            <AnimatePresence mode="wait">
               {gameState === "playing" && (
                  <motion.div
                     key={`text-${currentSlideIndex}`}
                     initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                     animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                     exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                     transition={{ duration: 2 }}
                     className="text-white text-2xl font-serif italic font-light drop-shadow-lg leading-relaxed"
                  >
                     {TIMELINE[currentSlideIndex]?.text}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Progress Bar */}
         {gameState === "playing" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
               <motion.div 
                  className="h-full bg-white/80 rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${progress * 100}%` }}
               />
            </div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="text-white font-sans text-xs uppercase tracking-[0.5em] mb-8 text-center px-4 drop-shadow-md">
                     Immersive Tour
                  </div>
                  <div className="text-white/50 font-serif italic mb-12 text-center px-10 text-sm leading-relaxed">
                     Make sure your sound is on. You will not be able to fast forward.
                  </div>
                  <button 
                     onClick={handleStart}
                     className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/30 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="p-10 md:p-14 max-w-2xl w-full text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  <div className="font-sans uppercase tracking-[0.3em] mb-6 text-xs text-white/50">The End</div>
                  <h1 className="text-4xl md:text-5xl font-serif mb-6 text-white leading-tight font-light italic">
                     {config.title}
                  </h1>
                  <p className="text-lg text-white/80 font-sans font-light leading-relaxed">
                     {config.body}
                  </p>
                  <div className="w-8 h-[1px] bg-white/20 mx-auto mt-12" />
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white/70 font-sans font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  isBypassed.current = true;
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-3 rounded-lg hover:bg-white/20 transition-colors shadow-md border border-white/30 bg-black/50"
            >
               Auto-Skip Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
