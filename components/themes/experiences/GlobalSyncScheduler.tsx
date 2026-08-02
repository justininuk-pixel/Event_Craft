"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Globe, Sun, Moon, Briefcase, Coffee, Bed, ArrowRight } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  city: string;
  utcOffset: number; // e.g., +9 for Tokyo, -5 for NY
};

const DEFAULT_PARTICIPANTS: Participant[] = [
   { id: "p1", name: "Hiroshi", city: "Tokyo", utcOffset: 9 },
   { id: "p2", name: "Emma", city: "London", utcOffset: 1 }, // Assuming GMT+1 for Summer
   { id: "p3", name: "Marcus", city: "New York", utcOffset: -4 }, // EDT
   { id: "p4", name: "Sarah", city: "Los Angeles", utcOffset: -7 }, // PDT
   { id: "p5", name: "Liam", city: "Sydney", utcOffset: 10 }, // AEST
];

export function GlobalSyncScheduler({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  // We map a 24-hour slider from 0 to 24 (with decimal points for 15 min increments)
  const [utcHour, setUtcHour] = useState<number>(12); // Start at UTC noon
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
     if (hasInteracted && onComplete) {
        const t = setTimeout(onComplete, 2000);
        return () => clearTimeout(t);
     }
  }, [hasInteracted, onComplete]);

  // Working hours config (9 AM to 5 PM)
  const workingStart = 9;
  const workingEnd = 17;

  const calculateLocalStatus = (offset: number, currentUtc: number) => {
     let localHour = (currentUtc + offset) % 24;
     if (localHour < 0) localHour += 24;
     
     const isWorking = localHour >= workingStart && localHour < workingEnd;
     const isSleep = localHour < 7 || localHour >= 23;
     const isEvening = localHour >= workingEnd && localHour < 23;
     const isMorning = localHour >= 7 && localHour < workingStart;

     // Format time
     const wholeHour = Math.floor(localHour);
     const minutes = Math.round((localHour - wholeHour) * 60);
     const period = wholeHour >= 12 ? 'PM' : 'AM';
     const displayHour = wholeHour % 12 === 0 ? 12 : wholeHour % 12;
     const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;

     let bgColor = "#1e293b"; // Default slate
     let statusText = "Available";
     let Icon = Briefcase;
     
     if (isSleep) {
        bgColor = "#0f172a"; // Deep night
        statusText = "Sleeping";
        Icon = Bed;
     } else if (isWorking) {
        bgColor = "#059669"; // Emerald (Good to meet)
        statusText = "Working Hours";
        Icon = Briefcase;
     } else if (isEvening || isMorning) {
        bgColor = "#d97706"; // Amber (Off hours)
        statusText = "Off Hours";
        Icon = Coffee;
     }

     return { localHour, timeString, isWorking, isSleep, isEvening, isMorning, bgColor, statusText, Icon };
  };

  const results = useMemo(() => {
     return DEFAULT_PARTICIPANTS.map(p => ({
        ...p,
        status: calculateLocalStatus(p.utcOffset, utcHour)
     }));
  }, [utcHour]);

  // Check if all are awake (not sleeping)
  const allAwake = results.every(r => !r.status.isSleep);
  
  // Format the UTC time for the slider display
  const formatUtc = (h: number) => {
     const whole = Math.floor(h);
     const mins = Math.round((h - whole) * 60);
     return `${whole.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} UTC`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-100"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor (World Map Texture) */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none bg-center bg-no-repeat bg-cover"
         style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')", filter: "invert(1)" }} 
      />

      <div className="w-full max-w-5xl mx-auto flex flex-col h-full z-10 p-4 sm:p-8 relative">
         
         <div className="text-center mb-8 shrink-0">
            <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center justify-center gap-3">
               <Globe size={28} style={{ color: primaryColor }} />
               {config.title || "Global Sync"}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
               {config.body || "Find the perfect overlap. Drag the timeline."}
            </p>
         </div>

         {/* The Columns */}
         <div className="flex-1 flex flex-row overflow-x-auto gap-2 md:gap-4 pb-4 snap-x">
            {results.map(person => {
               const { status } = person;
               const { isSleep, isWorking, timeString, bgColor, statusText, Icon } = status;
               
               return (
                  <motion.div 
                     key={person.id}
                     className="flex-1 min-w-[120px] md:min-w-[150px] rounded-2xl flex flex-col items-center justify-between p-4 snap-center relative overflow-hidden transition-colors duration-500 ease-in-out border border-white/10 shadow-xl"
                     style={{ backgroundColor: bgColor }}
                  >
                     
                     {/* Dynamic Icon Background */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        {isSleep ? <Moon size={150} /> : <Sun size={150} />}
                     </div>

                     <div className="relative z-10 text-center w-full">
                        <h3 className="font-bold text-lg leading-tight mb-1">{person.name}</h3>
                        <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-6">{person.city}</p>
                     </div>
                     
                     <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/10 mb-4 shadow-inner flex flex-col items-center justify-center min-w-[100px]">
                           <span className="font-black text-xl tabular-nums tracking-tighter mb-1">
                              {timeString}
                           </span>
                           {isWorking && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />}
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 opacity-80">
                           <Icon size={20} />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-center h-8">
                              {statusText}
                           </span>
                        </div>
                     </div>
                  </motion.div>
               )
            })}
         </div>

         {/* Master Slider Control */}
         <div className="shrink-0 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl mt-4">
            
            <div className="flex justify-between items-end mb-6">
               <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Master Timeline (UTC)</span>
                  <span className="text-3xl font-black tabular-nums tracking-tight">{formatUtc(utcHour)}</span>
               </div>
               
               <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                  allAwake ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
               }`}>
                  {allAwake ? "Overlap Found" : "Someone is sleeping"}
               </div>
            </div>

            <div className="relative pt-4 pb-2">
               {/* 24 hour tick marks */}
               <div className="absolute top-0 left-0 right-0 flex justify-between px-2 opacity-20 pointer-events-none">
                  {[0,6,12,18,24].map(h => (
                     <div key={h} className="flex flex-col items-center">
                        <div className="h-2 w-px bg-white mb-1" />
                        <span className="text-[8px] font-mono">{h}</span>
                     </div>
                  ))}
               </div>
               
               <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.25" // 15 minute increments
                  value={utcHour}
                  onChange={(e) => {
                     setUtcHour(parseFloat(e.target.value));
                     setHasInteracted(true);
                  }}
                  className="w-full h-3 rounded-full appearance-none bg-slate-800 cursor-ew-resize relative z-10"
                  style={{
                     background: `linear-gradient(to right, ${primaryColor} ${(utcHour / 24) * 100}%, #1e293b ${(utcHour / 24) * 100}%)`
                  }}
               />
            </div>
            
            <div className="mt-4 flex justify-center">
               <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <ArrowRight size={14} className="opacity-50" />
                  Drag slider to shift global time
               </p>
            </div>

         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !hasInteracted && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => { setUtcHour(2); setHasInteracted(true); }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Move Time (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
