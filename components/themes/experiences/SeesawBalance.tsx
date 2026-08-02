"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_WEIGHT = 100;
const INITIAL_BLOCKS = [50, 25, 25, 10, 10, 10, 10, 10]; // Sum = 150

type Block = {
   id: number;
   weight: number;
};

export function SeesawBalance({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316"; // Orange 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff7ed"]; // Orange 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [currentWeight, setCurrentWeight] = useState(0);

  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Initialize blocks
     const blocks = INITIAL_BLOCKS.map((w, i) => ({ id: i, weight: w }));
     setAvailableBlocks(blocks);
  }, []);

  const handleDragEnd = (e: any, info: any, block: Block) => {
     if (gameState !== "playing" || !dropZoneRef.current) return;
     
     const rect = dropZoneRef.current.getBoundingClientRect();
     
     // Check if point is inside right side of the seesaw bounding box
     if (
        info.point.x > rect.left &&
        info.point.x < rect.right &&
        info.point.y > rect.top &&
        info.point.y < rect.bottom
     ) {
        // Drop success
        setAvailableBlocks(prev => prev.filter(b => b.id !== block.id));
        setPlacedBlocks(prev => [...prev, block]);
        
        const newWeight = currentWeight + block.weight;
        setCurrentWeight(newWeight);
        
        if (newWeight === TARGET_WEIGHT) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2000);
        } else if (newWeight > TARGET_WEIGHT) {
           // Overweight! 
           // We could shake or reject, but let's just let it tip to the right, showing they missed.
           // They can tap a reset button or drag it back.
           // Actually, let's keep it simple: if overweight, it tips right. They have to use a "Reset" button.
        }
     }
  };

  const handleReset = () => {
     setAvailableBlocks(INITIAL_BLOCKS.map((w, i) => ({ id: i, weight: w })));
     setPlacedBlocks([]);
     setCurrentWeight(0);
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Calculate rotation. 
  // If weight is 0, rotation is -15 (tipped left).
  // If weight is TARGET, rotation is 0 (balanced).
  // If weight > TARGET, rotation is +15 (tipped right).
  const rotation = Math.max(-15, Math.min(15, -15 + (currentWeight / TARGET_WEIGHT) * 15));

  const getBlockSize = (weight: number) => {
     if (weight === 50) return "w-16 h-16 text-xl";
     if (weight === 25) return "w-12 h-12 text-lg";
     return "w-10 h-10 text-sm";
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Reset Button */}
         {gameState === "playing" && currentWeight > 0 && (
            <button 
               onClick={handleReset}
               className="absolute top-4 right-4 bg-slate-800 text-slate-300 px-3 py-1 text-xs font-bold uppercase rounded-lg border border-slate-600 active:scale-95"
            >
               Reset
            </button>
         )}

         {/* Physics Area */}
         <div className="flex-1 w-full relative flex flex-col justify-center items-center mt-10">
            
            {/* The Seesaw System */}
            <div className="relative w-[280px] h-32 flex flex-col justify-end items-center mt-20">
               
               {/* The Plank */}
               <motion.div 
                  className="w-[280px] h-4 bg-yellow-800 rounded-sm absolute bottom-12 origin-center flex items-end justify-between px-2"
                  animate={{ rotate: rotation }}
                  transition={{ type: "spring", stiffness: 60, damping: 10 }}
               >
                  {/* Left Target Mass */}
                  <div className="w-20 h-20 bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-lg -translate-y-4">
                     <span className="text-white font-black text-2xl">{TARGET_WEIGHT}</span>
                  </div>

                  {/* Right Drop Zone (invisible, but captures drops) */}
                  <div 
                     ref={dropZoneRef}
                     className="w-24 h-24 absolute right-0 bottom-4 rounded-xl border-4 border-dashed border-white/20 flex flex-wrap items-end justify-center content-end gap-1 p-1"
                  >
                     {/* Render Placed Blocks Here */}
                     {placedBlocks.map((b, i) => (
                        <motion.div 
                           key={b.id}
                           layoutId={`block-${b.id}`}
                           className={`bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow-sm font-black text-slate-800 rounded-md ${getBlockSize(b.weight)}`}
                        >
                           {b.weight}
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
               
               {/* The Fulcrum */}
               <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-transparent border-b-slate-500 absolute bottom-[24px]" />
               <div className="w-full h-[24px] bg-slate-800 absolute bottom-0 border-t-4 border-slate-600 rounded-t-lg" />
            </div>

         </div>

         {/* Bin of Available Weights */}
         <div className="w-full h-40 bg-slate-800 border-t-4 border-slate-700 p-4 relative z-20">
            <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2 text-center">Available Weights</div>
            <div className="flex flex-wrap justify-center gap-2">
               {availableBlocks.map(b => (
                  <motion.div
                     key={b.id}
                     layoutId={`block-${b.id}`}
                     drag
                     dragSnapToOrigin
                     whileDrag={{ scale: 1.1, zIndex: 50 }}
                     onDragEnd={(e, info) => handleDragEnd(e, info, b)}
                     className={`bg-white border-b-4 border-slate-300 flex items-center justify-center font-black text-slate-800 cursor-grab active:cursor-grabbing rounded-md shadow-md ${getBlockSize(b.weight)}`}
                     style={{ color: primaryColor }}
                  >
                     {b.weight}
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Balance
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag weights onto the right side to perfectly balance the scale at {TARGET_WEIGHT}.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Adding
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(249,115,22,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Equilibrium Reached</div>
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
                  setCurrentWeight(TARGET_WEIGHT);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Balance Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
