"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "reveal" | "shuffling" | "guessing" | "won" | "lost";

const SHUFFLE_COUNT = 10;
const SHUFFLE_SPEED = 0.35; // seconds per swap

export function CupShuffle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Purple 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const [gameState, setGameState] = useState<GameState>("start");
  const [ballCupIndex, setBallCupIndex] = useState<number>(1); // The logical cup that has the ball (0, 1, or 2)
  const [order, setOrder] = useState<number[]>([0, 1, 2]); // Maps physical screen position index to logical cup index
  const [liftedCups, setLiftedCups] = useState<boolean[]>([false, false, false]); // which logical cups are lifted

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
     timeoutRefs.current.forEach(clearTimeout);
     timeoutRefs.current = [];
  };

  useEffect(() => {
     return clearTimeouts;
  }, []);

  const startGame = () => {
     if (gameState !== "start" && gameState !== "lost") return;
     
     clearTimeouts();
     
     // Pick a random cup to hold the ball
     const newBallIndex = Math.floor(Math.random() * 3);
     setBallCupIndex(newBallIndex);
     setOrder([0, 1, 2]); // reset positions
     setGameState("reveal");

     // Lift the cup to reveal the ball
     setLiftedCups(prev => {
        const next = [...prev];
        next[newBallIndex] = true;
        return next;
     });

     // Wait, then drop it
     timeoutRefs.current.push(setTimeout(() => {
        setLiftedCups([false, false, false]);
        
        // Wait for drop animation, then start shuffling
        timeoutRefs.current.push(setTimeout(() => {
           setGameState("shuffling");
           startShufflingSequence(newBallIndex, [0, 1, 2]);
        }, 500));

     }, 1500));
  };

  const startShufflingSequence = (currentBallIndex: number, startOrder: number[]) => {
     let currentOrder = [...startOrder];
     
     const doSwap = (swapsLeft: number) => {
        if (swapsLeft <= 0) {
           setGameState("guessing");
           return;
        }

        // Pick two random adjacent or non-adjacent positions to swap
        // Let's just pick two random different positions
        const pos1 = Math.floor(Math.random() * 3);
        let pos2 = Math.floor(Math.random() * 3);
        while (pos1 === pos2) pos2 = Math.floor(Math.random() * 3);

        const newOrder = [...currentOrder];
        const temp = newOrder[pos1];
        newOrder[pos1] = newOrder[pos2];
        newOrder[pos2] = temp;
        
        setOrder(newOrder);
        currentOrder = newOrder;

        timeoutRefs.current.push(setTimeout(() => doSwap(swapsLeft - 1), SHUFFLE_SPEED * 1000 + 50));
     };

     doSwap(SHUFFLE_COUNT);
  };

  const handleCupClick = (logicalCupIndex: number) => {
     if (gameState !== "guessing") return;

     // Lift the clicked cup
     setLiftedCups(prev => {
        const next = [...prev];
        next[logicalCupIndex] = true;
        return next;
     });

     if (logicalCupIndex === ballCupIndex) {
        setGameState("won");
        timeoutRefs.current.push(setTimeout(() => {
           if (onComplete) onComplete();
        }, 8000));
     } else {
        setGameState("lost");
        // We could also lift the correct cup to show them where it was
        timeoutRefs.current.push(setTimeout(() => {
           setLiftedCups(prev => {
              const next = [...prev];
              next[ballCupIndex] = true;
              return next;
           });
        }, 1000));
     }
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Payload Background */}
      <AnimatePresence>
         {gameState === "won" && (
            <motion.div 
               className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 bg-amber-50"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-center max-w-2xl"
               >
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 drop-shadow-sm">
                     {config.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Game Area */}
      <div className={`relative z-10 w-full max-w-3xl aspect-[2/1] flex flex-col items-center justify-center transition-opacity duration-1000 ${gameState === "won" ? "opacity-30 blur-sm pointer-events-none scale-90" : "opacity-100"}`}>
         
         {/* Table Surface */}
         <div className="absolute bottom-0 w-[150%] h-[40%] bg-emerald-800 rounded-[100%] blur-[2px] shadow-[inset_0_20px_40px_rgba(0,0,0,0.4)] translate-y-1/4 -z-10" />

         {/* HUD */}
         <div className="absolute top-0 w-full text-center p-4">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-slate-800 drop-shadow-md">
               {gameState === "start" ? "Find the Key" : 
                gameState === "reveal" ? "Watch Closely..." : 
                gameState === "shuffling" ? "Keep your eyes on it!" : 
                gameState === "guessing" ? "Which cup is it?" : 
                gameState === "lost" ? "Nope! Try again." : "You found it!"}
            </h2>
         </div>

         {/* Cups Container */}
         <div className="relative w-full h-full flex items-end justify-center pb-[15%]">
            
            {/* Map over the logical cups but render them in the visual order defined by `order` */}
            <div className="relative w-[80%] max-w-lg h-32 flex items-end">
               {/* 
                   We use order array to determine where logical cup `i` should be placed visually.
                   positionIndex = order.indexOf(i)
               */}
               {[0, 1, 2].map((logicalCupIndex) => {
                  const positionIndex = order.indexOf(logicalCupIndex);
                  const isLifted = liftedCups[logicalCupIndex];
                  const hasBall = logicalCupIndex === ballCupIndex;

                  return (
                     <motion.div
                        key={logicalCupIndex}
                        layout
                        initial={false}
                        transition={{ 
                           type: "spring", 
                           stiffness: 300, 
                           damping: 30,
                           mass: 1
                        }}
                        className="absolute bottom-0 flex justify-center items-end"
                        style={{
                           width: "33.33%",
                           left: `${positionIndex * 33.33}%`
                        }}
                     >
                        
                        {/* The Ball/Key */}
                        {hasBall && (
                           <div className="absolute bottom-0 pb-2 flex justify-center w-full z-0">
                              <motion.div 
                                 className="w-10 h-10 rounded-full shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.5),_0_5px_10px_rgba(0,0,0,0.3)] bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center relative"
                              >
                                 <div className="absolute w-2 h-2 bg-white/60 rounded-full top-2 left-2" />
                              </motion.div>
                           </div>
                        )}

                        {/* The Cup */}
                        <motion.div 
                           className={`relative z-10 w-24 h-32 sm:w-32 sm:h-40 rounded-t-3xl rounded-b-md shadow-2xl flex flex-col justify-end overflow-hidden ${gameState === "guessing" ? "cursor-pointer hover:brightness-110 active:scale-95 transition-all" : "cursor-default"}`}
                           style={{ backgroundColor: primaryColor }}
                           animate={{ 
                              y: isLifted ? -120 : 0,
                              scale: isLifted ? 1.05 : 1
                           }}
                           transition={{ type: "spring", stiffness: 400, damping: 25 }}
                           onClick={() => handleCupClick(logicalCupIndex)}
                        >
                           {/* Cup Styling Details */}
                           <div className="absolute top-0 w-full h-8 bg-white/10 rounded-t-3xl" />
                           <div className="absolute bottom-0 w-full h-4 bg-black/20" />
                           <div className="w-full h-full border-x-[16px] sm:border-x-[24px] border-black/10" />
                        </motion.div>

                     </motion.div>
                  );
               })}
            </div>

         </div>

         {/* Start / Retry Button */}
         <AnimatePresence>
            {(gameState === "start" || gameState === "lost") && (
               <motion.div 
                  className="absolute bottom-[5%] z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
               >
                  <button 
                     onClick={startGame}
                     className="bg-slate-900 text-white font-black uppercase tracking-widest px-10 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform border-4 border-slate-700"
                  >
                     {gameState === "start" ? "Start Game" : "Try Again"}
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState !== "won" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  clearTimeouts();
                  setGameState("won");
                  setLiftedCups(prev => {
                     const next = [...prev];
                     next[ballCupIndex] = true;
                     return next;
                  });
               }}
               className="w-full bg-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-purple-500 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
