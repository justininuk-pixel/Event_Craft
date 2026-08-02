"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Plus } from "lucide-react";

export function GoalStockTicker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const goal = 10000;
  const initialData = [1000, 1200, 1100, 1500, 1400, 2000, 2500, 2400, 3000];

  const [dataPoints, setDataPoints] = useState<number[]>(initialData);
  const [bullRun, setBullRun] = useState(false);

  const current = dataPoints[dataPoints.length - 1];
  const percent = Math.min((current / goal) * 100, 100);

  const handleDeposit = () => {
    if (bullRun) return;
    const newAmount = current + 500;
    setDataPoints(prev => [...prev, newAmount]);
    setBullRun(true);
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 30, 30, 100]);

    setTimeout(() => {
       setBullRun(false);
       if (newAmount >= goal && onComplete) onComplete();
    }, 3000);
  };

  // Drawing the SVG Graph
  const minVal = 0;
  const maxVal = Math.max(goal, ...dataPoints);
  const graphWidth = 300;
  const graphHeight = 200;

  const points = dataPoints.map((val, i) => {
     const x = (i / Math.max(dataPoints.length - 1, 1)) * graphWidth;
     const y = graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
     return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-950 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Ticker Header */}
      <div className="p-6 border-b border-slate-900 bg-slate-950 z-20 flex justify-between items-end shadow-md">
         <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">House Fund (HSE)</h2>
            <div className={`text-4xl font-black transition-colors duration-500 ${bullRun ? 'text-green-400' : 'text-white'}`}>
               ${current.toLocaleString()}
            </div>
         </div>
         <div className="text-right">
            <div className={`flex items-center justify-end gap-1 text-sm font-bold transition-colors duration-500 ${bullRun ? 'text-green-400' : 'text-slate-400'}`}>
               <TrendingUp size={16} />
               {percent.toFixed(1)}%
            </div>
         </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center">
         
         {/* Live Graph */}
         <div className="relative w-full px-4 h-[200px] flex items-center justify-center">
            
            {/* Target Line */}
            <div className="absolute top-0 w-full border-t border-dashed border-slate-800 flex justify-end">
               <span className="text-[10px] text-slate-600 font-mono mt-1 pr-4">GOAL: ${goal.toLocaleString()}</span>
            </div>

            <svg width="100%" height={graphHeight} viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none" className="overflow-visible z-10">
               
               {/* Background Gradient */}
               <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={bullRun ? 0.3 : 0.1} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
               </linearGradient>
               
               {/* Fill */}
               <motion.polygon 
                  points={`0,${graphHeight} ${points} ${graphWidth},${graphHeight}`}
                  fill="url(#bullGradient)"
                  animate={{ fillOpacity: bullRun ? 1 : 0.5 }}
                  transition={{ duration: 0.5 }}
               />

               {/* Line */}
               <motion.polyline
                  points={points}
                  fill="none"
                  stroke={bullRun ? "#4ade80" : "#3b82f6"} // green-400 / blue-500
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, stroke: bullRun ? "#4ade80" : "#3b82f6" }}
                  transition={{ duration: 0.5 }}
               />

               {/* Current Node Pulse */}
               {dataPoints.length > 0 && (
                  <motion.circle 
                     cx={graphWidth}
                     cy={graphHeight - ((current - minVal) / (maxVal - minVal)) * graphHeight}
                     r="4"
                     fill={bullRun ? "#4ade80" : "#3b82f6"}
                     animate={{ r: bullRun ? [4, 10, 4] : 4 }}
                     transition={{ repeat: bullRun ? Infinity : 0, duration: 1 }}
                  />
               )}
            </svg>
         </div>

         {/* Bull Run Effects */}
         <AnimatePresence>
            {bullRun && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, y: 50 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, y: -50 }}
                 className="absolute top-10 text-6xl font-black text-green-500 opacity-20 pointer-events-none uppercase tracking-widest"
               >
                 BULL RUN
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800 z-20">
         <button 
            onClick={handleDeposit}
            disabled={bullRun || current >= goal}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
               bullRun ? 'bg-green-600 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
         >
            <Plus size={20} />
            Deposit $500
         </button>
      </div>

    </div>
  );
}
