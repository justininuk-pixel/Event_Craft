"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { TrendingUp, Banknote } from "lucide-react";

export function BrutalEfficiencyGraph({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const hourlyWage = 35; // $35/hr
  const hours = Array.from({ length: 8 }, (_, i) => i + 1);
  
  // Synthetic lines of code written per hour
  const locOutput = [50, 120, 300, 500, 45, 10, 200, 80];

  const maxLoc = Math.max(...locOutput);
  
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = () => {
     setShowAnalysis(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     if (onComplete) setTimeout(onComplete, 8000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-white text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-200 flex justify-between items-center z-10 bg-slate-50">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
               <TrendingUp size={16} className="text-red-500" /> Efficiency vs Labor
            </h2>
         </div>
      </div>

      <div className="flex-1 relative flex flex-col p-6 w-full max-w-xl mx-auto">
         
         {/* Dual Axis Chart */}
         <div className="relative h-64 w-full border-b-2 border-l-2 border-slate-300 mt-8">
            
            {/* Y-Axis L (Output) */}
            <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between items-end text-[10px] text-red-500 py-2 pr-2">
               <span>{maxLoc} LoC</span>
               <span>{Math.round(maxLoc/2)}</span>
               <span>0</span>
            </div>

            {/* Y-Axis R (Salary) */}
            <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-between items-start text-[10px] text-emerald-600 py-2 pl-2">
               <span>${hourlyWage * 2}</span>
               <span>${hourlyWage}</span>
               <span>$0</span>
            </div>

            <div className="absolute inset-0 flex items-end justify-between px-4 pb-0">
               {hours.map((hr, i) => {
                  const locHeight = (locOutput[i] / maxLoc) * 100;
                  // Salary is flat per hour
                  const salaryHeight = 50; // Plotting it exactly at the midpoint for visual comparison

                  const efficiency = locOutput[i] / hourlyWage; // lines per dollar
                  const isInefficient = locOutput[i] < 50;

                  return (
                     <div key={hr} className="relative w-8 h-full flex flex-col justify-end items-center group">
                        
                        {showAnalysis && isInefficient && (
                           <div className="absolute top-0 w-full h-full bg-red-500/10 -z-10" />
                        )}

                        {/* LoC Bar */}
                        <motion.div 
                           className={`w-4 rounded-t-sm absolute bottom-0 shadow-sm ${showAnalysis && isInefficient ? 'bg-red-500' : 'bg-slate-800'}`}
                           initial={{ height: 0 }}
                           animate={{ height: `${locHeight}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                        />

                        {/* Salary Line Segment (Step interpolation visual) */}
                        <motion.div 
                           className="w-12 h-1 bg-emerald-500 absolute"
                           style={{ bottom: `${salaryHeight}%`, left: '50%', transform: 'translateX(-50%)' }}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 1 + i * 0.1 }}
                        />

                        {/* Hover Data */}
                        <div className="absolute -top-12 bg-slate-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                           Hr {hr}: {locOutput[i]} LoC / ${hourlyWage}
                        </div>

                        {/* X-Axis label */}
                        <div className="absolute -bottom-6 text-[10px] font-bold text-slate-400">H{hr}</div>
                     </div>
                  )
               })}
            </div>
         </div>

         {!showAnalysis ? (
            <div className="mt-16 text-center">
               <button 
                  onClick={handleAnalyze}
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
               >
                  Run Efficiency Analysis
               </button>
            </div>
         ) : (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-16 bg-slate-50 border border-slate-200 p-6 rounded-2xl flex items-start gap-4"
            >
               <Banknote size={32} className="text-emerald-600 flex-shrink-0" />
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-2">Labor Discrepancy Detected</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                     In Hours 5, 6, and 8, output dropped significantly below baseline while compensation remained fixed. 
                     The employer paid $35/hr for 10 Lines of Code during Hour 6 ($3.50 per line), compared to $0.07 per line during Hour 4.
                  </p>
               </div>
            </motion.div>
         )}

      </div>

    </div>
  );
}
