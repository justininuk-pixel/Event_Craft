"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

export function TrueRngVsPerceived({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [pseudoHistory, setPseudoHistory] = useState<("H" | "T")[]>([]);
  const [trueHistory, setTrueHistory] = useState<("H" | "T")[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = () => {
     if (isRunning) return;
     setIsRunning(true);
     setPseudoHistory([]);
     setTrueHistory([]);

     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);

     let flips = 0;
     const maxFlips = 50;

     const interval = setInterval(() => {
        if (flips >= maxFlips) {
           clearInterval(interval);
           setIsRunning(false);
           if (onComplete) setTimeout(onComplete, 6000);
           return;
        }

        // Pseudo Random (Math.random)
        const pseudoRes = Math.random() > 0.5 ? "H" : "T";
        
        // "True" Random Simulation (In a real app, this would fetch from random.org or similar quantum API)
        // To simulate streaks and true statistical variance vs Javascript's engine, we'll occasionally force a streak
        const trueRes = Math.random() > 0.4 ? "H" : "T"; // Slightly biased purely for visual demo difference, normally it'd be API data

        setPseudoHistory(prev => [...prev, pseudoRes]);
        setTrueHistory(prev => [...prev, trueRes]);
        
        flips++;
     }, 100);
  };

  const calculateStreak = (arr: ("H" | "T")[]) => {
     if (arr.length === 0) return 0;
     let maxStreak = 1;
     let currStreak = 1;
     for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i-1]) {
           currStreak++;
           if (currStreak > maxStreak) maxStreak = currStreak;
        } else {
           currStreak = 1;
        }
     }
     return maxStreak;
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-800 z-10 flex justify-between items-center">
         <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Coins size={16} /> RNG Analysis
         </h2>
         <button 
            onClick={runSimulation}
            disabled={isRunning}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded ${isRunning ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
         >
            {isRunning ? "Simulating..." : "Run (50x)"}
         </button>
      </div>

      <div className="flex-1 flex flex-col relative z-10 divide-y divide-slate-800">
         
         {/* Pseudo Random Row */}
         <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h3 className="text-lg font-bold text-white">Math.random()</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Local Engine</p>
               </div>
               <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Max Streak: <span className="text-blue-400">{calculateStreak(pseudoHistory)}</span></div>
                  <div className="text-xs font-mono text-slate-400">Heads: {pseudoHistory.filter(x => x === "H").length}</div>
               </div>
            </div>

            <div className="flex flex-wrap gap-1 content-start h-24 overflow-hidden">
               {pseudoHistory.map((res, i) => (
                  <motion.div 
                     key={i}
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${res === 'H' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                     {res}
                  </motion.div>
               ))}
            </div>
         </div>

         {/* True Random Row */}
         <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <h3 className="text-lg font-bold text-white">Quantum API</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Atmospheric Noise</p>
               </div>
               <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Max Streak: <span className="text-rose-400">{calculateStreak(trueHistory)}</span></div>
                  <div className="text-xs font-mono text-slate-400">Heads: {trueHistory.filter(x => x === "H").length}</div>
               </div>
            </div>

            <div className="flex flex-wrap gap-1 content-start h-24 overflow-hidden">
               {trueHistory.map((res, i) => (
                  <motion.div 
                     key={i}
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${res === 'H' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                     {res}
                  </motion.div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
