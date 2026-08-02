"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Clock } from "lucide-react";

export function TimeLapseSlider({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [currentYear, setCurrentYear] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  // Mock timeline data
  const eras = [
    { year: 1990, title: "The Empty Lot", text: "Before anything was here, there was just an empty lot where the neighborhood kids played baseball.", mapScale: 0.1, buildings: 0 },
    { year: 1995, title: "Breaking Ground", text: "The first foundation was poured. People complained about the noise, but progress couldn't be stopped.", mapScale: 0.3, buildings: 1 },
    { year: 2000, title: "The Expansion", text: "Three more blocks were added to the grid. It was starting to feel like a real community.", mapScale: 0.6, buildings: 4 },
    { year: 2010, title: "The Tech Boom", text: "Glass towers replaced the brick facades. The skyline changed overnight.", mapScale: 0.8, buildings: 8 },
    { year: 2025, title: "The Modern City", text: "A sprawling metropolis. Looking back, it's hard to believe it all started with a single empty lot.", mapScale: 1.0, buildings: 15 }
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = parseInt(e.target.value, 10);
     setCurrentYear(val);
     
     if (val === eras.length - 1 && !hasReachedEnd) {
        setHasReachedEnd(true);
        if (onComplete) onComplete();
     }
  };

  const currentEra = eras[currentYear];

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans select-none overflow-hidden"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* The Map (Visual Representation) */}
      <div className="flex-1 w-full relative bg-[#e2e8f0] overflow-hidden">
         {/* Base Grid */}
         <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)", backgroundSize: "20px 20px" }}
         />
         
         <div className="absolute inset-0 flex items-center justify-center p-8">
            <motion.div 
               className="relative aspect-square w-full max-w-sm rounded-full border-4 border-slate-300 shadow-xl overflow-hidden bg-slate-200 flex flex-wrap content-start p-4 gap-2"
               animate={{ scale: 0.8 + (currentEra.mapScale * 0.2) }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
               {/* Buildings popping up */}
               <AnimatePresence>
                  {Array.from({ length: 15 }).map((_, i) => {
                     // Determine if building should be visible in this era
                     const isVisible = i < currentEra.buildings;
                     // Give buildings different heights/colors based on index
                     const isTower = i > 4 && i % 2 === 0;
                     
                     return isVisible && (
                        <motion.div
                           key={i}
                           initial={{ scale: 0, opacity: 0, y: 20 }}
                           animate={{ scale: 1, opacity: 1, y: 0 }}
                           exit={{ scale: 0, opacity: 0, y: 20 }}
                           transition={{ type: "spring", stiffness: 200, damping: 15, delay: (i % 3) * 0.1 }}
                           className={`rounded-sm shadow-md border border-slate-400 ${isTower ? 'bg-sky-200 h-16 w-8' : 'bg-slate-300 h-8 w-12'}`}
                        >
                           {/* Windows */}
                           <div className="w-full h-full flex flex-wrap p-1 gap-[2px] opacity-50">
                              {Array.from({ length: isTower ? 8 : 4 }).map((_, j) => (
                                 <div key={j} className="w-2 h-2 bg-yellow-200/80 rounded-[1px]" />
                              ))}
                           </div>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
            </motion.div>
         </div>

         {/* Current Year Overlay */}
         <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-6 py-3 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
            <Clock className="text-slate-500" size={24} />
            <span className="text-3xl font-black tracking-tighter text-slate-800">
               {currentEra.year}
            </span>
         </div>
      </div>

      {/* The Narrative & Controls (Bottom Panel) */}
      <div className="w-full h-1/3 min-h-[250px] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-20 flex flex-col p-8 pb-12">
         
         {/* Story Text */}
         <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-slate-400 text-xs">
               {currentEra.title}
            </h2>
            <p className="text-slate-700 leading-relaxed md:text-lg font-serif">
               {currentEra.text}
            </p>
         </div>

         {/* The Timeline Slider */}
         <div className="w-full mt-6 relative">
            <input 
               type="range"
               min={0}
               max={eras.length - 1}
               step={1}
               value={currentYear}
               onChange={handleSliderChange}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer outline-none slider-thumb"
               style={{
                  background: `linear-gradient(to right, ${primaryColor} ${(currentYear / (eras.length - 1)) * 100}%, #e2e8f0 ${(currentYear / (eras.length - 1)) * 100}%)`
               }}
            />
            
            <div className="w-full flex justify-between mt-4 text-xs font-bold text-slate-400">
               <span>{eras[0].year}</span>
               <span>{eras[eras.length - 1].year}</span>
            </div>
         </div>

      </div>

      {/* Custom Slider Thumb Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${primaryColor};
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        input[type=range]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${primaryColor};
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
      `}} />

      {/* Editor Bypass */}
      {mode === "editor-preview" && currentYear < eras.length - 1 && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setCurrentYear(eras.length - 1);
                  setHasReachedEnd(true);
                  if (onComplete) onComplete();
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Fast Forward (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
