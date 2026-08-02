"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { PlaySquare } from "lucide-react";

export function MechanicalSlideProjector({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // stone-900
  const title = config.title || "Family Slides";
  const slides = (config.experience as any)?.slides || [
    { id: "s1", url: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop", caption: "Dad's old Chevy, 1978" },
    { id: "s2", url: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?q=80&w=800&auto=format&fit=crop", caption: "The cabin in Maine" },
    { id: "s3", url: "https://images.unsplash.com/photo-1444065707204-12decac917e8?q=80&w=800&auto=format&fit=crop", caption: "Mom at the state fair" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  const nextSlide = () => {
    if (isChanging) return;
    setIsChanging(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]); // CLUNK sound simulation

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsChanging(false);
      if (onComplete && currentIndex === slides.length - 2) onComplete();
    }, 1200); // 1.2s mandatory blackout interstitial
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-stone-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Background Room Ambient */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #444 0%, #000 100%)" }} />

      {/* Projector Beam (Dusty) */}
      {!isChanging && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" style={{ clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0% 100%)" }} />
      )}

      {/* Projection Screen Area */}
      <div className="flex-1 relative flex items-center justify-center p-8 z-0">
        
        {/* The Wall/Screen */}
        <div className="absolute inset-4 bg-stone-200 shadow-inner rounded-sm" />

        <AnimatePresence mode="wait">
          {!isChanging && (
            <motion.div
              key={currentSlide.id}
              initial={{ y: -500, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }} // Exits instantly to black during change
              transition={{ type: "spring", stiffness: 100, damping: 10, mass: 2 }} // Heavy, bouncing drop
              className="relative z-20 w-full aspect-square max-w-sm bg-white p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col border border-stone-300"
            >
              {/* Photo Area */}
              <div className="flex-1 bg-stone-900 relative overflow-hidden">
                <img src={currentSlide.url} alt={currentSlide.caption} className="w-full h-full object-cover mix-blend-screen opacity-90 contrast-125 sepia-[.3]" />
                <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay pointer-events-none" />
              </div>
              
              {/* Slide Mount Bottom */}
              <div className="h-12 bg-white mt-2 flex items-center justify-between px-2">
                <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase">Kodachrome</span>
                <span className="text-[10px] text-stone-400 font-mono">OCT 78</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtitles */}
      <div className="h-16 flex items-center justify-center z-20">
         <AnimatePresence>
           {!isChanging && (
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white text-sm tracking-wide text-center drop-shadow-md px-4">
               {currentSlide.caption}
             </motion.p>
           )}
         </AnimatePresence>
      </div>

      {/* Heavy Mechanical Button UI */}
      <div className="bg-stone-800 border-t-4 border-stone-900 p-6 flex items-center justify-center z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <button
           onClick={nextSlide}
           disabled={isChanging}
           className={`relative w-48 h-16 bg-stone-700 rounded-lg border-2 border-stone-600 shadow-[0_8px_0_#292524,0_15px_20px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 transition-all ${isChanging ? 'translate-y-[8px] shadow-[0_0_0_#292524,0_0_0_rgba(0,0,0,0)]' : 'hover:bg-stone-600 active:translate-y-[8px] active:shadow-[0_0_0_#292524,0_0_0_rgba(0,0,0,0)]'}`}
         >
           <div className="w-4 h-4 rounded-full bg-red-500 shadow-inner" />
           <span className="text-stone-300 font-bold uppercase tracking-widest text-sm">Advance Slide</span>
         </button>
      </div>

    </div>
  );
}
