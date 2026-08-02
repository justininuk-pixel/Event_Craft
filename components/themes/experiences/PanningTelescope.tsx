"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useMotionValue } from "framer-motion";
import { Star } from "lucide-react";

export function PanningTelescope({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [activeConstellation, setActiveConstellation] = useState<number | null>(null);
  const [foundConstellations, setFoundConstellations] = useState<Record<number, boolean>>({});
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24";

  // The massive background canvas (e.g. 3000x3000px)
  const mapSize = 2000;
  
  // Motion values for the draggable background
  const x = useMotionValue(-mapSize/2 + 200); // Start slightly offset
  const y = useMotionValue(-mapSize/2 + 300);

  // Define some points of interest on the massive map
  const constellations = [
    { id: 1, x: mapSize/2 - 100, y: mapSize/2 - 200, title: "The Bear", text: "It watches from the north, guiding those who are lost." },
    { id: 2, x: mapSize/2 + 300, y: mapSize/2 + 150, title: "The Hunter", text: "Forever chasing something just out of reach." },
    { id: 3, x: mapSize/2 - 400, y: mapSize/2 + 300, title: "The Crown", text: "A heavy burden for whoever wears it." },
  ];

  // Check if center of screen (the lens) is over a constellation
  const checkIntersection = () => {
    // The lens is in the center of the viewport (which we assume is roughly 400x800, so center is ~200, 400)
    // We can approximate by looking at the negative inverse of x, y motion values relative to the viewport center.
    // We'll simplify by checking distance whenever they drag.
    
    // We assume the lens is at viewport center (0,0 relative to the drag container's initial state if we set constraints right, but let's just check the center offset).
    const lensX = -x.get() + 160;
    const lensY = -y.get() + 240;

    let found = null;
    for (let c of constellations) {
       const dx = c.x - lensX;
       const dy = c.y - lensY;
       const dist = Math.sqrt(dx*dx + dy*dy);
       if (dist < 100) { // Lens radius
          found = c.id;
          break;
       }
    }

    if (found) {
       if (activeConstellation !== found) {
          setActiveConstellation(found);
          setFoundConstellations(prev => ({ ...prev, [found!]: true }));
       }
    } else {
       if (activeConstellation !== null) {
          setActiveConstellation(null);
       }
    }
  };

  useEffect(() => {
    // Listen to motion value changes
    const unsubX = x.on("change", checkIntersection);
    const unsubY = y.on("change", checkIntersection);
    return () => {
       unsubX();
       unsubY();
    };
  });

  // Check completion
  useEffect(() => {
    if (Object.keys(foundConstellations).length === constellations.length && onComplete) {
      onComplete();
    }
  }, [foundConstellations, constellations.length, onComplete]);

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center font-sans overflow-hidden select-none">
      
      {/* The Lens Mask */}
      <div 
         className="absolute inset-0 z-20 pointer-events-none"
         style={{
            // Creates a black screen with a transparent circle in the middle
            background: "radial-gradient(circle 120px at center, transparent 0%, transparent 95%, rgba(0,0,0,1) 100%)",
            boxShadow: "inset 0 0 0 2000px rgba(0,0,0,1)"
         }}
      >
         {/* Telescope Crosshairs */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-white/20">
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/30 rounded-full" />
         </div>
      </div>

      {/* The Draggable Sky Container */}
      <motion.div
         className="absolute cursor-grab active:cursor-grabbing z-10"
         style={{ width: mapSize, height: mapSize, x, y }}
         drag
         dragConstraints={{
            left: -mapSize + 320,
            right: 0,
            top: -mapSize + 480,
            bottom: 0
         }}
         dragElastic={0}
         dragMomentum={false}
      >
         {/* The Sky Texture */}
         <div 
            className="w-full h-full opacity-50"
            style={{ 
               backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
               backgroundSize: "200px 200px"
            }} 
         />

         {/* The Constellations */}
         {constellations.map(c => {
            const isActive = activeConstellation === c.id;
            const isFound = foundConstellations[c.id];

            return (
               <div 
                  key={c.id} 
                  className="absolute flex flex-col items-center justify-center"
                  style={{ left: c.x, top: c.y, transform: "translate(-50%, -50%)" }}
               >
                  <div className="relative">
                     <Star 
                        size={isActive ? 32 : 16} 
                        fill={isFound || isActive ? primaryColor : "transparent"} 
                        color={isFound || isActive ? primaryColor : "rgba(255,255,255,0.2)"}
                        className="transition-all duration-300"
                     />
                     {isActive && (
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 animate-pulse" />
                     )}
                  </div>
               </div>
            );
         })}
      </motion.div>

      {/* Story Overlay (Shown when centered on a constellation) */}
      <div className="absolute bottom-8 left-8 right-8 z-30 pointer-events-none flex justify-center">
         {activeConstellation ? (
            <motion.div 
               className="bg-black/80 backdrop-blur border border-white/20 p-6 rounded-xl max-w-sm text-center shadow-2xl"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
            >
               <h3 className="text-xl font-serif mb-2" style={{ color: primaryColor }}>
                  {constellations.find(c => c.id === activeConstellation)?.title}
               </h3>
               <p className="text-sm text-zinc-300 leading-relaxed font-serif">
                  {constellations.find(c => c.id === activeConstellation)?.text}
               </p>
            </motion.div>
         ) : (
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold opacity-50">
               {Object.keys(foundConstellations).length === constellations.length 
                  ? "All constellations found."
                  : "Pan the sky to find the stars..."}
            </div>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && Object.keys(foundConstellations).length < constellations.length && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  const all = constellations.reduce((acc, c) => ({...acc, [c.id]: true}), {});
                  setFoundConstellations(all);
                  if (onComplete) onComplete();
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Find All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
