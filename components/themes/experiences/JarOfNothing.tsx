"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw } from "lucide-react";

export function JarOfNothing({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const messages = ((config.experience as any)?.items as any[])?.map((f: any) => f.title) || [
     "Your laugh is my favorite sound.",
     "I love how passionate you are.",
     "You always know how to make me smile.",
     "Your kindness inspires me.",
     "I love your weird jokes.",
     "You make every day better."
  ];

  const [isShaking, setIsShaking] = useState(false);
  const [poppedMessage, setPoppedMessage] = useState<string | null>(null);
  
  // Fake device motion detection for mobile
  useEffect(() => {
     const handleMotion = (e: DeviceMotionEvent) => {
        if (!e.accelerationIncludingGravity) return;
        const { x, y, z } = e.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;
        
        const acceleration = Math.sqrt(x*x + y*y + z*z);
        if (acceleration > 20 && !isShaking && !poppedMessage) { // Threshold for a good shake
           triggerShake();
        }
     };

     if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
     }
     
     return () => {
        if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
           window.removeEventListener('devicemotion', handleMotion);
        }
     };
  }, [isShaking, poppedMessage]);

  const triggerShake = () => {
     setIsShaking(true);
     
     // Haptic feedback
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 50, 50, 50, 100]);
     }

     setTimeout(() => {
        setIsShaking(false);
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setPoppedMessage(randomMsg);
        if (onComplete) {
           setTimeout(onComplete, 4000);
        }
     }, 1500); // 1.5s of shaking before popping
  };

  // Generate 50 fake stars for the jar background
  const fakeStars = Array.from({ length: 50 }).map((_, i) => ({
     id: i,
     left: `${20 + Math.random() * 60}%`,
     bottom: `${5 + Math.random() * 50}%`,
     rotate: Math.random() * 360,
     scale: 0.5 + Math.random() * 0.5
  }));

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto relative">
         
         {/* The Jar Container */}
         <AnimatePresence mode="wait">
            {!poppedMessage ? (
               <motion.div 
                  key="jar"
                  className="relative flex flex-col items-center justify-center w-full max-w-[280px] mx-auto cursor-pointer"
                  animate={{
                     x: isShaking ? [-10, 10, -10, 10, -5, 5, 0] : 0,
                     y: isShaking ? [-5, 5, -5, 5, 0] : 0,
                     rotate: isShaking ? [-5, 5, -5, 5, 0] : 0
                  }}
                  transition={{ duration: 0.4, repeat: isShaking ? Infinity : 0 }}
                  onClick={!isShaking ? triggerShake : undefined}
               >
                  {/* Jar Lid */}
                  <div className="w-32 h-8 bg-slate-300 rounded-t-lg border-b-4 border-slate-400 shadow-md relative z-20">
                     <div className="absolute top-1 left-2 right-2 h-1 bg-white/50 rounded-full" />
                  </div>
                  <div className="w-28 h-4 bg-slate-200/50 backdrop-blur z-20 relative -mt-1" />
                  
                  {/* Jar Body */}
                  <div className="w-48 h-64 bg-white/20 backdrop-blur-md rounded-b-[40px] border-4 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center justify-end z-10 pb-4">
                     
                     {/* Glass reflections */}
                     <div className="absolute top-4 left-4 w-4 h-48 bg-white/40 rounded-full blur-[2px]" />
                     <div className="absolute top-8 right-6 w-2 h-32 bg-white/30 rounded-full blur-[1px]" />

                     {/* The Stars inside */}
                     {fakeStars.map((s) => (
                        <motion.div
                           key={s.id}
                           className="absolute origin-center"
                           style={{ 
                              left: s.left, 
                              bottom: s.bottom, 
                              color: primaryColor,
                              transform: `rotate(${s.rotate}deg) scale(${s.scale})` 
                           }}
                           animate={{
                              y: isShaking ? [-20, 20, -10, 10, 0].map(v => v * Math.random()) : 0,
                              x: isShaking ? [-20, 20, -10, 10, 0].map(v => v * Math.random()) : 0,
                              rotate: isShaking ? s.rotate + 180 : s.rotate
                           }}
                           transition={{ duration: 0.3, repeat: isShaking ? Infinity : 0 }}
                        >
                           <Star size={20} fill="currentColor" />
                        </motion.div>
                     ))}

                     {/* The Label */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-16 bg-[#fef08a] rounded shadow-sm flex items-center justify-center p-2 border border-[#fde047] rotate-[-5deg]">
                        <span className="text-[10px] font-black text-amber-900 text-center leading-tight uppercase tracking-widest">
                           {config.title || "Reasons I Love You"}
                        </span>
                     </div>
                  </div>
                  
                  <div className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
                     {mode === "editor-preview" ? "Click to Shake" : "Shake your phone"}
                  </div>

               </motion.div>
            ) : (
               <motion.div 
                  key="popped"
                  initial={{ opacity: 0, scale: 0.5, y: 100 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full flex flex-col items-center justify-center relative z-30"
               >
                  <motion.div 
                     className="w-32 h-32 mb-8 relative flex items-center justify-center"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                     <Star size={120} fill={primaryColor} color={primaryColor} className="drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
                  </motion.div>

                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-amber-100 text-center relative max-w-[300px]">
                     {/* Fold crease details */}
                     <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-200/50" />
                     <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200/50" />
                     
                     <p className="text-2xl font-black text-slate-800 leading-tight relative z-10 font-serif italic">
                        "{poppedMessage}"
                     </p>
                  </div>

                  <button
                     onClick={() => setPoppedMessage(null)}
                     className="mt-12 bg-white/50 hover:bg-white text-slate-500 px-6 py-3 rounded-full shadow-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-slate-200"
                  >
                     <RefreshCw size={14} /> Put it back
                  </button>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
