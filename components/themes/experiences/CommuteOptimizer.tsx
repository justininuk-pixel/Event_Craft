"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Zap, CheckCircle2 } from "lucide-react";

type RouteStats = {
  id: string;
  name: string;
  avgTime: number; // mins
  samples: number;
};

export function CommuteOptimizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const [phase, setPhase] = useState<"gathering" | "results">("gathering");
  const [dayCounter, setDayCounter] = useState(1);
  const totalDays = 14;

  const [routes, setRoutes] = useState<RouteStats[]>([
    { id: "r1", name: "Highway 101", avgTime: 45, samples: 0 },
    { id: "r2", name: "Backroads via 5th", avgTime: 52, samples: 0 },
    { id: "r3", name: "The Toll Road", avgTime: 40, samples: 0 },
  ]);

  // Simulate API gathering over 14 days
  useEffect(() => {
     if (phase !== "gathering") return;

     const interval = setInterval(() => {
        setDayCounter(prev => {
           if (prev >= totalDays) {
              setPhase("results");
              clearInterval(interval);
              if (onComplete) setTimeout(onComplete, 6000);
              return prev;
           }
           
           // Randomly mutate averages slightly to simulate new data
           setRoutes(currentRoutes => currentRoutes.map(r => ({
              ...r,
              samples: r.samples + 1,
              avgTime: Math.round(r.avgTime + (Math.random() * 4 - 2)) // +/- 2 mins
           })));

           return prev + 1;
        });
     }, 300); // Super fast 14 days simulation

     return () => clearInterval(interval);
  }, [phase, onComplete]);

  const sortedRoutes = [...routes].sort((a, b) => a.avgTime - b.avgTime);
  const bestRoute = sortedRoutes[0];

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-800 text-slate-200 p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="text-center mb-8 z-10 flex flex-col items-center">
         <Map size={32} className="text-amber-500 mb-2 opacity-80" />
         <h2 className="text-xl font-bold uppercase tracking-widest text-white">Route Analyzer</h2>
         <p className="text-xs text-slate-400 mt-1">Definitively solving the morning commute.</p>
      </div>

      <AnimatePresence mode="wait">
         {phase === "gathering" ? (
            <motion.div 
               key="gathering"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex-1 flex flex-col items-center justify-center text-center"
            >
               <div className="w-24 h-24 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-8" />
               <h3 className="text-2xl font-black text-white mb-2">Simulating APIs</h3>
               <p className="text-amber-400 font-mono">Day {dayCounter} of {totalDays}</p>
               <div className="mt-8 space-y-2 w-full max-w-xs text-left">
                  {routes.map(r => (
                     <div key={r.id} className="text-[10px] font-mono text-slate-500 flex justify-between bg-slate-900 p-2 rounded">
                        <span className="truncate w-3/4">{r.name}</span>
                        <span>{r.avgTime}m</span>
                     </div>
                  ))}
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="results"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex-1 flex flex-col justify-center"
            >
               <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl text-center mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <CheckCircle2 size={20} className="text-amber-500" />
                     <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Statistically Proven</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">{bestRoute.name}</h3>
                  <p className="text-sm text-slate-300">Average: {bestRoute.avgTime} mins</p>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 border-b border-slate-700 pb-2">Full Data ({totalDays} Days)</h4>
                  {sortedRoutes.map((r, i) => {
                     const isBest = i === 0;
                     const diff = r.avgTime - bestRoute.avgTime;
                     
                     return (
                        <div key={r.id} className="flex flex-col gap-1">
                           <div className="flex justify-between items-end">
                              <span className={`text-sm font-bold ${isBest ? 'text-amber-400' : 'text-slate-300'}`}>{r.name}</span>
                              <span className="text-xs font-mono">{r.avgTime}m {diff > 0 && <span className="text-red-400 ml-1">(+{diff}m)</span>}</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                              <motion.div 
                                 className={`h-full rounded-full ${isBest ? 'bg-amber-500' : 'bg-slate-600'}`}
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(bestRoute.avgTime / r.avgTime) * 100}%` }}
                                 transition={{ duration: 1, delay: 0.5 }}
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
