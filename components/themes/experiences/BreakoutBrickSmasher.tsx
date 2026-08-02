"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

const BRICK_ROWS = 4;
const BRICK_COLS = 5;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BALL_SPEED = 300; // px/s

interface Brick {
   x: number;
   y: number;
   w: number;
   h: number;
   status: 1 | 0; // 1 = active, 0 = broken
   color: string;
}

export function BreakoutBrickSmasher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showPayload, setShowPayload] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // Yellow 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // Slate 800

  // Physics State
  const paddleXRef = useRef<number>(150);
  const ballRef = useRef({ x: 150, y: 300, vx: BALL_SPEED, vy: -BALL_SPEED });
  const bricksRef = useRef<Brick[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const widthRef = useRef(320);
  const heightRef = useRef(480);

  const totalBricks = BRICK_ROWS * BRICK_COLS;

  const initGame = () => {
     // Setup Bricks
     const newBricks: Brick[] = [];
     const padding = 10;
     const offsetTop = 40;
     const offsetLeft = 10;
     const brickW = (widthRef.current - offsetLeft * 2 - padding * (BRICK_COLS - 1)) / BRICK_COLS;
     const brickH = 25;

     const brickColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

     for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
           newBricks.push({
              x: offsetLeft + c * (brickW + padding),
              y: offsetTop + r * (brickH + padding),
              w: brickW,
              h: brickH,
              status: 1,
              color: brickColors[r % brickColors.length]
           });
        }
     }
     bricksRef.current = newBricks;

     // Setup Ball & Paddle
     paddleXRef.current = widthRef.current / 2 - PADDLE_WIDTH / 2;
     ballRef.current = { 
        x: widthRef.current / 2, 
        y: heightRef.current - 50 - BALL_RADIUS, 
        vx: BALL_SPEED * 0.8 * (Math.random() > 0.5 ? 1 : -1), 
        vy: -BALL_SPEED 
     };

     setScore(0);
     setLives(3);
     setGameState("playing");
  };

  const handlePointerMove = (e: React.PointerEvent | PointerEvent) => {
     if (!containerRef.current || gameState !== "playing") return;
     const rect = containerRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     
     let relativeX = (e.clientX - rect.left) * scaleX;
     if (relativeX > 0 && relativeX < widthRef.current) {
        paddleXRef.current = relativeX - PADDLE_WIDTH / 2;
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
           const ball = ballRef.current;
           const paddleX = paddleXRef.current;

           // Move Ball
           ball.x += ball.vx * dt;
           ball.y += ball.vy * dt;

           // Wall Collision
           if (ball.x + BALL_RADIUS > widthRef.current) {
              ball.x = widthRef.current - BALL_RADIUS;
              ball.vx = -Math.abs(ball.vx);
           } else if (ball.x - BALL_RADIUS < 0) {
              ball.x = BALL_RADIUS;
              ball.vx = Math.abs(ball.vx);
           }

           if (ball.y - BALL_RADIUS < 0) {
              ball.y = BALL_RADIUS;
              ball.vy = Math.abs(ball.vy);
           }

           // Paddle Collision
           // Paddle is at bottom: 50px offset
           const paddleY = heightRef.current - 40;
           
           if (
              ball.y + BALL_RADIUS > paddleY &&
              ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT &&
              ball.x > paddleX &&
              ball.x < paddleX + PADDLE_WIDTH
           ) {
              ball.vy = -Math.abs(ball.vy); // Bounce up
              // Add some english based on where it hit the paddle
              const hitPos = (ball.x - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
              ball.vx = ball.vx * 0.5 + hitPos * BALL_SPEED; // Speed up and change angle
              ball.y = paddleY - BALL_RADIUS; // Push out
           }

           // Bottom Death
           if (ball.y + BALL_RADIUS > heightRef.current) {
              setLives(l => {
                 const newLives = l - 1;
                 if (newLives <= 0) {
                    setGameState("lost");
                 } else {
                    // Reset ball
                    ball.x = paddleX + PADDLE_WIDTH / 2;
                    ball.y = paddleY - BALL_RADIUS - 10;
                    ball.vx = BALL_SPEED * 0.8 * (Math.random() > 0.5 ? 1 : -1);
                    ball.vy = -BALL_SPEED;
                 }
                 return newLives;
              });
           }

           // Brick Collision
           for (let i = 0; i < bricksRef.current.length; i++) {
              const b = bricksRef.current[i];
              if (b.status === 1) {
                 // AABB vs Circle
                 const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
                 const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));

                 const distanceX = ball.x - closestX;
                 const distanceY = ball.y - closestY;
                 const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

                 if (distanceSquared < (BALL_RADIUS * BALL_RADIUS)) {
                    // Hit!
                    b.status = 0;
                    
                    // Bounce (simple resolution)
                    if (ball.x < b.x || ball.x > b.x + b.w) {
                       ball.vx = -ball.vx;
                    } else {
                       ball.vy = -ball.vy;
                    }

                    setScore(s => {
                       const ns = s + 1;
                       if (ns === totalBricks) {
                          setGameState("won");
    onComplete?.();
                          setTimeout(() => setShowPayload(true), 1500);
                       }
                       return ns;
                    });
                 }
              }
           }
        }

        // --- DRAWING ---
        // We use destination-out to clear the background where the bricks AREN'T, 
        // effectively making the canvas a solid color that has holes punched in it.
        // Wait, easier: Just draw the bricks and paddle. The canvas is transparent. 
        // The container underneath has the text.
        
        ctx.clearRect(0, 0, widthRef.current, heightRef.current);

        if (gameState !== "won") {
           // Draw an opaque overlay that we cut holes out of? No, concept says "covered entirely by a wall of bricks".
           // But what about the space *between* bricks? Let's just draw a solid color overlay, 
           // and as bricks break, they literally reveal the background. We can do this by drawing the overlay, 
           // then cutting out the broken bricks. Or just make the bricks massive so there's no gaps.
           
           // Opaque background that hides the message
           ctx.fillStyle = bgColors[0];
           ctx.fillRect(0, 0, widthRef.current, heightRef.current);
           
           // Clear out the areas where bricks have broken
           ctx.globalCompositeOperation = 'destination-out';
           bricksRef.current.forEach(b => {
              if (b.status === 0) {
                 // Expand slightly to clear gaps too if we want, or just leave holes
                 ctx.fillRect(b.x - 5, b.y - 5, b.w + 10, b.h + 10);
              }
           });
           ctx.globalCompositeOperation = 'source-over';

           // Draw remaining bricks on top
           bricksRef.current.forEach(b => {
              if (b.status === 1) {
                 ctx.fillStyle = b.color;
                 ctx.fillRect(b.x, b.y, b.w, b.h);
                 // Highlight
                 ctx.fillStyle = "rgba(255,255,255,0.3)";
                 ctx.fillRect(b.x, b.y, b.w, b.h / 3);
                 // Outline
                 ctx.strokeStyle = "rgba(0,0,0,0.5)";
                 ctx.lineWidth = 2;
                 ctx.strokeRect(b.x, b.y, b.w, b.h);
              }
           });

           // Draw Paddle
           if (gameState === "playing" || gameState === "start") {
              ctx.fillStyle = primaryColor;
              const py = heightRef.current - 40;
              ctx.fillRect(paddleXRef.current, py, PADDLE_WIDTH, PADDLE_HEIGHT);
              ctx.fillStyle = "rgba(255,255,255,0.3)";
              ctx.fillRect(paddleXRef.current, py, PADDLE_WIDTH, PADDLE_HEIGHT / 2);
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 2;
              ctx.strokeRect(paddleXRef.current, py, PADDLE_WIDTH, PADDLE_HEIGHT);
           }

           // Draw Ball
           if (gameState === "playing" || gameState === "start") {
              ctx.beginPath();
              ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
              ctx.fillStyle = "#fff";
              ctx.fill();
              ctx.strokeStyle = "#000";
              ctx.stroke();
           }
        } else {
           // Fully reveal
           ctx.clearRect(0, 0, widthRef.current, heightRef.current);
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, totalBricks, primaryColor, bgColors]);

  // Pointer event listener for the document when playing
  useEffect(() => {
     const handleMove = (e: PointerEvent) => handlePointerMove(e);
     if (gameState === "playing") {
        window.addEventListener("pointermove", handleMove);
     }
     return () => window.removeEventListener("pointermove", handleMove);
  }, [gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none bg-slate-900"
    >
      
      {/* Game Container */}
      <div 
         ref={containerRef}
         className="relative w-full max-w-md h-[80vh] max-h-[600px] border-8 border-slate-700 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white cursor-none"
      >
         {/* Payload Layer (Underneath Canvas) */}
         <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center bg-slate-50 z-0">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 drop-shadow-sm">
               {config.title}
            </h1>
            <p className="text-xl text-slate-700 font-serif leading-relaxed">
               {config.body}
            </p>
         </div>

         {/* Physics Canvas (Overlay) */}
         <canvas 
            ref={canvasRef}
            width={320}
            height={480}
            className="absolute inset-0 w-full h-full z-10 touch-none"
         />

         {/* UI Overlays */}
         <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
            <div className="text-white font-mono font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               SCORE: {score}
            </div>
            <div className="text-white font-mono font-bold text-sm flex gap-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               {Array(lives).fill("❤️").join("")}
            </div>
         </div>

         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-yellow-400 font-black text-4xl uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-8" style={{ WebkitTextStroke: "1px black" }}>
                     Breakout
                  </div>
                  <button 
                     onClick={initGame}
                     className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black uppercase shadow-[0_4px_0_#a16207] active:shadow-[0_0px_0_#a16207] active:translate-y-1 transition-all"
                  >
                     Tap to Break In
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-8">
                     Game Over
                  </div>
                  <button 
                     onClick={initGame}
                     className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !showPayload && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setScore(totalBricks);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
