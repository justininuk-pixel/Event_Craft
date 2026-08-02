"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Waypoint = {
   x: number; // 0-100% of map width
   y: number; // 0-100% of map height
   title: string;
   text: string;
};

const WAYPOINTS: Waypoint[] = [
   { x: 20, y: 80, title: "The Old Port", text: "Where it all began. The smell of salt and old timber." },
   { x: 35, y: 50, title: "The Winding Pass", text: "A treacherous path through the jagged mountains." },
   { x: 60, y: 30, title: "The Silent Forest", text: "Not a single bird sings here. Only the wind." },
   { x: 85, y: 60, title: "The Ruins", text: "Ancient stones marking the end of the line." }
];

export function InteractiveMapJourney({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // Red 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fde68a"]; // Amber 200

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const handlePinClick = (index: number) => {
     if (gameState !== "playing") return;
     if (index <= currentWaypoint) {
        setActiveModal(index);
     }
  };

  const handleCloseModal = () => {
     if (activeModal === currentWaypoint) {
        // If they closed the latest modal, advance the journey
        if (currentWaypoint < WAYPOINTS.length - 1) {
           setCurrentWaypoint(prev => prev + 1);
        } else {
           // Reached the end
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }
     }
     setActiveModal(null);
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Generate SVG path string from points
  const generatePath = (startIndex: number, endIndex: number) => {
     if (startIndex >= endIndex) return "";
     const p1 = WAYPOINTS[startIndex];
     const p2 = WAYPOINTS[endIndex];
     
     // Curved path for aesthetics
     const cpX = (p1.x + p2.x) / 2 + (Math.random() * 20 - 10);
     const cpY = (p1.y + p2.y) / 2 + (Math.random() * 20 - 10);
     
     return `M ${p1.x} ${p1.y} Q ${cpX} ${cpY} ${p2.x} ${p2.y}`;
  };

  return (
    <div 
      className="w-full h-full relative font-serif flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-[#f5ecd5] border-8 border-[#c9b793] rounded-sm shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         {/* Map Texture */}
         <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" 
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")' }} 
         />
         
         {/* Topographic Lines (Abstract SVG background) */}
         <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 0,20 Q 30,30 50,10 T 100,40" fill="none" stroke="black" strokeWidth="0.5" />
            <path d="M 0,40 Q 20,60 60,30 T 100,70" fill="none" stroke="black" strokeWidth="0.5" />
            <path d="M 0,70 Q 40,90 80,60 T 100,90" fill="none" stroke="black" strokeWidth="0.5" />
         </svg>

         {/* The Interactive Map Layer */}
         <div className="absolute inset-4 z-10">
            {/* Draw Paths */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
               {WAYPOINTS.map((wp, i) => {
                  if (i === WAYPOINTS.length - 1) return null;
                  
                  const isDrawn = currentWaypoint > i;
                  
                  return (
                     <motion.path
                        key={`path-${i}`}
                        d={generatePath(i, i + 1)}
                        fill="none"
                        stroke={primaryColor}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                           pathLength: isDrawn ? 1 : 0, 
                           opacity: isDrawn ? 1 : 0 
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                     />
                  );
               })}
            </svg>

            {/* Draw Pins */}
            {WAYPOINTS.map((wp, i) => {
               const isUnlocked = currentWaypoint >= i;
               const isCurrentTarget = currentWaypoint === i;
               
               return (
                  <motion.div
                     key={`pin-${i}`}
                     className={`absolute w-6 h-6 -ml-3 -mt-6 flex flex-col items-center justify-end ${isUnlocked ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : 'pointer-events-none opacity-50 grayscale'}`}
                     style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                     onClick={() => handlePinClick(i)}
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: isUnlocked ? 1 : 0.5, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                  >
                     {/* Map Pin Icon */}
                     <svg width="24" height="24" viewBox="0 0 24 24" fill={isUnlocked ? primaryColor : "#94a3b8"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                     </svg>
                     
                     {/* Pulse effect if it's the target */}
                     {isCurrentTarget && gameState === "playing" && activeModal !== i && (
                        <span className="absolute top-1 flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        </span>
                     )}
                  </motion.div>
               );
            })}
         </div>

         {/* Modal for Waypoint Content */}
         <AnimatePresence>
            {activeModal !== null && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute inset-4 z-30 bg-[#fffdf8] border border-[#d4d4d8] rounded-xl shadow-2xl p-6 flex flex-col items-center text-center justify-center pointer-events-auto"
               >
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{WAYPOINTS[activeModal].title}</h3>
                  <div className="w-12 h-[1px] bg-slate-300 mb-4" />
                  <p className="text-sm text-slate-600 leading-relaxed italic mb-8">
                     {WAYPOINTS[activeModal].text}
                  </p>
                  <button 
                     onClick={handleCloseModal}
                     className="px-6 py-2 rounded-full text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
                     style={{ backgroundColor: primaryColor }}
                  >
                     {activeModal === WAYPOINTS.length - 1 ? "End Journey" : "Continue"}
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-[#f5ecd5] font-serif italic text-4xl mb-4 text-center px-4 drop-shadow-md">
                     The Journey
                  </div>
                  <div className="text-[#f5ecd5]/70 font-sans mb-12 text-center px-8 text-xs uppercase tracking-widest leading-relaxed">
                     Follow the map. Uncover the story.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-8 py-3 font-sans font-bold uppercase tracking-widest border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-md"
                  >
                     Open Map
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-[#f5ecd5] p-10 md:p-14 rounded-sm max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="font-sans uppercase tracking-[0.3em] mb-6 text-xs text-slate-500">Destination Reached</div>
                  <h1 className="text-3xl md:text-4xl font-serif mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <div className="w-12 h-[2px] mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg text-slate-700 font-serif leading-relaxed italic">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-500 font-sans font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-3 rounded-xl active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Travel Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
