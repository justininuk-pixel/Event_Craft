"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type MatrixTask = {
  id: string;
  text: string;
  quadrant?: 1 | 2 | 3 | 4; // 1: UI, 2: NIU, 3: UNI, 4: NNI
};

const initialTasks: MatrixTask[] = [
  { id: "m1", text: "Pay electric bill" },
  { id: "m2", text: "Learn French" },
  { id: "m3", text: "Answer casual emails" },
  { id: "m4", text: "Doomscroll Twitter" },
];

export function EisenhowerMatrix({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [tasks, setTasks] = useState<MatrixTask[]>((config.experience as any)?.tasks || initialTasks);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [culling, setCulling] = useState(false);

  const currentTask = tasks[activeTaskIndex];
  const isSortingComplete = activeTaskIndex >= tasks.length;

  const handleAssign = (quadrant: 1 | 2 | 3 | 4) => {
     if (!currentTask) return;
     const newTasks = [...tasks];
     newTasks[activeTaskIndex] = { ...currentTask, quadrant };
     setTasks(newTasks);
     setActiveTaskIndex(prev => prev + 1);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  const handleCommit = () => {
     setCulling(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     if (onComplete) setTimeout(onComplete, 4000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-zinc-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* The 2x2 Matrix Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 relative transition-all duration-1000">
         
         {/* Q1: Urgent / Important */}
         <div className="border-r border-b border-zinc-200 bg-red-50 p-4 flex flex-col relative z-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400">Do</h3>
            <div className="flex-1 mt-2 space-y-1 overflow-auto hide-scrollbar">
               {tasks.filter(t => t.quadrant === 1).map(t => (
                  <div key={t.id} className="text-xs font-bold text-red-900 bg-white p-2 rounded shadow-sm">{t.text}</div>
               ))}
            </div>
         </div>

         {/* Q2: Not Urgent / Important */}
         <div className="border-b border-zinc-200 bg-blue-50 p-4 flex flex-col relative z-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Schedule</h3>
            <div className="flex-1 mt-2 space-y-1 overflow-auto hide-scrollbar">
               {tasks.filter(t => t.quadrant === 2).map(t => (
                  <div key={t.id} className="text-xs font-bold text-blue-900 bg-white p-2 rounded shadow-sm">{t.text}</div>
               ))}
            </div>
         </div>

         {/* Q3: Urgent / Not Important */}
         <div className="border-r border-zinc-200 bg-amber-50 p-4 flex flex-col relative z-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Delegate</h3>
            <div className="flex-1 mt-2 space-y-1 overflow-auto hide-scrollbar">
               {tasks.filter(t => t.quadrant === 3).map(t => (
                  <div key={t.id} className="text-xs font-bold text-amber-900 bg-white p-2 rounded shadow-sm">{t.text}</div>
               ))}
            </div>
         </div>

         {/* Q4: Not Urgent / Not Important */}
         <div className="bg-zinc-100 p-4 flex flex-col relative overflow-hidden z-0">
            {/* The Culling Animation overlay */}
            <motion.div 
               className="absolute inset-0 bg-black z-20 flex items-center justify-center pointer-events-none"
               initial={{ y: "100%" }}
               animate={culling ? { y: 0 } : { y: "100%" }}
               transition={{ type: "spring", bounce: 0.2, duration: 1 }}
            >
               <span className="text-red-500 font-black uppercase tracking-widest text-sm">Deleted</span>
            </motion.div>
            
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 relative z-10">Eliminate</h3>
            <div className="flex-1 mt-2 space-y-1 overflow-auto hide-scrollbar relative z-10">
               {tasks.filter(t => t.quadrant === 4).map(t => (
                  <div key={t.id} className="text-xs font-bold text-zinc-500 bg-white p-2 rounded shadow-sm strike-through opacity-70">{t.text}</div>
               ))}
            </div>
         </div>

         {/* Crosshair Center */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-zinc-200 shadow-sm z-10" />

      </div>

      {/* Sorting Control Panel overlaying the bottom */}
      <AnimatePresence>
         {!isSortingComplete && currentTask ? (
            <motion.div 
              key="sorting"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-4 z-30"
            >
               <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 text-center">Assign Task {activeTaskIndex + 1}/{tasks.length}</div>
               <h3 className="text-xl font-black text-center mb-6">{currentTask.text}</h3>
               
               <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAssign(1)} className="p-3 rounded-xl bg-red-50 text-red-700 font-bold text-sm border border-red-200 hover:bg-red-100 active:scale-95 transition-all">DO</button>
                  <button onClick={() => handleAssign(2)} className="p-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all">SCHEDULE</button>
                  <button onClick={() => handleAssign(3)} className="p-3 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all">DELEGATE</button>
                  <button onClick={() => handleAssign(4)} className="p-3 rounded-xl bg-zinc-100 text-zinc-600 font-bold text-sm border border-zinc-200 hover:bg-zinc-200 active:scale-95 transition-all">ELIMINATE</button>
               </div>
            </motion.div>
         ) : !culling && (
            <motion.div 
              key="commit"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-4 left-4 right-4 z-30"
            >
               <button 
                  onClick={handleCommit}
                  className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
               >
                  Commit & Cull
               </button>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
