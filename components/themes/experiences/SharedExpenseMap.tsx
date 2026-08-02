"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, DollarSign, Plus, Map, MousePointerClick } from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  category: string;
  x: number; // percentage X on map
  y: number; // percentage Y on map
};

// Simulated data points (clustered around certain areas to show "heat")
const INITIAL_EXPENSES: Expense[] = [
   { id: "e1", amount: 45, category: "Coffee", x: 45, y: 55 },
   { id: "e2", amount: 12, category: "Coffee", x: 46, y: 56 },
   { id: "e3", amount: 15, category: "Coffee", x: 44, y: 54 },
   
   { id: "e4", amount: 120, category: "Groceries", x: 70, y: 30 },
   { id: "e5", amount: 85, category: "Groceries", x: 72, y: 28 },
   
   { id: "e6", amount: 250, category: "Shopping", x: 20, y: 80 },
];

export function SharedExpenseMap({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [isAdding, setIsAdding] = useState(false);
  const [amountInput, setAmountInput] = useState("10");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group nearby expenses into clusters (very basic clustering algorithm)
  const CLUSTER_RADIUS = 8; // percentage units
  const clusters: { x: number, y: number, totalAmount: number, count: number }[] = [];

  expenses.forEach(exp => {
     let addedToCluster = false;
     for (let cluster of clusters) {
        const dx = cluster.x - exp.x;
        const dy = cluster.y - exp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CLUSTER_RADIUS) {
           // Weighted average center
           cluster.x = ((cluster.x * cluster.count) + exp.x) / (cluster.count + 1);
           cluster.y = ((cluster.y * cluster.count) + exp.y) / (cluster.count + 1);
           cluster.totalAmount += exp.amount;
           cluster.count += 1;
           addedToCluster = true;
           break;
        }
     }
     
     if (!addedToCluster) {
        clusters.push({ x: exp.x, y: exp.y, totalAmount: exp.amount, count: 1 });
     }
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (!isAdding) return;
     
     const rect = e.currentTarget.getBoundingClientRect();
     const x = ((e.clientX - rect.left) / rect.width) * 100;
     const y = ((e.clientY - rect.top) / rect.height) * 100;
     
     const amount = parseFloat(amountInput) || 10;
     
     setExpenses(prev => [...prev, {
        id: `e${Date.now()}`,
        amount,
        category: "New Expense",
        x,
        y
     }]);
     
     setIsAdding(false);
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-100"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
         <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl pointer-events-auto">
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-1 flex items-center gap-2">
               <Map size={16} />
               {config.title || "Geo-Budget"}
            </h2>
            <div className="text-3xl font-black tracking-tight text-white flex items-center">
               <DollarSign size={24} className="text-emerald-400" />
               {totalSpent.toLocaleString()}
            </div>
         </div>
         
         <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
               isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
         >
            {isAdding ? <MapPin size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
         </button>
      </div>

      {/* Add Expense HUD */}
      <AnimatePresence>
         {isAdding && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="absolute top-24 right-6 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl pointer-events-auto w-64"
            >
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Amount to Log</label>
               <div className="flex items-center gap-2 bg-black/50 border border-slate-700 rounded-lg p-2 mb-3">
                  <DollarSign size={16} className="text-emerald-400" />
                  <input 
                     type="number"
                     value={amountInput}
                     onChange={(e) => setAmountInput(e.target.value)}
                     className="bg-transparent border-none focus:ring-0 text-white font-bold w-full p-0"
                     autoFocus
                  />
               </div>
               <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-amber-500/10 p-2 rounded animate-pulse">
                  <MousePointerClick size={14} />
                  Tap map to drop pin
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Map Canvas */}
      <div 
         className={`absolute inset-0 z-10 transition-cursor duration-300 ${isAdding ? 'cursor-crosshair' : 'cursor-default'}`}
         onClick={handleMapClick}
      >
         {/* Simulated Map Background (Monochrome City Grid) */}
         <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ 
               backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px), linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", 
               backgroundSize: "20px 20px, 100px 100px, 100px 100px",
               backgroundPosition: "center"
            }} 
         />

         {/* Clusters / Heat Map Dots */}
         <AnimatePresence>
            {clusters.map((cluster, i) => {
               
               // Calculate bubble size based on amount relative to total
               const ratio = cluster.totalAmount / totalSpent;
               const size = Math.max(40, Math.min(200, ratio * 400)); // Clamp between 40px and 200px
               
               return (
                  <motion.div
                     key={`cluster-${i}`}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     layout
                     className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-2xl mix-blend-screen"
                     style={{
                        left: `${cluster.x}%`,
                        top: `${cluster.y}%`,
                        width: size,
                        height: size,
                        backgroundColor: `${primaryColor}80`, // Add some transparency
                        boxShadow: `0 0 ${size/2}px ${primaryColor}`
                     }}
                  >
                     <span className="font-black text-white text-shadow drop-shadow-md" style={{ fontSize: size > 60 ? '1rem' : '0.75rem' }}>
                        ${Math.round(cluster.totalAmount)}
                     </span>
                     {cluster.count > 1 && size > 80 && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                           {cluster.count} Txns
                        </span>
                     )}
                  </motion.div>
               )
            })}
         </AnimatePresence>

         {/* Individual Pins Overlay */}
         {expenses.map((exp) => (
            <div 
               key={exp.id}
               className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
               style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
            >
               <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
            </div>
         ))}

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isAdding && (
         <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => { setIsAdding(true); setAmountInput("45"); }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Start Adding (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
