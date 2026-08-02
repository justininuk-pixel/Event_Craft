"use client";

import React, { useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useScroll, useTransform } from "framer-motion";

export function ReverseChronology({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  // Mock chapters in reverse chronological order
  const chapters = [
    { time: "The End", text: "I stood amidst the shattered remnants of what was once our life's work. The silence was deafening." },
    { time: "1 Hour Earlier", text: "The alarms finally stopped, but the flashing red lights painted the hallway in panic. We were running out of time." },
    { time: "3 Hours Earlier", text: "She handed me the drive. 'Don't look at it until you're safe,' she whispered. That was the last time I saw her." },
    { time: "1 Day Earlier", text: "We cracked the encryption. What we found... it changed everything. We knew they would come for us." },
    { time: "The Beginning", text: "It started as a simple data recovery job. Just another Tuesday in the district. How naive we were." }
  ];

  // Derive title from config or use default
  const mainTitle = config.title || "The Aftermath";

  // Watch for completion
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (v > 0.95 && onComplete) {
         onComplete();
      }
    });
  }, [scrollYProgress, onComplete]);

  // A subtle "rewind" visual effect mapped to scroll
  const scanlineOpacity = useTransform(scrollYProgress, [0, 1], [0.1, 0.4]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono text-zinc-100 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Rewind visual effect (scanlines) */}
      <motion.div 
         className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay"
         style={{ 
            opacity: scanlineOpacity,
            backgroundImage: "url('https://www.transparenttextures.com/patterns/tv-noise.png')",
         }}
      />
      
      {/* Rewind Icon Indicator at top */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 opacity-50">
         <div className="flex -space-x-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
         </div>
         <span className="text-xs font-bold uppercase tracking-widest">Rewinding Timeline</span>
      </div>

      {/* The Scroll Container */}
      <div 
         ref={containerRef}
         className="w-full h-full overflow-y-auto no-scrollbar relative z-10 snap-y snap-mandatory"
      >
         
         <div className="w-full max-w-lg mx-auto py-24 px-8 relative">
            
            {/* The vertical timeline spine */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-800 -translate-x-1/2 z-0" />

            {/* Chapters */}
            {chapters.map((chapter, idx) => (
               <div 
                  key={idx} 
                  className="w-full min-h-[70vh] flex flex-col justify-center snap-center relative z-10 mb-24"
               >
                  {/* Timeline Dot */}
                  <div 
                     className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full border-4 border-zinc-900 -translate-x-1/2 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                     style={{ backgroundColor: primaryColor }}
                  />

                  {/* Content Box */}
                  <div className={`w-full pl-8 md:pl-0 flex ${idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                     <div className="md:w-5/12 bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 rounded-lg shadow-xl relative overflow-hidden">
                        
                        {/* Fake timestamp glitch effect */}
                        <div className="absolute top-0 right-0 p-2 text-[10px] font-black text-zinc-700 font-sans">
                           REC &bull; {23 - idx}:{(Math.random() * 59).toFixed(0).padStart(2, '0')}:{(Math.random() * 59).toFixed(0).padStart(2, '0')}
                        </div>

                        <h2 className="text-xl font-bold mb-4 uppercase tracking-wider" style={{ color: primaryColor }}>
                           {idx === 0 ? mainTitle : chapter.time}
                        </h2>
                        
                        <p className="text-sm leading-relaxed text-zinc-400">
                           {chapter.text}
                        </p>

                        {/* Arrows pointing UP to imply time is going backwards as we scroll down */}
                        {idx < chapters.length - 1 && (
                           <div className="w-full flex justify-center mt-6 text-zinc-700 animate-pulse">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
         
         {/* End padding to allow scrolling past last item */}
         <div className="h-[30vh]" />
      </div>

    </div>
  );
}
