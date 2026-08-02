"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "idle" | "spinning" | "won";

const SYMBOLS = ["🍎", "🍋", "🍇", "💎", "🍒", "🔔", "⭐", "7️⃣"];

// Rigged Outcomes
const OUTCOME_1 = ["🍎", "🍎", "🍋"]; // Close but fail
const OUTCOME_2 = ["💎", "💎", "🍎"]; // Oof
const OUTCOME_3 = ["7️⃣", "7️⃣", "7️⃣"]; // JACKPOT!

const SYMBOL_HEIGHT = 100; // px
const SPINS_BEFORE_STOP = 3; // How many full loops of the array to do before stopping

export function RiggedSlotMachine({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // Amber 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // Slate 800

  const [gameState, setGameState] = useState<GameState>("idle");
  const [pulls, setPulls] = useState(0);
  const [showPayload, setShowPayload] = useState(false);
  
  // Create long arrays for each reel so they can scroll down
  // We'll duplicate the symbols array multiple times to create a long strip
  const strip = Array(SPINS_BEFORE_STOP).fill(SYMBOLS).flat();

  // The final target index in the strip for each reel
  const [targetIndices, setTargetIndices] = useState<[number, number, number]>([0, 0, 0]);
  const [leverY, setLeverY] = useState(0);

  const dragStartY = useRef(0);

  const getOutcome = (pullNum: number) => {
     if (pullNum === 0) return OUTCOME_1;
     if (pullNum === 1) return OUTCOME_2;
     return OUTCOME_3;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "idle") return;
     dragStartY.current = e.clientY - leverY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (gameState !== "idle" || dragStartY.current === 0) return;
     const y = Math.max(0, Math.min(100, e.clientY - dragStartY.current));
     setLeverY(y);
  };

  const handlePointerUp = () => {
     if (gameState !== "idle" || dragStartY.current === 0) return;
     dragStartY.current = 0;

     if (leverY > 50) {
        // Trigger Spin!
        spin();
     } else {
        // Snap back
        setLeverY(0);
     }
  };

  const spin = () => {
     setGameState("spinning");
     setLeverY(100);

     // Let lever snap back after a moment
     setTimeout(() => setLeverY(0), 300);

     const outcome = getOutcome(pulls);
     
     // Calculate the index of the outcome symbol in the final segment of our strip
     // We want to land near the end of the long strip
     const offset = SYMBOLS.length * (SPINS_BEFORE_STOP - 1);
     
     const t1 = offset + SYMBOLS.indexOf(outcome[0]);
     const t2 = offset + SYMBOLS.indexOf(outcome[1]);
     const t3 = offset + SYMBOLS.indexOf(outcome[2]);

     // We set them slightly staggered so they start moving
     setTargetIndices([t1, t2, t3]);

     // Finish spin after delays
     setTimeout(() => {
        if (pulls === 2) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           setGameState("idle");
           setPulls(p => p + 1);
           // Reset targets back to a matching starting position near the top so we can spin again
           // Actually, just leaving them at the end is fine if we reconstruct the strip, 
           // but since the strip is fixed, we need to snap them back to the start silently
           setTimeout(() => {
              const start1 = SYMBOLS.indexOf(outcome[0]);
              const start2 = SYMBOLS.indexOf(outcome[1]);
              const start3 = SYMBOLS.indexOf(outcome[2]);
              setTargetIndices([start1, start2, start3]);
           }, 500);
        }
     }, 3000); // Wait for the longest reel to stop
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Game Area Container */}
      <div className={`relative flex items-center justify-center transition-all duration-1000 ${gameState === "won" ? "scale-90 opacity-40 blur-sm pointer-events-none" : "scale-100 opacity-100"}`}>
         
         {/* The Slot Machine Body */}
         <div className="relative w-80 sm:w-96 aspect-square bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-6 z-10">
            
            {/* Top Sign */}
            <div className="absolute -top-8 bg-gradient-to-b from-yellow-400 to-amber-600 px-8 py-2 rounded-full border-4 border-slate-900 shadow-xl">
               <span className="text-slate-900 font-black tracking-widest uppercase text-xl">
                  {pulls === 0 ? "Jackpot" : pulls === 1 ? "So Close!" : pulls === 2 ? "Last Chance!" : "WINNER!"}
               </span>
            </div>

            {/* The Reels Window */}
            <div className="w-full h-[120px] bg-slate-950 rounded-xl border-4 border-slate-800 overflow-hidden flex justify-between p-2 shadow-inner relative">
               
               {/* Center Win Line */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/50 -translate-y-1/2 z-20 pointer-events-none" />

               {[0, 1, 2].map((reelIndex) => (
                  <div key={reelIndex} className="w-[30%] h-full bg-slate-800 rounded-lg overflow-hidden relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
                     <motion.div
                        className="absolute w-full flex flex-col items-center"
                        initial={false}
                        animate={{ 
                           // Align the center of the target symbol with the center of the window
                           // window is 120px, symbol is 100px. Offset is 10px from top.
                           // target Y translation = -(targetIndex * 100) + 10px
                           y: -(targetIndices[reelIndex] * SYMBOL_HEIGHT) + 2
                        }}
                        transition={{
                           type: "spring",
                           damping: 15,
                           stiffness: 40,
                           // Stagger the reels stopping
                           delay: gameState === "spinning" ? reelIndex * 0.4 : 0,
                           // When snapping back (gameState idle), do it instantly
                           duration: gameState === "idle" ? 0 : undefined
                        }}
                     >
                        {strip.map((symbol, i) => (
                           <div key={i} className="w-full h-[100px] flex items-center justify-center text-6xl select-none">
                              {symbol}
                           </div>
                        ))}
                     </motion.div>
                  </div>
               ))}

            </div>

            {/* Bottom Panel */}
            <div className="w-full mt-8 bg-slate-800 rounded-xl p-4 text-center border-b-4 border-slate-950">
               <div className="text-slate-400 font-black uppercase tracking-widest text-sm mb-1">Status</div>
               <div className="text-amber-400 font-mono text-xl uppercase animate-pulse">
                  {gameState === "idle" && pulls === 0 && "Pull Lever to Play"}
                  {gameState === "idle" && pulls === 1 && "Try Again..."}
                  {gameState === "idle" && pulls === 2 && "One More Pull..."}
                  {gameState === "spinning" && "Spinning..."}
                  {gameState === "won" && "JACKPOT!"}
               </div>
            </div>

         </div>

         {/* The Lever */}
         <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 flex flex-col items-center z-0">
            {/* Lever Base */}
            <div className="w-8 h-24 bg-slate-800 rounded-r-xl border-y-4 border-r-4 border-slate-950 -ml-2 z-0" />
            
            {/* The Draggable Arm */}
            <motion.div 
               className="absolute top-12 origin-top w-4 h-32 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full cursor-grab active:cursor-grabbing flex justify-center -ml-2"
               style={{ y: leverY }}
               onPointerDown={handlePointerDown}
            >
               {/* The Ball */}
               <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-700 shadow-xl border-2 border-red-900" />
            </motion.div>
         </div>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(245,158,11,0.5)] relative overflow-hidden"
                  initial={{ scale: 0.5, y: 100, rotateX: 45 }}
                  animate={{ scale: 1, y: 0, rotateX: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  
                  {/* Coin Shower Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMTAiIGZpbGw9IiNmYmJmMjQiLz48L3N2Zz4=')] animate-[slideDown_1s_linear_infinite]" />

                  <div className="text-amber-500 font-black uppercase tracking-widest mb-6 drop-shadow-sm text-2xl">
                     JACKPOT! 7-7-7
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight relative z-10">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed relative z-10">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState !== "won" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-amber-400 transition-colors shadow-lg"
            >
               Auto-Jackpot Bypass
            </button>
         </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html:`
         @keyframes slideDown {
            from { background-position: 0 -80px; }
            to { background-position: 0 80px; }
         }
      `}} />
    </div>
  );
}
