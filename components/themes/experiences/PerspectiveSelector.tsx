"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Eye } from "lucide-react";

type Perspective = "hero" | "villain" | "bystander" | null;

export function PerspectiveSelector({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";

  // Mock data for perspectives since it requires 3 distinct JSON arrays
  const stories = {
    hero: {
      title: "The Hero's Burden",
      body: "I stood at the edge of the chasm, the wind tearing at my cloak. I knew what I had to do. The city depended on me. With a deep breath, I leaped forward, hoping my training would be enough to carry me across.",
      color: "#3b82f6",
      icon: <User className="w-8 h-8" />
    },
    villain: {
      title: "The Architect's Vision",
      body: "They call me a monster. But from where I stand, overlooking the crumbling ruins of their flawed society, I see a blank canvas. If jumping into that chasm is what it takes to show them the truth, so be it. I jumped with a smile.",
      color: "#ef4444",
      icon: <Eye className="w-8 h-8" />
    },
    bystander: {
      title: "The Watcher's Account",
      body: "I was just tending to my flock when I saw them. Two figures at the edge of the great divide. They stood there for a moment, silhouettes against the dying sun. And then... they just jumped. I didn't understand why, and I still don't.",
      color: "#10b981",
      icon: <Users className="w-8 h-8" />
    }
  };

  const handleSelect = (p: Perspective) => {
    setSelectedPerspective(p);
  };

  const handleFinish = () => {
    if (!hasCompleted) {
       setHasCompleted(true);
       if (onComplete) onComplete();
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-white relative flex flex-col items-center justify-center overflow-hidden font-sans">
      
      <AnimatePresence mode="wait">
        {!selectedPerspective ? (
          <motion.div 
            key="selector"
            className="w-full max-w-md p-8 flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
             <h1 className="text-3xl font-black uppercase tracking-widest mb-2 text-center" style={{ color: primaryColor }}>
                Choose Your Truth
             </h1>
             <p className="text-zinc-400 text-center mb-12">
                Every story has multiple sides. Which one will you hear?
             </p>

             <div className="flex flex-col w-full gap-4">
                {(Object.keys(stories) as Perspective[]).map((p) => {
                   if (!p) return null;
                   const isHero = p === "hero";
                   const isVillain = p === "villain";
                   
                   return (
                      <button
                         key={p}
                         onClick={() => handleSelect(p)}
                         className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left"
                      >
                         <div className="p-3 rounded-lg" style={{ backgroundColor: `${stories[p].color}20`, color: stories[p].color }}>
                            {stories[p].icon}
                         </div>
                         <div className="flex-1">
                            <h3 className="font-bold text-lg capitalize tracking-wide">{p}</h3>
                            <p className="text-sm text-zinc-500">Experience the events from this point of view.</p>
                         </div>
                         <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"
                            style={{ backgroundImage: `linear-gradient(to right, transparent, ${stories[p].color})` }}
                         />
                      </button>
                   );
                })}
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="story"
            className="w-full h-full absolute inset-0 bg-zinc-900 p-8 overflow-y-auto flex flex-col"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
             {/* Header indicator */}
             <div className="w-full flex justify-between items-center mb-12 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded" style={{ backgroundColor: `${stories[selectedPerspective].color}30`, color: stories[selectedPerspective].color }}>
                      {stories[selectedPerspective].icon}
                   </div>
                   <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">
                      Perspective: <span style={{ color: stories[selectedPerspective].color }}>{selectedPerspective}</span>
                   </span>
                </div>
                <button 
                   onClick={() => setSelectedPerspective(null)}
                   className="text-xs uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                   Change
                </button>
             </div>

             <div className="max-w-xl mx-auto flex-1">
                <h2 className="text-4xl font-serif font-bold mb-8 leading-tight" style={{ color: stories[selectedPerspective].color }}>
                   {stories[selectedPerspective].title}
                </h2>
                <div className="text-lg leading-loose text-zinc-300 font-serif">
                   {/* In a real implementation, this would use config.body parsed into perspective-specific blocks */}
                   {stories[selectedPerspective].body}
                </div>
                
                {/* Simulated continuation */}
                <div className="mt-8 text-lg leading-loose text-zinc-300 font-serif opacity-50 blur-[2px] select-none">
                   The rest of the story unfolds here, permanently colored by the perspective you chose to adopt. The events remain the same, but the truth is entirely different...
                </div>
             </div>

             <div className="w-full flex justify-center py-12 mt-auto">
                <button 
                   onClick={handleFinish}
                   className="px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95"
                   style={{ backgroundColor: stories[selectedPerspective].color, color: "#fff" }}
                >
                   Acknowledge
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !selectedPerspective && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur p-2 rounded shadow z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setSelectedPerspective("hero");
                  if (onComplete) onComplete();
               }}
               className="text-[10px] uppercase font-bold text-white/50 hover:text-white"
            >
               Force Select (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
