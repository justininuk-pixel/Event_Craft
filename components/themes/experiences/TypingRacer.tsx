"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_TEXT = "The quick brown fox jumps over the lazy dog to unlock the secret message hidden in the vault. Speed is key, but accuracy is everything. Go!";
const TARGET_WPM = 35; // A reasonable challenging speed for a short mobile-friendly snippet

export function TypingRacer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // Rose 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [inputText, setInputText] = useState("");
  const [enemyProgress, setEnemyProgress] = useState(0); // 0 to 1
  const [playerProgress, setPlayerProgress] = useState(0); // 0 to 1
  
  const [showPayload, setShowPayload] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Focus input when playing
  useEffect(() => {
     if (gameState === "playing") {
        inputRef.current?.focus();
     }
  }, [gameState]);

  // Main Race Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const updateRace = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsedMinutes = (time - startTimeRef.current) / 1000 / 60;
        
        // Enemy car progress
        // WPM assumes ~5 chars per word
        const totalWords = TARGET_TEXT.length / 5;
        const targetDurationMinutes = totalWords / TARGET_WPM;
        
        let newEnemyProgress = elapsedMinutes / targetDurationMinutes;
        
        if (newEnemyProgress >= 1) {
           newEnemyProgress = 1;
           setGameState("lost");
        }

        setEnemyProgress(newEnemyProgress);

        if (newEnemyProgress < 1 && gameState === "playing") {
           animationRef.current = requestAnimationFrame(updateRace);
        }
     };

     animationRef.current = requestAnimationFrame(updateRace);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (gameState !== "playing") return;
     
     const val = e.target.value;
     setInputText(val);

     // Calculate progress (only correct consecutive chars count)
     let correctCount = 0;
     for (let i = 0; i < val.length; i++) {
        if (val[i] === TARGET_TEXT[i]) {
           correctCount++;
        } else {
           break; // Stop counting at first error
        }
     }

     const newPlayerProgress = correctCount / TARGET_TEXT.length;
     setPlayerProgress(newPlayerProgress);

     if (correctCount === TARGET_TEXT.length) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  };

  const startGame = () => {
     setInputText("");
     setEnemyProgress(0);
     setPlayerProgress(0);
     startTimeRef.current = 0;
     setGameState("playing");
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Render Text with Colors
  const renderText = () => {
     return TARGET_TEXT.split("").map((char, i) => {
        let colorClass = "text-slate-500"; // not typed yet
        let bgClass = "";
        
        if (i < inputText.length) {
           if (inputText[i] === char) {
              colorClass = "text-emerald-400"; // correct
           } else {
              colorClass = "text-red-500"; // wrong
              bgClass = "bg-red-500/20";
           }
        }
        
        // Cursor
        const isCursor = i === inputText.length && gameState === "playing";

        return (
           <span key={i} className={`${colorClass} ${bgClass} ${isCursor ? "border-b-2 border-white animate-pulse" : ""} transition-colors`}>
              {char}
           </span>
        );
     });
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: bgColors[0] }}
      onClick={() => {
         if (gameState === "playing") inputRef.current?.focus();
      }}
    >
      
      {/* Hidden Input for capturing mobile/desktop keyboard */}
      <input 
         ref={inputRef}
         type="text"
         autoComplete="off"
         autoCorrect="off"
         spellCheck="false"
         value={inputText}
         onChange={handleInputChange}
         className="absolute opacity-0 pointer-events-none"
         style={{ top: '-1000px' }}
      />

      {/* Game Viewport Container */}
      <div className={`relative w-full max-w-lg aspect-[4/3] bg-slate-800 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-40 blur-sm pointer-events-none" : "scale-100"}`}>
         
         {/* Race Track Header */}
         <div className="flex-none h-32 bg-slate-900 border-b-2 border-slate-700 p-4 relative flex flex-col justify-evenly">
            
            {/* Enemy Track */}
            <div className="w-full h-8 relative border-b border-dashed border-slate-700 flex items-center">
               <div className="absolute left-0 text-xs font-bold text-slate-600 tracking-widest pl-2">RIVAL</div>
               <div className="absolute right-0 top-0 bottom-0 w-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwMCIvPjxyZWN0IHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] opacity-30" />
               <motion.div 
                  className="absolute text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10"
                  style={{ left: `calc(${enemyProgress * 100}% - ${enemyProgress * 24}px)` }}
               >
                  🚓
               </motion.div>
            </div>

            {/* Player Track */}
            <div className="w-full h-8 relative border-b border-slate-700 flex items-center">
               <div className="absolute left-0 text-xs font-bold text-slate-600 tracking-widest pl-2">YOU</div>
               <div className="absolute right-0 top-0 bottom-0 w-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzAwMCIvPjxyZWN0IHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] opacity-30" />
               <motion.div 
                  className="absolute text-3xl drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] z-20"
                  animate={{ left: `calc(${playerProgress * 100}% - ${playerProgress * 24}px)` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
               >
                  🏎️
               </motion.div>
            </div>

         </div>

         {/* Typing Area */}
         <div className="flex-1 p-6 flex flex-col justify-center relative bg-slate-800">
            <p className="text-xl md:text-2xl font-mono leading-relaxed tracking-tight break-words">
               {renderText()}
            </p>
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Typing Racer
                  </div>
                  <div className="text-rose-400 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest leading-relaxed">
                     Type the paragraph to move.<br/>Beat the rival car to win.
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-rose-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     Start Engine
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,1)] mb-2">
                     Busted
                  </div>
                  <div className="text-red-300 font-medium tracking-widest uppercase mb-8">
                     Too Slow!
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="mt-4 px-8 py-3 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest shadow-lg hover:bg-red-500 transition-colors active:scale-95"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(244,63,94,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-rose-500 font-black uppercase tracking-widest mb-6">Race Won</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  setPlayerProgress(1);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-rose-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-rose-400 transition-colors shadow-lg"
            >
               Auto-Race Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
