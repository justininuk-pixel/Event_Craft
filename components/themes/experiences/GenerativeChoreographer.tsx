"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useAnimation } from "framer-motion";
import { Activity, Play, Square } from "lucide-react";

export function GenerativeChoreographer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  // We use Framer Motion to simulate "IK" joint rotations on a 2D stick figure
  const controls = useAnimation();
  
  useEffect(() => {
     if (isPlaying) {
        const beatDuration = 60 / bpm;
        controls.start({
           rotate: [0, 15, -15, 0],
           y: [0, -20, 0],
           transition: {
              duration: beatDuration,
              repeat: Infinity,
              ease: "easeInOut"
           }
        });
     } else {
        controls.stop();
        controls.set({ rotate: 0, y: 0 });
     }
  }, [isPlaying, bpm, controls]);

  const togglePlay = () => {
     if (isPlaying) {
        setIsPlaying(false);
        if (onComplete) setTimeout(onComplete, 2000);
     } else {
        setIsPlaying(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     }
  };

  const beatDuration = 60 / bpm;

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-900 text-blue-400" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-blue-900/50 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} /> Procedural IK Rig
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full">
         
         {/* The 2D Simulated Stick Figure */}
         <div className="relative w-64 h-96 border border-blue-900/30 rounded-3xl bg-slate-950 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            
            <motion.div 
               animate={controls}
               className="relative flex flex-col items-center"
            >
               {/* Head */}
               <motion.div 
                  className="w-12 h-12 rounded-full border-4 border-blue-500 bg-slate-900 mb-2 z-10"
                  animate={{ 
                     rotate: isPlaying ? [0, 10, -10, 0] : 0,
                     scale: isPlaying ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: beatDuration / 2, repeat: Infinity }}
               />

               {/* Torso */}
               <div className="w-2 h-24 bg-blue-500 relative z-0">
                  
                  {/* Left Arm */}
                  <motion.div 
                     className="absolute top-2 right-1 w-20 h-2 bg-blue-500 origin-left"
                     animate={{ 
                        rotate: isPlaying ? [45, 135, 45] : 45 
                     }}
                     transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Right Arm */}
                  <motion.div 
                     className="absolute top-2 left-1 w-20 h-2 bg-blue-500 origin-right"
                     animate={{ 
                        rotate: isPlaying ? [-45, -135, -45] : -45 
                     }}
                     transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut", delay: beatDuration/2 }}
                  />

                  {/* Left Leg */}
                  <motion.div 
                     className="absolute bottom-0 right-1 w-24 h-2 bg-blue-500 origin-left"
                     animate={{ 
                        rotate: isPlaying ? [70, 110, 70] : 70 
                     }}
                     transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Right Leg */}
                  <motion.div 
                     className="absolute bottom-0 left-1 w-24 h-2 bg-blue-500 origin-right"
                     animate={{ 
                        rotate: isPlaying ? [-70, -110, -70] : -70 
                     }}
                     transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut", delay: beatDuration/2 }}
                  />
               </div>
            </motion.div>

            {/* Floor */}
            <div className="absolute bottom-16 w-48 h-1 bg-blue-900/50 rounded-full" />
            <motion.div 
               className="absolute bottom-16 w-32 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"
               animate={{ opacity: isPlaying ? [0.2, 1, 0.2] : 0.2, scaleX: isPlaying ? [0.8, 1.2, 0.8] : 1 }}
               transition={{ duration: beatDuration / 2, repeat: Infinity }}
            />

         </div>

      </div>

      <div className="p-6 bg-slate-950 border-t border-blue-900/50 shrink-0 space-y-6">
         
         <div className="flex items-center gap-6">
            <button 
               onClick={togglePlay}
               className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                  isPlaying ? "bg-red-500/20 text-red-500 border border-red-500" : "bg-blue-600 hover:bg-blue-500 text-white"
               }`}
            >
               {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <div className="flex-1 space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-300">
                  <span>Generative BPM</span>
                  <span>{bpm}</span>
               </div>
               <input 
                  type="range" 
                  min="40" max="200" step="1" 
                  value={bpm}
                  onChange={e => setBpm(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-full appearance-none outline-none"
               />
               <div className="flex justify-between text-[10px] uppercase tracking-widest text-blue-500/50">
                  <span>Slow/Fluid</span>
                  <span>Fast/Aggressive</span>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
