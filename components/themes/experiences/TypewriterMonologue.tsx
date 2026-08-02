"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const MONOLOGUE = `CONNECTION ESTABLISHED...

I don't have much time. They are scanning the sub-frequencies now. 
If you are reading this, it means the automated dead-drop worked. 
I need you to understand that everything we thought we knew about the incident at Sector 4 was a lie.

They didn't contain the breach. They embraced it.

You must find the others. Do not trust the main comms channels.
The signal is degrading...
End of transmission.`;

export function TypewriterMonologue({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // Green 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // Black

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [visibleChars, setVisibleChars] = useState(0);
  const [isFastForwarding, setIsFastForwarding] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTypingLoop = (fast: boolean) => {
     if (timerRef.current) clearTimeout(timerRef.current);

     const speed = fast ? 10 : 80; // 10ms vs 80ms per char

     timerRef.current = setTimeout(() => {
        setVisibleChars(prev => {
           if (prev >= MONOLOGUE.length) {
              // Finished
              if (timerRef.current) clearTimeout(timerRef.current);
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 2000);
              return prev;
           }
           return prev + 1;
        });
     }, speed + (Math.random() * (fast ? 5 : 40))); // Add slight randomness for typewriter feel
  };

  useEffect(() => {
     if (gameState === "playing") {
        startTypingLoop(isFastForwarding);
     }
     return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
     };
  }, [gameState, visibleChars, isFastForwarding]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-mono flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
      onPointerDown={() => setIsFastForwarding(true)}
      onPointerUp={() => setIsFastForwarding(false)}
      onPointerLeave={() => setIsFastForwarding(false)}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-black rounded-sm shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* CRT Scanline effect */}
         <div className="absolute inset-0 z-20 pointer-events-none opacity-20"
              style={{
                 backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)'
              }}
         />
         {/* CRT Vignette */}
         <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

         {/* Monologue Text */}
         <div className="p-6 pt-10 text-sm leading-loose z-10 whitespace-pre-wrap flex-1 overflow-y-auto no-scrollbar pb-16" style={{ color: primaryColor, textShadow: `0 0 5px ${primaryColor}` }}>
            {gameState !== "start" && MONOLOGUE.slice(0, visibleChars)}
            
            {/* Blinking Cursor */}
            {gameState === "playing" && (
               <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="inline-block w-2.5 h-4 align-middle ml-0.5"
                  style={{ backgroundColor: primaryColor }}
               />
            )}
         </div>

         {/* Fast Forward Hint */}
         <AnimatePresence>
            {gameState === "playing" && visibleChars > 10 && visibleChars < MONOLOGUE.length && !isFastForwarding && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-6 left-0 w-full flex justify-center z-30 pointer-events-none"
               >
                  <span className="text-[10px] uppercase tracking-widest bg-black/80 px-3 py-1 rounded-full animate-pulse border" style={{ color: primaryColor, borderColor: primaryColor }}>
                     Hold screen to decrypt faster
                  </span>
               </motion.div>
            )}
         </AnimatePresence>
         
         <AnimatePresence>
            {isFastForwarding && gameState === "playing" && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 z-30 pointer-events-none flex items-center gap-2"
               >
                  <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: primaryColor }}>Fast Forward</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={primaryColor}><polygon points="5 4 15 12 5 20 5 4"></polygon><polygon points="13 4 23 12 13 20 13 4"></polygon></svg>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-12 h-12 border-2 rounded-sm flex items-center justify-center mb-6 animate-pulse" style={{ borderColor: primaryColor, color: primaryColor, textShadow: `0 0 10px ${primaryColor}` }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
                  </div>
                  <h2 className="uppercase tracking-[0.3em] font-bold mb-8 text-sm" style={{ color: primaryColor, textShadow: `0 0 10px ${primaryColor}` }}>
                     Secure Channel
                  </h2>
                  <button 
                     onClick={(e) => {
                        e.stopPropagation(); // don't trigger the pointerDown fast-forward immediately
                        setGameState("playing");
                     }}
                     className="px-6 py-2 uppercase tracking-widest text-[10px] font-bold border hover:bg-white/10 transition-colors"
                     style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                     Accept Transmission
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
                  className="border p-8 md:p-12 max-w-2xl w-full text-center relative overflow-hidden"
                  style={{ borderColor: primaryColor, boxShadow: `0 0 30px ${primaryColor}20` }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  {/* CRT Scanline inside payload */}
                  <div className="absolute inset-0 pointer-events-none opacity-10"
                       style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)' }}
                  />
                  
                  <div className="uppercase tracking-[0.3em] mb-6 text-[10px] opacity-70" style={{ color: primaryColor }}>Payload Decrypted</div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-6 leading-tight" style={{ color: primaryColor, textShadow: `0 0 10px ${primaryColor}` }}>
                     {config.title}
                  </h1>
                  <p className="text-sm leading-loose" style={{ color: primaryColor }}>
                     {config.body}
                  </p>
                  
                  {/* Blinking Cursor at the end */}
                  <motion.span 
                     animate={{ opacity: [1, 0] }}
                     transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                     className="inline-block w-3 h-5 align-middle mt-6"
                     style={{ backgroundColor: primaryColor }}
                  />
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-stone-800 p-5 flex flex-col items-center shadow-2xl z-50 rounded-lg pointer-events-auto">
            <h2 className="font-bold uppercase tracking-widest text-[10px] mb-4" style={{ color: primaryColor }}>
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  setVisibleChars(MONOLOGUE.length);
               }}
               className="w-full font-black uppercase tracking-widest py-3 rounded hover:brightness-110 transition-all border"
               style={{ color: primaryColor, borderColor: primaryColor }}
            >
               Auto-Type Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
