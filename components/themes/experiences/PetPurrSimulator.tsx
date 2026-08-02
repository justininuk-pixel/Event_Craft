"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Cat, Dog, Heart, Play, Square, Activity } from "lucide-react";

export function PetPurrSimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff1f2"]; // rose-50

  const petType = (config.experience as any)?.petType || "cat"; // "cat" or "dog"
  const petName = config.title || "Your Companion";
  
  const [isPurring, setIsPurring] = useState(false);
  const [purrPulse, setPurrPulse] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cat purr pattern: continuous rumble. ~25Hz, so 20ms on, 20ms off repeating. We'll do chunks to not overload browser API.
  // 1000ms vibration, 50ms pause, loop.
  const catPattern = [1000, 50, 1000, 50, 1000, 50]; 
  
  // Dog heartbeat pattern: lub-dub
  const dogPattern = [100, 100, 150, 650]; 

  const pattern = petType === "cat" ? catPattern : dogPattern;
  const loopTime = petType === "cat" ? 1050 : 1000;

  const togglePurr = () => {
     if (isPurring) {
        setIsPurring(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
           navigator.vibrate(0); // stop
        }
        if (intervalRef.current) {
           clearInterval(intervalRef.current);
           intervalRef.current = null;
        }
     } else {
        setIsPurring(true);
        triggerVibration();
        intervalRef.current = setInterval(() => {
           triggerVibration();
        }, loopTime);
        
        if (onComplete) {
           setTimeout(onComplete, 10000); // mark complete after 10s of purring
        }
     }
  };

  const triggerVibration = () => {
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
     }
     // Visual pulse for editor
     setPurrPulse(true);
     setTimeout(() => setPurrPulse(false), loopTime / 2);
  };

  useEffect(() => {
     return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(0);
     };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight" style={{ color: primaryColor }}>
               {petName}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-[250px] mx-auto leading-relaxed">
               {config.body || (petType === "cat" ? "Hold the phone against your chest to feel the purr." : "Hold the phone to feel the heartbeat.")}
            </p>
         </div>

         {/* Pet Visual */}
         <div className="relative w-48 h-48 mb-12">
            
            {/* Sleeping indicator (Zzz) */}
            <AnimatePresence>
               {isPurring && (
                  <>
                     <motion.div 
                        initial={{ opacity: 0, x: 0, y: 0 }} 
                        animate={{ opacity: [0, 1, 0], x: 20, y: -40 }} 
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-4 right-0 font-bold text-slate-400"
                     >
                        Z
                     </motion.div>
                     <motion.div 
                        initial={{ opacity: 0, x: 0, y: 0 }} 
                        animate={{ opacity: [0, 1, 0], x: 30, y: -60 }} 
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        className="absolute top-0 right-[-10px] font-bold text-slate-400 text-sm"
                     >
                        z
                     </motion.div>
                  </>
               )}
            </AnimatePresence>

            <motion.div 
               className="w-full h-full rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100 relative"
               animate={{ 
                  scale: isPurring ? (petType === "cat" ? [1, 1.02, 1] : [1, 1.1, 1, 1.05, 1]) : 1 
               }}
               transition={{ 
                  duration: petType === "cat" ? 1.05 : 1, 
                  repeat: isPurring ? Infinity : 0,
                  ease: "easeInOut"
               }}
            >
               {petType === "cat" ? (
                  <Cat size={80} style={{ color: primaryColor }} className="opacity-80" />
               ) : (
                  <Dog size={80} style={{ color: primaryColor }} className="opacity-80" />
               )}

               {/* Ambient warmth overlay */}
               {isPurring && (
                  <motion.div 
                     className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.3)] pointer-events-none"
                     style={{ boxShadow: `0 0 30px ${primaryColor}60` }}
                     animate={{ opacity: [0.5, 1, 0.5] }}
                     transition={{ duration: petType === "cat" ? 0.2 : 1, repeat: Infinity }}
                  />
               )}
            </motion.div>

         </div>

         {/* Controls */}
         <button 
            onClick={togglePurr}
            className="w-full max-w-[250px] py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm"
            style={{ 
               backgroundColor: isPurring ? 'white' : primaryColor,
               color: isPurring ? primaryColor : 'white',
               border: isPurring ? `2px solid ${primaryColor}` : 'none'
            }}
         >
            {isPurring ? <><Square size={18} fill="currentColor" /> Sleep</> : <><Play size={18} fill="currentColor" /> {petType === "cat" ? "Start Purring" : "Start Heartbeat"}</>}
         </button>

         {/* Editor Visual Feedback */}
         {mode === "editor-preview" && isPurring && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center text-slate-400">
               <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Activity size={14} className={purrPulse ? "text-rose-500" : "text-slate-300"} /> Haptic Active
               </div>
            </div>
         )}

      </div>

    </div>
  );
}
