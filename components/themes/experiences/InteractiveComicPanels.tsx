"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type StoryBeat = 
  | { type: "panel"; id: string; bgColor: string; height: string }
  | { type: "dialogue"; id: string; panelId: string; text: string; position: "left" | "right" };

const STORY_BEATS: StoryBeat[] = [
   { type: "panel", id: "p1", bgColor: "#eef2ff", height: "180px" },
   { type: "dialogue", id: "d1", panelId: "p1", text: "It was a dark and stormy night...", position: "left" },
   { type: "dialogue", id: "d2", panelId: "p1", text: "Actually, it was Tuesday morning.", position: "right" },
   { type: "panel", id: "p2", bgColor: "#fff1f2", height: "120px" },
   { type: "dialogue", id: "d3", panelId: "p2", text: "Are you sure about this?", position: "left" },
   { type: "panel", id: "p3", bgColor: "#f0fdf4", height: "200px" },
   { type: "dialogue", id: "d4", panelId: "p3", text: "Never been more sure.", position: "right" },
   { type: "dialogue", id: "d5", panelId: "p3", text: "Then let's go.", position: "left" },
];

export function InteractiveComicPanels({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // White

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTap = () => {
     if (gameState !== "playing") return;
     
     if (currentStep < STORY_BEATS.length) {
        setCurrentStep(prev => prev + 1);
     } else if (currentStep === STORY_BEATS.length) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  };

  // Auto-scroll to bottom when new items appear
  useEffect(() => {
     if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
     }
  }, [currentStep]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Derive visible state from currentStep
  const visibleBeats = STORY_BEATS.slice(0, currentStep);
  const visiblePanels = visibleBeats.filter(b => b.type === "panel") as Array<{ id: string, bgColor: string, height: string }>;
  const visibleDialogues = visibleBeats.filter(b => b.type === "dialogue") as Array<{ id: string, panelId: string, text: string, position: "left" | "right" }>;

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none cursor-pointer"
      style={{ backgroundColor: bgColors[0], backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 0)', backgroundSize: '10px 10px' }} // Halftone dots
      onClick={handleTap}
    >
      
      {/* Game Viewport Container - The "Comic Page" */}
      <div 
         className={`relative w-[320px] h-[480px] bg-white border-4 border-black overflow-hidden flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-1000 ${gameState === "won" ? "scale-95 blur-sm opacity-50 pointer-events-none" : "scale-100"}`}
      >
         
         <div 
            ref={scrollContainerRef}
            className="w-full h-full p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar pointer-events-none"
         >
            <AnimatePresence>
               {visiblePanels.map((panel) => {
                  const panelDialogues = visibleDialogues.filter(d => d.panelId === panel.id);
                  
                  return (
                     <motion.div
                        layout
                        key={panel.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full relative border-4 border-black overflow-hidden bg-cover bg-center shrink-0"
                        style={{ backgroundColor: panel.bgColor, minHeight: panel.height }}
                     >
                        {/* Fake comic art background graphic using CSS patterns */}
                        <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)' }} />
                        
                        {/* Dialogues injected into this panel */}
                        <div className="relative w-full h-full p-2 flex flex-col gap-2">
                           <AnimatePresence>
                              {panelDialogues.map((dialogue) => (
                                 <motion.div
                                    key={dialogue.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className={`w-fit max-w-[80%] bg-white border-2 border-black p-2 relative shadow-[2px_2px_0px_#000] z-10 ${dialogue.position === "right" ? "self-end ml-auto" : "self-start"}`}
                                 >
                                    <p className="text-xs font-black uppercase tracking-tighter leading-tight text-black font-sans">
                                       {dialogue.text}
                                    </p>
                                    {/* Speech Bubble Tail */}
                                    <div 
                                       className={`absolute bottom-[-8px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black ${dialogue.position === "right" ? "right-4" : "left-4"}`} 
                                    />
                                    <div 
                                       className={`absolute bottom-[-5px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white ${dialogue.position === "right" ? "right-[18px]" : "left-[18px]"}`} 
                                    />
                                 </motion.div>
                              ))}
                           </AnimatePresence>
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>

            {/* Empty space at bottom to allow scrolling past the last item slightly */}
            <div className="h-12 shrink-0" />
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  {/* Comic Book Title Graphic */}
                  <div className="w-[80%] mb-8 relative flex justify-center">
                     <h2 
                        className="text-4xl font-black italic uppercase tracking-tighter text-white z-10 relative text-center leading-none"
                        style={{ textShadow: `3px 3px 0 ${primaryColor}, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 4px 4px 0 #000` }}
                     >
                        The Interactive Comic
                     </h2>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400 rotate-[-5deg] border-4 border-black -z-10" />
                  </div>
                  
                  <p className="text-sm font-black uppercase tracking-tighter text-black mb-8 px-6 text-center">
                     Tap the screen to advance the story.
                  </p>
                  
                  <button 
                     onClick={(e) => { e.stopPropagation(); setGameState("playing"); }}
                     className="px-8 py-3 bg-white border-4 border-black font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
                  >
                     Start Reading
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Tap Indicator Hint (Only shows when playing and not finished) */}
      <AnimatePresence>
         {gameState === "playing" && currentStep <= STORY_BEATS.length && (
            <motion.div 
               className="absolute bottom-10 right-10 pointer-events-none"
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.5 }}
               exit={{ opacity: 0 }}
            >
               <motion.div 
                  className="w-10 h-10 border-4 border-black rounded-full flex items-center justify-center bg-white/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
               >
                  <span className="font-black text-black">TAP</span>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               {/* Payload presented as a dramatic splash page */}
               <motion.div 
                  className="w-full h-full max-w-sm max-h-[600px] border-4 border-black bg-white shadow-[12px_12px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col p-6"
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
               >
                  {/* Action Lines Background */}
                  <div 
                     className="absolute inset-0 opacity-20"
                     style={{
                        background: `repeating-conic-gradient(from 0deg, ${primaryColor} 0deg 10deg, transparent 10deg 20deg)`
                     }}
                  />
                  
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                     <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-2 mb-8 shadow-[4px_4px_0px_#000] rotate-[-3deg]">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-black leading-none m-0">
                           {config.title}
                        </h1>
                     </div>
                     
                     <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000]">
                        <p className="text-sm font-black uppercase tracking-tighter leading-relaxed text-black">
                           {config.body}
                        </p>
                     </div>
                  </div>

                  {/* "To be continued..." box at bottom right */}
                  <div className="absolute bottom-4 right-4 bg-black text-white px-2 py-1 font-sans font-bold text-[10px] uppercase tracking-widest">
                     The End.
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white border-4 border-black p-4 flex flex-col items-center shadow-[4px_4px_0px_#000] z-50 rounded pointer-events-auto">
            <h2 className="text-black font-black uppercase tracking-tighter text-[10px] mb-2">
               Simulation: Bypass Reading
            </h2>
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  setCurrentStep(STORY_BEATS.length);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-black text-white font-black uppercase tracking-widest py-2 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
            >
               Skip to Splash Page
            </button>
         </div>
      )}
      
    </div>
  );
}
