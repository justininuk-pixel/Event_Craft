"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type StoryNode = {
   text: string;
   isEnding?: boolean;
   choices?: { text: string; next: string }[];
};

const STORY: Record<string, StoryNode> = {
   start: {
      text: "You awaken in a pitch-black corridor. A cold draft touches your face.",
      choices: [
         { text: "Follow the draft", next: "draft_path" },
         { text: "Walk the opposite way", next: "warm_path" }
      ]
   },
   draft_path: {
      text: "The draft grows stronger. You hear the faint sound of rushing water.",
      choices: [
         { text: "Investigate the water", next: "water_fall" },
         { text: "Stay close to the wall", next: "wall_hug" }
      ]
   },
   warm_path: {
      text: "The air grows heavy and warm. A faint red glow appears ahead.",
      choices: [
         { text: "Approach the glow", next: "fire_pit" },
         { text: "Wait in the dark", next: "wait_dark" }
      ]
   },
   water_fall: {
      text: "You find an underground river. A small boat bobs in the current.",
      choices: [
         { text: "Take the boat", next: "end_boat" },
         { text: "Keep walking", next: "end_lost" }
      ]
   },
   wall_hug: {
      text: "Hugging the wall, you find a hidden lever.",
      choices: [
         { text: "Pull it", next: "end_lever" },
         { text: "Leave it alone", next: "draft_path" }
      ]
   },
   fire_pit: {
      text: "It's a smoldering fire pit. Beside it, a wooden door.",
      choices: [
         { text: "Open the door", next: "end_door" },
         { text: "Turn back", next: "start" }
      ]
   },
   wait_dark: {
      text: "You wait. And wait. You hear footsteps approaching...",
      choices: [
         { text: "Hide", next: "end_hide" },
         { text: "Call out", next: "end_captured" }
      ]
   },
   end_boat: { isEnding: true, text: "The river carries you out to the open ocean and freedom." },
   end_lost: { isEnding: true, text: "You wander the caverns until your torch goes out forever." },
   end_lever: { isEnding: true, text: "A secret passage opens, leading directly to the surface." },
   end_door: { isEnding: true, text: "The door opens into a blinding light. You have escaped." },
   end_hide: { isEnding: true, text: "The footsteps pass. You are safe, but still trapped." },
   end_captured: { isEnding: true, text: "They found you. Better luck next time." },
};

export function BranchingInterrogation({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#a855f7"; // Purple 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // Black

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState<string[]>([]);
  
  const currentNode = STORY[currentNodeId];

  const handleChoice = (nextId: string) => {
     setHistory(prev => [...prev, currentNodeId]);
     setCurrentNodeId(nextId);
     
     if (STORY[nextId]?.isEnding) {
        setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }, 2000);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-serif flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ backgroundColor: bgColors[0] }}
      >
         
         {/* Vignette */}
         <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' }} />

         {gameState === "playing" && (
            <div className="absolute inset-0 p-8 flex flex-col z-10">
               <div className="flex-1 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={currentNodeId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-white text-center text-lg leading-relaxed font-serif"
                     >
                        {currentNode.text}
                     </motion.div>
                  </AnimatePresence>
               </div>

               <div className="h-40 flex flex-col justify-end gap-4 pb-4">
                  <AnimatePresence mode="wait">
                     {!currentNode.isEnding && (
                        <motion.div
                           key={`choices-${currentNodeId}`}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.5, delay: 0.3 }}
                           className="flex flex-col gap-3"
                        >
                           {currentNode.choices?.map((choice, i) => (
                              <button
                                 key={i}
                                 onClick={() => handleChoice(choice.next)}
                                 className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm tracking-wide transition-colors"
                              >
                                 {choice.text}
                              </button>
                           ))}
                        </motion.div>
                     )}
                     {currentNode.isEnding && (
                        <motion.div
                           key="ending-indicator"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ duration: 1 }}
                           className="flex justify-center items-center h-full"
                        >
                           <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="text-white font-serif italic text-4xl mb-4 text-center px-4 leading-tight drop-shadow-md">
                     The Path
                  </div>
                  <div className="text-white/50 font-sans mb-12 text-center px-8 text-xs uppercase tracking-widest">
                     Your choices determine the outcome.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-8 py-3 font-sans font-bold uppercase tracking-widest border border-white/20 hover:bg-white/10 transition-colors"
                  >
                     Begin
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
                  className="bg-black border border-white/20 p-10 md:p-14 rounded-sm max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="font-sans uppercase tracking-[0.3em] mb-6 text-xs text-white/50">End of the Line</div>
                  <h1 className="text-3xl md:text-4xl font-serif mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <div className="w-12 h-[1px] bg-white/20 mx-auto mb-6" />
                  <p className="text-lg text-white/80 font-serif leading-relaxed italic">
                     {config.body}
                  </p>
                  
                  {/* Subtle decorative elements matching primary color */}
                  <div className="absolute top-0 left-0 w-2 h-2 opacity-50" style={{ backgroundColor: primaryColor }} />
                  <div className="absolute bottom-0 right-0 w-2 h-2 opacity-50" style={{ backgroundColor: primaryColor }} />
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-sans font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-black font-sans font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg bg-white"
            >
               Auto-Solve Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
