"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type StereoscopicSlide = {
  id: string;
  imgUrl: string; // The base image
  caption: string;
};

const defaultSlides: StereoscopicSlide[] = [
  { id: "sm1", imgUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop", caption: "Mount Rainier Hike" },
  { id: "sm2", imgUrl: "https://images.unsplash.com/photo-1542314831-c6a4d1429df4?q=80&w=600&auto=format&fit=crop", caption: "Downtown at Night" },
  { id: "sm3", imgUrl: "https://images.unsplash.com/photo-1473496169904-658ba37448ee?q=80&w=600&auto=format&fit=crop", caption: "The Beach House" },
];

export function ViewMaster({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ef4444"]; // red-500
  const slides: StereoscopicSlide[] = (config.experience as any)?.slides || defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  const advanceSlide = () => {
    if (isChanging) return;
    setIsChanging(true);
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 60]); // Click-clack sound/feel

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsChanging(false);
      if (onComplete && currentIndex === slides.length - 2) onComplete();
    }, 200); // Quick mechanical snap
  };

  const current = slides[currentIndex];

  // We simulate stereoscopic 3D by duplicating the image side-by-side
  // To create true depth without a 3D model, we just offset the X position slightly
  // between the left and right eyes.
  const leftEyeOffset = -10; // px
  const rightEyeOffset = 10; // px

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none items-center justify-center bg-red-600" 
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* View-Master Body Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="absolute top-8 text-center z-10 pointer-events-none">
        <h2 className="text-xl font-black text-red-950 uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">View-Master</h2>
        <p className="text-[10px] text-red-900 mt-1 uppercase tracking-widest font-bold">Cross eyes or use VR viewer</p>
      </div>

      {/* The Dual Lenses */}
      <div className="w-full max-w-2xl flex gap-2 sm:gap-6 px-2 z-10 perspective-1000">
        
        {/* Left Eye */}
        <div className="flex-1 aspect-square sm:aspect-[4/3] bg-black rounded-full sm:rounded-[3rem] overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] border-8 sm:border-[16px] border-red-800 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-20 rounded-full sm:rounded-[3rem]" />
          <AnimatePresence mode="wait">
             <motion.img 
               key={current.id + "-L"}
               src={current.imgUrl}
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1, x: leftEyeOffset }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="w-[120%] h-[120%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
             />
          </AnimatePresence>
          {/* Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,1)] pointer-events-none z-10 rounded-full sm:rounded-[3rem]" />
        </div>

        {/* Right Eye */}
        <div className="flex-1 aspect-square sm:aspect-[4/3] bg-black rounded-full sm:rounded-[3rem] overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] border-8 sm:border-[16px] border-red-800 relative">
          <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none z-20 rounded-full sm:rounded-[3rem]" />
          <AnimatePresence mode="wait">
             <motion.img 
               key={current.id + "-R"}
               src={current.imgUrl}
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1, x: rightEyeOffset }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="w-[120%] h-[120%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
             />
          </AnimatePresence>
          {/* Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,1)] pointer-events-none z-10 rounded-full sm:rounded-[3rem]" />
        </div>

      </div>

      <div className="mt-8 z-10 text-center">
         <p className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md bg-black/40 px-4 py-1 rounded-full">
            {current.caption}
         </p>
      </div>

      {/* Advance Lever (Right side) */}
      <button 
        onClick={advanceSlide}
        className="absolute right-0 bottom-32 w-16 h-24 bg-red-800 rounded-l-2xl border-y-4 border-l-4 border-red-950 shadow-[-10px_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-start pl-2 active:translate-y-4 active:bg-red-900 transition-transform"
      >
        <div className="w-8 h-16 bg-red-700 rounded-l-lg border-y-2 border-l-2 border-red-900" />
      </button>

    </div>
  );
}
