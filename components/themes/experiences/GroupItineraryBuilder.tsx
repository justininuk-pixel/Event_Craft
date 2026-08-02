"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
   id: string;
   title: string;
   color: string;
}

const ACTIVITIES: Activity[] = [
   { id: "a1", title: "Breakfast at Tiffany's", color: "#f59e0b" },
   { id: "a2", title: "Central Park Walk", color: "#10b981" },
   { id: "a3", title: "Broadway Show", color: "#8b5cf6" },
];

const TIME_SLOTS = ["09:00 AM", "01:00 PM", "07:00 PM"];

export function GroupItineraryBuilder({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"building" | "locked">("building");
  
  // slot index -> Activity
  const [slotted, setSlotted] = useState<Record<number, Activity>>({});
  
  // Track which card is currently being dragged
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const handleDragStart = (e: React.DragEvent, id: string) => {
     setDraggedId(id);
     e.dataTransfer.setData("text/plain", id);
     e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
     e.preventDefault();
     const id = e.dataTransfer.getData("text/plain");
     
     const activity = ACTIVITIES.find(a => a.id === id);
     if (activity) {
        setSlotted(prev => {
           const next = { ...prev };
           // If activity is already in another slot, remove it from there
           for (const key in next) {
              if (next[key].id === id) {
                 delete next[key];
              }
           }
           next[slotIndex] = activity;
           return next;
        });
     }
     setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault();
     e.dataTransfer.dropEffect = "move";
  };

  const handleLock = () => {
     setPhase("locked");
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  // The unslotted activities
  const availableActivities = ACTIVITIES.filter(a => !Object.values(slotted).some(s => s.id === a.id));

  const isComplete = Object.keys(slotted).length === TIME_SLOTS.length;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center bg-slate-50 text-slate-800"
    >
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      <AnimatePresence mode="wait">
         {phase === "building" && (
            <motion.div
               key="building"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, y: -50 }}
               className="relative z-10 w-full max-w-4xl h-full flex flex-col p-6"
            >
               <h1 className="text-2xl font-black uppercase tracking-widest text-center text-slate-800 mb-2">
                  Group Itinerary
               </h1>
               <p className="text-slate-500 font-bold text-center mb-8">
                  Drag and drop activities into the time slots to build a consensus.
               </p>
               
               <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
                  
                  {/* Left: The Timeline Slots */}
                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
                     {TIME_SLOTS.map((time, i) => {
                        const activity = slotted[i];
                        return (
                           <div key={i} className="flex gap-4">
                              <div className="w-24 shrink-0 flex flex-col items-end pt-4 border-r-2 border-slate-200 pr-4">
                                 <span className="font-bold text-slate-500">{time}</span>
                              </div>
                              <div 
                                 className={`flex-1 min-h-[5rem] rounded-2xl border-2 transition-colors flex items-center justify-center p-2
                                    ${activity ? "border-transparent bg-white shadow-md" : "border-dashed border-slate-300 bg-slate-100 hover:bg-slate-200"}`
                                 }
                                 onDrop={e => handleDrop(e, i)}
                                 onDragOver={handleDragOver}
                              >
                                 {activity ? (
                                    <div 
                                       draggable
                                       onDragStart={(e: any) => handleDragStart(e, activity.id)}
                                       className="w-full h-full rounded-xl flex items-center px-4 cursor-grab active:cursor-grabbing text-white shadow-sm"
                                       style={{ backgroundColor: activity.color }}
                                    >
                                       <span className="font-black text-lg">{activity.title}</span>
                                    </div>
                                 ) : (
                                    <span className="text-slate-400 font-bold text-sm uppercase">Drop Here</span>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Right: Available Pool */}
                  <div className="w-full md:w-64 shrink-0 flex flex-col bg-white rounded-3xl p-6 shadow-xl border border-slate-100 h-64 md:h-full overflow-hidden">
                     <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Activities</h2>
                     <div 
                        className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4"
                        onDrop={e => {
                           // Allow dropping back to the pool to un-slot it
                           e.preventDefault();
                           const id = e.dataTransfer.getData("text/plain");
                           setSlotted(prev => {
                              const next = { ...prev };
                              for (const key in next) {
                                 if (next[key].id === id) {
                                    delete next[key];
                                 }
                              }
                              return next;
                           });
                        }}
                        onDragOver={handleDragOver}
                     >
                        <AnimatePresence>
                           {availableActivities.map(activity => (
                              <motion.div
                                 key={activity.id}
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.8 }}
                                 draggable
                                 onDragStart={(e: any) => handleDragStart(e, activity.id)}
                                 className="w-full p-4 rounded-xl cursor-grab active:cursor-grabbing text-white shadow-md transition-transform hover:scale-105"
                                 style={{ backgroundColor: activity.color }}
                              >
                                 <span className="font-black text-sm">{activity.title}</span>
                              </motion.div>
                           ))}
                           {availableActivities.length === 0 && (
                              <div className="w-full h-full flex items-center justify-center">
                                 <span className="text-slate-300 font-bold text-sm text-center">All activities scheduled!</span>
                              </div>
                           )}
                        </AnimatePresence>
                     </div>
                     
                     <AnimatePresence>
                        {isComplete && (
                           <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={handleLock}
                              className="mt-4 w-full py-4 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95"
                              style={{ backgroundColor: primaryColor }}
                           >
                              LOCK ITINERARY
                           </motion.button>
                        )}
                     </AnimatePresence>
                  </div>

               </div>
            </motion.div>
         )}

         {phase === "locked" && (
            <motion.div
               key="locked"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 w-full max-w-lg bg-white border border-slate-100 p-8 rounded-3xl flex flex-col items-center shadow-2xl"
            >
               <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-6 text-3xl"
               >
                  🔒
               </motion.div>
               <h1 className="text-2xl font-black uppercase text-slate-800 mb-2">
                 Itinerary Locked
               </h1>
               <p className="text-slate-500 font-bold mb-8">
                  The group has reached consensus.
               </p>
               
               <div className="w-full flex flex-col gap-2 mb-8">
                  {TIME_SLOTS.map((time, i) => (
                     <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-bold">{time}</span>
                        <span className="font-black" style={{ color: slotted[i]?.color || "#333" }}>
                           {slotted[i]?.title}
                        </span>
                     </div>
                  ))}
               </div>

               <div className="w-full bg-slate-800 rounded-xl p-6 text-center text-white">
                  <h2 className="text-xl font-bold mb-2">
                    {config.title}
                  </h2>
                  <p className="text-slate-300">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
