"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function SharedVennDiagram({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];
  const colorA = "#ec4899"; // pink-500
  const colorB = "#3b82f6"; // blue-500
  
  const title = config.title || "Our Traits";
  const p1Name = "Me";
  const p2Name = "You";

  const onlyA = ["Introvert", "Coffee Lover", "Early Bird"];
  const onlyB = ["Extrovert", "Tea Drinker", "Night Owl"];
  const overlap = ["Hates Cilantro", "Loves Dogs", "Always Late"];

  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    if (onComplete) setTimeout(onComplete, 5000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-white text-gray-800 cursor-pointer" style={{ backgroundColor: bgColors[0] }} onClick={!revealed ? handleReveal : undefined}>
      
      <div className="pt-12 text-center z-20">
         <h2 className="text-2xl font-black uppercase tracking-widest">{title}</h2>
         {!revealed && <p className="text-sm text-gray-400 mt-2 italic animate-pulse">Tap to reveal intersection</p>}
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
         
         {/* Circle A */}
         <motion.div 
           className="absolute w-64 h-64 rounded-full mix-blend-multiply flex flex-col items-start justify-center p-8 pl-12"
           style={{ backgroundColor: `${colorA}80`, left: '10%' }}
           initial={{ x: -100, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ type: "spring", stiffness: 50 }}
         >
            <h3 className="font-bold text-pink-900 uppercase tracking-widest mb-2" style={{ color: colorA }}>{p1Name}</h3>
            <ul className="text-xs text-pink-900 font-medium space-y-1">
               {onlyA.map(t => <li key={t}>• {t}</li>)}
            </ul>
         </motion.div>

         {/* Circle B */}
         <motion.div 
           className="absolute w-64 h-64 rounded-full mix-blend-multiply flex flex-col items-end justify-center p-8 pr-12"
           style={{ backgroundColor: `${colorB}80`, right: '10%' }}
           initial={{ x: 100, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ type: "spring", stiffness: 50 }}
         >
            <h3 className="font-bold text-blue-900 uppercase tracking-widest mb-2 text-right" style={{ color: colorB }}>{p2Name}</h3>
            <ul className="text-xs text-blue-900 font-medium space-y-1 text-right">
               {onlyB.map(t => <li key={t}>• {t}</li>)}
            </ul>
         </motion.div>

         {/* Intersection Content */}
         <motion.div 
           className="absolute z-30 flex flex-col items-center justify-center w-32"
           initial={{ opacity: 0, scale: 0.5 }}
           animate={revealed ? { opacity: 1, scale: 1 } : {}}
           transition={{ delay: 0.2, type: "spring" }}
         >
            <h3 className="font-black text-purple-900 uppercase tracking-widest mb-2">Us</h3>
            <ul className="text-xs text-purple-900 font-bold space-y-2 text-center bg-white/30 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-xl">
               {overlap.map(t => <li key={t}>{t}</li>)}
            </ul>
         </motion.div>

      </div>

    </div>
  );
}
