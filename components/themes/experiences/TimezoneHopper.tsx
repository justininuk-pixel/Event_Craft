"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TIMEZONES = [
  "Pacific/Midway", // UTC-11
  "Pacific/Honolulu", // UTC-10
  "America/Anchorage", // UTC-9
  "America/Los_Angeles", // UTC-8
  "America/Denver", // UTC-7
  "America/Chicago", // UTC-6
  "America/New_York", // UTC-5
  "America/Caracas", // UTC-4
  "America/Argentina/Buenos_Aires", // UTC-3
  "Atlantic/South_Georgia", // UTC-2
  "Atlantic/Azores", // UTC-1
  "Europe/London", // UTC+0
  "Europe/Paris", // UTC+1
  "Europe/Athens", // UTC+2
  "Europe/Moscow", // UTC+3
  "Asia/Dubai", // UTC+4
  "Asia/Karachi", // UTC+5
  "Asia/Dhaka", // UTC+6
  "Asia/Bangkok", // UTC+7
  "Asia/Hong_Kong", // UTC+8
  "Asia/Tokyo", // UTC+9
  "Australia/Sydney", // UTC+10
  "Pacific/Noumea", // UTC+11
  "Pacific/Auckland", // UTC+12
];

export function TimezoneHopper({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [userTz, setUserTz] = useState("");
  const [targetTz, setTargetTz] = useState("");
  const [simulatedTz, setSimulatedTz] = useState("");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#f8fafc";

  useEffect(() => {
     // Get user timezone
     const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
     setUserTz(localTz);

     // Determine target timezone based on current UTC hour
     const currentUtcHour = new Date().getUTCHours();
     setTargetTz(TIMEZONES[currentUtcHour % 24]);
  }, []);

  const activeTz = simulatedTz || userTz;
  const isUnlocked = activeTz === targetTz && targetTz !== "";

  useEffect(() => {
     if (isUnlocked && onComplete) {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
     }
  }, [isUnlocked, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000 flex flex-col items-center justify-center"
      style={{ backgroundColor: isUnlocked ? bgColors[0] : "#000000" }} 
    >
      <AnimatePresence mode="wait">
         {!isUnlocked ? (
            <motion.div 
               key="locked"
               className="flex flex-col items-center justify-center w-full h-full relative z-10 p-8"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               transition={{ duration: 0.5 }}
            >
               {/* Radar/Globe Graphic */}
               <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-slate-700 relative mb-12 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950" />
                  
                  {/* Grid Lines */}
                  <div className="absolute w-full h-px bg-slate-700/50" />
                  <div className="absolute h-full w-px bg-slate-700/50" />
                  
                  {/* Radar Sweep */}
                  <motion.div 
                     className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tl from-slate-500/20 to-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                     style={{ borderRight: "2px solid rgba(148, 163, 184, 0.5)" }}
                  />

                  <div className="text-4xl">🌍</div>
               </div>

               <h2 className="text-xl md:text-2xl text-slate-300 font-serif mb-8 uppercase tracking-widest text-center">
                  Geographic Lock Engaged
               </h2>
               
               <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-2xl">
                  {/* User Stats */}
                  <div className="flex-1 bg-slate-900 border border-red-900/50 p-6 rounded-xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                     <div className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-bold mb-2">Detected Location</div>
                     <div className="font-mono text-slate-300 break-all">{activeTz || "Scanning..."}</div>
                     <div className="text-xs text-slate-500 mt-2 line-through decoration-red-500">Access Denied</div>
                  </div>

                  {/* Target Stats */}
                  <div className="flex-1 bg-slate-900 border border-emerald-900/50 p-6 rounded-xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                     <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-2">Target Location</div>
                     <div className="font-mono text-slate-300 break-all">{targetTz || "Calculating..."}</div>
                     <div className="text-xs text-slate-500 mt-2">Required for Access</div>
                  </div>
               </div>
               
               <p className="text-slate-600 text-xs max-w-sm mt-8 text-center uppercase tracking-widest font-bold">
                  Hint: The target rotates every hour. Travel, VPN, or spoof your system clock.
               </p>
            </motion.div>
         ) : (
            <motion.div 
               key="unlocked"
               className="flex flex-col items-center justify-center p-8 text-center relative z-20 w-full max-w-2xl"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.5 }}
               style={{ color: textColor }}
            >
               <div className="text-xs font-bold uppercase tracking-[0.4em] mb-8" style={{ color: primaryColor }}>
                  Location Confirmed
               </div>
               
               <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8">
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90 max-w-2xl">
                  {config.body}
               </p>
               
               <div className="mt-16 border px-4 py-2 rounded-full font-mono text-[10px] tracking-widest opacity-50 border-current">
                  System TZ: {activeTz}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isUnlocked && targetTz && (
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-600 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Spoof Timezone
            </h2>
            <select 
               className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-sm p-3 rounded-lg outline-none cursor-pointer"
               value={simulatedTz}
               onChange={(e) => setSimulatedTz(e.target.value)}
            >
               <option value="">-- Select Timezone to Spoof --</option>
               {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>
                     {tz} {tz === targetTz ? "(TARGET)" : ""}
                  </option>
               ))}
            </select>
            <button 
               className="w-full mt-3 bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest py-2 rounded-lg transition-colors border border-indigo-400/50"
               onClick={() => setSimulatedTz(targetTz)}
            >
               Auto-Match Target
            </button>
         </div>
      )}
      
    </div>
  );
}
