"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { revealCardStyles } from "@/lib/themes/revealStyle";

type GameState = "start" | "playing" | "won" | "lost";

interface Point {
   x: number;
   y: number;
}

const GRID_SIZE = 15; // 15x15 grid
const INITIAL_SPEED = 200; // ms per tick

export function SnakeGame({
  theme,
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  // Creator-configured win target (apples to eat), set in the editor's Experience panel.
  const rawTarget = Number(config.experience?.targetScore ?? theme.experienceDefaults?.targetScore ?? 10);
  const TARGET_SCORE = Number.isFinite(rawTarget) && rawTarget > 0 ? Math.min(100, Math.round(rawTarget)) : 10;

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900
  const revealStyles = revealCardStyles(config);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  // Game Logic State
  const snakeRef = useRef<Point[]>([{ x: 7, y: 7 }, { x: 7, y: 8 }]);
  const dirRef = useRef<Point>({ x: 0, y: -1 }); // Moving UP
  const nextDirRef = useRef<Point>({ x: 0, y: -1 }); // Queue next turn
  const appleRef = useRef<Point>({ x: 10, y: 3 });
  
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const spawnApple = (currentSnake: Point[]) => {
     let newApple: Point = { x: 0, y: 0 };
     let isValid = false;
     while (!isValid) {
        newApple = {
           x: Math.floor(Math.random() * GRID_SIZE),
           y: Math.floor(Math.random() * GRID_SIZE)
        };
        // Ensure not on snake
        isValid = !currentSnake.some(s => s.x === newApple.x && s.y === newApple.y);
     }
     appleRef.current = newApple;
  };

  const startGame = () => {
     setScore(0);
     snakeRef.current = [{ x: 7, y: 7 }, { x: 7, y: 8 }];
     dirRef.current = { x: 0, y: -1 };
     nextDirRef.current = { x: 0, y: -1 };
     spawnApple(snakeRef.current);
     setGameState("playing");
  };

  // Drawing
  const draw = () => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const w = canvas.width;
     const h = canvas.height;
     const cellW = w / GRID_SIZE;
     const cellH = h / GRID_SIZE;

     // Background
     ctx.fillStyle = "#1e293b"; // Slate 800
     ctx.fillRect(0, 0, w, h);

     // Draw Grid subtle
     ctx.strokeStyle = "rgba(255,255,255,0.05)";
     ctx.lineWidth = 1;
     ctx.beginPath();
     for (let i = 0; i <= w; i += cellW) {
        ctx.moveTo(i, 0); ctx.lineTo(i, h);
     }
     for (let i = 0; i <= h; i += cellH) {
        ctx.moveTo(0, i); ctx.lineTo(w, i);
     }
     ctx.stroke();

     // Draw Apple
     const ax = appleRef.current.x * cellW;
     const ay = appleRef.current.y * cellH;
     ctx.fillStyle = "#ef4444"; // Red 500
     ctx.beginPath();
     ctx.arc(ax + cellW/2, ay + cellH/2, cellW/2 - 2, 0, Math.PI * 2);
     ctx.fill();

     // Draw Snake
     ctx.fillStyle = primaryColor;
     const snake = snakeRef.current;
     snake.forEach((s, i) => {
        const sx = s.x * cellW;
        const sy = s.y * cellH;
        
        // Head gets slightly different styling
        if (i === 0) {
           ctx.fillStyle = "#34d399"; // lighter green
           ctx.beginPath();
           ctx.roundRect(sx + 1, sy + 1, cellW - 2, cellH - 2, 4);
           ctx.fill();
        } else {
           ctx.fillStyle = primaryColor;
           ctx.fillRect(sx + 1, sy + 1, cellW - 2, cellH - 2);
        }
     });
  };

  // Main Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const tick = () => {
        // Apply queued direction (prevents 180 degree instant death on fast double-taps)
        dirRef.current = nextDirRef.current;

        const snake = [...snakeRef.current];
        const head = snake[0];
        
        const newHead = {
           x: head.x + dirRef.current.x,
           y: head.y + dirRef.current.y
        };

        // Check Wall Collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
           setGameState("lost");
           return;
        }

        // Check Self Collision
        if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
           setGameState("lost");
           return;
        }

        // Move head forward
        snake.unshift(newHead);

        // Check Apple
        if (newHead.x === appleRef.current.x && newHead.y === appleRef.current.y) {
           // Ate apple! Don't pop tail.
           setScore(s => {
              const newScore = s + 1;
              if (newScore >= TARGET_SCORE) {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 1500);
              } else {
                 spawnApple(snake);
              }
              return newScore;
           });
        } else {
           // Normal move, remove tail
           snake.pop();
        }

        snakeRef.current = snake;
        draw();
     };

     // Speed increases slightly as score goes up
     const speedMult = Math.max(0.4, 1 - (score / TARGET_SCORE) * 0.4);
     tickTimerRef.current = setInterval(tick, INITIAL_SPEED * speedMult);

     return () => {
        if (tickTimerRef.current) clearInterval(tickTimerRef.current);
     };
  }, [gameState, score, TARGET_SCORE]);

  // Ensure drawing runs even when not ticking (initial state)
  useEffect(() => {
     draw();
  }, [gameState]);

  // Input Handling: Keyboard
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState !== "playing") return;
        const currentDir = dirRef.current;
        
        switch (e.key) {
           case "ArrowUp":
           case "w":
              if (currentDir.y === 0) nextDirRef.current = { x: 0, y: -1 };
              break;
           case "ArrowDown":
           case "s":
              if (currentDir.y === 0) nextDirRef.current = { x: 0, y: 1 };
              break;
           case "ArrowLeft":
           case "a":
              if (currentDir.x === 0) nextDirRef.current = { x: -1, y: 0 };
              break;
           case "ArrowRight":
           case "d":
              if (currentDir.x === 0) nextDirRef.current = { x: 1, y: 0 };
              break;
        }
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Input Handling: Swipe
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
     // Prevent default to stop page scrolling while playing
     if (gameState === "playing" && e.cancelable) e.preventDefault();
     touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
     if (gameState === "playing" && e.cancelable) e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
     if (!touchStartRef.current || gameState !== "playing") return;
     if (e.cancelable) e.preventDefault();

     const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
     const dx = touchEnd.x - touchStartRef.current.x;
     const dy = touchEnd.y - touchStartRef.current.y;
     
     if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // Ignore taps

     const currentDir = dirRef.current;

     if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && currentDir.x === 0) nextDirRef.current = { x: 1, y: 0 };
        else if (dx < 0 && currentDir.x === 0) nextDirRef.current = { x: -1, y: 0 };
     } else {
        // Vertical swipe
        if (dy > 0 && currentDir.y === 0) nextDirRef.current = { x: 0, y: 1 };
        else if (dy < 0 && currentDir.y === 0) nextDirRef.current = { x: 0, y: -1 };
     }

     touchStartRef.current = null;
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Adding non-passive touch listeners manually to ensure preventDefault works
  useEffect(() => {
     const el = containerRef.current;
     if (!el) return;

     const pd = (e: TouchEvent) => {
        if (gameState === "playing") e.preventDefault();
     };

     el.addEventListener("touchmove", pd, { passive: false });
     return () => el.removeEventListener("touchmove", pd);
  }, [gameState]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Area Container */}
      <div 
         ref={containerRef}
         className={`relative w-full max-w-sm aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-900 transition-all duration-1000 flex flex-col ${gameState === "won" ? "border-2 border-transparent scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-700 rounded-[2rem]"}`}
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
      >
         
         {/* HUD Top Bar */}
         <div className="absolute top-0 w-full px-6 py-4 flex justify-between z-20 pointer-events-none">
            <div className="text-white font-black uppercase tracking-widest text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               Snake
            </div>
            <div className="text-white font-mono font-bold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               SCORE: {score}/{TARGET_SCORE}
            </div>
         </div>

         {/* Physics Canvas */}
         <canvas 
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute inset-0 w-full h-full touch-none z-10"
         />

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Snake
                  </div>
                  <div className="text-emerald-300 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest leading-relaxed">
                     Swipe or use Arrow Keys to move.<br/>Eat {TARGET_SCORE} apples without crashing.
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-emerald-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     Play Game
                  </button>
               </motion.div>
            )}

            {/* Lost Overlay */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Crashed!
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     Score: {score}
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full shadow-[0_0_100px_rgba(16,185,129,0.3)] relative overflow-hidden"
                  style={revealStyles.container}
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-emerald-500 font-black uppercase tracking-widest mb-6" style={{ textAlign: revealStyles.title.textAlign }}>High Score Achieved</div>
                  <h1 className="font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight" style={revealStyles.title}>
                     {config.title || theme.content.title}
                  </h1>
                  <p className="text-slate-700 font-serif leading-relaxed whitespace-pre-wrap" style={revealStyles.body}>
                     {config.body || theme.content.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setScore(TARGET_SCORE);
                  setGameState("won");
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
