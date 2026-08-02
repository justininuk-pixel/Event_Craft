"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { CloudRain, Smile } from "lucide-react";

export function MoodWeatherScatterplot({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [loading, setLoading] = useState(true);

  // Synthetic Data: 30 days of Mood (1-10) and Rain (mm)
  // Designed to show a loose correlation: higher rain generally = lower mood
  const data = Array.from({ length: 30 }, (_, i) => {
     const isRainy = Math.random() > 0.6;
     const rainAmount = isRainy ? Math.random() * 20 : 0; // 0 to 20mm
     
     // Mood base: 6 to 10. If rainy, subtract 1 to 5 points.
     let mood = Math.floor(Math.random() * 5) + 6; 
     if (isRainy) {
        mood -= Math.floor(Math.random() * (rainAmount / 4));
     }
     mood = Math.max(1, Math.min(10, mood));

     return { day: i + 1, mood, rain: rainAmount };
  });

  useEffect(() => {
     // Simulate fetching historical weather API
     const t = setTimeout(() => {
        setLoading(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);
        if (onComplete) setTimeout(onComplete, 8000);
     }, 2000);
     return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-50 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
         <h2 className="text-lg font-black uppercase tracking-widest flex justify-center items-center gap-2 text-slate-800">
            <Smile size={20} className="text-amber-500" />
            Mood vs <CloudRain size={20} className="text-blue-500" /> Weather
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
         
         {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
               <CloudRain size={48} className="animate-bounce text-blue-300" />
               <div className="text-xs uppercase tracking-widest font-bold animate-pulse">Fetching Historical Meteorological Data...</div>
            </div>
         ) : (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col"
            >
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 px-4">
                  <span>30 Day History</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Rain (mm)</span>
               </div>

               {/* Dual Axis Graph Area */}
               <div className="relative h-64 w-full border-b border-slate-200">
                  
                  {/* Y-Axis Labels (Mood) */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-amber-500/50 py-2">
                     <span>10</span><span>8</span><span>6</span><span>4</span><span>2</span>
                  </div>

                  {/* Y-Axis Labels (Rain) */}
                  <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-blue-500/50 py-2 items-end">
                     <span>20mm</span><span>15mm</span><span>10mm</span><span>5mm</span><span>0mm</span>
                  </div>

                  {/* Data Points */}
                  <div className="absolute inset-y-2 left-6 right-8 flex items-end justify-between">
                     {data.map((d, i) => {
                        const moodHeight = (d.mood / 10) * 100;
                        const rainHeight = (d.rain / 20) * 100;

                        return (
                           <div key={i} className="relative w-full h-full flex items-end justify-center group">
                              
                              {/* Hover Info */}
                              <div className="absolute -top-10 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-lg">
                                 Day {d.day}: Mood {d.mood}, Rain {d.rain.toFixed(1)}mm
                              </div>

                              {/* Rain Bar (Background overlay) */}
                              {d.rain > 0 && (
                                 <motion.div 
                                    className="absolute bottom-0 w-full bg-blue-500/10 rounded-t-sm border-t border-blue-500/30"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${rainHeight}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                 />
                              )}

                              {/* Mood Point */}
                              <motion.div 
                                 className="absolute w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10"
                                 style={{ bottom: `calc(${moodHeight}% - 4px)` }}
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 transition={{ type: "spring", delay: 1 + i * 0.05 }}
                              />

                              {/* Invisible hit area for hover */}
                              <div className="absolute inset-0 z-30" />
                           </div>
                        )
                     })}
                  </div>
               </div>

               <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 font-medium">
                  <span className="font-black text-slate-800">Insight:</span> The data indicates a 68% correlation between precipitation over 5mm and mood scores dropping below 7.
               </div>

            </motion.div>
         )}

      </div>

    </div>
  );
}
