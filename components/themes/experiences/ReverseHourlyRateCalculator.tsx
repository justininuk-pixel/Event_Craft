"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Calendar, Umbrella, Briefcase, TrendingUp } from "lucide-react";

export function ReverseHourlyRateCalculator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0fdf4"]; // emerald-50

  const [desiredTakeHome, setDesiredTakeHome] = useState<number>(80000); // Annual net
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(1000);  // Business overhead
  const [weeksVacation, setWeeksVacation] = useState<number>(4);         // Weeks off per year
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25); // Actual client work
  const [taxRate, setTaxRate] = useState<number>(25); // Estimated tax bracket %

  // Calculate the required hourly rate
  const calculation = useMemo(() => {
     // 1. Calculate Gross Required
     // If Net = Gross * (1 - taxRate/100)
     // Then Gross = Net / (1 - taxRate/100)
     const requiredGrossForPersonal = desiredTakeHome / (1 - (taxRate / 100));
     
     // 2. Add Business Expenses to get Total Required Revenue
     const annualBusinessExpenses = monthlyExpenses * 12;
     const totalRequiredRevenue = requiredGrossForPersonal + annualBusinessExpenses;
     
     // 3. Calculate Billable Hours per Year
     const workingWeeks = 52 - weeksVacation;
     const totalBillableHours = workingWeeks * billableHoursPerWeek;
     
     // 4. Calculate Hourly Rate
     const hourlyRate = totalRequiredRevenue / (totalBillableHours || 1);
     
     return {
        requiredGrossForPersonal,
        annualBusinessExpenses,
        totalRequiredRevenue,
        workingWeeks,
        totalBillableHours,
        hourlyRate
     };
  }, [desiredTakeHome, monthlyExpenses, weeksVacation, billableHoursPerWeek, taxRate]);

  // Trigger completion if they've played with the inputs
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
     if (hasInteracted && onComplete) {
        // Debounce the complete trigger slightly
        const timer = setTimeout(() => {
           onComplete();
        }, 3000);
        return () => clearTimeout(timer);
     }
  }, [hasInteracted, onComplete]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
     const parsed = parseInt(value, 10);
     if (!isNaN(parsed)) {
        setter(Math.max(0, parsed));
        setHasInteracted(true);
     } else if (value === "") {
        setter(0);
     }
  };

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-emerald-950"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
      />

      <div className="w-full max-w-4xl mx-auto flex flex-col h-full z-10 p-6 md:p-12 relative">
         
         <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 flex items-center justify-center gap-3">
               <Calculator size={36} style={{ color: primaryColor }} />
               {config.title || "True Rate Calculator"}
            </h2>
            <p className="text-emerald-700/70 font-bold uppercase tracking-widest text-sm max-w-xl mx-auto">
               {config.body || "Reverse-engineer your ideal lifestyle to find exactly what you need to charge per hour."}
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Form Inputs (Left side on desktop) */}
            <div className="lg:col-span-7 space-y-6">
               <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6 relative overflow-hidden">
                  
                  {/* Subtle Top Gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />

                  <h3 className="font-bold text-lg border-b border-emerald-100 pb-2 mb-4">Your Lifestyle Goals</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                           <DollarSign size={14} /> Annual Take-Home (Net)
                        </label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                           <input 
                              type="number" 
                              value={desiredTakeHome || ""}
                              onChange={(e) => handleChange(setDesiredTakeHome, e.target.value)}
                              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 pl-8 pr-4 font-black text-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                           />
                        </div>
                        <p className="text-[10px] text-emerald-500 font-medium leading-tight">After taxes. What goes into your personal bank account.</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                           <Briefcase size={14} /> Biz Expenses (Monthly)
                        </label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                           <input 
                              type="number" 
                              value={monthlyExpenses || ""}
                              onChange={(e) => handleChange(setMonthlyExpenses, e.target.value)}
                              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 pl-8 pr-4 font-black text-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                           />
                        </div>
                        <p className="text-[10px] text-emerald-500 font-medium leading-tight">Software, marketing, equipment, etc.</p>
                     </div>
                  </div>

                  <h3 className="font-bold text-lg border-b border-emerald-100 pb-2 mb-4 pt-4">Your Time & Taxes</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                           <Calendar size={14} /> Billable Hrs / Week
                        </label>
                        <input 
                           type="number" 
                           value={billableHoursPerWeek || ""}
                           onChange={(e) => handleChange(setBillableHoursPerWeek, e.target.value)}
                           className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 font-black text-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <p className="text-[10px] text-emerald-500 font-medium leading-tight">Actual time charging clients (usually 50-60% of total work time).</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                           <Umbrella size={14} /> Weeks Off / Year
                        </label>
                        <input 
                           type="number" 
                           value={weeksVacation || ""}
                           onChange={(e) => handleChange(setWeeksVacation, e.target.value)}
                           className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 font-black text-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <p className="text-[10px] text-emerald-500 font-medium leading-tight">Vacation, sick days, holidays.</p>
                     </div>
                  </div>

                  <div className="pt-4">
                     <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Est. Tax Bracket ({taxRate}%)</span>
                     </label>
                     <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={taxRate}
                        onChange={(e) => { setTaxRate(parseInt(e.target.value)); setHasInteracted(true); }}
                        className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                     />
                  </div>

               </div>
            </div>

            {/* Results Panel (Right side on desktop) */}
            <div className="lg:col-span-5 relative">
               <motion.div 
                  className="bg-emerald-900 text-white p-8 rounded-3xl shadow-2xl sticky top-8"
                  animate={hasInteracted ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.3 }}
               >
                  <div className="text-center mb-8">
                     <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Your Minimum Hourly Rate</p>
                     <div className="text-6xl font-black tracking-tighter tabular-nums flex items-start justify-center gap-1">
                        <span className="text-3xl mt-2 text-emerald-500">$</span>
                        {calculation.hourlyRate === Infinity || isNaN(calculation.hourlyRate) ? "0" : Math.ceil(calculation.hourlyRate)}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                        <span className="text-emerald-300 font-medium text-sm">Total Revenue Needed</span>
                        <span className="font-bold text-lg">{formatCurrency(calculation.totalRequiredRevenue)}</span>
                     </div>
                     <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                        <span className="text-emerald-300 font-medium text-sm">Gross Personal Income</span>
                        <span className="font-bold">{formatCurrency(calculation.requiredGrossForPersonal)}</span>
                     </div>
                     <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                        <span className="text-emerald-300 font-medium text-sm">Taxes Paid</span>
                        <span className="font-bold text-red-300">-{formatCurrency(calculation.requiredGrossForPersonal - desiredTakeHome)}</span>
                     </div>
                     <div className="flex justify-between items-center py-3 border-b border-emerald-800">
                        <span className="text-emerald-300 font-medium text-sm">Biz Expenses Paid</span>
                        <span className="font-bold text-red-300">-{formatCurrency(calculation.annualBusinessExpenses)}</span>
                     </div>
                     
                     <div className="pt-4 bg-emerald-950 -mx-8 px-8 pb-2 rounded-b-3xl">
                        <p className="text-xs text-emerald-500 font-medium leading-relaxed flex items-start gap-2">
                           <TrendingUp size={16} className="shrink-0 mt-0.5" />
                           To achieve your goal of {formatCurrency(desiredTakeHome)} net, you must invoice {calculation.totalBillableHours} hours this year at ~${Math.ceil(calculation.hourlyRate)}/hr.
                        </p>
                     </div>
                  </div>
               </motion.div>
            </div>

         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !hasInteracted && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto font-sans">
            <button 
               onClick={() => { setDesiredTakeHome(120000); setHasInteracted(true); }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               Trigger Change (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
