"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CalendarClock, Hand } from "lucide-react";

export function PromiseRing({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // amber-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  // For demo: start dull, polish to shine.
  const [polishLevel, setPolishLevel] = useState(mode === "editor-preview" ? 20 : 100);
  const [isPolishing, setIsPolishing] = useState(false);

  // In a real app, we'd check localStorage for lastPolishDate and calculate decay.
  
  const handlePolish = (e: React.PointerEvent) => {
     if (isPolishing) return;
     
     // Detect movement across the ring
     if (e.movementX > 5 || e.movementY > 5 || e.movementX < -5 || e.movementY < -5) {
        setPolishLevel(prev => {
           const next = prev + 5;
           if (next >= 100) {
              if (onComplete && prev < 100) setTimeout(onComplete, 2000);
              return 100;
           }
           return next;
        });
        
        // Haptic feedback
        if (typeof navigator !== "undefined" && navigator.vibrate && Math.random() > 0.8) {
           navigator.vibrate(10);
        }
     }
  };

  const handlePointerDown = () => setIsPolishing(true);
  const handlePointerUp = () => setIsPolishing(false);

  // Decay over time for demo if in editor mode
  useEffect(() => {
     if (mode === "editor-preview") {
        const interval = setInterval(() => {
           setPolishLevel(prev => Math.max(0, prev - 1));
        }, 500); // Decays quickly for testing
        return () => clearInterval(interval);
     }
  }, [mode]);

  const isShiny = polishLevel >= 90;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-between p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-8">
            <h2 className="text-2xl font-serif italic text-white/90 drop-shadow-md">
               {config.title || "The Promise."}
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-[250px] mx-auto flex items-center justify-center gap-2">
               <CalendarClock size={14} /> Daily commitment required.
            </p>
         </div>

         {/* The Ring Interaction Zone */}
         <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
            
            <motion.div
               className="relative w-64 h-64 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing"
               onPointerDown={handlePointerDown}
               onPointerUp={handlePointerUp}
               onPointerLeave={handlePointerUp}
               onPointerMove={handlePolish}
            >
               
               {/* Ambient Glow */}
               <div 
                  className="absolute inset-0 rounded-full blur-[50px] transition-opacity duration-1000 pointer-events-none"
                  style={{ 
                     backgroundColor: primaryColor, 
                     opacity: (polishLevel / 100) * 0.5 
                  }}
               />

               {/* The Ring Graphic (Simplified 2D representation of a 3D ring) */}
               <div className="relative w-40 h-40 rounded-full border-[12px] shadow-2xl flex items-start justify-center transition-all duration-300"
                    style={{ 
                       borderColor: primaryColor,
                       filter: `saturate(${polishLevel}%) brightness(${50 + (polishLevel/2)}%)`,
                       boxShadow: `0 0 ${polishLevel * 0.4}px ${primaryColor}40, inset 0 0 ${polishLevel * 0.2}px ${primaryColor}40`
                    }}
               >
                  {/* The Diamond */}
                  <div className="absolute -top-6 w-12 h-12 bg-white rotate-45 border-4 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300"
                       style={{ 
                          borderColor: primaryColor,
                          filter: `blur(${Math.max(0, (100 - polishLevel) / 20)}px)`,
                       }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-black/20" />
                     {isShiny && (
                        <motion.div 
                           className="absolute inset-0 bg-white"
                           animate={{ opacity: [0, 0.8, 0] }}
                           transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                     )}
                  </div>
               </div>

               {/* Dust Overlay (when unpolished) */}
               <div 
                  className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')] mix-blend-overlay"
                  style={{ opacity: (100 - polishLevel) / 100 }}
               />

            </motion.div>

         </div>

         {/* Instructions / Status */}
         <div className="w-full text-center mb-8 h-16">
            <AnimatePresence mode="wait">
               {polishLevel < 90 ? (
                  <motion.div
                     key="polishing"
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                     className="flex flex-col items-center"
                  >
                     <div className="flex items-center gap-2 text-white/50 mb-2">
                        <Hand size={16} /> Rub to polish
                     </div>
                     {/* Progress bar */}
                     <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 transition-all duration-100" style={{ width: `${polishLevel}%` }} />
                     </div>
                  </motion.div>
               ) : (
                  <motion.div
                     key="shiny"
                     initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                     className="text-amber-200"
                  >
                     <Sparkles size={24} className="mx-auto mb-2 drop-shadow-md" />
                     <p className="font-bold text-sm tracking-widest uppercase drop-shadow-md">
                        Commitment Kept
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
