"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function HeartbeatCity({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [congestion, setCongestion] = useState<number | null>(null);
  const [simulatedCongestion, setSimulatedCongestion] = useState<number | null>(null);

  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#ffffff";

  useEffect(() => {
     // Mock API Fetch for real-time traffic
     const timer = setTimeout(() => {
        setCongestion(Math.floor(Math.random() * 100));
     }, 1500);

     return () => clearTimeout(timer);
  }, []);

  const activeCongestion = simulatedCongestion !== null ? simulatedCongestion : congestion;

  useEffect(() => {
     if (activeCongestion !== null && onComplete) {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
     }
  }, [activeCongestion, onComplete]);

  // Derived properties based on congestion (0 = Clear, 100 = Gridlock)
  // 0 -> Blue, 50 -> Yellow, 100 -> Red
  const getCongestionColor = (level: number) => {
     if (level < 30) return "#0ea5e9"; // Sky 500
     if (level < 70) return "#eab308"; // Yellow 500
     return "#ef4444"; // Red 500
  };

  const getBpmDuration = (level: number) => {
     // High congestion = fast pulse (0.5s)
     // Low congestion = slow pulse (3s)
     const minDuration = 0.5;
     const maxDuration = 3.0;
     const invertedLevel = 100 - level;
     return minDuration + (invertedLevel / 100) * (maxDuration - minDuration);
  };

  const activeColor = activeCongestion !== null ? getCongestionColor(activeCongestion) : "#333333";
  const activeDuration = activeCongestion !== null ? getBpmDuration(activeCongestion) : 2;

  return (
    <div className="w-full h-full relative font-sans overflow-hidden bg-black flex items-center justify-center">
      
      {activeCongestion !== null ? (
         <>
            {/* The City Pulse Grid */}
            <div className="absolute inset-0 perspective-[1000px] flex items-center justify-center overflow-hidden">
               <motion.div 
                  className="w-[200vw] h-[200vh] border-[1px] border-solid"
                  style={{ 
                     backgroundImage: `
                        linear-gradient(to right, ${activeColor}33 1px, transparent 1px),
                        linear-gradient(to bottom, ${activeColor}33 1px, transparent 1px)
                     `,
                     backgroundSize: "50px 50px",
                     borderColor: `${activeColor}40`
                  }}
                  animate={{ 
                     scale: [1, 1.05, 1],
                     opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ 
                     duration: activeDuration, 
                     repeat: Infinity, 
                     ease: "easeInOut" 
                  }}
               />
               
               {/* Vignette / Fade out edges */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_70%)]" />
            </div>

            {/* Content Payload */}
            <motion.div 
               className="relative z-10 w-full max-w-xl mx-4 bg-black/60 backdrop-blur-xl border-y p-8 md:p-12 text-center"
               style={{ 
                  borderColor: `${activeColor}50`,
                  boxShadow: `0 0 50px ${activeColor}20`
               }}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
            >
               <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="text-[10px] uppercase tracking-widest font-mono text-white/50">
                     Live Sync
                  </div>
                  <motion.div 
                     className="w-2 h-2 rounded-full"
                     style={{ backgroundColor: activeColor }}
                     animate={{ opacity: [0.2, 1, 0.2] }}
                     transition={{ duration: activeDuration, repeat: Infinity, ease: "easeInOut" }}
                  />
               </div>

               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4" style={{ color: activeColor }}>
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90" style={{ color: textColor }}>
                  {config.body}
               </p>
            </motion.div>
         </>
      ) : (
         <div className="text-white/50 font-mono text-xs uppercase tracking-widest flex items-center gap-4">
            <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            Syncing Infrastructure Data...
         </div>
      )}

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && activeCongestion !== null && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/90 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Infrastructure API
            </h2>
            
            <div className="flex w-full items-center gap-4 font-bold text-xs uppercase tracking-wider mb-2">
               <span className="text-sky-500 w-16 text-right">Clear</span>
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={activeCongestion} 
                  onChange={(e) => setSimulatedCongestion(parseInt(e.target.value))}
                  className="flex-1"
               />
               <span className="text-red-500 w-16">Gridlock</span>
            </div>

            <div className="flex justify-between w-full text-white/40 font-mono text-[10px] mt-2">
               <span>Index: {activeCongestion}</span>
               <span>BPM: {(60 / activeDuration).toFixed(0)}</span>
            </div>
         </div>
      )}
      
    </div>
  );
}
