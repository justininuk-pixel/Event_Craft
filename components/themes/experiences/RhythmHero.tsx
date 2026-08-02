"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

interface NoteDef {
   id: string;
   lane: number; // 0 to 3
   timeMs: number; // When it should hit the strike zone
   hit: boolean;
   missed: boolean;
}

const LANES = 4;
const SPEED = 400; // pixels per second
const STRIKE_Y = 400; // Position of strike line from top of container
const HIT_WINDOW = 150; // ms
const SPAWN_OFFSET_Y = 0; // Where notes spawn

// Generate a random fun chart
const generateChart = (): NoteDef[] => {
   const notes: NoteDef[] = [];
   let time = 2000; // First note at 2s
   
   for (let i = 0; i < 30; i++) {
      notes.push({
         id: `note-${i}`,
         lane: Math.floor(Math.random() * LANES),
         timeMs: time,
         hit: false,
         missed: false
      });
      // Gap between 300ms and 800ms
      time += Math.random() * 500 + 300;
   }
   return notes;
};

export function RhythmHero({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Violet 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // Slate 950

  const [gameState, setGameState] = useState<GameState>("start");
  const [showPayload, setShowPayload] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  
  // Track visual feedback
  const [laneFlashes, setLaneFlashes] = useState<number[]>([0,0,0,0]); // Opacity of lane flash
  const [judgement, setJudgement] = useState<"PERFECT!" | "MISS!" | null>(null);
  
  // Game state refs for the loop
  const chartRef = useRef<NoteDef[]>([]);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  
  // Rendering state
  const [activeNotes, setActiveNotes] = useState<{ id: string, lane: number, y: number }[]>([]);

  // Sound placeholders (if they had actual audio, we'd play it here)
  const handleHit = () => {
     setCombo(c => c + 1);
     setScore(s => s + 100 + combo * 10);
     setJudgement("PERFECT!");
     setTimeout(() => setJudgement(null), 500);
  };

  const handleMiss = () => {
     setCombo(0);
     setJudgement("MISS!");
     setTimeout(() => setJudgement(null), 500);
  };

  const startGame = () => {
     chartRef.current = generateChart();
     setScore(0);
     setCombo(0);
     startTimeRef.current = performance.now();
     setGameState("playing");
  };

  // Main Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const updateLoop = (time: number) => {
        const elapsed = time - startTimeRef.current;
        
        const newActiveNotes: { id: string, lane: number, y: number }[] = [];
        let missedAny = false;

        for (let i = 0; i < chartRef.current.length; i++) {
           const note = chartRef.current[i];
           if (note.hit || note.missed) continue;

           // Time remaining until hit
           const timeToHit = note.timeMs - elapsed;
           
           // If missed by passing bottom
           if (timeToHit < -HIT_WINDOW) {
              note.missed = true;
              missedAny = true;
              continue;
           }

           // If it should be visible on screen
           // y = STRIKE_Y - (timeToHit / 1000) * SPEED
           const y = STRIKE_Y - (timeToHit / 1000) * SPEED;
           if (y > -50 && y < STRIKE_Y + 100) {
              newActiveNotes.push({ id: note.id, lane: note.lane, y });
           }
        }

        if (missedAny) {
           handleMiss();
        }

        setActiveNotes(newActiveNotes);

        // Win condition check (all notes processed)
        const allDone = chartRef.current.every(n => n.hit || n.missed);
        if (allDone && chartRef.current.length > 0) {
           const hits = chartRef.current.filter(n => n.hit).length;
           // If 80% accuracy
           if (hits / chartRef.current.length >= 0.8) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           } else {
              setGameState("lost");
           }
        } else {
           animationRef.current = requestAnimationFrame(updateLoop);
        }
     };

     animationRef.current = requestAnimationFrame(updateLoop);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState]);

  // Input Handling
  const handleLaneTap = (lane: number) => {
     if (gameState !== "playing") return;

     // Visual flash
     setLaneFlashes(prev => {
        const next = [...prev];
        next[lane] = 1;
        return next;
     });
     setTimeout(() => {
        setLaneFlashes(prev => {
           const next = [...prev];
           next[lane] = 0;
           return next;
        });
     }, 150);

     // Find closest active note in this lane
     const elapsed = performance.now() - startTimeRef.current;
     
     let closestNote = null;
     let minDiff = Infinity;

     for (let i = 0; i < chartRef.current.length; i++) {
        const note = chartRef.current[i];
        if (note.lane === lane && !note.hit && !note.missed) {
           const diff = Math.abs(note.timeMs - elapsed);
           if (diff < minDiff) {
              minDiff = diff;
              closestNote = note;
           }
        }
     }

     if (closestNote && minDiff <= HIT_WINDOW) {
        closestNote.hit = true;
        handleHit();
     } else if (closestNote && minDiff > HIT_WINDOW && minDiff < 300) {
        // Bad hit
        closestNote.missed = true;
        handleMiss();
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Keyboard support for desktop testing
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'd') handleLaneTap(0);
        if (e.key === 'f') handleLaneTap(1);
        if (e.key === 'j') handleLaneTap(2);
        if (e.key === 'k') handleLaneTap(3);
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]); // Need to rebind if handleLaneTap changes, but it doesn't really depend on state directly inside

  const laneColors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm h-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Top UI / Score */}
         <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">
            <div className="flex flex-col">
               <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Score</span>
               <span className="text-white font-mono text-xl">{score.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Combo</span>
               <span className={`font-black text-2xl ${combo > 10 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-white'}`}>
                  {combo}x
               </span>
            </div>
         </div>

         {/* Judgement Text */}
         <AnimatePresence>
            {judgement && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className={`absolute top-1/3 left-1/2 -translate-x-1/2 z-20 font-black italic text-4xl uppercase tracking-widest drop-shadow-lg ${judgement === 'PERFECT!' ? 'text-yellow-400' : 'text-red-500'}`}
               >
                  {judgement}
               </motion.div>
            )}
         </AnimatePresence>

         {/* The Highway */}
         <div 
            className="absolute inset-0 flex"
            style={{ perspective: "600px" }}
         >
            {/* Perspective wrapper for pseudo-3D if desired, but let's keep it clean 2D for robustness */}
            <div className="w-full h-full relative flex">
               {[0, 1, 2, 3].map(lane => (
                  <div key={lane} className="flex-1 relative border-r border-slate-800/50 last:border-0 h-full overflow-hidden">
                     
                     {/* Lane Background Flash */}
                     <div 
                        className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent transition-opacity duration-75"
                        style={{ opacity: laneFlashes[lane] }}
                     />

                     {/* Active Notes in this lane */}
                     {activeNotes.filter(n => n.lane === lane).map(note => (
                        <div 
                           key={note.id}
                           className="absolute w-[80%] left-[10%] h-6 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.5)] border border-white/50"
                           style={{ 
                              top: note.y,
                              backgroundColor: laneColors[lane]
                           }}
                        />
                     ))}

                  </div>
               ))}
               
               {/* Strike Line */}
               <div 
                  className="absolute left-0 w-full h-2 bg-white/30 z-10"
                  style={{ top: STRIKE_Y + 10 }}
               />
            </div>
         </div>

         {/* Bottom UI / Hit Buttons */}
         <div className="absolute bottom-6 left-0 w-full px-4 flex justify-between z-20 gap-2">
            {[0, 1, 2, 3].map(lane => (
               <button
                  key={lane}
                  onPointerDown={() => handleLaneTap(lane)}
                  className="flex-1 aspect-square rounded-full flex items-center justify-center relative overflow-hidden transition-transform active:scale-90"
                  style={{ backgroundColor: `${laneColors[lane]}40`, border: `2px solid ${laneColors[lane]}` }}
               >
                  <div 
                     className="absolute inset-0 transition-opacity duration-100"
                     style={{ backgroundColor: laneColors[lane], opacity: laneFlashes[lane] * 0.8 }}
                  />
                  {/* Inner ring */}
                  <div className="w-1/2 h-1/2 rounded-full border-2 border-white/50 pointer-events-none z-10" />
               </button>
            ))}
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-2 text-center px-4 leading-tight">
                     Rhythm Hero
                  </div>
                  <div className="text-violet-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap the buttons when<br/>notes cross the line.
                  </div>
                  <button 
                     onClick={startGame}
                     className="bg-violet-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Start Track
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-5xl uppercase tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,1)] mb-2">
                     Failed
                  </div>
                  <div className="text-red-300 font-medium tracking-widest uppercase mb-8">
                     Accuracy Too Low
                  </div>
                  <button 
                     onClick={startGame}
                     className="mt-4 px-8 py-3 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest shadow-lg hover:bg-red-500 transition-colors active:scale-95"
                  >
                     Retry
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_0_80px_rgba(139,92,246,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-violet-500 font-black uppercase tracking-widest mb-6 text-sm">Track Cleared</div>
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
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  chartRef.current.forEach(n => n.hit = true);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-violet-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-violet-500 transition-colors shadow-lg"
            >
               Auto-Play Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
