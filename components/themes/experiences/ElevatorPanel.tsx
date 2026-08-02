"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Floor = {
   floorNumber: number | string;
   title: string;
   content: string;
   isRequired: boolean;
   bgColor: string;
};

const FLOORS: Floor[] = [
   {
      floorNumber: 1,
      title: "The Lobby",
      content: "Cold marble. The concierge barely looks up as you pass. You remember waiting here for hours, but you can't remember who you were waiting for.",
      isRequired: true,
      bgColor: "#0f172a"
   },
   {
      floorNumber: 2,
      title: "The Archives",
      content: "Rows of steel cabinets. The scent of old paper and dust. You found the file here, the one with your name on it.",
      isRequired: true,
      bgColor: "#1e1b4b"
   },
   {
      floorNumber: 3,
      title: "The Observation Deck",
      content: "The city spreads out below like a circuit board. This was where the decision was made.",
      isRequired: true,
      bgColor: "#172554"
   }
];

export function ElevatorPanel({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // Red 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // Gray 900

  // "start": initial screen
  // "panel": looking at buttons
  // "transit": doors closed, moving between floors
  // "scene": doors open, looking at floor content
  // "won": reached penthouse
  const [gameState, setGameState] = useState<"start" | "panel" | "transit" | "scene" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentFloor, setCurrentFloor] = useState<number | string>("L");
  const [targetFloor, setTargetFloor] = useState<number | string | null>(null);
  const [visitedFloors, setVisitedFloors] = useState<Array<number | string>>([]);
  const [doorsOpen, setDoorsOpen] = useState(false);

  const requiredFloorsVisited = FLOORS.every(f => visitedFloors.includes(f.floorNumber));

  const handleFloorSelect = (floor: number | string) => {
     if (gameState !== "panel") return;
     
     setTargetFloor(floor);
     setGameState("transit");
     setDoorsOpen(false); // Close doors

     // Simulate transit time
     setTimeout(() => {
        setCurrentFloor(floor);
        
        if (floor === "P") {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2500); // Wait for doors to open completely before showing payload
        } else {
           setGameState("scene");
           if (!visitedFloors.includes(floor)) {
              setVisitedFloors(prev => [...prev, floor]);
           }
        }
        
        // Open doors
        setTimeout(() => setDoorsOpen(true), 500);
        
     }, 2000); // 2 seconds of "transit"
  };

  const handleReturnToPanel = () => {
     setDoorsOpen(false);
     setTimeout(() => {
        setGameState("panel");
     }, 1000); // Wait for doors to close before showing panel
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Derived content for current floor scene
  const activeFloorContent = FLOORS.find(f => f.floorNumber === currentFloor);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container - The Elevator Shaft */}
      <div 
         className={`relative w-[320px] h-[480px] bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-zinc-900 overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95" : "scale-100"}`}
      >
         
         {/* The Floor Content (Behind the doors) */}
         <div className="absolute inset-0 z-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: activeFloorContent?.bgColor || "#000" }}>
            {gameState === "scene" && activeFloorContent && (
               <motion.div 
                  initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.8, duration: 1 }} // Wait for doors to mostly open
                  className="w-full"
               >
                  <h3 className="text-white font-serif text-2xl mb-6 border-b border-white/20 pb-4">
                     {activeFloorContent.title}
                  </h3>
                  <p className="text-white/80 font-sans text-sm leading-relaxed mb-12">
                     {activeFloorContent.content}
                  </p>
                  <button 
                     onClick={handleReturnToPanel}
                     className="px-6 py-2 bg-white/10 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/20 active:scale-95 transition-all"
                  >
                     Return to Car
                  </button>
               </motion.div>
            )}
         </div>

         {/* The Elevator Doors */}
         <div className="absolute inset-0 z-10 pointer-events-none flex">
            {/* Left Door */}
            <motion.div 
               className="w-1/2 h-full bg-zinc-800 border-r border-zinc-900 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.5)] flex justify-end"
               animate={{ x: doorsOpen ? "-95%" : "0%" }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
            >
               <div className="w-[2px] h-full bg-zinc-700 opacity-50" />
            </motion.div>
            {/* Right Door */}
            <motion.div 
               className="w-1/2 h-full bg-zinc-800 border-l border-zinc-900 shadow-[inset_5px_0_10px_rgba(0,0,0,0.5)] flex justify-start"
               animate={{ x: doorsOpen ? "95%" : "0%" }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
            >
               <div className="w-[2px] h-full bg-zinc-700 opacity-50" />
            </motion.div>
         </div>

         {/* The Control Panel (Rendered ON the closed doors, or fixed overlay inside the car) */}
         <AnimatePresence>
            {(gameState === "panel" || gameState === "transit") && !doorsOpen && (
               <motion.div 
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
               >
                  {/* The Panel UI */}
                  <div className="w-48 bg-zinc-300 rounded p-4 shadow-2xl border-t-2 border-l-2 border-white/40 border-b-2 border-r-2 border-black/40 flex flex-col items-center">
                     
                     {/* Digital Indicator */}
                     <div className="w-32 h-12 bg-black border-[3px] border-zinc-400 rounded-sm mb-6 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                        <div className="text-red-500 font-mono text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                           {gameState === "transit" ? (
                              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                                 {targetFloor}
                              </motion.span>
                           ) : (
                              currentFloor
                           )}
                        </div>
                     </div>

                     {/* Buttons Grid */}
                     <div className="grid grid-cols-2 gap-4 w-full">
                        {FLOORS.map((floor) => {
                           const isVisited = visitedFloors.includes(floor.floorNumber);
                           const isTarget = targetFloor === floor.floorNumber && gameState === "transit";
                           
                           return (
                              <button
                                 key={floor.floorNumber}
                                 onClick={() => handleFloorSelect(floor.floorNumber)}
                                 disabled={gameState === "transit"}
                                 className="w-12 h-12 mx-auto rounded-full bg-zinc-200 border-2 border-zinc-400 shadow-[2px_2px_5px_rgba(0,0,0,0.3),_inset_-2px_-2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center relative active:scale-95 active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] transition-transform"
                              >
                                 <span className="font-bold text-zinc-800 pointer-events-none">{floor.floorNumber}</span>
                                 {/* Halo ring for state */}
                                 <div className={`absolute inset-[2px] rounded-full border-2 transition-all duration-300 ${(isVisited || isTarget) ? "border-amber-500 opacity-100 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "border-transparent opacity-0"}`} />
                              </button>
                           );
                        })}

                        {/* Penthouse Button (Only visible/active if all requirements met) */}
                        <button
                           onClick={() => handleFloorSelect("P")}
                           disabled={!requiredFloorsVisited || gameState === "transit"}
                           className={`w-12 h-12 mx-auto rounded-full bg-zinc-200 border-2 border-zinc-400 shadow-[2px_2px_5px_rgba(0,0,0,0.3),_inset_-2px_-2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center relative transition-all duration-1000 ${requiredFloorsVisited ? "opacity-100 cursor-pointer active:scale-95" : "opacity-30 cursor-not-allowed"}`}
                        >
                           <span className="font-bold text-zinc-800 pointer-events-none">P</span>
                           {/* Halo ring */}
                           <div className={`absolute inset-[2px] rounded-full border-2 transition-all duration-300 ${gameState === "transit" && targetFloor === "P" ? "border-amber-500 opacity-100 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "border-transparent opacity-0"}`} />
                        </button>
                     </div>

                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/95 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="w-12 h-16 border-2 border-white/20 mb-6 flex items-center justify-center relative">
                     <div className="w-full h-[2px] bg-white/20 absolute top-1/2 left-0 -translate-y-1/2" />
                     <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-light mb-4 text-xl text-white font-sans">
                     The Elevator
                  </h2>
                  <p className="text-xs text-white/50 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Select a floor to piece together the events of that night.
                  </p>
                  <button 
                     onClick={() => setGameState("panel")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-black bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                     Step Inside
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
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  <div className="font-mono text-[10px] text-amber-500/50 tracking-[0.3em] uppercase mb-8">
                     Penthouse Reached
                  </div>

                  <h1 className="text-3xl font-serif text-white mb-8 leading-tight tracking-wide" style={{ textShadow: `0 0 20px ${primaryColor}80` }}>
                     {config.title}
                  </h1>
                  
                  <div className="w-full p-8 border border-white/10 bg-white/5">
                     <p className="text-sm leading-loose font-sans font-light text-white/80">
                        {config.body}
                     </p>
                  </div>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "panel" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Floors
            </h2>
            <button 
               onClick={() => {
                  setVisitedFloors(FLOORS.map(f => f.floorNumber));
                  handleFloorSelect("P"); // Trigger the penthouse transition
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md bg-amber-500"
            >
               Override to Penthouse
            </button>
         </div>
      )}
      
    </div>
  );
}
