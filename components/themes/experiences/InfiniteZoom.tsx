"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

type ZoomLayer = {
   id: number;
   label: string;
   caption: string;
   shape: "city" | "building" | "window" | "person" | "cell" | "atom";
};

const ZOOM_LAYERS: ZoomLayer[] = [
   { id: 0, label: "MACRO: METROPOLIS", caption: "Millions of lives, vibrating together in the concrete grid.", shape: "city" },
   { id: 1, label: "SECTOR: TOWER 4", caption: "One structure among thousands, holding its breath.", shape: "building" },
   { id: 2, label: "POINT: UNIT 802", caption: "A single glowing window in the monolithic dark.", shape: "window" },
   { id: 3, label: "SUBJECT: THE OBSERVER", caption: "Watching the city that watches them back.", shape: "person" },
   { id: 4, label: "MICRO: NEURON", caption: "A spark of realization travels the synaptic gap.", shape: "cell" },
   { id: 5, label: "NANO: CORE", caption: "The fundamental unit. Everything is connected.", shape: "atom" },
];

export function InfiniteZoom({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const [gameState, setGameState] = useState<"start" | "zooming" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We will use scroll progress within a very tall container to map to virtual zoom scale
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // 0 to 1 progress maps to 0 to 6 "layer indexes"
  const currentFloatIndex = useTransform(scrollYProgress, [0, 1], [0, 5.99]);
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
     return currentFloatIndex.onChange((v) => {
        const index = Math.floor(v);
        if (index !== activeIndex && index >= 0 && index < ZOOM_LAYERS.length) {
           setActiveIndex(index);
        }
        
        // Trigger win condition if we hit the very bottom
        if (v >= 5.95 && gameState === "zooming") {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2000);
        }
     });
  }, [currentFloatIndex, activeIndex, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Map the fractional part of the current index (e.g. 1.5 -> 0.5) to a scale factor.
  // We want each layer to start at scale 1 and scale up to, say, scale 5 before fading out.
  const layerScale = useTransform(currentFloatIndex, (v) => {
     const fraction = v - Math.floor(v); // 0.0 to 0.99
     return 1 + (fraction * 4); // Scale from 1 to 5
  });

  const getLayerOpacity = (layerIndex: number) => {
     return useTransform(currentFloatIndex, (v) => {
        // Opacity mapping for smooth crossfade
        if (v < layerIndex - 0.2) return 0; // Not reached yet
        if (v >= layerIndex - 0.2 && v < layerIndex) {
           // Fading in (from the previous layer's perspective)
           return (v - (layerIndex - 0.2)) * 5; 
        }
        if (v >= layerIndex && v < layerIndex + 0.8) {
           return 1; // Fully visible while zooming
        }
        if (v >= layerIndex + 0.8 && v < layerIndex + 1) {
           // Fading out to reveal the next nested layer
           return 1 - ((v - (layerIndex + 0.8)) * 5);
        }
        return 0; // Passed
     });
  };

  return (
    <div 
      className="w-full h-full relative font-mono flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: "#020617" }} // Deep dark background
    >
      
      {/* HUD Overlay */}
      {gameState === "zooming" && (
         <div className="absolute top-8 left-8 right-8 flex justify-between z-40 pointer-events-none opacity-50">
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
               LVL: 0{activeIndex + 1}
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: primaryColor }}>
               <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
               TRACKING
            </div>
         </div>
      )}

      {/* Narrative Caption (Fixed) */}
      <AnimatePresence mode="wait">
         {gameState === "zooming" && (
            <motion.div 
               key={`caption-${activeIndex}`}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.5 }}
               className="absolute bottom-12 left-0 w-full px-8 text-center z-40 pointer-events-none"
            >
               <div className="text-[8px] text-white/50 mb-2 uppercase tracking-[0.4em]">
                  {ZOOM_LAYERS[activeIndex]?.label}
               </div>
               <p className="text-sm text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {ZOOM_LAYERS[activeIndex]?.caption}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Game Viewport Container - The "Lens" */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-full border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05),_inset_0_0_100px_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-20 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ backgroundColor: bgColors[0] }}
      >
         
         {/* Crosshairs */}
         <div className="absolute inset-0 z-30 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white border-dashed animate-[spin_30s_linear_infinite]" />
         </div>

         {/* The Scroll Driver */}
         {/* We place a tall transparent div here to capture scroll events, while the visual layers are fixed behind it. */}
         <div 
            ref={containerRef}
            className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden"
            style={{ 
               // Only enable scrolling during active game state
               pointerEvents: gameState === "zooming" ? "auto" : "none",
               // Hide scrollbar but allow interaction
               scrollbarWidth: 'none',
               msOverflowStyle: 'none'
            }}
         >
            {/* The scrollable height (5 screens worth of scrolling) */}
            <div className="w-full" style={{ height: "600vh" }} />
         </div>

         {/* Visual Zoom Layers (Rendered simultaneously, opacity/scale controlled by useTransform) */}
         <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {ZOOM_LAYERS.map((layer, index) => {
               // Only scale the CURRENT active layer.
               // Previous layers are blown out (scale 5+), next layers are waiting at scale 1.
               const currentScale = useTransform(currentFloatIndex, (v) => {
                  if (v < index) return 1; // Waiting
                  if (v >= index && v < index + 1) return layerScale.get(); // Active zooming
                  return 5; // Passed (blown out)
               });

               const opacity = getLayerOpacity(index);

               return (
                  <motion.div
                     key={layer.id}
                     className="absolute inset-0 flex items-center justify-center"
                     style={{ opacity, scale: currentScale }}
                  >
                     {/* Rendering abstract geometric representations for each scale */}
                     {layer.shape === "city" && (
                        <div className="w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,transparent_20%,#000_70%)] relative opacity-50" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)" }}>
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20" />
                        </div>
                     )}
                     {layer.shape === "building" && (
                        <div className="w-[120px] h-[400px] border border-white/20 flex flex-col justify-evenly p-2">
                           {[...Array(10)].map((_, i) => (
                              <div key={i} className="flex gap-2 justify-center">
                                 <div className={`w-4 h-6 border border-white/30 ${i === 4 ? "bg-white/40 shadow-[0_0_10px_white]" : ""}`} />
                                 <div className="w-4 h-6 border border-white/30" />
                              </div>
                           ))}
                        </div>
                     )}
                     {layer.shape === "window" && (
                        <div className="w-[160px] h-[240px] border-4 border-black bg-white/10 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-24 bg-black rounded-t-full opacity-80" />
                        </div>
                     )}
                     {layer.shape === "person" && (
                        <div className="w-48 h-48 rounded-full border border-white/10 relative overflow-hidden flex items-center justify-center">
                           <div className="w-24 h-24 rounded-full border border-white/20 bg-black relative overflow-hidden flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                              <div className="w-2 h-2 bg-black rounded-full absolute" />
                           </div>
                        </div>
                     )}
                     {layer.shape === "cell" && (
                        <div className="relative flex items-center justify-center">
                           <svg width="200" height="200" viewBox="0 0 100 100" className="animate-[spin_20s_linear_infinite]">
                              <path d="M50 10 C 20 40, 80 40, 50 90 C 80 40, 20 40, 50 10" fill="none" stroke={primaryColor} strokeWidth="0.5" className="opacity-50" />
                              <circle cx="50" cy="50" r="10" fill={primaryColor} className="opacity-80 animate-pulse" />
                           </svg>
                        </div>
                     )}
                     {layer.shape === "atom" && (
                        <div className="relative flex items-center justify-center">
                           <div className="absolute w-32 h-8 rounded-[100%] border border-white/40 animate-[spin_2s_linear_infinite]" />
                           <div className="absolute w-32 h-8 rounded-[100%] border border-white/40 animate-[spin_2s_linear_infinite_reverse]" style={{ transform: "rotate(60deg)" }} />
                           <div className="absolute w-32 h-8 rounded-[100%] border border-white/40 animate-[spin_3s_linear_infinite]" style={{ transform: "rotate(120deg)" }} />
                           <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                        </div>
                     )}
                  </motion.div>
               );
            })}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="w-16 h-16 rounded-full border border-white/20 flex flex-col items-center justify-center mb-6 overflow-hidden relative">
                     <div className="w-full h-[1px] bg-white/40 absolute top-1/2 left-0" />
                     <div className="w-[1px] h-full bg-white/40 absolute top-0 left-1/2" />
                     <div className="w-8 h-8 border border-white rounded-full animate-ping opacity-20" />
                  </div>
                  <h2 className="uppercase tracking-[0.3em] font-light mb-4 text-xl text-white">
                     Magnitude
                  </h2>
                  <p className="text-xs text-white/60 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Scroll downwards to zoom in. The truth is hidden at the center.
                  </p>
                  <button 
                     onClick={() => setGameState("zooming")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-black bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                     Initiate Sequence
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 2 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 2, delay: 0.5 }}
               >
                  
                  <div className="w-4 h-4 bg-white rounded-full mb-8 shadow-[0_0_50px_rgba(255,255,255,1)]" />

                  <h1 className="text-3xl font-serif text-white mb-6 leading-tight tracking-widest uppercase">
                     {config.title}
                  </h1>
                  
                  <p className="text-sm leading-loose font-mono font-light text-white/60 text-justify border-l border-white/20 pl-4">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "zooming" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/90 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Scroll
            </h2>
            <button 
               onClick={() => {
                  if (containerRef.current) {
                     containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
                  }
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-500"
            >
               Auto-Zoom to Core
            </button>
         </div>
      )}
      
    </div>
  );
}
