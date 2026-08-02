"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle2, Users } from "lucide-react";

type Option = {
  id: string;
  label: string;
  votes: number;
  color: string;
};

export function LiveBarChartPoll({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"];

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Mock initial votes
  const [options, setOptions] = useState<Option[]>([
     { id: "o1", label: "Pizza", votes: 4, color: "#ef4444" },
     { id: "o2", label: "Sushi", votes: 2, color: "#3b82f6" },
     { id: "o3", label: "Tacos", votes: 7, color: "#10b981" },
     { id: "o4", label: "Burgers", votes: 1, color: "#f59e0b" },
  ]);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (id: string) => {
     if (hasVoted) return;

     setOptions(prev => prev.map(opt => 
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
     ));
     
     setSelectedOptionId(id);
     setHasVoted(true);
     
     if (onComplete) onComplete();
  };

  // Simulate other users voting in real-time
  useEffect(() => {
     if (!hasVoted && mode !== "editor-preview") return;

     const interval = setInterval(() => {
        // 30% chance someone votes every second
        if (Math.random() > 0.7) {
           setOptions(prev => {
              const randomIdx = Math.floor(Math.random() * prev.length);
              const newOptions = [...prev];
              newOptions[randomIdx] = { ...newOptions[randomIdx], votes: newOptions[randomIdx].votes + 1 };
              return newOptions;
           });
        }
     }, 1000);

     return () => clearInterval(interval);
  }, [hasVoted, mode]);

  // Sort options by votes if voted, else keep original order
  const displayOptions = hasVoted ? [...options].sort((a, b) => b.votes - a.votes) : options;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="w-full max-w-2xl mx-auto flex flex-col h-full z-10 p-4 sm:p-8">
         
         <div className="bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border border-slate-100 flex-1">
            
            {/* Header */}
            <div className="p-8 pb-6 border-b border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-100 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <BarChart3 size={120} strokeWidth={1} />
               </div>
               
               <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                     <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                     Live Poll
                  </div>
                  
                  <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
                     {config.title || "What are we eating tonight?"}
                  </h2>
                  <p className="text-slate-500 font-medium">
                     {config.body || "Cast your vote to see what everyone else is choosing in real-time."}
                  </p>
               </div>
            </div>

            {/* Poll Body */}
            <div className="flex-1 p-8 space-y-4 overflow-y-auto bg-slate-50/50">
               <AnimatePresence mode="popLayout">
                  {displayOptions.map((opt) => {
                     const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                     const isSelected = selectedOptionId === opt.id;
                     
                     return (
                        <motion.div 
                           key={opt.id}
                           layout
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="relative w-full"
                        >
                           {!hasVoted ? (
                              <button
                                 onClick={() => handleVote(opt.id)}
                                 className="w-full p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all text-left font-bold text-lg text-slate-700 shadow-sm hover:shadow-md group flex items-center justify-between"
                              >
                                 <span>{opt.label}</span>
                                 <div 
                                    className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-slate-400 transition-colors"
                                 />
                              </button>
                           ) : (
                              <div className="w-full relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                 {/* Background Bar */}
                                 <motion.div 
                                    className="absolute top-0 left-0 bottom-0 opacity-10"
                                    style={{ backgroundColor: opt.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                 />
                                 
                                 {/* Colored Bar (Solid) */}
                                 <motion.div 
                                    className="absolute top-0 left-0 bottom-0 opacity-80 backdrop-blur-sm"
                                    style={{ backgroundColor: opt.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                 />

                                 <div className="relative z-10 p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       {isSelected && (
                                          <div className="bg-white/80 p-1 rounded-full shadow-sm">
                                             <CheckCircle2 size={18} style={{ color: opt.color }} />
                                          </div>
                                       )}
                                       <span className={`font-bold text-lg ${percentage > 50 ? 'text-white drop-shadow-md' : 'text-slate-800'}`}>
                                          {opt.label}
                                       </span>
                                    </div>
                                    
                                    <div className={`flex flex-col items-end ${percentage > 50 ? 'text-white drop-shadow-md' : 'text-slate-800'}`}>
                                       <span className="font-black text-xl">
                                          {percentage.toFixed(1)}%
                                       </span>
                                       <span className="text-xs font-semibold opacity-70 flex items-center gap-1">
                                          <Users size={12} />
                                          {opt.votes} votes
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     )
                  })}
               </AnimatePresence>
            </div>

            {/* Footer */}
            {hasVoted && (
               <div className="p-4 bg-slate-900 text-slate-300 text-center text-sm font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live results from {totalVotes} participants
               </div>
            )}

         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !hasVoted && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => handleVote(options[0].id)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/10"
            >
               Vote (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
