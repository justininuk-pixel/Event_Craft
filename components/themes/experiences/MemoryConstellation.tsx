"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

type Node = {
   id: number;
   x: number; // percentage 0-100
   y: number; // percentage 0-100
   text: string;
};

// A simple 5-point star shape
const defaultNodes: Node[] = [
   { id: 1, x: 50, y: 10, text: "It started as a simple idea." },
   { id: 2, x: 65, y: 40, text: "Then it grew into something more." },
   { id: 3, x: 95, y: 40, text: "We spent hours talking." },
   { id: 4, x: 70, y: 60, text: "I realized I didn't want it to end." },
   { id: 5, x: 80, y: 90, text: "And here we are today." },
   { id: 6, x: 50, y: 70, text: "Still looking at the same stars." },
   { id: 7, x: 20, y: 90, text: "I hope you know." },
   { id: 8, x: 30, y: 60, text: "That you mean everything." },
   { id: 9, x: 5, y: 40, text: "To me." },
   { id: 10, x: 35, y: 40, text: "Always." }
];

export function MemoryConstellation({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fcd34d"; // amber-300
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const nodes: Node[] = (config.experience as any)?.nodes || defaultNodes;

  const [connectedNodes, setConnectedNodes] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState<{x: number, y: number} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getTargetNodeId = () => {
     if (connectedNodes.length === 0) return 1;
     if (connectedNodes.length === nodes.length) return null;
     return connectedNodes.length + 1;
  };

  const handlePointerDown = (e: React.PointerEvent, nodeId: number) => {
     const target = getTargetNodeId();
     if (nodeId === target) {
        if (connectedNodes.length === 0) {
           setConnectedNodes([1]);
        }
        updateCurrentLine(e);
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (connectedNodes.length === 0 || connectedNodes.length === nodes.length) return;
     updateCurrentLine(e);
  };

  const handlePointerUp = () => {
     setCurrentLine(null);
  };

  const handleNodeEnter = (nodeId: number) => {
     const target = getTargetNodeId();
     if (nodeId === target && connectedNodes.length > 0) {
        // Connected!
        setConnectedNodes(prev => [...prev, nodeId]);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
        
        if (nodeId === nodes.length) {
           setCurrentLine(null);
           if (onComplete) setTimeout(onComplete, 4000);
        }
     }
  };

  const updateCurrentLine = (e: React.PointerEvent) => {
     if (!svgRef.current) return;
     const rect = svgRef.current.getBoundingClientRect();
     const x = ((e.clientX - rect.left) / rect.width) * 100;
     const y = ((e.clientY - rect.top) / rect.height) * 100;
     setCurrentLine({ x, y });
  };

  // Connect last node back to first to complete the shape
  const isComplete = connectedNodes.length === nodes.length;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Starfield */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 pointer-events-none opacity-80" />
      
      <div className="flex-1 flex flex-col p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-4 h-16">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
               {config.title || "Our Constellation"}
            </h2>
            <p className="text-white/50 text-sm mt-1">
               {isComplete ? "A beautiful picture." : "Connect the stars in order."}
            </p>
         </div>

         {/* The SVG Canvas */}
         <div 
            className="flex-1 relative w-full mt-4"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
         >
            <svg 
               ref={svgRef}
               className="w-full h-full absolute inset-0 overflow-visible"
               preserveAspectRatio="none"
            >
               {/* Completed lines */}
               {connectedNodes.map((nodeId, idx) => {
                  if (idx === 0) return null;
                  const prevNode = nodes.find(n => n.id === connectedNodes[idx - 1]);
                  const currNode = nodes.find(n => n.id === nodeId);
                  if (!prevNode || !currNode) return null;
                  return (
                     <motion.line
                        key={`line-${prevNode.id}-${currNode.id}`}
                        x1={`${prevNode.x}%`} y1={`${prevNode.y}%`}
                        x2={`${currNode.x}%`} y2={`${currNode.y}%`}
                        stroke={primaryColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 4px ${primaryColor})` }}
                     />
                  );
               })}

               {/* Final closing line (if complete) */}
               {isComplete && nodes.length > 2 && (
                  <motion.line
                     x1={`${nodes[nodes.length - 1].x}%`} y1={`${nodes[nodes.length - 1].y}%`}
                     x2={`${nodes[0].x}%`} y2={`${nodes[0].y}%`}
                     stroke={primaryColor}
                     strokeWidth="2"
                     strokeLinecap="round"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 0.5, delay: 0.5 }}
                     style={{ filter: `drop-shadow(0 0 4px ${primaryColor})` }}
                  />
               )}

               {/* Current drawing line */}
               {currentLine && connectedNodes.length > 0 && !isComplete && (() => {
                  const lastNode = nodes.find(n => n.id === connectedNodes[connectedNodes.length - 1]);
                  if (!lastNode) return null;
                  return (
                     <line 
                        x1={`${lastNode.x}%`} y1={`${lastNode.y}%`}
                        x2={`${currentLine.x}%`} y2={`${currentLine.y}%`}
                        stroke={primaryColor}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                        opacity="0.5"
                     />
                  );
               })()}
            </svg>

            {/* The Nodes (HTML for easier interaction) */}
            {nodes.map(node => {
               const isConnected = connectedNodes.includes(node.id);
               const isNext = getTargetNodeId() === node.id;
               
               return (
                  <div
                     key={node.id}
                     className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-pointer"
                     style={{ left: `${node.x}%`, top: `${node.y}%` }}
                     onPointerDown={(e) => handlePointerDown(e, node.id)}
                     onPointerEnter={() => handleNodeEnter(node.id)}
                     // For touch devices, pointerEnter doesn't work well while dragging, so we check coords in move? 
                     // No, pointer capture makes it hard. A robust way in React is to use document.elementFromPoint during pointermove, 
                     // but for this simple demo, we rely on large hit targets. We will add a small hack below.
                  >
                     <motion.div 
                        className="w-3 h-3 rounded-full bg-white relative z-20 transition-all duration-300"
                        style={{ 
                           boxShadow: isConnected || isNext ? `0 0 15px ${primaryColor}, 0 0 30px ${primaryColor}` : '0 0 5px rgba(255,255,255,0.5)',
                           backgroundColor: isConnected || isNext ? primaryColor : 'white',
                           transform: isNext ? 'scale(1.5)' : 'scale(1)'
                        }}
                        animate={isNext ? { scale: [1.2, 1.6, 1.2] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                     />
                     {!isConnected && (
                        <div className="absolute top-4 text-[10px] text-white/40 font-bold">{node.id}</div>
                     )}
                     
                     {/* Story Text Reveal */}
                     <AnimatePresence>
                        {isConnected && (
                           <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute top-6 left-1/2 w-48 -translate-x-1/2 text-center pointer-events-none"
                           >
                              <span className="text-xs font-serif italic text-white/90 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm shadow-lg border border-white/10">
                                 {node.text}
                              </span>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               );
            })}

            {/* Hack to detect enter during drag */}
            <div 
               className="absolute inset-0 z-30" 
               onPointerMove={(e) => {
                  handlePointerMove(e);
                  // Check distance to next node manually
                  const targetId = getTargetNodeId();
                  if (targetId && svgRef.current) {
                     const targetNode = nodes.find(n => n.id === targetId);
                     if (targetNode) {
                        const rect = svgRef.current.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        // Distance check (roughly 5% radius)
                        const dist = Math.sqrt(Math.pow(x - targetNode.x, 2) + Math.pow(y - targetNode.y, 2));
                        if (dist < 5) {
                           handleNodeEnter(targetId);
                        }
                     }
                  }
               }} 
            />

         </div>
         
         {isComplete && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
               className="mt-8 text-center"
            >
               <Star size={32} className="mx-auto mb-2 drop-shadow-lg animate-pulse" style={{ color: primaryColor, fill: primaryColor }} />
               <p className="text-xl font-serif italic text-white leading-relaxed max-w-[250px] mx-auto">
                  {config.body || "Every star tells a part of our story."}
               </p>
            </motion.div>
         )}

      </div>

    </div>
  );
}
