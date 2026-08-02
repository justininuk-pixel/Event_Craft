"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won";
type EntityType = "mole" | "decoy" | "empty";

interface HoleState {
   id: number;
   type: EntityType;
   activeSince: number;
}

const TARGET_SCORE = 15;
const SPAWN_INTERVAL = 800; // ms between spawns
const ACTIVE_DURATION = 1200; // ms before entity disappears

export function WhackAMole({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Purple
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [holes, setHoles] = useState<HoleState[]>(Array(9).fill(null).map((_, i) => ({ id: i, type: "empty", activeSince: 0 })));
  const [flashRed, setFlashRed] = useState(false);

  const loopRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
     setScore(0);
     setHoles(holes.map(h => ({ ...h, type: "empty" })));
     setGameState("playing");
  };

  useEffect(() => {
     if (gameState === "playing") {
        loopRef.current = setInterval(() => {
           setHoles(currentHoles => {
              const now = Date.now();
              // First, clear any expired entities
              let newHoles = currentHoles.map(h => {
                 if (h.type !== "empty" && now - h.activeSince > ACTIVE_DURATION) {
                    return { ...h, type: "empty" as EntityType };
                 }
                 return h;
              });

              // Then, spawn 1 or 2 new entities in empty holes
              const emptyIndices = newHoles
                 .map((h, index) => h.type === "empty" ? index : -1)
                 .filter(index => index !== -1);

              if (emptyIndices.length > 0) {
                 const numToSpawn = Math.random() > 0.5 ? 2 : 1;
                 for (let i = 0; i < Math.min(numToSpawn, emptyIndices.length); i++) {
                    // Pick a random empty index
                    const randomIndexIndex = Math.floor(Math.random() * emptyIndices.length);
                    const holeIndex = emptyIndices[randomIndexIndex];
                    emptyIndices.splice(randomIndexIndex, 1); // remove from available

                    // 80% mole, 20% decoy
                    const isMole = Math.random() < 0.8;
                    newHoles[holeIndex] = {
                       ...newHoles[holeIndex],
                       type: isMole ? "mole" : "decoy",
                       activeSince: now
                    };
                 }
              }

              return newHoles;
           });
        }, SPAWN_INTERVAL);
     } else if (loopRef.current) {
        clearInterval(loopRef.current);
     }

     return () => {
        if (loopRef.current) clearInterval(loopRef.current);
     };
  }, [gameState]);

  const handleTap = (index: number) => {
     if (gameState !== "playing") return;

     const hole = holes[index];
     if (hole.type === "empty") return;

     if (hole.type === "mole") {
        const newScore = score + 1;
        setScore(newScore);
        
        // Immediately hide it
        setHoles(prev => {
           const next = [...prev];
           next[index] = { ...next[index], type: "empty" };
           return next;
        });

        if (newScore >= TARGET_SCORE) {
           setGameState("won");
    onComplete?.();
           setHoles(prev => prev.map(h => ({ ...h, type: "empty" })));
        }
     } else if (hole.type === "decoy") {
        setScore(prev => Math.max(0, prev - 2));
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 200);
        
        // Hide it
        setHoles(prev => {
           const next = [...prev];
           next[index] = { ...next[index], type: "empty" };
           return next;
        });
     }
  };

  useEffect(() => {
     if (gameState === "won" && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [gameState, onComplete]);

  return (
    <div 
      className={`w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center transition-colors duration-200 select-none ${flashRed ? "bg-red-500" : ""}`}
      style={{ backgroundColor: flashRed ? "#ef4444" : bgColors[0] }}
    >
      
      {/* Payload Container */}
      <AnimatePresence>
         {gameState === "won" && (
            <motion.div 
               className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 bg-amber-50"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  className="text-center max-w-2xl bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 drop-shadow-sm leading-tight">
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
      <div className={`relative z-10 w-full max-w-lg aspect-square flex flex-col items-center justify-center transition-all duration-1000 ${gameState === "won" ? "opacity-30 blur-md pointer-events-none scale-90" : "opacity-100"}`}>
         
         {/* HUD */}
         <div className="absolute -top-16 w-full flex justify-between px-4 items-end">
            <div className="text-slate-500 font-black tracking-widest uppercase">
               Goal: {TARGET_SCORE}
            </div>
            <div className="text-4xl font-black text-slate-800 tabular-nums">
               {score}
            </div>
         </div>

         {/* 3x3 Grid */}
         <div className="w-full h-full bg-emerald-800 rounded-3xl shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),_0_20px_40px_rgba(0,0,0,0.4)] p-4 sm:p-6 grid grid-cols-3 grid-rows-3 gap-4 sm:gap-6 border-8 border-emerald-900 relative">
            
            {/* Dirt Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] [background-size:12px_12px]" />

            {holes.map((hole, i) => (
               <div key={i} className="relative w-full h-full flex items-end justify-center perspective-1000">
                  
                  {/* The Hole Base */}
                  <div className="absolute bottom-0 w-[80%] h-[30%] bg-black/60 rounded-[100%] shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)]" />
                  
                  {/* The Masking Container */}
                  <div className="absolute bottom-[10%] w-[90%] h-[90%] overflow-hidden flex justify-center items-end pb-[5%]">
                     
                     {/* The Entity */}
                     <AnimatePresence>
                        {hole.type !== "empty" && (
                           <motion.div
                              initial={{ y: "100%" }}
                              animate={{ y: "0%" }}
                              exit={{ y: "100%", transition: { duration: 0.1 } }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className={`relative w-[70%] aspect-[3/4] rounded-t-[2rem] shadow-lg cursor-pointer ${
                                 hole.type === "mole" ? "" : "bg-red-600"
                              }`}
                              style={{ 
                                 backgroundColor: hole.type === "mole" ? primaryColor : undefined 
                              }}
                              onPointerDown={(e) => {
                                 e.preventDefault();
                                 handleTap(i);
                              }}
                           >
                              {/* Mole Visuals */}
                              {hole.type === "mole" && (
                                 <>
                                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-1/2 h-1/4 bg-white/20 rounded-full" />
                                    <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-slate-900 rounded-full" />
                                    <div className="absolute top-[30%] right-[25%] w-3 h-3 bg-slate-900 rounded-full" />
                                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-4 h-3 bg-pink-300 rounded-full" />
                                 </>
                              )}

                              {/* Decoy Visuals (Bomb/Spike) */}
                              {hole.type === "decoy" && (
                                 <>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-slate-900 -translate-y-full" />
                                    <div className="absolute top-[30%] left-[20%] w-[60%] h-2 bg-slate-900" />
                                    <div className="absolute top-[40%] left-[40%] w-[20%] h-[40%] bg-white/30" />
                                 </>
                              )}
                           </motion.div>
                        )}
                     </AnimatePresence>

                  </div>

                  {/* Hole Front Lip (Creates depth) */}
                  <div className="absolute bottom-0 w-[80%] h-[15%] bg-emerald-900 rounded-b-[100%] border-t border-black/20 z-10" />
               </div>
            ))}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-lg mb-2 text-center">
                     Whack-A-Mole
                  </div>
                  <div className="text-emerald-300 font-bold mb-8 text-center px-8 text-sm">
                     Tap the targets (+1). Avoid the red decoys (-2). Reach {TARGET_SCORE} points to unlock.
                  </div>
                  <button 
                     onClick={startGame}
                     className="bg-white text-emerald-900 font-black uppercase tracking-widest px-10 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform border-4 border-slate-200"
                  >
                     Start Game
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setScore(TARGET_SCORE);
                  setGameState("won");
    onComplete?.();
                  setHoles(holes.map(h => ({ ...h, type: "empty" })));
               }}
               className="w-full bg-emerald-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-500 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
