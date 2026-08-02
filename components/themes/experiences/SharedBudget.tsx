"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface BudgetItem {
   id: string;
   label: string;
   amount: number;
   color: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const INITIAL_ITEMS: BudgetItem[] = [
   { id: "1", label: "Venue Rental", amount: 250, color: COLORS[0] },
   { id: "2", label: "Catering", amount: 150, color: COLORS[1] },
];

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

export function SharedBudget({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"building" | "finalized">("building");
  const [items, setItems] = useState<BudgetItem[]>(INITIAL_ITEMS);
  const [label, setLabel] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [hasAdded, setHasAdded] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const handleAddItem = (e: React.FormEvent) => {
     e.preventDefault();
     if (!label.trim() || !amountStr) return;
     
     const amount = parseFloat(amountStr);
     if (isNaN(amount) || amount <= 0) return;

     setItems(prev => [
        ...prev, 
        { 
           id: Date.now().toString(), 
           label: label.trim(), 
           amount, 
           color: COLORS[prev.length % COLORS.length] 
        }
     ]);
     setLabel("");
     setAmountStr("");
     setHasAdded(true);
  };

  const handleFinalize = () => {
     setPhase("finalized");
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  let cumulativePercent = 0;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center bg-white p-4"
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
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 w-full max-w-5xl h-full flex flex-col md:flex-row p-4 gap-8"
            >
               {/* Left side: Pie Chart */}
               <div className="flex-1 flex flex-col items-center justify-center">
                  <h1 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-widest text-center">
                     {config.title || "Shared Budget"}
                  </h1>
                  
                  <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl">
                     <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                        {items.map(item => {
                           // calculate slices
                           const percent = item.amount / total;
                           const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                           cumulativePercent += percent;
                           const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                           const largeArcFlag = percent > 0.5 ? 1 : 0;
                           const pathData = [
                              `M ${startX} ${startY}`, // Move
                              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                              `L 0 0`, // Line
                           ].join(' ');

                           // If it's a 100% single slice
                           if (percent === 1) {
                              return (
                                 <circle key={item.id} cx="0" cy="0" r="1" fill={item.color} />
                              );
                           }

                           return (
                              <motion.path
                                 key={item.id}
                                 initial={{ opacity: 0, scale: 0 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 d={pathData}
                                 fill={item.color}
                                 className="transition-all duration-500 ease-out hover:opacity-80 cursor-pointer"
                                 stroke="white"
                                 strokeWidth="0.02"
                              />
                           );
                        })}
                     </svg>
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-inner">
                           <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                           <span className="text-xl font-black text-slate-800">${total.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right side: Ledger & Form */}
               <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl max-h-full overflow-hidden">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Line Items</h2>
                  
                  <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3">
                     <AnimatePresence>
                        {items.map(item => (
                           <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
                           >
                              <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                              <span className="flex-1 font-bold text-slate-700">{item.label}</span>
                              <span className="font-black text-slate-900">${item.amount.toFixed(2)}</span>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>

                  <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                     <input
                        type="text"
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        placeholder="Item (e.g. DJ)"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                     />
                     <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                           type="number"
                           step="0.01"
                           value={amountStr}
                           onChange={e => setAmountStr(e.target.value)}
                           placeholder="0.00"
                           className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-3 font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                     </div>
                     <button
                        type="submit"
                        disabled={!label.trim() || !amountStr}
                        className="bg-slate-800 text-white rounded-xl px-4 py-3 font-bold shadow-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                     >
                        ADD
                     </button>
                  </form>

                  <AnimatePresence>
                     {hasAdded && (
                        <motion.button
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           onClick={handleFinalize}
                           className="w-full py-4 rounded-xl font-black text-lg text-white shadow-xl transition-transform active:scale-95"
                           style={{ backgroundColor: primaryColor }}
                        >
                           FINALIZE BUDGET
                        </motion.button>
                     )}
                  </AnimatePresence>
               </div>
            </motion.div>
         )}

         {phase === "finalized" && (
            <motion.div
               key="finalized"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-10 w-full max-w-md bg-white border border-slate-100 p-10 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 text-4xl">
                  ✓
               </div>
               <h1 className="text-3xl font-black uppercase text-slate-800 mb-2">
                 Budget Locked
               </h1>
               <p className="text-slate-500 font-bold mb-8">
                  Total group target is ${total.toFixed(2)}.
               </p>
               
               <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h2 className="text-xl font-bold mb-2 text-slate-800">
                    {config.title}
                  </h2>
                  <p className="text-slate-600 font-medium">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
