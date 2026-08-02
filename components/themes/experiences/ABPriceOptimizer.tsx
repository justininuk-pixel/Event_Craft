"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { LineChart, Search } from "lucide-react";

export function ABPriceOptimizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  // Willingness to pay survey data (synthetic)
  const surveyData = [
     5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 
     10, 10, 10, 10, 10, 10, 10, 10, 
     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
     20, 20, 20, 20, 20, 
     25, 25, 25, 25, 
     30, 30, 30, 
     40, 40,
     50
  ];

  const possiblePrices = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  const [analyzed, setAnalyzed] = useState(false);

  const calculateCurve = () => {
     const data = possiblePrices.map(price => {
        const volume = surveyData.filter(willing => willing >= price).length;
        const revenue = volume * price;
        return { price, volume, revenue };
     });
     
     const maxRevenue = Math.max(...data.map(d => d.revenue));
     const apex = data.find(d => d.revenue === maxRevenue);

     return { data, maxRevenue, apex };
  };

  const { data, maxRevenue, apex } = calculateCurve();

  const handleAnalyze = () => {
     setAnalyzed(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 100, 20]);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 pb-2 text-center z-10 flex flex-col items-center">
         <div className="bg-slate-100 p-3 rounded-full text-blue-600 mb-2">
            <LineChart size={24} />
         </div>
         <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Price Optimizer</h2>
         <p className="text-xs text-slate-500 mt-1 font-medium">Finding the perfect intersection of Volume and Revenue.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-6 w-full">
         
         {!analyzed ? (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-sm">
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left space-y-4">
                  <h3 className="font-bold text-slate-700">Survey Data</h3>
                  <div className="flex justify-between text-sm text-slate-500 border-b pb-2">
                     <span>Respondents</span>
                     <span className="font-mono">{surveyData.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 border-b pb-2">
                     <span>Price Range</span>
                     <span className="font-mono">$5 - $50</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                     <span>Product</span>
                     <span className="font-mono">Digital E-Book</span>
                  </div>
               </div>

               <button 
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl flex justify-center items-center gap-2 transition-all active:scale-95"
               >
                  <Search size={18} /> Analyze Apex
               </button>
            </motion.div>
         ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Optimal Price Found</div>
                  <div className="text-5xl font-black text-slate-800">${apex?.price}</div>
                  <div className="text-sm text-slate-500 mt-2">Maximized Revenue: <span className="font-bold text-emerald-600">${apex?.revenue}</span></div>
               </div>

               <div className="p-6 h-64 flex items-end gap-1">
                  {data.map((d, i) => {
                     const isApex = d.price === apex?.price;
                     const heightPct = (d.revenue / maxRevenue) * 100;
                     
                     return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                           {/* Hover Info */}
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                              ${d.revenue} rev
                           </div>
                           
                           <motion.div 
                              className={`w-full rounded-t-sm transition-all ${isApex ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-200 hover:bg-slate-300'}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 1, delay: i * 0.05, type: "spring" }}
                           />
                           <span className={`text-[8px] font-mono mt-2 ${isApex ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>${d.price}</span>
                        </div>
                     )
                  })}
               </div>
            </motion.div>
         )}

      </div>

    </div>
  );
}
