"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function TapestryThread({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // Red line
  
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1

  const fullText = config.body || "The red thread of fate connects those who are destined to meet, regardless of time, place, or circumstance. The thread may stretch or tangle, but it will never break.";
  
  // Measure the SVG path length on mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Use framer-motion values for the dragging knob
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // When the user drags, try to map their X/Y back to a percentage along the path
  const handleDrag = (event: any, info: any) => {
    if (!pathRef.current || pathLength === 0) return;
    
    // Simplistic heuristic: distance dragged roughly translates to path progression
    // In a production app, we would use getPointAtLength and calculate the closest point on the path
    const dx = info.delta.x;
    const dy = info.delta.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Require them to drag roughly 'forward'
    setDragProgress(prev => {
      const next = Math.min(1, prev + (distance / pathLength) * 1.5);
      if (next > 0.95 && onComplete && prev <= 0.95) {
         onComplete();
      }
      return next;
    });
  };

  // Determine how many characters to show based on drag progress
  const charsToShow = Math.floor(fullText.length * dragProgress);
  const visibleText = fullText.substring(0, charsToShow);

  return (
    <div className="w-full h-full bg-zinc-50 relative flex items-center justify-center overflow-hidden font-serif" style={{ backgroundColor: palette.background?.[0] || '#f8fafc' }}>
      
      {/* Background Tapestry Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/woven.png')" }} />

      {/* The Text Container */}
      <div className="absolute inset-8 z-10 pointer-events-none flex flex-col justify-center">
         <h1 className="text-2xl font-black mb-8 text-center" style={{ color: palette.text }}>
            {config.title || "The Red Thread"}
         </h1>
         <div className="text-xl leading-relaxed text-center min-h-[50%]" style={{ color: palette.textSecondary }}>
            {visibleText}
            {dragProgress < 1 && (
               <motion.span 
                  className="inline-block w-2 h-6 align-middle ml-1"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
               />
            )}
         </div>
      </div>

      {/* The SVG Path (The Thread) */}
      <div className="absolute inset-0 z-20" ref={containerRef}>
         <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* The faint background track */}
            <path 
               d="M 10 20 C 30 0, 70 40, 90 20 S 10 60, 50 80 S 90 60, 90 90" 
               fill="none" 
               stroke={palette.textSecondary} 
               strokeWidth="0.5"
               strokeOpacity="0.2"
            />
            {/* The filled thread based on progress */}
            <motion.path 
               ref={pathRef}
               d="M 10 20 C 30 0, 70 40, 90 20 S 10 60, 50 80 S 90 60, 90 90" 
               fill="none" 
               stroke={primaryColor} 
               strokeWidth="2"
               strokeLinecap="round"
               strokeDasharray={pathLength}
               strokeDashoffset={pathLength - (pathLength * dragProgress)}
               transition={{ ease: "easeOut" }}
            />
         </svg>
      </div>

      {/* The Interactive Draggable Spool/Knob */}
      {pathLength > 0 && dragProgress < 1 && (
         <motion.div
            className="absolute z-30 w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
               left: `10%`, // Starting position X roughly matching M 10
               top: `20%`,  // Starting position Y roughly matching M 20
               x, y
            }}
            drag
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={() => {
               // Snap back to 0,0 relative to its starting point so it doesn't float away
               x.set(0);
               y.set(0);
            }}
         >
            {/* Thread Spool Visual */}
            <div className="w-8 h-8 rounded-full border-4 shadow-xl flex items-center justify-center relative overflow-hidden bg-white" style={{ borderColor: primaryColor }}>
               <div className="w-full h-full opacity-50 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="w-full h-[1px]" style={{ backgroundColor: primaryColor }} />
                  ))}
               </div>
            </div>
            
            {dragProgress === 0 && (
               <motion.div 
                  className="absolute -bottom-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
               >
                  Trace the thread
               </motion.div>
            )}
         </motion.div>
      )}

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && dragProgress < 1 && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 p-2 rounded shadow z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setDragProgress(1);
                  if (onComplete) onComplete();
               }}
               className="text-[10px] uppercase font-bold text-black"
            >
               Trace (Editor)
            </button>
         </div>
      )}
    </div>
  );
}
