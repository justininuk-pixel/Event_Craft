"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Sparkles, CalendarHeart } from "lucide-react";
import { motion } from "framer-motion";

export function FadeInEventCountdown({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  // We need a start date and an end date to calculate the percentage.
  // For the demo, let's say the event is in 30 days, and it started 60 days ago.
  // That means we are 66% of the way there.
  
  const [now, setNow] = useState(() => Date.now());
  const [simulatedEnd, setSimulatedEnd] = useState(() => Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [simulatedStart, setSimulatedStart] = useState(() => Date.now() - 60 * 24 * 60 * 60 * 1000);

  useEffect(() => {
     const timer = setInterval(() => {
        setNow(Date.now());
     }, 1000);
     return () => clearInterval(timer);
  }, []);

  const totalDuration = simulatedEnd - simulatedStart;
  const timeElapsed = Math.max(0, now - simulatedStart);
  
  // Percentage from 0 to 1
  let progress = Math.min(1, timeElapsed / totalDuration);
  
  // If we are in editor preview, let the user override the progress via a slider
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  
  if (previewProgress !== null) {
     progress = previewProgress;
  }

  // Calculate blur (starts at 40px, ends at 0px)
  const blurAmount = Math.max(0, 40 - (progress * 40));
  
  // Calculate grayscale (starts at 100%, ends at 0%)
  const grayscaleAmount = Math.max(0, 100 - (progress * 100));

  const timeLeft = simulatedEnd - now;
  const isComplete = timeLeft <= 0 || progress >= 1;

  useEffect(() => {
     if (isComplete && onComplete && previewProgress === null) {
        onComplete();
     }
  }, [isComplete, onComplete, previewProgress]);

  // Format time remaining
  const d = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const h = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const m = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const s = Math.max(0, Math.floor((timeLeft % (1000 * 60)) / 1000));

  const backgroundImage = config.mediaUrl || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"; // Wedding venue

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center font-sans overflow-hidden bg-black text-white"
    >
      
      {/* Background Image with Dynamic CSS Filters */}
      <div 
         className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
         style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: `blur(${blurAmount}px) grayscale(${grayscaleAmount}%) brightness(${0.3 + (progress * 0.7)})`,
            transform: `scale(${1.1 - (progress * 0.1)})` // subtle zoom out as it resolves
         }}
      />
      
      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full max-w-4xl mx-auto h-full">
         
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center space-y-12 w-full"
         >
            <div className="space-y-4">
               <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-md mb-2">
                  <CalendarHeart size={32} style={{ color: primaryColor }} />
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl font-serif italic">
                  {config.title || "The Wedding"}
               </h2>
            </div>

            {/* The Countdown */}
            {!isComplete ? (
               <div className="grid grid-cols-4 gap-4 w-full max-w-2xl mx-auto">
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                     <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter">{d}</span>
                     <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/50 mt-1">Days</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                     <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter">{h.toString().padStart(2, '0')}</span>
                     <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/50 mt-1">Hrs</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                     <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter">{m.toString().padStart(2, '0')}</span>
                     <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/50 mt-1">Min</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                     <span className="text-4xl md:text-6xl font-black tabular-nums tracking-tighter" style={{ color: primaryColor }}>
                        {s.toString().padStart(2, '0')}
                     </span>
                     <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/50 mt-1">Sec</span>
                  </div>

               </div>
            ) : (
               <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-[0_0_100px_rgba(244,63,94,0.3)]"
               >
                  <h3 className="text-5xl md:text-7xl font-black tracking-tight flex items-center justify-center gap-4">
                     <Sparkles size={48} className="text-yellow-400" />
                     It's Here!
                     <Sparkles size={48} className="text-yellow-400" />
                  </h3>
               </motion.div>
            )}

            {/* Progress Bar (Visualizer) */}
            <div className="w-full max-w-md mx-auto space-y-2 mt-12">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>Start</span>
                  <span>{Math.round(progress * 100)}%</span>
                  <span>Event</span>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                     className="h-full bg-white transition-all duration-1000 ease-out" 
                     style={{ width: `${progress * 100}%`, backgroundColor: primaryColor }}
                  />
               </div>
            </div>

         </motion.div>
      </div>

      {/* Editor Bypass / Time Travel */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 left-4 right-4 z-50 pointer-events-auto p-4 bg-black/80 backdrop-blur border border-white/20 rounded-xl shadow-2xl">
            <div className="flex flex-col gap-2">
               <div className="flex justify-between text-xs font-bold text-white uppercase tracking-widest">
                  <span>Time Travel (Editor)</span>
                  <span>{previewProgress === null ? 'Realtime' : `${Math.round(previewProgress * 100)}%`}</span>
               </div>
               <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={previewProgress === null ? progress : previewProgress}
                  onChange={(e) => setPreviewProgress(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
               />
               <div className="flex justify-between">
                  <button 
                     onClick={() => setPreviewProgress(null)}
                     className="text-[10px] uppercase font-bold text-white/50 hover:text-white"
                  >
                     Reset to Realtime
                  </button>
                  <button 
                     onClick={() => setPreviewProgress(1)}
                     className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300"
                  >
                     Skip to End
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
