"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function CrowdSourcedMap({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"locating" | "revealed">("locating");
  const [pins, setPins] = useState<{id: string, x: number, y: number}[]>([]);
  const [myPin, setMyPin] = useState<{x: number, y: number} | null>(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (phase !== "locating") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "locating") return;
       
       setPins(prev => {
          if (prev.length > 50) return prev;
          
          const next = [...prev, { 
             id: Math.random().toString(), 
             x: 10 + Math.random() * 80, 
             y: 10 + Math.random() * 80 
          }];
          return next;
       });
       
    }, 800);

    return () => clearInterval(interval);
  }, [phase]);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
     if (phase !== "locating" || myPin) return;
     
     const rect = e.currentTarget.getBoundingClientRect();
     const x = ((e.clientX - rect.left) / rect.width) * 100;
     const y = ((e.clientY - rect.top) / rect.height) * 100;
     
     setMyPin({ x, y });
     
     setTimeout(() => {
        setPhase("revealed");
        if (onComplete) onComplete();
     }, 3000);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white touch-none flex flex-col font-sans select-none">
      
      {/* Map Layer */}
      <motion.div 
         className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
         animate={{
            scale: phase === "revealed" ? 1.1 : 1,
            opacity: phase === "revealed" ? 0.2 : 1,
            filter: phase === "revealed" ? 'blur(10px)' : 'blur(0px)',
         }}
         transition={{ duration: 3, ease: "easeInOut" }}
      >
         <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full object-cover opacity-80 pointer-events-auto cursor-crosshair"
            onClick={handleMapClick}
            preserveAspectRatio="none"
         >
            {/* Highly abstract stylized landmasses */}
            <path d="M 10,20 Q 30,10 40,30 T 20,60 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
            <path d="M 45,25 Q 70,15 80,40 T 55,70 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
            <path d="M 75,50 Q 95,45 90,75 T 65,80 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
            <path d="M 25,65 Q 40,60 45,85 T 15,90 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
            
            <defs>
               <radialGradient id="pin-glow">
                  <stop offset="0%" stopColor="var(--exp-primary, #3b82f6)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--exp-primary, #3b82f6)" stopOpacity="0" />
               </radialGradient>
            </defs>

            {/* Grid overlay */}
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
               <circle cx="2.5" cy="2.5" r="0.5" fill="rgba(255,255,255,0.1)" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />

            <AnimatePresence>
               {pins.map(pin => (
                  <motion.circle
                     key={pin.id}
                     cx={pin.x}
                     cy={pin.y}
                     r="0.5"
                     fill="#ffffff"
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 0.6 }}
                     transition={{ type: "spring", bounce: 0.5 }}
                  />
               ))}
               
               {myPin && (
                  <motion.g
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", bounce: 0.7 }}
                  >
                     <circle
                        cx={myPin.x}
                        cy={myPin.y}
                        r="3"
                        fill="url(#pin-glow)"
                        className="animate-pulse"
                     />
                     <circle
                        cx={myPin.x}
                        cy={myPin.y}
                        r="0.5"
                        fill="#ffffff"
                     />
                     <motion.circle
                        cx={myPin.x}
                        cy={myPin.y}
                        r="5"
                        stroke="#ffffff"
                        strokeWidth="0.2"
                        fill="none"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 2], opacity: [1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                     />
                  </motion.g>
               )}
            </AnimatePresence>
         </svg>
      </motion.div>

      {/* Instructions */}
      <AnimatePresence>
         {phase === "locating" && !myPin && (
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 text-lg font-bold tracking-widest pointer-events-none z-20 shadow-2xl whitespace-nowrap"
            >
               TAP YOUR LOCATION
            </motion.div>
         )}
         {myPin && phase === "locating" && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-sm font-bold tracking-widest pointer-events-none z-20 text-green-400 whitespace-nowrap"
            >
               LOCATION SECURED...
            </motion.div>
         )}
      </AnimatePresence>

      {/* Background Revealed Content */}
      <AnimatePresence>
         {phase === "revealed" && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1, transition: { duration: 1 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-auto"
            >
               <div className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-700">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-4xl font-heading mb-4 text-white">
                   {config.title}
                 </h1>
                 <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
