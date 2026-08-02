"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, CloudRain, Droplets, MapPin, Activity, Bell } from "lucide-react";

type SkinType = { id: string; label: string; safeTimeFactor: number };

const skinTypes: SkinType[] = [
  { id: "type1", label: "Type I (Very Fair)", safeTimeFactor: 10 }, // base minutes before burn at UV 1
  { id: "type2", label: "Type II (Fair)", safeTimeFactor: 15 },
  { id: "type3", label: "Type III (Medium)", safeTimeFactor: 20 },
  { id: "type4", label: "Type IV (Olive)", safeTimeFactor: 30 },
  { id: "type5", label: "Type V (Brown)", safeTimeFactor: 40 },
  { id: "type6", label: "Type VI (Black)", safeTimeFactor: 60 },
];

export function SunscreenReapplicationTimer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const [selectedSkin, setSelectedSkin] = useState<SkinType>(skinTypes[1]);
  const [isFetching, setIsFetching] = useState(false);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
  const [timerActive, setTimerActive] = useState(false);

  const handleStart = () => {
     setIsFetching(true);
     // Simulate API Call for UV Index based on location
     setTimeout(() => {
        const mockUV = Math.floor(Math.random() * 8) + 3; // Random UV between 3 and 10
        setUvIndex(mockUV);
        setIsFetching(false);
        
        // Calculate safe time: (Safe Time Factor * SPF) / UV Index
        // Assuming SPF 30 applied
        const spf = 30;
        const safeMinutes = (selectedSkin.safeTimeFactor * spf) / mockUV;
        // Cap at 120 minutes (2 hours is standard reapplication limit anyway)
        const recommendedMinutes = Math.min(120, Math.floor(safeMinutes));
        
        setTimeLeft(recommendedMinutes * 60);
        setTimerActive(true);
     }, 1500);
  };

  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (timerActive && timeLeft !== null && timeLeft > 0) {
        interval = setInterval(() => {
           setTimeLeft(prev => prev !== null ? prev - 1 : null);
        }, 1000);
     } else if (timerActive && timeLeft === 0) {
        if (onComplete) onComplete();
     }
     return () => clearInterval(interval);
  }, [timerActive, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     const s = seconds % 60;
     
     if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
     }
     return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Decorative Sun */}
      <motion.div 
         className="absolute -top-32 -right-32 text-amber-400 opacity-20 pointer-events-none"
         animate={{ rotate: 360 }}
         transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
         <Sun size={400} />
      </motion.div>

      {/* Header */}
      <div className="pt-12 px-6 pb-6 relative z-10">
         <h2 className="text-3xl font-black tracking-tight mb-2 uppercase" style={{ color: primaryColor }}>
            {config.title || "Solar Shield"}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-[200px]">
            {config.body || "Environmental UV protection tracking"}
         </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto">
         
         <AnimatePresence mode="wait">
            {!timerActive && !isFetching ? (
               // SETUP SCREEN
               <motion.div 
                  key="setup"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full flex flex-col items-center"
               >
                  
                  <div className="bg-white rounded-3xl p-6 shadow-xl w-full border-2 border-amber-100 mb-8">
                     <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-amber-500" /> Select Skin Type
                     </h3>
                     <div className="flex flex-col gap-2">
                        {skinTypes.map(type => (
                           <button
                              key={type.id}
                              onClick={() => setSelectedSkin(type)}
                              className={`py-3 px-4 rounded-xl text-left font-bold text-sm transition-all border-2 ${
                                 selectedSkin.id === type.id 
                                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm' 
                                    : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                              }`}
                           >
                              {type.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button
                     onClick={handleStart}
                     className="w-full py-5 rounded-2xl font-black text-white text-xl uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                     style={{ backgroundColor: primaryColor }}
                  >
                     <MapPin size={20} /> Detect UV & Start
                  </button>

               </motion.div>
            ) : isFetching ? (
               // FETCHING SCREEN
               <motion.div 
                  key="fetching"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center justify-center py-12"
               >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
                     <Sun size={64} className="text-amber-500" />
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Connecting to Weather API...</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching local UV Index</p>
               </motion.div>
            ) : (
               // TIMER SCREEN
               <motion.div 
                  key="timer"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center"
               >
                  
                  <div className="flex gap-4 w-full mb-8">
                     <div className="flex-1 bg-white rounded-3xl p-4 shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Sun size={24} className="text-amber-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Live UV Index</span>
                        <span className="text-3xl font-black text-slate-800">{uvIndex}</span>
                     </div>
                     <div className="flex-1 bg-white rounded-3xl p-4 shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Droplets size={24} className="text-emerald-500 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">SPF Assumed</span>
                        <span className="text-3xl font-black text-slate-800">30</span>
                     </div>
                  </div>

                  {/* Circular Timer Visual */}
                  <div className="relative w-64 h-64 mb-8">
                     {/* Base Circle */}
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <motion.circle 
                           cx="128" cy="128" r="110" 
                           stroke={primaryColor} strokeWidth="12" fill="transparent" strokeLinecap="round"
                           strokeDasharray={2 * Math.PI * 110}
                           initial={{ strokeDashoffset: 0 }}
                           animate={{ strokeDashoffset: timeLeft !== null ? (2 * Math.PI * 110) * (1 - (timeLeft / (120 * 60))) : 0 }} // Assuming 120 max
                           transition={{ duration: 1 }}
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black tabular-nums tracking-tight text-slate-800">
                           {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 flex items-center gap-1">
                           <Bell size={12} /> Until Burn Risk
                        </span>
                     </div>
                  </div>

                  <button
                     onClick={() => { setTimerActive(false); setTimeLeft(null); setUvIndex(null); }}
                     className="px-8 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                  >
                     Cancel Timer
                  </button>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && timerActive && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setTimeLeft(3)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Fast Forward
            </button>
         </div>
      )}

    </div>
  );
}
