"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Search, Hexagon } from "lucide-react";

type ScentEntry = {
   id: string;
   name: string;
   notes: string;
   intensity: number; // 1-10
   association: string;
};

const defaultEntries: ScentEntry[] = [
   { id: "S-001", name: "Petrichor", notes: "Rain on hot asphalt, ozone, wet earth.", intensity: 8, association: "Summer '09, walking home from the pool." },
   { id: "S-002", name: "Old Books", notes: "Vanilla, dust, dried glue, slight mildew.", intensity: 5, association: "Grandpa's study on Sundays." },
   { id: "S-003", name: "Sunscreen & Salt", notes: "Coconut, zinc oxide, ocean brine.", intensity: 9, association: "Family trip to Cape Cod, 1998." },
   { id: "S-004", name: "Burnt Matches", notes: "Sulfur, char, sudden heat.", intensity: 7, association: "Lighting candles for the blackout." },
   { id: "S-005", name: "First Frost", notes: "Crisp air, dying leaves, metallic cold.", intensity: 4, association: "Waiting for the school bus in November." },
];

export function OlfactoryDatabase({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#14b8a6"; // teal-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const entries = (config.experience as any)?.entries || defaultEntries;
  const databaseName = config.title || "Olfactory Index";

  const [activeEntry, setActiveEntry] = useState<ScentEntry | null>(null);

  const handleEntryClick = (entry: ScentEntry) => {
     setActiveEntry(activeEntry?.id === entry.id ? null : entry);
     if (onComplete) {
        setTimeout(onComplete, 2000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-slate-900 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* CSS Vapor / Smoke Background Animation */}
      <div 
         className="absolute inset-0 pointer-events-none opacity-40 z-0"
         style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' stitchTiles='stitch'%3E%3Canimate attributeName='baseFrequency' values='0.01;0.015;0.01' dur='20s' repeatCount='indefinite' /%3E%3C/feTurbulence%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: "blur(20px) contrast(1.5)",
            mixBlendMode: "multiply",
         }}
      />
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-gradient-to-t from-slate-200 to-transparent" />

      {/* Clinical UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col pt-12 px-6 pb-6">
         
         <header className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
            <div>
               <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Wind size={28} style={{ color: primaryColor }} />
                  {databaseName}
               </h1>
               <p className="text-xs uppercase tracking-widest mt-1 text-slate-500 font-bold">
                  Indexing the Ephemeral
               </p>
            </div>
            <div className="text-right">
               <div className="text-[10px] bg-slate-200 px-2 py-1 border border-slate-900 inline-block font-bold mb-1">
                  SYS.V.4.02
               </div>
               <div className="text-[10px] font-bold text-slate-500">
                  Total Records: {entries.length}
               </div>
            </div>
         </header>

         {/* Search Bar mock */}
         <div className="w-full bg-white border-2 border-slate-900 p-2 flex items-center gap-2 mb-6 shadow-[4px_4px_0_rgba(15,23,42,1)]">
            <Search size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400 italic">Query scent profiles...</span>
         </div>

         {/* Scent Table */}
         <div className="flex-1 overflow-y-auto custom-scrollbar border-2 border-slate-900 bg-white/50 backdrop-blur-md shadow-[4px_4px_0_rgba(15,23,42,1)] relative">
            
            {/* Table Header */}
            <div className="sticky top-0 w-full bg-slate-900 text-white flex text-[10px] uppercase tracking-widest font-bold border-b-2 border-slate-900 z-20">
               <div className="w-16 p-2 border-r border-slate-700">ID</div>
               <div className="flex-1 p-2 border-r border-slate-700">Profile</div>
               <div className="w-12 p-2 text-center">INT</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col relative z-10">
               {entries.map((entry: ScentEntry) => {
                  const isActive = activeEntry?.id === entry.id;
                  
                  return (
                     <div key={entry.id} className="flex flex-col border-b border-slate-300 last:border-0 transition-colors bg-white/80">
                        <div 
                           className={`w-full flex cursor-pointer transition-colors ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                           onClick={() => handleEntryClick(entry)}
                        >
                           <div className="w-16 p-3 text-xs font-bold border-r border-slate-300 text-slate-500 flex items-center justify-center">
                              {entry.id}
                           </div>
                           <div className="flex-1 p-3 flex flex-col justify-center border-r border-slate-300">
                              <span className="font-black text-sm uppercase tracking-tight" style={{ color: isActive ? primaryColor : "inherit" }}>
                                 {entry.name}
                              </span>
                           </div>
                           <div className="w-12 p-3 flex items-center justify-center text-xs font-bold">
                              {entry.intensity}
                           </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                           {isActive && (
                              <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="overflow-hidden bg-slate-900 text-slate-300"
                              >
                                 <div className="p-4 flex flex-col gap-4 border-t-2 border-slate-900">
                                    <div>
                                       <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Composition Notes</span>
                                       <p className="text-sm font-sans italic">
                                          {entry.notes}
                                       </p>
                                    </div>
                                    <div className="p-3 border border-slate-700 bg-slate-800/50">
                                       <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                                          <Hexagon size={10} style={{ color: primaryColor }} />
                                          Memory Association
                                       </span>
                                       <p className="text-sm font-bold text-white">
                                          {entry.association}
                                       </p>
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  );
               })}
            </div>
         </div>

      </div>

    </div>
  );
}
