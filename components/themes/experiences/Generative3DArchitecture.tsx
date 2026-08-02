"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Cuboid, Loader2, Sparkles } from "lucide-react";

export function Generative3DArchitecture({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleGenerate = () => {
     if (!prompt.trim() || isGenerating) return;
     
     setIsGenerating(true);
     setProgress(0);
     setIsComplete(false);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Simulate a 10-second 3D generation API polling loop
     let p = 0;
     const interval = setInterval(() => {
        p += Math.random() * 15;
        if (p >= 100) {
           p = 100;
           clearInterval(interval);
           setIsGenerating(false);
           setIsComplete(true);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
           
           if (onComplete) setTimeout(onComplete, 8000);
        }
        setProgress(Math.min(p, 100));
     }, 1000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-zinc-900 text-zinc-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute top-6 left-6 z-20">
         <h2 className="text-sm font-black uppercase tracking-widest text-violet-400">MeshGen API</h2>
         <p className="text-[10px] text-zinc-500 mt-1 uppercase">Text-to-Spatial Model v3</p>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto z-10">
         
         {/* 3D Viewport Simulation */}
         <div className="w-full h-96 relative border border-zinc-800 rounded-xl bg-zinc-950/50 flex flex-col items-center justify-center overflow-hidden perspective-1000 mb-8 shadow-2xl">
            
            {/* Grid Floor */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] transform rotate-x-60 scale-150 origin-bottom opacity-50 pointer-events-none" />

            <AnimatePresence mode="wait">
               {!isGenerating && !isComplete && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-zinc-600 flex flex-col items-center gap-2">
                     <Cuboid size={48} className="opacity-50" />
                     <span className="text-[10px] uppercase tracking-widest">Viewport Empty</span>
                  </motion.div>
               )}

               {isGenerating && (
                  <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col items-center gap-6 z-10">
                     <div className="relative">
                        <Loader2 size={64} className="animate-spin text-violet-500" />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{Math.round(progress)}%</div>
                     </div>
                     <div className="text-xs uppercase tracking-widest text-violet-400 animate-pulse">Generating GLTF Mesh...</div>
                  </motion.div>
               )}

               {isComplete && (
                  <motion.div 
                     key="complete" 
                     initial={{ scale: 0, rotateY: -180 }} 
                     animate={{ scale: 1, rotateY: 360 }} 
                     transition={{ duration: 2, type: "spring", bounce: 0.5 }}
                     className="relative z-10"
                     style={{ transformStyle: "preserve-3d" }}
                  >
                     {/* A simulated 3D object using nested rotated divs */}
                     <div className="w-32 h-32 relative animate-[spin_10s_linear_infinite]" style={{ transformStyle: "preserve-3d" }}>
                        <div className="absolute inset-0 bg-violet-500/80 border-2 border-violet-400 transform translate-z-16 flex items-center justify-center"><Cuboid size={48} className="text-white opacity-50" /></div>
                        <div className="absolute inset-0 bg-indigo-500/80 border-2 border-indigo-400 transform -translate-z-16 rotate-y-180" />
                        <div className="absolute inset-0 bg-blue-500/80 border-2 border-blue-400 transform -translate-x-16 rotate-y-90" />
                        <div className="absolute inset-0 bg-purple-500/80 border-2 border-purple-400 transform translate-x-16 -rotate-y-90" />
                        <div className="absolute inset-0 bg-fuchsia-500/80 border-2 border-fuchsia-400 transform -translate-y-16 rotate-x-90" />
                        <div className="absolute inset-0 bg-pink-500/80 border-2 border-pink-400 transform translate-y-16 -rotate-x-90" />
                     </div>
                     <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[10px] uppercase text-zinc-500 whitespace-nowrap bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                        {prompt}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Input */}
         <div className="w-full relative">
            <input 
               type="text" 
               value={prompt}
               onChange={e => setPrompt(e.target.value)}
               disabled={isGenerating || isComplete}
               placeholder="e.g., A low-poly cyberpunk hotdog stand"
               className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-4 pl-4 pr-32 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
            <button 
               onClick={handleGenerate}
               disabled={!prompt.trim() || isGenerating || isComplete}
               className="absolute right-2 top-2 bottom-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
               <Sparkles size={14} /> Generate
            </button>
         </div>

      </div>

    </div>
  );
}
