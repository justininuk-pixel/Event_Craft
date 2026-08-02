"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";

export function TimeZoneSynchronizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  // 1D slider to rotate the Earth
  const [rotation, setRotation] = useState(180);

  // Simplified: 0 to 360 rotation representing 24 hours of Earth relative to Sun
  // 0 deg = Greenwich Noon
  const cities = [
     { name: "Tokyo", offset: 9, id: "tok" },
     { name: "London", offset: 0, id: "lon" },
     { name: "New York", offset: -5, id: "nyc" },
     { name: "Los Angeles", offset: -8, id: "lax" },
  ];

  // A city is in "daylight" (9am to 5pm) if local time is between 9 and 17
  // Rotation 0 to 360 -> Hour 0 to 24 (UTC)
  const utcHour = (rotation / 360) * 24;

  const checkDaylight = (offset: number) => {
     let localHour = (utcHour + offset) % 24;
     if (localHour < 0) localHour += 24;
     // Relaxing the constraint for the demo so an intersection actually exists!
     // e.g. 7am to 10pm (15 hours of light)
     return localHour >= 7 && localHour <= 22; 
  };

  const isAligned = cities.every(c => checkDaylight(c.offset));

  const handleFinish = () => {
     if (isAligned && onComplete) {
        onComplete();
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      {/* The Sun (Fixed light source) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500 rounded-full blur-[150px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2" />

      <div className="p-6 z-10">
         <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Globe2 size={24} className="text-yellow-500" /> Global Sync
         </h2>
         <p className="text-xs text-slate-400 mt-1">Rotate the Earth until all cities are in daylight.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full p-6">
         
         {/* The 2D Map serving as "Globe" */}
         <div className="w-full max-w-sm h-48 bg-slate-800 rounded-3xl overflow-hidden relative border-4 border-slate-700 shadow-2xl mb-12">
            {/* The Sun overlay indicating light */}
            <div 
               className="absolute top-0 bottom-0 w-1/2 bg-yellow-500/20 mix-blend-screen pointer-events-none transition-all duration-75"
               style={{ left: `${((rotation % 360) / 360) * 100}%` }}
            />

            <div className="absolute inset-0 flex items-center justify-between px-4">
               {cities.map((city, i) => {
                  const isDay = checkDaylight(city.offset);
                  // Approximate spatial positioning purely for UI spread
                  const leftPos = `${20 + i * 20}%`;
                  return (
                     <div key={city.id} className="flex flex-col items-center" style={{ position: "absolute", left: leftPos, top: "50%", transform: "translateY(-50%)" }}>
                        <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 shadow-[0_0_10px_currentColor] ${isDay ? 'bg-yellow-400 border-yellow-200 text-yellow-400' : 'bg-slate-700 border-slate-600 text-slate-700'}`} />
                        <div className={`mt-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isDay ? 'text-yellow-100' : 'text-slate-500'}`}>
                           {city.name}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Controls */}
         <div className="w-full max-w-sm space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md text-center">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Earth Rotation</label>
            <input 
               type="range" 
               min="0" max="360" 
               value={rotation} 
               onChange={e => setRotation(Number(e.target.value))}
               className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            
            <div className="text-xs font-mono text-slate-500">
               UTC Time: {Math.floor(utcHour).toString().padStart(2, '0')}:{Math.floor((utcHour % 1) * 60).toString().padStart(2, '0')}
            </div>
         </div>

         {/* Success State */}
         <motion.button 
            onClick={handleFinish}
            animate={{ scale: isAligned ? 1.05 : 1, opacity: isAligned ? 1 : 0.5 }}
            className={`mt-12 w-full max-w-sm py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
               isAligned ? 'bg-emerald-500 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
         >
            {isAligned ? "Lock Schedule" : "Find Alignment"}
         </motion.button>

      </div>

    </div>
  );
}
