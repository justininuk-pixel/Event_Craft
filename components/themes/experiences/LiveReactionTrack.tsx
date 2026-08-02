"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type ReactionType = "laugh" | "gasp" | "cry";

interface Reaction {
   id: string;
   time: number; // in seconds
   type: ReactionType;
}

const EMOJI_MAP: Record<ReactionType, string> = {
   laugh: "😂",
   gasp: "😲",
   cry: "😢"
};

const DEFAULT_VIDEO = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

// Generate mock historical reactions
function generateMockReactions(duration: number): Reaction[] {
   const reactions: Reaction[] = [];
   const count = 200;
   for (let i = 0; i < count; i++) {
      // Create some hotspots
      let time = Math.random() * duration;
      if (Math.random() > 0.5) {
         // hotspot around 20% mark
         time = duration * 0.2 + (Math.random() - 0.5) * 5;
      }
      if (Math.random() > 0.8) {
         // hotspot around 70% mark
         time = duration * 0.7 + (Math.random() - 0.5) * 5;
      }
      
      const types: ReactionType[] = ["laugh", "gasp", "cry"];
      reactions.push({
         id: `mock-${i}`,
         time: Math.max(0, Math.min(duration, time)),
         type: types[Math.floor(Math.random() * types.length)]
      });
   }
   return reactions;
}

export function LiveReactionTrack({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [duration, setDuration] = useState(15); // Will update when video loads
  const [currentTime, setCurrentTime] = useState(0);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [floatingParticles, setFloatingParticles] = useState<{id: string, emoji: string, startX: number}[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];

  useEffect(() => {
     // initialize mock reactions
     setReactions(generateMockReactions(15));
  }, []);

  const handleTimeUpdate = () => {
     if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
     }
  };

  const handleLoadedMetadata = () => {
     if (videoRef.current) {
        const dur = videoRef.current.duration;
        setDuration(dur);
        if (reactions.length === 0 || reactions[0].id.startsWith("mock-")) {
           setReactions(generateMockReactions(dur));
        }
     }
  };

  const handleEnded = () => {
     if (onComplete) onComplete();
  };

  const addReaction = (type: ReactionType) => {
     const t = currentTime;
     const newReaction: Reaction = {
        id: `user-${Date.now()}`,
        time: t,
        type
     };
     setReactions(prev => [...prev, newReaction]);

     // Add floating particle
     const pid = `p-${Date.now()}`;
     setFloatingParticles(prev => [...prev, {
        id: pid,
        emoji: EMOJI_MAP[type],
        startX: Math.random() * 60 + 20 // 20% to 80% width
     }]);

     // Clean up particle after animation
     setTimeout(() => {
        setFloatingParticles(prev => prev.filter(p => p.id !== pid));
     }, 2000);
  };

  // Build Histogram Data
  const BUCKETS = 50;
  const histogram = Array(BUCKETS).fill(0);
  
  reactions.forEach(r => {
     let bucketIndex = Math.floor((r.time / duration) * BUCKETS);
     if (bucketIndex >= BUCKETS) bucketIndex = BUCKETS - 1;
     histogram[bucketIndex]++;
  });

  const maxBucket = Math.max(...histogram, 1);

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white bg-black"
    >
      {/* Video Container */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
         <video 
            ref={videoRef}
            src={config.mediaUrl || DEFAULT_VIDEO}
            className="w-full max-h-full object-contain"
            playsInline
            controls={false}
            autoPlay
            muted={false}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onClick={() => {
               if (videoRef.current?.paused) videoRef.current.play();
               else videoRef.current?.pause();
            }}
         />

         {/* Floating Particles Overlay */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
               {floatingParticles.map(p => (
                  <motion.div
                     key={p.id}
                     initial={{ opacity: 1, y: "100%", x: `${p.startX}%`, scale: 0.5 }}
                     animate={{ opacity: 0, y: "10%", x: `${p.startX + (Math.random() * 20 - 10)}%`, scale: 2 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="absolute bottom-0 text-5xl"
                  >
                     {p.emoji}
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Control Deck */}
      <div 
         className="h-48 shrink-0 flex flex-col border-t-2 border-white/10"
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
      >
         {/* Timeline & Histogram */}
         <div className="h-16 w-full relative px-4 flex items-end pb-2 pt-4">
            
            {/* The Histogram Bars */}
            <div className="absolute inset-x-4 top-2 bottom-4 flex items-end gap-[1px]">
               {histogram.map((count, i) => (
                  <div key={i} className="flex-1 flex items-end justify-center h-full">
                     <div 
                        className="w-full rounded-t-sm bg-white/20 transition-all duration-300"
                        style={{ height: `${(count / maxBucket) * 100}%` }}
                     />
                  </div>
               ))}
            </div>

            {/* The Scrub Track */}
            <div className="w-full h-2 bg-white/10 rounded-full relative z-10 overflow-hidden">
               <motion.div 
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: primaryColor }}
               />
            </div>
            
            {/* Playhead thumb */}
            <div 
               className="absolute top-0 bottom-2 w-px bg-white z-20 transition-all duration-75"
               style={{ left: `${(currentTime / duration) * 100}%` }}
            >
               <div className="w-3 h-3 rounded-full bg-white absolute top-[calc(100%-0.5rem)] -translate-x-[5px] shadow-[0_0_10px_white]" />
            </div>

         </div>

         {/* Reaction Buttons */}
         <div className="flex-1 flex items-center justify-center gap-6 px-4">
            <ReactionButton emoji={EMOJI_MAP.laugh} onClick={() => addReaction("laugh")} color={primaryColor} />
            <ReactionButton emoji={EMOJI_MAP.gasp} onClick={() => addReaction("gasp")} color={primaryColor} />
            <ReactionButton emoji={EMOJI_MAP.cry} onClick={() => addReaction("cry")} color={primaryColor} />
         </div>
      </div>
      
    </div>
  );
}

function ReactionButton({ emoji, onClick, color }: { emoji: string, onClick: () => void, color: string }) {
   return (
      <motion.button
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.9 }}
         onClick={onClick}
         className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl shadow-xl hover:bg-white/20 transition-colors"
         style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
         {emoji}
      </motion.button>
   );
}
