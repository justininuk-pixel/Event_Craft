"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useAnimation } from "framer-motion";
import { Heart, Activity } from "lucide-react";

// Mock HR data: array of intervals between beats in ms (e.g. 60bpm = 1000ms)
// Let's create a sequence that starts normal (70bpm = ~857ms), speeds up (120bpm = 500ms), and slows down
const mockHeartbeatIntervals = [
  850, 840, 830, 820, 800, 780, 750, 700, 650, 600, 550, 520, 500, 490, 480, 490, 510, 550, 600, 650, 700, 750, 800, 820, 840, 850
];

export function SharedHeartbeat({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef2f2"]; // red-50

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
     let timeout: NodeJS.Timeout;

     if (isPlaying) {
        const interval = mockHeartbeatIntervals[currentBeatIndex];
        
        // Trigger heartbeat animation
        // A heartbeat is usually a double pump (lub-dub). 
        // We can simulate this with keyframes.
        controls.start({
           scale: [1, 1.15, 1, 1.05, 1],
           opacity: [0.8, 1, 0.9, 1, 0.8],
           transition: { duration: interval / 1000, times: [0, 0.1, 0.2, 0.3, 1] }
        });

        timeout = setTimeout(() => {
           if (currentBeatIndex < mockHeartbeatIntervals.length - 1) {
              setCurrentBeatIndex(prev => prev + 1);
           } else {
              // Loop back to start
              setCurrentBeatIndex(0);
           }
        }, interval);
     } else {
        controls.stop();
        controls.set({ scale: 1, opacity: 0.8 });
     }

     return () => clearTimeout(timeout);
  }, [isPlaying, currentBeatIndex, controls]);

  const handleToggle = () => {
     if (!isPlaying) {
        setIsPlaying(true);
        setCurrentBeatIndex(0);
     } else {
        setIsPlaying(false);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 items-center justify-center"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Dynamic Background Glow */}
      <motion.div
         className="absolute inset-0 opacity-20 pointer-events-none"
         style={{ backgroundColor: primaryColor }}
         animate={controls}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none text-center">
         <div className="w-full">
            <h2 className="text-xl font-black tracking-tight mb-1 flex items-center justify-center gap-2" style={{ color: primaryColor }}>
               <Activity size={20} />
               {config.title || "My Heart When I Saw You"}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Real biometric data visualization"}
            </p>
         </div>
      </div>

      {/* Main Heart */}
      <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={handleToggle}>
         
         <div className="relative flex items-center justify-center mb-8">
            {/* Outer rings */}
            <motion.div className="absolute inset-0 rounded-full border-2 opacity-20" style={{ borderColor: primaryColor }} animate={controls} />
            <motion.div className="absolute -inset-4 rounded-full border opacity-10" style={{ borderColor: primaryColor }} animate={controls} />
            <motion.div className="absolute -inset-8 rounded-full border opacity-5" style={{ borderColor: primaryColor }} animate={controls} />
            
            <motion.div animate={controls} className="relative z-10 p-4">
               <Heart size={120} fill={primaryColor} color={primaryColor} className="drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]" />
            </motion.div>
         </div>

         {!isPlaying ? (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest"
            >
               Tap to feel
            </motion.div>
         ) : (
            <div className="flex flex-col items-center">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Current Rate
               </div>
               <div className="text-3xl font-black tabular-nums" style={{ color: primaryColor }}>
                  {Math.round(60000 / mockHeartbeatIntervals[currentBeatIndex])} <span className="text-sm font-bold text-slate-400">BPM</span>
               </div>
            </div>
         )}
      </div>

      {/* Editor/Graph view */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-white/50 backdrop-blur border-t border-white/20 p-4 flex flex-col pointer-events-none">
         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Biometric Data Source (Mock)</div>
         <div className="flex-1 flex items-end gap-1 opacity-40">
            {mockHeartbeatIntervals.map((interval, i) => {
               // Inverse because lower interval = higher BPM = taller bar
               const heightPct = (400 / interval) * 20; 
               return (
                  <div key={i} className="flex-1 bg-red-400 rounded-t-sm transition-opacity" style={{ 
                     height: `${Math.min(100, Math.max(10, heightPct))}%`,
                     opacity: i === currentBeatIndex && isPlaying ? 1 : 0.3
                  }} />
               )
            })}
         </div>
      </div>

    </div>
  );
}
