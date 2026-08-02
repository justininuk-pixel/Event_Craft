"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Hexagon } from "lucide-react";

type Stat = {
  name: string;
  val: number;
};

export function HexagonStatGrid({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [stats, setStats] = useState<Stat[]>([
    { name: "Strategy", val: 50 },
    { name: "Luck", val: 50 },
    { name: "Social", val: 50 },
    { name: "Combat", val: 50 },
    { name: "Lore", val: 50 },
    { name: "Mechanics", val: 50 },
  ]);

  const handleChange = (index: number, val: number) => {
     const newStats = [...stats];
     newStats[index].val = val;
     setStats(newStats);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(5);
  };

  const handleFinish = () => {
     if (onComplete) onComplete();
  };

  // SVG Geometry Calculation
  const radius = 100;
  const center = 150;
  
  // Calculate the path points for the current stats
  const points = stats.map((stat, i) => {
    const angle = (Math.PI / 3) * i - (Math.PI / 2); // 60 degrees, start top
    const r = (stat.val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  // Background Grid Hexagons (20%, 40%, 60%, 80%, 100%)
  const gridHexagons = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (Math.PI / 3) * i - (Math.PI / 2);
      const r = scale * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");
  });

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-900 text-violet-100 p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="text-center z-10 mb-2">
         <h2 className="text-xl font-black uppercase tracking-widest text-violet-400 flex items-center justify-center gap-2">
            <Hexagon size={24} /> Radar Grid
         </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm mx-auto">
         
         <div className="relative w-[300px] h-[300px] mb-8">
            <svg width="300" height="300" className="absolute inset-0 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               {/* Background Grid */}
               {gridHexagons.map((points, i) => (
                  <polygon key={i} points={points} fill="none" stroke="#1e293b" strokeWidth="1" />
               ))}

               {/* Grid Lines to corners */}
               {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (Math.PI / 3) * i - (Math.PI / 2);
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#1e293b" strokeWidth="1" />;
               })}

               {/* Actual Stat Polygon */}
               <polygon 
                  points={points} 
                  fill="rgba(139, 92, 246, 0.3)" 
                  stroke="#8b5cf6" 
                  strokeWidth="3" 
                  className="transition-all duration-300 ease-out" 
               />

               {/* Nodes */}
               {stats.map((stat, i) => {
                  const angle = (Math.PI / 3) * i - (Math.PI / 2);
                  const r = (stat.val / 100) * radius;
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return <circle key={i} cx={x} cy={y} r="4" fill="#a78bfa" className="transition-all duration-300 ease-out" />;
               })}
            </svg>

            {/* Labels (absolutely positioned around SVG) */}
            {stats.map((stat, i) => {
               const angle = (Math.PI / 3) * i - (Math.PI / 2);
               // Push labels out further than radius
               const labelR = radius + 25; 
               const x = center + labelR * Math.cos(angle);
               const y = center + labelR * Math.sin(angle);
               return (
                  <div 
                     key={i} 
                     className="absolute w-20 text-center -ml-10 -mt-3 text-[10px] font-bold text-violet-300"
                     style={{ left: x, top: y }}
                  >
                     {stat.name}
                  </div>
               );
            })}
         </div>

         {/* Sliders */}
         <div className="w-full space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            {stats.map((stat, i) => (
               <div key={i} className="flex items-center gap-4">
                  <span className="text-[10px] uppercase w-20 text-right text-slate-400">{stat.name}</span>
                  <input 
                     type="range" 
                     min="0" max="100" 
                     value={stat.val} 
                     onChange={(e) => handleChange(i, Number(e.target.value))}
                     className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
               </div>
            ))}
         </div>

      </div>

      <button onClick={handleFinish} className="mt-4 p-4 w-full text-center text-xs font-bold uppercase tracking-widest text-violet-500 hover:text-violet-400">
         Lock Stats
      </button>

    </div>
  );
}
