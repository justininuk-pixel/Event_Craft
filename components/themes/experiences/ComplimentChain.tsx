"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface NodeData {
   id: string;
   label: string;
   x: number;
   y: number;
}

interface EdgeData {
   id: string;
   source: string;
   target: string;
   message: string;
}

const VIEWBOX_SIZE = 1000;
const CENTER = VIEWBOX_SIZE / 2;

const INITIAL_NODES: NodeData[] = [
   { id: "n1", label: "Alice", x: CENTER - 100, y: CENTER - 50 },
   { id: "n2", label: "Bob", x: CENTER + 100, y: CENTER - 50 },
   { id: "n3", label: "Charlie", x: CENTER, y: CENTER + 120 },
];

const INITIAL_EDGES: EdgeData[] = [
   { id: "e1", source: "n1", target: "n2", message: "Great presentation today!" },
   { id: "e2", source: "n2", target: "n3", message: "Thanks for covering my shift." },
];

export function ComplimentChain({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"viewing" | "writing" | "locked">("viewing");
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<EdgeData[]>(INITIAL_EDGES);
  
  // Writing form state
  const [targetName, setTargetName] = useState("");
  const [message, setMessage] = useState("");
  const [sourceNodeId, setSourceNodeId] = useState<string>("n3"); // Assume user is Charlie for simulation

  // Active tooltip
  const [activeEdge, setActiveEdge] = useState<EdgeData | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const handleAddCompliment = (e: React.FormEvent) => {
     e.preventDefault();
     if (!targetName.trim() || !message.trim()) return;

     // Calculate position (randomized circle around center)
     const angle = Math.random() * Math.PI * 2;
     const radius = 200 + Math.random() * 150;
     const newX = CENTER + Math.cos(angle) * radius;
     const newY = CENTER + Math.sin(angle) * radius;

     const newNodeId = `n${Date.now()}`;
     const newEdgeId = `e${Date.now()}`;

     setNodes(prev => [...prev, { id: newNodeId, label: targetName.trim(), x: newX, y: newY }]);
     setEdges(prev => [...prev, { 
        id: newEdgeId, 
        source: sourceNodeId, 
        target: newNodeId, 
        message: message.trim() 
     }]);

     // Change source to the new person so the chain continues in simulation
     setSourceNodeId(newNodeId);
     
     setTargetName("");
     setMessage("");
     setPhase("viewing");

     // Trigger completion if graph is big enough (5 edges)
     if (edges.length >= 4) {
        setTimeout(() => {
           setPhase("locked");
           if (onComplete) onComplete();
        }, 3000);
     }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center bg-slate-50 text-slate-800"
    >
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      <AnimatePresence mode="wait">
         {phase === "viewing" && (
            <motion.div
               key="viewing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 w-full h-full flex flex-col p-4"
            >
               <h1 className="text-2xl font-black uppercase tracking-widest text-center text-slate-800 mt-4 mb-2">
                  Compliment Chain
               </h1>
               
               <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
                  <svg 
                     viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} 
                     className="w-full max-w-3xl h-full drop-shadow-xl"
                  >
                     {/* Draw Edges */}
                     <AnimatePresence>
                        {edges.map(edge => {
                           const sourceNode = nodes.find(n => n.id === edge.source);
                           const targetNode = nodes.find(n => n.id === edge.target);
                           if (!sourceNode || !targetNode) return null;
                           
                           return (
                              <g key={edge.id} className="cursor-pointer" onClick={() => setActiveEdge(edge)}>
                                 <motion.line
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                    x1={sourceNode.x}
                                    y1={sourceNode.y}
                                    x2={targetNode.x}
                                    y2={targetNode.y}
                                    stroke={activeEdge?.id === edge.id ? primaryColor : "#cbd5e1"}
                                    strokeWidth={activeEdge?.id === edge.id ? 8 : 4}
                                    strokeLinecap="round"
                                    className="hover:stroke-slate-400 transition-colors"
                                 />
                                 {/* Arrow head simulation in middle */}
                                 <motion.circle
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    cx={(sourceNode.x + targetNode.x) / 2}
                                    cy={(sourceNode.y + targetNode.y) / 2}
                                    r={6}
                                    fill={activeEdge?.id === edge.id ? primaryColor : "#cbd5e1"}
                                 />
                              </g>
                           );
                        })}
                     </AnimatePresence>

                     {/* Draw Nodes */}
                     <AnimatePresence>
                        {nodes.map(node => (
                           <motion.g 
                              key={node.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", damping: 15 }}
                           >
                              <circle
                                 cx={node.x}
                                 cy={node.y}
                                 r={35}
                                 fill="white"
                                 stroke={primaryColor}
                                 strokeWidth={4}
                                 className="drop-shadow-md"
                              />
                              <text
                                 x={node.x}
                                 y={node.y}
                                 textAnchor="middle"
                                 dy=".3em"
                                 fontSize="20"
                                 fontWeight="bold"
                                 fill="#1e293b"
                                 className="pointer-events-none"
                              >
                                 {node.label.substring(0, 3).toUpperCase()}
                              </text>
                           </motion.g>
                        ))}
                     </AnimatePresence>
                  </svg>

                  {/* Active Edge Tooltip Overlay */}
                  <AnimatePresence>
                     {activeEdge && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="absolute bottom-24 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100 max-w-sm text-center z-20"
                        >
                           <button 
                              onClick={() => setActiveEdge(null)}
                              className="absolute top-2 right-3 text-slate-400 hover:text-slate-800 font-bold"
                           >
                              ✕
                           </button>
                           <p className="text-sm font-bold text-slate-400 uppercase mb-2">
                              {nodes.find(n => n.id === activeEdge.source)?.label} → {nodes.find(n => n.id === activeEdge.target)?.label}
                           </p>
                           <p className="text-lg font-bold text-slate-800">
                              "{activeEdge.message}"
                           </p>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
               
               <div className="w-full flex justify-center pb-8 z-20">
                  <button
                     onClick={() => {
                        setActiveEdge(null);
                        setPhase("writing");
                     }}
                     className="px-8 py-4 rounded-full font-black text-white shadow-xl transition-transform active:scale-95 hover:opacity-90"
                     style={{ backgroundColor: primaryColor }}
                  >
                     ADD COMPLIMENT
                  </button>
               </div>
            </motion.div>
         )}

         {phase === "writing" && (
            <motion.div
               key="writing"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="relative z-10 w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl flex flex-col shadow-2xl"
            >
               <h2 className="text-2xl font-black uppercase text-slate-800 mb-6 text-center">
                 Pass It On
               </h2>
               
               <form onSubmit={handleAddCompliment} className="flex flex-col gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        To (Name)
                     </label>
                     <input
                        type="text"
                        value={targetName}
                        onChange={e => setTargetName(e.target.value)}
                        placeholder="e.g. David"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        maxLength={15}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Message
                     </label>
                     <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Say something nice..."
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                     />
                  </div>
                  <div className="flex gap-4 mt-4">
                     <button
                        type="button"
                        onClick={() => setPhase("viewing")}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                     >
                        CANCEL
                     </button>
                     <button
                        type="submit"
                        disabled={!targetName.trim() || !message.trim()}
                        className="flex-1 py-3 rounded-xl font-black text-white shadow-md disabled:opacity-50 transition-colors hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                     >
                        SEND
                     </button>
                  </div>
               </form>
            </motion.div>
         )}

         {phase === "locked" && (
            <motion.div
               key="locked"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-10 w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 text-4xl">
                  ❤️
               </div>
               <h1 className="text-3xl font-black uppercase text-slate-800 mb-2">
                 Chain Complete
               </h1>
               <p className="text-slate-500 font-bold mb-8">
                  You generated {edges.length} connections of positivity!
               </p>
               
               <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {config.title}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
