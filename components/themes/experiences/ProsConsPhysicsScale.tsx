"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Plus, Minus } from "lucide-react";

type WeightItem = {
  id: string;
  text: string;
  weight: number; // 1-10
  type: "pro" | "con";
};

const defaultItems: WeightItem[] = [
  { id: "p1", text: "Better salary", weight: 8, type: "pro" },
  { id: "p2", text: "More responsibilities", weight: 4, type: "pro" },
  { id: "c1", text: "Longer commute", weight: 7, type: "con" },
  { id: "c2", text: "Less free time", weight: 9, type: "con" },
];

export function ProsConsPhysicsScale({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafafa"]; // neutral-50
  
  const title = config.title || "The Ultimate Decision";
  const initialItems = (config.experience as any)?.items || defaultItems;

  const [items, setItems] = useState<WeightItem[]>(initialItems);
  
  const proWeight = items.filter(i => i.type === "pro").reduce((sum, i) => sum + i.weight, 0);
  const conWeight = items.filter(i => i.type === "con").reduce((sum, i) => sum + i.weight, 0);

  // Calculate tilt angle (-45 to 45 degrees)
  const maxWeight = Math.max(proWeight, conWeight, 1);
  const diff = proWeight - conWeight;
  const tiltAngle = Math.min(Math.max((diff / 20) * 45, -45), 45); // cap at 45deg either side

  const handleAdd = (type: "pro" | "con") => {
     setItems([...items, { id: Date.now().toString(), text: "New reason...", weight: 5, type }]);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  const handleWeightChange = (id: string, newWeight: number) => {
     setItems(items.map(i => i.id === id ? { ...i, weight: newWeight } : i));
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-neutral-50 text-neutral-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-8 pb-4 text-center z-10">
        <h2 className="text-2xl font-black uppercase tracking-widest">{title}</h2>
      </div>

      {/* The Physical Scale */}
      <div className="relative w-full h-48 flex items-center justify-center mt-8 mb-4 pointer-events-none">
         
         {/* Base/Stand */}
         <div className="absolute bottom-0 w-4 h-32 bg-amber-900 rounded-t border-r-2 border-l-2 border-amber-950 z-10" />
         <div className="absolute bottom-0 w-32 h-4 bg-amber-950 rounded-t-lg z-10" />
         
         {/* Fulcrum Point */}
         <div className="absolute bottom-32 w-6 h-6 bg-amber-600 rounded-full border-2 border-amber-800 z-20 shadow-md" />

         {/* The Balance Beam */}
         <motion.div 
           className="absolute bottom-32 w-64 h-2 bg-amber-800 rounded-full shadow-lg z-10 origin-center"
           animate={{ rotate: tiltAngle }}
           transition={{ type: "spring", stiffness: 50, damping: 10 }}
         >
            {/* Left Pan (Pros) */}
            <div className="absolute left-0 -top-1 w-2 h-2 bg-amber-600 rounded-full" />
            <motion.div 
              className="absolute left-[-20px] top-1 w-10 h-10 border-b-4 border-l-2 border-r-2 border-amber-700 rounded-b-full bg-amber-600/20 shadow-xl"
              animate={{ rotate: -tiltAngle }} // keep pans upright
            />

            {/* Right Pan (Cons) */}
            <div className="absolute right-0 -top-1 w-2 h-2 bg-amber-600 rounded-full" />
            <motion.div 
              className="absolute right-[-20px] top-1 w-10 h-10 border-b-4 border-l-2 border-r-2 border-amber-700 rounded-b-full bg-amber-600/20 shadow-xl"
              animate={{ rotate: -tiltAngle }}
            />
         </motion.div>

         <div className="absolute top-0 opacity-20"><Scale size={120} /></div>
      </div>

      {/* Inputs */}
      <div className="flex-1 flex px-4 gap-4 pb-8 overflow-hidden z-20">
         
         {/* Pros */}
         <div className="flex-1 flex flex-col bg-emerald-50 rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
            <div className="bg-emerald-100 py-2 text-center border-b border-emerald-200 font-bold text-emerald-800 tracking-widest uppercase text-xs flex justify-between items-center px-3">
               <span>Pros ({proWeight})</span>
               <button onClick={() => handleAdd("pro")} className="bg-emerald-200 p-1 rounded hover:bg-emerald-300"><Plus size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               <AnimatePresence>
                  {items.filter(i => i.type === "pro").map(i => (
                     <motion.div key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-2 rounded shadow-sm border border-emerald-100 flex flex-col gap-1">
                        <span className="text-xs font-sans font-medium text-neutral-700">{i.text}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-emerald-600 font-bold uppercase">Weight:</span>
                           <input type="range" min="1" max="10" value={i.weight} onChange={(e) => handleWeightChange(i.id, parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
                           <span className="text-xs font-mono font-bold w-4 text-center">{i.weight}</span>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Cons */}
         <div className="flex-1 flex flex-col bg-red-50 rounded-xl border border-red-200 overflow-hidden shadow-sm">
            <div className="bg-red-100 py-2 text-center border-b border-red-200 font-bold text-red-800 tracking-widest uppercase text-xs flex justify-between items-center px-3">
               <span>Cons ({conWeight})</span>
               <button onClick={() => handleAdd("con")} className="bg-red-200 p-1 rounded hover:bg-red-300"><Plus size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               <AnimatePresence>
                  {items.filter(i => i.type === "con").map(i => (
                     <motion.div key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-2 rounded shadow-sm border border-red-100 flex flex-col gap-1">
                        <span className="text-xs font-sans font-medium text-neutral-700">{i.text}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] text-red-600 font-bold uppercase">Weight:</span>
                           <input type="range" min="1" max="10" value={i.weight} onChange={(e) => handleWeightChange(i.id, parseInt(e.target.value))} className="flex-1 accent-red-500" />
                           <span className="text-xs font-mono font-bold w-4 text-center">{i.weight}</span>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

      </div>

    </div>
  );
}
