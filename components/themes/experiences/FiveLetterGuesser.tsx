"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "playing" | "won" | "lost";
type KeyStatus = "correct" | "present" | "absent" | "unused";

export function FiveLetterGuesser({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [shakeRow, setShakeRow] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // Green 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  // Extract a 5-letter word from the title, or default to "EVENT"
  const targetWord = useMemo(() => {
     const words = (config.title || "").toUpperCase().replace(/[^A-Z\s]/g, "").split(/\s+/);
     const fiveLetter = words.find(w => w.length === 5);
     return fiveLetter || "EVENT";
  }, [config.title]);

  const onKeyPress = useCallback((key: string) => {
     if (gameState !== "playing") return;

     if (key === "ENTER") {
        if (currentGuess.length !== 5) {
           // Shake animation for invalid length
           setShakeRow(true);
           setTimeout(() => setShakeRow(false), 500);
           return;
        }
        
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess === targetWord) {
           setGameState("won");
    onComplete?.();
        } else if (newGuesses.length === 6) {
           setGameState("lost");
        }
     } else if (key === "BACKSPACE" || key === "DELETE") {
        setCurrentGuess(prev => prev.slice(0, -1));
     } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
           setCurrentGuess(prev => prev + key);
        }
     }
  }, [currentGuess, guesses, gameState, targetWord]);

  // Physical Keyboard listener
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        
        const key = e.key.toUpperCase();
        if (key === "ENTER" || key === "BACKSPACE") {
           onKeyPress(key);
        } else if (/^[A-Z]$/.test(key)) {
           onKeyPress(key);
        }
     };

     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);

  // Calculate Key Statuses for the Virtual Keyboard
  const keyStatuses = useMemo(() => {
     const statuses: Record<string, KeyStatus> = {};
     
     guesses.forEach(guess => {
        const targetChars = targetWord.split("");
        
        // Pass 1: find correct (green)
        for (let i = 0; i < 5; i++) {
           if (guess[i] === targetChars[i]) {
              statuses[guess[i]] = "correct";
              targetChars[i] = ""; // consume
           }
        }
        
        // Pass 2: find present (yellow)
        for (let i = 0; i < 5; i++) {
           if (guess[i] !== targetWord[i]) {
              const idx = targetChars.indexOf(guess[i]);
              if (idx > -1) {
                 if (statuses[guess[i]] !== "correct") {
                    statuses[guess[i]] = "present";
                 }
                 targetChars[idx] = ""; // consume
              } else {
                 if (statuses[guess[i]] !== "correct" && statuses[guess[i]] !== "present") {
                    statuses[guess[i]] = "absent";
                 }
              }
           }
        }
     });
     
     return statuses;
  }, [guesses, targetWord]);

  // Render a single row
  const renderRow = (word: string, isSubmitted: boolean, isCurrentRow: boolean) => {
     const tiles = [];
     const targetChars = targetWord.split("");
     const statuses: KeyStatus[] = Array(5).fill("unused");

     if (isSubmitted) {
        // Pass 1: Correct
        for (let i = 0; i < 5; i++) {
           if (word[i] === targetChars[i]) {
              statuses[i] = "correct";
              targetChars[i] = ""; // consume
           }
        }
        // Pass 2: Present
        for (let i = 0; i < 5; i++) {
           if (word[i] !== targetWord[i] && word[i]) {
              const idx = targetChars.indexOf(word[i]);
              if (idx > -1) {
                 statuses[i] = "present";
                 targetChars[idx] = ""; // consume
              } else {
                 statuses[i] = "absent";
              }
           }
        }
     }

     for (let i = 0; i < 5; i++) {
        const char = word[i] || "";
        const status = statuses[i];
        
        let bgColor = "bg-transparent";
        let borderColor = "border-slate-300";
        let textColor = "text-slate-800";

        if (isSubmitted) {
           textColor = "text-white";
           borderColor = "border-transparent";
           if (status === "correct") bgColor = "bg-green-500";
           else if (status === "present") bgColor = "bg-yellow-500";
           else bgColor = "bg-slate-500";
        } else if (char) {
           borderColor = "border-slate-500";
        }

        tiles.push(
           <motion.div
              key={i}
              className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-3xl font-bold uppercase transition-colors duration-500 ${bgColor} ${borderColor} ${textColor}`}
              initial={isSubmitted ? { rotateX: 90 } : false}
              animate={isSubmitted ? { rotateX: 0 } : false}
              transition={{ delay: i * 0.1, duration: 0.4 }}
           >
              {char}
           </motion.div>
        );
     }

     return (
        <motion.div 
           className="flex gap-2 mb-2"
           animate={isCurrentRow && shakeRow ? { x: [-10, 10, -10, 10, 0] } : {}}
           transition={{ duration: 0.4 }}
        >
           {tiles}
        </motion.div>
     );
  };

  useEffect(() => {
     if (gameState === "won" && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [gameState, onComplete]);

  const KeyboardRow = ({ keys }: { keys: string[] }) => (
     <div className="flex gap-1 sm:gap-2 justify-center mb-2">
        {keys.map(k => {
           const status = keyStatuses[k] || "unused";
           let keyBg = "bg-slate-200 text-slate-800";
           if (status === "correct") keyBg = "bg-green-500 text-white";
           else if (status === "present") keyBg = "bg-yellow-500 text-white";
           else if (status === "absent") keyBg = "bg-slate-400 text-white";

           const isAction = k === "ENTER" || k === "BACKSPACE";

           return (
              <button
                 key={k}
                 onClick={() => onKeyPress(k)}
                 className={`h-14 flex items-center justify-center rounded font-bold uppercase select-none transition-colors ${keyBg} ${isAction ? "px-3 sm:px-4 text-xs sm:text-sm" : "w-8 sm:w-10 text-sm sm:text-base"}`}
              >
                 {k === "BACKSPACE" ? "⌫" : k}
              </button>
           );
        })}
     </div>
  );

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-between py-8 sm:py-12 transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="w-full max-w-lg px-4 border-b border-slate-200 pb-4 flex justify-between items-center z-10">
         <h1 className="text-3xl font-black tracking-tighter text-slate-900">GUESSER</h1>
         <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm" />
            <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
            <div className="w-4 h-4 bg-slate-500 rounded-sm" />
         </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 p-4">
         <AnimatePresence>
            {gameState !== "won" ? (
               <motion.div exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}>
                  {Array(6).fill(null).map((_, i) => {
                     const isSubmitted = i < guesses.length;
                     const isCurrentRow = i === guesses.length;
                     const word = isSubmitted ? guesses[i] : (isCurrentRow ? currentGuess : "");
                     return (
                        <React.Fragment key={i}>
                           {renderRow(word, isSubmitted, isCurrentRow)}
                        </React.Fragment>
                     );
                  })}
               </motion.div>
            ) : (
               <motion.div 
                  className="text-center max-w-2xl px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
               >
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-slate-900">
                     {config.title}
                  </h1>
                  <p className="text-xl md:text-2xl font-serif text-slate-700 leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

         {gameState === "lost" && (
            <motion.div 
               className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold tracking-widest uppercase"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
            >
               Target: {targetWord}
            </motion.div>
         )}
      </div>

      {/* Keyboard */}
      <div className={`w-full max-w-3xl px-2 z-10 transition-opacity duration-1000 ${gameState === "won" ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
         <KeyboardRow keys={["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]} />
         <div className="px-4 sm:px-6">
            <KeyboardRow keys={["A", "S", "D", "F", "G", "H", "J", "K", "L"]} />
         </div>
         <KeyboardRow keys={["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]} />
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  setGuesses([...guesses, targetWord]);
                  setGameState("won");
    onComplete?.();
               }}
               className="w-full bg-green-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-green-400 transition-colors"
            >
               Auto-Solve Bypass
            </button>
            <div className="text-xs text-slate-400 mt-2">Target is: {targetWord}</div>
         </div>
      )}
      
    </div>
  );
}
