"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const CORRECT_SEQUENCE = [0, 2, 1]; // First, Third, Second button
const STORAGE_KEY = "eventcraft_24h_loop_sequence";
const DATE_KEY = "eventcraft_24h_loop_date";

export function TwentyFourHourLoop({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [isEscaped, setIsEscaped] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [simulatedDateStr, setSimulatedDateStr] = useState<string>(new Date().toDateString());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // Indigo
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#f8fafc";

  // Check for Midnight Reset on Mount & Interval
  useEffect(() => {
     // Load initial state if date matches
     const savedDate = localStorage.getItem(DATE_KEY);
     const savedSeq = localStorage.getItem(STORAGE_KEY);
     
     if (savedDate === simulatedDateStr && savedSeq) {
        setSequence(JSON.parse(savedSeq));
     } else {
        // Reset if it's a new day
        setSequence([]);
        localStorage.setItem(DATE_KEY, simulatedDateStr);
        localStorage.setItem(STORAGE_KEY, "[]");
     }

     const interval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diffMs = tomorrow.getTime() - now.getTime();
        
        const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

        // Note: Real midnight reset would happen here if we let it tick past midnight, 
        // but for editor simulation, we drive it manually via simulatedDateStr
     }, 1000);

     return () => clearInterval(interval);
  }, [simulatedDateStr]);

  const handleButtonPress = (btnIndex: number) => {
     if (isEscaped) return;

     const newSeq = [...sequence, btnIndex];
     
     // Check escape
     if (newSeq.length === CORRECT_SEQUENCE.length) {
        const isMatch = newSeq.every((val, i) => val === CORRECT_SEQUENCE[i]);
        if (isMatch) {
           setIsEscaped(true);
           if (onComplete) setTimeout(onComplete, 3000);
           return;
        } else {
           // Incorrect, vibrate and reset sequence (but not the day)
           setSequence([]);
           localStorage.setItem(STORAGE_KEY, "[]");
           return;
        }
     }

     setSequence(newSeq);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(newSeq));
  };

  const handleSimulateMidnight = () => {
     // Force a date change to trigger the wipe
     setSimulatedDateStr(new Date(Date.now() + 86400000).toDateString());
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center"
      style={{ backgroundColor: isEscaped ? "#ffffff" : bgColors[0] }} 
    >
      <AnimatePresence mode="wait">
         {!isEscaped ? (
            <motion.div 
               key="looping"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
               transition={{ duration: 1 }}
               className="flex flex-col items-center z-10 w-full px-6"
            >
               {/* Countdown Clock */}
               <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Time until reset</div>
                  <div className="font-mono text-3xl font-black text-slate-300 opacity-80" style={{ color: primaryColor }}>
                     {timeLeft || "23:59:59"}
                  </div>
               </div>

               <div className="text-center mb-16 mt-24">
                  <h2 className="text-3xl font-serif text-slate-300 italic tracking-wide mb-4">
                     You are trapped in the loop.
                  </h2>
                  <p className="text-slate-500 text-sm max-w-md uppercase tracking-widest font-bold">
                     Break the cycle before midnight.
                  </p>
               </div>

               {/* The Puzzle (3 Buttons) */}
               <div className="flex gap-4 md:gap-8 mb-16">
                  {[0, 1, 2].map((btn) => {
                     const isPressed = sequence.includes(btn);
                     return (
                        <motion.button
                           key={btn}
                           onClick={() => handleButtonPress(btn)}
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isPressed ? 'opacity-50 pointer-events-none' : 'hover:shadow-lg hover:shadow-[var(--primaryColor)]'}`}
                           style={{ 
                              borderColor: isPressed ? "#334155" : primaryColor,
                              backgroundColor: isPressed ? "#1e293b" : "transparent",
                              boxShadow: isPressed ? "none" : `0 0 20px ${primaryColor}20`
                           }}
                        >
                           {/* Abstract Symbol inside button */}
                           <div 
                              className="w-8 h-8 md:w-10 md:h-10 border-2 rounded-full" 
                              style={{ 
                                 borderColor: isPressed ? "#475569" : primaryColor,
                                 borderRadius: btn === 0 ? '50%' : btn === 1 ? '0%' : '10px',
                                 rotate: btn === 2 ? '45deg' : '0deg'
                              }} 
                           />
                        </motion.button>
                     )
                  })}
               </div>

               {/* Sequence Progress Indicators */}
               <div className="flex gap-3">
                  {[0, 1, 2].map((step) => (
                     <div 
                        key={step} 
                        className="w-3 h-3 rounded-full border border-slate-600 transition-colors duration-300"
                        style={{ backgroundColor: step < sequence.length ? primaryColor : "transparent" }}
                     />
                  ))}
               </div>

            </motion.div>
         ) : (
            <motion.div 
               key="escaped"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 2, ease: "easeOut" }}
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl bg-white"
            >
               <div className="text-xs font-bold uppercase tracking-[0.3em] mb-8 text-slate-400">
                  The Loop is Broken
               </div>
               <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-slate-900 mb-8">
                  {config.title}
               </h1>
               <p className="text-xl md:text-2xl font-serif text-slate-600 leading-relaxed max-w-xl">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isEscaped && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Time Travel
            </h2>
            <button 
               onClick={handleSimulateMidnight}
               className="w-full bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-red-400/50"
            >
               Simulate Midnight (Wipe Progress)
            </button>
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
               Current Internal Date: {simulatedDateStr}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
               Hint: Correct seq is [Left, Right, Middle]
            </div>
         </div>
      )}
      
    </div>
  );
}
