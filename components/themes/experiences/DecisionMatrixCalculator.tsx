"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Trophy, Info } from "lucide-react";

type Criterion = {
  id: string;
  name: string;
  weight: number; // 1-5
};

type Option = {
  id: string;
  name: string;
  scores: Record<string, number>; // criterionId -> score (1-10)
};

const DEFAULT_CRITERIA: Criterion[] = [
   { id: "c1", name: "Price", weight: 5 },
   { id: "c2", name: "Mileage", weight: 4 },
   { id: "c3", name: "Looks", weight: 3 },
   { id: "c4", name: "Features", weight: 2 },
];

const DEFAULT_OPTIONS: Option[] = [
   { id: "o1", name: "Honda Civic", scores: { "c1": 8, "c2": 9, "c3": 6, "c4": 7 } },
   { id: "o2", name: "Mazda 3", scores: { "c1": 7, "c2": 7, "c3": 9, "c4": 8 } },
   { id: "o3", name: "Used BMW", scores: { "c1": 4, "c2": 5, "c3": 10, "c4": 9 } },
];

export function DecisionMatrixCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);

  const [isCalculated, setIsCalculated] = useState(false);

  const calculateScore = (opt: Option) => {
     let total = 0;
     criteria.forEach(c => {
        const score = opt.scores[c.id] || 0;
        total += score * c.weight;
     });
     return total;
  };

  const results = useMemo(() => {
     if (!isCalculated) return [];
     
     return options.map(opt => ({
        ...opt,
        totalScore: calculateScore(opt)
     })).sort((a, b) => b.totalScore - a.totalScore);
  }, [options, criteria, isCalculated]);

  const maxPossibleScore = criteria.reduce((sum, c) => sum + (c.weight * 10), 0);

  const handleCalculate = () => {
     setIsCalculated(true);
     if (onComplete) onComplete();
  };

  const updateScore = (optId: string, critId: string, val: number) => {
     setOptions(prev => prev.map(opt => 
        opt.id === optId 
           ? { ...opt, scores: { ...opt.scores, [critId]: Math.max(1, Math.min(10, val)) } }
           : opt
     ));
     setIsCalculated(false);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
      />

      <div className="w-full max-w-5xl mx-auto flex flex-col h-full z-10 sm:border-x sm:border-slate-200 bg-white">
         
         <div className="p-8 pb-6 border-b border-slate-100 flex items-end justify-between bg-white relative z-20">
            <div>
               <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900 flex items-center gap-3">
                  <Calculator size={28} style={{ color: primaryColor }} />
                  {config.title || "Decision Matrix"}
               </h2>
               <p className="text-slate-500 font-medium">
                  {config.body || "Score each option 1-10. We'll multiply by your criteria weights."}
               </p>
            </div>
            
            <button
               onClick={handleCalculate}
               className="hidden md:flex px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all items-center gap-2 hover:-translate-y-1 hover:shadow-xl active:scale-95"
               style={{ backgroundColor: primaryColor }}
            >
               Calculate Winner
            </button>
         </div>

         {/* The Matrix */}
         <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr>
                     <th className="p-4 bg-slate-50 border-b border-slate-200 min-w-[150px] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Options</div>
                     </th>
                     {criteria.map(c => (
                        <th key={c.id} className="p-4 bg-slate-50 border-b border-slate-200 min-w-[120px] text-center border-l border-slate-100">
                           <div className="text-sm font-bold text-slate-700">{c.name}</div>
                           <div className="text-xs font-medium text-slate-400 mt-1 flex items-center justify-center gap-1">
                              Weight: <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{c.weight}x</span>
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {options.map((opt, i) => (
                     <tr key={opt.id} className="group">
                        <td className="p-4 border-b border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                           <span className="font-bold text-slate-800">{opt.name}</span>
                        </td>
                        
                        {criteria.map(c => (
                           <td key={c.id} className="p-4 border-b border-l border-slate-100 text-center group-hover:bg-slate-50/50 transition-colors">
                              <input 
                                 type="number"
                                 min="1"
                                 max="10"
                                 value={opt.scores[c.id] || ""}
                                 onChange={(e) => updateScore(opt.id, c.id, parseInt(e.target.value) || 0)}
                                 className="w-16 text-center text-lg font-bold p-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                              />
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Mobile Calculate Button */}
         <div className="p-4 border-t border-slate-100 md:hidden">
            <button
               onClick={handleCalculate}
               className="w-full px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
               style={{ backgroundColor: primaryColor }}
            >
               Calculate Winner
            </button>
         </div>

         {/* Results Overlay/Area */}
         <AnimatePresence>
            {isCalculated && results.length > 0 && (
               <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 text-white p-6 md:p-8 border-t-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-30"
                  style={{ borderColor: primaryColor }}
               >
                  <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
                     
                     <div className="flex-1 text-center md:text-left">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                           <Trophy size={16} className="text-yellow-400" />
                           Mathematically Optimal Choice
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                           {results[0].name}
                        </h3>
                        <p className="text-slate-300 flex items-center justify-center md:justify-start gap-2">
                           <span className="font-bold text-white text-xl">{results[0].totalScore}</span> 
                           <span className="text-sm">out of {maxPossibleScore} max points</span>
                        </p>
                     </div>

                     <div className="w-full md:w-64 space-y-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Runner Ups</div>
                        {results.slice(1).map((res, i) => (
                           <div key={res.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                              <span className="font-medium text-slate-300">#{i+2} {res.name}</span>
                              <span className="font-bold text-slate-400">{res.totalScore} pts</span>
                           </div>
                        ))}
                     </div>

                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isCalculated && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleCalculate}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-black/10"
            >
               Show Winner (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
