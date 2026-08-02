"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Hand } from "lucide-react";

export function SharedHapticPulse({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  // Explicitly ignore palette to enforce the design constraint: "The screen is entirely black."
  const bgColor = "#000000";

  // Mock rhythm (e.g., a heartbeat: da-dum... da-dum)
  const rhythm = (config.experience as any)?.rhythm || [100, 100, 150, 600, 100, 100, 150, 600, 100, 100, 150];

  const [isHolding, setIsHolding] = useState(false);
  const [hasFelt, setHasFelt] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
     setIsHolding(true);
     setHasFelt(true);

     // Play haptic rhythm
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(rhythm);
     }

     // Calculate total duration of rhythm
     const totalDuration = rhythm.reduce((a: number, b: number) => a + b, 0);

     // Trigger completion after rhythm finishes
     if (onComplete) {
        timeoutRef.current = setTimeout(() => {
           onComplete();
        }, totalDuration + 1000);
     }
  };

  const handlePointerUp = () => {
     setIsHolding(false);
     
     // Stop haptics immediately if they let go
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(0);
     }

     if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColor }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={e => e.preventDefault()}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full">
         
         <AnimatePresence mode="wait">
            {!isHolding ? (
               <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="w-full flex flex-col items-center text-center opacity-30"
               >
                  <Hand size={24} className="mb-4 text-white/20 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-white/50">
                     {config.title || "Hold Me"}
                  </h2>
               </motion.div>
            ) : (
               <motion.div
                  key="holding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  {/* Visual feedback is intentionally minimal. Just a tiny indicator that it's working. */}
                  <div className="w-1 h-1 rounded-full bg-white/10" />
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {hasFelt && !isHolding && (
         <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
            <motion.p 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="text-white/10 text-xs font-serif italic"
            >
               I hope you felt that.
            </motion.p>
         </div>
      )}

    </div>
  );
}
