"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";

type Racer = {
  id: string;
  name: string;
  color: string;
  progress: number; // 0 to 100
};

export function ProgressBarRace({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [racers, setRacers] = useState<Racer[]>([
    { id: "r1", name: "User A", color: "#3b82f6", progress: 0 },
    { id: "r2", name: "User B", color: "#ef4444", progress: 0 },
    { id: "r3", name: "User C", color: "#10b981", progress: 0 },
  ]);

  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<Racer | null>(null);

  const startRace = () => {
     if (isRacing || winner) return;
     setIsRacing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  useEffect(() => {
     if (!isRacing) return;

     const interval = setInterval(() => {
        setRacers(prev => {
           let hasWinner = false;
           let winningRacer: Racer | null = null;

           const next = prev.map(r => {
              if (hasWinner) return r;
              
              // Random jump between 0 and 5
              const jump = Math.random() * 5;
              const newProgress = Math.min(r.progress + jump, 100);
              
              if (newProgress >= 100) {
                 hasWinner = true;
                 winningRacer = { ...r, progress: 100 };
              }
              
              return { ...r, progress: newProgress };
           });

           if (hasWinner && winningRacer) {
              setWinner(winningRacer);
              setIsRacing(false);
              clearInterval(interval);
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
              if (onComplete) setTimeout(onComplete, 5000);
           }

           return next;
        });
     }, 200); // 5 ticks per second

     return () => clearInterval(interval);
  }, [isRacing, onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-900 text-white p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="text-center z-10 mb-8 flex justify-between items-end">
         <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
               Live Race
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase text-left">Target: 10,000 Steps</p>
         </div>
         <Flag size={24} className="text-slate-500" />
      </div>

      <div className="flex-1 flex flex-col relative z-10 justify-center space-y-8 border-r-4 border-dashed border-slate-700 pr-4">
         
         {/* Finish Line Marker */}
         <div className="absolute top-0 bottom-0 right-0 w-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />

         {racers.map((r) => (
            <div key={r.id} className="w-full relative">
               <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300" style={{ color: r.color }}>{r.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{Math.floor(r.progress)}%</span>
               </div>
               <div className="w-full h-8 bg-slate-800 rounded-r-full overflow-visible relative shadow-inner">
                  <motion.div 
                     className="h-full rounded-r-full relative flex justify-end items-center shadow-[0_0_20px_currentColor]"
                     style={{ backgroundColor: r.color, color: r.color, width: `${r.progress}%` }}
                     layout
                  >
                     {/* The "Car" / Head */}
                     <div className="w-4 h-12 absolute -right-2 bg-white rounded-full shadow-lg border-2" style={{ borderColor: r.color }} />
                  </motion.div>
               </div>
            </div>
         ))}

      </div>

      <div className="mt-12 text-center h-24">
         {winner ? (
            <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="inline-block bg-white text-slate-900 px-6 py-3 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Winner</div>
               <div className="text-2xl font-black" style={{ color: winner.color }}>{winner.name}</div>
            </motion.div>
         ) : !isRacing ? (
            <button 
               onClick={startRace}
               className="px-8 py-4 bg-emerald-500 text-slate-900 rounded-full font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
               Start Race
            </button>
         ) : null}
      </div>

    </div>
  );
}
