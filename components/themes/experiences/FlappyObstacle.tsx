"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

const GRAVITY = 1200; // px/s^2
const JUMP_IMPULSE = -400; // px/s
const PIPE_SPEED = 180; // px/s
const PIPE_WIDTH = 60;
const PIPE_GAP = 200; // Forgiving gap
const PLAYER_SIZE = 30;
const WIN_SCORE = 10;

interface Pipe {
   x: number;
   topHeight: number;
   passed: boolean;
}

export function FlappyObstacle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#87CEEB"]; // Sky blue

  // Physics State
  const playerRef = useRef({ y: 250, vy: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const widthRef = useRef(320);
  const heightRef = useRef(480);
  const bgOffsetRef = useRef(0);

  const initGame = () => {
     playerRef.current = { y: heightRef.current / 2, vy: 0 };
     pipesRef.current = [];
     setScore(0);
     setGameState("playing");
  };

  const jump = () => {
     if (gameState === "start" || gameState === "lost") {
        initGame();
     } else if (gameState === "playing") {
        playerRef.current.vy = JUMP_IMPULSE;
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
           const pipes = pipesRef.current;

           // Apply Gravity
           player.vy += GRAVITY * dt;
           player.y += player.vy * dt;

           // Floor / Ceiling Collision
           if (player.y + PLAYER_SIZE / 2 > heightRef.current || player.y - PLAYER_SIZE / 2 < 0) {
              setGameState("lost");
           }

           // Spawn Pipes
           if (pipes.length === 0 || pipes[pipes.length - 1].x < widthRef.current - 250) {
              // Only spawn if we haven't reached WIN_SCORE yet
              // Wait, pipes are spawned ahead of time. So spawn up to WIN_SCORE pipes.
              // Actually, just spawn indefinitely, we stop checking after WIN_SCORE.
              const topH = Math.random() * (heightRef.current - PIPE_GAP - 100) + 50;
              pipes.push({
                 x: widthRef.current,
                 topHeight: topH,
                 passed: false
              });
           }

           // Update Pipes and Check Collision
           for (let i = pipes.length - 1; i >= 0; i--) {
              const p = pipes[i];
              p.x -= PIPE_SPEED * dt;

              // Check collision
              const pLeft = p.x;
              const pRight = p.x + PIPE_WIDTH;
              const pTopBottom = p.topHeight;
              const pBotTop = p.topHeight + PIPE_GAP;

              const plLeft = 50 - PLAYER_SIZE / 2; // Player is fixed at x=50
              const plRight = 50 + PLAYER_SIZE / 2;
              const plTop = player.y - PLAYER_SIZE / 2;
              const plBot = player.y + PLAYER_SIZE / 2;

              if (plRight > pLeft && plLeft < pRight) {
                 if (plTop < pTopBottom || plBot > pBotTop) {
                    setGameState("lost");
                 }
              }

              // Check pass
              if (!p.passed && plLeft > pRight) {
                 p.passed = true;
                 setScore(s => {
                    const newScore = s + 1;
                    if (newScore === WIN_SCORE) {
                       setGameState("won");
    onComplete?.();
                       setTimeout(() => setShowPayload(true), 1500);
                    }
                    return newScore;
                 });
              }

              // Remove offscreen
              if (p.x + PIPE_WIDTH < 0) {
                 pipes.splice(i, 1);
              }
           }
           
           // Scroll BG
           bgOffsetRef.current = (bgOffsetRef.current + (PIPE_SPEED * 0.2) * dt) % widthRef.current;
        }

        // --- DRAWING ---
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);

        // Draw parallax mountains (simple triangles)
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let i = 0; i < 3; i++) {
           const ox = ((i * 200) - bgOffsetRef.current + widthRef.current) % (widthRef.current + 200) - 100;
           ctx.beginPath();
           ctx.moveTo(ox, heightRef.current);
           ctx.lineTo(ox + 100, heightRef.current - 150);
           ctx.lineTo(ox + 200, heightRef.current);
           ctx.fill();
        }

        // Draw Pipes
        ctx.fillStyle = "#22c55e"; // Green
        pipesRef.current.forEach(p => {
           // Top pipe
           ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
           ctx.fillRect(p.x - 4, p.topHeight - 20, PIPE_WIDTH + 8, 20); // Cap
           
           // Bottom pipe
           ctx.fillRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, heightRef.current);
           ctx.fillRect(p.x - 4, p.topHeight + PIPE_GAP, PIPE_WIDTH + 8, 20); // Cap
           
           // Outline
           ctx.strokeStyle = "#166534";
           ctx.lineWidth = 3;
           ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topHeight);
           ctx.strokeRect(p.x - 4, p.topHeight - 20, PIPE_WIDTH + 8, 20);
           ctx.strokeRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, heightRef.current);
           ctx.strokeRect(p.x - 4, p.topHeight + PIPE_GAP, PIPE_WIDTH + 8, 20);
        });

        // Draw Player (Envelope)
        const py = playerRef.current.y;
        ctx.save();
        ctx.translate(50, py);
        
        // Tilt based on velocity
        let rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (playerRef.current.vy * 0.002)));
        if (gameState === "start") rotation = 0;
        ctx.rotate(rotation);

        ctx.fillStyle = "#fff";
        ctx.fillRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE * 0.7);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE * 0.7);
        
        // Envelope flap
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE/2, -PLAYER_SIZE/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(PLAYER_SIZE/2, -PLAYER_SIZE/2);
        ctx.stroke();

        ctx.restore();

        // Draw "Finish Line" if won
        if (gameState === "won") {
           // Move player offscreen right
           playerRef.current.y += playerRef.current.vy * dt;
           // Fake moving forward
           ctx.fillStyle = "rgba(255,255,255,0.8)";
           ctx.fillRect(widthRef.current / 2, 0, 20, heightRef.current);
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, primaryColor]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none bg-slate-900"
    >
      
      {/* Game Canvas Container */}
      <div 
         className="relative w-full max-w-sm h-[80vh] max-h-[600px] border-8 border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden cursor-pointer bg-white"
         onPointerDown={(e) => {
            e.preventDefault();
            jump();
         }}
      >
         <canvas 
            ref={canvasRef}
            width={320}
            height={480}
            className="w-full h-full object-cover"
         />

         {/* Score Overlay */}
         <div className="absolute top-8 left-0 w-full text-center z-10 pointer-events-none">
            <span className="text-5xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: "2px black" }}>
               {score}
            </span>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-3xl uppercase tracking-widest drop-shadow-lg mb-4">
                     Flappy Mail
                  </div>
                  <div className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase animate-pulse">
                     Tap to Fly
                  </div>
               </motion.div>
            )}

            {/* Lost Overlay */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-8">
                     Game Over
                  </div>
                  <div className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase shadow-lg">
                     Tap to Try Again
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Payload Modal */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <motion.div 
                  className="bg-white p-10 rounded-3xl max-w-lg w-full text-center shadow-[0_0_100px_rgba(255,255,255,0.2)] border-4 border-slate-200 relative overflow-hidden"
                  initial={{ scale: 0.8, y: 50, rotate: -5 }}
                  animate={{ scale: 1, y: 0, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
               >
                  <div className="absolute top-0 left-0 w-full h-3 bg-blue-500" />
                  
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6">
                     <span className="text-4xl">✉️</span>
                  </div>

                  <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900">
                     {config.title}
                  </h1>
                  
                  <p className="text-lg text-slate-600 font-serif leading-relaxed">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !showPayload && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setScore(WIN_SCORE);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
