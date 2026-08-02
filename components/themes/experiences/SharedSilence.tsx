"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_SILENCE_SECONDS = 30;

export function SharedSilence({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [timeLeft, setTimeLeft] = useState(TARGET_SILENCE_SECONDS);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [partnerActive, setPartnerActive] = useState(false);
  const [localActive, setLocalActive] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d946ef"; // Fuchsia 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#09090b"];
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Main countdown timer
  useEffect(() => {
     if (isUnlocked || partnerActive || localActive) return;

     timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
           if (prev <= 1) {
              setIsUnlocked(true);
    onComplete?.();
              return 0;
           }
           return prev - 1;
        });
     }, 1000);

     return () => {
        if (timerRef.current) clearInterval(timerRef.current);
     };
  }, [isUnlocked, partnerActive, localActive]);

  // Unlock completion handler
  useEffect(() => {
     if (isUnlocked && onComplete) {
        const timer = setTimeout(onComplete, 8000);
        return () => clearTimeout(timer);
     }
  }, [isUnlocked, onComplete]);

  // Global event listeners to detect local movement
  useEffect(() => {
     if (isUnlocked) return;

     const handleUserActivity = () => {
        // Reset timer immediately
        setTimeLeft(TARGET_SILENCE_SECONDS);
        setLocalActive(true);

        // Clear previous debounce
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Allow timer to resume after 1 second of NO activity
        debounceRef.current = setTimeout(() => {
           setLocalActive(false);
        }, 1000);
     };

     // Attach to window
     window.addEventListener("mousemove", handleUserActivity);
     window.addEventListener("keydown", handleUserActivity);
     window.addEventListener("touchstart", handleUserActivity);
     window.addEventListener("scroll", handleUserActivity);
     window.addEventListener("wheel", handleUserActivity);

     return () => {
        window.removeEventListener("mousemove", handleUserActivity);
        window.removeEventListener("keydown", handleUserActivity);
        window.removeEventListener("touchstart", handleUserActivity);
        window.removeEventListener("scroll", handleUserActivity);
        window.removeEventListener("wheel", handleUserActivity);
        if (debounceRef.current) clearTimeout(debounceRef.current);
     };
  }, [isUnlocked]);

  // Editor Simulation: Mock Partner Reset
  useEffect(() => {
     if (partnerActive) {
        setTimeLeft(TARGET_SILENCE_SECONDS);
        const timer = setTimeout(() => {
           setPartnerActive(false);
        }, 1500);
        return () => clearTimeout(timer);
     }
  }, [partnerActive]);


  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <AnimatePresence mode="wait">
         {!isUnlocked ? (
            <motion.div 
               key="silence-phase"
               className="w-full h-full flex flex-col items-center justify-center relative"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               transition={{ duration: 1 }}
            >
               
               {/* Visual representation of connection */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center justify-between w-64 md:w-96 relative">
                     
                     {/* Local User Dot */}
                     <motion.div 
                        className="w-4 h-4 rounded-full z-10"
                        style={{ backgroundColor: localActive ? "#ef4444" : primaryColor }}
                        animate={{ 
                           scale: localActive ? [1, 1.5, 1] : 1,
                           boxShadow: `0 0 ${localActive ? '20px' : '10px'} ${localActive ? '#ef4444' : primaryColor}`
                        }}
                        transition={{ duration: 0.5 }}
                     />

                     {/* The Thread */}
                     <motion.div 
                        className="h-[1px] flex-1 mx-2"
                        style={{ backgroundColor: (localActive || partnerActive) ? "#ef4444" : primaryColor }}
                        animate={{ opacity: (localActive || partnerActive) ? 0.2 : 0.8 }}
                     />

                     {/* Partner User Dot */}
                     <motion.div 
                        className="w-4 h-4 rounded-full z-10"
                        style={{ backgroundColor: partnerActive ? "#ef4444" : primaryColor }}
                        animate={{ 
                           scale: partnerActive ? [1, 1.5, 1] : 1,
                           boxShadow: `0 0 ${partnerActive ? '20px' : '10px'} ${partnerActive ? '#ef4444' : primaryColor}`
                        }}
                        transition={{ duration: 0.5 }}
                     />

                  </div>
               </div>

               {/* Central Countdown */}
               <div className="relative z-20 text-center pointer-events-none mt-32">
                  <motion.div 
                     className="font-mono text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter"
                     style={{ color: primaryColor }}
                     animate={{ opacity: (localActive || partnerActive) ? 0.3 : 1 }}
                  >
                     {timeLeft}
                  </motion.div>
                  
                  <div className="text-white/40 uppercase tracking-[0.4em] text-xs font-bold mt-4 h-4">
                     {(localActive || partnerActive) ? (
                        <span className="text-red-500">Connection Disturbed</span>
                     ) : (
                        <span>Do not move.</span>
                     )}
                  </div>
               </div>

            </motion.div>
         ) : (
            <motion.div 
               key="unlocked-phase"
               className="w-full max-w-2xl text-center p-8 relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 2, ease: "easeOut" }}
            >
               <motion.div 
                  className="w-2 h-2 rounded-full mx-auto mb-12 shadow-[0_0_20px_#fff]"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ scale: [1, 3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               />

               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-white">
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed text-white/90">
                  {config.body}
               </p>

               <div className="mt-16 text-[10px] text-white/30 uppercase tracking-[0.4em]">
                  Silence Shared.
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isUnlocked && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3 text-center">
               Simulation: Multiplayer WebSocket
            </h2>
            <button 
               onClick={() => setPartnerActive(true)}
               disabled={partnerActive}
               className="w-full bg-red-600/80 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors border border-red-400/50"
            >
               Mock Partner Movement
            </button>
            <p className="text-[9px] text-white/40 mt-3 text-center max-w-[250px] leading-relaxed">
               Note: Any mouse movement over this preview window will trigger the local reset. Keep still to count down.
            </p>
         </div>
      )}
      
    </div>
  );
}
