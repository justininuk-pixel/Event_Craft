"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Mic2, Activity } from "lucide-react";

export function AudioWaveformEngraver({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // stone-900
  
  const title = config.title || "The Voice Note";
  const caption = config.body || "I love you. Call me back when you get this.";
  const audioSrc = (config.experience as any)?.audioSrc || null; // Assume we have a simulated one

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate a random waveform for the visual
  const [waveform, setWaveform] = useState<number[]>([]);
  useEffect(() => {
    const arr = [];
    for(let i=0; i<100; i++) {
      // Create an envelope shape
      const env = Math.sin((i / 100) * Math.PI);
      arr.push(Math.random() * 40 * env + 10 * env);
    }
    setWaveform(arr);
  }, []);

  const togglePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setProgress(0);

    const duration = 5000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-stone-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 pointer-events-none" />

      <div className="absolute top-12 w-full text-center z-10">
         <Mic2 size={32} className="mx-auto text-amber-500 mb-4 opacity-50" />
         <h2 className="text-xl font-black text-stone-200 tracking-widest uppercase">{title}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
        
        {/* The Waveform Display */}
        <div 
          className="w-full h-48 flex items-center justify-center gap-1 cursor-pointer relative"
          onClick={togglePlay}
        >
          {/* Laser engraver effect */}
          {isPlaying && (
            <motion.div 
              className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_10px_rgba(245,158,11,0.5)] z-20 pointer-events-none"
              style={{ left: `${progress * 100}%` }}
            />
          )}

          {waveform.map((val, i) => {
            const isEngraved = progress * 100 >= i;
            return (
               <motion.div 
                 key={i}
                 className="w-1 rounded-full transition-colors duration-75"
                 style={{ 
                    height: `${val}%`, 
                    backgroundColor: isEngraved ? primaryColor : "#44403c" // stone-700
                 }}
                 animate={isPlaying && isEngraved && progress * 100 - i < 2 ? {
                    scaleY: [1, 1.5, 1],
                    boxShadow: ["0 0 0px transparent", `0 0 10px ${primaryColor}`, "0 0 0px transparent"]
                 } : {}}
               />
            );
          })}
        </div>

        {/* Playback Controls & Caption */}
        <div className="mt-12 text-center w-full max-w-sm">
          {!isPlaying && progress === 0 ? (
             <button 
               onClick={togglePlay}
               className="px-6 py-3 rounded-full bg-amber-500 text-stone-900 font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]"
             >
               Play Recording
             </button>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: progress > 0.5 ? 1 : 0 }}
               className="p-6 bg-stone-800/80 rounded-xl border border-stone-700 shadow-xl backdrop-blur"
             >
               <Activity size={24} className="mx-auto text-amber-500 mb-4 animate-pulse" />
               <p className="text-stone-300 font-serif italic text-lg">"{caption}"</p>
             </motion.div>
          )}
        </div>

      </div>

    </div>
  );
}
