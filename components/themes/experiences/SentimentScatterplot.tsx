"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, X } from "lucide-react";

type DataPoint = {
   id: string;
   timestamp: number;
   emotionScore: number; // -10 to 10
   label: string;
   memory: string;
};

const defaultPoints: DataPoint[] = [
   { id: "1", timestamp: new Date("2023-01-15").getTime(), emotionScore: 2, label: "Jan", memory: "Quiet start to the year." },
   { id: "2", timestamp: new Date("2023-03-10").getTime(), emotionScore: -8, label: "Mar", memory: "A really tough breakup." },
   { id: "3", timestamp: new Date("2023-05-20").getTime(), emotionScore: 0, label: "May", memory: "Just drifting along." },
   { id: "4", timestamp: new Date("2023-07-04").getTime(), emotionScore: 9, label: "Jul", memory: "Incredible summer road trip!" },
   { id: "5", timestamp: new Date("2023-10-31").getTime(), emotionScore: 5, label: "Oct", memory: "Great Halloween party." },
   { id: "6", timestamp: new Date("2023-12-25").getTime(), emotionScore: 8, label: "Dec", memory: "Cozy holidays with family." },
];

export function SentimentScatterplot({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const secondaryColor = Array.isArray(palette.secondary) ? palette.secondary[0] : palette.secondary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const points = (config.experience as any)?.points || defaultPoints;
  
  // Sort points chronologically
  const sortedPoints = [...points].sort((a, b) => a.timestamp - b.timestamp);
  
  const minTime = sortedPoints[0]?.timestamp || 0;
  const maxTime = sortedPoints[sortedPoints.length - 1]?.timestamp || 1;
  const timeRange = maxTime - minTime || 1;

  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);

  const handleNodeClick = (point: DataPoint) => {
     setActivePoint(point);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-slate-300"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
         <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md flex items-center gap-2">
            <LineChart size={24} style={{ color: primaryColor }} />
            {config.title || "Emotional Topology"}
         </h2>
         <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
            {config.body || "Mapping subjective emotion across the timeline of a year."}
         </p>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative mt-24 mb-12 mx-8 border-l border-b border-slate-700">
         
         {/* Y-Axis Labels */}
         <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[10px] text-slate-600 font-bold py-2">
            <span>+10</span>
            <span className="text-slate-400">0</span>
            <span>-10</span>
         </div>

         {/* Zero Line */}
         <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800 border-t border-dashed border-slate-700 pointer-events-none" />

         {/* Nodes */}
         {sortedPoints.map((point: DataPoint, idx: number) => {
            
            // X mapping: time to percentage (0-100)
            const xPercent = timeRange === 0 ? 50 : ((point.timestamp - minTime) / timeRange) * 90 + 5; // 5% padding
            
            // Y mapping: emotion (-10 to 10) to percentage (0 to 100, where 10 is top/0%, and -10 is bottom/100%)
            // emotion: 10 -> 0% (top)
            // emotion: -10 -> 100% (bottom)
            const yPercent = 50 - (point.emotionScore * 5); 

            // Color based on emotion (gradient from secondary to primary)
            const isPositive = point.emotionScore >= 0;
            const nodeColor = isPositive ? primaryColor : secondaryColor;

            return (
               <motion.div
                  key={point.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full cursor-pointer hover:scale-150 transition-transform shadow-[0_0_10px_currentColor] z-10"
                  style={{ 
                     left: `${xPercent}%`, 
                     top: `${yPercent}%`,
                     backgroundColor: nodeColor,
                     color: nodeColor
                  }}
                  onClick={() => handleNodeClick(point)}
               >
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-50 pointer-events-none">
                     {point.label}
                  </div>
               </motion.div>
            );
         })}
         
         {/* SVG Path connecting the dots */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <motion.path 
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 0.3 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               d={`M ${sortedPoints.map((p: DataPoint) => {
                  const x = timeRange === 0 ? 50 : ((p.timestamp - minTime) / timeRange) * 90 + 5;
                  const y = 50 - (p.emotionScore * 5);
                  return `${x}% ${y}%`;
               }).join(' L ')}`}
               fill="none"
               stroke="white"
               strokeWidth="1"
               strokeDasharray="4 4"
            />
         </svg>
      </div>

      {/* Modal for active point */}
      <AnimatePresence>
         {activePoint && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
               className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 flex items-start justify-between"
            >
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: activePoint.emotionScore >= 0 ? primaryColor : secondaryColor }}
                     />
                     <h3 className="font-bold text-white text-lg">
                        {activePoint.label}
                     </h3>
                     <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        Score: {activePoint.emotionScore > 0 ? '+' : ''}{activePoint.emotionScore}
                     </span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed max-w-sm">
                     {activePoint.memory}
                  </p>
               </div>
               
               <button 
                  onClick={() => setActivePoint(null)}
                  className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
               >
                  <X size={20} />
               </button>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
