"use client";

import React, { useState, useRef, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Navigation, Star, Heart } from "lucide-react";

export function PetMemorial({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#facc15"; // yellow-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const petName = (config.experience as any)?.title || "Buddy";
  const petImage = config.mediaUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop";

  const containerRef = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState(false);

  // Generate thousands of background stars randomly spread over a large map (e.g., 200vw x 200vh)
  const mapWidth = 2000;
  const mapHeight = 2000;
  
  const backgroundStars = useMemo(() => {
     const stars = [];
     for(let i=0; i<800; i++) {
        stars.push({
           id: i,
           x: Math.random() * mapWidth,
           y: Math.random() * mapHeight,
           size: Math.random() > 0.9 ? 2 : 1,
           opacity: 0.1 + Math.random() * 0.4
        });
     }
     return stars;
  }, []);

  // Constellation pattern (Dog shape approximation)
  const constellationPoints = [
     { x: 0, y: 0 }, // Target star (Nose)
     { x: 40, y: -20 }, // Head
     { x: 60, y: -50 }, // Ear
     { x: 100, y: 10 }, // Back
     { x: 150, y: 20 }, // Tail base
     { x: 180, y: -10 }, // Tail tip
     { x: 140, y: 60 }, // Back leg
     { x: 150, y: 100 }, // Back paw
     { x: 50, y: 50 }, // Front chest
     { x: 40, y: 90 }, // Front paw
  ];

  const handleStarClick = () => {
     if (!found) {
        setFound(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100, 50]);
        if (onComplete) {
           setTimeout(onComplete, 8000);
        }
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none bg-black"
    >
      
      {/* Background Gradient */}
      <div 
         className="absolute inset-0 z-0 opacity-50"
         style={{ background: `radial-gradient(circle at center, ${bgColors[0]} 0%, black 100%)` }}
      />

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-opacity duration-1000" style={{ opacity: found ? 0 : 1 }}>
         <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3">
            <Navigation size={16} className="text-white/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
               Drag to search the sky
            </span>
         </div>
      </div>

      <div className="flex-1 w-full h-full relative overflow-hidden" ref={containerRef}>
         
         <motion.div 
            className="absolute top-0 left-0 cursor-grab active:cursor-grabbing"
            style={{ width: mapWidth, height: mapHeight }}
            drag
            dragConstraints={containerRef}
            initial={{ x: -mapWidth/2 + 160, y: -mapHeight/2 + 240 }}
         >
            
            {/* The Milky Way glow */}
            <div 
               className="absolute top-1/4 left-0 right-0 h-[500px] bg-white opacity-5 blur-[100px] -rotate-12"
               style={{ borderRadius: "50%" }}
            />

            {/* Background Stars */}
            {backgroundStars.map(s => (
               <div 
                  key={s.id}
                  className="absolute rounded-full bg-white"
                  style={{ 
                     left: s.x, top: s.y, 
                     width: s.size, height: s.size, 
                     opacity: s.opacity 
                  }}
               />
            ))}

            {/* The Target Node */}
            <div 
               className="absolute z-10 flex items-center justify-center group"
               style={{ 
                  left: mapWidth/2 + 200, 
                  top: mapHeight/2 - 100, 
                  width: 60, height: 60, 
                  transform: 'translate(-50%, -50%)' 
               }}
            >
               {/* Clickable Area */}
               <div 
                  className="w-full h-full rounded-full cursor-pointer absolute flex items-center justify-center z-30"
                  onClick={handleStarClick}
               >
                  {/* The Bright Star */}
                  <motion.div 
                     className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
                     animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {/* Pulse to help find it if needed */}
                  <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-20 pointer-events-none" />
               </div>

               {/* Constellation Overlay (revealed on click) */}
               {found && (
                  <div className="absolute top-1/2 left-1/2 z-0 pointer-events-none">
                     
                     {/* Lines */}
                     <svg className="absolute top-0 left-0 overflow-visible" style={{ zIndex: 0 }}>
                        <motion.path 
                           d={`M ${constellationPoints[0].x} ${constellationPoints[0].y} 
                               L ${constellationPoints[1].x} ${constellationPoints[1].y} 
                               L ${constellationPoints[2].x} ${constellationPoints[2].y} 
                               M ${constellationPoints[1].x} ${constellationPoints[1].y}
                               L ${constellationPoints[3].x} ${constellationPoints[3].y}
                               L ${constellationPoints[4].x} ${constellationPoints[4].y}
                               L ${constellationPoints[5].x} ${constellationPoints[5].y}
                               M ${constellationPoints[4].x} ${constellationPoints[4].y}
                               L ${constellationPoints[6].x} ${constellationPoints[6].y}
                               L ${constellationPoints[7].x} ${constellationPoints[7].y}
                               M ${constellationPoints[3].x} ${constellationPoints[3].y}
                               L ${constellationPoints[8].x} ${constellationPoints[8].y}
                               L ${constellationPoints[9].x} ${constellationPoints[9].y}
                               `}
                           stroke="rgba(255,255,255,0.4)" 
                           strokeWidth="1" 
                           fill="none" 
                           strokeDasharray="4 4"
                           initial={{ pathLength: 0, opacity: 0 }}
                           animate={{ pathLength: 1, opacity: 1 }}
                           transition={{ duration: 2, ease: "easeInOut" }}
                        />
                     </svg>
                     
                     {/* Constellation Stars */}
                     {constellationPoints.map((p, i) => (
                        <motion.div 
                           key={i}
                           className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                           style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)', zIndex: 1 }}
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.1 }}
                        />
                     ))}

                  </div>
               )}
            </div>

         </motion.div>

      </div>

      {/* The Tribute Modal */}
      <AnimatePresence>
         {found && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1, duration: 1 }}
               className="absolute bottom-8 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl z-40 max-w-sm mx-auto"
            >
               <div className="flex gap-6 items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: primaryColor }}>
                     <Image src={petImage} alt={petName} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-2xl font-black mb-1 drop-shadow-md" style={{ color: primaryColor }}>
                        {petName}
                     </h3>
                     <p className="text-white/70 text-sm font-medium leading-relaxed italic">
                        {config.body || "Always looking down on you. Always a good boy."}
                     </p>
                  </div>
               </div>
               <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  <Heart size={12} fill="currentColor" /> Forever
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
