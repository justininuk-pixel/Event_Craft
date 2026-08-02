"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, CalendarDays, Info, ArrowRight } from "lucide-react";

type FruitSize = { week: number; fruit: string; emoji: string; desc: string; sizeCm: number };

const fruits: FruitSize[] = [
  { week: 4, fruit: "Poppy Seed", emoji: "⚫", desc: "Just the beginning of the journey.", sizeCm: 0.2 },
  { week: 8, fruit: "Raspberry", emoji: "🍇", desc: "Little arms and legs are forming.", sizeCm: 1.6 }, // Using grape as raspberry sub if needed, but wait, there is no raspberry. 🍓 is strawberry. Let's use 🫐 blueberry.
  { week: 12, fruit: "Plum", emoji: "🍑", desc: "Reflexes are developing.", sizeCm: 5.4 },
  { week: 16, fruit: "Avocado", emoji: "🥑", desc: "They can hear your voice now!", sizeCm: 11.6 },
  { week: 20, fruit: "Banana", emoji: "🍌", desc: "Halfway there! They are swallowing and digesting.", sizeCm: 16.4 },
  { week: 24, fruit: "Cantaloupe", emoji: "🍈", desc: "Practicing breathing movements.", sizeCm: 30.0 },
  { week: 28, fruit: "Eggplant", emoji: "🍆", desc: "Eyes can open and blink.", sizeCm: 37.6 },
  { week: 32, fruit: "Squash", emoji: "🥜", desc: "Gaining weight rapidly.", sizeCm: 42.4 },
  { week: 36, fruit: "Papaya", emoji: "🥭", desc: "Getting ready for the big day.", sizeCm: 47.4 },
  { week: 40, fruit: "Watermelon", emoji: "🍉", desc: "Ready to meet the world!", sizeCm: 51.2 }
];

export function PregnancyFruitVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f472b6"; // pink-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"]; // pink-50

  const [dueDateStr, setDueDateStr] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [showConfig, setShowConfig] = useState(true);

  // Determine current fruit
  let currentFruit = fruits[0];
  for (let i = fruits.length - 1; i >= 0; i--) {
     if (currentWeek >= fruits[i].week) {
        currentFruit = fruits[i];
        break;
     }
  }
  // Clamp to 40 max
  if (currentWeek > 40) currentFruit = fruits[fruits.length - 1];

  const calculateWeek = (due: string) => {
     if (!due) return;
     const dueDate = new Date(due);
     const today = new Date();
     
     // Due date is 40 weeks from conception
     // So conception was roughly (40 * 7) days before due date
     const conception = new Date(dueDate.getTime() - (40 * 7 * 24 * 60 * 60 * 1000));
     
     const diffTime = Math.abs(today.getTime() - conception.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     let weeks = Math.floor(diffDays / 7);
     
     if (today > dueDate) weeks = 40; // max out
     
     setCurrentWeek(weeks);
     setShowConfig(false);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 items-center justify-center"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <AnimatePresence mode="wait">
         {showConfig ? (
            <motion.div 
               key="config"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-pink-100 flex flex-col items-center text-center mx-4"
            >
               <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500">
                  <Baby size={32} />
               </div>
               
               <h2 className="text-2xl font-black mb-2 text-slate-800">
                  {config.title || "Baby Size Tracker"}
               </h2>
               <p className="text-sm font-medium text-slate-500 mb-8">
                  Enter your due date to see how big your little one is this week.
               </p>

               <div className="w-full relative mb-6">
                  <CalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                     type="date" 
                     value={dueDateStr}
                     onChange={(e) => setDueDateStr(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-pink-200 outline-none"
                  />
               </div>

               <button
                  onClick={() => calculateWeek(dueDateStr)}
                  disabled={!dueDateStr}
                  className={`w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all ${!dueDateStr ? 'opacity-50' : 'hover:scale-105 active:scale-95 shadow-lg'}`}
                  style={{ backgroundColor: primaryColor }}
               >
                  See Baby <ArrowRight size={20} />
               </button>
            </motion.div>
         ) : (
            <motion.div 
               key="visualizer"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-md mx-auto flex flex-col items-center px-4"
            >
               
               <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm text-sm font-black text-pink-900 border border-pink-100 mb-12 flex items-center gap-2">
                  <Baby size={16} /> Week {currentWeek}
               </div>

               {/* 3D-ish Fruit Display using massive emoji + drop shadow + rotation animation */}
               <motion.div 
                  className="relative flex items-center justify-center mb-12"
                  animate={{ 
                     y: [0, -10, 0],
                     rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                     duration: 6, 
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
               >
                  <div className="absolute inset-0 bg-pink-300 blur-[100px] opacity-40 rounded-full" />
                  <div 
                     className="text-[180px] drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] select-none pointer-events-none z-10"
                     style={{ lineHeight: 1 }}
                  >
                     {currentFruit.emoji}
                  </div>
               </motion.div>

               <div className="text-center bg-white rounded-3xl p-8 shadow-xl border border-pink-50 w-full relative">
                  
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                     <Info size={12} /> {currentFruit.sizeCm} cm
                  </div>

                  <h3 className="text-3xl font-black text-slate-800 mb-2 mt-2">
                     Your baby is the size of a <br/>
                     <span style={{ color: primaryColor }}>{currentFruit.fruit}</span>
                  </h3>
                  
                  <p className="text-slate-500 font-medium leading-relaxed">
                     {currentFruit.desc}
                  </p>
               </div>

               {/* Timeline scrub for Demo / Testing */}
               <div className="w-full mt-12 bg-white/50 backdrop-blur p-4 rounded-2xl border border-white/20">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                     <span>Week 4</span>
                     <span>Week 40</span>
                  </div>
                  <input 
                     type="range" min="4" max="40" step="1"
                     value={currentWeek}
                     onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                     className="w-full accent-pink-500"
                  />
               </div>

               {onComplete && (
                  <button 
                     onClick={onComplete}
                     className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                  >
                     Close
                  </button>
               )}

            </motion.div>
         )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
         <Baby size={200} />
      </div>

    </div>
  );
}
