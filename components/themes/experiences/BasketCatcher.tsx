"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GAME_W = 320;
const GAME_H = 480;
const BASKET_W = 60;
const BASKET_H = 30;
const BASKET_Y = GAME_H - BASKET_H - 20;
const ITEM_RADIUS = 15;
const WIN_SCORE = 10;
const SPEED_Y = 3;

type Item = {
   id: number;
   type: "good" | "bad";
   x: number;
   y: number;
};

export function BasketCatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#eff6ff"]; // Blue 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won" | "lost">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [score, setScore] = useState(0);
  
  const [basketX, setBasketX] = useState(GAME_W / 2);
  const [items, setItems] = useState<Item[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const basketXRef = useRef(GAME_W / 2);
  const engineRef = useRef<{
     animationId: number,
     lastSpawn: number,
     items: Item[],
     score: number,
     active: boolean,
     idCounter: number
  }>({
     animationId: 0,
     lastSpawn: 0,
     items: [],
     score: 0,
     active: false,
     idCounter: 0
  });

  const startGame = () => {
     setGameState("playing");
     setScore(0);
     basketXRef.current = GAME_W / 2;
     setBasketX(GAME_W / 2);
     
     engineRef.current = {
        animationId: 0,
        lastSpawn: Date.now(),
        items: [],
        score: 0,
        active: true,
        idCounter: 0
     };
     
     const loop = () => {
        const sim = engineRef.current;
        if (!sim.active) return;
        
        const now = Date.now();
        // Spawn new items every 1.2s
        if (now - sim.lastSpawn > 1200) {
           sim.lastSpawn = now;
           sim.items.push({
              id: sim.idCounter++,
              type: Math.random() > 0.3 ? "good" : "bad",
              x: ITEM_RADIUS + Math.random() * (GAME_W - ITEM_RADIUS * 2),
              y: -ITEM_RADIUS * 2
           });
        }
        
        let lost = false;
        
        // Update items
        for (let i = sim.items.length - 1; i >= 0; i--) {
           const item = sim.items[i];
           item.y += SPEED_Y;
           
           // Collision detection
           const isCaught = 
              item.y + ITEM_RADIUS > BASKET_Y && 
              item.y - ITEM_RADIUS < BASKET_Y + BASKET_H &&
              item.x + ITEM_RADIUS > basketXRef.current - BASKET_W / 2 &&
              item.x - ITEM_RADIUS < basketXRef.current + BASKET_W / 2;
              
           if (isCaught) {
              if (item.type === "good") {
                 sim.score++;
              } else {
                 lost = true;
              }
              sim.items.splice(i, 1);
           } else if (item.y > GAME_H + ITEM_RADIUS) {
              // Missed a good item? Penalty could be implemented here, but we just remove it.
              sim.items.splice(i, 1);
           }
        }
        
        setItems([...sim.items]);
        setScore(sim.score);
        
        if (lost) {
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

  const handlePointerMove = (e: React.PointerEvent) => {
     if (gameState !== "playing" || !containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     
     // Constrain
     let newX = x;
     if (newX < BASKET_W / 2) newX = BASKET_W / 2;
     if (newX > GAME_W - BASKET_W / 2) newX = GAME_W - BASKET_W / 2;
     
     basketXRef.current = newX;
     setBasketX(newX);
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
         className={`relative w-[320px] h-[480px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center cursor-none touch-none ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         onPointerMove={handlePointerMove}
      >
         
         {/* Background Scenery */}
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
               <div 
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                     width: Math.random() * 4 + 2,
                     height: Math.random() * 4 + 2,
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`
                  }}
               />
            ))}
         </div>

         {/* HUD */}
         <div className="absolute top-4 w-full flex justify-between px-6 z-20 pointer-events-none">
            <div className="flex flex-col">
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Score</span>
               <span className="text-white font-black text-2xl leading-none">{score} <span className="text-sm text-slate-500">/ {WIN_SCORE}</span></span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Target</span>
               <span className="text-green-400 font-black text-xl leading-none tracking-widest text-shadow-sm shadow-green-500/50">STARS</span>
            </div>
         </div>

         {/* Falling Items */}
         {items.map(item => (
            <div 
               key={item.id}
               className="absolute pointer-events-none flex items-center justify-center"
               style={{
                  width: ITEM_RADIUS * 2,
                  height: ITEM_RADIUS * 2,
                  left: item.x - ITEM_RADIUS,
                  top: item.y - ITEM_RADIUS,
                  transform: `rotate(${item.y * 2}deg)`
               }}
            >
               {item.type === "good" ? (
                  // Star
                  <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] fill-current">
                     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
               ) : (
                  // Bomb
                  <div className="w-full h-full relative">
                     <div className="absolute inset-0 bg-slate-800 rounded-full border-2 border-slate-900 shadow-xl" />
                     <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-red-500 rounded-t-full" />
                  </div>
               )}
            </div>
         ))}

         {/* Basket */}
         {gameState !== "start" && (
            <div 
               className="absolute pointer-events-none z-30 flex justify-center"
               style={{
                  width: BASKET_W,
                  height: BASKET_H,
                  left: basketX - BASKET_W / 2,
                  top: BASKET_Y
               }}
            >
               <div 
                  className="w-full h-full bg-slate-700 border-4 border-slate-600 rounded-b-xl shadow-2xl relative overflow-hidden"
                  style={{ borderTopColor: primaryColor }}
               >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-800/50" />
               </div>
               
               {/* Player instruction overlay (only fades when moved) */}
               {basketX === GAME_W / 2 && score === 0 && gameState === "playing" && (
                  <div className="absolute -top-10 whitespace-nowrap text-white/50 font-bold text-xs uppercase tracking-widest animate-pulse">
                     Drag to move
                  </div>
               )}
            </div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Basket Catcher
                  </div>
                  <div className="text-slate-300 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag horizontally to catch stars.<br/>Avoid the bombs!
                  </div>
                  <button 
                     onClick={startGame}
                     className="bg-blue-500 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Game
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
                     Boom!
                  </div>
                  <div className="text-red-300 font-bold mb-8">You caught a bomb.</div>
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(59,130,246,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-blue-500 font-black uppercase tracking-widest mb-6 text-sm">Challenge Complete</div>
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
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Win Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
