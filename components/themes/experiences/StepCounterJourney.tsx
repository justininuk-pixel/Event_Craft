"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Map, Mountain, Castle, ShieldAlert } from "lucide-react";

export function StepCounterJourney({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ca8a04"; // yellow-600 (parchment/fantasy map feel)
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"]; // amber-50

  const [totalSteps, setTotalSteps] = useState(15000);
  
  // Constants
  const goalSteps = 100000; // 100k steps to reach the mountain
  const stepsPerMile = 2000; // Roughly 2000 steps per mile
  
  const currentMiles = (totalSteps / stepsPerMile).toFixed(1);
  const goalMiles = (goalSteps / stepsPerMile).toFixed(1);

  const progress = Math.min(totalSteps / goalSteps, 1);

  const handleAddSteps = (steps: number) => {
     setTotalSteps(prev => {
        const next = prev + steps;
        if (next >= goalSteps && prev < goalSteps) {
           if (onComplete) onComplete();
        }
        return next;
     });
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden text-yellow-900 select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Fantasy Map Background Texture */}
      <div 
         className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }} 
      />

      {/* HUD Info */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase drop-shadow-md">
               {config.title || "The Long Walk"}
            </h2>
            <p className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 drop-shadow-sm">
               <Map size={14} />
               {config.body || "Journey to the Fire Mountain"}
            </p>
         </div>
         <div className="text-right bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-yellow-900/10 shadow-lg">
            <span className="block text-2xl font-black tabular-nums tracking-tighter leading-none text-yellow-900">{currentMiles}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-700">Miles Walked</span>
         </div>
      </div>

      {/* The Map Canvas */}
      <div className="flex-1 relative w-full h-full">
         
         {/* Map Drawing */}
         <svg viewBox="0 0 1000 1000" className="w-full h-full object-cover opacity-60 absolute inset-0" preserveAspectRatio="xMidYMid slice">
            {/* Topography Lines (Fake) */}
            <path d="M -100 200 Q 200 300 300 100 T 700 300 T 1100 100" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
            <path d="M -100 300 Q 200 400 300 200 T 700 400 T 1100 200" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
            
            {/* Forests (Simple Circles) */}
            <circle cx="200" cy="800" r="40" fill="rgba(0,0,0,0.05)" />
            <circle cx="230" cy="770" r="30" fill="rgba(0,0,0,0.05)" />
            <circle cx="250" cy="820" r="35" fill="rgba(0,0,0,0.05)" />
            
            <circle cx="700" cy="200" r="60" fill="rgba(0,0,0,0.05)" />
            <circle cx="750" cy="180" r="40" fill="rgba(0,0,0,0.05)" />
         </svg>

         {/* The Journey Path */}
         <svg viewBox="0 0 1000 1000" className="w-full h-full absolute inset-0 drop-shadow-xl" preserveAspectRatio="xMidYMid slice">
            
            {/* Background Path (The whole route) */}
            <path 
               id="journey-path"
               d="M 100 900 C 300 900 300 600 500 500 C 700 400 800 600 900 200" 
               fill="none" 
               stroke="rgba(0,0,0,0.1)" 
               strokeWidth="12" 
               strokeDasharray="20 20"
               strokeLinecap="round"
            />

            {/* Filled Path (Progress) */}
            <motion.path 
               d="M 100 900 C 300 900 300 600 500 500 C 700 400 800 600 900 200" 
               fill="none" 
               stroke={primaryColor} 
               strokeWidth="12" 
               strokeDasharray="20 20"
               strokeLinecap="round"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: progress }}
               transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
            />

            {/* Start Point */}
            <g transform="translate(100, 900)">
               <circle cx="0" cy="0" r="24" fill="white" stroke={primaryColor} strokeWidth="8" />
               <foreignObject x="-16" y="-16" width="32" height="32">
                  <Castle size={32} className="text-yellow-700" />
               </foreignObject>
               <text x="0" y="45" textAnchor="middle" className="font-bold text-2xl uppercase fill-yellow-900 tracking-widest">The Shire</text>
            </g>

            {/* End Point */}
            <g transform="translate(900, 200)">
               <circle cx="0" cy="0" r="32" fill="white" stroke="#dc2626" strokeWidth="8" />
               <foreignObject x="-20" y="-20" width="40" height="40">
                  <Mountain size={40} className="text-red-600" />
               </foreignObject>
               <text x="0" y="-50" textAnchor="middle" className="font-black text-3xl uppercase fill-red-700 tracking-widest">Mt. Doom</text>
               <text x="0" y="55" textAnchor="middle" className="font-bold text-lg uppercase fill-yellow-900 tracking-widest">{goalMiles} mi</text>
            </g>

         </svg>

         {/* The Avatar (HTML element overlaid on the SVG) */}
         {/* We use an approximation here for demo. True path following requires SVG offset-distance which isn't widely supported in all react-native/web combos without complex math. We will simulate it using CSS motion path if supported, or a fallback. */}
         <motion.div 
            className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-900 z-30"
            style={{ 
               // Using CSS Motion Path to bind the div to the exact SVG path string above!
               offsetPath: `path('M 100 900 C 300 900 300 600 500 500 C 700 400 800 600 900 200')`,
               // We scale the SVG viewBox to 1000x1000, but offset-path on HTML elements needs responsive handling or absolute pixel mapping.
               // For a robust cross-browser React implementation, we usually use SVG <foreignObject> or calculate XY explicitly.
               // To keep this reliable, we'll hide this HTML div and use an SVG element instead.
               display: 'none' 
            }}
         />
         
         {/* Reliable Avatar implementation inside the SVG */}
         <svg viewBox="0 0 1000 1000" className="w-full h-full absolute inset-0 pointer-events-none z-30" preserveAspectRatio="xMidYMid slice">
            <motion.g
               initial={{ offsetDistance: "0%" } as any}
               animate={{ offsetDistance: `${progress * 100}%` } as any}
               transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
               style={{ 
                  offsetPath: `path('M 100 900 C 300 900 300 600 500 500 C 700 400 800 600 900 200')` 
               } as any} // Using any to bypass strict TS typing for offsetPath which is relatively new
            >
               {/* We draw the avatar centered at 0,0. offsetPath will move it along the path. */}
               <circle cx="0" cy="0" r="30" fill="white" stroke={primaryColor} strokeWidth="6" className="drop-shadow-2xl" />
               <foreignObject x="-20" y="-20" width="40" height="40">
                  <Footprints size={40} style={{ color: primaryColor }} />
               </foreignObject>
               
               {/* Floating Tag */}
               <foreignObject x="-100" y="-80" width="200" height="40" className="overflow-visible">
                  <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-center border border-yellow-900/20 shadow-lg inline-block w-full">
                     <span className="font-bold text-xs uppercase tracking-widest text-yellow-900">{totalSteps.toLocaleString()} steps</span>
                  </div>
               </foreignObject>
            </motion.g>
         </svg>

      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-black/20 to-transparent">
         <div className="flex gap-4 max-w-lg mx-auto">
            <button
               onClick={() => handleAddSteps(5000)}
               className="flex-1 bg-white text-yellow-900 py-4 rounded-2xl font-black text-lg shadow-2xl border-b-4 border-yellow-200 active:border-b-0 active:translate-y-1 transition-all"
            >
               +5,000 Steps
            </button>
            <button
               onClick={() => handleAddSteps(15000)}
               className="flex-1 text-white py-4 rounded-2xl font-black text-lg shadow-2xl border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
               style={{ backgroundColor: primaryColor }}
            >
               +15k (Long Hike)
            </button>
         </div>
      </div>

      {/* End State Overlay */}
      <AnimatePresence>
         {progress >= 1 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 z-50 bg-red-950/80 backdrop-blur-sm flex items-center justify-center p-8 text-center"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-black/50 border border-red-500 p-8 rounded-3xl max-w-md shadow-2xl"
               >
                  <ShieldAlert size={64} className="text-red-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">You Made It</h2>
                  <p className="text-red-200 font-bold mb-8">
                     You walked {goalMiles} miles and reached the Fire Mountain. The ring is destroyed. (Your calves must be huge).
                  </p>
                  <button 
                     onClick={() => setTotalSteps(0)}
                     className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500 transition-colors"
                  >
                     Walk Back Home
                  </button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
