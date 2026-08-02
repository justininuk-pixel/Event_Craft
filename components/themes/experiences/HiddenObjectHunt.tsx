"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGETS = ["🗝️", "💎", "👑"];
const DISTRACTIONS = ["🌲", "🍄", "🌷", "🌻", "🍎", "🐢", "🐸", "🦋", "🐞", "🧸", "🎈", "🔮", "🌿", "🍀", "🌺", "🍄"];

const MAP_WIDTH = 1500;
const MAP_HEIGHT = 1500;
const TILE_SIZE = 50;

// Generate map data
const generateMap = () => {
   const cols = MAP_WIDTH / TILE_SIZE;
   const rows = MAP_HEIGHT / TILE_SIZE;
   
   const grid = [];
   for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
         // 70% chance to have a distraction item
         if (Math.random() > 0.3) {
            grid.push({
               id: `bg-${x}-${y}`,
               x: x * TILE_SIZE,
               y: y * TILE_SIZE,
               emoji: DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)],
               rotation: Math.random() * 40 - 20,
               scale: 0.8 + Math.random() * 0.4
            });
         }
      }
   }

   // Place targets
   const targetPositions = [];
   for (let i = 0; i < TARGETS.length; i++) {
      // Ensure they are spread out and not at the very edge (keep within 10% to 90% of map)
      const tx = Math.floor(Math.random() * (cols * 0.8) + (cols * 0.1)) * TILE_SIZE;
      const ty = Math.floor(Math.random() * (rows * 0.8) + (rows * 0.1)) * TILE_SIZE;
      
      targetPositions.push({
         id: `target-${i}`,
         emoji: TARGETS[i],
         x: tx,
         y: ty,
         rotation: Math.random() * 40 - 20,
         scale: 1.2
      });
   }

   return { bgItems: grid, targets: targetPositions };
};

export function HiddenObjectHunt({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#14b8a6"; // Teal 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#042f2e"]; // Teal 950

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [mapData, setMapData] = useState<{ bgItems: any[], targets: any[] }>({ bgItems: [], targets: [] });
  const [foundObjects, setFoundObjects] = useState<Set<string>>(new Set());
  const [showPayload, setShowPayload] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (gameState === "start") {
        setMapData(generateMap());
        setFoundObjects(new Set());
     }
  }, [gameState]);

  const handleTargetTap = (e: React.PointerEvent, id: string) => {
     e.stopPropagation();
     if (gameState !== "playing") return;
     
     setFoundObjects(prev => {
        const next = new Set(prev);
        next.add(id);
        
        if (next.size === TARGETS.length) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
        
        return next;
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
         className={`relative w-full max-w-sm aspect-[4/5] bg-teal-900 border-4 border-teal-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Top HUD */}
         <div className="absolute top-0 left-0 w-full p-4 bg-teal-950/80 backdrop-blur-md z-30 flex justify-between items-center border-b border-teal-800">
            <div className="text-white/70 text-xs font-black uppercase tracking-widest">
               Find {TARGETS.length} Items
            </div>
            <div className="flex gap-2">
               {TARGETS.map((emoji, idx) => {
                  const targetId = `target-${idx}`;
                  const isFound = foundObjects.has(targetId);
                  return (
                     <div 
                        key={idx} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${isFound ? 'bg-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-teal-800 opacity-50 grayscale'}`}
                     >
                        {emoji}
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Draggable Map Area */}
         <div className="absolute inset-0 overflow-hidden touch-none">
            {gameState !== "start" && (
               <motion.div 
                  className="absolute"
                  style={{ 
                     width: MAP_WIDTH, 
                     height: MAP_HEIGHT, 
                     backgroundImage: 'radial-gradient(#115e59 1px, transparent 1px)', // Teal 800 dots
                     backgroundSize: '20px 20px',
                     backgroundColor: '#0f766e' // Teal 700 base
                  }}
                  drag
                  dragConstraints={containerRef}
                  dragElastic={0.2}
                  dragMomentum={true}
                  // Start somewhere near the center
                  initial={{ x: -(MAP_WIDTH/2) + 150, y: -(MAP_HEIGHT/2) + 200 }}
               >
                  
                  {/* Background Distractions */}
                  {mapData.bgItems.map(item => (
                     <div 
                        key={item.id}
                        className="absolute text-3xl flex items-center justify-center pointer-events-none opacity-80 mix-blend-luminosity hover:mix-blend-normal"
                        style={{
                           left: item.x,
                           top: item.y,
                           width: TILE_SIZE,
                           height: TILE_SIZE,
                           transform: `rotate(${item.rotation}deg) scale(${item.scale})`
                        }}
                     >
                        {item.emoji}
                     </div>
                  ))}

                  {/* Targets */}
                  {mapData.targets.map(target => {
                     const isFound = foundObjects.has(target.id);
                     return (
                        <motion.div
                           key={target.id}
                           className="absolute text-3xl flex items-center justify-center cursor-pointer pointer-events-auto"
                           style={{
                              left: target.x,
                              top: target.y,
                              width: TILE_SIZE,
                              height: TILE_SIZE,
                              zIndex: isFound ? 20 : 10,
                           }}
                           initial={{ rotate: target.rotation, scale: target.scale }}
                           animate={{ 
                              scale: isFound ? [target.scale, 2, 1.2] : target.scale,
                              rotate: isFound ? 0 : target.rotation,
                              filter: isFound ? 'drop-shadow(0px 0px 20px rgba(16,185,129,1)) brightness(1.2)' : 'none'
                           }}
                           transition={{ duration: 0.5 }}
                           onPointerDown={(e) => handleTargetTap(e, target.id)}
                        >
                           {target.emoji}
                        </motion.div>
                     );
                  })}

               </motion.div>
            )}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-teal-950/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Object Hunt
                  </div>
                  <div className="text-teal-300 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag to pan around the map.<br/>Find and tap all 3 targets.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="bg-teal-500 text-teal-950 px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Start Exploring
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(20,184,166,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-teal-500 font-black uppercase tracking-widest mb-6 text-sm">Targets Found</div>
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
                  setFoundObjects(new Set(mapData.targets.map(t => t.id)));
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-teal-500 text-teal-950 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-teal-400 transition-colors shadow-lg"
            >
               Auto-Find Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
