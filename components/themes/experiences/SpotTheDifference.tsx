"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const HOTSPOTS = [
   { id: 1, x: 25, y: 40, emoji: "🎈" },
   { id: 2, x: 75, y: 20, emoji: "🕊️" },
   { id: 3, x: 50, y: 70, emoji: "🌸" }
];

export function SpotTheDifference({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"hunting" | "revealed">("hunting");
  const [foundSpots, setFoundSpots] = useState<number[]>([]);
  const [errorFlash, setErrorFlash] = useState(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"];

  const imageToUse = config.mediaUrl || "https://images.unsplash.com/photo-1506744626753-143d4eb07360?w=800&auto=format&fit=crop";

  const handleSpotClick = (e: React.MouseEvent, id: number) => {
     e.stopPropagation(); // prevent error flash
     if (foundSpots.includes(id)) return;
     
     const newFound = [...foundSpots, id];
     setFoundSpots(newFound);
     
     if (newFound.length === HOTSPOTS.length) {
        setTimeout(() => {
           setPhase("revealed");
           setTimeout(() => {
              if (onComplete) onComplete();
           }, 2000);
        }, 1500);
     }
  };

  const handleMissClick = () => {
     if (phase !== "hunting") return;
     setErrorFlash(true);
     setTimeout(() => setErrorFlash(false), 300);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white bg-zinc-950"
    >
      <div 
         className="absolute inset-0 opacity-50 pointer-events-none" 
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      <AnimatePresence mode="wait">
         {phase === "hunting" && (
            <motion.div
               key="hunting"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="relative z-10 w-full h-full flex flex-col pt-8 pb-4"
            >
               <h1 className="text-2xl font-black uppercase tracking-widest text-center mb-2">
                  Spot The Difference
               </h1>
               <div className="flex justify-center gap-2 mb-6">
                  {HOTSPOTS.map((h, i) => (
                     <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full transition-colors ${foundSpots.includes(h.id) ? "bg-green-500 shadow-[0_0_10px_green]" : "bg-white/20"}`} 
                     />
                  ))}
               </div>

               <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4 px-4 overflow-hidden relative">
                  
                  {errorFlash && (
                     <motion.div 
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-500/50 z-50 pointer-events-none rounded-xl"
                     />
                  )}
                  
                  {/* Image 1 (Original) */}
                  <div className="flex-1 relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900">
                     <img src={imageToUse} alt="Original" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Image 2 (Altered) */}
                  <div 
                     className="flex-1 relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900"
                     onClick={handleMissClick}
                  >
                     <img src={imageToUse} alt="Altered" className="w-full h-full object-cover" />
                     
                     {/* The Differences (Hotspots) */}
                     {HOTSPOTS.map((spot) => (
                        <div
                           key={spot.id}
                           className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                           style={{ 
                              left: `${spot.x}%`, 
                              top: `${spot.y}%`,
                              width: '40px',
                              height: '40px'
                           }}
                        >
                           {/* The actual visual difference */}
                           <div className="text-3xl opacity-80 mix-blend-overlay pointer-events-none">
                              {spot.emoji}
                           </div>
                           
                           {/* The hit area */}
                           <div 
                              className="absolute inset-0 cursor-crosshair rounded-full"
                              onClick={(e) => handleSpotClick(e, spot.id)}
                           />
                           
                           {/* Found Ring */}
                           <AnimatePresence>
                              {foundSpots.includes(spot.id) && (
                                 <motion.div 
                                    initial={{ scale: 0, opacity: 0, borderWidth: "8px" }}
                                    animate={{ scale: 1.5, opacity: 1, borderWidth: "4px" }}
                                    className="absolute inset-0 rounded-full border-green-400 pointer-events-none shadow-[0_0_15px_rgba(74,222,128,0.8)]"
                                 />
                              )}
                           </AnimatePresence>
                        </div>
                     ))}
                  </div>

               </div>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8"
            >
               <motion.div 
                 initial={{ y: -50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="w-full max-w-md bg-zinc-900 border border-white/20 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
               >
                 <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mb-6"
                 >
                    👀
                 </motion.div>
                 
                 <h1 className="text-3xl font-black uppercase text-white mb-6">
                   Eagle Eye
                 </h1>
                 
                 <p className="text-zinc-400 font-bold mb-8">
                    You found all 3 anomalies.
                 </p>
                 
                 <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                   {config.title}
                 </h2>
                 <p className="text-base font-body text-zinc-300 whitespace-pre-wrap font-medium">
                   {config.body}
                 </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
