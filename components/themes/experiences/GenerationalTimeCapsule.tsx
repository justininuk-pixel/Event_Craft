"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type TimelineEntry = {
   year: number;
   title: string;
   body: string;
};

export function GenerationalTimeCapsule({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const currentYear = new Date().getFullYear();
  // Assume the capsule was created this year for demo purposes
  const creationYear = currentYear; 

  const [simulatedYear, setSimulatedYear] = useState<number>(creationYear);
  const [entries, setEntries] = useState<TimelineEntry[]>([
     { year: creationYear, title: config.title || "Genesis", body: config.body }
  ]);
  const [draftBody, setDraftBody] = useState("");
  const [hasAppended, setHasAppended] = useState(false);

  // A window is open every 10 years exactly
  const isWindowOpen = (simulatedYear - creationYear) % 10 === 0;
  const nextOpeningYear = creationYear + Math.ceil((simulatedYear - creationYear + 0.1) / 10) * 10;

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  const handleAppend = () => {
     if (!draftBody.trim()) return;
     
     // Check if there's already an entry for this simulated year
     if (entries.some(e => e.year === simulatedYear)) {
        alert(`An entry for ${simulatedYear} already exists.`);
        return;
     }

     setEntries([...entries, { year: simulatedYear, title: `Entry ${entries.length + 1}`, body: draftBody }]);
     setDraftBody("");
     setHasAppended(true);

     if (onComplete) {
        onComplete();
     }
  };

  useEffect(() => {
     if (isWindowOpen && !hasAppended && entries.length > 1 && onComplete) {
        // If they just scrubbed to an open year and there's already history, maybe fire complete?
        // But let's only fire complete when they actually append.
     }
  }, [isWindowOpen, hasAppended, entries.length, onComplete]);

  return (
    <div 
      className="w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col font-serif select-none transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* Header / Vault Status */}
      <div className="w-full py-16 flex flex-col items-center justify-center relative z-20 text-center border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-slate-900/50 backdrop-blur-md">
         <div className="text-6xl mb-6">
            {isWindowOpen ? "🔓" : "🔒"}
         </div>
         <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4 text-slate-200">
            {isWindowOpen ? "Vault Open" : "Vault Locked"}
         </h1>
         <p className="text-lg md:text-xl text-slate-400 uppercase tracking-widest font-mono">
            Year {simulatedYear}
         </p>
         {!isWindowOpen && (
            <div className="mt-8 px-6 py-3 bg-red-900/30 border border-red-500/30 rounded-full">
               <p className="text-sm text-red-400 uppercase tracking-widest font-bold">
                  Next opening window: {nextOpeningYear}
               </p>
            </div>
         )}
      </div>

      {/* Timeline */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-12 py-16 relative z-10">
         {/* Vertical Line */}
         <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2" />

         <div className="flex flex-col gap-16 relative">
            <AnimatePresence>
               {entries.sort((a,b) => a.year - b.year).map((entry, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                     <motion.div 
                        key={entry.year}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'} relative`}
                     >
                        {/* Dot */}
                        <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-slate-800 border-2 rounded-full -translate-x-1/2 mt-6" style={{ borderColor: primaryColor }} />

                        {/* Content Card */}
                        <div className={`w-[85%] md:w-[45%] bg-white/5 backdrop-blur-md border border-white/10 p-8 shadow-xl ${isLeft ? 'ml-auto md:ml-0 md:mr-auto' : 'ml-auto'}`}>
                           <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4 font-mono">
                              {entry.year} // {entry.title}
                           </h3>
                           <p className="text-lg text-slate-200 leading-relaxed whitespace-pre-wrap">
                              {entry.body}
                           </p>
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>

            {/* Append Form (Only if Open) */}
            <AnimatePresence>
               {isWindowOpen && !entries.some(e => e.year === simulatedYear) && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="w-full bg-slate-800/80 backdrop-blur-xl border border-green-500/30 p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative z-20 mt-12"
                  >
                     <h3 className="text-green-400 font-black uppercase tracking-widest mb-6 font-mono flex items-center gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Append to Timeline
                     </h3>
                     <textarea
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        placeholder="Leave a message for the next generation..."
                        className="w-full h-32 bg-black/50 border border-slate-600 text-slate-200 p-4 font-serif text-lg mb-6 focus:outline-none focus:border-green-500 transition-colors resize-none"
                     />
                     <div className="flex justify-end">
                        <button 
                           onClick={handleAppend}
                           className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-sm transition-colors"
                        >
                           Seal Entry
                        </button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 flex flex-col items-center shadow-2xl z-50">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Current Year (Interval: 10 Years)
            </h2>
            <div className="flex w-full items-center gap-4 text-white font-bold">
               <span className="text-xs text-slate-500">{creationYear}</span>
               <input 
                  type="range" 
                  min={creationYear} 
                  max={creationYear + 100} 
                  step="1" 
                  value={simulatedYear} 
                  onChange={(e) => setSimulatedYear(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500"
               />
               <span className="text-xs text-slate-500">{creationYear + 100}</span>
            </div>
            <div className={`mt-4 font-mono text-xs px-4 py-2 border tracking-widest uppercase ${
               isWindowOpen ? "bg-green-900/30 text-green-400 border-green-500/50" : "bg-red-900/30 text-red-400 border-red-500/50"
            }`}>
               Year: {simulatedYear} - {isWindowOpen ? "OPEN" : "LOCKED"}
            </div>
         </div>
      )}
      
      {/* Spacer for bottom controls */}
      <div className="h-48 w-full" />
    </div>
  );
}
