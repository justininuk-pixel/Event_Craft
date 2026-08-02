"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, TrendingDown, TrendingUp, Search } from "lucide-react";

type Subscription = {
  id: string;
  name: string;
  monthlyCost: number;
  active: boolean;
};

const MOCK_SUBSCRIPTIONS: Subscription[] = [
   { id: "s1", name: "Netflix", monthlyCost: 15.99, active: true },
   { id: "s2", name: "Spotify Premium", monthlyCost: 10.99, active: true },
   { id: "s3", name: "Gym Membership", monthlyCost: 49.99, active: true },
   { id: "s4", name: "Amazon Prime", monthlyCost: 14.99, active: true },
   { id: "s5", name: "Cloud Storage", monthlyCost: 2.99, active: true },
   { id: "s6", name: "Meal Kit Delivery", monthlyCost: 79.99, active: true },
   { id: "s7", name: "Patreon", monthlyCost: 5.00, active: true },
];

export function SubscriptionAuditor({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // purple
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [subs, setSubs] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);

  // Derive stats
  const { totalAnnual, totalMonthly, savingsAnnual } = useMemo(() => {
     let tMonthly = 0;
     let sAnnual = 0;
     
     subs.forEach(s => {
        if (s.active) {
           tMonthly += s.monthlyCost;
        } else {
           sAnnual += s.monthlyCost * 12;
        }
     });

     return {
        totalMonthly: tMonthly,
        totalAnnual: tMonthly * 12,
        savingsAnnual: sAnnual
     };
  }, [subs]);

  // Completion criteria: Cancel at least 2 subscriptions
  useEffect(() => {
     const inactiveCount = subs.filter(s => !s.active).length;
     if (inactiveCount >= 2 && onComplete) {
        onComplete();
     }
  }, [subs, onComplete]);

  const toggleSubscription = (id: string) => {
     setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)", backgroundSize: "20px 20px" }} 
      />

      <div className="w-full max-w-lg mx-auto flex flex-col h-full z-10 sm:border-x sm:border-slate-200 bg-white">
         
         {/* Top Dashboard */}
         <div className="p-8 bg-slate-900 text-white relative overflow-hidden flex-shrink-0">
            {/* Glow effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ backgroundColor: primaryColor }} />
            
            <div className="relative z-10">
               <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <Search size={16} />
                  {config.title || "Subscription Auditor"}
               </h2>

               <div className="flex flex-col gap-1 mb-8">
                  <span className="text-slate-400 font-medium">Projected Yearly Cost</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black tracking-tighter">
                        ${totalAnnual.toFixed(2)}
                     </span>
                     <span className="text-xl text-slate-500 font-medium">/yr</span>
                  </div>
                  <span className="text-sm text-slate-400">
                     That's <strong className="text-white">${totalMonthly.toFixed(2)}</strong> every month.
                  </span>
               </div>

               {/* Savings Counter */}
               <AnimatePresence>
                  {savingsAnnual > 0 && (
                     <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between overflow-hidden"
                     >
                        <div className="flex items-center gap-3 text-emerald-400">
                           <TrendingDown size={24} />
                           <span className="font-bold">Potential Savings</span>
                        </div>
                        <motion.span 
                           key={savingsAnnual}
                           initial={{ scale: 1.2, color: "#fff" }}
                           animate={{ scale: 1, color: "#34d399" }}
                           className="text-2xl font-black text-emerald-400"
                        >
                           ${savingsAnnual.toFixed(2)}
                        </motion.span>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         {/* List */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
               Active Services
            </div>
            
            <AnimatePresence>
               {subs.map(sub => (
                  <motion.div 
                     layout
                     key={sub.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        sub.active 
                           ? 'bg-white border-slate-200 shadow-sm'
                           : 'bg-slate-100 border-slate-200 opacity-60'
                     }`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                           sub.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                        }`}>
                           <CreditCard size={20} />
                        </div>
                        
                        <div className="flex flex-col">
                           <span className={`font-bold ${sub.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                              {sub.name}
                           </span>
                           <span className="text-xs font-medium text-slate-500">
                              ${sub.monthlyCost.toFixed(2)} / mo
                           </span>
                        </div>
                     </div>
                     
                     {/* Toggle Switch */}
                     <button
                        onClick={() => toggleSubscription(sub.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                           sub.active ? 'bg-indigo-500' : 'bg-slate-300'
                        }`}
                        style={{ backgroundColor: sub.active ? primaryColor : undefined }}
                     >
                        <motion.div 
                           layout
                           className="w-4 h-4 bg-white rounded-full shadow-sm"
                           animate={{
                              x: sub.active ? 24 : 0
                           }}
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                     </button>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && subs.filter(s => !s.active).length < 2 && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setSubs(prev => prev.map((s, i) => i < 2 ? { ...s, active: false } : s));
               }}
               className="bg-black/20 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded shadow-sm hover:bg-black/30 transition-colors border border-white/10"
            >
               Cancel Two (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
