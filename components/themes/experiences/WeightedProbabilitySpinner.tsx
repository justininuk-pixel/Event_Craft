"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MapPin } from "lucide-react";

type Wedge = {
  id: string;
  name: string;
  weight: number;
  color: string;
};

export function WeightedProbabilitySpinner({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"]; // indigo-950

  const [options, setOptions] = useState<Wedge[]>([
    { id: "o1", name: "Pizza", weight: 90, color: "#ef4444" },
    { id: "o2", name: "Salad", weight: 5, color: "#10b981" },
    { id: "o3", name: "Soup", weight: 5, color: "#3b82f6" },
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Wedge | null>(null);

  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);

  const handleSpin = () => {
     if (isSpinning) return;
     setIsSpinning(true);
     setWinner(null);

     // Calculate random angle
     const extraSpins = 5 * 360;
     const randomDegrees = Math.random() * 360;
     const finalRotation = rotation + extraSpins + randomDegrees;

     setRotation(finalRotation);

     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

     setTimeout(() => {
        setIsSpinning(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        
        // Calculate winner
        const normalized = 360 - (finalRotation % 360);
        let currentAngle = 0;
        let selected = options[0];
        
        for (const o of options) {
           const sliceAngle = (o.weight / totalWeight) * 360;
           if (normalized >= currentAngle && normalized < currentAngle + sliceAngle) {
              selected = o;
              break;
           }
           currentAngle += sliceAngle;
        }

        setWinner(selected);
        if (onComplete) setTimeout(onComplete, 5000);
     }, 4000); // 4s spin duration
  };

  // Precalculate slices to avoid mutation in render loop
  const slices = useMemo(() => {
    let currentAngle = 0;
    return options.map((o) => {
      const sliceAngle = (o.weight / totalWeight) * 360;
      const start = currentAngle;
      const end = currentAngle + sliceAngle;
      currentAngle += sliceAngle;
      
      const x1 = 50 + 50 * Math.cos((Math.PI * start) / 180);
      const y1 = 50 + 50 * Math.sin((Math.PI * start) / 180);
      const x2 = 50 + 50 * Math.cos((Math.PI * end) / 180);
      const y2 = 50 + 50 * Math.sin((Math.PI * end) / 180);
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const d = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        id: o.id,
        d,
        color: o.color,
      };
    });
  }, [options, totalWeight]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-indigo-950 text-indigo-100" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />

      <div className="text-center z-10 p-6 flex flex-col items-center">
         <h2 className="text-xl font-black uppercase tracking-widest text-indigo-300">Weighted Spinner</h2>
         <p className="text-xs text-indigo-400 mt-1 font-medium">Size = Probability</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pb-8">
         
         <div className="relative w-64 h-64 mb-12">
            {/* The Pointer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
               <MapPin size={32} fill="currentColor" className="rotate-180" />
            </div>

            {/* The Wheel */}
            <motion.div 
               className="w-full h-full rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-indigo-900 relative overflow-hidden"
               animate={{ rotate: rotation }}
               transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }} // smooth decelerate
            >
               <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {slices.map((slice) => (
                     <path key={slice.id} d={slice.d} fill={slice.color} stroke="#312e81" strokeWidth="0.5" />
                  ))}
               </svg>
            </motion.div>

            {/* Center peg */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-900 rounded-full border-2 border-indigo-800 shadow-inner z-10" />
         </div>

         <AnimatePresence mode="wait">
            {winner ? (
               <motion.div 
                  key="winner"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-center"
               >
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">The Fates Have Chosen</div>
                  <h3 className="text-5xl font-black text-white" style={{ color: winner.color }}>{winner.name}</h3>
               </motion.div>
            ) : (
               <motion.div 
                  key="stats"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center gap-4 w-full px-6"
               >
                  {options.map(o => (
                     <div key={o.id} className="flex flex-col items-center bg-indigo-900/50 p-2 rounded-lg border border-indigo-800/50 flex-1">
                        <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: o.color }} />
                        <span className="text-[10px] font-bold text-indigo-300 uppercase truncate w-full text-center">{o.name}</span>
                        <span className="text-xs font-mono text-white">{Math.round((o.weight / totalWeight) * 100)}%</span>
                     </div>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      <div className="p-6 bg-indigo-950 z-10 border-t border-indigo-900">
         <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-lg ${
               isSpinning ? 'bg-indigo-900 text-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95'
            }`}
         >
            <RefreshCw size={18} className={isSpinning ? "animate-spin" : ""} /> {isSpinning ? "Spinning..." : "Spin the Wheel"}
         </button>
      </div>

    </div>
  );
}
