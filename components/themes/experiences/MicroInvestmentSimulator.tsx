"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Coffee, TrendingUp, DollarSign, Target, CalendarDays, Percent } from "lucide-react";

export function MicroInvestmentSimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb"; // blue-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#eff6ff"]; // blue-50

  const habitName = config.title || "Daily Coffee";
  
  const [dailyCost, setDailyCost] = useState<number>(5);
  const [years, setYears] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(7); // Annual return %

  // Calculation
  // Daily contribution -> Monthly contribution approx (daily * 30.4375)
  // Or just compounding daily. Let's compound daily for dramatic effect.
  // A = P(1 + r/n)^(nt) + PMT * [ (1 + r/n)^(nt) - 1 ] / (r/n)
  
  const r = interestRate / 100;
  const n = 365; // daily compound
  const t = years;
  const pmt = dailyCost; // Daily payment

  // Principal (total money put in without interest)
  const totalPrincipal = dailyCost * 365 * years;

  // Total Future Value
  // Using Future Value of a Series formula for daily contributions
  const ratePerPeriod = r / n;
  const totalPeriods = n * t;
  
  let futureValue = 0;
  if (ratePerPeriod > 0) {
     futureValue = pmt * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
  } else {
     futureValue = totalPrincipal; // 0% interest
  }

  const interestEarned = futureValue - totalPrincipal;

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Generate simple graph data
  const numBars = 10;
  const graphData = Array.from({length: numBars}).map((_, i) => {
     const currentYear = (t / (numBars - 1)) * i;
     if (currentYear === 0) return { year: 0, val: 0 };
     const periods = n * currentYear;
     const val = ratePerPeriod > 0 
         ? pmt * ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod)
         : pmt * 365 * currentYear;
     return { year: currentYear, val };
  });

  const maxGraphVal = graphData[numBars - 1].val || 1;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 p-6"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="pt-6 pb-4 text-center z-10 flex flex-col items-center">
         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-inner">
            <Coffee size={32} />
         </div>
         <h2 className="text-2xl font-black tracking-tight mb-2 uppercase" style={{ color: primaryColor }}>
            The Cost of {habitName}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {config.body || "Visualize the power of compound interest"}
         </p>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-lg mx-auto relative z-10">
         
         {/* Main Result Display */}
         <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-50 text-center mb-6 relative overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_#2563eb_2px,_transparent_2px)] bg-[size:20px_20px]" />

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Potential Future Value</h3>
            
            <motion.div 
               key={futureValue}
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-800 mb-4 relative z-10 flex justify-center items-start"
            >
               <span className="text-2xl mt-1 opacity-40 mr-1">$</span>
               {formatCurrency(futureValue).replace('$', '')}
            </motion.div>

            <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-widest relative z-10">
               <div className="flex flex-col items-center">
                  <span className="text-slate-400">Total Spent</span>
                  <span className="text-slate-700">{formatCurrency(totalPrincipal)}</span>
               </div>
               <div className="w-px h-8 bg-slate-200" />
               <div className="flex flex-col items-center">
                  <span className="text-emerald-500">Interest Earned</span>
                  <span className="text-emerald-600">{formatCurrency(interestEarned)}</span>
               </div>
            </div>
         </div>

         {/* Graph */}
         <div className="bg-white/60 backdrop-blur rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex-1 flex flex-col min-h-[150px]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
               <TrendingUp size={14} /> Growth Curve
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-1 w-full pt-4">
               {graphData.map((point, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                     <motion.div 
                        className="w-full rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: primaryColor }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(point.val / maxGraphVal) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                     />
                  </div>
               ))}
            </div>
         </div>

         {/* Controls */}
         <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col gap-4">
            
            {/* Daily Cost */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><DollarSign size={16}/></div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Daily Cost</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatCurrency(dailyCost)} / day</span>
                  </div>
               </div>
               <input 
                  type="range" min="1" max="50" step="1"
                  value={dailyCost} onChange={e => setDailyCost(parseInt(e.target.value))}
                  className="w-32 accent-blue-600"
               />
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Years */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><CalendarDays size={16}/></div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Time Horizon</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{years} Years</span>
                  </div>
               </div>
               <input 
                  type="range" min="5" max="50" step="5"
                  value={years} onChange={e => setYears(parseInt(e.target.value))}
                  className="w-32 accent-blue-600"
               />
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Interest Rate */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Percent size={16}/></div>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-700">Market Return</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{interestRate}% Annual</span>
                  </div>
               </div>
               <input 
                  type="range" min="1" max="15" step="1"
                  value={interestRate} onChange={e => setInterestRate(parseInt(e.target.value))}
                  className="w-32 accent-blue-600"
               />
            </div>

         </div>

         {onComplete && (
            <button 
               onClick={onComplete}
               className="mt-6 py-4 w-full bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-md hover:bg-slate-700 active:scale-95 transition-all"
            >
               Finish
            </button>
         )}

      </div>

    </div>
  );
}
