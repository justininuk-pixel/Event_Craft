"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Network, Loader2 } from "lucide-react";

export function AIConspiracyTheorist({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<{id: string, text: string, x: number, y: number}[] | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isGenerating) return;

     setIsGenerating(true);
     setNodes(null);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM generation parsing mundane object to conspiracy logic chain
     setTimeout(() => {
        
        // We mock the LLM outputting 5 distinct leaps of logic connecting to the Illuminati.
        const generatedNodes = [
           { id: "node1", text: input.toUpperCase(), x: 10, y: 50 },
           { id: "node2", text: "Manufactured in covert facility (Area 51 proxy)", x: 30, y: 20 },
           { id: "node3", text: "Contains localized EMP transmitter chips", x: 50, y: 70 },
           { id: "node4", text: "Transmits household data to Low Earth Orbit satellites", x: 70, y: 30 },
           { id: "node5", text: "THE ILLUMINATI", x: 90, y: 50 }
        ];

        setNodes(generatedNodes);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 10000);
     }, 3000);
  };

  // SVG drawing logic for the "red string" connections
  const renderStrings = () => {
     if (!nodes) return null;
     const lines = [];
     for (let i = 0; i < nodes.length - 1; i++) {
        lines.push(
           <svg key={`line-${i}`} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <line 
                 x1={`${nodes[i].x}%`} 
                 y1={`${nodes[i].y}%`} 
                 x2={`${nodes[i+i+1]?.x || nodes[i+1].x}%`} 
                 y2={`${nodes[i+i+1]?.y || nodes[i+1].y}%`} 
                 stroke="#ef4444" 
                 strokeWidth="3" 
                 strokeDasharray="5,5"
                 className="opacity-60 drop-shadow-md"
              />
           </svg>
        );
     }
     // Add some chaotic cross connections
     lines.push(
        <svg key="line-chaos" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
           <line x1="10%" y1="50%" x2="70%" y2="30%" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,8" className="opacity-40" />
           <line x1="30%" y1="20%" x2="90%" y2="50%" stroke="#ef4444" strokeWidth="2" className="opacity-50" />
        </svg>
     );
     return lines;
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-zinc-900 text-zinc-300" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Corkboard Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] opacity-30 pointer-events-none mix-blend-overlay" />

      <div className="p-4 bg-zinc-950/80 border-b border-red-900/50 flex justify-between items-center z-20 shrink-0 shadow-lg">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
            <Eye size={16} /> Associative Logic Chaining
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col">
         
         <div className="p-6 md:p-8 z-20 shrink-0 bg-zinc-950/40 backdrop-blur-sm border-b border-zinc-800/50 shadow-md">
            <div className="max-w-2xl space-y-4">
               <h1 className="text-2xl font-black text-white uppercase tracking-tight">The Truth Is Connected</h1>
               <p className="text-xs text-zinc-400 uppercase tracking-widest leading-relaxed">
                  Input a completely mundane object. The LLM will force a multi-step logical chain connecting it to global conspiracies, mapping the associative leaps as SVG coordinates.
               </p>
               <form onSubmit={handleGenerate} className="flex items-center gap-4 mt-4">
                  <input 
                     type="text" 
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     placeholder="e.g. A toaster"
                     className="flex-1 bg-zinc-900 border-2 border-zinc-700 px-4 py-3 outline-none focus:border-red-500 text-white transition-colors"
                  />
                  <button 
                     type="submit"
                     disabled={!input.trim() || isGenerating}
                     className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
                  >
                     {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Network size={16} />}
                     Connect
                  </button>
               </form>
            </div>
         </div>

         <div className="flex-1 relative overflow-hidden bg-amber-950/10">
            <AnimatePresence>
               {isGenerating && (
                  <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-30 bg-zinc-950/50 backdrop-blur-sm">
                     <div className="text-center">
                        <Eye size={48} className="text-red-500 mx-auto mb-4 animate-pulse" />
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Forcing Extrapolation...</div>
                     </div>
                  </motion.div>
               )}

               {nodes && !isGenerating && (
                  <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                     {renderStrings()}
                     
                     {nodes.map((node, i) => (
                        <motion.div 
                           key={node.id}
                           initial={{ scale: 0, opacity: 0, rotate: -10 + Math.random() * 20 }}
                           animate={{ scale: 1, opacity: 1, rotate: -5 + Math.random() * 10 }}
                           transition={{ delay: i * 0.4, type: "spring" }}
                           className="absolute w-40 md:w-48 bg-yellow-100 p-4 shadow-xl border border-yellow-200 text-zinc-900"
                           style={{ 
                              left: `calc(${node.x}% - 80px)`, 
                              top: `calc(${node.y}% - 40px)`,
                              zIndex: 10
                           }}
                        >
                           {/* Push pin */}
                           <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md z-20 border border-red-800">
                              <div className="absolute top-1 left-1 w-1 h-1 bg-white/50 rounded-full" />
                           </div>
                           
                           <div className={`text-center font-serif leading-tight ${i === nodes.length - 1 ? 'font-black text-red-600 text-xl' : 'text-sm font-bold'}`}>
                              {node.text}
                           </div>
                        </motion.div>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
