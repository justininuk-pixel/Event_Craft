"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { revealCardStyles } from "@/lib/themes/revealStyle";

type GameState = "start" | "aiming" | "moving" | "won" | "lost";

const FRICTION = 0.98;
const MAX_POWER = 1500; // px/s initial velocity max
const MIN_VELOCITY = 10; // px/s to consider "stopped"
const BALL_RADIUS = 8;
const HOLE_RADIUS = 12;
const HOLE_PULL_RADIUS = 25; // Magnetic pull radius
const HOLE_PULL_FORCE = 500; // Force towards hole

interface RectCollider {
   x: number;
   y: number;
   w: number;
   h: number;
}

// Course space is 400x600. Borders are always present; obstacles are configurable.
const BORDER_WALLS: RectCollider[] = [
   { x: -10, y: -10, w: 420, h: 20 },
   { x: -10, y: 590, w: 420, h: 20 },
   { x: -10, y: 0, w: 20, h: 600 },
   { x: 390, y: 0, w: 20, h: 600 },
];

export const GOLF_COURSES: Record<string, RectCollider[]> = {
   open: [],
   classic: [
      { x: 100, y: 300, w: 100, h: 20 },
      { x: 250, y: 200, w: 100, h: 20 },
   ],
   tricky: [
      { x: 60, y: 380, w: 160, h: 18 },
      { x: 200, y: 260, w: 160, h: 18 },
      { x: 40, y: 160, w: 120, h: 18 },
      { x: 190, y: 440, w: 18, h: 90 },
   ],
   maze: [
      { x: 0, y: 420, w: 260, h: 18 },
      { x: 150, y: 300, w: 260, h: 18 },
      { x: 0, y: 180, w: 260, h: 18 },
      { x: 300, y: 100, w: 18, h: 120 },
   ],
};

export function GolfPutt({
  theme,
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Creator-configured number of shots allowed (Experience panel → "shots to sink it").
  const rawStrokes = Number(config.experience?.targetScore ?? theme.experienceDefaults?.targetScore ?? 3);
  const MAX_STROKES = Number.isFinite(rawStrokes) && rawStrokes > 0 ? Math.min(20, Math.round(rawStrokes)) : 3;

  const [gameState, setGameState] = useState<GameState>("start");
  const [strokes, setStrokes] = useState(0);
  const [showPayload, setShowPayload] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const reveal = revealCardStyles(config);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // Slate 100

  // Physics State
  const ballRef = useRef({ x: 200, y: 500, vx: 0, vy: 0 });
  const holeRef = useRef({ x: 200, y: 100 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  
  const widthRef = useRef(400);
  const heightRef = useRef(600);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0); // set on the first animation frame

  // Obstacles are creator-configurable: either a named course preset or a custom array of
  // { x, y, w, h } rectangles in the 400x600 course space (Experience panel / Advanced JSON).
  const obstacles = useMemo<RectCollider[]>(() => {
     const custom = (config.experience as any)?.obstacles;
     if (Array.isArray(custom)) {
        return custom.filter((o) => o && typeof o.x === "number" && typeof o.y === "number" && typeof o.w === "number" && typeof o.h === "number");
     }
     const preset = (config.experience as any)?.course as string | undefined;
     return GOLF_COURSES[preset ?? "classic"] ?? GOLF_COURSES.classic;
  }, [config.experience]);

  const wallsRef = useRef<RectCollider[]>([...BORDER_WALLS, ...GOLF_COURSES.classic]);
  useEffect(() => {
     wallsRef.current = [...BORDER_WALLS, ...obstacles];
  }, [obstacles]);

  const initGame = () => {
     ballRef.current = { x: 200, y: 500, vx: 0, vy: 0 };
     dragRef.current = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
     setStrokes(0);
     setGameState("start");
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     // A tap/click anywhere dismisses the start instructions for good.
     if (!introDismissed) setIntroDismissed(true);
     if (gameState !== "start" && gameState !== "aiming" && gameState !== "moving") return;
     // Only allow aiming if stopped
     if (Math.abs(ballRef.current.vx) > MIN_VELOCITY || Math.abs(ballRef.current.vy) > MIN_VELOCITY) return;
     if (gameState === "moving") return;

     if (!canvasRef.current) return;
     const rect = canvasRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     const scaleY = heightRef.current / rect.height;
     
     const x = (e.clientX - rect.left) * scaleX;
     const y = (e.clientY - rect.top) * scaleY;

     dragRef.current = { active: true, startX: x, startY: y, currentX: x, currentY: y };
     setGameState("aiming");
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!dragRef.current.active || !canvasRef.current) return;
     
     const rect = canvasRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     const scaleY = heightRef.current / rect.height;
     
     dragRef.current.currentX = (e.clientX - rect.left) * scaleX;
     dragRef.current.currentY = (e.clientY - rect.top) * scaleY;
  };

  const handlePointerUp = () => {
     if (!dragRef.current.active) return;
     dragRef.current.active = false;

     const dx = dragRef.current.startX - dragRef.current.currentX;
     const dy = dragRef.current.startY - dragRef.current.currentY;
     
     // Multiplier for drag length to velocity
     const powerMult = 5;
     
     let vx = dx * powerMult;
     let vy = dy * powerMult;

     // Cap velocity
     const mag = Math.sqrt(vx * vx + vy * vy);
     if (mag > MAX_POWER) {
        vx = (vx / mag) * MAX_POWER;
        vy = (vy / mag) * MAX_POWER;
     }

     if (mag > 50) { // Minimum threshold to shoot
        ballRef.current.vx = vx;
        ballRef.current.vy = vy;
        setGameState("moving");
        setStrokes(s => s + 1);
     } else {
        setGameState(strokes === 0 ? "start" : "aiming"); // just cancel
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

        const ball = ballRef.current;
        const hole = holeRef.current;

        if (gameState === "moving") {
           // Move
           ball.x += ball.vx * dt;
           ball.y += ball.vy * dt;

           // Friction
           // we apply a fixed fraction per second. 
           // v = v * friction^dt is technically more correct, but simple mult works fine if dt is small
           // Using simple friction per frame, scaled by dt loosely
           const f = Math.pow(FRICTION, dt * 60); 
           ball.vx *= f;
           ball.vy *= f;

           // Magnetic hole pull
           const dxHole = hole.x - ball.x;
           const dyHole = hole.y - ball.y;
           const distHole = Math.sqrt(dxHole * dxHole + dyHole * dyHole);
           
           if (distHole < HOLE_PULL_RADIUS) {
              const pullStr = (1 - (distHole / HOLE_PULL_RADIUS)) * HOLE_PULL_FORCE * dt;
              ball.vx += (dxHole / distHole) * pullStr;
              ball.vy += (dyHole / distHole) * pullStr;
           }

           // Check Hole Win condition
           // If we are over the hole, AND moving relatively slowly, sink it
           if (distHole < HOLE_RADIUS && Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) < 400) {
              ball.vx = 0;
              ball.vy = 0;
              ball.x = hole.x;
              ball.y = hole.y;
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }

           // Wall Collision
           for (const wall of wallsRef.current) {
              // Find closest point on rect to circle center
              const testX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.w));
              const testY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.h));
              
              const distX = ball.x - testX;
              const distY = ball.y - testY;
              const distance = Math.sqrt(distX * distX + distY * distY);

              if (distance <= BALL_RADIUS) {
                 // Collision!
                 // Normal vector
                 const nx = distX / distance;
                 const ny = distY / distance;

                 // Reflect velocity: v' = v - 2(v.n)n
                 const dot = ball.vx * nx + ball.vy * ny;
                 ball.vx = (ball.vx - 2 * dot * nx) * 0.8; // 0.8 bounciness
                 ball.vy = (ball.vy - 2 * dot * ny) * 0.8;

                 // Push out to prevent sticking
                 ball.x = testX + nx * (BALL_RADIUS + 1);
                 ball.y = testY + ny * (BALL_RADIUS + 1);
              }
           }

           // Stop
           if (Math.abs(ball.vx) < MIN_VELOCITY && Math.abs(ball.vy) < MIN_VELOCITY && distHole >= HOLE_RADIUS) {
              ball.vx = 0;
              ball.vy = 0;
              setGameState(s => {
                 if (strokes >= MAX_STROKES) {
                    return "lost";
                 }
                 return "start"; // Ready for next stroke
              });
           }
        }

        // --- DRAWING ---
        // Grass Background
        ctx.fillStyle = "#166534"; // Green 800
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);
        
        // Fairway stripes (simple pattern)
        ctx.fillStyle = "#14532d"; // Green 900
        for (let i = 0; i < heightRef.current; i += 40) {
           ctx.fillRect(0, i, widthRef.current, 20);
        }

        // Draw Walls
        ctx.fillStyle = "#fbbf24"; // Amber 400 for bumpers
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2;
        wallsRef.current.forEach(w => {
           // Skip rendering outer borders visually, or draw them subtle
           if (w.y < 0 || w.y > heightRef.current - 20 || w.x < 0 || w.x > widthRef.current - 20) return;
           ctx.fillRect(w.x, w.y, w.w, w.h);
           ctx.strokeRect(w.x, w.y, w.w, w.h);
        });

        // Draw Hole
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, HOLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw Ball
        if (gameState !== "won" || showPayload) {
           ctx.fillStyle = "#fff";
           ctx.beginPath();
           ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
           ctx.fill();
           ctx.strokeStyle = "#cbd5e1";
           ctx.stroke();
        } else {
           // Ball inside hole (won state)
           ctx.fillStyle = "#333";
           ctx.beginPath();
           ctx.arc(hole.x, hole.y, BALL_RADIUS - 2, 0, Math.PI * 2);
           ctx.fill();
        }

        // Draw Aiming Vector
        if (gameState === "aiming" && dragRef.current.active) {
           const dx = dragRef.current.startX - dragRef.current.currentX;
           const dy = dragRef.current.startY - dragRef.current.currentY;
           
           ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
           ctx.lineWidth = 4;
           ctx.setLineDash([5, 5]);
           ctx.beginPath();
           ctx.moveTo(ball.x, ball.y);
           // Cap visual aim length
           const mag = Math.sqrt(dx * dx + dy * dy);
           const maxVisualMag = 200;
           const scale = mag > maxVisualMag ? maxVisualMag / mag : 1;
           ctx.lineTo(ball.x + dx * scale, ball.y + dy * scale);
           ctx.stroke();
           ctx.setLineDash([]);
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, strokes, MAX_STROKES]);

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
         className={`relative w-full max-w-sm aspect-[2/3] shadow-2xl overflow-hidden cursor-crosshair bg-slate-900 transition-all duration-1000 ${gameState === "won" ? "border-2 border-transparent scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-[2rem]"}`}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerLeave={handlePointerUp}
      >
         
         {/* Physics Canvas */}
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className={`absolute inset-0 w-full h-full touch-none z-10`}
         />

         {/* HUD */}
         <div className="absolute top-4 left-0 w-full px-6 flex justify-between z-20 pointer-events-none">
            <div className="text-white font-mono font-bold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               HOLE 1
            </div>
            <div className="text-white font-mono font-bold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               STROKE {Math.min(strokes + 1, MAX_STROKES)}/{MAX_STROKES}
            </div>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && strokes === 0 && !introDismissed && (
               <motion.div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
                  exit={{ opacity: 0 }}
                  onPointerDown={() => setIntroDismissed(true)}
               >
                  <div className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4">
                     Mini Golf
                  </div>
                  <div className="text-emerald-300 font-bold uppercase tracking-widest text-center px-4">
                     Drag backward to aim & shoot.<br/>Get it in {MAX_STROKES} strokes.
                  </div>
                  <div className="text-white/50 text-xs uppercase tracking-widest mt-6">Tap anywhere to begin</div>
               </motion.div>
            )}

            {/* Lost Overlay */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Bogey!
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     Out of strokes
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full shadow-2xl relative overflow-hidden"
                  style={reveal.container}
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-emerald-500 font-black uppercase tracking-widest mb-6" style={{ textAlign: reveal.title.textAlign }}>Hole In One!</div>
                  <h1 className="font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight" style={reveal.title}>
                     {config.title || theme.content.title}
                  </h1>
                  <p className="text-slate-700 font-serif leading-relaxed whitespace-pre-wrap" style={reveal.body}>
                     {config.body || theme.content.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState !== "won" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  ballRef.current.x = holeRef.current.x;
                  ballRef.current.y = holeRef.current.y;
                  ballRef.current.vx = 0;
                  ballRef.current.vy = 0;
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-emerald-400 transition-colors shadow-lg"
            >
               Auto-Putt Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
