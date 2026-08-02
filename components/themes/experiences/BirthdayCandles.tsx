"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function BirthdayCandles({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // We'll assume a default birth year of 1990 if not extractable
  // Alternatively, could use a random one. Let's just fix it to 1990.
  const birthYear = 1990;
  const currentYear = new Date().getFullYear();

  const [simulatedYear, setSimulatedYear] = useState<number>(currentYear);
  const [blownOut, setBlownOut] = useState<boolean[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f472b6"; // Cake frosting
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"];

  const age = Math.max(1, simulatedYear - birthYear);

  // Initialize blown out state when age changes
  useEffect(() => {
     setBlownOut(new Array(age).fill(false));
     setIsUnlocked(false);
  }, [age]);

  // Check if all blown out
  useEffect(() => {
     if (blownOut.length > 0 && blownOut.every(b => b) && !isUnlocked) {
        setIsUnlocked(true);
        if (onComplete) onComplete();
     }
  }, [blownOut, isUnlocked, onComplete]);

  const handleBlowOut = (index: number) => {
     const newBlownOut = [...blownOut];
     newBlownOut[index] = true;
     setBlownOut(newBlownOut);
  };

  const blowAll = () => {
     setBlownOut(new Array(age).fill(true));
  };

  // Generate grid positions for candles to avoid complete overlap
  // We place them on a 3D-ish plane (elliptical disc for top of cake)
  const candlePositions = useMemo(() => {
     const positions: { x: number, y: number, z: number, scale: number }[] = [];
     
     // Distribute in concentric circles or rows
     // Top of cake is roughly an ellipse
     const cakeWidth = 280;
     const cakeHeight = 100;
     
     for (let i = 0; i < age; i++) {
        // Simple phyllotaxis spiral inside an ellipse
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const theta = i * goldenRatio * Math.PI * 2;
        // Radius scales with sqrt to maintain uniform density, max radius is 1
        const maxRadius = Math.sqrt(age);
        const radius = Math.sqrt(i) / maxRadius;
        
        // Map to ellipse
        const x = Math.cos(theta) * radius * (cakeWidth / 2 - 20);
        const y = Math.sin(theta) * radius * (cakeHeight / 2 - 20);
        
        // Depth scale (smaller in back)
        const depth = (y / (cakeHeight / 2)); // -1 to 1
        const scale = 0.8 + ((depth + 1) / 2) * 0.4;
        
        positions.push({ x, y, z: Math.floor(depth * 100), scale });
     }
     
     // Sort by Z index so back candles render first
     return positions.sort((a, b) => a.z - b.z);
  }, [age]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <div className="absolute inset-0 pointer-events-none opacity-40">
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]" />
      </div>

      <AnimatePresence>
         {isUnlocked && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-16 md:top-24 text-center z-30 px-4"
            >
               <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-widest mb-4">
                  {config.title || `Happy ${age}!`}
               </h1>
               <p className="text-lg md:text-xl text-slate-600 font-bold whitespace-pre-wrap max-w-md mx-auto">
                  {config.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="relative mt-24">
         {/* The Cake */}
         <div className="relative w-[320px] h-[200px] flex flex-col items-center justify-end">
            
            {/* Cake Base/Body */}
            <div className="w-[300px] h-[120px] rounded-b-3xl relative z-10 shadow-2xl" style={{ backgroundColor: "#fef08a" }}>
               {/* Frosting Drips */}
               <div className="absolute top-0 w-full flex justify-between px-2">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-8 h-12 rounded-b-full shadow-sm" style={{ backgroundColor: primaryColor, height: 20 + Math.random() * 40 }} />
                  ))}
               </div>
            </div>
            
            {/* Cake Top (Ellipse) */}
            <div 
               className="absolute top-10 w-[300px] h-[100px] rounded-[50%] z-20 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]"
               style={{ backgroundColor: primaryColor }}
            >
               {/* The Candles */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {candlePositions.map((pos, idx) => (
                     <div 
                        key={idx}
                        className="absolute w-2 h-8 bg-white rounded-t-sm rounded-b-sm border border-slate-200 cursor-pointer transition-transform hover:scale-110"
                        style={{
                           left: pos.x - 4, // center it
                           top: pos.y - 16,
                           zIndex: pos.z + 50,
                           transform: `scale(${pos.scale})`,
                           transformOrigin: "bottom center"
                        }}
                        onMouseEnter={() => handleBlowOut(idx)}
                        onClick={() => handleBlowOut(idx)}
                     >
                        {/* The Flame */}
                        <AnimatePresence>
                           {!blownOut[idx] && (
                              <motion.div
                                 initial={{ opacity: 0, scale: 0 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0, y: -10 }}
                                 className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-5 bg-orange-400 rounded-full"
                                 style={{
                                    boxShadow: "0 0 10px 2px rgba(251, 146, 60, 0.6)",
                                    filter: "blur(1px)",
                                    animation: `flicker ${Math.random() * 0.5 + 0.5}s infinite alternate`
                                 }}
                              />
                           )}
                        </AnimatePresence>
                        {/* Stripe */}
                        <div className="w-full h-full absolute inset-0 opacity-50"
                           style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, red 4px, red 8px)" }}
                        />
                     </div>
                  ))}
               </div>
            </div>
            
            {/* Cake Plate */}
            <div className="absolute -bottom-4 w-[340px] h-[40px] rounded-[50%] bg-slate-300 z-0 shadow-lg border-b-4 border-slate-400" />
         </div>
         
         <style>{`
            @keyframes flicker {
               0% { transform: translate(-50%, 0) scale(1) rotate(-2deg); }
               100% { transform: translate(-50%, -2px) scale(1.1) rotate(2deg); }
            }
         `}</style>
      </div>

      {!isUnlocked && (
         <div className="absolute top-1/4 text-center z-30 pointer-events-none px-8">
            <h2 className="text-3xl font-black uppercase tracking-widest text-slate-800 drop-shadow-md">
               Make a wish
            </h2>
            <p className="text-slate-600 font-bold mt-2">
               (Swipe or tap to blow out all {age} candles)
            </p>
         </div>
      )}

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 p-6 flex flex-col items-center shadow-2xl z-50 rounded-3xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Current Year (Birth Year: {birthYear})
            </h2>
            <div className="flex w-full items-center gap-4 text-slate-800 font-bold">
               <span className="text-xs text-slate-400">{birthYear + 1}</span>
               <input 
                  type="range" 
                  min={birthYear + 1} 
                  max={birthYear + 100} 
                  step="1" 
                  value={simulatedYear} 
                  onChange={(e) => setSimulatedYear(parseInt(e.target.value))}
                  className="flex-1 accent-pink-500"
               />
               <span className="text-xs text-slate-400">{birthYear + 100}</span>
            </div>
            <div className="flex w-full justify-between mt-4">
               <div className="font-mono text-xs px-4 py-2 border tracking-widest uppercase bg-pink-100 text-pink-600 border-pink-200 rounded-full">
                  Age: {age} (Candles: {age})
               </div>
               <button
                  onClick={blowAll}
                  className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-700"
               >
                  Blow All Out
               </button>
            </div>
         </div>
      )}
      
    </div>
  );
}
