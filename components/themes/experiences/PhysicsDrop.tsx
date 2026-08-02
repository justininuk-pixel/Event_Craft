"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "drawing" | "dropping" | "won" | "lost";

interface Point {
   x: number;
   y: number;
}

const BALL_RADIUS = 10;
const GRAVITY = 800; // px/s^2
const BOUNCE = 0.5;
const FRICTION = 0.99;
const MAX_VELOCITY = 1000;

export function PhysicsDrop({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("drawing");
  const [showPayload, setShowPayload] = useState(false);

  // Physics State
  const widthRef = useRef(400);
  const heightRef = useRef(600);
  const linesRef = useRef<Point[][]>([]);
  const currentLineRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  
  const ballRef = useRef({ x: 50, y: 50, vx: 0, vy: 0 });
  const basketRef = useRef({ x: 300, y: 500, w: 60, h: 40 });

  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  const resetGame = () => {
     ballRef.current = { x: 50, y: 50, vx: 0, vy: 0 };
     setGameState("drawing");
  };

  const clearLines = () => {
     linesRef.current = [];
     currentLineRef.current = [];
  };

  const handleDrop = () => {
     if (gameState !== "drawing") return;
     ballRef.current.vx = 0;
     ballRef.current.vy = 0;
     lastTimeRef.current = performance.now();
     setGameState("dropping");
  };

  // Drawing Input Handlers
  const getCanvasPoint = (e: React.PointerEvent) => {
     if (!canvasRef.current) return null;
     const rect = canvasRef.current.getBoundingClientRect();
     const scaleX = widthRef.current / rect.width;
     const scaleY = heightRef.current / rect.height;
     return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
     };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "drawing") return;
     const pt = getCanvasPoint(e);
     if (pt) {
        isDrawingRef.current = true;
        currentLineRef.current = [pt];
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDrawingRef.current || gameState !== "drawing") return;
     const pt = getCanvasPoint(e);
     if (pt) {
        // Only add if it's moved a bit to avoid thousands of points
        const lastPt = currentLineRef.current[currentLineRef.current.length - 1];
        const dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        if (dist > 5) {
           currentLineRef.current.push(pt);
        }
     }
  };

  const handlePointerUp = () => {
     if (!isDrawingRef.current) return;
     isDrawingRef.current = false;
     if (currentLineRef.current.length > 1) {
        linesRef.current.push([...currentLineRef.current]);
     }
     currentLineRef.current = [];
  };

  // Distance from point to line segment
  const distToSegment = (p: Point, v: Point, w: Point) => {
     const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
     if (l2 === 0) return { dist: Math.hypot(p.x - v.x, p.y - v.y), closest: v };
     
     let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
     t = Math.max(0, Math.min(1, t));
     
     const closest = {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
     };
     
     return { dist: Math.hypot(p.x - closest.x, p.y - closest.y), closest };
  };

  // Main Physics Loop
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.03); // Cap dt
        lastTimeRef.current = time;

        const ball = ballRef.current;
        const basket = basketRef.current;

        if (gameState === "dropping") {
           // Apply Gravity
           ball.vy += GRAVITY * dt;

           // Cap Velocity
           const speed = Math.hypot(ball.vx, ball.vy);
           if (speed > MAX_VELOCITY) {
              ball.vx = (ball.vx / speed) * MAX_VELOCITY;
              ball.vy = (ball.vy / speed) * MAX_VELOCITY;
           }

           // Sub-stepping for continuous collision detection (simplified)
           const steps = 3;
           const sdt = dt / steps;

           for (let s = 0; s < steps; s++) {
              ball.x += ball.vx * sdt;
              ball.y += ball.vy * sdt;

              // Check collisions with all line segments
              for (const line of linesRef.current) {
                 for (let i = 0; i < line.length - 1; i++) {
                    const p1 = line[i];
                    const p2 = line[i+1];

                    const { dist, closest } = distToSegment(ball, p1, p2);

                    if (dist < BALL_RADIUS) {
                       // Collision!
                       const overlap = BALL_RADIUS - dist;
                       
                       // Normal vector
                       let nx = (ball.x - closest.x) / dist;
                       let ny = (ball.y - closest.y) / dist;

                       // Push out
                       ball.x += nx * overlap;
                       ball.y += ny * overlap;

                       // Reflect velocity
                       const dot = ball.vx * nx + ball.vy * ny;
                       if (dot < 0) { // Only bounce if moving towards the line
                          ball.vx = (ball.vx - 2 * dot * nx) * BOUNCE;
                          ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE;
                          
                          // Apply friction
                          ball.vx *= FRICTION;
                          ball.vy *= FRICTION;
                       }
                    }
                 }
              }
           }

           // Check Basket Collision (Win)
           // Simplified check: is center of ball inside basket rect?
           if (ball.x > basket.x && ball.x < basket.x + basket.w && ball.y > basket.y && ball.y < basket.y + basket.h) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }

           // Check Out of Bounds (Loss)
           if (ball.y > heightRef.current + BALL_RADIUS * 2 || ball.x < -100 || ball.x > widthRef.current + 100) {
              setGameState("lost");
           }
        }

        // --- DRAWING ---
        // Background
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);
        
        // Grid pattern
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < widthRef.current; i += 40) {
           ctx.moveTo(i, 0); ctx.lineTo(i, heightRef.current);
        }
        for (let i = 0; i < heightRef.current; i += 40) {
           ctx.moveTo(0, i); ctx.lineTo(widthRef.current, i);
        }
        ctx.stroke();

        // Draw Basket
        ctx.fillStyle = "#fbbf24"; // Amber 400
        ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
        ctx.fillStyle = "#b45309"; // Amber 700 (lip)
        ctx.fillRect(basket.x - 5, basket.y, basket.w + 10, 10);
        // Star on basket
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⭐", basket.x + basket.w/2, basket.y + basket.h/2 + 5);

        // Draw Lines
        ctx.strokeStyle = "#334155"; // Slate 700
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const drawPath = (path: Point[]) => {
           if (path.length < 2) return;
           ctx.beginPath();
           ctx.moveTo(path[0].x, path[0].y);
           for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i].x, path[i].y);
           }
           ctx.stroke();
        };

        linesRef.current.forEach(drawPath);
        if (isDrawingRef.current) {
           ctx.strokeStyle = "#94a3b8"; // Lighter while drawing
           drawPath(currentLineRef.current);
        }

        // Draw Ball
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        
        // Inner detail on ball to show rotation (optional, simple dot)
        // just drawing a fixed white dot for aesthetics
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, primaryColor, bgColors]);

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
      <div className={`relative w-full max-w-sm aspect-[2/3] shadow-2xl overflow-hidden bg-white transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-[2rem]"}`}>
         
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className={`absolute inset-0 w-full h-full touch-none z-10 ${gameState === "drawing" ? "cursor-crosshair" : "cursor-default"}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
         />

         {/* HUD Top Bar */}
         <div className="absolute top-0 w-full p-4 flex justify-between z-20 pointer-events-none bg-gradient-to-b from-white/80 to-transparent">
            <div className="text-slate-800 font-black uppercase tracking-widest text-sm drop-shadow-sm">
               Physics Drop
            </div>
         </div>

         {/* Start / Draw Controls */}
         <AnimatePresence>
            {(gameState === "drawing" || gameState === "lost") && (
               <motion.div 
                  className="absolute bottom-6 left-0 w-full flex justify-center gap-4 z-30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
               >
                  <button 
                     onClick={clearLines}
                     className="bg-slate-200 text-slate-800 px-6 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                     Clear
                  </button>
                  <button 
                     onClick={handleDrop}
                     className="bg-blue-500 text-white px-8 py-3 rounded-full font-black uppercase shadow-lg hover:bg-blue-400 hover:scale-105 active:scale-95 transition-all"
                  >
                     {gameState === "lost" ? "Retry" : "Drop!"}
                  </button>
               </motion.div>
            )}

            {/* Lost Overlay hint */}
            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-900/10 backdrop-blur-[1px] pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="bg-white/90 px-6 py-2 rounded-full text-red-600 font-black tracking-widest uppercase shadow-md">
                     Missed! Try adjusting your lines.
                  </div>
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-blue-500 font-black uppercase tracking-widest mb-6">Delivery Successful!</div>
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
      {mode === "editor-preview" && gameState !== "won" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  ballRef.current.x = basketRef.current.x + basketRef.current.w / 2;
                  ballRef.current.y = basketRef.current.y + basketRef.current.h / 2;
                  ballRef.current.vx = 0;
                  ballRef.current.vy = 0;
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
