"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Loader2 } from "lucide-react";

export function TextToColorPalette({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  // We override the background with our generated palette
  const [colors, setColors] = useState<string[]>(["#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b"]);
  
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isGenerating) return;

     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM interpretation
     setTimeout(() => {
        let newPalette = ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"]; // Default dark

        const lower = input.toLowerCase();
        if (lower.includes("cyberpunk") || lower.includes("neon") || lower.includes("tokyo")) {
           newPalette = ["#09090b", "#27272a", "#ec4899", "#8b5cf6", "#06b6d4"]; // dark with neon pop
        } else if (lower.includes("nostalgia") || lower.includes("90s") || lower.includes("vintage")) {
           newPalette = ["#fef3c7", "#fcd34d", "#fbbf24", "#f59e0b", "#b45309"]; // warm amber
        } else if (lower.includes("nature") || lower.includes("forest") || lower.includes("calm")) {
           newPalette = ["#f0fdf4", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"]; // greens
        } else if (lower.includes("fire") || lower.includes("rage") || lower.includes("hot")) {
           newPalette = ["#fef2f2", "#fca5a5", "#ef4444", "#b91c1c", "#7f1d1d"]; // reds
        }

        setColors(newPalette);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none transition-colors duration-1000" style={{ backgroundColor: colors[0] }}>
      
      {/* Background Palette Display */}
      <div className="absolute inset-0 z-0 flex">
         {colors.map((c, i) => (
            <motion.div 
               key={i}
               className="flex-1 h-full opacity-50"
               style={{ backgroundColor: c }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.2 }} // keep subtle to act as background
               transition={{ duration: 1 }}
            />
         ))}
      </div>

      <div className="p-6 text-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2 drop-shadow" style={{ color: colors[4] }}>
            <Palette size={16} /> Semantic Color Pipeline
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto z-10 space-y-12">
         
         <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors[4] }}>
               Abstract Aesthetic
            </h1>
            <p className="text-sm font-medium opacity-80" style={{ color: colors[3] }}>
               Describe an abstract feeling, mood, or setting. The LLM will translate it into a structured 5-hex-code array, globally modifying the application state.
            </p>
         </div>

         <form onSubmit={handleGenerate} className="w-full relative shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="e.g. A rainy day in neon Tokyo"
               disabled={isGenerating}
               className="w-full h-16 bg-transparent px-6 text-lg outline-none placeholder:opacity-50"
               style={{ color: colors[4] }}
            />
            <button 
               type="submit"
               disabled={!input.trim() || isGenerating}
               className="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
               style={{ backgroundColor: colors[3], color: colors[0] }}
            >
               {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate
            </button>
         </form>

         <AnimatePresence>
            {!isGenerating && colors.length === 5 && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 w-full h-32 p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl"
               >
                  {colors.map((c, i) => (
                     <motion.div 
                        key={`${c}-${i}`}
                        className="flex-1 rounded-xl shadow-inner relative group overflow-hidden"
                        style={{ backgroundColor: c }}
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                     >
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-black/40 text-white text-[9px] uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                           {c}
                        </div>
                     </motion.div>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
