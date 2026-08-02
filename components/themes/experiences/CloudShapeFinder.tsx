"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud } from "lucide-react";

export function CloudShapeFinder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#38bdf8"]; // sky-400
  const photoSrc = config.mediaUrl || "https://images.unsplash.com/photo-1532054944983-490333d06eb1?q=80&w=600&auto=format&fit=crop";
  const title = config.title || "The Dragon Cloud";
  const story = config.body || "We lay on the grass for an hour. You swore it was a dragon. I said it was a dog. We were both wrong, but it didn't matter.";

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Start drawing shortly after mount
    const timer = setTimeout(() => {
      setIsDrawing(true);
      if (onComplete) setTimeout(onComplete, 6000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-sky-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Sky Photo Container */}
      <div className="relative w-full h-[60%] overflow-hidden shadow-2xl">
        <img src={photoSrc} alt="Sky" className="absolute inset-0 w-full h-full object-cover" />
        
        {/* SVG Drawing Overlay */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {isDrawing && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              // Abstract shape resembling a dragon/dog head
              d="M 30 60 C 20 50, 40 30, 50 35 C 60 40, 70 20, 80 40 C 90 60, 70 80, 50 70 C 40 65, 35 75, 30 60"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {isDrawing && (
            <motion.circle
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 3.5, duration: 1 }}
               cx="65" cy="40" r="1.5" fill="white"
            />
          )}
        </svg>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/80 to-transparent z-10" />
      </div>

      {/* Story Content */}
      <div className="flex-1 bg-sky-900 text-white p-8 pt-12 relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-sky-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-sky-900">
            <Cloud size={24} />
         </div>

         <h2 className="text-2xl font-black text-center mb-6">{title}</h2>
         <p className="text-sky-100 text-lg leading-relaxed text-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            {story}
         </p>
      </div>

    </div>
  );
}
