"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair } from "lucide-react";

export function RadarPentagonChart({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const title = config.title || "Personality Stats";
  
  const stats = [
    { label: "Humor", value: 80 },
    { label: "Patience", value: 40 },
    { label: "Spontaneity", value: 90 },
    { label: "Logic", value: 60 },
    { label: "Empathy", value: 85 },
  ];

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setTimeout(() => {
       setRevealed(true);
       if (onComplete) setTimeout(onComplete, 4000);
       if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    }, 1000);
  }, [onComplete]);

  // Radar chart math
  const size = 300;
  const center = size / 2;
  const radius = size / 2.5;

  const getPoint = (value: number, index: number, total: number) => {
     const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
     const r = (value / 100) * radius;
     const x = center + r * Math.cos(angle);
     const y = center + r * Math.sin(angle);
     return `${x},${y}`;
  };

  const polygonPoints = stats.map((s, i) => getPoint(s.value, i, stats.length)).join(" ");
  const bgPolygon1 = stats.map((_, i) => getPoint(100, i, stats.length)).join(" ");
  const bgPolygon2 = stats.map((_, i) => getPoint(66, i, stats.length)).join(" ");
  const bgPolygon3 = stats.map((_, i) => getPoint(33, i, stats.length)).join(" ");

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-8 text-center z-10">
         <Crosshair size={24} className="mx-auto mb-2 text-violet-500 opacity-50" />
         <h2 className="text-xl font-black uppercase tracking-widest text-slate-200">{title}</h2>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
         
         <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute inset-0 overflow-visible">
               
               {/* Background Grids */}
               <polygon points={bgPolygon1} fill="none" stroke="#334155" strokeWidth="1" />
               <polygon points={bgPolygon2} fill="none" stroke="#1e293b" strokeWidth="1" />
               <polygon points={bgPolygon3} fill="none" stroke="#0f172a" strokeWidth="1" />
               
               {/* Spokes */}
               {stats.map((_, i) => {
                  const end = getPoint(100, i, stats.length);
                  return (
                     <line 
                        key={`l-${i}`}
                        x1={center} y1={center} 
                        x2={end.split(',')[0]} y2={end.split(',')[1]} 
                        stroke="#334155" strokeWidth="1" strokeDasharray="4 4"
                     />
                  );
               })}

               {/* Data Polygon */}
               <motion.polygon 
                 points={polygonPoints}
                 fill={primaryColor}
                 fillOpacity="0.4"
                 stroke={primaryColor}
                 strokeWidth="3"
                 initial={{ opacity: 0, scale: 0 }}
                 animate={revealed ? { opacity: 1, scale: 1 } : {}}
                 transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
                 style={{ transformOrigin: 'center' }}
               />

               {/* Data Points */}
               <AnimatePresence>
                  {revealed && stats.map((s, i) => {
                     const pt = getPoint(s.value, i, stats.length);
                     return (
                        <motion.circle
                           key={`c-${i}`}
                           cx={pt.split(',')[0]} cy={pt.split(',')[1]} r="5"
                           fill="#ffffff" stroke={primaryColor} strokeWidth="2"
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.5 + i * 0.1 }}
                        />
                     );
                  })}
               </AnimatePresence>
            </svg>

            {/* Labels */}
            {stats.map((s, i) => {
               // Place labels slightly outside the 100% radius
               const pt = getPoint(120, i, stats.length);
               const x = parseFloat(pt.split(',')[0]);
               const y = parseFloat(pt.split(',')[1]);
               return (
                  <motion.div 
                     key={`lbl-${i}`}
                     initial={{ opacity: 0 }}
                     animate={revealed ? { opacity: 1 } : {}}
                     transition={{ delay: 1 + i * 0.1 }}
                     className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                     style={{ left: x, top: y }}
                  >
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-slate-900/80 px-2 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap">
                        {s.label}
                     </span>
                     {revealed && <span className="text-[10px] text-violet-400 font-mono mt-0.5">{s.value}%</span>}
                  </motion.div>
               );
            })}

         </div>
      </div>

    </div>
  );
}
