"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Hotspot = {
   id: string;
   x: string; // CSS left value (e.g., '15%')
   y: string; // CSS top value (e.g., '60%')
   title: string;
   text: string;
};

const HOTSPOTS: Hotspot[] = [
   { id: "h1", x: "15%", y: "45%", title: "The Obelisk", text: "A strange stone pillar hums with silent energy." },
   { id: "h2", x: "50%", y: "70%", title: "Fallen Tree", text: "Roots torn from the earth. Something massive passed this way." },
   { id: "h3", x: "85%", y: "30%", title: "The High Nest", text: "Feathers the size of swords line the edges." },
];

export function PanoramaStory({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // Rose 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // Stone 900

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [foundHotspots, setFoundHotspots] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleHotspotClick = (hs: Hotspot) => {
     if (gameState !== "playing" || activeHotspot) return;
     
     if (!foundHotspots.includes(hs.id)) {
        setFoundHotspots(prev => [...prev, hs.id]);
     }
     
     setActiveHotspot(hs);
  };

  const handleCloseModal = () => {
     if (foundHotspots.length === HOTSPOTS.length) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
     setActiveHotspot(null);
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         ref={containerRef}
         className={`relative w-[320px] h-[480px] bg-stone-900 border-4 border-stone-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Panorama Layer (Draggable X) */}
         <motion.div 
            className="absolute top-0 bottom-0 flex"
            // Width is 300% of container so it's a wide landscape
            style={{ width: '300%' }}
            drag={gameState === "playing" && !activeHotspot ? "x" : false}
            dragConstraints={containerRef}
            dragElastic={0.1}
         >
            {/* The Landscape Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 overflow-hidden pointer-events-none">
               {/* Abstract Mountains/Terrain */}
               <svg className="absolute bottom-0 w-full h-1/2 opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0,100 L 0,80 L 10,60 L 25,85 L 40,40 L 60,70 L 75,50 L 90,80 L 100,30 L 100,100 Z" fill={primaryColor} />
               </svg>
               {/* Stars/Dust */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
               
               {/* Fixed Landmarks */}
               <div className="absolute top-[40%] left-[10%] w-32 h-64 bg-stone-950/50 blur-xl" />
               <div className="absolute top-[50%] left-[45%] w-64 h-32 bg-stone-950/50 blur-xl" />
               <div className="absolute top-[20%] left-[80%] w-48 h-48 bg-stone-950/50 blur-xl rounded-full" />
            </div>

            {/* Hotspots */}
            {HOTSPOTS.map((hs) => {
               const isFound = foundHotspots.includes(hs.id);
               return (
                  <div
                     key={hs.id}
                     className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center cursor-pointer group"
                     style={{ left: hs.x, top: hs.y }}
                     onPointerDown={(e) => e.stopPropagation()} // Prevent drag conflict on touch
                     onClick={() => handleHotspotClick(hs)}
                  >
                     {/* Outer pulse */}
                     {!isFound && (
                        <span className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping" style={{ backgroundColor: primaryColor }} />
                     )}
                     {/* Core */}
                     <div 
                        className={`w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-300 ${isFound ? 'scale-50 opacity-50' : 'group-hover:scale-150'}`}
                        style={{ backgroundColor: isFound ? '#a8a29e' : primaryColor, color: isFound ? '#a8a29e' : primaryColor }}
                     />
                  </div>
               );
            })}
         </motion.div>

         {/* UI Overlay */}
         <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-center z-10">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
               Sector 7G
            </span>
            <div className="flex gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
               {HOTSPOTS.map((hs, i) => (
                  <div 
                     key={i}
                     className="w-2 h-2 rounded-full transition-colors duration-500"
                     style={{ backgroundColor: foundHotspots.includes(hs.id) ? primaryColor : '#444' }}
                  />
               ))}
            </div>
         </div>

         {/* Drag Hint (Fades out when panning starts, but difficult to detect nicely without scroll motion value. Just pulse it) */}
         {gameState === "playing" && foundHotspots.length === 0 && !activeHotspot && (
            <div className="absolute bottom-10 left-0 w-full flex justify-center pointer-events-none">
               <div className="text-white/40 text-xs font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm animate-pulse flex items-center gap-2">
                  <span>←</span> Drag to pan <span>→</span>
               </div>
            </div>
         )}

         {/* Hotspot Modal */}
         <AnimatePresence>
            {activeHotspot && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-8 z-30 bg-stone-900/90 backdrop-blur-lg border border-stone-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center text-center pointer-events-auto"
               >
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">{activeHotspot.title}</h3>
                  <div className="w-12 h-1 mb-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <p className="text-sm text-stone-300 leading-relaxed mb-8">
                     {activeHotspot.text}
                  </p>
                  <button 
                     onClick={handleCloseModal}
                     className="px-8 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md w-full"
                     style={{ backgroundColor: primaryColor }}
                  >
                     {foundHotspots.length === HOTSPOTS.length ? "Continue" : "Keep Searching"}
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="text-white font-black text-3xl uppercase tracking-[0.3em] mb-4 text-center px-4 drop-shadow-md">
                     Wasteland
                  </div>
                  <div className="text-white/60 font-sans mb-12 text-center px-8 text-xs leading-relaxed uppercase tracking-widest">
                     Search the horizon. Find the 3 anomalies to proceed.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-8 py-3 font-bold uppercase tracking-widest border-2 border-white/20 hover:bg-white/10 transition-colors"
                  >
                     Explore
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-stone-900 border border-stone-800 p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  style={{ perspective: 1000 }}
                  initial={{ scale: 0.95, opacity: 0, rotateX: 20 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  <div className="font-bold uppercase tracking-[0.3em] mb-6 text-[10px]" style={{ color: primaryColor }}>Anomalies Collected</div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-lg text-stone-400 leading-relaxed font-serif italic">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-stone-800 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setFoundHotspots(HOTSPOTS.map(h => h.id));
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Explore Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
