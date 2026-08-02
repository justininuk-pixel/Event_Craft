"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDot } from "lucide-react";

type Option = {
  id: string;
  name: string;
  votes: number;
};

export function MultiCriteriaDotVoting({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [tokens, setTokens] = useState(5);
  const [options, setOptions] = useState<Option[]>([
    { id: "o1", name: "Hawaii", votes: 0 },
    { id: "o2", name: "Japan", votes: 0 },
    { id: "o3", name: "Italy", votes: 0 },
  ]);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (id: string) => {
    if (tokens <= 0) return;
    
    setOptions(prev => prev.map(o => o.id === id ? { ...o, votes: o.votes + 1 } : o));
    setTokens(prev => prev - 1);
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);

    if (tokens - 1 === 0) {
       if (onComplete) setTimeout(onComplete, 4000);
    }
  };

  const getHeatColor = (votes: number) => {
     if (votes === 0) return "bg-slate-100 text-slate-800 border-slate-200";
     if (votes === 1) return "bg-blue-100 text-blue-900 border-blue-200";
     if (votes === 2) return "bg-blue-300 text-blue-900 border-blue-400";
     if (votes === 3) return "bg-blue-500 text-white border-blue-600";
     if (votes === 4) return "bg-blue-700 text-white border-blue-800";
     return "bg-indigo-900 text-white border-indigo-950"; // 5 or more
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Header */}
      <div className="p-6 pb-2 text-center z-10">
         <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Vacation Spot</h2>
         <p className="text-xs text-slate-500 mt-1 font-medium">Distribute your dots to show preference intensity.</p>
      </div>

      {/* Token Pool */}
      <div className="flex justify-center items-center py-6 gap-2">
         {Array.from({ length: 5 }).map((_, i) => (
            <motion.div 
               key={i}
               initial={false}
               animate={{ scale: i < tokens ? 1 : 0, opacity: i < tokens ? 1 : 0 }}
               className="w-8 h-8 rounded-full bg-blue-500 shadow-md border-2 border-white flex items-center justify-center text-white"
            >
               <CircleDot size={16} />
            </motion.div>
         ))}
      </div>

      {/* Options List */}
      <div className="flex-1 px-6 space-y-4 overflow-y-auto hide-scrollbar pb-12">
         {options.map((o) => (
            <button 
               key={o.id}
               onClick={() => handleVote(o.id)}
               disabled={tokens === 0}
               className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-colors shadow-sm active:scale-[0.98] ${getHeatColor(o.votes)} ${tokens === 0 ? 'opacity-90' : 'hover:brightness-95'}`}
            >
               <span className="font-bold text-lg">{o.name}</span>
               
               <div className="flex gap-1">
                  {Array.from({ length: o.votes }).map((_, i) => (
                     <motion.div 
                        key={i}
                        initial={{ scale: 0, x: -20 }}
                        animate={{ scale: 1, x: 0 }}
                        className="w-4 h-4 rounded-full bg-current opacity-80"
                     />
                  ))}
               </div>
            </button>
         ))}
      </div>

      {/* Results Overlay (Shown when out of tokens) */}
      <AnimatePresence>
         {tokens === 0 && (
            <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="absolute bottom-0 left-0 w-full p-6 bg-slate-900 text-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-20"
            >
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Consensus Reached</h3>
               
               <div className="flex h-4 rounded-full overflow-hidden bg-slate-800">
                  {options.filter(o => o.votes > 0).map((o, i) => (
                     <div 
                        key={o.id} 
                        style={{ width: `${(o.votes / 5) * 100}%`, backgroundColor: i === 0 ? '#3b82f6' : i === 1 ? '#60a5fa' : '#93c5fd' }}
                        className="h-full flex items-center justify-center text-[8px] font-black"
                     >
                        {o.votes > 0 && o.name.substring(0,3)}
                     </div>
                  ))}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
