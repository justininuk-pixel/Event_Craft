"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, CloudRain } from "lucide-react";

export function SoundOfHome({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(50); // visual representation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // In a real implementation we would hook an AudioContext AnalyserNode to the audio to drive the visualizer
  // For this demo, we'll simulate the "lava lamp" pulsing effect.

  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (isPlaying) {
        interval = setInterval(() => {
           // Simulate slight volume variations for the visualizer
           setVolumeLevel(40 + Math.random() * 40);
        }, 800);
     } else {
        setVolumeLevel(20); // base idle level
     }
     return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
     setIsPlaying(!isPlaying);
     if (onComplete && !isPlaying) {
        // Complete the experience shortly after they start listening
        setTimeout(onComplete, 10000); 
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Lava Lamp Visualizer Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden blur-3xl opacity-50">
         <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen"
            style={{ backgroundColor: primaryColor }}
            animate={{ 
               scale: isPlaying ? [1, 1.2, 0.9, 1.1, 1] : 1,
               x: isPlaying ? [0, 50, -20, 30, 0] : 0,
               y: isPlaying ? [0, -30, 40, -10, 0] : 0,
               opacity: isPlaying ? 0.8 : 0.2
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
         />
         <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full mix-blend-screen"
            style={{ backgroundColor: primaryColor }}
            animate={{ 
               scale: isPlaying ? [1, 1.3, 0.8, 1.2, 1] : 1,
               x: isPlaying ? [0, -40, 30, -20, 0] : 0,
               y: isPlaying ? [0, 40, -30, 20, 0] : 0,
               opacity: isPlaying ? 0.6 : 0.1
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
         />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 w-full max-w-md mx-auto text-center">
         
         <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-xl">
            <CloudRain size={32} className="text-white opacity-80" />
         </div>

         <h2 className="text-3xl font-black tracking-tight mb-3 drop-shadow-md">
            {config.title || "Rain on the Tin Roof"}
         </h2>
         <p className="text-slate-400 font-medium max-w-[250px] leading-relaxed mb-12">
            {config.body || "Close your eyes. We're back in Seattle."}
         </p>

         {/* The Minimalist Player Controls */}
         <div className="relative">
            {/* Visualizer Ring */}
            <motion.div 
               className="absolute inset-0 rounded-full border border-white/20"
               animate={{ 
                  scale: isPlaying ? 1 + (volumeLevel / 100) * 0.5 : 1,
                  opacity: isPlaying ? 0 : 0
               }}
               transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.div 
               className="absolute inset-0 rounded-full border border-white/10"
               animate={{ 
                  scale: isPlaying ? 1 + (volumeLevel / 100) * 0.8 : 1,
                  opacity: isPlaying ? [0.5, 0] : 0
               }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />

            <button
               onClick={togglePlay}
               className="relative w-24 h-24 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all z-10"
            >
               {isPlaying ? (
                  <Pause size={32} fill="currentColor" />
               ) : (
                  <Play size={32} fill="currentColor" className="ml-2" />
               )}
            </button>
         </div>

      </div>

      {/* Fake Audio Element */}
      {/* <audio ref={audioRef} src={config.audioUrl || "/ambient-rain.mp3"} loop /> */}

      {/* Status Bar */}
      <div className="h-20 flex items-center justify-center px-8 z-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
         <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Volume2 size={16} />
            <span className="w-32 bg-white/10 h-1 rounded-full overflow-hidden">
               <motion.div 
                  className="h-full bg-white/50 rounded-full" 
                  animate={{ width: isPlaying ? '70%' : '20%' }}
                  transition={{ duration: 1 }}
               />
            </span>
            <span>Ambient Loop</span>
         </div>
      </div>

    </div>
  );
}
