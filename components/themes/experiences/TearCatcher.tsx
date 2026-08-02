"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Heart } from "lucide-react";

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

type Tear = {
   id: number;
   x: number; // percentage 0-100
   y: number; // pixels from top
   speed: number;
};

export function TearCatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900
  
  const tearColor = "#3b82f6"; // blue-500
  const goldColor = "#f59e0b"; // amber-500
  
  const [tears, setTears] = useState<Tear[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const targetCount = 10;
  
  const [jarX, setJarX] = useState(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
     if (caughtCount >= targetCount) {
        if (onComplete) setTimeout(onComplete, 3000);
        return; // Game over
     }

     // Spawn tears
     const spawnInterval = setInterval(() => {
        setTears(prev => [
           ...prev,
           {
              id: Date.now(),
              x: 10 + Math.random() * 80,
              y: -20,
              speed: 2 + Math.random() * 3
           }
        ]);
     }, 800);

     return () => clearInterval(spawnInterval);
  }, [caughtCount, targetCount, onComplete]);

  useEffect(() => {
     if (caughtCount >= targetCount) return;

     const updatePhysics = () => {
        if (!containerRef.current) return;
        const containerHeight = containerRef.current.clientHeight;
        const jarY = containerHeight - 100; // Approx jar top position
        const jarWidth = 64; // px
        const containerWidth = containerRef.current.clientWidth;
        
        const jarLeftPx = (jarX / 100) * containerWidth - jarWidth / 2;
        const jarRightPx = jarLeftPx + jarWidth;

        setTears(prev => {
           let newCaught = 0;
           const activeTears = prev.filter(tear => {
              const tearY = tear.y + tear.speed;
              const tearXPx = (tear.x / 100) * containerWidth;
              
              // Check collision (y crosses jar top, and x is within jar width)
              if (tearY >= jarY && tearY <= jarY + 20) {
                 if (tearXPx >= jarLeftPx - 10 && tearXPx <= jarRightPx + 10) {
                    newCaught++;
                    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                    return false; // Caught!
                 }
              }
              // Remove if fallen off screen
              if (tearY > containerHeight) return false;
              
              tear.y = tearY;
              return true;
           });

           if (newCaught > 0) {
              setCaughtCount(c => c + newCaught);
           }
           return activeTears;
        });

        animationRef.current = requestAnimationFrame(updatePhysics);
     };

     animationRef.current = requestAnimationFrame(updatePhysics);

     return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
     };
  }, [jarX, caughtCount, targetCount]);

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
     setJarX(x);
  };

  const progress = Math.min(1, caughtCount / targetCount);
  const liquidColor = lerpColor(tearColor, goldColor, progress);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background glow based on progress */}
      <div 
         className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
         style={{ background: `radial-gradient(circle at 50% 100%, ${liquidColor} 0%, transparent 70%)` }}
      />

      <div 
         className="flex-1 w-full h-full relative"
         ref={containerRef}
         onPointerMove={handlePointerMove}
         onPointerDown={handlePointerMove}
      >
         
         {/* The Tears */}
         {tears.map(tear => (
            <div 
               key={tear.id}
               className="absolute w-2 h-4 bg-blue-400 rounded-full blur-[1px] opacity-80"
               style={{ 
                  left: `${tear.x}%`, 
                  top: tear.y,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.8)'
               }}
            />
         ))}

         {/* The Jar */}
         <motion.div 
            className="absolute bottom-12 w-16 h-20 border-2 border-t-0 rounded-b-xl backdrop-blur-sm border-white/40 shadow-[inset_0_-10px_20px_rgba(255,255,255,0.1)] flex items-end justify-center overflow-hidden z-20"
            style={{ left: `${jarX}%`, transform: 'translateX(-50%)' }}
            animate={{ scale: progress >= 1 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
         >
            {/* The Liquid */}
            <div 
               className="w-full transition-all duration-300 relative"
               style={{ 
                  height: `${progress * 100}%`,
                  backgroundColor: liquidColor,
                  boxShadow: `0 0 20px ${liquidColor}`
               }}
            >
               {progress > 0 && progress < 1 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/50 animate-pulse" />
               )}
               {progress >= 1 && (
                  <Heart size={24} className="absolute inset-0 m-auto text-white animate-bounce" fill="white" />
               )}
            </div>
         </motion.div>

         {/* Header / Intro */}
         <AnimatePresence>
            {progress < 1 && (
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-12 left-0 right-0 text-center pointer-events-none"
               >
                  <h2 className="text-3xl font-serif italic text-white/90 drop-shadow-md">
                     {config.title || "Let it out."}
                  </h2>
                  <p className="text-white/50 text-sm mt-2 max-w-[200px] mx-auto flex items-center justify-center gap-2">
                     <Droplet size={14} /> Catch the tears.
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Completion Message */}
         <AnimatePresence>
            {progress >= 1 && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
               >
                  <div className="bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-white/10 text-center mx-6 shadow-2xl">
                     <Heart size={48} className="mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ color: liquidColor, fill: liquidColor }} />
                     <p className="text-2xl font-serif italic text-white leading-relaxed">
                        {config.body || "It's okay to be sad. But remember, the tears will eventually turn to gold."}
                     </p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
