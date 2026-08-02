"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export function DigitalKintsugi({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  // The crack path (simplified SVG path data)
  const crackPath = "M 150 50 Q 140 100 160 150 T 130 220 Q 150 260 140 300";
  const pathLength = 300; // Approximated length for strokeDasharray
  
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isRepaired, setIsRepaired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
     setIsDragging(true);
     updateProgress(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (isDragging && !isRepaired) {
        updateProgress(e);
     }
  };

  const handlePointerUp = () => {
     setIsDragging(false);
  };

  const updateProgress = (e: React.PointerEvent) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const y = e.clientY - rect.top;
     // Map Y coordinate (50 to 300) to progress (0 to 1)
     let p = (y - 50) / 250;
     p = Math.max(0, Math.min(1, p));
     
     // Only allow progress to move forward to prevent "un-healing"
     setProgress(prev => {
        const newP = Math.max(prev, p);
        if (newP >= 0.95 && !isRepaired) {
           setIsRepaired(true);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 200]);
           if (onComplete) {
              setTimeout(onComplete, 6000);
           }
        }
        return newP;
     });
  };

  // Editor auto-repair mock
  useEffect(() => {
     if (mode === "editor-preview" && !isRepaired) {
        const t = setTimeout(() => {
           setProgress(1);
           setIsRepaired(true);
        }, 4000);
        return () => clearTimeout(t);
     }
  }, [mode, isRepaired]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none transition-opacity duration-1000" style={{ opacity: isRepaired ? 0 : 1 }}>
         <h2 className="text-xl font-black text-white/80 uppercase tracking-widest drop-shadow-md">
            Mend the cracks
         </h2>
         <p className="text-white/50 text-sm mt-2">
            Trace the line to heal.
         </p>
      </div>

      <div className="flex-1 flex items-center justify-center relative w-full h-full">
         
         {/* The Object (A Heart) */}
         <div 
            className="relative w-[300px] h-[350px]"
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
         >
            
            {/* Base Object (Broken Heart Silhouette) */}
            <svg viewBox="0 0 300 350" className="w-full h-full drop-shadow-2xl">
               <defs>
                  <filter id="glow">
                     <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                     <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                  </filter>
               </defs>

               {/* Left Half */}
               <path 
                  d="M 150 80 C 150 80, 100 -20, 20 50 C -60 120, 150 320, 150 320 Z" 
                  fill="#27272a" 
                  stroke="#3f3f46" 
                  strokeWidth="2"
                  style={{ transform: `translateX(${-5 * (1 - progress)}px) rotate(${-2 * (1 - progress)}deg)`, transformOrigin: '150px 150px', transition: 'transform 0.5s ease-out' }}
               />
               
               {/* Right Half */}
               <path 
                  d="M 150 80 C 150 80, 200 -20, 280 50 C 360 120, 150 320, 150 320 Z" 
                  fill="#27272a" 
                  stroke="#3f3f46" 
                  strokeWidth="2"
                  style={{ transform: `translateX(${5 * (1 - progress)}px) rotate(${2 * (1 - progress)}deg)`, transformOrigin: '150px 150px', transition: 'transform 0.5s ease-out' }}
               />

               {/* The Kintsugi Crack (Background/Empty) */}
               <path 
                  d={crackPath} 
                  fill="none" 
                  stroke="#18181b" 
                  strokeWidth="6" 
                  strokeLinecap="round"
               />

               {/* The Kintsugi Crack (Gold Fill) */}
               <motion.path 
                  d={crackPath} 
                  fill="none" 
                  stroke={primaryColor} 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  filter={isRepaired ? "url(#glow)" : ""}
                  style={{ 
                     strokeDasharray: pathLength,
                     strokeDashoffset: pathLength * (1 - progress)
                  }}
                  animate={{
                     strokeWidth: isRepaired ? [4, 8, 4] : 4
                  }}
                  transition={{ duration: 2, repeat: isRepaired ? Infinity : 0 }}
               />

               {/* The glow particle that follows the finger */}
               {!isRepaired && progress > 0 && progress < 1 && (
                  <circle 
                     cx="150" 
                     cy={50 + progress * 250} 
                     r="8" 
                     fill={primaryColor} 
                     filter="url(#glow)"
                     style={{ pointerEvents: 'none' }}
                  />
               )}

            </svg>

         </div>

      </div>

      <AnimatePresence>
         {isRepaired && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1, duration: 1 }}
               className="absolute bottom-16 left-8 right-8 text-center flex flex-col items-center"
            >
               <Sparkles size={32} className="mb-4 animate-pulse" style={{ color: primaryColor }} />
               <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">
                  {config.title || "More Beautiful for Having Been Broken"}
               </h3>
               <p className="text-white/70 font-medium text-lg leading-relaxed max-w-md mx-auto">
                  {config.body || "Kintsugi is the Japanese art of repairing broken pottery with gold. Flaws and imperfections aren't hidden; they are illuminated. Thank you for healing with me."}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
