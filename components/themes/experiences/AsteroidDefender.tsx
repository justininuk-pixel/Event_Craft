"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

const GAME_DURATION = 20; // seconds
const SHIELD_HEIGHT = 80; // Distance from bottom
const BASE_SPAWN_RATE = 1000; // ms between spawns initially

interface Asteroid {
   id: number;
   x: number;
   y: number;
   vy: number;
   radius: number;
   rotation: number;
   rotSpeed: number;
   points: {x: number, y: number}[];
}

interface Particle {
   x: number;
   y: number;
   vx: number;
   vy: number;
   life: number;
   maxLife: number;
   color: string;
}

export function AsteroidDefender({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [health, setHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [showPayload, setShowPayload] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // Rose 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  // Physics State
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const spawnTimerRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const idCounterRef = useRef<number>(0);
  const shakeTimeRef = useRef<number>(0);
  
  const widthRef = useRef(400);
  const heightRef = useRef(600);

  const initGame = () => {
     asteroidsRef.current = [];
     particlesRef.current = [];
     gameTimeRef.current = 0;
     spawnTimerRef.current = 0;
     shakeTimeRef.current = 0;
     setHealth(100);
     setTimeLeft(GAME_DURATION);
     setGameState("playing");
  };

  const createAsteroid = () => {
     const radius = 20 + Math.random() * 25;
     const x = radius + Math.random() * (widthRef.current - radius * 2);
     
     // Generate random jagged shape
     const numPoints = 6 + Math.floor(Math.random() * 5);
     const points = [];
     for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const r = radius * (0.7 + Math.random() * 0.3);
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
     }

     asteroidsRef.current.push({
        id: idCounterRef.current++,
        x,
        y: -radius,
        vy: 80 + Math.random() * 100 + (gameTimeRef.current * 3), // Speeds up over time
        radius,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 2,
        points
     });
  };

  const spawnParticles = (x: number, y: number, color: string, count: number = 15) => {
     for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 150;
        particlesRef.current.push({
           x,
           y,
           vx: Math.cos(angle) * speed,
           vy: Math.sin(angle) * speed,
           life: 1.0,
           maxLife: 0.5 + Math.random() * 0.5,
           color
        });
     }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     if (!canvasRef.current) return;
     
     const rect = canvasRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     const scaleY = heightRef.current / rect.height;
     
     const x = (e.clientX - rect.left) * scaleX;
     const y = (e.clientY - rect.top) * scaleY;

     // Check collision with asteroids (backwards for top-most first)
     const asteroids = asteroidsRef.current;
     for (let i = asteroids.length - 1; i >= 0; i--) {
        const ast = asteroids[i];
        const dx = x - ast.x;
        const dy = y - ast.y;
        if (dx * dx + dy * dy <= (ast.radius + 10) * (ast.radius + 10)) { // +10 leniency
           // Destroy
           spawnParticles(ast.x, ast.y, "#94a3b8"); // Slate 400
           asteroids.splice(i, 1);
           // Add a mini laser effect
           spawnParticles(x, y, primaryColor, 5);
           break; // Only destroy one per tap
        }
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
           gameTimeRef.current += dt;
           
           // Update Timer State
           const remaining = Math.max(0, GAME_DURATION - gameTimeRef.current);
           setTimeLeft(Math.ceil(remaining));

           if (remaining <= 0) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 2500);
           } else {
              // Spawn Asteroids
              spawnTimerRef.current += dt * 1000;
              // Faster spawning over time
              const currentSpawnRate = Math.max(300, BASE_SPAWN_RATE - (gameTimeRef.current * 30));
              if (spawnTimerRef.current > currentSpawnRate) {
                 createAsteroid();
                 spawnTimerRef.current = 0;
              }

              // Update Asteroids
              for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
                 const ast = asteroidsRef.current[i];
                 ast.y += ast.vy * dt;
                 ast.rotation += ast.rotSpeed * dt;

                 // Check Shield Collision
                 if (ast.y + ast.radius >= heightRef.current - SHIELD_HEIGHT) {
                    // Hit!
                    spawnParticles(ast.x, heightRef.current - SHIELD_HEIGHT, primaryColor, 20);
                    asteroidsRef.current.splice(i, 1);
                    shakeTimeRef.current = 0.3; // 300ms shake
                    
                    setHealth(h => {
                       const newHealth = h - 20;
                       if (newHealth <= 0) {
                          setGameState("lost");
                       }
                       return newHealth;
                    });
                 }
              }
           }
        } else if (gameState === "won") {
           // Make asteroids fly away
           asteroidsRef.current.forEach(ast => {
              ast.y -= ast.vy * dt * 2; // Reverse!
              ast.rotation += ast.rotSpeed * dt * 2;
           });
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
           const p = particlesRef.current[i];
           p.x += p.vx * dt;
           p.y += p.vy * dt;
           p.life -= dt;
           if (p.life <= 0) {
              particlesRef.current.splice(i, 1);
           }
        }

        // --- DRAWING ---
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);

        // Screen Shake
        ctx.save();
        if (shakeTimeRef.current > 0) {
           shakeTimeRef.current -= dt;
           const magnitude = (shakeTimeRef.current / 0.3) * 10;
           const dx = (Math.random() - 0.5) * magnitude;
           const dy = (Math.random() - 0.5) * magnitude;
           ctx.translate(dx, dy);
        }

        // Draw Shield Area
        if (gameState !== "won") {
           const shieldY = heightRef.current - SHIELD_HEIGHT;
           
           // Shield Line
           ctx.beginPath();
           ctx.moveTo(0, shieldY);
           ctx.lineTo(widthRef.current, shieldY);
           ctx.strokeStyle = primaryColor;
           ctx.lineWidth = 2;
           ctx.globalAlpha = Math.max(0.2, health / 100);
           ctx.stroke();

           // Shield Glow
           const gradient = ctx.createLinearGradient(0, shieldY, 0, heightRef.current);
           gradient.addColorStop(0, `${primaryColor}40`); // 40 hex alpha
           gradient.addColorStop(1, `${primaryColor}00`);
           ctx.fillStyle = gradient;
           ctx.fillRect(0, shieldY, widthRef.current, SHIELD_HEIGHT);
           ctx.globalAlpha = 1.0;

           // Health Bar
           ctx.fillStyle = "rgba(255,255,255,0.2)";
           ctx.fillRect(10, heightRef.current - 20, widthRef.current - 20, 10);
           ctx.fillStyle = health > 30 ? primaryColor : "#ef4444";
           ctx.fillRect(10, heightRef.current - 20, (widthRef.current - 20) * (health / 100), 10);
        }

        // Draw Asteroids
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        asteroidsRef.current.forEach(ast => {
           ctx.save();
           ctx.translate(ast.x, ast.y);
           ctx.rotate(ast.rotation);
           
           ctx.beginPath();
           ctx.moveTo(ast.points[0].x, ast.points[0].y);
           for (let i = 1; i < ast.points.length; i++) {
              ctx.lineTo(ast.points[i].x, ast.points[i].y);
           }
           ctx.closePath();
           ctx.fillStyle = "#1e293b"; // Slate 800
           ctx.fill();
           ctx.stroke();
           ctx.restore();
        });

        // Draw Particles
        particlesRef.current.forEach(p => {
           ctx.globalAlpha = p.life / p.maxLife;
           ctx.fillStyle = p.color;
           ctx.beginPath();
           ctx.arc(p.x, p.y, 2 + (p.life * 2), 0, Math.PI * 2);
           ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        ctx.restore(); // Restore shake

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, primaryColor, bgColors, health]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Canvas Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[2/3] shadow-2xl overflow-hidden cursor-crosshair bg-slate-900 transition-all duration-1000 ${gameState === "won" ? "border-2 border-transparent" : "border-8 border-slate-800 rounded-[2rem]"}`}
         onPointerDown={handlePointerDown}
      >
         
         {/* The Payload Area (Hidden at the bottom initially, then fills screen) */}
         <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${showPayload ? "h-full bg-slate-900 p-8 flex flex-col justify-center items-center" : "h-[80px] p-2 flex items-center justify-center"}`}>
            <motion.div 
               animate={showPayload ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0.2, y: 0 }}
               transition={{ duration: 1 }}
               className="text-center w-full"
            >
               <h1 className={`${showPayload ? "text-4xl sm:text-5xl mb-6" : "text-sm whitespace-nowrap overflow-hidden text-ellipsis"} font-black uppercase tracking-tighter text-white drop-shadow-md`}>
                  {config.title}
               </h1>
               {showPayload && (
                  <p className="text-xl text-slate-300 font-serif leading-relaxed">
                     {config.body}
                  </p>
               )}
            </motion.div>
         </div>

         {/* Physics Canvas */}
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className={`absolute inset-0 w-full h-full touch-none z-10 transition-opacity duration-1000 ${showPayload ? "opacity-0 pointer-events-none" : "opacity-100"}`}
         />

         {/* Top HUD */}
         <div className={`absolute top-4 left-0 w-full px-6 flex justify-between z-20 pointer-events-none transition-opacity ${showPayload ? "opacity-0" : "opacity-100"}`}>
            <div className="text-white font-mono font-bold text-lg drop-shadow-md">
               TIME: {timeLeft}
            </div>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-lg mb-8 text-center px-4">
                     Asteroid<br/>Defender
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); initGame(); }}
                     className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase hover:scale-105 active:scale-95 transition-transform"
                  >
                     Tap to Start
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
                     Failure
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     Message Destroyed
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); initGame(); }}
                     className="bg-white text-red-900 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setTimeLeft(0);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-rose-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-rose-400 transition-colors shadow-lg"
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
