"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Plane, CalendarHeart, FastForward } from "lucide-react";

// Helper to interpolate between two hex colors
function lerpColor(a: string, b: string, amount: number) { 
    const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

export function CountdownToReunion({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  // Custom theme colors for interpolation
  const coldColor = "#0f172a"; // slate-900 (far away)
  const warmColor = "#ea580c"; // orange-600 (reunion!)
  
  const targetDateStr = (config.experience as any)?.targetDate || (Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days from now
  const startDateStr = (config.experience as any)?.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  const [now, setNow] = useState(() => Date.now());
  const [isSpeedingUp, setIsSpeedingUp] = useState(false);

  const targetDate = typeof targetDateStr === "string" ? new Date(targetDateStr).getTime() : targetDateStr;
  const startDate = typeof startDateStr === "string" ? new Date(startDateStr).getTime() : startDateStr;

  useEffect(() => {
     let interval: NodeJS.Timeout;
     
     if (isSpeedingUp) {
        // Fast forward time for editor preview
        interval = setInterval(() => {
           setNow(prev => {
              const next = prev + (targetDate - startDate) * 0.005; // 0.5% per tick
              if (next >= targetDate) {
                 setIsSpeedingUp(false);
                 if (onComplete) onComplete();
                 return targetDate;
              }
              return next;
           });
        }, 50);
     } else {
        // Normal tick
        interval = setInterval(() => setNow(Date.now()), 1000);
     }

     return () => clearInterval(interval);
  }, [isSpeedingUp, targetDate, startDate, onComplete]);

  // Calculate percentage
  let progress = (now - startDate) / (targetDate - startDate);
  progress = Math.max(0, Math.min(1, progress)); // Clamp 0-1

  // If time is past target, lock to 1
  if (now >= targetDate) progress = 1;

  // Interpolate colors
  const currentColor = lerpColor(coldColor, warmColor, progress);
  const textColor = lerpColor("#94a3b8", "#fef3c7", progress); // slate-400 to amber-100

  // Time remaining strings
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white transition-colors duration-1000"
      style={{ backgroundColor: currentColor }}
    >
      
      {/* Editor Mock Tools */}
      {mode === "editor-preview" && progress < 1 && (
         <div className="absolute top-8 left-0 right-0 flex justify-center z-50">
            <button
               onClick={() => setIsSpeedingUp(!isSpeedingUp)}
               className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
               <FastForward size={16} /> {isSpeedingUp ? "Stop" : "Time Travel"}
            </button>
         </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full h-full">
         
         <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center text-center w-full"
         >
            
            {progress < 1 ? (
               <>
                  <CalendarHeart size={48} className="mb-12 opacity-80" style={{ color: textColor }} />
                  
                  {/* The Numbers */}
                  <div className="flex items-end justify-center gap-2 mb-8 drop-shadow-md">
                     <div className="flex flex-col items-center">
                        <span className="text-7xl font-black tracking-tighter" style={{ color: textColor }}>{days}</span>
                        <span className="text-xs uppercase tracking-widest opacity-60" style={{ color: textColor }}>Days</span>
                     </div>
                     <span className="text-4xl font-light opacity-30 pb-4">:</span>
                     <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold tracking-tighter opacity-90" style={{ color: textColor }}>{hours.toString().padStart(2, '0')}</span>
                        <span className="text-xs uppercase tracking-widest opacity-60" style={{ color: textColor }}>Hrs</span>
                     </div>
                     <span className="text-3xl font-light opacity-30 pb-4">:</span>
                     <div className="flex flex-col items-center">
                        <span className="text-3xl font-medium tracking-tighter opacity-80" style={{ color: textColor }}>{minutes.toString().padStart(2, '0')}</span>
                        <span className="text-xs uppercase tracking-widest opacity-60" style={{ color: textColor }}>Min</span>
                     </div>
                  </div>

                  <p className="text-lg font-serif italic max-w-sm mt-8" style={{ color: textColor, opacity: 0.8 }}>
                     Every second that passes brings the warmth a little closer.
                  </p>
               </>
            ) : (
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                  className="flex flex-col items-center text-center"
               >
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8 border border-white/50 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                     <Plane size={48} className="text-white drop-shadow-lg" />
                  </div>
                  <h2 className="text-5xl font-black tracking-tight text-white mb-4 drop-shadow-lg">
                     {config.title || "Zero."}
                  </h2>
                  <p className="text-xl font-medium text-white/90 drop-shadow-md">
                     {config.body || "I am right here."}
                  </p>
               </motion.div>
            )}

         </motion.div>

         {/* Visual progress bar at bottom */}
         <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
            <div 
               className="h-full bg-white/50 transition-all duration-1000 ease-linear"
               style={{ width: `${progress * 100}%` }}
            />
         </div>

      </div>

    </div>
  );
}
