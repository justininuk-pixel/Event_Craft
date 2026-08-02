"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Artwork = {
   id: number;
   title: string;
   artist: string;
   year: string;
   description: string;
   xPosition: number; // Position on the wide virtual wall
};

const ARTWORKS: Artwork[] = [
   {
      id: 0,
      title: "The Departure",
      artist: "Unknown",
      year: "1924",
      description: "A stark representation of leaving home. The subject looks back, but their shadow points forward. The first step of the journey is always the heaviest.",
      xPosition: -350
   },
   {
      id: 1,
      title: "The Crossing",
      artist: "Unknown",
      year: "1926",
      description: "Midway through the passage. The colors blur here, symbolizing the loss of certainty. What was once familiar has faded, and the destination remains unseen.",
      xPosition: 0
   },
   {
      id: 2,
      title: "The Arrival",
      artist: "Unknown",
      year: "1927",
      description: "Resolution. The sharp lines return, forming a structure. We have reached the end of the corridor, bringing with us everything we learned in the dark.",
      xPosition: 350
   }
];

export function MuseumPlaque({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // White

  const [gameState, setGameState] = useState<"start" | "touring" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  // null means zoomed out (wide view). number means zoomed in on that specific artwork ID.
  const [focusedArtwork, setFocusedArtwork] = useState<number | null>(null);
  const [readArtworks, setReadArtworks] = useState<number[]>([]);

  const handleArtworkClick = (id: number) => {
     if (gameState !== "touring" || focusedArtwork !== null) return;
     setFocusedArtwork(id);
     if (!readArtworks.includes(id)) {
        setReadArtworks(prev => [...prev, id]);
     }
  };

  const handleStepBack = () => {
     setFocusedArtwork(null);
     
     if (readArtworks.length === ARTWORKS.length) {
        // Just finished reading the last one
        setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2000);
        }, 1000); // Wait for the camera to pull back before ending
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Determine wall translation based on focus
  // If focused: move wall on X to center the artwork, and move wall forward on Z (zoom in)
  // If not focused: center the wall, move it back on Z (zoom out)
  const targetX = focusedArtwork !== null ? -ARTWORKS.find(a => a.id === focusedArtwork)!.xPosition : 0;
  const targetZ = focusedArtwork !== null ? 250 : -200; 

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container - The "Camera Lens" */}
      <div 
         className={`relative w-[320px] h-[480px] bg-[#fdfdfd] shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ perspective: "800px" }}
      >
         
         {/* 3D Space Container */}
         <motion.div 
            className="w-full h-full absolute inset-0 transform-style-3d"
            animate={{ 
               x: targetX,
               z: targetZ,
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
         >
            
            {/* The Wall */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2000px] h-[400px] bg-[#fafafa] flex items-center justify-center shadow-[inset_0_20px_50px_rgba(0,0,0,0.05)] border-b border-black/5">
               
               {/* Spotlights */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50" style={{
                  backgroundImage: "radial-gradient(circle at 32.5% 20%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 50% 20%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 30%), radial-gradient(circle at 67.5% 20%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 30%)"
               }} />

               {/* Artworks & Plaques */}
               {ARTWORKS.map((art) => {
                  const isFocused = focusedArtwork === art.id;
                  const isRead = readArtworks.includes(art.id);

                  return (
                     <div 
                        key={art.id} 
                        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-6"
                        style={{ left: `calc(50% + ${art.xPosition}px)` }}
                     >
                        
                        {/* The Painting */}
                        <motion.button 
                           onClick={() => handleArtworkClick(art.id)}
                           className={`w-32 h-40 bg-white border-[6px] border-[#222] shadow-[10px_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center relative group ${focusedArtwork !== null ? "pointer-events-none" : "cursor-pointer"}`}
                           whileHover={focusedArtwork === null ? { scale: 1.05 } : {}}
                        >
                           {/* Abstract Art Placeholder */}
                           <div className="w-[85%] h-[85%] bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                              <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] opacity-20" style={{ background: `linear-gradient(${art.id * 45}deg, ${primaryColor}, transparent)` }} />
                              <div className="w-10 h-10 border-2 border-black rotate-45 opacity-50" />
                           </div>

                           {/* Interactive Indicator (when zoomed out) */}
                           {!isRead && focusedArtwork === null && gameState === "touring" && (
                              <div className="absolute -top-3 -right-3 w-4 h-4 bg-red-500 rounded-full animate-ping shadow-lg" />
                           )}
                        </motion.button>

                        {/* The Plaque */}
                        <div className="w-24 h-fit bg-[#f4f4f5] border border-black/10 p-2 shadow-[2px_2px_5px_rgba(0,0,0,0.1)] translate-y-8 flex flex-col">
                           <div className="text-[6px] uppercase tracking-widest font-black text-black mb-1">
                              {art.title}
                           </div>
                           <div className="text-[5px] text-black/60 mb-2 italic font-serif">
                              {art.artist}, {art.year}
                           </div>
                           <p className="text-[5px] leading-relaxed font-sans text-black/80">
                              {art.description}
                           </p>
                        </div>

                     </div>
                  );
               })}
            </div>

            {/* The Floor */}
            <div 
               className="absolute top-[400px] left-1/2 -translate-x-1/2 w-[2000px] h-[1000px] bg-[#d6d3d1] origin-top"
               style={{ 
                  transform: "rotateX(90deg)",
                  backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 49px, rgba(0,0,0,0.05) 49px, rgba(0,0,0,0.05) 50px)"
               }} 
            />

         </motion.div>

         {/* UI Overlays (Fixed in screen space, not 3D space) */}
         <AnimatePresence>
            {focusedArtwork !== null && (
               <motion.div 
                  className="absolute bottom-6 left-0 w-full flex justify-center z-30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.5 }}
               >
                  <button 
                     onClick={handleStepBack}
                     className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     Step Back
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {gameState === "touring" && focusedArtwork === null && (
               <motion.div 
                  className="absolute bottom-6 left-0 w-full flex justify-center z-30 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                  <div className="bg-black/60 text-white backdrop-blur-md px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono">
                     Pan and tap to view
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="w-16 h-16 border-[4px] border-black p-1 shadow-lg mb-6 rotate-3">
                     <div className="w-full h-full border border-black/20 bg-zinc-200 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border border-black/50" />
                     </div>
                  </div>
                  <h2 className="uppercase tracking-widest font-black mb-4 text-xl text-black">
                     The Gallery
                  </h2>
                  <p className="text-xs text-black/60 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Read the plaques to uncover the history behind the collection.
                  </p>
                  <button 
                     onClick={() => setGameState("touring")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-black text-white shadow-xl active:scale-95 transition-all bg-black"
                  >
                     Enter Exhibition
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/95 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center border border-black/10 bg-white p-8 shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  <div className="text-[10px] uppercase tracking-[0.2em] font-black text-black/40 mb-6 pb-2 border-b border-black/10">
                     Exhibition Concluded
                  </div>

                  <h1 className="text-2xl font-serif text-black mb-6 leading-tight tracking-wide">
                     {config.title}
                  </h1>
                  
                  <p className="text-sm leading-loose font-sans font-light text-black/80">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "touring" && focusedArtwork === null && (
         <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-black/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-black/50 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Tour
            </h2>
            <button 
               onClick={() => {
                  setReadArtworks(ARTWORKS.map(a => a.id));
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md bg-black"
            >
               Speed Tour
            </button>
         </div>
      )}
      
    </div>
  );
}
