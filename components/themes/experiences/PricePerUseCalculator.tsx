"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Shirt, ArrowDownCircle, CheckCircle2, DollarSign } from "lucide-react";

export function PricePerUseCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0f172a"; // slate-900
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const initialCost = 250;
  const targetCost = 1.00; // $1 per wear
  const itemName = config.title || "Winter Coat";

  const [uses, setUses] = useState(12); // start with a few uses for demo
  const [justUsed, setJustUsed] = useState(false);

  const currentCostPerUse = uses === 0 ? initialCost : initialCost / uses;
  const isGoalReached = currentCostPerUse <= targetCost;

  const handleUse = () => {
     setUses(prev => prev + 1);
     setJustUsed(true);
     setTimeout(() => setJustUsed(false), 2000);
     
     if (initialCost / (uses + 1) <= targetCost && !isGoalReached) {
        if (onComplete) onComplete();
     }
  };

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 p-6 sm:p-12 items-center justify-center"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Retail Tag Aesthetic */}
      <div className="w-full max-w-sm bg-amber-50 rounded-b-3xl relative shadow-2xl border-2 border-amber-200/50 pb-8 flex flex-col items-center mx-auto mt-12">
         
         {/* Top Hole of Tag */}
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-50 border-2 border-amber-200/50 rounded-full flex items-center justify-center -z-10">
            <div className="w-4 h-4 rounded-full bg-slate-200 shadow-inner" style={{ backgroundColor: bgColors[0] }} />
         </div>

         {/* String */}
         <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-px h-28 border-r-2 border-dashed border-amber-800/20 -z-20" />

         {/* Tag Content */}
         <div className="w-full px-8 pt-10 text-center flex flex-col items-center">
            
            <Shirt size={48} className="text-slate-300 mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 mb-1">
               {itemName}
            </h2>
            <div className="text-sm font-bold text-slate-400 mb-8 border-b-2 border-dashed border-amber-200 pb-4 w-full">
               Initial Cost: <span className="text-slate-600">{formatCurrency(initialCost)}</span>
            </div>

            <div className="relative w-full flex flex-col items-center mb-8">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cost Per Wear</span>
               
               <AnimatePresence mode="popLayout">
                  <motion.div
                     key={currentCostPerUse}
                     initial={{ opacity: 0, y: -20, scale: 0.9 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className={`text-5xl sm:text-6xl font-black tabular-nums tracking-tighter flex items-start justify-center ${isGoalReached ? 'text-emerald-500' : 'text-slate-800'}`}
                  >
                     <span className="text-2xl mt-1 opacity-50 mr-1">$</span>
                     {currentCostPerUse.toFixed(2)}
                  </motion.div>
               </AnimatePresence>

               {/* Value Drop Indicator */}
               <AnimatePresence>
                  {justUsed && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -right-4 top-4 text-emerald-500 flex items-center gap-1 font-bold bg-white/80 backdrop-blur rounded-full px-2 py-1 shadow-sm text-xs border border-emerald-100"
                     >
                        <ArrowDownCircle size={14} /> Value up!
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div className="flex justify-between w-full px-4 mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
               <span>Uses: {uses}</span>
               <span>Goal: {formatCurrency(targetCost)}</span>
            </div>

            {/* Goal Progress Bar */}
            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden shadow-inner relative">
               <motion.div 
                  className="h-full bg-slate-800"
                  animate={{ width: `${Math.min(100, (targetCost / currentCostPerUse) * 100)}%` }}
                  transition={{ type: "spring", bounce: 0.1 }}
               />
               {isGoalReached && (
                  <div className="absolute inset-0 bg-emerald-500" />
               )}
            </div>

         </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-sm mx-auto mt-8 relative z-20">
         {isGoalReached ? (
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               className="bg-emerald-100 border border-emerald-200 text-emerald-700 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-lg shadow-sm"
            >
               <CheckCircle2 /> Goal Reached!
            </motion.div>
         ) : (
            <button
               onClick={handleUse}
               className="w-full py-5 rounded-2xl font-black text-white text-xl uppercase tracking-widest shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
               style={{ backgroundColor: primaryColor }}
            >
               <Tag size={20} /> I Wore It Today
            </button>
         )}
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none -z-10">
         <DollarSign size={400} />
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setUses(249)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               Jump to Goal
            </button>
         </div>
      )}

    </div>
  );
}
