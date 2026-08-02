"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Focus } from "lucide-react";

export function OutlierHighlighter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // red-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // gray-900

  // Generate synthetic dataset with a few clear outliers
  const rawData = (() => {
     const arr = [];
     // 95 normal points
     for (let i = 0; i < 95; i++) {
        // Bell curve approximation
        const val = Math.floor(50 + (Math.random() + Math.random() + Math.random() - 1.5) * 20);
        arr.push(val);
     }
     // 5 outliers
     arr.push(10);
     arr.push(95);
     arr.push(5);
     arr.push(110);
     arr.push(105);
     
     return arr; // Keep unsorted to show scatter
  })();

  const [highlighted, setHighlighted] = useState(false);

  // Statistics
  const mean = rawData.reduce((s, a) => s + a, 0) / rawData.length;
  const stdDev = Math.sqrt(rawData.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / rawData.length);
  const threshold = stdDev * 2; // 2 standard deviations

  const handleHighlight = () => {
     setHighlighted(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 100, 20]);
     if (onComplete) setTimeout(onComplete, 5000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-gray-900 text-gray-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-gray-800 flex justify-between items-center z-20 bg-gray-900">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
               <Focus size={16} className="text-red-500" /> Outlier Isolation
            </h2>
         </div>
         <button 
            onClick={handleHighlight}
            disabled={highlighted}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
               highlighted ? 'bg-red-900/50 text-red-500 border border-red-900' : 'bg-red-600 text-white hover:bg-red-500'
            }`}
         >
            Apply Filter
         </button>
      </div>

      <div className="flex-1 relative p-6 overflow-y-auto z-10 hide-scrollbar flex flex-col gap-2">
         
         <div className="flex justify-between text-[10px] uppercase text-gray-500 mb-4 sticky top-0 bg-gray-900/90 py-2 backdrop-blur-sm z-30">
            <span>Index</span>
            <span>Value</span>
            <span>Deviation</span>
         </div>

         {rawData.map((val, i) => {
            const dev = Math.abs(val - mean);
            const isOutlier = dev > threshold;
            
            return (
               <motion.div 
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                     opacity: highlighted ? (isOutlier ? 1 : 0.1) : 1, 
                     y: 0,
                     filter: highlighted ? (isOutlier ? "blur(0px)" : "blur(2px)") : "blur(0px)",
                  }}
                  transition={{ duration: 0.8, delay: i * 0.01 }}
                  className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                     highlighted && isOutlier 
                     ? 'bg-red-950/50 border-red-500 text-red-100 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                     : 'bg-gray-800 border-gray-700'
                  }`}
               >
                  <span className="text-xs text-gray-500 w-8 text-left">#{i+1}</span>
                  <span className={`text-sm font-bold flex-1 text-center ${highlighted && isOutlier ? 'text-red-400' : 'text-gray-200'}`}>{val}</span>
                  <span className="text-[10px] w-16 text-right">{(dev / stdDev).toFixed(1)}σ</span>
               </motion.div>
            )
         })}

      </div>

      <AnimatePresence>
         {highlighted && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-6 left-6 right-6 bg-red-600 text-white p-4 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.4)] z-30 flex items-center justify-between"
            >
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-200 mb-1">Anomalies Detected</div>
                  <div className="text-xl font-black">{rawData.filter(v => Math.abs(v - mean) > threshold).length} Data Points Isolated</div>
               </div>
               <Eye size={32} className="opacity-50" />
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
