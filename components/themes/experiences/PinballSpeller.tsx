"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_WORD = "OPEN";
const GRAVITY = 800; // px/s^2
const FLIPPER_FORCE = -600; // px/s
const BALL_RADIUS = 15;
const BUMPER_RADIUS = 30;

interface Bumper {
   x: number;
   y: number;
   letter: string;
   isHit: boolean; // For visual flair
}

type GameState = "playing" | "won" | "lost";

export function PinballSpeller({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [spelledWord, setSpelledWord] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [ballsLeft, setBallsLeft] = useState(3);
  const [showPayload, setShowPayload] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  // Physics State
  const ballRef = useRef({ x: 150, y: 50, vx: 200, vy: 0 });
  const bumpersRef = useRef<Bumper[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const widthRef = useRef(300);
  const heightRef = useRef(500);

  // Initialize Bumpers
  useEffect(() => {
     // Create a static layout of bumpers with letters
     const targetLetters = TARGET_WORD.split("");
     const allLetters = [...targetLetters, "A", "E", "I", "O", "U"].sort(() => Math.random() - 0.5);
     
     const layout = [
        { cx: 0.3, cy: 0.2 }, { cx: 0.7, cy: 0.2 },
        { cx: 0.5, cy: 0.4 },
        { cx: 0.2, cy: 0.6 }, { cx: 0.8, cy: 0.6 }
     ];

     bumpersRef.current = layout.map((pos, i) => ({
        x: widthRef.current * pos.cx,
        y: heightRef.current * pos.cy,
        letter: allLetters[i % allLetters.length],
        isHit: false
     }));

     // Reset ball
     ballRef.current = { x: widthRef.current / 2, y: BALL_RADIUS, vx: (Math.random() - 0.5) * 400, vy: 0 };
  }, [ballsLeft]);

  // Main Loop
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1); // Cap dt
        lastTimeRef.current = time;

        if (gameState === "playing") {
           // Update Ball Physics
           const ball = ballRef.current;
           ball.vy += GRAVITY * dt;
           ball.x += ball.vx * dt;
           ball.y += ball.vy * dt;

           // Wall Collisions
           if (ball.x - BALL_RADIUS < 0) {
              ball.x = BALL_RADIUS;
              ball.vx *= -0.8;
           } else if (ball.x + BALL_RADIUS > widthRef.current) {
              ball.x = widthRef.current - BALL_RADIUS;
              ball.vx *= -0.8;
           }

           if (ball.y - BALL_RADIUS < 0) {
              ball.y = BALL_RADIUS;
              ball.vy *= -0.8;
           }

           // Bottom Death Pit
           if (ball.y - BALL_RADIUS > heightRef.current) {
              if (ballsLeft > 1) {
                 setBallsLeft(prev => prev - 1);
              } else {
                 setGameState("lost");
              }
              // Stop simulation for a frame
              return; 
           }

           // Bumper Collisions
           let newLetterHit = "";
           bumpersRef.current.forEach(bumper => {
              const dx = ball.x - bumper.x;
              const dy = ball.y - bumper.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < BALL_RADIUS + BUMPER_RADIUS) {
                 // Simple circular collision resolution
                 const nx = dx / dist;
                 const ny = dy / dist;
                 
                 // Push ball out
                 const overlap = (BALL_RADIUS + BUMPER_RADIUS) - dist;
                 ball.x += nx * overlap;
                 ball.y += ny * overlap;

                 // Reflect velocity with some bounce
                 const dot = ball.vx * nx + ball.vy * ny;
                 ball.vx = (ball.vx - 2 * dot * nx) * 0.8;
                 ball.vy = (ball.vy - 2 * dot * ny) * 0.8;
                 
                 // Add some chaos
                 ball.vx += (Math.random() - 0.5) * 100;

                 bumper.isHit = true;
                 setTimeout(() => { bumper.isHit = false; }, 100);

                 newLetterHit = bumper.letter;
              }
           });

           if (newLetterHit) {
              setSpelledWord(prev => {
                 const newWord = prev + newLetterHit;
                 if (TARGET_WORD.startsWith(newWord)) {
                    // Good letter!
                    if (newWord === TARGET_WORD) {
                       setGameState("won");
    onComplete?.();
                       setTimeout(() => setShowPayload(true), 1000);
                    }
                    return newWord;
                 } else if (TARGET_WORD.startsWith(newLetterHit)) {
                    // Wrong sequence, but could be start of new word
                    return newLetterHit;
                 } else {
                    // Reset
                    return "";
                 }
              });
           }
        }

        // Draw Frame
        ctx.clearRect(0, 0, widthRef.current, heightRef.current);

        // Draw Bumpers
        bumpersRef.current.forEach(bumper => {
           ctx.beginPath();
           ctx.arc(bumper.x, bumper.y, BUMPER_RADIUS, 0, Math.PI * 2);
           ctx.fillStyle = bumper.isHit ? "#fcd34d" : "#334155";
           ctx.fill();
           ctx.strokeStyle = primaryColor;
           ctx.lineWidth = 4;
           ctx.stroke();

           ctx.fillStyle = bumper.isHit ? "#000" : "#fff";
           ctx.font = "bold 24px monospace";
           ctx.textAlign = "center";
           ctx.textBaseline = "middle";
           ctx.fillText(bumper.letter, bumper.x, bumper.y);
        });

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#fff";

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, ballsLeft, primaryColor]);

  const triggerFlipper = (side: "left" | "right") => {
     if (gameState !== "playing") return;
     const ball = ballRef.current;
     // Only allow flip if ball is in lower half
     if (ball.y > heightRef.current / 2) {
        ball.vy = FLIPPER_FORCE;
        // Angle inwards slightly
        ball.vx += side === "left" ? 100 : -100;
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
    >
      
      {/* Arcade Cabinet Screen */}
      <div className="relative w-full max-w-[340px] h-[600px] bg-slate-800 border-[16px] border-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
         
         {/* Scoreboard */}
         <div className="w-full h-24 bg-black border-b-4 border-slate-700 flex flex-col items-center justify-center relative z-10 px-4">
            <div className="flex justify-between w-full text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
               <span>Balls: {ballsLeft}</span>
               <span>Target: {TARGET_WORD}</span>
            </div>
            <div className="font-mono text-3xl font-black text-amber-400 tracking-[0.3em]">
               {spelledWord.padEnd(TARGET_WORD.length, "_").split("").join(" ")}
            </div>
         </div>

         {/* Physics Canvas */}
         <div className="relative flex-1 w-full bg-slate-900 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            <canvas 
               ref={canvasRef}
               width={300}
               height={500}
               className="w-full h-full"
            />
            
            {/* Flippers Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 flex">
               <div 
                  className="flex-1 h-full cursor-pointer opacity-0 hover:opacity-10 bg-gradient-to-t from-white to-transparent transition-opacity flex items-end p-4 text-white font-black"
                  onClick={() => triggerFlipper("left")}
               >
                  FLIP
               </div>
               <div 
                  className="flex-1 h-full cursor-pointer opacity-0 hover:opacity-10 bg-gradient-to-t from-white to-transparent transition-opacity flex items-end justify-end p-4 text-white font-black"
                  onClick={() => triggerFlipper("right")}
               >
                  FLIP
               </div>
            </div>
         </div>
      </div>

      {/* Touch Instructions */}
      <div className="text-slate-500 text-xs uppercase tracking-widest mt-8 font-bold flex gap-8">
         <span>← Tap Left</span>
         <span>Tap Right →</span>
      </div>

      {gameState === "lost" && !showPayload && (
         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <div className="text-red-500 font-black text-6xl uppercase tracking-widest mb-8">Game Over</div>
            <button 
               onClick={() => {
                  setBallsLeft(3);
                  setSpelledWord("");
                  setGameState("playing");
               }}
               className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
            >
               Insert Coin
            </button>
         </div>
      )}

      {/* Payload Modal */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <motion.div 
                  className="bg-zinc-900 p-12 rounded-3xl max-w-2xl w-full text-center shadow-[0_0_100px_rgba(16,185,129,0.3)] border border-emerald-900 relative overflow-hidden"
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
               >
                  <div className="text-emerald-500 font-mono text-sm tracking-widest uppercase mb-8">
                     Jackpot Reached
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white">
                     {config.title}
                  </h1>
                  
                  <div className="w-16 h-1 mx-auto bg-emerald-500 mb-8" />

                  <p className="text-xl text-zinc-300 font-serif leading-relaxed">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !showPayload && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Gameplay
            </h2>
            <button 
               onClick={() => {
                  setSpelledWord(TARGET_WORD);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-400 transition-colors"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
