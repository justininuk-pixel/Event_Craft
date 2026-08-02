"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "playing" | "won" | "lost";

const COLORS = [
   "bg-red-500",
   "bg-blue-500",
   "bg-green-500",
   "bg-yellow-500",
   "bg-purple-500"
];

const CODE_LENGTH = 4;
const MAX_GUESSES = 10;

interface Feedback {
   black: number; // Correct color & position
   white: number; // Correct color, wrong position
}

export function MastermindCodebreaker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Purple 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  // Generate secret code once
  const secretCode = useMemo(() => {
     // A simple hash of the title to make it deterministic but "random" looking
     const titleStr = config.title || "secret";
     let hash = 0;
     for (let i = 0; i < titleStr.length; i++) {
        hash = ((hash << 5) - hash) + titleStr.charCodeAt(i);
        hash |= 0;
     }
     
     const code = [];
     for (let i = 0; i < CODE_LENGTH; i++) {
        const idx = Math.abs(hash + i * 17) % COLORS.length;
        code.push(COLORS[idx]);
     }
     return code;
  }, [config.title]);

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");

  const calculateFeedback = (guess: string[], secret: string[]): Feedback => {
     let black = 0;
     let white = 0;
     const guessCopy = [...guess];
     const secretCopy = [...secret];

     // Pass 1: exact matches (black)
     for (let i = 0; i < CODE_LENGTH; i++) {
        if (guessCopy[i] === secretCopy[i]) {
           black++;
           guessCopy[i] = "";
           secretCopy[i] = "";
        }
     }

     // Pass 2: color matches (white)
     for (let i = 0; i < CODE_LENGTH; i++) {
        if (guessCopy[i] !== "") {
           const matchIdx = secretCopy.indexOf(guessCopy[i]);
           if (matchIdx !== -1) {
              white++;
              secretCopy[matchIdx] = "";
           }
        }
     }

     return { black, white };
  };

  const handleColorClick = (color: string) => {
     if (gameState !== "playing" || currentGuess.length >= CODE_LENGTH) return;
     setCurrentGuess([...currentGuess, color]);
  };

  const handleRemovePeg = (index: number) => {
     if (gameState !== "playing") return;
     const newGuess = [...currentGuess];
     newGuess.splice(index, 1);
     setCurrentGuess(newGuess);
  };

  const handleSubmit = () => {
     if (currentGuess.length !== CODE_LENGTH || gameState !== "playing") return;

     const newGuesses = [...guesses, currentGuess];
     setGuesses(newGuesses);
     setCurrentGuess([]);

     const feedback = calculateFeedback(currentGuess, secretCode);
     if (feedback.black === CODE_LENGTH) {
        setGameState("won");
    onComplete?.();
     } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState("lost");
     }
  };

  useEffect(() => {
     if (gameState === "won" && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [gameState, onComplete]);

  // Render a single row of the board
  const renderRow = (rowIndex: number) => {
     const isSubmitted = rowIndex < guesses.length;
     const isActive = rowIndex === guesses.length;
     const isFuture = rowIndex > guesses.length;

     let pegs: string[] = [];
     let feedback: Feedback = { black: 0, white: 0 };

     if (isSubmitted) {
        pegs = guesses[rowIndex];
        feedback = calculateFeedback(pegs, secretCode);
     } else if (isActive) {
        pegs = currentGuess;
     }

     // Build feedback peg array
     const feedbackPegs = [];
     for (let i = 0; i < feedback.black; i++) feedbackPegs.push("bg-slate-900 border-slate-700");
     for (let i = 0; i < feedback.white; i++) feedbackPegs.push("bg-white border-slate-300");
     while (feedbackPegs.length < CODE_LENGTH) feedbackPegs.push("bg-slate-800/20 border-slate-800/40 shadow-inner");

     return (
        <div key={rowIndex} className={`flex items-center gap-4 p-2 rounded-xl border-2 transition-colors ${isActive ? "border-amber-400/50 bg-amber-400/10" : "border-transparent"}`}>
           {/* Row Number */}
           <div className="w-6 text-center text-amber-900/40 font-black text-sm select-none">
              {rowIndex + 1}
           </div>

           {/* Guess Pegs */}
           <div className="flex gap-2 sm:gap-3">
              {Array(CODE_LENGTH).fill(null).map((_, i) => {
                 const color = pegs[i];
                 return (
                    <div 
                       key={i}
                       onClick={() => isActive && color ? handleRemovePeg(i) : undefined}
                       className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 shadow-inner flex items-center justify-center transition-all ${
                          color 
                             ? `${color} border-white/20 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),_0_2px_4px_rgba(0,0,0,0.5)] ${isActive ? "cursor-pointer hover:scale-110" : ""}`
                             : "bg-amber-900/20 border-amber-900/30 shadow-[inset_0_4px_6px_rgba(0,0,0,0.5)]"
                       }`}
                    >
                       {isActive && color && <div className="w-2 h-2 rounded-full bg-white/40" />}
                    </div>
                 );
              })}
           </div>

           {/* Feedback Pegs (2x2 grid) */}
           <div className="grid grid-cols-2 gap-1 bg-amber-900/10 p-1.5 rounded-lg border border-amber-900/20 shadow-inner">
              {feedbackPegs.map((pegColor, i) => (
                 <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full border shadow-sm ${pegColor}`}
                 />
              ))}
           </div>
        </div>
     );
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000 bg-slate-900 p-4"
    >
      
      {/* Payload Background */}
      <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-50 z-0">
         <div className="max-w-2xl text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-slate-900">
               {config.title}
            </h1>
            <p className="text-xl md:text-2xl font-serif text-slate-700 leading-relaxed">
               {config.body}
            </p>
         </div>
      </div>

      {/* The Mastermind Board (Slides away when won) */}
      <AnimatePresence>
         {gameState !== "won" && (
            <motion.div 
               className="relative z-10 w-full max-w-md bg-amber-600 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-4 border-amber-700 flex flex-col overflow-hidden"
               exit={{ y: "120%", opacity: 0, scale: 0.9 }}
               transition={{ duration: 1, ease: "easeInOut" }}
            >
               {/* Wood Grain Texture Overlay */}
               <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] [background-size:10px_200px]" />

               {/* Header / Decoder area */}
               <div className="h-20 sm:h-24 bg-amber-800 border-b-4 border-amber-900 flex items-center justify-between px-6 relative shadow-inner z-10">
                  <div className="text-amber-500/50 font-black tracking-widest uppercase text-xl">
                     Secret Code
                  </div>
                  <div className="flex gap-2">
                     {Array(CODE_LENGTH).fill(null).map((_, i) => (
                        <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-900/80 border-2 border-amber-900/50 shadow-[inset_0_4px_6px_rgba(0,0,0,0.8)] flex items-center justify-center">
                           <span className="text-amber-700/50 font-bold text-sm">?</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* The Rows */}
               <div className="flex-1 flex flex-col-reverse justify-end items-center py-4 px-2 overflow-y-auto z-10 custom-scrollbar">
                  {Array(MAX_GUESSES).fill(null).map((_, i) => renderRow(i))}
               </div>

               {/* Footer / Controls */}
               <div className="bg-amber-800 border-t-4 border-amber-900 p-4 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                  
                  {gameState === "lost" ? (
                     <div className="text-center text-white font-black text-xl py-2">
                        CODE LOCKED FOREVER
                     </div>
                  ) : (
                     <div className="flex flex-col gap-4">
                        {/* Palette */}
                        <div className="flex justify-center gap-2 sm:gap-4">
                           {COLORS.map((c) => (
                              <button
                                 key={c}
                                 onClick={() => handleColorClick(c)}
                                 className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),_0_4px_8px_rgba(0,0,0,0.4)] transition-transform hover:scale-110 active:scale-95 ${c}`}
                              >
                                 <div className="w-3 h-3 rounded-full bg-white/30 mx-auto mt-1" />
                              </button>
                           ))}
                        </div>
                        
                        {/* Submit */}
                        <button
                           onClick={handleSubmit}
                           disabled={currentGuess.length !== CODE_LENGTH}
                           className="w-full py-3 rounded-xl bg-slate-900 text-amber-500 font-black uppercase tracking-widest border-2 border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-amber-400 transition-colors shadow-lg"
                        >
                           Submit Guess
                        </button>
                     </div>
                  )}
               </div>

            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  setGuesses([...guesses, secretCode]);
                  setGameState("won");
    onComplete?.();
               }}
               className="w-full bg-amber-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-amber-400 transition-colors"
            >
               Auto-Solve Bypass
            </button>
            <div className="mt-4 flex gap-1">
               {secretCode.map((c, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full ${c}`} />
               ))}
            </div>
         </div>
      )}
      
    </div>
  );
}
