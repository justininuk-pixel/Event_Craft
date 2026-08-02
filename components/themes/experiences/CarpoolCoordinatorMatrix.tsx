"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Car, AlertTriangle, CheckCircle2, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CarpoolCoordinatorMatrix({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  
  const initialParents = [
     { id: "p1", name: "Sarah", color: "#3b82f6" }, // blue
     { id: "p2", name: "Mike", color: "#ef4444" }, // red
     { id: "p3", name: "Emma", color: "#10b981" }, // green
     { id: "p4", name: "David", color: "#8b5cf6" }, // purple
  ];

  const parents = ((config.experience as any)?.items as any[])?.map((f: any, i: number) => ({
     id: `p${i}`, name: f.title, color: initialParents[i%4].color
  })) || initialParents;

  const [activeParent, setActiveParent] = useState<string>(parents[0].id);

  // State maps dayIndex -> parentId (or null)
  const [schedule, setSchedule] = useState<Record<number, string | null>>({
     0: null, 1: null, 2: null, 3: null, 4: null
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showError = (msg: string) => {
     setErrorMsg(msg);
     setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleClaim = (dayIndex: number) => {
     if (schedule[dayIndex] === activeParent) {
        // Unclaim if clicking own claim
        setSchedule(prev => ({ ...prev, [dayIndex]: null }));
        return;
     }

     if (schedule[dayIndex] !== null) {
        showError("This day is already claimed by someone else.");
        return;
     }

     // Validation Logic
     // 1. Max 2 days a week
     const currentCount = Object.values(schedule).filter((p: any) => p === activeParent).length;
     if (currentCount >= 2) {
        showError(`${parents.find((p: any) => p.id === activeParent)?.name} has already claimed 2 days this week.`);
        return;
     }

     // 2. No back-to-back days
     if (dayIndex > 0 && schedule[dayIndex - 1] === activeParent) {
        showError("Cannot drive on consecutive days.");
        return;
     }
     if (dayIndex < 4 && schedule[dayIndex + 1] === activeParent) {
        showError("Cannot drive on consecutive days.");
        return;
     }

     // Passed rules
     setSchedule(prev => ({ ...prev, [dayIndex]: activeParent }));

     // Check if all days filled
     const newSchedule = { ...schedule, [dayIndex]: activeParent };
     if (Object.values(newSchedule).every(v => v !== null) && onComplete) {
        setTimeout(onComplete, 1000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="pt-12 px-6 pb-6 text-center">
         <h2 className="text-3xl font-black tracking-tight mb-2 uppercase flex items-center justify-center gap-2" style={{ color: primaryColor }}>
            <Car size={28} /> {config.title || "School Carpool"}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {config.body || "Fair share distribution rules applied."}
         </p>
      </div>

      {/* Parent Selector */}
      <div className="px-6 mb-8 flex flex-wrap justify-center gap-2">
         {parents.map((p: any) => (
            <button
               key={p.id}
               onClick={() => setActiveParent(p.id)}
               className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border-2 ${
                  activeParent === p.id 
                     ? 'bg-white scale-110 shadow-md' 
                     : 'bg-white/50 opacity-60 hover:opacity-100 border-transparent'
               }`}
               style={{ 
                  borderColor: activeParent === p.id ? p.color : 'transparent',
                  color: p.color
               }}
            >
               <div className="flex items-center gap-1.5">
                  <UserCircle size={16} /> {p.name}
               </div>
            </button>
         ))}
      </div>

      {/* Main Grid */}
      <div className="flex-1 px-4 sm:px-6 w-full max-w-xl mx-auto flex flex-col gap-3 pb-24">
         {days.map((day, idx) => {
            
            const claimedBy = schedule[idx];
            const claimedParent = parents.find((p: any) => p.id === claimedBy);
            
            return (
               <button
                  key={idx}
                  onClick={() => handleClaim(idx)}
                  className={`w-full relative flex items-center p-4 rounded-2xl border-2 transition-all overflow-hidden ${
                     claimedBy 
                        ? 'bg-white shadow-md cursor-default' 
                        : 'bg-white/40 border-dashed border-slate-300 hover:bg-white/80 hover:border-slate-400 active:scale-95'
                  }`}
                  style={{
                     borderColor: claimedBy ? claimedParent?.color : undefined
                  }}
               >
                  <div className="w-16 text-left border-r-2 border-slate-100 pr-4">
                     <span className="font-black text-xl text-slate-700">{day}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                     <AnimatePresence mode="wait">
                        {claimedBy ? (
                           <motion.div 
                              key={claimedBy}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="font-black text-lg flex items-center gap-2"
                              style={{ color: claimedParent?.color }}
                           >
                              <CheckCircle2 size={20} />
                              {claimedParent?.name} driving
                           </motion.div>
                        ) : (
                           <motion.span 
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                           >
                              Tap to claim
                           </motion.span>
                        )}
                     </AnimatePresence>
                  </div>
               </button>
            );
         })}
      </div>

      {/* Error Toast */}
      <AnimatePresence>
         {errorMsg && (
            <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, scale: 0.9 }}
               className="absolute bottom-8 left-4 right-4 z-50 flex justify-center pointer-events-none"
            >
               <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm max-w-sm w-full">
                  <AlertTriangle size={20} />
                  {errorMsg}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
