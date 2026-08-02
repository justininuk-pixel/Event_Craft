"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type PieceDef = {
   id: string;
   path: string;
   tx: number; // Target X (center)
   ty: number; // Target Y (center)
   symmetry: number; // 360 for no rotational symmetry, 90 for square
   color: string;
};

// SVG paths are drawn such that (0,0) is their geometric center, matching the bounding box center.
const PIECES: PieceDef[] = [
   { id: "LT1", path: "M -100 -50 L 100 -50 L 0 50 Z", tx: 100, ty: 50, symmetry: 360, color: "#ef4444" }, // Red
   { id: "LT2", path: "M -50 -100 L -50 100 L 50 0 Z", tx: 50, ty: 100, symmetry: 360, color: "#f97316" }, // Orange
   { id: "MT", path: "M 50 50 L -50 50 L 50 -50 Z", tx: 150, ty: 150, symmetry: 360, color: "#eab308" }, // Yellow
   { id: "SQ1", path: "M -50 0 L 0 -50 L 50 0 L 0 50 Z", tx: 150, ty: 100, symmetry: 90, color: "#22c55e" }, // Green
   { id: "ST1", path: "M -25 0 L 25 -50 L 25 50 Z", tx: 175, ty: 50, symmetry: 360, color: "#0ea5e9" }, // Sky
   { id: "ST2", path: "M -50 25 L 50 25 L 0 -25 Z", tx: 50, ty: 175, symmetry: 360, color: "#6366f1" }, // Indigo
   { id: "SQ2", path: "M -50 0 L 0 -50 L 50 0 L 0 50 Z", tx: 100, ty: 150, symmetry: 90, color: "#d946ef" }, // Fuchsia
];

export function TangramPuzzle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);

  // Piece state
  // We store x, y (relative to the 200x200 container), and rotation (in degrees)
  const [pieceState, setPieceState] = useState<Record<string, { x: number, y: number, r: number, snapped: boolean }>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize scattered pieces
  useEffect(() => {
     if (gameState === "start") {
        const initial: Record<string, { x: number, y: number, r: number, snapped: boolean }> = {};
        
        PIECES.forEach(p => {
           // Scatter around outside the 200x200 box, but within a reasonable bounds.
           // Container is centered. Let's just put them randomly within a 300x400 area, 
           // but offset from the center so they don't cover the silhouette.
           const angle = Math.random() * Math.PI * 2;
           const dist = 100 + Math.random() * 80;
           initial[p.id] = {
              x: p.tx + Math.cos(angle) * dist,
              y: p.ty + Math.sin(angle) * dist,
              r: Math.floor(Math.random() * 8) * 45, // Multiples of 45 deg
              snapped: false
           };
        });
        setPieceState(initial);
     }
  }, [gameState]);

  // Check win condition
  useEffect(() => {
     if (gameState === "playing") {
        const allSnapped = PIECES.every(p => pieceState[p.id]?.snapped);
        if (allSnapped) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     }
  }, [pieceState, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Handling drag/rotate
  const checkSnap = (id: string, newX: number, newY: number, newR: number) => {
     const p = PIECES.find(x => x.id === id)!;
     
     // Normalize rotation
     let normalizedR = newR % 360;
     if (normalizedR < 0) normalizedR += 360;

     // Check distance
     const dx = newX - p.tx;
     const dy = newY - p.ty;
     const distSq = dx*dx + dy*dy;

     // Snapping threshold
     if (distSq < 400 && (normalizedR % p.symmetry === 0)) {
        return { snapped: true, x: p.tx, y: p.ty, r: newR - (normalizedR % p.symmetry) }; 
        // e.g. if it's 90 and target is 90, we keep it at 90.
        // wait, if symmetry is 90, any multiple of 90 is valid.
        // So we just snap x and y, and leave rotation as is (since it's a valid multiple).
     }

     return { snapped: false, x: newX, y: newY, r: newR };
  };

  const handleDragEnd = (id: string, info: any) => {
     if (pieceState[id].snapped) return;

     // We need to calculate the new x/y relative to the container.
     // framer-motion's drag gives us the offset via info.point or we can just read the style?
     // Actually, we can use `onDrag` to update state, or just let `motion.div` handle layout and then read it.
     // To keep React state perfectly in sync with Framer Motion, it's easiest to use a controlled component.
     // But `drag` in framer-motion uses transforms.
     // Let's rely on `onDragEnd` and `info.offset`.
  };

  // We will instead use pointer events manually, OR use framer-motion's `onDrag` with controlled state.
  // Actually, a simpler way is just to let framer motion handle it, but use `onPointerDown` / `onPointerUp` 
  // to detect taps for rotation.
  
  const tapStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
     if (pieceState[id]?.snapped) return;
     tapStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
     if (pieceState[id]?.snapped || !tapStartRef.current) return;
     
     const dx = e.clientX - tapStartRef.current.x;
     const dy = e.clientY - tapStartRef.current.y;
     const distSq = dx*dx + dy*dy;
     const timeDelta = Date.now() - tapStartRef.current.time;

     if (distSq < 100 && timeDelta < 300) {
        // It's a tap -> Rotate
        setPieceState(prev => {
           const curr = prev[id];
           const newR = curr.r + 45;
           const snappedResult = checkSnap(id, curr.x, curr.y, newR);
           
           return {
              ...prev,
              [id]: {
                 x: snappedResult.snapped ? snappedResult.x : curr.x,
                 y: snappedResult.snapped ? snappedResult.y : curr.y,
                 r: snappedResult.snapped ? snappedResult.r : newR,
                 snapped: snappedResult.snapped
              }
           };
        });
     }
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-lg aspect-square sm:aspect-[4/5] flex flex-col items-center justify-center transition-all duration-1000 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* The Play Area (200x200 scaled up) */}
         <div 
            ref={containerRef}
            className="relative"
            style={{ width: 200, height: 200, transform: "scale(1.4)", transformOrigin: "center" }}
         >
            {/* Silhouette (Target) */}
            {gameState !== "start" && (
               <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-sm bg-slate-200/50 shadow-inner">
                  {/* Optional: we could draw the full square outline, but a 200x200 div IS the outline */}
               </div>
            )}

            {/* Pieces */}
            {gameState !== "start" && PIECES.map(p => {
               const state = pieceState[p.id];
               if (!state) return null;

               return (
                  <motion.div
                     key={p.id}
                     className="absolute top-0 left-0 flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
                     style={{
                        width: 0, 
                        height: 0,
                        x: state.x,
                        y: state.y,
                        rotate: state.r,
                        zIndex: state.snapped ? 10 : 20,
                        filter: state.snapped ? "brightness(0.9) drop-shadow(0px 0px 2px rgba(0,0,0,0.2))" : "drop-shadow(0px 10px 10px rgba(0,0,0,0.3))"
                     }}
                     drag={!state.snapped}
                     dragMomentum={false}
                     onDrag={(e, info) => {
                        // Keep our React state in sync with Framer's internal drag state
                        setPieceState(prev => ({
                           ...prev,
                           [p.id]: {
                              ...prev[p.id],
                              x: prev[p.id].x + info.delta.x / 1.4, // Adjust for scale!
                              y: prev[p.id].y + info.delta.y / 1.4
                           }
                        }));
                     }}
                     onDragEnd={() => {
                        // Check snap on drag end
                        setPieceState(prev => {
                           const curr = prev[p.id];
                           const snappedResult = checkSnap(p.id, curr.x, curr.y, curr.r);
                           return {
                              ...prev,
                              [p.id]: { ...curr, ...snappedResult }
                           };
                        });
                     }}
                     onPointerDown={(e) => handlePointerDown(e, p.id)}
                     onPointerUp={(e) => handlePointerUp(e, p.id)}
                     animate={{
                        x: state.x,
                        y: state.y,
                        rotate: state.r
                     }}
                     transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  >
                     <svg className="overflow-visible pointer-events-none">
                        <path 
                           d={p.path} 
                           fill={p.color} 
                           stroke="rgba(255,255,255,0.3)" 
                           strokeWidth="2"
                           strokeLinejoin="round"
                        />
                     </svg>
                  </motion.div>
               );
            })}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-slate-900 font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-2 text-center px-4 leading-tight">
                     Geometry Puzzle
                  </div>
                  <div className="text-slate-500 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Drag pieces to the dashed square.<br/>Tap to rotate 45&deg;.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Begin
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/40 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-blue-500 font-black uppercase tracking-widest mb-6 text-sm">Puzzle Complete</div>
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
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/50 backdrop-blur-xl border border-white p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setPieceState(prev => {
                     const solved: any = {};
                     PIECES.forEach(p => {
                        solved[p.id] = { x: p.tx, y: p.ty, r: 0, snapped: true };
                     });
                     return solved;
                  });
               }}
               className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
