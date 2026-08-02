"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Smartphone } from "lucide-react";

export function GyroscopicStargazer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFound, setIsFound] = useState(false);

  // Target angles (e.g. facing North, pointing up)
  const targetAlpha = 0; // North
  const targetBeta = 45; // 45 degrees tilt

  const message = config.title || "I am always here.";

  useEffect(() => {
     const handleOrientation = (e: DeviceOrientationEvent) => {
        setOrientation({
           alpha: e.alpha || 0,
           beta: e.beta || 0,
           gamma: e.gamma || 0
        });
     };

     if (hasPermission === true) {
        window.addEventListener("deviceorientation", handleOrientation);
     }

     return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
     };
  }, [hasPermission]);

  const requestAccess = async () => {
     if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
           const permission = await (DeviceOrientationEvent as any).requestPermission();
           setHasPermission(permission === 'granted');
        } catch (e) {
           setHasPermission(false);
        }
     } else {
        // Non-iOS 13+ devices
        setHasPermission(true);
     }
  };

  // Mock orientation changes for desktop editor
  const handleDrag = (e: any, info: any) => {
     if (hasPermission === true) return; // Don't override real gyro
     
     setOrientation(prev => ({
        ...prev,
        alpha: (prev.alpha - info.delta.x * 0.5 + 360) % 360,
        beta: Math.max(-90, Math.min(90, prev.beta - info.delta.y * 0.5))
     }));
  };

  useEffect(() => {
     // Check if we are close to the target
     // Alpha can wrap around 360, so we check shortest distance
     let alphaDiff = Math.abs(orientation.alpha - targetAlpha);
     if (alphaDiff > 180) alphaDiff = 360 - alphaDiff;
     
     const betaDiff = Math.abs(orientation.beta - targetBeta);

     // Within ~15 degrees
     if (alphaDiff < 15 && betaDiff < 15) {
        if (!isFound) {
           setIsFound(true);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100, 50]);
           if (onComplete) setTimeout(onComplete, 5000);
        }
     } else {
        // Only reset if they drift far away (hysteresis)
        if (alphaDiff > 30 || betaDiff > 30) {
           setIsFound(false);
        }
     }
  }, [orientation, isFound, onComplete]);

  // Generate star field
  const stars = useMemo(() => {
     const arr = [];
     for(let i=0; i<300; i++) {
        arr.push({
           x: (Math.random() - 0.5) * 2000,
           y: (Math.random() - 0.5) * 2000,
           z: (Math.random() - 0.5) * 1000 - 500,
           size: Math.random() * 2 + 1,
           opacity: Math.random() * 0.8 + 0.2
        });
     }
     return arr;
  }, []);

  // Calculate 3D rotations based on gyro
  // Note: True 3D projection requires matrices, we use Framer Motion 3D transforms for a pseudo-3D look
  const rotateY = -orientation.alpha; 
  const rotateX = orientation.beta;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white bg-black touch-none select-none"
    >
      
      {/* 3D Scene Container */}
      <motion.div 
         className="absolute inset-0 z-0 flex items-center justify-center cursor-move"
         style={{ perspective: 800 }}
         drag
         onDrag={handleDrag}
         dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
         dragElastic={0}
      >
         <motion.div
            className="relative w-full h-full transform-style-3d"
            animate={{ 
               rotateX: rotateX,
               rotateY: rotateY
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
            style={{ transformStyle: 'preserve-3d' }}
         >
            
            {/* The Stars */}
            {stars.map((s, i) => (
               <div 
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                     left: '50%', top: '50%',
                     width: s.size, height: s.size,
                     opacity: s.opacity,
                     transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px)`
                  }}
               />
            ))}

            {/* The Target Constellation / Message */}
            <div 
               className="absolute flex items-center justify-center"
               style={{
                  left: '50%', top: '50%',
                  // Placed exactly where targetAlpha/Beta would aim us
                  transform: `rotateY(${targetAlpha}deg) rotateX(${-targetBeta}deg) translateZ(-600px)`
               }}
            >
               <div className="flex flex-col items-center">
                  <div className={`text-6xl font-black text-white whitespace-nowrap tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-opacity duration-1000 ${isFound ? 'opacity-100' : 'opacity-0'}`}>
                     {message}
                  </div>
                  {/* Subtle hint marker */}
                  <div className={`mt-4 w-4 h-4 rounded-full bg-white/20 blur-sm transition-opacity duration-1000 ${isFound ? 'opacity-0' : 'opacity-100 animate-pulse'}`} />
               </div>
            </div>

         </motion.div>
      </motion.div>

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
         
         <div className="flex justify-between items-start">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
               <Compass size={16} className="text-cyan-400" />
               <span className="font-mono text-xs font-bold text-white/80">
                  {Math.round(orientation.alpha)}° N
               </span>
            </div>
            
            {hasPermission !== true && (
               <button 
                  onClick={requestAccess}
                  className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest pointer-events-auto transition-colors shadow-lg"
               >
                  <Smartphone size={14} /> Enable Gyro
               </button>
            )}
         </div>

         <div className="text-center bg-gradient-to-t from-black to-transparent pt-20 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">
               {isFound ? "Alignment Achieved" : "Search the sky"}
            </h3>
            <p className="text-white/30 text-xs max-w-[200px] mx-auto">
               {hasPermission ? "Move your phone around to look." : "Drag the screen to look around."}
            </p>
         </div>

      </div>

    </div>
  );
}
