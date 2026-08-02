"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Flame, RefreshCcw } from "lucide-react";

export function AggressiveCodeReviewer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // red-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [code, setCode] = useState("function sumArray(arr) {\n  let sum = 0;\n  for(let i=0; i<arr.length; i++) {\n    if (arr[i] != null && arr[i] != undefined) {\n      sum = sum + arr[i];\n    }\n  }\n  return sum;\n}");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviews, setReviews] = useState<{line: number, insult: string}[] | null>(null);

  const handleReview = () => {
     if (!code.trim() || isReviewing) return;
     
     setIsReviewing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM Gordon Ramsay logic
     setTimeout(() => {
        setReviews([
           { line: 3, insult: "A standard for loop in modern JS? Are we in 2012? Use .reduce() you absolute donkey." },
           { line: 4, insult: "Checking != null && != undefined? It's called loose inequality `!= null`, which covers both. Or better yet, don't pass garbage data to your functions." },
           { line: 5, insult: "sum = sum + arr[i]? Ever heard of +=? My grandmother writes cleaner syntax and she's been dead for 20 years." }
        ]);
        setIsReviewing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2500);
  };

  const lines = code.split("\n");

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-slate-800 flex justify-between items-center z-10 shrink-0 bg-slate-950">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
            <Flame size={16} /> Automated Tech Lead
         </h2>
         <div className="text-[10px] font-bold uppercase tracking-widest bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/30">
            Persona: Hostile
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         
         {/* Code Editor */}
         <div className="flex-1 flex flex-col border-r border-slate-800 relative">
            <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
               <Code2 size={14} /> main.js
            </div>
            <textarea 
               value={code}
               onChange={e => { setCode(e.target.value); setReviews(null); }}
               className="flex-1 bg-transparent p-6 font-mono text-sm leading-loose outline-none resize-none text-slate-300"
               spellCheck={false}
            />
            
            <AnimatePresence>
               {!reviews && !isReviewing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-6 right-6">
                     <button 
                        onClick={handleReview}
                        className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
                     >
                        <Flame size={16} /> Request Code Review
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Review Output */}
         <div className="w-full lg:w-1/3 bg-slate-950 flex flex-col border-t lg:border-t-0 border-slate-800 overflow-y-auto">
            <div className="p-4 border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-500">
               CI/CD Pipeline Feedback
            </div>
            
            <div className="flex-1 p-6">
               <AnimatePresence mode="wait">
                  {!reviews && !isReviewing && (
                     <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                        <Code2 size={48} className="mb-4 text-slate-600" />
                        <p className="font-mono text-xs uppercase tracking-widest">Awaiting Submission</p>
                     </motion.div>
                  )}

                  {isReviewing && (
                     <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-4">
                        <RefreshCcw size={32} className="animate-spin text-red-500" />
                        <div className="text-center">
                           <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Analyzing AST...</div>
                           <div className="text-[10px] uppercase tracking-widest text-slate-500">Preparing Insults...</div>
                        </div>
                     </motion.div>
                  )}

                  {reviews && (
                     <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="text-xl font-black text-white mb-8">
                           Review Failed. <br/><span className="text-red-500">Your code is garbage.</span>
                        </div>
                        
                        {reviews.map((r, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.2 }}
                              className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 relative"
                           >
                              <div className="absolute -left-3 -top-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                 L{r.line}
                              </div>
                              <p className="text-sm text-red-200 leading-relaxed font-serif italic pt-1">
                                 "{r.insult}"
                              </p>
                           </motion.div>
                        ))}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

      </div>

    </div>
  );
}
