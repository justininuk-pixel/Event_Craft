"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Palette, Hash, Loader2 } from "lucide-react";

type Rect = { x: number, y: number, w: number, h: number, color: string };

export function CodeHashArt({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // parchment

  const [input, setInput] = useState("function init() {\n  console.log('hello world');\n}");
  const [isHashing, setIsHashing] = useState(false);
  const [hashResult, setHashResult] = useState("");
  const [rects, setRects] = useState<Rect[]>([]);

  // Simple string hashing function to simulate SHA-256 for visual purposes
  const simpleHash = (str: string) => {
     let hash = 0;
     for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
     }
     // Return a hex string padded out to simulate a longer cryptographic hash
     return Math.abs(hash).toString(16).padEnd(32, '0');
  };

  const handleGenerate = () => {
     if (!input.trim() || isHashing) return;
     
     setIsHashing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const hash = simpleHash(input);
        setHashResult(hash);
        
        // Procedurally generate a Mondrian-style painting from the hash
        const generatedRects: Rect[] = [];
        
        // We use the hash characters as deterministic random seeds
        const seedVals = hash.split('').map(c => parseInt(c, 16));
        
        // Mondrian Palette
        const colors = ["#dc2626", "#2563eb", "#facc15", "#fdfbf7", "#fdfbf7", "#fdfbf7", "#171717"];
        
        let gridX = 0;
        let gridY = 0;
        
        for (let i = 0; i < 8; i++) {
           const s1 = seedVals[(i*3) % seedVals.length];
           const s2 = seedVals[(i*3+1) % seedVals.length];
           const s3 = seedVals[(i*3+2) % seedVals.length];

           const w = (s1 % 4 + 1) * 20; // 20% to 80%
           const h = (s2 % 4 + 1) * 20;
           const color = colors[s3 % colors.length];

           generatedRects.push({
              x: (gridX * 25) % 100,
              y: (gridY * 25) % 100,
              w: Math.min(100 - ((gridX * 25) % 100), w),
              h: Math.min(100 - ((gridY * 25) % 100), h),
              color
           });

           gridX += (s1 % 2 + 1);
           gridY += (s2 % 2);
        }

        setRects(generatedRects);
        setIsHashing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);

        if (onComplete) setTimeout(onComplete, 10000);
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-[#fdfbf7] text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 shrink-0">
         <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex justify-center items-center gap-2">
            <Hash size={24} className="text-slate-400" /> Hash Composition
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8">
         
         <div className="w-full lg:w-1/2 bg-slate-900 p-1 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-t-xl border-b border-slate-700">
               <div className="w-3 h-3 rounded-full bg-red-500" />
               <div className="w-3 h-3 rounded-full bg-yellow-500" />
               <div className="w-3 h-3 rounded-full bg-green-500" />
               <span className="text-xs text-slate-400 font-mono ml-2">input_buffer.js</span>
            </div>
            <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               disabled={isHashing}
               className="w-full h-64 bg-transparent text-emerald-400 font-mono text-sm p-4 outline-none resize-none disabled:opacity-50"
            />
            <button 
               onClick={handleGenerate}
               disabled={!input.trim() || isHashing}
               className="m-4 py-3 bg-white text-slate-900 rounded-lg font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-slate-200 transition-colors"
            >
               {isHashing ? <Loader2 size={16} className="animate-spin" /> : <Palette size={16} />}
               Generate Artifact
            </button>
         </div>

         <div className="w-full lg:w-1/2 flex flex-col items-center">
            
            <AnimatePresence mode="wait">
               {rects.length > 0 && !isHashing ? (
                  <motion.div 
                     key="art"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="relative w-full aspect-square bg-[#fdfbf7] border-[16px] border-slate-900 shadow-2xl overflow-hidden"
                  >
                     {/* The Canvas */}
                     <div className="absolute inset-0 border-[8px] border-black">
                        {rects.map((r, i) => (
                           <motion.div 
                              key={i}
                              className="absolute border-4 border-black box-border"
                              initial={{ width: 0, height: 0 }}
                              animate={{ width: `${r.w}%`, height: `${r.h}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                              style={{ 
                                 left: `${r.x}%`, 
                                 top: `${r.y}%`, 
                                 backgroundColor: r.color,
                              }}
                           />
                        ))}
                     </div>
                  </motion.div>
               ) : (
                  <motion.div 
                     key="empty" 
                     className="w-full aspect-square border-4 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 font-mono text-xs uppercase tracking-widest"
                  >
                     {isHashing ? "Computing Hash Seed..." : "Awaiting Compilation..."}
                  </motion.div>
               )}
            </AnimatePresence>

            {hashResult && !isHashing && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full bg-slate-100 border border-slate-200 p-4 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Seed String (Simulated SHA-256)</div>
                  <div className="font-mono text-xs text-slate-800 break-all">{hashResult}</div>
               </motion.div>
            )}

         </div>

      </div>

    </div>
  );
}
