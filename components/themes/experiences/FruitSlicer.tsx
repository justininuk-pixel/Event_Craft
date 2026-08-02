"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won";

interface Point {
   x: number;
   y: number;
   time: number;
}

interface Fruit {
   id: number;
   x: number;
   y: number;
   vx: number;
   vy: number;
   emoji: string;
   size: number;
   rotation: number;
   rotSpeed: number;
}

interface Particle {
   x: number;
   y: number;
   vx: number;
   vy: number;
   life: number;
   color: string;
}

const TARGET_SCORE = 10;
const GRAVITY = 600; // px/s^2
const EMOJIS = ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🥝", "🍍"];
const MAX_TRAIL_AGE = 150; // ms

export function FruitSlicer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  // Physics State
  const widthRef = useRef(400);
  const heightRef = useRef(600);
  
  const trailRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const fruitsRef = useRef<Fruit[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const spawnTimerRef = useRef<number>(0);
  const nextIdRef = useRef<number>(0);

  const startGame = () => {
     setScore(0);
     fruitsRef.current = [];
     particlesRef.current = [];
     trailRef.current = [];
     lastTimeRef.current = performance.now();
     spawnTimerRef.current = 0;
     setGameState("playing");
  };

  // Drawing Input Handlers
  const getCanvasPoint = (clientX: number, clientY: number) => {
     if (!canvasRef.current) return null;
     const rect = canvasRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     const scaleY = heightRef.current / rect.height;
     return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        time: performance.now()
     };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     const pt = getCanvasPoint(e.clientX, e.clientY);
     if (pt) {
        isDrawingRef.current = true;
        trailRef.current = [pt];
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDrawingRef.current || gameState !== "playing") return;
     const pt = getCanvasPoint(e.clientX, e.clientY);
     if (pt) {
        trailRef.current.push(pt);
     }
  };

  const handlePointerUp = () => {
     isDrawingRef.current = false;
     // don't clear immediately, let the age filter remove them so we see the fade out
  };

  // Line intersection with Circle (fruit)
  // Simple check: distance from line segment to center of fruit < radius
  const checkSlice = (p1: Point, p2: Point, fruit: Fruit) => {
     const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
     if (l2 === 0) return Math.hypot(fruit.x - p1.x, fruit.y - p1.y) < fruit.size / 2;
     
     let t = ((fruit.x - p1.x) * (p2.x - p1.x) + (fruit.y - p1.y) * (p2.y - p1.y)) / l2;
     t = Math.max(0, Math.min(1, t));
     
     const closestX = p1.x + t * (p2.x - p1.x);
     const closestY = p1.y + t * (p2.y - p1.y);
     
     return Math.hypot(fruit.x - closestX, fruit.y - closestY) < fruit.size / 2;
  };

  // Main Physics Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = time;

        spawnTimerRef.current += dt * 1000;

        // Spawn Fruit
        if (spawnTimerRef.current > 1200 - (score * 50)) { // Gets slightly faster
           spawnTimerRef.current = 0;
           fruitsRef.current.push({
              id: nextIdRef.current++,
              x: 100 + Math.random() * (widthRef.current - 200),
              y: heightRef.current + 50,
              vx: (Math.random() - 0.5) * 200,
              vy: -600 - Math.random() * 200,
              emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
              size: 50 + Math.random() * 20,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 5
           });
        }

        // Clean up old trail points
        trailRef.current = trailRef.current.filter(pt => time - pt.time < MAX_TRAIL_AGE);

        // Update Physics
        let slicedCountThisFrame = 0;

        fruitsRef.current = fruitsRef.current.filter(f => {
           f.x += f.vx * dt;
           f.y += f.vy * dt;
           f.vy += GRAVITY * dt;
           f.rotation += f.rotSpeed * dt;

           // Check slice
           let isSliced = false;
           if (trailRef.current.length > 1) {
              const latestPt = trailRef.current[trailRef.current.length - 1];
              const prevPt = trailRef.current[trailRef.current.length - 2];
              if (checkSlice(prevPt, latestPt, f)) {
                 isSliced = true;
              }
           }

           if (isSliced) {
              slicedCountThisFrame++;
              // Spawn Particles
              for (let i = 0; i < 10; i++) {
                 particlesRef.current.push({
                    x: f.x,
                    y: f.y,
                    vx: f.vx * 0.5 + (Math.random() - 0.5) * 300,
                    vy: f.vy * 0.5 + (Math.random() - 0.5) * 300,
                    life: 1.0,
                    color: primaryColor
                 });
              }
              return false; // Remove fruit
           }

           // Remove if fell off bottom
           if (f.y > heightRef.current + 100 && f.vy > 0) return false;
           return true;
        });

        if (slicedCountThisFrame > 0) {
           setScore(s => {
              const newScore = s + slicedCountThisFrame;
              if (newScore >= TARGET_SCORE) {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 1500);
              }
              return newScore;
           });
        }

        particlesRef.current = particlesRef.current.filter(p => {
           p.x += p.vx * dt;
           p.y += p.vy * dt;
           p.vy += GRAVITY * dt;
           p.life -= dt * 2;
           return p.life > 0;
        });

        // --- DRAWING ---
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);

        // Draw Score Background
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.font = "900 120px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${score}`, widthRef.current / 2, heightRef.current / 2);

        // Draw Particles
        particlesRef.current.forEach(p => {
           ctx.fillStyle = p.color;
           ctx.globalAlpha = Math.max(0, p.life);
           ctx.beginPath();
           ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
           ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw Fruits
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        fruitsRef.current.forEach(f => {
           ctx.save();
           ctx.translate(f.x, f.y);
           ctx.rotate(f.rotation);
           ctx.font = `${f.size}px sans-serif`;
           ctx.fillText(f.emoji, 0, 0);
           ctx.restore();
        });

        // Draw Trail
        if (trailRef.current.length > 1) {
           ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
           ctx.lineCap = "round";
           ctx.lineJoin = "round";
           ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
           ctx.shadowBlur = 10;
           
           ctx.beginPath();
           ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
           for (let i = 1; i < trailRef.current.length; i++) {
              ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
           }
           
           // Fade thickness based on age? 
           ctx.lineWidth = 6;
           ctx.stroke();
           ctx.shadowBlur = 0;
        }

        if (gameState === "playing") {
           animationRef.current = requestAnimationFrame(render);
        }
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, score, primaryColor, bgColors]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Canvas Container */}
      <div className={`relative w-full max-w-md aspect-[2/3] shadow-2xl overflow-hidden bg-slate-900 transition-all duration-1000 flex flex-col ${gameState === "won" ? "border-2 border-transparent scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-[2rem]"}`}>
         
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className="absolute inset-0 w-full h-full touch-none z-10 cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
         />

         {/* HUD Top Bar */}
         <div className="absolute top-0 w-full p-4 flex justify-between z-20 pointer-events-none bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white font-black uppercase tracking-widest text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               Fruit Slicer
            </div>
            <div className="text-white font-mono font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               {score}/{TARGET_SCORE}
            </div>
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Fruit Slicer
                  </div>
                  <div className="text-red-300 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest leading-relaxed">
                     Swipe to slice!<br/>Chop {TARGET_SCORE} fruits to win.
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-red-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
                  >
                     Start Slicing
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-red-500 font-black uppercase tracking-widest mb-6">Master Slicer</div>
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
               className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-red-400 transition-colors shadow-lg"
            >
               Auto-Slice Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
