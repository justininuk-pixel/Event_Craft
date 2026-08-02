"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type DashboardInteraction = "radio" | "glovebox" | "mirror";

const INTERACTIONS: Record<DashboardInteraction, { title: string; content: string }> = {
   mirror: {
      title: "Looking Back",
      content: "A flash of headlights in the rain. We've been driving for hours."
   },
   radio: {
      title: "AM Radio 88.5",
      content: "[Static]... storm warning in effect for the outer counties... [Static]"
   },
   glovebox: {
      title: "Polaroid Photo",
      content: "A faded picture of a diner we stopped at yesterday. Seems like a lifetime ago."
   }
};

export function RoadTripDashboard({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // Amber 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // Gray 900

  const [gameState, setGameState] = useState<"start" | "driving" | "arrived">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [interactedPoints, setInteractedPoints] = useState<DashboardInteraction[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<DashboardInteraction | null>(null);

  const handleInteract = (point: DashboardInteraction) => {
     if (gameState !== "driving") return;
     setActiveOverlay(point);
     if (!interactedPoints.includes(point)) {
        setInteractedPoints(prev => [...prev, point]);
     }
  };

  const closeOverlay = () => {
     setActiveOverlay(null);
     
     // Check win condition
     if (interactedPoints.length === 3) {
        setGameState("arrived");
        setTimeout(() => setShowPayload(true), 2000);
     }
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
      
      {/* Game Viewport Container - The "Car" */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-lg shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "arrived" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ backgroundColor: "#000" }} // Deep night outside
      >
         
         {/* Background Scenery (The Window) */}
         <div className="absolute top-0 left-0 w-full h-[60%] overflow-hidden bg-[#0a0a2a]">
            {/* Moving Road Lines / Stars */}
            {gameState !== "arrived" && (
               <div className="absolute inset-0 z-0 opacity-50 flex items-end justify-center perspective-[500px]">
                  {/* Road simulation via 3D transformed lines */}
                  <motion.div 
                     className="w-[1000px] h-[400px] bg-transparent border-t-[40px] border-black/80 origin-top"
                     style={{ 
                        transform: "rotateX(75deg) translateZ(-50px)",
                        backgroundImage: "repeating-linear-gradient(90deg, transparent 0%, transparent 48%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.2) 52%, transparent 52%, transparent 100%)",
                        backgroundSize: "20px 100%"
                     }}
                     animate={{ backgroundPosition: ["0px 0px", "0px 100px"] }}
                     transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                  />
               </div>
            )}
            
            {/* Distant Mountains (parallax) */}
            <motion.div 
               className="absolute bottom-0 left-0 w-[200%] h-32 opacity-30"
               style={{ 
                  backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\"><path d=\"M0 20 L10 5 L20 15 L35 0 L50 18 L65 8 L80 20 Z\" fill=\"black\"/></svg>')",
                  backgroundSize: "160px 100%",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "bottom"
               }}
               animate={gameState !== "arrived" ? { x: [0, -160] } : {}}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Horizon Glow */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#1e1b4b] to-transparent mix-blend-screen" />
         </div>

         {/* Foreground Dashboard UI */}
         <div className="absolute bottom-0 left-0 w-full h-[55%] pointer-events-none z-10 flex flex-col justify-end">
            
            {/* The Dashboard Shape */}
            <div className="w-full h-full bg-[#1c1917] rounded-t-[40px] border-t-8 border-[#292524] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative pointer-events-auto">
               
               {/* Dashboard Texture */}
               <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }} />

               {/* Hitbox: Glovebox */}
               <button 
                  onClick={() => handleInteract("glovebox")}
                  className={`absolute right-4 top-12 w-28 h-16 border-2 rounded ${interactedPoints.includes("glovebox") ? "border-[#444] bg-[#222]" : "border-white/20 hover:border-white/50 bg-[#292524]"} shadow-inner flex items-center justify-center transition-colors`}
               >
                  <div className="w-6 h-1 bg-black/50 rounded-full mb-10" /> {/* Handle */}
                  {!interactedPoints.includes("glovebox") && gameState === "driving" && (
                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  )}
               </button>

               {/* Hitbox: Radio Center Console */}
               <div className="absolute left-1/2 -translate-x-1/2 top-4 w-32 h-32 bg-[#292524] rounded-t-lg border-2 border-white/10 flex flex-col items-center p-2">
                  {/* Air Vents */}
                  <div className="flex gap-2 w-full justify-center mb-4 opacity-50">
                     <div className="w-8 h-4 border border-black flex flex-col justify-evenly p-[1px]"><div className="h-[1px] bg-black"/><div className="h-[1px] bg-black"/></div>
                     <div className="w-8 h-4 border border-black flex flex-col justify-evenly p-[1px]"><div className="h-[1px] bg-black"/><div className="h-[1px] bg-black"/></div>
                  </div>
                  
                  {/* Radio Interactive */}
                  <button 
                     onClick={() => handleInteract("radio")}
                     className={`w-full h-12 bg-black rounded border-2 ${interactedPoints.includes("radio") ? "border-[#444]" : "border-white/20 hover:border-white/50"} flex items-center justify-center relative shadow-inner`}
                  >
                     <div className="text-[8px] font-mono text-[#10b981] opacity-80">88.5 FM</div>
                     {!interactedPoints.includes("radio") && gameState === "driving" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                     )}
                  </button>
               </div>

            </div>
         </div>

         {/* Hitbox: Rear-view Mirror */}
         <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button 
               onClick={() => handleInteract("mirror")}
               className={`w-40 h-10 rounded-full border-4 border-[#292524] bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8] flex items-center justify-center relative shadow-xl transition-transform hover:scale-105 active:scale-95 ${interactedPoints.includes("mirror") ? "opacity-50" : "opacity-100"}`}
            >
               <div className="w-[95%] h-[80%] rounded-full bg-gradient-to-b from-white/40 to-transparent border border-white/50 pointer-events-none" />
               {!interactedPoints.includes("mirror") && gameState === "driving" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
               )}
            </button>
         </div>

         {/* Interactive Modal Overlay */}
         <AnimatePresence>
            {activeOverlay && (
               <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
               >
                  <div className="w-full bg-[#fafafa] border-4 border-black p-6 relative shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                     <h3 className="font-sans font-black uppercase tracking-widest text-black text-sm mb-4 border-b-2 border-black pb-2">
                        {INTERACTIONS[activeOverlay].title}
                     </h3>
                     <p className="font-serif italic text-black/80 text-sm leading-relaxed mb-6">
                        "{INTERACTIONS[activeOverlay].content}"
                     </p>
                     <button 
                        onClick={closeOverlay}
                        className="w-full py-2 bg-black text-white font-black uppercase tracking-widest text-[10px]"
                     >
                        Put Away
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center mb-6">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                  </div>
                  <h2 className="uppercase tracking-widest font-black mb-4 text-xl text-white">
                     The Drive
                  </h2>
                  <p className="text-xs text-white/60 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Inspect the dashboard to piece together the journey before we arrive.
                  </p>
                  <button 
                     onClick={() => setGameState("driving")}
                     className="px-8 py-3 rounded uppercase tracking-widest text-[10px] font-black text-black shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Engine
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  <div className="w-20 h-20 mb-8 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                     <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-20" />
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>

                  <div className="font-mono text-[10px] text-white/50 tracking-[0.3em] uppercase mb-4">
                     Destination Reached
                  </div>
                  
                  <h1 className="text-2xl font-black uppercase text-white mb-6 leading-tight tracking-tighter" style={{ color: primaryColor }}>
                     {config.title}
                  </h1>
                  
                  <div className="w-full p-4 bg-white/5 border border-white/10 rounded-lg">
                     <p className="text-sm leading-relaxed font-serif italic text-white/90">
                        {config.body}
                     </p>
                  </div>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "driving" && !activeOverlay && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Search
            </h2>
            <button 
               onClick={() => {
                  setInteractedPoints(["mirror", "radio", "glovebox"]);
                  setGameState("arrived");
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md bg-white"
            >
               Arrive at Destination
            </button>
         </div>
      )}
      
    </div>
  );
}
