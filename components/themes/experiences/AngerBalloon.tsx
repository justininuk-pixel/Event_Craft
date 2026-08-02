"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Activity } from "lucide-react";

export function AngerBalloon({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const maxTaps = 50;
  const [taps, setTaps] = useState(0);
  const [popped, setPopped] = useState(false);
  const [particles, setParticles] = useState<{id:number, x:number, y:number}[]>([]);

  // Constant deflation if they stop tapping
  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (taps > 0 && !popped) {
        interval = setInterval(() => {
           setTaps(prev => Math.max(0, prev - 2)); // deflate over time
        }, 500);
     }
     return () => clearInterval(interval);
  }, [taps, popped]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
     if (popped) return;
     
     // Haptic feedback
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
     }

     const newTaps = taps + 1;
     setTaps(newTaps);

     if (newTaps >= maxTaps) {
        popBalloon(e);
     }
  };

  const popBalloon = (e: React.MouseEvent | React.TouchEvent) => {
     setPopped(true);
     
     // Heavy haptic feedback
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
     }

     // Generate particle explosion data
     const target = (e?.currentTarget || e?.target) as HTMLElement | null;
     const rect = target?.getBoundingClientRect ? target.getBoundingClientRect() : { left: 0, top: 0, width: 320, height: 480 };
     let cx = rect.left + rect.width / 2;
     let cy = rect.top + rect.height / 2;
     
     if ('clientX' in e) {
        cx = e.clientX;
        cy = e.clientY;
     } else if (e.touches && e.touches[0]) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
     }

     const newParts = [];
     for(let i=0; i<30; i++) {
        newParts.push({ id: i, x: cx, y: cy });
     }
     setParticles(newParts);

     if (onComplete) {
        setTimeout(onComplete, 4000);
     }
  };

  const scale = 1 + (taps / maxTaps) * 4; // Scales from 1x to 5x
  const isStressed = taps > maxTaps * 0.7; // Shaking effect

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: popped ? "#ffffff" : bgColors[0], transition: "background-color 0.5s ease-out" }}
      onMouseDown={handleTap}
      onTouchStart={handleTap}
    >
      
      <AnimatePresence mode="wait">
         {!popped ? (
            <motion.div 
               key="balloon"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
            >
               {/* Instructions */}
               <div className="absolute top-12 left-0 right-0 text-center pointer-events-none opacity-50">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-1">
                     Tap to Vent
                  </h2>
                  <p className="text-sm font-bold">
                     Don't stop until it pops
                  </p>
               </div>

               {/* The Balloon */}
               <motion.div
                  className="relative flex items-center justify-center"
                  animate={{ 
                     scale,
                     x: isStressed ? [0, -10, 10, -5, 5, 0] : 0,
                     y: isStressed ? [0, 5, -5, 10, -10, 0] : 0
                  }}
                  transition={{ 
                     scale: { type: "spring", bounce: 0.5 },
                     x: { repeat: Infinity, duration: 0.1 },
                     y: { repeat: Infinity, duration: 0.1 }
                  }}
               >
                  <div 
                     className="w-32 h-32 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),_0_0_50px_rgba(239,68,68,0.3)] relative"
                     style={{ backgroundColor: primaryColor }}
                  >
                     {/* Glossy highlight */}
                     <div className="absolute top-4 left-6 w-8 h-12 bg-white/30 rounded-full rotate-45 blur-sm" />
                     {/* Tie knot */}
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor }} />
                     {/* String */}
                     <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-white/20 origin-top rotate-[-5deg]" />
                  </div>
               </motion.div>

               {/* Progress Text overlay (optional, maybe keep it hidden to force visceral tapping) */}
               {mode === "editor-preview" && (
                  <div className="absolute bottom-12 left-0 right-0 text-center text-xs font-mono text-white/30">
                     TAPS: {taps} / {maxTaps}
                  </div>
               )}

            </motion.div>
         ) : (
            <motion.div 
               key="calm"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 bg-white"
            >
               {/* Explosion Particles */}
               {particles.map((p) => {
                  const angle = (p.id / 30) * Math.PI * 2;
                  const dist = 100 + (p.id % 5) * 20;
                  const tx = Math.cos(angle) * dist;
                  const ty = Math.sin(angle) * dist;
                  return (
                     <motion.div 
                        key={p.id}
                        className="absolute w-4 h-4 rounded-full"
                        style={{ backgroundColor: primaryColor, left: '50%', top: '50%' }}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                     />
                  )
               })}

               {/* Calming Message */}
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 2 }}
                  className="text-center z-10 px-6"
               >
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
                     <Heart size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
                     {config.title || "It's okay."}
                  </h3>
                  <p className="text-slate-500 font-medium max-w-[250px] mx-auto leading-relaxed">
                     {config.body || "Breathe in. Breathe out. You are safe now."}
                  </p>
                  
                  <button 
                     onClick={(e) => { e.stopPropagation(); setTaps(0); setPopped(false); setParticles([]); }}
                     className="mt-12 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                     Reset
                  </button>
               </motion.div>

            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
