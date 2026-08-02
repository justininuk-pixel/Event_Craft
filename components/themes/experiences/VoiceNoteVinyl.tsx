"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useAnimation } from "framer-motion";
import { Disc3, PlayCircle, SkipForward } from "lucide-react";

export function VoiceNoteVinyl({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#facc15"; // yellow-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#451a03"]; // stone-900 / dark brown

  // Dummy audio data for demo
  const audioDuration = 60; // 60 seconds mock
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tonearmAngle, setTonearmAngle] = useState(-30); // Rest position
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // We simulate audio playback visually for the demo unless we actually fetch a real blob
  const togglePlay = (forceState?: boolean) => {
     const nextState = forceState !== undefined ? forceState : !isPlaying;
     setIsPlaying(nextState);
     
     if (nextState) {
        setTonearmAngle(15); // Move arm to record
        progressIntervalRef.current = setInterval(() => {
           setProgress(p => {
              const next = p + (100 / audioDuration) * 0.1; // Updates every 100ms
              if (next >= 100) {
                 stopPlayback();
                 if (onComplete) onComplete();
                 return 100;
              }
              return next;
           });
        }, 100);
     } else {
        stopPlayback();
     }
  };

  const stopPlayback = () => {
     setIsPlaying(false);
     setTonearmAngle(-30); // Return arm
     if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
     }
  };

  const handleBump = () => {
     if (!isPlaying) return;
     // Simulate skipping
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);
     setProgress(p => Math.min(100, p + (Math.random() * 10 - 2))); // Jump randomly
     
     // Visual jolt
     setTonearmAngle(prev => prev + (Math.random() > 0.5 ? 5 : -5));
     setTimeout(() => setTonearmAngle(15 + (progress / 100) * 20), 200); // Return roughly to groove
  };

  useEffect(() => {
     // Listen for accelerometer bumps
     const handleMotion = (e: DeviceMotionEvent) => {
        if (!isPlaying) return;
        const acc = e.acceleration || e.accelerationIncludingGravity;
        if (acc) {
           const threshold = 15; // m/s^2
           const magnitude = Math.sqrt((acc.x||0)**2 + (acc.y||0)**2 + (acc.z||0)**2);
           if (magnitude > threshold) {
              handleBump();
           }
        }
     };

     if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
           .then((response: string) => {
              if (response == 'granted') window.addEventListener('devicemotion', handleMotion);
           })
           .catch(console.error);
     } else {
        window.addEventListener('devicemotion', handleMotion);
     }

     return () => {
        window.removeEventListener('devicemotion', handleMotion);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
     };
  }, [isPlaying, progress]);

  // Sync tonearm to progress while playing
  useEffect(() => {
     if (isPlaying) {
        // Arm moves from ~15deg (outer edge) to ~35deg (inner edge)
        setTonearmAngle(15 + (progress / 100) * 20);
     }
  }, [progress, isPlaying]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
         
         <div className="absolute top-12 left-0 right-0 text-center z-10">
            <h2 className="text-2xl font-serif italic text-white/90 drop-shadow-md">
               {config.title || "Press Play."}
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-[200px] mx-auto">
               Careful not to bump the record player while it's spinning.
            </p>
         </div>

         {/* Turntable Base */}
         <div className="relative w-80 h-80 bg-zinc-800 rounded-3xl shadow-2xl border-t-2 border-zinc-700 flex items-center justify-center mt-12 p-4">
            
            {/* The Record (Vinyl) */}
            <motion.div 
               className="relative w-64 h-64 rounded-full bg-black shadow-xl flex items-center justify-center cursor-pointer border-4 border-zinc-900"
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 1.8, ease: "linear", repeat: isPlaying ? Infinity : 0 }}
               onClick={() => togglePlay()}
            >
               {/* Grooves */}
               <div className="absolute inset-2 rounded-full border border-white/5" />
               <div className="absolute inset-4 rounded-full border border-white/5" />
               <div className="absolute inset-8 rounded-full border border-white/10" />
               <div className="absolute inset-12 rounded-full border border-white/5" />
               
               {/* Center Label */}
               <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: primaryColor }}>
                  <div className="w-3 h-3 rounded-full bg-zinc-400 shadow-sm border border-zinc-500 z-10" />
                  <div className="absolute inset-1 rounded-full border border-black/20" />
                  {/* Fake text on label */}
                  <div className="absolute top-3 text-[8px] font-bold text-black/40 uppercase tracking-widest text-center w-full px-2 leading-none">
                     Side A
                     <br/><span className="text-[6px]">33 1/3 RPM</span>
                  </div>
               </div>
               
               {/* Play/Pause Overlay Hint */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-full z-20">
                  <PlayCircle size={48} className="text-white drop-shadow-lg" />
               </div>
            </motion.div>

            {/* Tonearm Base */}
            <div className="absolute top-8 right-6 w-12 h-12 rounded-full bg-zinc-700 shadow-xl border-2 border-zinc-600 flex items-center justify-center z-20">
               <div className="w-6 h-6 rounded-full bg-zinc-900 shadow-inner" />
            </div>

            {/* Tonearm */}
            <motion.div
               className="absolute top-14 right-12 w-4 h-48 origin-top shadow-2xl z-30 pointer-events-none"
               animate={{ rotate: tonearmAngle }}
               transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
               {/* The Arm stick */}
               <div className="absolute top-0 left-1 w-2 h-40 bg-gradient-to-r from-zinc-300 to-zinc-400 rounded-full shadow-md" />
               {/* The Headshell */}
               <div className="absolute top-[150px] -left-2 w-6 h-10 bg-zinc-800 rounded-sm shadow-xl rotate-[20deg] border border-zinc-700 flex justify-end p-1">
                  {/* Stylus needle hint */}
                  <div className="w-1 h-1 rounded-full bg-red-500/50 mt-auto" />
               </div>
            </motion.div>

         </div>

         {/* Editor / Fallback Controls */}
         <div className="absolute bottom-12 w-full px-12 flex items-center gap-4 z-40">
            <button 
               onClick={() => togglePlay()}
               className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
            >
               {isPlaying ? <div className="w-4 h-4 bg-white" /> : <PlayCircle size={24} />}
            </button>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden relative">
               <div className="absolute top-0 left-0 bottom-0 bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            
            {mode === "editor-preview" && (
               <button 
                  onClick={handleBump}
                  className="px-3 py-2 text-xs font-bold bg-rose-500/80 text-white rounded-md shadow hover:bg-rose-500 transition-colors uppercase tracking-wider"
                  title="Simulate Bump"
               >
                  Bump
               </button>
            )}
         </div>

      </div>

    </div>
  );
}
