"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Node = {
   id: number;
   x: number;
   y: number;
};

type Edge = {
   from: number;
   to: number;
};

// 5 nodes roughly representing a constellation
const NODES: Node[] = [
   { id: 0, x: 50, y: 150 },
   { id: 1, x: 120, y: 80 },
   { id: 2, x: 220, y: 120 },
   { id: 3, x: 180, y: 250 },
   { id: 4, x: 280, y: 320 },
];

const TARGET_EDGES: Edge[] = [
   { from: 0, to: 1 },
   { from: 1, to: 2 },
   { from: 2, to: 3 },
   { from: 3, to: 4 },
];

export function ConstellationMemory({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#c084fc"; // Purple 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900 (night sky)

  const [gameState, setGameState] = useState<"start" | "memorize" | "draw" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [userEdges, setUserEdges] = useState<Edge[]>([]);
  const [currentPath, setCurrentPath] = useState<{ active: boolean, from: number | null, x: number, y: number }>({
     active: false, from: null, x: 0, y: 0
  });

  const svgRef = useRef<SVGSVGElement>(null);

  const startMemorize = () => {
     setGameState("memorize");
     setUserEdges([]);
     setTimeout(() => {
        setGameState("draw");
     }, 3000);
  };

  const handlePointerDown = (e: React.PointerEvent, nodeId: number) => {
     if (gameState !== "draw") return;
     if (!svgRef.current) return;
     
     const rect = svgRef.current.getBoundingClientRect();
     setCurrentPath({
        active: true,
        from: nodeId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
     });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!currentPath.active || gameState !== "draw" || !svgRef.current) return;
     
     const rect = svgRef.current.getBoundingClientRect();
     setCurrentPath(prev => ({
        ...prev,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
     }));
  };

  const checkWin = (edges: Edge[]) => {
     if (edges.length !== TARGET_EDGES.length) return false;
     
     // Check if all target edges exist in user edges
     for (const target of TARGET_EDGES) {
        const found = edges.some(e => 
           (e.from === target.from && e.to === target.to) ||
           (e.from === target.to && e.to === target.from)
        );
        if (!found) return false;
     }
     
     // Check if there are no extra edges
     // Actually, if length is same and all targets found, it implies it's perfect (assuming no duplicates).
     return true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
     if (!currentPath.active || gameState !== "draw" || !svgRef.current) return;
     
     const rect = svgRef.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     
     // Check if we dropped on another node
     const hitNode = NODES.find(n => Math.hypot(n.x - x, n.y - y) < 30); // 30px hit radius
     
     if (hitNode && currentPath.from !== null && hitNode.id !== currentPath.from) {
        // Prevent duplicate edges
        const exists = userEdges.some(e => 
           (e.from === currentPath.from && e.to === hitNode.id) ||
           (e.from === hitNode.id && e.to === currentPath.from)
        );
        
        if (!exists) {
           const newEdges = [...userEdges, { from: currentPath.from, to: hitNode.id }];
           setUserEdges(newEdges);
           
           if (checkWin(newEdges)) {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 1500);
           }
        }
     }
     
     setCurrentPath({ active: false, from: null, x: 0, y: 0 });
  };

  const handleClear = () => {
     startMemorize();
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
         className={`relative w-[320px] h-[480px] bg-slate-950 border-4 border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Stars */}
         <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

         {/* HUD */}
         {gameState === "draw" && (
            <div className="absolute top-4 w-full flex justify-between px-6 z-20 pointer-events-none">
               <div className="flex flex-col">
                  <span className="text-white font-black text-[10px] uppercase tracking-widest drop-shadow-md">Lines</span>
                  <span className="text-white font-black text-2xl leading-none drop-shadow-md">{userEdges.length} <span className="text-sm text-slate-400">/ {TARGET_EDGES.length}</span></span>
               </div>
               <button 
                  onClick={handleClear}
                  className="pointer-events-auto bg-slate-800 text-slate-300 px-3 py-1 text-xs font-bold uppercase rounded-lg border border-slate-600 active:scale-95"
               >
                  Retry
               </button>
            </div>
         )}

         {/* Canvas */}
         <svg 
            ref={svgRef}
            className="w-full h-full absolute inset-0 z-10"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
         >
            {/* Target Edges (Memorize State) */}
            <AnimatePresence>
               {gameState === "memorize" && TARGET_EDGES.map((edge, i) => {
                  const from = NODES.find(n => n.id === edge.from)!;
                  const to = NODES.find(n => n.id === edge.to)!;
                  return (
                     <motion.line 
                        key={`target-${i}`}
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={primaryColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.2 }}
                     />
                  );
               })}
            </AnimatePresence>

            {/* User Edges */}
            {userEdges.map((edge, i) => {
               const from = NODES.find(n => n.id === edge.from)!;
               const to = NODES.find(n => n.id === edge.to)!;
               return (
                  <line 
                     key={`user-${i}`}
                     x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                     stroke="white"
                     strokeWidth="4"
                     strokeLinecap="round"
                     className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
               );
            })}

            {/* Current Path */}
            {currentPath.active && currentPath.from !== null && (
               <line 
                  x1={NODES.find(n => n.id === currentPath.from)!.x} 
                  y1={NODES.find(n => n.id === currentPath.from)!.y} 
                  x2={currentPath.x} 
                  y2={currentPath.y}
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="opacity-50"
               />
            )}
         </svg>

         {/* Nodes */}
         {NODES.map(node => (
            <div 
               key={node.id}
               className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center cursor-pointer z-20 touch-none"
               style={{ left: node.x, top: node.y }}
               onPointerDown={(e) => handlePointerDown(e, node.id)}
            >
               <motion.div 
                  className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 + Math.random(), delay: Math.random() }}
               />
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
                     Stargazer
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Memorize the constellation,<br/>then draw the lines to recreate it.
                  </div>
                  <button 
                     onClick={startMemorize}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Look Up
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
                  className="bg-slate-900 p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(192,132,252,0.3)] border border-slate-700 relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Memory Locked</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-300 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "draw" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setUserEdges([...TARGET_EDGES]);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Draw Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
