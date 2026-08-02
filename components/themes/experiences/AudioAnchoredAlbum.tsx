"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Lock, Unlock, Play, Headphones } from "lucide-react";

type AlbumItem = {
   id: string;
   image: string;
   audioLength: number; // seconds
};

const defaultItems: AlbumItem[] = [
   { id: "1", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop", audioLength: 4 },
   { id: "2", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop", audioLength: 5 },
   { id: "3", image: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop", audioLength: 3 },
];

export function AudioAnchoredAlbum({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#14b8a6"; // teal-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const items: AlbumItem[] = (config.experience as any)?.items || defaultItems;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); // To handle autoplay policy

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup intersection observer
  useEffect(() => {
     if (!scrollRef.current) return;

     const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
           if (entry.isIntersecting) {
              const index = Number(entry.target.getAttribute("data-index"));
              if (!isNaN(index) && index !== activeIndex) {
                 setActiveIndex(index);
              }
           }
        });
     }, {
        root: scrollRef.current,
        threshold: 0.6
     });

     observerRef.current = observer;
     
     const children = scrollRef.current.children;
     for (let i = 0; i < children.length; i++) {
        observer.observe(children[i]);
     }

     return () => observer.disconnect();
  }, [activeIndex]);

  // Handle active slide changed
  useEffect(() => {
     if (!hasStarted) return;
     
     if (timerRef.current) clearInterval(timerRef.current);
     
     setIsPlaying(true);
     setProgress(0);
     
     const item = items[activeIndex];
     const totalMs = item.audioLength * 1000;
     const tickRate = 50;
     
     let elapsed = 0;
     timerRef.current = setInterval(() => {
        elapsed += tickRate;
        const newProgress = Math.min(100, (elapsed / totalMs) * 100);
        setProgress(newProgress);
        
        if (elapsed >= totalMs) {
           clearInterval(timerRef.current!);
           setIsPlaying(false);
           
           if (activeIndex === items.length - 1 && onComplete) {
              onComplete();
           }
        }
     }, tickRate);

     return () => {
        if (timerRef.current) clearInterval(timerRef.current);
     };
  }, [activeIndex, hasStarted, items, onComplete]);

  const startExperience = () => {
     setHasStarted(true);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {!hasStarted ? (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-sm text-white">
            <Headphones size={48} className="mb-6 opacity-80" style={{ color: primaryColor }} />
            <h2 className="text-2xl font-black text-center tracking-tight mb-2">
               {config.title || "The Audio Album"}
            </h2>
            <p className="text-white/60 text-center mb-8 max-w-[250px] leading-relaxed text-sm">
               {config.body || "Each photo contains a voice note. You cannot scroll until the memory finishes playing."}
            </p>
            <button 
               onClick={startExperience}
               className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg flex items-center gap-2"
               style={{ backgroundColor: primaryColor }}
            >
               <Play size={16} fill="currentColor" /> Enter Album
            </button>
         </div>
      ) : (
         <>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-black/50 to-transparent text-white pointer-events-none">
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black tracking-tight drop-shadow-md">
                     {config.title || "Audio Album"}
                  </h2>
                  <div className="text-sm font-bold opacity-80">
                     {activeIndex + 1} / {items.length}
                  </div>
               </div>
            </div>

            {/* The Horizontal Scroller */}
            <div 
               ref={scrollRef}
               className="flex-1 w-full h-full flex snap-x snap-mandatory hide-scrollbar relative z-10"
               style={{ 
                  // Crucial mechanic: Lock scrolling while audio plays
                  overflowX: isPlaying ? "hidden" : "auto",
                  overflowY: "hidden",
               }}
            >
               {items.map((item, idx) => (
                  <div 
                     key={item.id} 
                     data-index={idx}
                     className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-8 relative"
                  >
                     <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative border border-black/10 bg-white">
                        <img 
                           src={item.image} 
                           alt="Memory" 
                           className="w-full h-full object-cover"
                        />
                        
                        {/* Audio overlay dimming if playing this slide */}
                        {activeIndex === idx && isPlaying && (
                           <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-300" />
                        )}
                     </div>
                  </div>
               ))}
            </div>

            {/* Global Audio Controls / Progress Overlay */}
            <div className="absolute bottom-8 left-0 right-0 px-8 z-20 pointer-events-none flex flex-col items-center">
               
               <AnimatePresence mode="wait">
                  {isPlaying ? (
                     <motion.div 
                        key="playing"
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                        className="bg-black/80 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col gap-3 w-full max-w-xs border border-white/10 pointer-events-auto"
                     >
                        <div className="flex items-center justify-between text-white px-2">
                           <div className="flex items-center gap-2">
                              <Mic size={14} className="animate-pulse" style={{ color: primaryColor }} />
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Playing Memory</span>
                           </div>
                           <Lock size={14} className="text-red-400" />
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full rounded-full"
                              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
                           />
                        </div>
                        
                        {/* Fake Waveform */}
                        <div className="flex items-end justify-center gap-[2px] h-4 mt-1 opacity-50">
                           {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div 
                                 key={i}
                                 className="w-1 bg-white rounded-t-sm"
                                 animate={{ height: ['20%', `${40 + Math.random()*60}%`, '20%'] }}
                                 transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                              />
                           ))}
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div 
                        key="unlocked"
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                        className="bg-white/90 backdrop-blur-md text-slate-800 rounded-full px-6 py-3 shadow-xl border border-slate-200 flex items-center gap-2 text-xs font-bold uppercase tracking-widest pointer-events-auto"
                     >
                        <Unlock size={14} className="text-green-500" /> Swipe to next
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </>
      )}
    </div>
  );
}
