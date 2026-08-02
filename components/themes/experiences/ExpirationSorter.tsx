"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Clock, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  expirationDate: number; // timestamp
};

export function ExpirationSorter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8"; // sky-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0f9ff"]; // sky-50

  // Mock Date Generator relative to NOW
  const getDaysFromNow = (days: number) => Date.now() + (1000 * 60 * 60 * 24 * days);

  const [inventory, setInventory] = useState<InventoryItem[]>([
     { id: "i1", name: "Almond Milk", expirationDate: getDaysFromNow(12) },
     { id: "i2", name: "Baby Spinach", expirationDate: getDaysFromNow(2) },
     { id: "i3", name: "Leftover Pizza", expirationDate: getDaysFromNow(0) }, // Expires today
     { id: "i4", name: "Greek Yogurt", expirationDate: getDaysFromNow(-1) }, // Expired yesterday
     { id: "i5", name: "Eggs", expirationDate: getDaysFromNow(15) },
     { id: "i6", name: "Fresh Salmon", expirationDate: getDaysFromNow(1) },
  ]);

  const [sortedInventory, setSortedInventory] = useState<InventoryItem[]>([]);

  // Sort and Categorize whenever inventory changes or time passes
  useEffect(() => {
     const sorted = [...inventory].sort((a, b) => a.expirationDate - b.expirationDate);
     setSortedInventory(sorted);
  }, [inventory]);

  const getStatus = (expDate: number) => {
     const now = Date.now();
     const diffTime = expDate - now;
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

     if (diffDays < 0) return { category: "expired", label: `Expired ${Math.abs(diffDays)}d ago`, color: "bg-red-950 border-red-500 text-red-500", icon: <Trash2 size={16} /> };
     if (diffDays === 0) return { category: "today", label: "Expires Today!", color: "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]", icon: <AlertTriangle size={16} /> };
     if (diffDays <= 3) return { category: "soon", label: `Expires in ${diffDays}d`, color: "bg-amber-100 border-amber-300 text-amber-700", icon: <Clock size={16} /> };
     return { category: "safe", label: `Good for ${diffDays}d`, color: "bg-white border-slate-200 text-slate-500", icon: <CheckCircle2 size={16} className="text-emerald-500" /> };
  };

  const removeItem = (id: string) => {
     setInventory(prev => prev.filter(i => i.id !== id));
     if (inventory.length === 1 && onComplete) onComplete();
  };

  // Editor bypass: Add a new item expiring today
  const handleEditorInject = () => {
     setInventory(prev => [...prev, { id: `i${Date.now()}`, name: "Suspicious Sushi", expirationDate: getDaysFromNow(0) }]);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor (Fridge Texture) */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none"
         style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.05) 40px, rgba(0,0,0,0.05) 80px)" }} 
      />

      <div className="w-full max-w-xl mx-auto flex flex-col h-full z-10 p-4 sm:p-8 bg-white/40 backdrop-blur-md shadow-2xl border-x border-white">
         
         <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
               <h2 className="text-3xl font-black tracking-tight mb-1 flex items-center gap-3">
                  <Snowflake size={28} style={{ color: primaryColor }} />
                  {config.title || "Smart Fridge"}
               </h2>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  {config.body || "Eat items at the top first."}
               </p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-3 pb-8 px-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
               {sortedInventory.map(item => {
                  const status = getStatus(item.expirationDate);
                  
                  return (
                     <motion.div 
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${status.color}`}
                     >
                        <div>
                           <h3 className="font-black text-lg">{item.name}</h3>
                           <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">
                              {status.icon}
                              {status.label}
                           </div>
                        </div>
                        <button 
                           onClick={() => removeItem(item.id)}
                           className="w-10 h-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                        >
                           <CheckCircle2 size={20} />
                        </button>
                     </motion.div>
                  );
               })}
               
               {sortedInventory.length === 0 && (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="text-center p-12 text-slate-400 font-bold uppercase tracking-widest"
                  >
                     <Snowflake size={48} className="mx-auto mb-4 opacity-50" />
                     Fridge is empty
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleEditorInject}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Add Urgent Item (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
