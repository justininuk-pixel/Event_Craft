"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Camera, Activity, AlertCircle } from "lucide-react";

export function PolaroidShaker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#262626"]; // neutral-800

  const [opacity, setOpacity] = useState(100); // 100 = fully masked, 0 = fully developed
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const lastUpdateRef = useRef<number>(0);
  const lastXRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  const lastZRef = useRef<number | null>(null);

  // Helper to deplete opacity
  const shake = (intensity: number) => {
     setOpacity(prev => {
        const next = Math.max(0, prev - intensity);
        if (next === 0 && prev > 0) {
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
           if (onComplete) setTimeout(onComplete, 3000);
        }
        return next;
     });
  };

  // Device Motion Setup
  useEffect(() => {
     const handleMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;
        
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;

        const currentTime = Date.now();
        if ((currentTime - lastUpdateRef.current) > 100) {
           const diffTime = (currentTime - lastUpdateRef.current);
           lastUpdateRef.current = currentTime;

           if (lastXRef.current !== null && lastYRef.current !== null && lastZRef.current !== null) {
              const speed = Math.abs(x + y + z - lastXRef.current - lastYRef.current - lastZRef.current) / diffTime * 10000;
              
              if (speed > 800) { // Shake threshold
                 shake(3); // drop opacity by 3% per vigorous shake
              }
           }

           lastXRef.current = x;
           lastYRef.current = y;
           lastZRef.current = z;
        }
     };

     if (hasPermission === true) {
        window.addEventListener('devicemotion', handleMotion);
     }

     return () => {
        window.removeEventListener('devicemotion', handleMotion);
     };
  }, [hasPermission]);

  // Request permission (needed for iOS 13+)
  const requestAccess = async () => {
     if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
           const permission = await (DeviceMotionEvent as any).requestPermission();
           if (permission === 'granted') {
              setHasPermission(true);
           } else {
              setHasPermission(false);
           }
        } catch (e) {
           console.error(e);
           setHasPermission(false);
        }
     } else {
        // Non-iOS 13+ devices
        setHasPermission(true);
     }
  };

  // Mouse fallback for desktop
  const lastMouseX = useRef(0);
  const handleMouseMove = (e: React.MouseEvent) => {
     const deltaX = Math.abs(e.clientX - lastMouseX.current);
     lastMouseX.current = e.clientX;
     if (deltaX > 50) {
        shake(1); // Small progression for fast mouse wiggles
     }
  };

  const isDeveloped = opacity === 0;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
      onMouseMove={handleMouseMove}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
               {config.title || "Instant Memory"}
            </h2>
         </div>

         {/* The Polaroid */}
         <motion.div 
            className="w-72 bg-white p-4 pb-12 shadow-2xl rounded-sm relative"
            animate={!isDeveloped ? { rotate: [-1, 1, -1] } : { rotate: 0 }}
            transition={{ repeat: !isDeveloped ? Infinity : 0, duration: 2, ease: "easeInOut" }}
         >
            {/* The Photo Container */}
            <div className="w-full aspect-square bg-slate-900 overflow-hidden relative shadow-inner">
               
               {/* The actual photo */}
               <img 
                  src={(config.experience as any)?.image || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop"} 
                  alt="Developed Memory" 
                  className="w-full h-full object-cover"
               />
               
               {/* The developing mask layer */}
               <div 
                  className="absolute inset-0 bg-[#3a4449]"
                  style={{ 
                     opacity: opacity / 100,
                     mixBlendMode: 'normal',
                     transition: 'opacity 0.2s ease-out'
                  }}
               />

               {/* Silver Halide sheen */}
               <div 
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 bg-gradient-to-tr from-transparent via-white to-transparent"
                  style={{ transform: `translateY(${100 - opacity}%)` }}
               />
            </div>

            <div className="mt-6 text-center font-marker text-slate-800 handwriting text-xl opacity-0 transition-opacity duration-1000" style={{ opacity: isDeveloped ? 1 : 0 }}>
               {config.body || "A perfect day."}
            </div>

         </motion.div>

         <div className="mt-12 w-full max-w-xs flex flex-col items-center gap-4 text-white">
            {!isDeveloped && (
               <>
                  {hasPermission === null && (
                     <button 
                        onClick={requestAccess}
                        className="px-6 py-2 bg-white/20 border border-white/30 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/30 transition-colors"
                     >
                        Enable Motion Sensor
                     </button>
                  )}
                  
                  {hasPermission === false && (
                     <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-xs border border-red-400/20">
                        <AlertCircle size={14} /> Motion access denied. Wiggle mouse rapidly instead.
                     </div>
                  )}

                  {hasPermission === true && (
                     <div className="flex items-center gap-2 animate-pulse font-bold tracking-widest text-sm uppercase">
                        <Activity size={18} /> Shake Device to Develop
                     </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4 shadow-inner">
                     <div 
                        className="h-full bg-blue-400 transition-all duration-200"
                        style={{ width: `${100 - opacity}%` }}
                     />
                  </div>
               </>
            )}

            {mode === "editor-preview" && !isDeveloped && (
               <button 
                  onClick={() => shake(10)} 
                  className="px-4 py-1 mt-4 bg-slate-800 text-slate-400 text-[10px] uppercase tracking-widest rounded shadow-md border border-slate-700"
               >
                  Simulate Shake
               </button>
            )}

            {isDeveloped && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest bg-green-400/10 px-6 py-3 rounded-full border border-green-400/20 shadow-lg"
               >
                  <Camera size={16} /> Fully Developed
               </motion.div>
            )}
         </div>

      </div>

    </div>
  );
}
