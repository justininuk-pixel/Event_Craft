"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useScroll } from "framer-motion";

export function FootprintTracker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [snowOpacity, setSnowOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const lastScrollTime = useRef(Date.now());
  const maxOpacity = 0.95;

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e0e7ff"];
  const textPrimary = palette.text || "#1e1b4b";

  // Derive story beats
  const storyLines = (config.body || "It was cold.\nI had to keep moving.\nIf I stopped, the storm would take me.\nThe tracks ahead were fading.\nBut I finally saw the light.").split("\n").filter(l => l.trim() !== "");

  // Track scrolling to reset timer
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      lastScrollTime.current = Date.now();
      // Instantly clear some snow when they move
      setSnowOpacity(prev => Math.max(0, prev - 0.2));

      if (v > 0.95 && onComplete) {
         onComplete();
      }
    });
  }, [scrollYProgress, onComplete]);

  // The inactivity blizzard mechanic
  useEffect(() => {
    if (mode === "editor-preview") return; // Disable penalty in editor mode

    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastMove = now - lastScrollTime.current;
      
      // If inactive for more than 1.5 seconds, start accumulating snow rapidly
      if (timeSinceLastMove > 1500) {
        setSnowOpacity(prev => Math.min(maxOpacity, prev + 0.05)); // Increase opacity by 5% every 100ms
      }
    }, 100);

    return () => clearInterval(timer);
  }, [mode]);

  return (
    <div className="w-full h-full relative overflow-hidden font-serif" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Scrollable Path */}
      <div 
         ref={containerRef}
         className="w-full h-full overflow-y-auto no-scrollbar relative z-10"
      >
         <div className="min-h-[250%] flex flex-col items-center pt-32 pb-64 px-8">
            <h1 className="text-3xl font-bold mb-32 text-center" style={{ color: textPrimary }}>
               {config.title || "The Blizzard"}
            </h1>

            {/* The Trail */}
            <div className="flex-1 w-full max-w-sm relative">
               
               {/* Meandering footprint path background */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "30px 40px", backgroundPosition: "0 0, 15px 20px" }} />

               {/* Story Nodes */}
               {storyLines.map((line, idx) => (
                  <div key={idx} className={`w-full flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} mb-48`}>
                     <div className="max-w-[70%] p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm">
                        <p className="text-lg leading-relaxed font-medium" style={{ color: textPrimary }}>
                           {line}
                        </p>
                     </div>
                  </div>
               ))}
               
               {/* Finish Area */}
               <div className="w-full flex justify-center mt-32 mb-12">
                  <div className="w-24 h-24 rounded-full bg-yellow-100/50 blur-xl absolute" />
                  <div className="z-10 text-xl font-bold" style={{ color: textPrimary }}>
                     Sanctuary
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* The Snow Overlay (The Penalty) */}
      <div 
         className="absolute inset-0 z-40 pointer-events-none transition-opacity duration-100 ease-linear flex items-center justify-center"
         style={{ 
            opacity: snowOpacity,
            backgroundColor: 'white',
            backgroundImage: "url('https://www.transparenttextures.com/patterns/snow.png')",
         }}
      >
         {snowOpacity > 0.8 && (
            <div className="bg-black/60 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm backdrop-blur animate-pulse">
               Keep moving...
            </div>
         )}
      </div>

      {/* Fixed Foreground Particles (always visible to simulate storm regardless of opacity overlay) */}
      <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-30">
         <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dust.png')] animate-[slide_10s_linear_infinite]" />
      </div>
      
      {/* CSS for simple snow slide */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
      `}} />

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
            Blizzard Disabled (Editor)
         </div>
      )}

    </div>
  );
}
