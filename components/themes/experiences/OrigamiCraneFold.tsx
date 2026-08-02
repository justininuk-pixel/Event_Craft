"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Bird, Lock, Calendar, Heart } from "lucide-react";

export function OrigamiCraneFold({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"]; // pink-50

  // 1000 cranes legend
  const targetCranes = 1000;
  const maxPerDay = 10;
  
  // Local state (would be localStorage backed in real app)
  const [totalCranes, setTotalCranes] = useState(999); // Start at 999 for demo purposes
  const [todayCranes, setTodayCranes] = useState(0);
  const [currentFoldStep, setCurrentFoldStep] = useState(0); // 0 to 4
  const [isLocked, setIsLocked] = useState(false);

  const flock = Array.from({ length: 20 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    rotate: Math.random() * 360
  }));

  // In editor mode, we ignore the daily lock so the user can test the interaction
  const enforceLock = mode !== "editor-preview";

  useEffect(() => {
     if (enforceLock && todayCranes >= maxPerDay) {
        setIsLocked(true);
     }
  }, [todayCranes, enforceLock]);

  const handleDragEnd = (e: any, info: any) => {
     if (isLocked) return;

     // Detect swipe up or right
     if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
        
        setCurrentFoldStep(prev => {
           const next = prev + 1;
           if (next >= 4) {
              // Finish crane
              setTimeout(() => {
                 setTotalCranes(tc => {
                    const nc = tc + 1;
                    if (nc >= targetCranes && onComplete) {
                       onComplete();
                    }
                    return nc;
                 });
                 setTodayCranes(tc => tc + 1);
                 setCurrentFoldStep(0);
              }, 500);
           }
           return next;
        });
     }
  };

  // Very simplified fold visualization
  const getFoldTransform = () => {
     switch(currentFoldStep) {
        case 0: return { rotateX: 0, rotateY: 0, scale: 1, borderRadius: 0 }; // Flat paper
        case 1: return { rotateX: 45, rotateY: 45, scale: 0.8, borderRadius: '50% 0 50% 0' }; // First fold (diamond)
        case 2: return { rotateX: -45, rotateY: 90, scale: 0.6, borderRadius: '50% 50% 0 0' }; // Triangle
        case 3: return { rotateX: 90, rotateY: 0, scale: 0.5, borderRadius: '0' }; // Base
        case 4: return { rotateX: 0, rotateY: 0, scale: 1, borderRadius: '0' }; // Done (replaced by icon)
        default: return { rotateX: 0, rotateY: 0, scale: 1, borderRadius: 0 };
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {totalCranes < targetCranes ? (
         <div className="flex-1 flex flex-col items-center justify-between p-8 relative">
            
            {/* Header / Stats */}
            <div className="w-full flex justify-between items-start">
               <div>
                  <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
                     {totalCranes} / {targetCranes}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                     Cranes Folded
                  </p>
               </div>
               
               <div className="text-right">
                  <div className="text-sm font-bold text-slate-700 flex items-center gap-1 justify-end">
                     <Calendar size={14} /> Today: {todayCranes}/{maxPerDay}
                  </div>
                  {isLocked && (
                     <div className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                        <Lock size={10} /> Limit reached
                     </div>
                  )}
               </div>
            </div>

            {/* Interaction Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
               
               <AnimatePresence mode="wait">
                  {isLocked ? (
                     <motion.div
                        key="locked"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-8 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl"
                     >
                        <Lock size={32} className="mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Rest your hands.</h3>
                        <p className="text-slate-500 text-sm">You've folded 10 cranes today. Come back tomorrow to continue the journey.</p>
                     </motion.div>
                  ) : (
                     <motion.div
                        key="folding"
                        className="w-full flex flex-col items-center"
                     >
                        <p className="text-slate-400 font-medium mb-12 animate-pulse text-center">
                           Swipe to fold (Step {currentFoldStep}/4)
                        </p>
                        
                        <motion.div
                           className="relative flex items-center justify-center cursor-grab active:cursor-grabbing w-48 h-48"
                           drag
                           dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                           dragElastic={1}
                           onDragEnd={handleDragEnd}
                        >
                           {currentFoldStep < 4 ? (
                              <motion.div 
                                 className="w-32 h-32 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 origin-center"
                                 animate={getFoldTransform()}
                                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                 style={{ 
                                    background: `linear-gradient(135deg, white 50%, #f8fafc 50%)`
                                 }}
                              >
                                 {/* Origami pattern lines */}
                                 <div className="absolute inset-0 opacity-20 border-t border-l border-slate-400 rotate-45 scale-150" />
                              </motion.div>
                           ) : (
                              <motion.div
                                 initial={{ scale: 0.5, rotate: -45 }}
                                 animate={{ scale: 1, rotate: 0 }}
                                 className="text-rose-500 drop-shadow-lg"
                              >
                                 <Bird size={64} style={{ color: primaryColor, fill: primaryColor }} />
                              </motion.div>
                           )}
                        </motion.div>

                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Instruction */}
            <div className="text-center pb-8">
               <h3 className="text-lg font-serif italic text-slate-600">
                  {config.title || "A Thousand Cranes"}
               </h3>
               <p className="text-xs font-medium text-slate-400 mt-2 max-w-[250px]">
                  Legend says folding 1,000 paper cranes grants one wish.
               </p>
            </div>

         </div>
      ) : (
         /* Completion State */
         <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-rose-500 text-white text-center relative"
            style={{ backgroundColor: primaryColor }}
         >
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
               {/* Background flock */}
               {flock.map((bird, i) => (
                  <Bird key={i} size={24} className="absolute text-white" style={{
                     left: bird.left,
                     top: bird.top,
                     transform: `rotate(${bird.rotate}deg)`
                  }} />
               ))}
            </div>

            <Heart size={48} className="mb-6 animate-bounce text-white drop-shadow-xl fill-white" />
            <h2 className="text-4xl font-black mb-4 drop-shadow-md">
               The Wish is Granted.
            </h2>
            <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-sm max-w-sm">
               {config.body || "1,000 cranes folded with love and patience. My wish is for your health and happiness, always."}
            </p>
         </motion.div>
      )}
    </div>
  );
}
