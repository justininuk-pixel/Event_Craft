"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, Calendar, Film } from "lucide-react";

type VideoClip = {
   id: string;
   src: string;
   dateLabel: string;
};

// Using a few reliable sample videos
const defaultClips: VideoClip[] = [
   { id: "1", src: "https://www.w3schools.com/html/mov_bbb.mp4", dateLabel: "Oct 1" },
   { id: "2", src: "https://www.w3schools.com/html/mov_bbb.mp4", dateLabel: "Oct 2" },
   { id: "3", src: "https://www.w3schools.com/html/mov_bbb.mp4", dateLabel: "Oct 3" },
   { id: "4", src: "https://www.w3schools.com/html/mov_bbb.mp4", dateLabel: "Oct 4" },
   { id: "5", src: "https://www.w3schools.com/html/mov_bbb.mp4", dateLabel: "Oct 5" },
];

export function OneSecondStitcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const clips = (config.experience as any)?.clips || defaultClips;
  const chunkDuration = (config.experience as any)?.chunkDuration || 1; // seconds

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startMontage = () => {
     setIsPlaying(true);
     setCurrentIndex(0);
     setIsFinished(false);
     playNextClip(0, 1);
  };

  const playNextClip = (index: number, activePlayer: 1 | 2) => {
     if (index >= clips.length) {
        setIsFinished(true);
    onComplete?.();
        setIsPlaying(false);
        if (onComplete) setTimeout(onComplete, 2000);
        return;
     }

     setCurrentIndex(index);
     setActiveVideo(activePlayer);
     
     const currentVid = activePlayer === 1 ? videoRef1.current : videoRef2.current;
     const nextVid = activePlayer === 1 ? videoRef2.current : videoRef1.current;
     
     if (!currentVid) return;

     // Setup current video to play 1 second from middle
     currentVid.src = clips[index].src;
     currentVid.muted = true; // Auto-play policies usually require muted for programmatic play
     currentVid.load();
     
     currentVid.onloadedmetadata = () => {
        // Jump to middle
        currentVid.currentTime = Math.max(0, (currentVid.duration / 2) - (chunkDuration / 2));
        currentVid.play().catch(e => console.log("Autoplay blocked", e));
        
        // Schedule next clip
        playTimerRef.current = setTimeout(() => {
           playNextClip(index + 1, activePlayer === 1 ? 2 : 1);
        }, chunkDuration * 1000);
     };

     // Preload next video in background player
     if (index + 1 < clips.length && nextVid) {
        nextVid.src = clips[index + 1].src;
        nextVid.load();
     }
  };

  useEffect(() => {
     return () => {
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
     };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {!isPlaying && !isFinished ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20 bg-black">
            <Film size={48} className="mb-6" style={{ color: primaryColor }} />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center">
               {config.title || "1 Second Everyday"}
            </h2>
            <p className="text-white/50 text-sm text-center mb-8 max-w-[280px]">
               {config.body || `Automatically stitching the middle ${chunkDuration}s of ${clips.length} memories into a single montage.`}
            </p>
            <button 
               onClick={startMontage}
               className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 transition-transform"
               style={{ backgroundColor: primaryColor }}
            >
               <Play size={24} fill="currentColor" className="ml-1" />
            </button>
         </div>
      ) : (
         <div className="flex-1 relative bg-black flex flex-col justify-center overflow-hidden">
            
            {/* Ping-pong video players */}
            <video 
               ref={videoRef1} 
               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[50ms] ${activeVideo === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
               playsInline
            />
            <video 
               ref={videoRef2} 
               className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[50ms] ${activeVideo === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
               playsInline 
            />

            {/* Overlays */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8">
               
               {/* Date Stamp */}
               <AnimatePresence mode="wait">
                  {!isFinished && (
                     <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="self-start text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2"
                        style={{ color: primaryColor }}
                     >
                        {clips[currentIndex]?.dateLabel}
                     </motion.div>
                  )}
               </AnimatePresence>
               
               {/* Progress indicator */}
               <div className="w-full flex gap-1 h-1 bg-black/40 p-1 rounded-full backdrop-blur-md self-center mb-4 opacity-50">
                  {clips.map((_: any, i: number) => (
                     <div 
                        key={i} 
                        className={`flex-1 h-full rounded-full transition-colors ${i <= currentIndex && !isFinished ? 'bg-white' : 'bg-white/20'}`} 
                     />
                  ))}
               </div>

            </div>

            {/* Finished State */}
            <AnimatePresence>
               {isFinished && (
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center text-center p-8"
                  >
                     <h3 className="text-3xl font-serif italic mb-2">A beautiful month.</h3>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Montage Complete
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>
      )}

    </div>
  );
}
