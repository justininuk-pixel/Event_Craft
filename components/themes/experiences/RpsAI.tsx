"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "tie";

const TARGET_WINS = 2; // Best 2 out of 3
const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const EMOJIS: Record<Choice, string> = {
   rock: "🪨",
   paper: "📄",
   scissors: "✂️"
};

// What beats what
const BEATS: Record<Choice, Choice> = {
   rock: "scissors",
   paper: "rock",
   scissors: "paper"
};

const LOSES_TO: Record<Choice, Choice> = {
   rock: "paper",
   paper: "scissors",
   scissors: "rock"
};

export function RpsAI({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // Gray 900

  const [userWins, setUserWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [history, setHistory] = useState<Choice[]>([]);
  
  const [phase, setPhase] = useState<"idle" | "revealing" | "result" | "won" | "lost">("idle");
  const [currentChoice, setCurrentChoice] = useState<{ user: Choice; ai: Choice } | null>(null);
  const [roundResult, setRoundResult] = useState<Result | null>(null);
  
  const [showPayload, setShowPayload] = useState(false);

  // --- AI Logic ---
  const predictNextUserMove = (): Choice => {
     // If history too short, pick random
     if (history.length < 2) {
        return CHOICES[Math.floor(Math.random() * CHOICES.length)];
     }

     const lastMove = history[history.length - 1];
     
     // Find all times user played lastMove, and look at the NEXT move they played
     const nextMoveCounts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
     
     for (let i = 0; i < history.length - 1; i++) {
        if (history[i] === lastMove) {
           const followingMove = history[i + 1];
           nextMoveCounts[followingMove]++;
        }
     }

     // Find most frequent following move
     let maxCount = -1;
     let predictedMove: Choice | null = null;
     
     for (const c of CHOICES) {
        if (nextMoveCounts[c] > maxCount) {
           maxCount = nextMoveCounts[c];
           predictedMove = c;
        }
     }

     // If no data (all 0), pick random
     if (maxCount === 0 || !predictedMove) {
        return CHOICES[Math.floor(Math.random() * CHOICES.length)];
     }

     // The AI predicts user will play `predictedMove`. 
     // AI should play what beats the predicted move.
     return LOSES_TO[predictedMove];
  };

  const handlePlay = (userChoice: Choice) => {
     if (phase !== "idle") return;

     const aiChoice = predictNextUserMove();
     
     setCurrentChoice({ user: userChoice, ai: aiChoice });
     setHistory(prev => [...prev, userChoice]);
     setPhase("revealing");

     // Determine outcome
     let result: Result = "tie";
     if (BEATS[userChoice] === aiChoice) result = "win";
     if (BEATS[aiChoice] === userChoice) result = "lose";
     
     setRoundResult(result);

     // Sequence
     setTimeout(() => {
        setPhase("result");
        
        // Update score
        if (result === "win") setUserWins(w => w + 1);
        if (result === "lose") setAiWins(w => w + 1);

        setTimeout(() => {
           // Check match condition
           setUserWins(currentUW => {
              setAiWins(currentAW => {
                 const newUW = result === "win" ? currentUW + 1 : currentUW;
                 const newAW = result === "lose" ? currentAW + 1 : currentAW;
                 
                 if (newUW >= TARGET_WINS) {
                    setPhase("won");
    onComplete?.();
                    setTimeout(() => setShowPayload(true), 1500);
                 } else if (newAW >= TARGET_WINS) {
                    setPhase("lost");
                 } else {
                    setPhase("idle");
                    setCurrentChoice(null);
                 }
                 return currentAW;
              });
              return currentUW;
           });
        }, 1500); // How long result shows
     }, 1000); // How long reveal animation takes
  };

  const handleRestart = () => {
     setUserWins(0);
     setAiWins(0);
     setHistory([]);
     setPhase("idle");
     setCurrentChoice(null);
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
      
      {/* Game Viewport Container */}
      <div className={`relative w-full max-w-sm aspect-[3/5] bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${phase === "won" ? "scale-95 opacity-40 blur-sm pointer-events-none" : "scale-100"}`}>
         
         {/* Top UI: Scoreboard */}
         <div className="flex-none p-4 flex flex-col items-center justify-center bg-gray-950 border-b border-gray-800 z-20">
            <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs opacity-50 mb-2">
               Best 2 of 3
            </h2>
            <div className="flex w-full justify-between items-center px-4">
               {/* AI Score */}
               <div className="flex flex-col items-center">
                  <div className="text-red-500 font-bold uppercase text-[10px] tracking-widest mb-1">Cyborg</div>
                  <div className="flex gap-1">
                     {[...Array(TARGET_WINS)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < aiWins ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-gray-800"}`} />
                     ))}
                  </div>
               </div>
               
               <div className="text-gray-600 font-black text-xl italic">VS</div>

               {/* User Score */}
               <div className="flex flex-col items-center">
                  <div className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest mb-1">Human</div>
                  <div className="flex gap-1">
                     {[...Array(TARGET_WINS)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < userWins ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-gray-800"}`} />
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Middle UI: The Arena */}
         <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
            {/* Background flair */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
               {phase === "idle" && (
                  <motion.div 
                     key="idle"
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.2 }}
                     className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm animate-pulse"
                  >
                     Make your move
                  </motion.div>
               )}

               {(phase === "revealing" || phase === "result") && currentChoice && (
                  <motion.div 
                     key="battle"
                     className="w-full h-full flex flex-col items-center justify-between py-12 relative"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                  >
                     {/* AI Choice (Top, rotates in from top) */}
                     <motion.div
                        className="text-7xl drop-shadow-[0_10px_20px_rgba(239,68,68,0.3)] filter grayscale opacity-80"
                        initial={{ y: -100, rotateX: 90 }}
                        animate={{ y: 0, rotateX: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                     >
                        {EMOJIS[currentChoice.ai]}
                     </motion.div>

                     {/* Clash Effect */}
                     <AnimatePresence>
                        {phase === "result" && (
                           <motion.div 
                              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black italic text-4xl uppercase tracking-widest ${
                                 roundResult === "win" ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,1)]" :
                                 roundResult === "lose" ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]" :
                                 "text-gray-400"
                              }`}
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ type: "spring", bounce: 0.6 }}
                           >
                              {roundResult === "win" ? "Win" : roundResult === "lose" ? "Lose" : "Draw"}
                           </motion.div>
                        )}
                     </AnimatePresence>

                     {/* User Choice (Bottom, rotates in from bottom) */}
                     <motion.div
                        className="text-7xl drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
                        initial={{ y: 100, rotateX: -90 }}
                        animate={{ y: 0, rotateX: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                     >
                        {EMOJIS[currentChoice.user]}
                     </motion.div>
                  </motion.div>
               )}

               {phase === "lost" && (
                  <motion.div 
                     key="lost"
                     className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-sm z-30"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                  >
                     <div className="text-red-500 font-black text-4xl uppercase tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,1)]">
                        Defeated
                     </div>
                     <div className="text-red-300 font-medium mb-8 uppercase tracking-widest text-xs">
                        The machine learned your patterns.
                     </div>
                     <button 
                        onClick={handleRestart}
                        className="px-8 py-3 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg active:scale-95"
                     >
                        Rematch
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Bottom UI: Controls */}
         <div className="flex-none p-6 bg-gray-950 border-t border-gray-800 z-20">
            <div className="flex justify-between gap-3">
               {CHOICES.map(choice => (
                  <button
                     key={choice}
                     disabled={phase !== "idle"}
                     onClick={() => handlePlay(choice)}
                     className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-200 ${
                        phase === "idle" 
                           ? "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-500 active:scale-95" 
                           : "bg-gray-900 border-gray-900 opacity-50 cursor-not-allowed"
                     }`}
                  >
                     <span className="text-3xl mb-1">{EMOJIS[choice]}</span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{choice}</span>
                  </button>
               ))}
            </div>
         </div>

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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(16,185,129,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-emerald-500 font-black uppercase tracking-widest mb-6">Algorithm Defeated</div>
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
      {mode === "editor-preview" && phase !== "won" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setPhase("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
