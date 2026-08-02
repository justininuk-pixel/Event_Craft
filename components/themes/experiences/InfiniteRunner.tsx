"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

const GRAVITY = 2500; // px/s^2
const JUMP_IMPULSE = -800; // px/s
const BASE_SPEED = 300; // px/s
const WIN_SCORE = 500; // Roughly 15-20 seconds of survival
const GROUND_Y = 280;
const PLAYER_SIZE = 30;

interface Obstacle {
   x: number;
   w: number;
   h: number;
}

export function InfiniteRunner({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // Slate 100

  // Physics State
  const playerRef = useRef({ y: GROUND_Y, vy: 0, isGrounded: true });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const widthRef = useRef(600); // Internal logic width, scales to canvas CSS
  const heightRef = useRef(400);

  const initGame = () => {
     playerRef.current = { y: GROUND_Y, vy: 0, isGrounded: true };
     obstaclesRef.current = [];
     scoreRef.current = 0;
     setScore(0);
     setGameState("playing");
  };

  const jump = () => {
     if (gameState === "start" || gameState === "lost") {
        initGame();
     } else if (gameState === "playing" && playerRef.current.isGrounded) {
        playerRef.current.vy = JUMP_IMPULSE;
        playerRef.current.isGrounded = false;
     }
  };

  // Main Loop
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        if (gameState === "playing") {
           const player = playerRef.current;
           const currentSpeed = BASE_SPEED + (scoreRef.current * 0.5); // Speed increases with score

           // Update Score
           scoreRef.current += currentSpeed * dt * 0.1;
           const displayScore = Math.floor(scoreRef.current);
           setScore(displayScore);

           // Win Condition
           if (displayScore >= WIN_SCORE) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 2000);
           }

           // Physics Player
           if (!player.isGrounded) {
              player.vy += GRAVITY * dt;
              player.y += player.vy * dt;
              
              if (player.y >= GROUND_Y) {
                 player.y = GROUND_Y;
                 player.vy = 0;
                 player.isGrounded = true;
              }
           }

           // Obstacles
           const obs = obstaclesRef.current;
           
           // Spawn logic
           if (obs.length === 0 || obs[obs.length - 1].x < widthRef.current - 300) {
              if (Math.random() > 0.95 && displayScore < WIN_SCORE - 20) {
                 obs.push({
                    x: widthRef.current + 50,
                    w: 20 + Math.random() * 20,
                    h: 30 + Math.random() * 40
                 });
              }
           }

           for (let i = obs.length - 1; i >= 0; i--) {
              const o = obs[i];
              o.x -= currentSpeed * dt;

              // AABB Collision
              const px = 50;
              const py = player.y - PLAYER_SIZE;
              const pw = PLAYER_SIZE;
              const ph = PLAYER_SIZE;

              const ox = o.x;
              const oy = GROUND_Y - o.h;
              const ow = o.w;
              const oh = o.h;

              if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
                 // Hit!
                 setGameState("lost");
              }

              if (o.x + o.w < 0) {
                 obs.splice(i, 1);
              }
           }
        }

        // --- DRAWING ---
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);

        // Ground
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(0, GROUND_Y, widthRef.current, heightRef.current - GROUND_Y);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(widthRef.current, GROUND_Y);
        ctx.stroke();

        // Parallax clouds/bg based on scoreRef
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        for (let i = 0; i < 5; i++) {
           const cx = ((i * 200) - (scoreRef.current * 0.5) + widthRef.current * 10) % widthRef.current;
           ctx.beginPath();
           ctx.arc(cx, 50 + (i % 2) * 30, 20, 0, Math.PI * 2);
           ctx.arc(cx + 20, 50 + (i % 2) * 30, 30, 0, Math.PI * 2);
           ctx.arc(cx + 40, 50 + (i % 2) * 30, 20, 0, Math.PI * 2);
           ctx.fill();
        }

        // Finish Line if won
        if (gameState === "won") {
           const finishX = Math.max(150, widthRef.current - ((scoreRef.current - WIN_SCORE) * 10));
           ctx.fillStyle = "#fbbf24"; // Castle color
           ctx.fillRect(finishX, GROUND_Y - 150, 100, 150);
           ctx.fillStyle = "#b45309";
           ctx.fillRect(finishX + 30, GROUND_Y - 50, 40, 50); // Door
           
           // Player walks to door
           if (playerRef.current.isGrounded) {
              const px = 50 + (scoreRef.current - WIN_SCORE) * 5;
              ctx.fillStyle = primaryColor;
              ctx.fillRect(Math.min(px, finishX + 35), playerRef.current.y - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
           }
        } else {
           // Draw Player
           ctx.fillStyle = primaryColor;
           ctx.fillRect(50, playerRef.current.y - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
           
           // Draw Obstacles
           ctx.fillStyle = "#ef4444"; // Red obstacles
           obstaclesRef.current.forEach(o => {
              ctx.fillRect(o.x, GROUND_Y - o.h, o.w, o.h);
           });
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, primaryColor, bgColors]);

  // Keyboard controls
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space" || e.code === "ArrowUp") {
           e.preventDefault();
           jump();
        }
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

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
      
      {/* Game Canvas Container */}
      <div 
         className={`relative w-full max-w-2xl aspect-[3/2] shadow-2xl overflow-hidden cursor-pointer bg-white transition-all duration-1000 ${gameState === "won" ? "border-4 border-amber-400 rounded-[3rem]" : "border-8 border-slate-800 rounded-lg"}`}
         onPointerDown={(e) => {
            e.preventDefault();
            jump();
         }}
      >
         <canvas 
            ref={canvasRef}
            width={600}
            height={400}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${showPayload ? "opacity-0" : "opacity-100"}`}
         />

         {/* Score Overlay */}
         <div className={`absolute top-4 right-6 z-10 pointer-events-none transition-opacity ${showPayload ? "opacity-0" : "opacity-100"}`}>
            <span className="text-3xl font-mono font-black text-slate-800">
               HI {String(WIN_SCORE).padStart(5, '0')} {String(score).padStart(5, '0')}
            </span>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] pointer-events-none"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-slate-800 font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-sm mb-4">
                     Infinite Runner
                  </div>
                  <div className="bg-slate-900 text-white px-8 py-3 rounded-md font-bold uppercase animate-pulse">
                     Tap or Space to Jump
                  </div>
               </motion.div>
            )}

            {/* Lost Overlay */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-slate-800 font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-8">
                     Game Over
                  </div>
                  <div className="bg-slate-900 text-white px-8 py-3 rounded-md font-bold uppercase shadow-lg">
                     Tap to Try Again
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Payload Layer */}
         <AnimatePresence>
            {showPayload && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 bg-amber-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
               >
                  <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.5, duration: 0.8 }}
                     className="text-center"
                  >
                     <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900">
                        {config.title}
                     </h1>
                     <p className="text-xl md:text-2xl text-slate-700 font-serif leading-relaxed">
                        {config.body}
                     </p>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  scoreRef.current = WIN_SCORE;
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
