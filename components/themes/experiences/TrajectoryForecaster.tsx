"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Flag, ArrowRight } from "lucide-react";

export function TrajectoryForecaster({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [current, setCurrent] = useState(1000);
  const [goal, setGoal] = useState(10000);
  const [monthly, setMonthly] = useState(200);
  const [forecastDate, setForecastDate] = useState<string | null>(null);

  const calculateForecast = () => {
     if (monthly <= 0) return;
     
     const diff = goal - current;
     if (diff <= 0) {
        setForecastDate("You already hit it!");
        return;
     }

     const monthsNeeded = Math.ceil(diff / monthly);
     const date = new Date();
     date.setMonth(date.getMonth() + monthsNeeded);
     
     const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
     setForecastDate(formattedDate);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-100 z-10 flex items-center justify-between">
         <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Trajectory Forecaster</h2>
         <Flag size={20} className="text-blue-500" />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
         
         {/* Form area */}
         <div className="p-6 space-y-6">
            <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Savings</label>
               <div className="flex items-center text-3xl font-black">
                  <span className="text-slate-400 mr-1">$</span>
                  <input type="number" value={current} onChange={e => setCurrent(Number(e.target.value))} className="bg-transparent outline-none w-full" />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Goal</label>
               <div className="flex items-center text-3xl font-black">
                  <span className="text-slate-400 mr-1">$</span>
                  <input type="number" value={goal} onChange={e => setGoal(Number(e.target.value))} className="bg-transparent outline-none w-full text-blue-600" />
               </div>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-6">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Monthly Deposit</label>
               <div className="flex items-center text-xl font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-400 mr-1">$</span>
                  <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="bg-transparent outline-none w-full" />
                  <span className="text-sm font-medium text-slate-400 ml-2">/mo</span>
               </div>
            </div>

            <button 
               onClick={calculateForecast}
               className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
            >
               Forecast Future <ArrowRight size={18} />
            </button>
         </div>

         {/* Visual Output */}
         <div className="flex-1 relative bg-slate-50 border-t border-slate-200 p-6 flex flex-col justify-end overflow-hidden">
            
            {/* The line projecting forward */}
            {forecastDate && (
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.line 
                     x1="0" y1="100%" 
                     x2="80%" y2="20%" 
                     stroke="#3b82f6" strokeWidth="4" strokeDasharray="8,8"
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 1, ease: "easeInOut" }}
                  />
                  <motion.circle 
                     cx="80%" cy="20%" r="6" fill="#3b82f6"
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 1, type: "spring" }}
                  />
               </svg>
            )}

            {/* The Output Box */}
            {forecastDate && (
               <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 relative z-20 mb-8 max-w-sm mx-auto w-full text-center"
               >
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">You will reach ${goal.toLocaleString()} on</p>
                  <h3 className="text-2xl font-black text-blue-600 leading-tight">{forecastDate}</h3>
                  <p className="text-sm text-slate-400 mt-4 italic font-serif">Assuming discipline remains constant.</p>
               </motion.div>
            )}

         </div>

      </div>

    </div>
  );
}
