"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type StarNode = {
   id: number;
   x: number; // percentage
   y: number; // percentage
   fragment: string;
};

// Represents a constellation (a simple shape)
const STARS: StarNode[] = [
   { id: 0, x: 20, y: 30, fragment: "In the beginning, there was only the void." },
   { id: 1, x: 50, y: 15, fragment: "Then came the first spark, illuminating the dark." },
   { id: 2, x: 80, y: 40, fragment: "The spark split, scattering across the canvas." },
   { id: 3, x: 60, y: 70, fragment: "They searched for each other for millennia." },
   { id: 4, x: 30, y: 65, fragment: "Until they formed a pattern, meaning out of chaos." },
];

export function ConstellationMyth({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // Amber 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  // Track how many stars the user has successfully connected in sequence.
  // Starts at -1 (nothing clicked).
  const [connectedIndex, setConnectedIndex] = useState<number>(-1);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const handleStarClick = (index: number) => {
     if (gameState !== "playing") return;

     if (index === connectedIndex + 1) {
        // Correct next star in sequence
        setConnectedIndex(index);
        
        // If it's the last star
        if (index === STARS.length - 1) {
           setTimeout(() => {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }, 1000);
        }
     } else if (index > connectedIndex) {
        // Clicked a star out of order
        setErrorIndex(index);
        setTimeout(() => setErrorIndex(null), 500);
     }
  };

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
      
      {/* Game Viewport Container - The "Night Sky" */}
      <div 
         className={`relative w-[320px] h-[480px] rounded shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{
            background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)", // Deep space
         }}
      >
         
         {/* Background noise / distant tiny stars (static) */}
         <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

         {/* The Lines Layer (SVG Overlay) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {STARS.map((star, i) => {
               if (i === 0) return null; // No line to draw to the first star
               if (i > connectedIndex) return null; // Not connected yet

               const prevStar = STARS[i - 1];
               return (
                  <motion.line
                     key={`line-${i}`}
                     x1={`${prevStar.x}%`}
                     y1={`${prevStar.y}%`}
                     x2={`${star.x}%`}
                     y2={`${star.y}%`}
                     stroke={primaryColor}
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeDasharray="100"
                     initial={{ strokeDashoffset: 100, opacity: 0 }}
                     animate={{ strokeDashoffset: 0, opacity: 0.6 }}
                     transition={{ duration: 1, ease: "easeOut" }}
                  />
               );
            })}
         </svg>

         {/* The Stars Layer (HTML Divs for interaction) */}
         <div className="absolute inset-0 w-full h-full z-20">
            {STARS.map((star, i) => {
               const isConnected = i <= connectedIndex;
               const isNext = i === connectedIndex + 1;
               const isError = errorIndex === i;

               return (
                  <button
                     key={star.id}
                     onClick={() => handleStarClick(i)}
                     className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center transition-transform active:scale-75 cursor-pointer disabled:cursor-default"
                     style={{ left: star.x + "%", top: star.y + "%" }}
                     disabled={isConnected || gameState !== "playing"}
                  >
                     <motion.div 
                        className={`w-3 h-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] ${isError ? "bg-red-500 shadow-red-500" : isConnected ? "bg-white" : "bg-white/50"}`}
                        animate={{ 
                           scale: isNext ? [1, 1.3, 1] : 1,
                           opacity: isNext ? [0.6, 1, 0.6] : isConnected ? 1 : 0.5
                        }}
                        transition={{ duration: isNext ? 1.5 : 0, repeat: isNext ? Infinity : 0 }}
                     />
                     {/* Debug/Helper Number - Hidden except for subtle hover maybe? 
                         Let's keep it very subtle to guide the user without breaking immersion. */}
                     {isNext && gameState === "playing" && (
                         <div className="absolute top-8 text-[8px] text-white/40 font-mono">
                            Star {i + 1}
                         </div>
                     )}
                  </button>
               );
            })}
         </div>

         {/* Narrative Text Fragment Layer */}
         <div className="absolute bottom-12 left-0 w-full px-6 flex justify-center items-end text-center z-30 pointer-events-none min-h-[60px]">
            <AnimatePresence mode="wait">
               {connectedIndex >= 0 && connectedIndex < STARS.length && (
                  <motion.p
                     key={`fragment-${connectedIndex}`}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.5 }}
                     className="text-white text-sm font-serif italic drop-shadow-md leading-relaxed"
                  >
                     {STARS[connectedIndex].fragment}
                  </motion.p>
               )}
            </AnimatePresence>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-6 overflow-hidden relative">
                     <div className="absolute w-2 h-2 bg-white rounded-full top-3 left-4 shadow-[0_0_10px_white]" />
                     <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-4 right-4 shadow-[0_0_10px_white]" />
                     <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50"><line x1="40%" y1="20%" x2="70%" y2="70%" stroke="white" strokeWidth="1" /></svg>
                  </div>
                  <h2 className="uppercase tracking-widest font-black mb-4 text-xl text-white">
                     The Stars
                  </h2>
                  <p className="text-xs text-white/60 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Connect the stars in sequence to reveal the myth written in the sky.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                     style={{ backgroundColor: "white" }}
                  >
                     Look Up
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 2 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  {/* Final Constellation Graphic (Miniature) */}
                  <div className="w-24 h-24 mb-8 relative opacity-50">
                     <svg className="w-full h-full">
                        <polygon points="20,30 50,15 80,40 60,70 30,65" fill="none" stroke={primaryColor} strokeWidth="2" />
                        <circle cx="20%" cy="30%" r="3" fill="white" />
                        <circle cx="50%" cy="15%" r="3" fill="white" />
                        <circle cx="80%" cy="40%" r="3" fill="white" />
                        <circle cx="60%" cy="70%" r="3" fill="white" />
                        <circle cx="30%" cy="65%" r="3" fill="white" />
                     </svg>
                  </div>

                  <h1 className="text-3xl font-serif mb-6 text-white leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                     {config.title}
                  </h1>
                  
                  <div className="w-8 h-[1px] bg-white/20 mb-6" />

                  <p className="text-sm leading-loose font-serif italic text-white/80 max-w-[280px]">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Myth
            </h2>
            <button 
               onClick={() => {
                  let i = connectedIndex + 1;
                  const interval = setInterval(() => {
                     if (i < STARS.length) {
                        setConnectedIndex(i);
                        i++;
                     } else {
                        clearInterval(interval);
                        setTimeout(() => {
                           setGameState("won");
    onComplete?.();
                           setTimeout(() => setShowPayload(true), 1500);
                        }, 500);
                     }
                  }, 200);
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded-full active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-white"
            >
               Auto-Connect
            </button>
         </div>
      )}
      
    </div>
  );
}
