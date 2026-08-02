"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Pill, Check, Calendar, Activity } from "lucide-react";

export function MedicationAdherenceChart({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"];

  // Generate a mock 30-day history.
  // We'll say today is day 30.
  const [history, setHistory] = useState<boolean[]>([]);
  const [tookToday, setTookToday] = useState(false);

  useEffect(() => {
     // Generate 29 days of random history for demonstration
     const mockHistory = Array.from({ length: 29 }, () => Math.random() > 0.2); // 80% adherence
     setHistory(mockHistory);
  }, []);

  const handleTakePill = () => {
     if (tookToday) return;
     setTookToday(true);
     if (onComplete) onComplete();
  };

  const fullHistory = [...history, tookToday];
  const adherenceRate = fullHistory.length > 0 
     ? Math.round((fullHistory.filter(Boolean).length / fullHistory.length) * 100) 
     : 0;

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center p-4 sm:p-8 font-sans overflow-y-auto text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden z-10 border border-slate-100">
         
         {/* Header */}
         <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
               {config.title || "Daily Medication"}
            </h2>
            <p className="text-slate-500 font-medium">
               {config.body || "Take 1 pill every morning with water."}
            </p>
         </div>

         {/* Giant Button */}
         <div className="flex justify-center mb-10">
            <motion.button
               whileTap={!tookToday ? { scale: 0.95 } : {}}
               onClick={handleTakePill}
               disabled={tookToday}
               className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-colors shadow-lg border-4 ${
                  tookToday 
                     ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                     : 'text-white hover:brightness-110'
               }`}
               style={{ 
                  backgroundColor: !tookToday ? primaryColor : undefined,
                  borderColor: !tookToday ? primaryColor : undefined,
                  boxShadow: !tookToday ? `0 20px 40px -10px ${primaryColor}80` : undefined
               }}
            >
               {tookToday ? (
                  <>
                     <Check size={48} strokeWidth={3} />
                     <span className="font-bold text-lg uppercase tracking-wider">Taken</span>
                  </>
               ) : (
                  <>
                     <Pill size={48} strokeWidth={2.5} />
                     <span className="font-bold text-lg uppercase tracking-wider">Take Pill</span>
                  </>
               )}

               {/* Ripple effect on the button */}
               {!tookToday && (
                  <motion.div 
                     className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
                     animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
               )}
            </motion.button>
         </div>

         <hr className="border-slate-100 mb-8" />

         {/* Stats */}
         <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
               <Activity size={20} style={{ color: primaryColor }} />
               <span>Adherence Rate</span>
            </div>
            <div className="text-3xl font-black" style={{ color: adherenceRate > 80 ? '#10b981' : adherenceRate > 60 ? '#f59e0b' : '#ef4444' }}>
               {adherenceRate}%
            </div>
         </div>

         {/* 30-Day Grid */}
         <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest px-2">
            <Calendar size={16} />
            <span>Last 30 Days</span>
         </div>
         
         <div className="grid grid-cols-7 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {/* Days of week header */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
               <div key={i} className="text-center text-xs font-bold text-slate-400">{d}</div>
            ))}
            
            {/* Pad the grid so today is the last cell (let's say today is a Saturday, index 6) */}
            {/* 30 days means 4 weeks + 2 days. We'll just render exactly 30 cells for simplicity, assuming the grid fits. */}
            
            {/* Filler for the start of the month if needed, but let's just render the 30 squares sequentially for a heatmap feel */}
            {fullHistory.map((taken, i) => {
               const isToday = i === fullHistory.length - 1;
               return (
                  <div 
                     key={i}
                     className={`aspect-square rounded-md flex items-center justify-center transition-colors relative ${
                        taken 
                           ? 'bg-green-500 shadow-sm border border-green-600/20' 
                           : isToday && !tookToday
                              ? 'bg-white border-2 border-dashed border-slate-300'
                              : 'bg-red-100 border border-red-200'
                     }`}
                  >
                     {isToday && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white animate-pulse" />
                     )}
                     {taken && <Check size={12} className="text-white opacity-80" />}
                  </div>
               )
            })}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !tookToday && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleTakePill}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Take Pill (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
