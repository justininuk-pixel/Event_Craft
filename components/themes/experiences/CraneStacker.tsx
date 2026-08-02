"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "won" | "lost";

interface Block {
   x: number;
   y: number;
   width: number;
   height: number;
   color: string;
   isFalling?: boolean;
   vy?: number;
}

const TARGET_SCORE = 7;
const INITIAL_WIDTH = 200;
const BLOCK_HEIGHT = 40;
const INITIAL_SPEED = 2; // px per ms (oscillation speed multiplier)
const GRAVITY = 800; // px/s^2 for falling scrap

export function CraneStacker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<GameState>("start");
  const [level, setLevel] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  // Game Logic State
  const widthRef = useRef(400);
  const heightRef = useRef(600);
  
  // The stack of successfully placed blocks
  const stackRef = useRef<Block[]>([]);
  
  // The current block moving at the top
  const currentBlockRef = useRef<Block | null>(null);
  
  // Scraps falling away
  const scrapsRef = useRef<Block[]>([]);

  // Camera Y offset to scroll up as tower grows
  const cameraYRef = useRef(0);
  const targetCameraYRef = useRef(0);

  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const timeElapsedRef = useRef(0);

  const startGame = () => {
     setLevel(0);
     cameraYRef.current = 0;
     targetCameraYRef.current = 0;
     scrapsRef.current = [];
     
     // Base Block
     stackRef.current = [{
        x: widthRef.current / 2 - INITIAL_WIDTH / 2,
        y: heightRef.current - BLOCK_HEIGHT * 2,
        width: INITIAL_WIDTH,
        height: BLOCK_HEIGHT,
        color: "#475569" // Slate 600 base
     }];

     spawnBlock(INITIAL_WIDTH);
     setGameState("playing");
  };

  const spawnBlock = (width: number) => {
     // Spawn high above the top block
     const topY = stackRef.current[stackRef.current.length - 1].y;
     const spawnY = topY - BLOCK_HEIGHT * 3; // Spawn higher up
     
     // Set camera target so the spawn Y is visible near the top
     targetCameraYRef.current = Math.min(0, spawnY - 150);

     currentBlockRef.current = {
        x: 0,
        y: spawnY,
        width,
        height: BLOCK_HEIGHT,
        color: `hsl(${200 + (stackRef.current.length * 15)}, 80%, 60%)` // Shifting hue
     };
     timeElapsedRef.current = 0;
  };

  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
     if (gameState !== "playing") return;
     if (e.cancelable) e.preventDefault(); // Stop double-firing or zooming

     const current = currentBlockRef.current;
     if (!current) return;

     const topBlock = stackRef.current[stackRef.current.length - 1];

     // Calculate Overlap
     const currentLeft = current.x;
     const currentRight = current.x + current.width;
     const topLeft = topBlock.x;
     const topRight = topBlock.x + topBlock.width;

     const overlapLeft = Math.max(currentLeft, topLeft);
     const overlapRight = Math.min(currentRight, topRight);
     const overlapWidth = overlapRight - overlapLeft;

     if (overlapWidth <= 0) {
        // Complete Miss
        current.isFalling = true;
        current.vy = 0;
        scrapsRef.current.push(current);
        currentBlockRef.current = null;
        setGameState("lost");
     } else {
        // Hit (Perfect or Partial)
        
        // Tolerance for "perfect" hit (snap to it if close)
        const diff = Math.abs(currentLeft - topLeft);
        let finalWidth = overlapWidth;
        let finalX = overlapLeft;

        if (diff < 5) {
           // Perfect!
           finalWidth = topBlock.width;
           finalX = topBlock.x;
           // Flash effect could be added here
        } else {
           // Sliced! Create Scrap
           if (currentLeft < topLeft) {
              // Left overhang scrap
              scrapsRef.current.push({
                 x: currentLeft,
                 y: current.y,
                 width: topLeft - currentLeft,
                 height: BLOCK_HEIGHT,
                 color: current.color,
                 isFalling: true,
                 vy: 0
              });
           }
           if (currentRight > topRight) {
              // Right overhang scrap
              scrapsRef.current.push({
                 x: topRight,
                 y: current.y,
                 width: currentRight - topRight,
                 height: BLOCK_HEIGHT,
                 color: current.color,
                 isFalling: true,
                 vy: 0
              });
           }
        }

        // Place on stack exactly on top
        stackRef.current.push({
           x: finalX,
           y: topBlock.y - BLOCK_HEIGHT,
           width: finalWidth,
           height: BLOCK_HEIGHT,
           color: current.color
        });

        currentBlockRef.current = null;

        const newLevel = stackRef.current.length - 1;
        setLevel(newLevel);

        if (newLevel >= TARGET_SCORE) {
           setGameState("won");
    onComplete?.();
           // Final camera pan up
           targetCameraYRef.current -= 150; 
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           // Next block
           spawnBlock(finalWidth);
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
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = time;

        if (gameState === "playing" || gameState === "won" || gameState === "lost") {
           timeElapsedRef.current += dt;

           // Smooth Camera tracking
           cameraYRef.current += (targetCameraYRef.current - cameraYRef.current) * dt * 5;

           // Update Current Block (Oscillation)
           const current = currentBlockRef.current;
           if (current && gameState === "playing") {
              const speedMultiplier = 1 + (level * 0.15); // Faster as you go
              // Amplitude is screen width minus block width
              const maxTravel = widthRef.current - current.width;
              // Sine wave oscillation
              const t = timeElapsedRef.current * INITIAL_SPEED * speedMultiplier;
              const val = (Math.sin(t) + 1) / 2; // 0 to 1
              current.x = val * maxTravel;
           }

           // Update Scraps (Falling)
           scrapsRef.current = scrapsRef.current.filter(scrap => {
              if (scrap.isFalling) {
                 scrap.vy = (scrap.vy || 0) + GRAVITY * dt;
                 scrap.y += scrap.vy * dt;
              }
              // Remove if fallen way off screen relative to camera
              return scrap.y < heightRef.current - cameraYRef.current + 200;
           });

           // --- DRAWING ---
           ctx.fillStyle = bgColors[0];
           ctx.fillRect(0, 0, widthRef.current, heightRef.current);

           ctx.save();
           ctx.translate(0, -cameraYRef.current);

           // Draw Grid subtle relative to world
           ctx.strokeStyle = "rgba(255,255,255,0.03)";
           ctx.lineWidth = 1;
           ctx.beginPath();
           const startY = Math.floor(cameraYRef.current / 40) * 40;
           const endY = startY + heightRef.current + 40;
           for (let i = 0; i <= widthRef.current; i += 40) {
              ctx.moveTo(i, startY); ctx.lineTo(i, endY);
           }
           for (let i = startY; i <= endY; i += 40) {
              ctx.moveTo(0, i); ctx.lineTo(widthRef.current, i);
           }
           ctx.stroke();

           // Draw Stack
           stackRef.current.forEach(b => {
              ctx.fillStyle = b.color;
              ctx.fillRect(b.x, b.y, b.width, b.height);
              // Outline
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.lineWidth = 2;
              ctx.strokeRect(b.x, b.y, b.width, b.height);
              
              // Top highlight
              ctx.fillStyle = "rgba(255,255,255,0.2)";
              ctx.fillRect(b.x, b.y, b.width, 4);
           });

           // Draw Scraps
           scrapsRef.current.forEach(b => {
              ctx.fillStyle = b.color;
              ctx.fillRect(b.x, b.y, b.width, b.height);
              // Outline
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.lineWidth = 2;
              ctx.strokeRect(b.x, b.y, b.width, b.height);
           });

           // Draw Current Block
           if (current) {
              ctx.fillStyle = current.color;
              ctx.fillRect(current.x, current.y, current.width, current.height);
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.lineWidth = 2;
              ctx.strokeRect(current.x, current.y, current.width, current.height);
              
              // Connective beam visualization (shadow cast straight down)
              ctx.fillStyle = "rgba(255,255,255,0.05)";
              const topY = stackRef.current[stackRef.current.length - 1].y;
              ctx.fillRect(current.x, current.y + current.height, current.width, topY - (current.y + current.height));
           }

           ctx.restore();
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, level, bgColors]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Initial draw before start
  useEffect(() => {
     if (gameState === "start") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);
        
        ctx.fillStyle = "#475569";
        ctx.fillRect(widthRef.current/2 - INITIAL_WIDTH/2, heightRef.current - BLOCK_HEIGHT*2, INITIAL_WIDTH, BLOCK_HEIGHT);
     }
  }, [gameState, bgColors]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Canvas Container */}
      <div 
         ref={containerRef}
         className={`relative w-full max-w-sm aspect-[2/3] shadow-2xl overflow-hidden bg-slate-900 transition-all duration-1000 flex flex-col ${gameState === "won" ? "border-2 border-transparent scale-95 opacity-50 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-[2rem]"}`}
         onPointerDown={handlePointerDown}
      >
         
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className="absolute inset-0 w-full h-full touch-none z-10 cursor-pointer"
         />

         {/* HUD Top Bar */}
         <div className="absolute top-0 w-full p-4 flex justify-between z-20 pointer-events-none bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white font-black uppercase tracking-widest text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               Stacker
            </div>
            <div className="text-white font-mono font-bold text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
               LEVEL: {level}/{TARGET_SCORE}
            </div>
         </div>

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Crane Stacker
                  </div>
                  <div className="text-blue-300 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest leading-relaxed">
                     Tap to drop the block.<br/>Stack {TARGET_SCORE} blocks to win.
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-blue-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
                  >
                     Start Building
                  </button>
               </motion.div>
            )}

            {gameState === "lost" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-[2px] pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Collapsed
                  </div>
                  <div className="text-red-200 font-bold tracking-widest uppercase mb-8">
                     Level Reached: {level}
                  </div>
                  <button 
                     onClick={(e) => { e.stopPropagation(); startGame(); }}
                     className="bg-white text-red-900 px-8 py-3 rounded-full font-bold uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
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
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(59,130,246,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-blue-500 font-black uppercase tracking-widest mb-6">Tower Completed</div>
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
               onClick={(e) => {
                  e.stopPropagation();
                  setLevel(TARGET_SCORE);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
               Auto-Stack Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
