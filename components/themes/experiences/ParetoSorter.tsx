"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";

type TaskItem = {
  id: string;
  name: string;
  value: number; // 1-100
};

const defaultTasks: TaskItem[] = [
  { id: "t1", name: "Redesign landing page", value: 90 },
  { id: "t2", name: "Fix critical login bug", value: 95 },
  { id: "t3", name: "Update email signature", value: 10 },
  { id: "t4", name: "Organize desk", value: 5 },
  { id: "t5", name: "Reply to recruiter spam", value: 2 },
  { id: "t6", name: "Draft Q3 roadmap", value: 85 },
  { id: "t7", name: "Change Slack avatar", value: 1 },
  { id: "t8", name: "Research new IDE theme", value: 3 },
  { id: "t9", name: "Write performance review", value: 80 },
  { id: "t10", name: "Order office supplies", value: 8 },
];

export function ParetoSorter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const initialTasks = (config.experience as any)?.tasks || defaultTasks;
  const title = config.title || "The 80/20 Sorter";

  const [sorted, setSorted] = useState(false);

  const tasks = [...initialTasks].sort((a, b) => b.value - a.value);
  const topCount = Math.max(1, Math.ceil(tasks.length * 0.2)); // Top 20%
  const topTasks = tasks.slice(0, topCount);
  const bottomTasks = tasks.slice(topCount);

  const handleSort = () => {
    setSorted(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 20]);
    if (onComplete) setTimeout(onComplete, 5000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-900 text-white" style={{ backgroundColor: bgColors[0] }}>
      
      {!sorted && (
         <div className="absolute top-10 w-full text-center z-20">
            <h2 className="text-xl font-black uppercase tracking-widest">{title}</h2>
            <p className="text-xs text-zinc-400 mt-1">Tap to apply Pareto Principle</p>
         </div>
      )}

      {/* Unsorted View */}
      {!sorted && (
         <div 
           className="flex-1 overflow-auto p-6 pt-24 space-y-2 cursor-pointer"
           onClick={handleSort}
         >
            {initialTasks.map((t: TaskItem) => (
               <div key={t.id} className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center border border-zinc-700">
                  <span className="font-medium text-zinc-200">{t.name}</span>
                  <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-400">Val: {t.value}</span>
               </div>
            ))}
         </div>
      )}

      {/* Sorted View */}
      <AnimatePresence>
         {sorted && (
            <motion.div 
               className="flex-1 flex flex-col"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               {/* TOP 20% - Takes up 80% of screen */}
               <motion.div 
                  className="flex flex-col p-8 justify-center items-center text-center overflow-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10"
                  style={{ backgroundColor: primaryColor, color: "#000" }}
                  initial={{ flexBasis: "20%" }}
                  animate={{ flexBasis: "80%" }}
                  transition={{ type: "spring", bounce: 0, duration: 1.5 }}
               >
                  <Filter size={48} className="mb-6 opacity-80" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 opacity-90">The Vital Few</h3>
                  <div className="space-y-4 w-full max-w-md">
                     {topTasks.map((t, i) => (
                        <motion.div 
                           key={t.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 1 + i * 0.2 }}
                           className="bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-black/20 text-left flex justify-between items-center"
                        >
                           <span className="font-bold text-xl">{t.name}</span>
                           <span className="font-black text-2xl opacity-60">{t.value}</span>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>

               {/* BOTTOM 80% - Takes up 20% of screen */}
               <motion.div 
                  className="flex flex-wrap content-start gap-1 p-2 overflow-auto bg-zinc-950 opacity-50 relative"
                  initial={{ flexBasis: "80%" }}
                  animate={{ flexBasis: "20%" }}
                  transition={{ type: "spring", bounce: 0, duration: 1.5 }}
               >
                  <div className="w-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">The Trivial Many (Ignore)</div>
                  {bottomTasks.map((t: TaskItem) => (
                     <span key={t.id} className="text-[10px] text-zinc-600 bg-zinc-900 px-1 py-0.5 rounded truncate max-w-full">
                        {t.name}
                     </span>
                  ))}
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
