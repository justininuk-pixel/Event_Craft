"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Smile, Frown, Meh, SmilePlus, FrownIcon } from "lucide-react";

type MoodPoint = {
  day: number;
  value: number; // 1 (Awful) to 5 (Great)
};

const MOODS = [
   { value: 1, label: "Awful", icon: FrownIcon, color: "#3b82f6" }, // Blue
   { value: 2, label: "Bad", icon: Frown, color: "#8b5cf6" }, // Purple
   { value: 3, label: "Meh", icon: Meh, color: "#94a3b8" }, // Slate
   { value: 4, label: "Good", icon: Smile, color: "#10b981" }, // Green
   { value: 5, label: "Great", icon: SmilePlus, color: "#f59e0b" }, // Yellow
];

// Helper to generate a smooth bezier curve path from data points
// Simple Catmull-Rom to Bezier conversion for SVG
const catmullRom2bezier = (points: {x: number, y: number}[]) => {
   if (points.length === 0) return "";
   if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
   
   let d = `M ${points[0].x} ${points[0].y} `;
   
   for (let i = 0; i < points.length - 1; i++) {
      const p0 = i === 0 ? points[0] : points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
   }
   
   return d;
};

export function MoodCurveGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // dark mode by default for vibrant curves

  // Generate 29 days of mock data
  const [data, setData] = useState<MoodPoint[]>(() => {
     const arr: MoodPoint[] = [];
     let current = 3;
     for (let i = 0; i < 29; i++) {
        // Random walk for somewhat realistic mood swings
        const step = Math.random() > 0.5 ? 1 : -1;
        current = Math.max(1, Math.min(5, current + (Math.random() > 0.6 ? step : 0)));
        arr.push({ day: i, value: current });
     }
     return arr;
  });

  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  const logMood = (value: number) => {
     if (hasLoggedToday) return;
     setData(prev => [...prev, { day: 29, value }]);
     setHasLoggedToday(true);
     if (onComplete) onComplete();
  };

  // SVG coordinates mapping
  const graphWidth = 800;
  const graphHeight = 300;
  const paddingX = 40;
  const paddingY = 40;
  
  const points = data.map((d, i) => {
     // X maps from 0 to 29 across the width
     const x = paddingX + (i / 29) * (graphWidth - paddingX * 2);
     // Y maps from 1 to 5 (invert Y so 5 is top)
     const y = graphHeight - paddingY - ((d.value - 1) / 4) * (graphHeight - paddingY * 2);
     return { x, y };
  });

  const pathD = catmullRom2bezier(points);

  // Calculate current average or trend
  const last7 = data.slice(-7);
  const avg7 = last7.reduce((sum, d) => sum + d.value, 0) / (last7.length || 1);
  const currentMoodObj = MOODS.find(m => m.value === Math.round(avg7)) || MOODS[2];

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden text-slate-100"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="w-full max-w-4xl flex flex-col h-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden relative z-10">
         
         {/* Header area */}
         <div className="p-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 relative">
            <div>
               <h2 className="text-3xl font-black tracking-tight mb-2">
                  {config.title || "Mood Curve"}
               </h2>
               <p className="text-slate-400 font-medium">
                  {config.body || "How are you feeling today?"}
               </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
               <div>
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">7-Day Trend</span>
                  <span className="text-lg font-bold" style={{ color: currentMoodObj.color }}>
                     {currentMoodObj.label} ({avg7.toFixed(1)})
                  </span>
               </div>
               <currentMoodObj.icon size={32} style={{ color: currentMoodObj.color }} />
            </div>
         </div>

         {/* The Graph */}
         <div className="flex-1 w-full relative min-h-[250px]">
            {/* SVG Graph */}
            <svg 
               viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
               className="absolute inset-0 w-full h-full"
               preserveAspectRatio="none"
            >
               {/* Definitions for gradient */}
               <defs>
                  <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="#f59e0b" /> {/* Great (Yellow) */}
                     <stop offset="25%" stopColor="#10b981" /> {/* Good (Green) */}
                     <stop offset="50%" stopColor="#94a3b8" /> {/* Meh (Slate) */}
                     <stop offset="75%" stopColor="#8b5cf6" /> {/* Bad (Purple) */}
                     <stop offset="100%" stopColor="#3b82f6" /> {/* Awful (Blue) */}
                  </linearGradient>
                  
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
               </defs>

               {/* Grid Lines */}
               {[1, 2, 3, 4, 5].map(val => {
                  const y = graphHeight - paddingY - ((val - 1) / 4) * (graphHeight - paddingY * 2);
                  return (
                     <line 
                        key={val}
                        x1={paddingX} 
                        y1={y} 
                        x2={graphWidth - paddingX} 
                        y2={y} 
                        stroke="#334155" 
                        strokeWidth="1"
                        strokeDasharray="4 4"
                     />
                  );
               })}

               {/* Area under curve */}
               {data.length > 0 && (
                  <motion.path
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 1, delay: 0.5 }}
                     d={`${pathD} L ${points[points.length-1].x} ${graphHeight - paddingY} L ${points[0].x} ${graphHeight - paddingY} Z`}
                     fill="url(#areaGradient)"
                  />
               )}

               {/* The Curve */}
               <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d={pathD}
                  fill="none"
                  stroke="url(#moodGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}
               />

               {/* Data Points */}
               {points.map((p, i) => (
                  <motion.circle
                     key={i}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 1 + (i * 0.02) }}
                     cx={p.x}
                     cy={p.y}
                     r="4"
                     fill="#1e293b"
                     stroke="url(#moodGradient)"
                     strokeWidth="2"
                  />
               ))}
               
               {/* Highlight latest point */}
               {points.length > 0 && (
                  <motion.circle
                     initial={{ scale: 0 }}
                     animate={{ scale: [1, 1.5, 1] }}
                     transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
                     cx={points[points.length-1].x}
                     cy={points[points.length-1].y}
                     r="6"
                     fill="#fff"
                  />
               )}
            </svg>
         </div>

         {/* Logging Area */}
         <div className="p-6 md:p-8 bg-slate-800/80 backdrop-blur border-t border-slate-700 z-10 relative">
            {!hasLoggedToday ? (
               <div className="flex justify-between max-w-2xl mx-auto gap-2">
                  {MOODS.map((mood) => {
                     const Icon = mood.icon;
                     return (
                        <button
                           key={mood.value}
                           onClick={() => logMood(mood.value)}
                           className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:bg-slate-700 hover:scale-110 active:scale-95 group flex-1"
                        >
                           <div 
                              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-colors shadow-lg group-hover:shadow-xl"
                              style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
                           >
                              <Icon size={28} className="md:w-8 md:h-8" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200">
                              {mood.label}
                           </span>
                        </button>
                     )
                  })}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                     <SmilePlus size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Logged for today.</h3>
                  <p className="text-slate-400 mt-2">See you tomorrow.</p>
               </div>
            )}
         </div>
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && hasLoggedToday && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setHasLoggedToday(false)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/10"
            >
               Reset Log (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
