"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Baby, Sparkles, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Milestone = {
  id: string;
  label: string;
  avgMonths: number;
  loggedMonths?: number;
};

export function MilestoneTimeline({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#c084fc"; // purple-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf4ff"]; // fuchsia-50

  const name = config.recipient || "Olivia";

  const [milestones, setMilestones] = useState<Milestone[]>([
     { id: "m1", label: "First Smile", avgMonths: 2, loggedMonths: 1.5 }, // Early
     { id: "m2", label: "Rolling Over", avgMonths: 4, loggedMonths: 4.2 }, // Slightly late
     { id: "m3", label: "Sitting Up", avgMonths: 6, loggedMonths: 6.0 }, // On time
     { id: "m4", label: "First Word", avgMonths: 9 }, // Unlogged
     { id: "m5", label: "Walking", avgMonths: 12 } // Unlogged
  ]);

  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleLog = (id: string, months: number) => {
     setMilestones(prev => prev.map(m => m.id === id ? { ...m, loggedMonths: months } : m));
     setActiveInputId(null);
     
     // Check if all are logged
     const updated = milestones.map(m => m.id === id ? { ...m, loggedMonths: months } : m);
     if (updated.every(m => m.loggedMonths !== undefined) && onComplete) {
        onComplete();
     }
  };

  const getDeviationClass = (diff: number) => {
     if (Math.abs(diff) < 0.5) return "bg-emerald-100 text-emerald-700 border-emerald-200";
     if (diff < 0) return "bg-blue-100 text-blue-700 border-blue-200"; // Early
     return "bg-amber-100 text-amber-700 border-amber-200"; // Late
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-white/80 to-transparent pointer-events-none">
         <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2" style={{ color: primaryColor }}>
            <Baby size={24} />
            {config.title || `${name}'s Milestones`}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {config.body || "Tracking development against medical averages"}
         </p>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-28 pb-32 px-4 relative">
         
         {/* Center Axis (Average Line) */}
         <div className="absolute left-1/2 top-28 bottom-32 w-1 -ml-[0.5px] bg-slate-200/50 border-x border-slate-300 border-dashed z-0" />
         
         {/* Top Label */}
         <div className="absolute left-1/2 top-24 -translate-x-1/2 -mt-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm z-10 border border-slate-100">
            Average Curve
         </div>

         <div className="relative z-10 flex flex-col gap-12 w-full max-w-lg mx-auto">
            {milestones.map((milestone, idx) => {
               
               const isLogged = milestone.loggedMonths !== undefined;
               const diff = isLogged ? milestone.loggedMonths! - milestone.avgMonths : 0;
               
               // Map diff to X translation. Max deviation shown is +/- 3 months = +/- 120px
               const pxPerMonth = 40; 
               const maxPx = 120;
               let xOffset = isLogged ? diff * pxPerMonth : 0;
               if (xOffset > maxPx) xOffset = maxPx;
               if (xOffset < -maxPx) xOffset = -maxPx;

               return (
                  <div key={milestone.id} className="relative w-full h-20 flex items-center justify-center">
                     
                     {/* The Average Marker (Background) */}
                     <div className="absolute left-1/2 -ml-2 w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                     
                     {/* Connection Line from Average to Logged */}
                     {isLogged && (
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: Math.abs(xOffset) }}
                           className={`absolute top-1/2 h-0.5 -mt-[1px] border-b-2 border-dotted z-0 ${diff < 0 ? 'border-blue-300 right-1/2 origin-right' : 'border-amber-300 left-1/2 origin-left'}`}
                        />
                     )}

                     {/* The Interactive Node */}
                     <motion.div 
                        layout
                        initial={{ x: 0 }}
                        animate={{ x: isLogged ? xOffset : 0 }}
                        className={`absolute z-10 flex flex-col items-center ${!isLogged && 'cursor-pointer hover:scale-105 transition-transform'}`}
                        onClick={() => !isLogged && setActiveInputId(milestone.id)}
                     >
                        
                        {!isLogged ? (
                           <div className="w-12 h-12 bg-white rounded-full shadow-lg border-2 border-slate-200 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                              <span className="font-bold text-xs uppercase tracking-widest">Log</span>
                           </div>
                        ) : (
                           <div className={`w-12 h-12 rounded-full shadow-xl border-4 flex items-center justify-center ${getDeviationClass(diff)}`}>
                              <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                           </div>
                        )}

                        <div className={`mt-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col min-w-[120px]`}>
                           <span className="font-black text-sm">{milestone.label}</span>
                           
                           {isLogged ? (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center justify-center gap-1">
                                 {diff < -0.5 && <><ArrowLeft size={10} className="text-blue-500" /> Early</>}
                                 {diff > 0.5 && <>Late <ArrowRight size={10} className="text-amber-500" /></>}
                                 {Math.abs(diff) <= 0.5 && <><Sparkles size={10} className="text-emerald-500" /> On Time</>}
                              </span>
                           ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                 Avg: {milestone.avgMonths} mo
                              </span>
                           )}
                        </div>

                     </motion.div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Data Entry Modal */}
      <AnimatePresence>
         {activeInputId && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center border border-slate-100"
               >
                  <h3 className="text-xl font-black mb-1 text-center">Log Milestone</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Enter age in months</p>
                  
                  <input 
                     type="number" 
                     step="0.1"
                     autoFocus
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}
                     className="w-full text-center text-5xl font-black text-slate-800 border-none bg-slate-50 rounded-2xl py-6 mb-6 focus:ring-4 focus:ring-purple-200 outline-none"
                     placeholder="0.0"
                  />
                  
                  <div className="flex gap-3 w-full">
                     <button 
                        onClick={() => { setActiveInputId(null); setInputValue(""); }}
                        className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-xl"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={() => {
                           if (inputValue && !isNaN(parseFloat(inputValue))) {
                              handleLog(activeInputId, parseFloat(inputValue));
                              setInputValue("");
                           }
                        }}
                        className="flex-1 py-4 font-black text-white rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
                        style={{ backgroundColor: primaryColor }}
                     >
                        Save
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Bypass */}
      {mode === "editor-preview" && milestones.some(m => m.loggedMonths === undefined) && (
         <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setMilestones(prev => prev.map(m => ({ ...m, loggedMonths: m.avgMonths + (Math.random() * 4 - 2) })));
               }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               <AlertCircle size={12} /> Log Random Dates
            </button>
         </div>
      )}

    </div>
  );
}
