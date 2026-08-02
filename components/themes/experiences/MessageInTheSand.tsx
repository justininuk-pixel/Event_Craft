"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Droplets, Smartphone } from "lucide-react";

export function MessageInTheSand({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8"; // sky-400 (water)
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fcd34d"]; // amber-300 (sand)

  const [tilt, setTilt] = useState(0); // 0 to 90 degrees forward
  const [isWashed, setIsWashed] = useState(false);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

  const requestPermissions = async () => {
     if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
           const permission = await (DeviceOrientationEvent as any).requestPermission();
           if (permission === 'granted') {
              window.addEventListener("deviceorientation", handleOrientation);
              setHasPermissions(true);
           }
        } catch (e) {
           console.error(e);
           setHasPermissions(false); // fallback
        }
     } else {
        window.addEventListener("deviceorientation", handleOrientation);
        setHasPermissions(true);
     }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
     // beta is front-to-back tilt in degrees, where front is positive
     // Let's assume holding it flat is around 30-45, tilting forward increases it
     let beta = e.beta || 0;
     // clamp between 0 and 90
     beta = Math.max(0, Math.min(90, beta));
     
     // Normalize to 0-100% for the water level
     // Let's say tilt = 20 is bottom, tilt = 70 is top
     const progress = Math.max(0, Math.min(100, ((beta - 20) / 50) * 100));
     setTilt(progress);

     if (progress > 90 && !isWashed) {
        setIsWashed(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(200);
        if (onComplete) {
           setTimeout(onComplete, 3000);
        }
     }
  };

  useEffect(() => {
     return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
     };
  }, [isWashed]);

  // For editor preview
  const handleSimulateTilt = (e: React.ChangeEvent<HTMLInputElement>) => {
     const progress = parseInt(e.target.value);
     setTilt(progress);
     if (progress > 90 && !isWashed) {
        setIsWashed(true);
        if (onComplete) {
           setTimeout(onComplete, 3000);
        }
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background (The underlying message/shells) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-amber-100/50">
         
         <div className="text-center z-0">
            <h2 className="text-4xl font-black text-amber-900 tracking-tight drop-shadow-sm mb-4">
               {config.title || "I miss you."}
            </h2>
            <p className="text-amber-800/80 font-serif text-xl italic max-w-sm mx-auto">
               {config.body || "More than words can say. Come back soon."}
            </p>
         </div>

         {/* Decorative Shells */}
         <div className="absolute top-1/4 left-8 w-8 h-8 rounded-full border-2 border-amber-300 bg-amber-200 shadow-inner" />
         <div className="absolute bottom-1/3 right-12 w-6 h-10 rounded-full border border-amber-400 bg-amber-300 shadow-md rotate-45" />

      </div>

      {/* The Sand Layer (Fades away when washed) */}
      <motion.div 
         className="absolute inset-0 flex items-center justify-center pointer-events-none"
         style={{ backgroundColor: bgColors[0] }}
         animate={{ opacity: isWashed ? 0 : 1 }}
         transition={{ duration: 2, ease: "easeOut" }}
      >
         {/* Noise texture for sand */}
         <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] mix-blend-multiply" />
         
         <div className="text-center opacity-40 mix-blend-color-burn px-8">
            <div className="text-4xl font-black tracking-tight mb-4 blur-[2px] blur-sm">
               {config.title || "I miss you."}
            </div>
            <div className="text-xl font-serif blur-[2px]">
               {config.body || "More than words can say. Come back soon."}
            </div>
         </div>
      </motion.div>

      {/* The Water */}
      <motion.div
         className="absolute left-0 right-0 h-[150vh] z-10 pointer-events-none opacity-80"
         style={{ 
            backgroundColor: primaryColor,
            top: '100%',
            // If it's already washed, keep it mostly up or receding slowly
            y: isWashed ? '-80%' : `${-tilt}%`, 
         }}
         transition={isWashed ? { duration: 5, ease: "linear" } : { type: "tween", ease: "linear", duration: 0.1 }}
      >
         {/* Water texture/foam edge */}
         <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/60 to-transparent" />
         <div className="absolute top-0 left-0 right-0 h-2 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
         <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] mix-blend-overlay opacity-30" />
      </motion.div>

      {/* Request Permissions Overlay */}
      {hasPermissions === null && mode !== "editor-preview" && (
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center text-white">
            <Droplets size={48} className="mb-6 text-sky-400" />
            <h3 className="text-2xl font-bold mb-4">A wave is coming.</h3>
            <p className="text-white/70 mb-8 max-w-[250px]">
               Allow device motion to tilt your phone and wash the sand away.
            </p>
            <button 
               onClick={requestPermissions}
               className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm"
            >
               Enable Motion
            </button>
         </div>
      )}

      {/* Editor Fallback / Instructions */}
      <div className="absolute top-12 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
         {!isWashed && (
            <div className="bg-black/40 text-white backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
               <Smartphone size={16} /> Tilt phone forward to wash
            </div>
         )}
         
         {mode === "editor-preview" && !isWashed && (
            <div className="bg-white/90 p-4 rounded-xl shadow-lg pointer-events-auto border border-slate-200">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Simulate Tilt</label>
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={tilt} 
                  onChange={handleSimulateTilt}
                  className="w-48"
               />
            </div>
         )}
      </div>

    </div>
  );
}
