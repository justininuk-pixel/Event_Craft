"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GAME_W = 320;
const GAME_H = 480;
const WIN_SCORE = 10;
const TURRET_RANGE = 80;
const TURRET_COOLDOWN = 600; // ms

// Simple winding path
const PATH = [
   { x: 40, y: -20 },
   { x: 40, y: 120 },
   { x: 280, y: 120 },
   { x: 280, y: 280 },
   { x: 40, y: 280 },
   { x: 40, y: 440 },
   { x: 280, y: 440 },
   { x: 280, y: 500 }, // off screen
];

type Enemy = {
   id: number;
   x: number;
   y: number;
   pathIndex: number;
   hp: number;
};

type Turret = {
   id: number;
   x: number;
   y: number;
   lastFired: number;
};

type Projectile = {
   id: number;
   x: number;
   y: number;
   targetId: number;
};

export function MiniTD({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#84cc16"; // Lime 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f7fee7"]; // Lime 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [turretsToPlace, setTurretsToPlace] = useState(3);
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [turrets, setTurrets] = useState<Turret[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const engineRef = useRef<{
     animationId: number;
     lastSpawn: number;
     score: number;
     lives: number;
     enemies: Enemy[];
     turrets: Turret[];
     projectiles: Projectile[];
     idCounter: number;
     active: boolean;
  }>({
     animationId: 0,
     lastSpawn: 0,
     score: 0,
     lives: 3,
     enemies: [],
     turrets: [],
     projectiles: [],
     idCounter: 0,
     active: false
  });

  const startGame = () => {
     setGameState("playing");
     setScore(0);
     setLives(3);
     setTurretsToPlace(3);
     
     engineRef.current = {
        animationId: 0,
        lastSpawn: Date.now(),
        score: 0,
        lives: 3,
        enemies: [],
        turrets: [],
        projectiles: [],
        idCounter: 0,
        active: true
     };
     
     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        const now = Date.now();
        
        // Spawn enemies
        if (now - sim.lastSpawn > 2000) {
           sim.lastSpawn = now;
           sim.enemies.push({
              id: sim.idCounter++,
              x: PATH[0].x,
              y: PATH[0].y,
              pathIndex: 0,
              hp: 3
           });
        }
        
        // Move enemies
        for (let i = sim.enemies.length - 1; i >= 0; i--) {
           const enemy = sim.enemies[i];
           const target = PATH[enemy.pathIndex + 1];
           
           if (!target) {
              // Reached end
              sim.lives--;
              sim.enemies.splice(i, 1);
              continue;
           }
           
           const dx = target.x - enemy.x;
           const dy = target.y - enemy.y;
           const dist = Math.hypot(dx, dy);
           
           if (dist < 2) {
              enemy.pathIndex++;
           } else {
              const speed = 1.5;
              enemy.x += (dx / dist) * speed;
              enemy.y += (dy / dist) * speed;
           }
        }
        
        // Move projectiles
        for (let i = sim.projectiles.length - 1; i >= 0; i--) {
           const proj = sim.projectiles[i];
           const targetEnemy = sim.enemies.find(e => e.id === proj.targetId);
           
           if (!targetEnemy) {
              sim.projectiles.splice(i, 1);
              continue;
           }
           
           const dx = targetEnemy.x - proj.x;
           const dy = targetEnemy.y - proj.y;
           const dist = Math.hypot(dx, dy);
           
           if (dist < 10) {
              // Hit
              targetEnemy.hp--;
              if (targetEnemy.hp <= 0) {
                 sim.score++;
                 sim.enemies = sim.enemies.filter(e => e.id !== targetEnemy.id);
              }
              sim.projectiles.splice(i, 1);
           } else {
              const speed = 8;
              proj.x += (dx / dist) * speed;
              proj.y += (dy / dist) * speed;
           }
        }
        
        // Turret logic
        for (const turret of sim.turrets) {
           if (now - turret.lastFired > TURRET_COOLDOWN) {
              // Find nearest enemy in range
              let nearestEnemy = null;
              let nearestDist = TURRET_RANGE;
              
              for (const enemy of sim.enemies) {
                 const dist = Math.hypot(enemy.x - turret.x, enemy.y - turret.y);
                 if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                 }
              }
              
              if (nearestEnemy) {
                 sim.projectiles.push({
                    id: sim.idCounter++,
                    x: turret.x,
                    y: turret.y - 10,
                    targetId: nearestEnemy.id
                 });
                 turret.lastFired = now;
              }
           }
        }
        
        // Update React State
        setEnemies([...sim.enemies]);
        setTurrets([...sim.turrets]);
        setProjectiles([...sim.projectiles]);
        setScore(sim.score);
        setLives(sim.lives);
        
        if (sim.lives <= 0) {
           sim.active = false;
           setGameState("lost");
        } else if (sim.score >= WIN_SCORE) {
           sim.active = false;
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           sim.animationId = requestAnimationFrame(loop);
        }
     };
     
     engineRef.current.animationId = requestAnimationFrame(loop);
  };

  useEffect(() => {
     return () => {
        if (engineRef.current.animationId) {
           cancelAnimationFrame(engineRef.current.animationId);
        }
     };
  }, []);

  const handleDragEnd = (e: any, info: any) => {
     if (gameState !== "playing" || turretsToPlace <= 0) return;
     if (!containerRef.current) return;
     
     const rect = containerRef.current.getBoundingClientRect();
     
     // info.point is absolute window coordinates
     const x = info.point.x - rect.left;
     const y = info.point.y - rect.top;
     
     if (x > 0 && x < GAME_W && y > 0 && y < GAME_H) {
        // Place turret
        engineRef.current.turrets.push({
           id: engineRef.current.idCounter++,
           x,
           y,
           lastFired: 0
        });
        setTurretsToPlace(prev => prev - 1);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         ref={containerRef}
         className={`relative w-[320px] h-[480px] bg-green-900 border-4 border-green-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* The Path */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline 
               points={PATH.map(p => `${p.x},${p.y}`).join(' ')} 
               fill="none" 
               stroke="#c2b280" // dirt color
               strokeWidth="30" 
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>

         {/* HUD */}
         <div className="absolute top-4 w-full flex justify-between px-6 z-20 pointer-events-none">
            <div className="flex flex-col">
               <span className="text-green-300 font-black text-[10px] uppercase tracking-widest">Score</span>
               <span className="text-white font-black text-2xl leading-none">{score} <span className="text-sm text-green-300">/ {WIN_SCORE}</span></span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-green-300 font-black text-[10px] uppercase tracking-widest">Lives</span>
               <div className="flex gap-1 mt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500' : 'bg-green-800'}`} />
                  ))}
               </div>
            </div>
         </div>

         {/* Placed Turrets */}
         {turrets.map(t => (
            <div 
               key={t.id}
               className="absolute w-8 h-8 -ml-4 -mt-4 bg-slate-800 rounded-lg border-2 border-slate-600 flex items-center justify-center shadow-lg"
               style={{ left: t.x, top: t.y }}
            >
               <div className="w-2 h-4 bg-slate-400 absolute -top-2 rounded-t-sm" />
               <div className="w-4 h-4 bg-blue-500 rounded-full" />
            </div>
         ))}

         {/* Enemies */}
         {enemies.map(e => (
            <div 
               key={e.id}
               className="absolute w-6 h-6 -ml-3 -mt-3 bg-red-600 rounded-full border-2 border-red-800 flex items-center justify-center shadow-md overflow-hidden"
               style={{ left: e.x, top: e.y }}
            >
               {/* Bug eyes */}
               <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
               <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full" />
            </div>
         ))}

         {/* Projectiles */}
         {projectiles.map(p => (
            <div 
               key={p.id}
               className="absolute w-2 h-2 -ml-1 -mt-1 bg-yellow-300 rounded-full shadow-[0_0_5px_rgba(253,224,71,0.8)]"
               style={{ left: p.x, top: p.y }}
            />
         ))}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-green-950/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Mini TD
                  </div>
                  <div className="text-green-300 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag turrets onto the grass to defend the path.
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-slate-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Defense
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-red-500 font-black text-5xl uppercase tracking-widest drop-shadow-sm mb-2 text-center">
                     Defeat
                  </div>
                  <div className="text-red-300 font-bold mb-8">The bugs got through.</div>
                  <button 
                     onClick={startGame}
                     className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Try Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Turret Inventory */}
      <div className={`mt-6 w-[320px] h-20 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-around px-4 transition-opacity ${gameState === 'playing' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
         {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative w-12 h-12 flex items-center justify-center">
               <div className="absolute inset-0 bg-slate-100 rounded-xl border-2 border-slate-200 border-dashed" />
               {i < turretsToPlace && (
                  <motion.div 
                     drag
                     dragSnapToOrigin
                     onDragEnd={handleDragEnd}
                     whileDrag={{ scale: 1.2, zIndex: 50 }}
                     className="relative z-10 w-10 h-10 bg-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl"
                  >
                     <div className="w-2 h-4 bg-slate-400 absolute -top-2 rounded-t-sm" />
                     <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  </motion.div>
               )}
            </div>
         ))}
      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(132,204,22,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Path Secured</div>
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
                  engineRef.current.active = false;
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-slate-900 font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
