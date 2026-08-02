"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { PieChart, Play, Square } from "lucide-react";

type Category = {
  id: string;
  name: string;
  color: string;
  timeMs: number;
};

const initialCategories: Category[] = [
  { id: "c1", name: "Work", color: "#3b82f6", timeMs: 0 },    // blue-500
  { id: "c2", name: "TikTok", color: "#ef4444", timeMs: 0 },  // red-500
  { id: "c3", name: "Reading", color: "#10b981", timeMs: 0 }, // emerald-500
  { id: "c4", name: "Other", color: "#64748b", timeMs: 0 },   // slate-500
];

export function ProportionalTimePie({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showPie, setShowPie] = useState(false);

  const lastTick = useRef<number>(Date.now());

  // Timer simulation (in a real app this would accumulate actual milliseconds)
  // For the sake of the demo, we'll run it much faster so the pie chart is visible quickly
  useEffect(() => {
     if (!activeCategoryId) return;

     const interval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTick.current;
        lastTick.current = now;

        setCategories(prev => prev.map(c => 
           c.id === activeCategoryId ? { ...c, timeMs: c.timeMs + delta * 100 } : c // *100 to speed up demo
        ));
     }, 100);

     return () => clearInterval(interval);
  }, [activeCategoryId]);

  const handleToggle = (id: string) => {
     if (activeCategoryId === id) {
        setActiveCategoryId(null);
     } else {
        setActiveCategoryId(id);
        lastTick.current = Date.now();
     }
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  const handleFinish = () => {
     setActiveCategoryId(null);
     setShowPie(true);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  const totalTime = categories.reduce((sum, c) => sum + c.timeMs, 0);

  // SVG Pie Math
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  const formatTime = (ms: number) => {
     const totalSeconds = Math.floor(ms / 1000);
     const hours = Math.floor(totalSeconds / 3600);
     const minutes = Math.floor((totalSeconds % 3600) / 60);
     const seconds = totalSeconds % 60;
     if (hours > 0) return `${hours}h ${minutes}m`;
     if (minutes > 0) return `${minutes}m ${seconds}s`;
     return `${seconds}s`;
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 pb-2 text-center z-10 flex justify-between items-center">
         <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Time Allocation</h2>
         {!showPie && <button onClick={handleFinish} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-bold uppercase tracking-widest">End Day</button>}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
         
         {!showPie ? (
            <div className="w-full space-y-4">
               {categories.map((c) => {
                  const isActive = activeCategoryId === c.id;
                  return (
                     <button
                        key={c.id}
                        onClick={() => handleToggle(c.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                           isActive ? 'border-transparent shadow-lg scale-105' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: isActive ? c.color : '#ffffff', color: isActive ? '#ffffff' : '#0f172a' }}
                     >
                        <div className="flex items-center gap-3">
                           {isActive ? <Square size={20} className="animate-pulse" /> : <Play size={20} />}
                           <span className="font-bold text-lg">{c.name}</span>
                        </div>
                        <span className="font-mono text-sm opacity-80">{formatTime(c.timeMs)}</span>
                     </button>
                  );
               })}
            </div>
         ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center w-full"
            >
               <svg width="250" height="250" viewBox="0 0 220 220" className="transform -rotate-90 drop-shadow-xl">
                  <circle cx="110" cy="110" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
                  {totalTime > 0 && categories.map(c => {
                     const pct = c.timeMs / totalTime;
                     const dash = pct * circumference;
                     const offset = circumference - currentOffset;
                     currentOffset += dash;
                     
                     return (
                        <motion.circle
                           key={c.id}
                           cx="110"
                           cy="110"
                           r={radius}
                           fill="none"
                           stroke={c.color}
                           strokeWidth="20"
                           strokeDasharray={`${dash} ${circumference}`}
                           strokeDashoffset={offset}
                           initial={{ strokeDasharray: `0 ${circumference}` }}
                           animate={{ strokeDasharray: `${dash} ${circumference}` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                     );
                  })}
               </svg>

               <div className="mt-12 w-full space-y-2">
                  {categories.map(c => {
                     const pct = totalTime > 0 ? (c.timeMs / totalTime) * 100 : 0;
                     if (pct === 0) return null;
                     return (
                        <div key={c.id} className="flex justify-between items-center text-sm font-medium">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.name}
                           </div>
                           <div className="font-mono text-slate-500">
                              {pct.toFixed(1)}% <span className="opacity-50 ml-1">({formatTime(c.timeMs)})</span>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </motion.div>
         )}

      </div>

    </div>
  );
}
