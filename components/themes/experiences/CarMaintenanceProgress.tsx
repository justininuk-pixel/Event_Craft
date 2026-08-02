"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Droplet, Wrench, RefreshCw, AlertTriangle } from "lucide-react";

type MaintenanceItem = {
  id: string;
  name: string;
  interval: number; // e.g., every 5,000 miles
  lastServiceMileage: number; // e.g., last done at 50,000 miles
  icon: React.ElementType;
};

const INITIAL_ITEMS: MaintenanceItem[] = [
   { id: "m1", name: "Oil Change", interval: 5000, lastServiceMileage: 50000, icon: Droplet },
   { id: "m2", name: "Tire Rotation", interval: 10000, lastServiceMileage: 48000, icon: RefreshCw },
   { id: "m3", name: "Timing Belt", interval: 60000, lastServiceMileage: 0, icon: Wrench },
   { id: "m4", name: "Brake Pads", interval: 30000, lastServiceMileage: 25000, icon: Car },
];

export function CarMaintenanceProgress({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0f172a"; // slate-900
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [currentMileage, setCurrentMileage] = useState<number>(54500);
  const [items, setItems] = useState<MaintenanceItem[]>(INITIAL_ITEMS);

  // Check if any items are overdue to trigger completion criteria
  const isAnyOverdue = items.some(item => {
     const milesSince = currentMileage - item.lastServiceMileage;
     return milesSince >= item.interval;
  });

  useEffect(() => {
     if (isAnyOverdue && onComplete) {
        onComplete();
     }
  }, [isAnyOverdue, onComplete]);

  const handleUpdateMileage = (val: number) => {
     if (val < 0) return;
     setCurrentMileage(val);
  };

  const resetService = (id: string) => {
     setItems(prev => prev.map(item => 
        item.id === id ? { ...item, lastServiceMileage: currentMileage } : item
     ));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor (Grid) */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none"
         style={{ backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
      />

      <div className="w-full max-w-2xl mx-auto flex flex-col h-full z-10 p-4 sm:p-8">
         
         <div className="bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Header / Odometer */}
            <div className="p-8 pb-10 bg-slate-900 text-white relative overflow-hidden">
               {/* Carbon fiber texture overlay effect */}
               <div 
                  className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #111 25%, #111 75%, #000 75%, #000)", backgroundPosition: "0 0, 10px 10px", backgroundSize: "20px 20px" }}
               />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                     <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2">
                        <Car size={16} />
                        {config.title || "My Vehicle"}
                     </h2>
                     <p className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                        Odometer Update
                     </p>
                  </div>
                  
                  {/* Digital Odometer Input */}
                  <div className="bg-black border-4 border-slate-700 rounded-xl p-3 flex flex-col items-center">
                     <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Miles</span>
                     <div className="flex items-center gap-1 font-mono text-3xl font-black text-emerald-400">
                        <input 
                           type="number" 
                           value={currentMileage}
                           onChange={(e) => handleUpdateMileage(parseInt(e.target.value) || 0)}
                           className="bg-transparent border-none text-right w-32 focus:outline-none focus:ring-0 p-0 text-emerald-400"
                        />
                        <span>mi</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Progress Bars List */}
            <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50">
               <h3 className="font-bold text-slate-800 text-lg mb-2">Maintenance Status</h3>
               
               <AnimatePresence>
                  {items.map(item => {
                     const milesSince = Math.max(0, currentMileage - item.lastServiceMileage);
                     const progressRatio = Math.min(1, milesSince / item.interval);
                     const percentage = progressRatio * 100;
                     const isDue = progressRatio >= 1;
                     const Icon = item.icon;

                     // Determine color
                     let barColor = "#3b82f6"; // blue
                     if (percentage > 75) barColor = "#f59e0b"; // yellow
                     if (isDue) barColor = "#ef4444"; // red

                     return (
                        <motion.div 
                           key={item.id}
                           layout
                           className={`p-5 rounded-2xl border transition-all duration-300 ${
                              isDue ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-slate-200 shadow-sm'
                           }`}
                        >
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isDue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'
                                 }`}>
                                    <Icon size={20} />
                                 </div>
                                 <div>
                                    <h4 className={`font-bold text-lg ${isDue ? 'text-red-700' : 'text-slate-800'}`}>
                                       {item.name}
                                    </h4>
                                    <p className="text-xs font-medium text-slate-500">
                                       Every {item.interval.toLocaleString()} mi
                                    </p>
                                 </div>
                              </div>
                              
                              <div className="text-right">
                                 <div className={`font-black text-xl ${isDue ? 'text-red-600' : 'text-slate-800'}`}>
                                    {Math.round(percentage)}%
                                 </div>
                                 <div className="text-xs font-bold text-slate-400">
                                    {milesSince.toLocaleString()} / {item.interval.toLocaleString()}
                                 </div>
                              </div>
                           </div>

                           {/* Progress Bar Container */}
                           <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4 shadow-inner">
                              <motion.div 
                                 className="h-full rounded-full relative"
                                 style={{ backgroundColor: barColor }}
                                 initial={{ width: 0 }}
                                 animate={{ width: `${percentage}%` }}
                                 transition={{ type: "spring", stiffness: 50, damping: 15 }}
                              >
                                 {isDue && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                 )}
                              </motion.div>
                           </div>

                           {/* Actions */}
                           {isDue ? (
                              <button
                                 onClick={() => resetService(item.id)}
                                 className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                              >
                                 <AlertTriangle size={18} />
                                 Log Service (Reset)
                              </button>
                           ) : (
                              <button
                                 onClick={() => resetService(item.id)}
                                 className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
                              >
                                 I did this early
                              </button>
                           )}

                        </motion.div>
                     )
                  })}
               </AnimatePresence>
            </div>

         </div>
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isAnyOverdue && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setCurrentMileage(currentMileage + 2000)}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               +2,000 Miles (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
