"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Compass, Image as ImageIcon } from "lucide-react";

type LocationMemory = {
   id: string;
   year: number;
   locationName: string;
   x: number; // mock longitude-ish (0-100)
   y: number; // mock latitude-ish (0-100)
   image: string;
   memory: string;
};

const defaultLocations: LocationMemory[] = [
   { id: "1", year: 2010, locationName: "New York", x: 25, y: 35, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400&auto=format&fit=crop", memory: "First time in the big city." },
   { id: "2", year: 2015, locationName: "London", x: 48, y: 30, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop", memory: "Studying abroad, constant rain." },
   { id: "3", year: 2020, locationName: "Tokyo", x: 85, y: 40, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=400&auto=format&fit=crop", memory: "Neon lights and endless food." },
   { id: "4", year: 2024, locationName: "Sydney", x: 90, y: 75, image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=400&auto=format&fit=crop", memory: "Settling down by the harbor." },
];

export function GeographicalTimelineSlider({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const locations = (config.experience as any)?.locations || defaultLocations;
  const sortedLocations = useMemo(() => [...locations].sort((a, b) => a.year - b.year), [locations]);
  
  const minYear = sortedLocations[0].year;
  const maxYear = sortedLocations[sortedLocations.length - 1].year;

  const [currentYear, setCurrentYear] = useState<number>(minYear);

  // Find the active location based on current year (closest past/current year)
  const activeLocation = useMemo(() => {
     let best = sortedLocations[0];
     for (let loc of sortedLocations) {
        if (loc.year <= currentYear) {
           best = loc;
        }
     }
     return best;
  }, [currentYear, sortedLocations]);

  // For the camera pan effect, we translate the map so the active pin is near the center
  const cameraX = 50 - activeLocation.x;
  const cameraY = 50 - activeLocation.y;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Top Half: The Map */}
      <div className="flex-1 relative overflow-hidden bg-slate-900 border-b border-white/10 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)]">
         
         {/* Decorative Grid / Compass */}
         <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
         <Compass size={120} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-slate-400" />

         {/* The Movable Map Canvas */}
         <motion.div 
            className="absolute inset-0 transition-transform duration-1000 ease-in-out"
            animate={{ x: `${cameraX}%`, y: `${cameraY}%` }}
         >
            {/* World Map Mock (Just dots representing continents loosely) */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 opacity-30 text-emerald-600/50 fill-current" preserveAspectRatio="none">
               <circle cx="20" cy="30" r="10" />
               <circle cx="25" cy="45" r="8" />
               <circle cx="50" cy="30" r="6" />
               <circle cx="55" cy="50" r="9" />
               <circle cx="80" cy="35" r="12" />
               <circle cx="85" cy="65" r="7" />
            </svg>
            
            {/* Connection Path */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 overflow-visible pointer-events-none" preserveAspectRatio="none">
               <motion.path 
                  d={`M ${sortedLocations.map(l => `${l.x} ${l.y}`).join(' L ')}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                  strokeDasharray="1 1"
               />
            </svg>

            {/* Pins */}
            {sortedLocations.map((loc) => {
               const isActive = loc.id === activeLocation.id;
               const isPast = loc.year <= currentYear;
               
               return (
                  <div 
                     key={loc.id}
                     className="absolute w-8 h-8 -ml-4 -mt-8 flex flex-col items-center justify-end"
                     style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  >
                     <motion.div
                        animate={{ scale: isActive ? 1.5 : (isPast ? 1 : 0.8), opacity: isPast ? 1 : 0.4 }}
                     >
                        <MapPin 
                           size={24} 
                           fill={isActive ? primaryColor : (isPast ? "rgba(255,255,255,0.8)" : "transparent")} 
                           stroke={isActive ? primaryColor : "rgba(255,255,255,0.8)"}
                           className={isActive ? "drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" : ""}
                        />
                     </motion.div>
                     
                     <AnimatePresence>
                        {isActive && (
                           <motion.div 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute top-full mt-1 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 whitespace-nowrap z-50 text-xs font-bold"
                           >
                              {loc.locationName}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               );
            })}
         </motion.div>
         
         <div className="absolute top-6 left-6 pointer-events-none">
            <h2 className="text-xl font-black tracking-widest uppercase drop-shadow-md">
               {config.title || "Geo-Timeline"}
            </h2>
         </div>
      </div>

      {/* Bottom Half: Panel & Slider */}
      <div className="h-64 bg-slate-800 p-6 flex flex-col relative z-20">
         
         {/* Memory Panel */}
         <div className="flex-1 flex items-center gap-6 mb-6 h-32">
            <AnimatePresence mode="wait">
               <motion.div 
                  key={activeLocation.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-1 items-center gap-6 h-full"
               >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/10 shrink-0 bg-slate-700 flex items-center justify-center">
                     {activeLocation.image ? (
                        <img src={activeLocation.image} alt={activeLocation.locationName} className="w-full h-full object-cover" />
                     ) : (
                        <ImageIcon size={32} className="text-slate-500" />
                     )}
                  </div>
                  
                  <div className="flex flex-col justify-center">
                     <div className="text-sm font-bold text-slate-400 mb-1">{activeLocation.year}</div>
                     <h3 className="text-2xl font-serif italic mb-2" style={{ color: primaryColor }}>{activeLocation.locationName}</h3>
                     <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                        {activeLocation.memory}
                     </p>
                  </div>
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Timeline Slider */}
         <div className="w-full relative px-4 mt-auto pb-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 px-1">
               <span>{minYear}</span>
               <span>{maxYear}</span>
            </div>
            
            <input 
               type="range" 
               min={minYear} 
               max={maxYear} 
               value={currentYear}
               onChange={(e) => setCurrentYear(Number(e.target.value))}
               onPointerUp={() => { if (onComplete && currentYear === maxYear) onComplete(); }}
               className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-ew-resize accent-amber-500 outline-none"
               style={{ 
                  accentColor: primaryColor,
                  background: `linear-gradient(to right, ${primaryColor} ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, rgb(51 65 85) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%)`
               }}
            />
            
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-white text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-xl pointer-events-none flex items-center gap-2">
               <Calendar size={14} /> {currentYear}
            </div>
         </div>

      </div>

    </div>
  );
}
