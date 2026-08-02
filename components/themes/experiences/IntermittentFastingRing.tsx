"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Clock, Activity, Utensils, Moon } from "lucide-react";

export function IntermittentFastingRing({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // emerald-50

  // We'll use 24h format for logic. 0 = Midnight, 12 = Noon
  // Default window: 12 PM to 8 PM (12 to 20)
  const [startHour, setStartHour] = useState(12); 
  const [endHour, setEndHour] = useState(20);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
     const interval = setInterval(() => setCurrentTime(new Date()), 1000);
     return () => clearInterval(interval);
  }, []);

  // For Demo purposes, let's allow overriding the current time to test the UI
  const [demoHourOffset, setDemoHourOffset] = useState(0);

  const effectiveTime = new Date(currentTime.getTime() + demoHourOffset * 60 * 60 * 1000);
  const currentH = effectiveTime.getHours();
  const currentM = effectiveTime.getMinutes();
  const currentFloat = currentH + (currentM / 60);

  const isEating = (startHour < endHour) 
     ? (currentFloat >= startHour && currentFloat < endHour)
     : (currentFloat >= startHour || currentFloat < endHour); // crosses midnight

  // Calculate time remaining
  let nextEventTime = isEating ? endHour : startHour;
  let diff = nextEventTime - currentFloat;
  if (diff < 0) diff += 24;
  
  const hoursRemaining = Math.floor(diff);
  const minsRemaining = Math.floor((diff - hoursRemaining) * 60);

  // SVG Math
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  
  // Angle for start (0 is at top, 12 o'clock, which is 0 hours in 24h clock)
  // 1 hour = 360 / 24 = 15 degrees
  const getAngle = (h: number) => (h * 15) - 90; // -90 to start at top

  // We create an SVG arc using dasharray/dashoffset by calculating the length of the arc
  let arcHours = endHour - startHour;
  if (arcHours < 0) arcHours += 24;
  const arcLength = (arcHours / 24) * circumference;
  const dashArray = `${arcLength} ${circumference}`;
  const dashOffset = 0; // We rotate the whole SVG or circle instead to start at startHour

  const formatTime = (h: number) => {
     const period = h >= 12 ? 'PM' : 'AM';
     const h12 = h % 12 || 12;
     return `${h12} ${period}`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="pt-12 px-6 pb-6 text-center z-10">
         <h2 className="text-2xl font-black tracking-tight mb-2 uppercase flex items-center justify-center gap-2" style={{ color: primaryColor }}>
            <Activity size={24} /> {config.title || "Zero Tracker"}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {config.body || "Intermittent Fasting Schedule"}
         </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
         
         {/* State Label */}
         <div className={`mb-8 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-sm border ${
            isEating ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
         }`}>
            {isEating ? <Utensils size={16} /> : <Moon size={16} />}
            {isEating ? "Eating Window" : "Fasting"}
         </div>

         {/* 24-Hour Ring SVG */}
         <div className="relative w-72 h-72 mb-12">
            
            {/* Background Ring (Fasting) */}
            <svg className="w-full h-full">
               <circle cx="144" cy="144" r={radius} stroke="#e2e8f0" strokeWidth="24" fill="transparent" />
            </svg>
            
            {/* Foreground Arc (Eating) */}
            <svg className="w-full h-full absolute top-0 left-0">
               <circle 
                  cx="144" cy="144" r={radius} 
                  stroke={primaryColor} 
                  strokeWidth="24" 
                  fill="transparent" 
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={{ transformOrigin: 'center', transform: `rotate(${getAngle(startHour)}deg)` }}
               />
            </svg>

            {/* Dial Ticks (24 hours) */}
            <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
               {Array.from({length: 24}).map((_, i) => (
                  <line 
                     key={i}
                     x1="144" y1="36" x2="144" y2="44" 
                     stroke="#cbd5e1" strokeWidth={i % 6 === 0 ? "3" : "1"}
                     style={{ transformOrigin: 'center', transform: `rotate(${i * 15}deg)` }}
                  />
               ))}
            </svg>

            {/* Current Time Dot */}
            <motion.div 
               className="absolute top-0 left-0 w-full h-full pointer-events-none"
               style={{ rotate: (currentFloat * 15) }}
            >
               <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-lg" style={{ borderColor: isEating ? primaryColor : '#6366f1' }} />
            </motion.div>

            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">
                  Time until {isEating ? 'fasting' : 'eating'}
               </span>
               <span className="text-4xl font-black tracking-tighter" style={{ color: isEating ? primaryColor : '#6366f1' }}>
                  {hoursRemaining}h {minsRemaining}m
               </span>
               <span className="text-slate-500 font-bold text-xs mt-2 flex items-center gap-1">
                  <Clock size={12} /> {effectiveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
         </div>

         {/* Controls */}
         <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-emerald-50 flex gap-4">
            <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Start Eating</label>
               <select 
                  value={startHour} 
                  onChange={e => setStartHour(parseInt(e.target.value))}
                  className="bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-700 outline-none"
               >
                  {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{formatTime(i)}</option>)}
               </select>
            </div>
            <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Start Fasting</label>
               <select 
                  value={endHour} 
                  onChange={e => setEndHour(parseInt(e.target.value))}
                  className="bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-700 outline-none"
               >
                  {Array.from({length: 24}).map((_, i) => <option key={i} value={i}>{formatTime(i)}</option>)}
               </select>
            </div>
         </div>
         
         <div className="mt-4 text-center text-xs font-bold text-slate-400">
            Current Schedule: <span className="text-slate-700">{24 - arcHours}:{arcHours}</span>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
            <button 
               onClick={() => setDemoHourOffset(prev => prev + 1)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               +1 Hour
            </button>
            <button 
               onClick={() => setDemoHourOffset(prev => prev - 1)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               -1 Hour
            </button>
         </div>
      )}

    </div>
  );
}
