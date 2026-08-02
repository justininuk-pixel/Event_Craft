"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GAME_W = 320;
const GAME_H = 480;
const WIN_SCORE = 5;
const BALLOON_RADIUS = 24;
const DART_W = 10;
const DART_H = 30;

type Balloon = {
   id: number;
   x: number;
   y: number;
   speedX: number;
   color: string;
};

type Dart = {
   id: number;
   x: number;
   y: number;
   speedY: number;
};

type PoppedBalloon = {
   id: number;
   x: number;
   y: number;
   color: string;
   createdAt: number;
};

export function BalloonDart({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // Yellow 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fefce8"]; // Yellow 50
  
  const balloonColors = ["#ef4444", "#3b82f6", "#10b981", "#a855f7", "#f97316", primaryColor];

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [score, setScore] = useState(0);
  
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [darts, setDarts] = useState<Dart[]>([]);
  const [popped, setPopped] = useState<PoppedBalloon[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const engineRef = useRef<{
     animationId: number;
     lastSpawn: number;
     score: number;
     balloons: Balloon[];
     darts: Dart[];
     popped: PoppedBalloon[];
     idCounter: number;
     active: boolean;
  }>({
     animationId: 0,
     lastSpawn: 0,
     score: 0,
     balloons: [],
     darts: [],
     popped: [],
     idCounter: 0,
     active: false
  });

  const startGame = () => {
     setGameState("playing");
     setScore(0);
     
     engineRef.current = {
        animationId: 0,
        lastSpawn: Date.now(),
        score: 0,
        balloons: [],
        darts: [],
        popped: [],
        idCounter: 0,
        active: true
     };
     
     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        const now = Date.now();
        
        // Spawn balloons
        if (now - sim.lastSpawn > 1500) {
           sim.lastSpawn = now;
           const fromLeft = Math.random() > 0.5;
           sim.balloons.push({
              id: sim.idCounter++,
              x: fromLeft ? -BALLOON_RADIUS : GAME_W + BALLOON_RADIUS,
              y: 40 + Math.random() * 200, // Top half
              speedX: (fromLeft ? 1 : -1) * (1 + Math.random() * 1.5),
              color: balloonColors[Math.floor(Math.random() * balloonColors.length)]
           });
        }
        
        // Move balloons
        for (let i = sim.balloons.length - 1; i >= 0; i--) {
           const b = sim.balloons[i];
           b.x += b.speedX;
           
           if (b.x > GAME_W + BALLOON_RADIUS * 2 || b.x < -BALLOON_RADIUS * 2) {
              sim.balloons.splice(i, 1);
           }
        }
        
        // Move darts and check collisions
        for (let i = sim.darts.length - 1; i >= 0; i--) {
           const d = sim.darts[i];
           d.y += d.speedY;
           
           let hit = false;
           for (let j = sim.balloons.length - 1; j >= 0; j--) {
              const b = sim.balloons[j];
              
              // Simple circle/point collision for the tip of the dart
              const dx = b.x - d.x;
              const dy = b.y - d.y;
              if (Math.hypot(dx, dy) < BALLOON_RADIUS) {
                 hit = true;
                 sim.score++;
                 sim.popped.push({
                    id: sim.idCounter++,
                    x: b.x,
                    y: b.y,
                    color: b.color,
                    createdAt: now
                 });
                 sim.balloons.splice(j, 1);
                 break; // dart can only pop one
              }
           }
           
           if (hit || d.y < -DART_H) {
              sim.darts.splice(i, 1);
           }
        }
        
        // Cleanup popped
        sim.popped = sim.popped.filter(p => now - p.createdAt < 500);
        
        // Update state
        setBalloons([...sim.balloons]);
        setDarts([...sim.darts]);
        setPopped([...sim.popped]);
        setScore(sim.score);
        
        if (sim.score >= WIN_SCORE) {
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

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing" || !containerRef.current) return;
     
     const rect = containerRef.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     
     engineRef.current.darts.push({
        id: engineRef.current.idCounter++,
        x,
        y: GAME_H,
        speedY: -10
     });
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
         onPointerDown={handlePointerDown}
         className={`relative w-[320px] h-[480px] bg-slate-900 border-8 border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 cursor-crosshair touch-none ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Carnival background */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black pointer-events-none" />
         
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay pointer-events-none" />

         {/* HUD */}
         <div className="absolute top-4 w-full flex justify-between px-6 z-20 pointer-events-none">
            <div className="flex flex-col">
               <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest drop-shadow-md">Popped</span>
               <span className="text-white font-black text-2xl leading-none drop-shadow-md">{score} <span className="text-sm text-yellow-400">/ {WIN_SCORE}</span></span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest drop-shadow-md">Target</span>
               <span className="text-white font-black text-xl leading-none tracking-widest drop-shadow-md">BALLOONS</span>
            </div>
         </div>

         {/* Balloons */}
         {balloons.map(b => (
            <div 
               key={b.id}
               className="absolute pointer-events-none flex flex-col items-center justify-start"
               style={{
                  left: b.x - BALLOON_RADIUS,
                  top: b.y - BALLOON_RADIUS,
                  width: BALLOON_RADIUS * 2,
                  height: BALLOON_RADIUS * 2 + 20
               }}
            >
               <div 
                  className="w-full aspect-[4/5] rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.2),_0_5px_10px_rgba(0,0,0,0.3)] relative"
                  style={{ backgroundColor: b.color }}
               >
                  <div className="absolute top-[15%] left-[20%] w-[20%] h-[30%] bg-white/40 rounded-[50%] blur-[1px] transform rotate-45" />
               </div>
               {/* Knot */}
               <div className="w-2 h-2 -mt-1 rounded-sm" style={{ backgroundColor: b.color }} />
               {/* String */}
               <svg width="20" height="20" className="opacity-50">
                  <path d="M10 0 Q5 10 10 20" fill="none" stroke="white" strokeWidth="1" />
               </svg>
            </div>
         ))}

         {/* Popped Animations */}
         {popped.map(p => (
            <div 
               key={p.id}
               className="absolute pointer-events-none flex items-center justify-center animate-ping opacity-0"
               style={{
                  left: p.x - BALLOON_RADIUS,
                  top: p.y - BALLOON_RADIUS,
                  width: BALLOON_RADIUS * 2,
                  height: BALLOON_RADIUS * 2,
                  animationDuration: '0.3s'
               }}
            >
               <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke={p.color} strokeWidth="4">
                  <path d="M10,50 L30,50 M90,50 L70,50 M50,10 L50,30 M50,90 L50,70 M20,20 L35,35 M80,80 L65,65 M80,20 L65,35 M20,80 L35,65" />
               </svg>
            </div>
         ))}

         {/* Darts */}
         {darts.map(d => (
            <div 
               key={d.id}
               className="absolute pointer-events-none flex flex-col items-center"
               style={{
                  left: d.x - DART_W / 2,
                  top: d.y,
                  width: DART_W,
                  height: DART_H
               }}
            >
               {/* Dart Tip */}
               <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[8px] border-transparent border-b-slate-200" />
               {/* Dart Body */}
               <div className="w-[4px] h-[12px] bg-red-600" />
               {/* Dart Flights */}
               <div className="w-full h-[10px] bg-red-800 clip-path-[polygon(0_0,_100%_0,_80%_100%,_20%_100%)]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
            </div>
         ))}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Balloon Dart
                  </div>
                  <div className="text-slate-300 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Tap anywhere to throw a dart straight up.<br/>Time it right to pop the balloons.
                  </div>
                  <button 
                     onClick={startGame}
                     className="text-slate-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Play Game
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(234,179,8,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Sharpshooter</div>
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
                  setScore(WIN_SCORE);
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
