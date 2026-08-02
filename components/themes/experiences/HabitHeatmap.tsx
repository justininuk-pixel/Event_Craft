"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function HabitHeatmap({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const title = config.title || "2024 Commits";
  const daysInYear = 365;

  const [heatmapData, setHeatmapData] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  // Generate random heatmap data
  useEffect(() => {
     const data = [];
     for(let i=0; i<daysInYear; i++) {
        // Create clusters of activity
        const cluster = Math.sin(i / 20) * 0.5 + 0.5;
        const noise = Math.random();
        let val = 0;
        if (noise < cluster * 0.8) {
           val = Math.floor(Math.random() * 4) + 1; // 1 to 4
        }
        data.push(val);
     }
     setHeatmapData(data);
  }, []);

  useEffect(() => {
     if (heatmapData.length > 0) {
        setTimeout(() => setRevealed(true), 500);
        if (onComplete) setTimeout(onComplete, 4000);
     }
  }, [heatmapData, onComplete]);

  // Weeks x Days layout
  const weeks = Math.ceil(daysInYear / 7);

  const getColor = (val: number) => {
     if (val === 0) return "#1f2937"; // gray-800
     if (val === 1) return `${primaryColor}40`; // 25% opacity
     if (val === 2) return `${primaryColor}80`; // 50% opacity
     if (val === 3) return `${primaryColor}C0`; // 75% opacity
     return primaryColor; // 100% opacity
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-black text-gray-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-12 pb-6 px-6 z-10 flex items-center gap-3">
         <Activity size={24} style={{ color: primaryColor }} />
         <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">482 Contributions</p>
         </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-12 hide-scrollbar">
         
         <div className="flex gap-1">
            {Array.from({ length: weeks }).map((_, w) => (
               <div key={`w-${w}`} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, d) => {
                     const dayIndex = w * 7 + d;
                     if (dayIndex >= daysInYear) return <div key={`empty-${d}`} className="w-3 h-3" />;
                     
                     const val = heatmapData[dayIndex] || 0;
                     
                     return (
                        <motion.div 
                           key={`d-${dayIndex}`}
                           initial={{ opacity: 0, scale: 0.5 }}
                           animate={revealed ? { opacity: 1, scale: 1 } : {}}
                           transition={{ 
                              duration: 0.3, 
                              delay: revealed ? (dayIndex / daysInYear) * 2 : 0 // wave animation
                           }}
                           className="w-3 h-3 rounded-[2px]"
                           style={{ backgroundColor: getColor(val) }}
                        />
                     );
                  })}
               </div>
            ))}
         </div>

      </div>

    </div>
  );
}
