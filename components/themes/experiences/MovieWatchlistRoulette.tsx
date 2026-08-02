"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Clapperboard, CheckCircle2, Ticket, Lock, RefreshCcw } from "lucide-react";

export function MovieWatchlistRoulette({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  // Initial Movie List
  const [movies, setMovies] = useState([
     "The Matrix", "Inception", "Dune", "Interstellar", 
     "Everything Everywhere All at Once", "Spider-Man: Into the Spider-Verse",
     "Parasite", "Mad Max: Fury Road", "Get Out", "Arrival"
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenMovie, setChosenMovie] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const speedRef = useRef(50);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  const startRoulette = () => {
     if (movies.length === 0 || isSpinning) return;
     
     setIsSpinning(true);
     setChosenMovie(null);
     speedRef.current = 50; // Fast initial speed

     const totalDuration = 4000; // 4 seconds total spin time
     const startTime = Date.now();

     const tick = () => {
        setCurrentIndex(prev => (prev + 1) % movies.length);
        
        const elapsed = Date.now() - startTime;
        if (elapsed < totalDuration) {
           // Easing out the speed (slowing down)
           const progress = elapsed / totalDuration;
           // The closer progress is to 1, the slower the interval
           const nextSpeed = 50 + Math.pow(progress, 3) * 600;
           
           spinInterval.current = setTimeout(tick, nextSpeed);
        } else {
           // Finished
           if (spinInterval.current) clearTimeout(spinInterval.current);
           
           // We need the *final* index after the state updates. 
           // Because React state in timeouts can be tricky, we'll let the next render commit the choice
           finishSpin();
        }
     };

     spinInterval.current = setTimeout(tick, speedRef.current);
  };

  const finishSpin = () => {
     // Use functional state update to get exact current index at finish time
     setCurrentIndex(finalIdx => {
        const selected = movies[finalIdx];
        setChosenMovie(selected);
        setHistory(prev => [...prev, selected]);
        setMovies(prev => prev.filter((_, idx) => idx !== finalIdx));
        setIsSpinning(false);
        if (onComplete) onComplete();
        return finalIdx;
     });
  };

  useEffect(() => {
     return () => {
        if (spinInterval.current) clearTimeout(spinInterval.current);
     };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Marquee Border Effect */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-zinc-950 z-20" />
      <div className="absolute inset-0 pointer-events-none z-20 opacity-50 mix-blend-overlay">
         {/* Fake Lightbulbs around the edge */}
         <div className="absolute top-2 left-4 right-4 flex justify-between">
            {Array.from({length: 10}).map((_, i) => <div key={`t${i}`} className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />)}
         </div>
         <div className="absolute bottom-2 left-4 right-4 flex justify-between">
            {Array.from({length: 10}).map((_, i) => <div key={`b${i}`} className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />)}
         </div>
         <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between">
            {Array.from({length: 15}).map((_, i) => <div key={`l${i}`} className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />)}
         </div>
         <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between">
            {Array.from({length: 15}).map((_, i) => <div key={`r${i}`} className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />)}
         </div>
      </div>

      {/* Header */}
      <div className="pt-12 px-8 flex flex-col items-center text-center relative z-10">
         <h2 className="text-3xl font-black tracking-widest mb-2 uppercase text-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {config.title || "Now Showing"}
         </h2>
         <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
            <Ticket size={14} /> {config.body || "End the indecision."}
         </p>
      </div>

      {/* Main Roulette Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
         
         <div className="w-full max-w-sm bg-black rounded-3xl border border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[200px] shadow-2xl relative overflow-hidden">
            
            {/* Screen Glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
               {chosenMovie ? (
                  <motion.div 
                     key="chosen"
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="text-center w-full"
                  >
                     <div className="text-emerald-500 flex justify-center mb-4">
                        <CheckCircle2 size={48} />
                     </div>
                     <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">
                        {chosenMovie}
                     </h3>
                     <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-4">
                        <Lock size={12} /> Decision Final
                     </div>
                  </motion.div>
               ) : movies.length > 0 ? (
                  <motion.div 
                     key="spinning"
                     className="text-center w-full"
                  >
                     <Clapperboard size={32} className={`mx-auto mb-4 ${isSpinning ? 'text-yellow-500' : 'text-zinc-600'}`} />
                     <h3 className={`text-xl sm:text-2xl font-black leading-tight drop-shadow-md transition-colors ${isSpinning ? 'text-white' : 'text-zinc-400'}`}>
                        {movies[currentIndex]}
                     </h3>
                  </motion.div>
               ) : (
                  <motion.div 
                     key="empty"
                     className="text-center w-full text-zinc-600"
                  >
                     <Film size={48} className="mx-auto mb-4 opacity-50" />
                     <h3 className="text-xl font-black uppercase tracking-widest">List Empty</h3>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Start Button */}
         <div className="mt-12 w-full max-w-sm">
            <button
               onClick={startRoulette}
               disabled={isSpinning || movies.length === 0}
               className={`w-full py-5 rounded-2xl font-black text-white text-xl uppercase tracking-widest shadow-[0_8px_0_rgb(153,27,27)] active:translate-y-2 active:shadow-[0_0px_0_rgb(153,27,27)] transition-all ${
                  isSpinning || movies.length === 0 ? 'opacity-50 grayscale' : 'hover:brightness-110'
               }`}
               style={{ backgroundColor: primaryColor }}
            >
               {isSpinning ? 'Selecting...' : 'Decide For Us'}
            </button>
         </div>

      </div>

      {/* Footer info: pool size */}
      <div className="pb-8 px-6 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest z-10 flex flex-col items-center gap-2">
         {movies.length} Movies remaining in pool
         {history.length > 0 && (
            <div className="mt-2 text-[10px] text-zinc-600">
               Watched: {history.join(", ")}
            </div>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setMovies(["The Matrix", "Inception", "Dune"]);
                  setChosenMovie(null);
               }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               <RefreshCcw size={12} /> Reset Pool
            </button>
         </div>
      )}

    </div>
  );
}
