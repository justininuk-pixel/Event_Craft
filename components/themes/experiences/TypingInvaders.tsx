"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

interface ActiveWord {
   id: number;
   text: string;
   x: number; // 0-100 percentage
   y: number; // 0-100 percentage
   speed: number;
}

const TARGET_SCORE = 10;
const SPAWN_INTERVAL = 1500; // ms
const FALL_SPEED_BASE = 5; // percentage per second

const WORD_BANK = [
   "PARTY", "CAKE", "GIFT", "SMILE", "CHEERS", 
   "CELEBRATE", "HAPPY", "FUN", "MAGIC", "WISH", 
   "SURPRISE", "JOY", "LOVE", "BALLOON", "MUSIC"
];

export function TypingInvaders({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899"; // Pink 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [words, setWords] = useState<ActiveWord[]>([]);
  const [showPayload, setShowPayload] = useState(false);

  const wordsRef = useRef<ActiveWord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const nextIdRef = useRef<number>(0);

  const startGame = () => {
     setScore(0);
     setCurrentInput("");
     setWords([]);
     wordsRef.current = [];
     lastTimeRef.current = performance.now();
     spawnTimerRef.current = 0;
     setGameState("playing");
     setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
     }, 100);
  };

  // Main Game Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        spawnTimerRef.current += dt * 1000;

        // Spawn logic
        if (spawnTimerRef.current > SPAWN_INTERVAL) {
           spawnTimerRef.current = 0;
           
           // Pick random word
           const text = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
           const x = 10 + Math.random() * 80; // 10% to 90%
           
           // Speed increases slightly as score goes up
           const speedMult = 1 + (score / TARGET_SCORE) * 0.5;
           
           const newWord: ActiveWord = {
              id: nextIdRef.current++,
              text,
              x,
              y: -10, // Start just above screen
              speed: FALL_SPEED_BASE * speedMult
           };
           
           wordsRef.current = [...wordsRef.current, newWord];
        }

        // Gravity logic
        let lost = false;
        wordsRef.current = wordsRef.current.map(w => {
           const newY = w.y + w.speed * dt * 1.5; // adjust multiplier for actual feel
           if (newY >= 100) lost = true;
           return { ...w, y: newY };
        });

        if (lost) {
           setGameState("lost");
        } else {
           setWords([...wordsRef.current]);
           animationRef.current = requestAnimationFrame(render);
        }
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, score]);

  // Input Handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (gameState !== "playing") return;
     
     const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
     setCurrentInput(val);

     // Check for exact matches
     const matchIndex = wordsRef.current.findIndex(w => w.text === val);
     
     if (matchIndex !== -1) {
        // Destroyed!
        wordsRef.current = wordsRef.current.filter((_, i) => i !== matchIndex);
        setWords([...wordsRef.current]);
        setCurrentInput("");
        if (inputRef.current) inputRef.current.value = ""; // clear underlying input
        
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= TARGET_SCORE) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     } else {
        // Check if val is a prefix of ANY word. If not, maybe clear it?
        // For a more forgiving experience, we clear input if it matches NOTHING as a prefix
        const isPrefixOfAny = wordsRef.current.some(w => w.text.startsWith(val));
        if (!isPrefixOfAny && val.length > 0) {
           // Provide a tiny visual shake maybe, but for now just clear to avoid them getting stuck
           setCurrentInput("");
           if (inputRef.current) inputRef.current.value = "";
        }
     }
  };

  // Keep input focused
  const handleContainerClick = () => {
     if (gameState === "playing" && inputRef.current) {
        inputRef.current.focus();
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: bgColors[0] }}
      onClick={handleContainerClick}
    >
      
      {/* Hidden Mobile Input */}
      <input 
         ref={inputRef}
         type="text"
         className="absolute opacity-0 pointer-events-none -left-[1000px]"
         value={currentInput}
         onChange={handleInputChange}
         autoComplete="off"
         autoCorrect="off"
         autoCapitalize="off"
         spellCheck="false"
      />

      {/* Game Area */}
      <div className={`relative w-full max-w-md aspect-[3/4] shadow-2xl overflow-hidden flex flex-col transition-all duration-1000 ${gameState === "won" ? "border-2 border-transparent scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-[2rem] bg-slate-900"}`}>
         
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:20px_20px]" />

         {/* HUD */}
         <div className="absolute top-4 left-0 w-full px-6 flex justify-between z-20 pointer-events-none">
            <div className="text-white font-mono font-bold text-lg drop-shadow-md">
               SCORE: {score}/{TARGET_SCORE}
            </div>
         </div>

         {/* Falling Words */}
         <div className="relative flex-1 w-full overflow-hidden">
            <AnimatePresence>
               {words.map(w => {
                  // Determine how much of the word has been typed correctly
                  let typedPart = "";
                  let untypedPart = w.text;
                  
                  if (w.text.startsWith(currentInput)) {
                     typedPart = currentInput;
                     untypedPart = w.text.slice(currentInput.length);
                  }

                  return (
                     <motion.div
                        key={w.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                        className="absolute whitespace-nowrap font-black text-2xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        style={{
                           left: `${w.x}%`,
                           top: `${w.y}%`,
                           transform: "translateX(-50%)"
                        }}
                     >
                        <span style={{ color: primaryColor }}>{typedPart}</span>
                        <span className="text-white/80">{untypedPart}</span>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>

         {/* Danger Zone (Bottom Line) */}
         <div className="absolute bottom-0 w-full h-2 bg-red-500/50" />
         <div className="absolute bottom-2 w-full text-center text-red-500/50 font-black text-xs tracking-widest uppercase">
            Danger Zone
         </div>

         {/* Current Input Buffer Visual */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-white font-mono text-xl tracking-widest min-w-[150px] text-center">
            {currentInput || <span className="opacity-30 text-sm">TYPE...</span>}
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Typing Invaders
                  </div>
                  <div className="text-pink-300 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest">
                     Type the words before they hit the ground!<br/>Reach {TARGET_SCORE} to win.
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     Start Typing
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Game Over
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     Invasion Successful
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-white text-red-900 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-pink-500 font-black uppercase tracking-widest mb-6">Invasion Defeated</div>
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
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setScore(TARGET_SCORE);
                  setGameState("won");
    onComplete?.();
                  setWords([]);
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-pink-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-pink-400 transition-colors shadow-lg"
            >
               Auto-Type Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
