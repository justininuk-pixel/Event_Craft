"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function EscapeRoom2D({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ca8a04"; // Yellow 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // Slate 800

  const [paintingMoved, setPaintingMoved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  
  const [shakeDoor, setShakeDoor] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const handleDoorClick = () => {
     if (doorUnlocked) return;

     if (hasKey) {
        setDoorUnlocked(true);
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        // Shake
        setShakeDoor(true);
        setTimeout(() => setShakeDoor(false), 500);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center p-4 bg-slate-900 select-none touch-none"
    >
      
      {/* Game Viewport Container */}
      <div className={`relative w-full max-w-lg aspect-[4/3] bg-amber-50 shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${doorUnlocked ? "scale-95 opacity-40 blur-sm pointer-events-none" : "border-8 border-slate-800 rounded-lg"}`}>
         
         {/* Room Walls & Floor */}
         <div className="absolute inset-0 flex flex-col">
            {/* Wall */}
            <div className="flex-1 bg-gradient-to-b from-amber-100 to-amber-200 relative">
               {/* Wallpaper Pattern */}
               <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)),linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1))] [background-size:20px_20px] [background-position:0_0,10px_10px]" />
            </div>
            {/* Baseboard */}
            <div className="h-6 bg-amber-900 border-t-2 border-amber-950 z-10" />
            {/* Floor */}
            <div className="h-24 bg-gradient-to-b from-amber-800 to-amber-950 relative overflow-hidden z-0">
               {/* Floor boards */}
               <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_90%,rgba(0,0,0,1)_90%)] [background-size:40px_100%]" />
            </div>
         </div>

         {/* --- The Key (Hidden behind painting) --- */}
         {!hasKey && (
            <motion.div 
               className="absolute top-20 right-24 w-8 h-12 cursor-pointer group z-10"
               initial={{ opacity: 0 }}
               animate={{ opacity: paintingMoved ? 1 : 0 }}
               whileHover={paintingMoved ? { scale: 1.1 } : {}}
               onClick={() => {
                  if (paintingMoved) setHasKey(true);
               }}
            >
               {/* Key Shape */}
               <div className="relative w-full h-full flex flex-col items-center group-hover:drop-shadow-[0_0_8px_rgba(252,211,77,0.8)] transition-all">
                  <div className="w-6 h-6 rounded-full border-4 border-yellow-500 absolute top-0" />
                  <div className="w-2 h-8 bg-yellow-500 absolute top-4 left-3" />
                  <div className="w-4 h-2 bg-yellow-500 absolute top-8 left-4" />
                  <div className="w-4 h-2 bg-yellow-500 absolute top-10 left-4" />
               </div>
            </motion.div>
         )}

         {/* --- The Painting --- */}
         <motion.div 
            className="absolute top-16 right-16 w-28 h-32 bg-amber-900 border-4 border-amber-950 shadow-xl cursor-pointer z-20 flex items-center justify-center overflow-hidden"
            animate={paintingMoved ? { y: 200, rotate: -15, x: 20, opacity: 0.5 } : { y: 0, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            onClick={() => setPaintingMoved(true)}
         >
            <div className="absolute inset-1 border border-amber-800/50" />
            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-green-300 relative">
               {/* Abstract Art */}
               <div className="absolute bottom-0 w-full h-1/2 bg-green-600 rounded-t-full opacity-80" />
               <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-300 rounded-full" />
            </div>
         </motion.div>

         {/* --- The Door --- */}
         <motion.div 
            className="absolute bottom-[6rem] left-16 w-36 h-64 bg-amber-800 border-[6px] border-amber-900 flex flex-col justify-end p-2 z-10 cursor-pointer shadow-[-10px_0_20px_rgba(0,0,0,0.3)] origin-left"
            animate={
               doorUnlocked 
                  ? { rotateY: -80, x: -10, filter: "brightness(0.5)" } 
                  : shakeDoor ? { x: [-5, 5, -5, 5, 0] } : {}
            }
            transition={doorUnlocked ? { duration: 1.5, ease: "easeInOut" } : { duration: 0.4 }}
            onClick={handleDoorClick}
         >
            {/* Door Panels */}
            <div className="w-full h-24 border-2 border-amber-900 bg-amber-700/50 mb-2" />
            <div className="w-full h-32 border-2 border-amber-900 bg-amber-700/50" />
            
            {/* Door Handle */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-10 bg-slate-800 rounded-full shadow-md flex flex-col items-center justify-center">
               <div className="w-2 h-2 bg-slate-900 rounded-full mb-1" />
            </div>

            {/* Light from open door */}
            {doorUnlocked && (
               <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1 }}
               />
            )}
         </motion.div>

         {/* --- HUD --- */}
         <div className="absolute top-4 left-4 flex gap-2 z-50 pointer-events-none">
            {/* Inventory Slot */}
            <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${hasKey ? "bg-slate-800/80 border-transparent shadow-lg" : "border-slate-400 bg-white/20"}`}>
               <AnimatePresence>
                  {hasKey && (
                     <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative w-8 h-8"
                     >
                        <div className="w-4 h-4 rounded-full border-2 border-yellow-400 absolute top-0 left-2" />
                        <div className="w-1.5 h-5 bg-yellow-400 absolute top-3 left-[13px]" />
                        <div className="w-2.5 h-1.5 bg-yellow-400 absolute top-5 left-[13px]" />
                        <div className="w-2.5 h-1.5 bg-yellow-400 absolute top-7 left-[13px]" />
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-yellow-600 font-black uppercase tracking-widest mb-6">Escape Successful</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !doorUnlocked && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setPaintingMoved(true);
                  setHasKey(true);
                  setDoorUnlocked(true);
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full bg-yellow-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-500 transition-colors shadow-lg"
            >
               Auto-Escape Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
