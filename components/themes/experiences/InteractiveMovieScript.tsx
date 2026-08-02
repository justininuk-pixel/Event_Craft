"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type ScriptBlock = {
   id: number;
   type: "heading" | "action" | "character" | "parenthetical" | "dialogue" | "transition";
   text: string;
   isInteractive?: boolean;
   effectId?: "flash" | "rumble" | "fadeRed";
};

const SCRIPT_LINES: ScriptBlock[] = [
   { id: 0, type: "heading", text: "EXT. NEON STREETS - NIGHT" },
   { id: 1, type: "action", text: "Rain slicks the pavement. A distant siren wails." },
   { id: 2, type: "action", text: "Suddenly, a loud CRACK echoes through the alley.", isInteractive: true, effectId: "flash" },
   { id: 3, type: "character", text: "THE PROTAGONIST" },
   { id: 4, type: "parenthetical", text: "(whispering)" },
   { id: 5, type: "dialogue", text: "They found us.", isInteractive: true },
   { id: 6, type: "action", text: "Footsteps approach rapidly. The ground trembles beneath their feet as the train passes overhead.", isInteractive: true, effectId: "rumble" },
   { id: 7, type: "character", text: "THE ANTAGONIST" },
   { id: 8, type: "dialogue", text: "There's nowhere left to run.", isInteractive: true, effectId: "fadeRed" },
   { id: 9, type: "transition", text: "FADE OUT." }
];

export function InteractiveMovieScript({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // Red 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // Off-white paper

  const [gameState, setGameState] = useState<"start" | "reading" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [readBlocks, setReadBlocks] = useState<number[]>([]);
  const [activeEffect, setActiveEffect] = useState<"flash" | "rumble" | "fadeRed" | null>(null);

  const interactiveTotal = SCRIPT_LINES.filter(l => l.isInteractive).length;

  const handleBlockClick = (block: ScriptBlock) => {
     if (gameState !== "reading" || !block.isInteractive) return;

     if (!readBlocks.includes(block.id)) {
        setReadBlocks(prev => [...prev, block.id]);
     }

     if (block.effectId) {
        setActiveEffect(block.effectId);
        // Clear effect after duration
        setTimeout(() => setActiveEffect(null), block.effectId === "rumble" ? 2000 : 1000);
     }
  };

  useEffect(() => {
     if (gameState === "reading" && readBlocks.length === interactiveTotal) {
        setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2500);
        }, 2000);
     }
  }, [readBlocks.length, interactiveTotal, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // CSS mappings for Screenplay format
  const getFormatClasses = (type: ScriptBlock["type"]) => {
     switch (type) {
        case "heading": return "uppercase font-bold text-left w-full mt-6 mb-4";
        case "action": return "text-left w-full mb-4 pr-4";
        case "character": return "uppercase text-center w-full mt-4";
        case "parenthetical": return "text-center w-full italic pl-4 pr-4";
        case "dialogue": return "text-left w-3/4 mx-auto mb-4";
        case "transition": return "uppercase text-right w-full mt-8 mb-8 font-bold";
        default: return "text-left w-full";
     }
  };

  return (
    <div 
      className="w-full h-full relative font-mono flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: "#111" }}
    >
      
      {/* Ambient Effects Layer (Behind the script, over the black background) */}
      <AnimatePresence>
         {activeEffect === "flash" && (
            <motion.div 
               className="absolute inset-0 z-0 bg-white"
               initial={{ opacity: 0 }}
               animate={{ opacity: [1, 0, 1, 0] }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
            />
         )}
         {activeEffect === "fadeRed" && (
            <motion.div 
               className="absolute inset-0 z-0"
               style={{ backgroundColor: primaryColor }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.5 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
            />
         )}
      </AnimatePresence>

      {/* Game Viewport Container - The "Paper" */}
      <motion.div 
         className={`relative w-[320px] h-[480px] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 flex flex-col z-10 ${gameState === "won" ? "scale-95 opacity-0 blur-sm pointer-events-none" : "scale-100 opacity-100"} ${activeEffect === "rumble" ? "animate-[rumble_0.1s_linear_infinite]" : ""}`}
         style={{ backgroundColor: bgColors[0] }}
      >
         {/* Internal Rumble Keyframes */}
         <style>{`
            @keyframes rumble {
               0% { transform: translate(0, 0); }
               25% { transform: translate(-2px, 2px); }
               50% { transform: translate(2px, -2px); }
               75% { transform: translate(-2px, -2px); }
               100% { transform: translate(2px, 2px); }
            }
         `}</style>
         
         {/* Paper Texture */}
         <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

         {/* The Script Content */}
         <div className="w-full h-full p-8 overflow-y-auto no-scrollbar relative z-20 text-black text-[11px] leading-tight flex flex-col">
            
            {SCRIPT_LINES.map((line) => {
               const isInteractive = line.isInteractive;
               const isRead = readBlocks.includes(line.id);

               return (
                  <div 
                     key={line.id} 
                     className={`
                        ${getFormatClasses(line.type)} 
                        ${isInteractive ? "cursor-pointer relative" : ""}
                     `}
                     onClick={() => handleBlockClick(line)}
                  >
                     {/* Interactive Highlight */}
                     {isInteractive && gameState === "reading" && !isRead && (
                        <div className="absolute -inset-1 border border-dashed border-red-400 rounded-sm bg-red-400/10 animate-pulse pointer-events-none z-[-1]" />
                     )}
                     
                     <span className={`${isRead ? "opacity-100" : isInteractive ? "opacity-80" : "opacity-100"}`}>
                        {line.text}
                     </span>
                  </div>
               );
            })}

         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="text-white font-mono text-[10px] uppercase tracking-[0.3em] mb-8 border border-white/20 p-2">
                     Scene 1 - Take 1
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-serif mb-4 text-2xl text-white text-center">
                     The Script
                  </h2>
                  <p className="text-xs text-white/60 mb-12 text-center px-8 leading-relaxed font-mono">
                     Tap the highlighted blocks to trigger the scene's action.
                  </p>
                  <button 
                     onClick={() => setGameState("reading")}
                     className="px-8 py-3 uppercase tracking-widest text-[10px] font-bold text-black bg-white hover:bg-zinc-200 active:scale-95 transition-all"
                  >
                     Action!
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </motion.div>

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
                  
                  <div className="font-mono text-[10px] text-white/50 tracking-[0.3em] uppercase mb-12">
                     FADE IN:
                  </div>

                  <h1 className="text-3xl font-serif text-white mb-8 leading-tight tracking-widest uppercase">
                     {config.title}
                  </h1>
                  
                  <p className="text-xs leading-loose font-mono text-white/80 max-w-[280px] text-left">
                     {config.body}
                  </p>
                  
                  <div className="font-mono text-[10px] text-white/50 tracking-[0.3em] uppercase mt-12">
                     THE END.
                  </div>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "reading" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/90 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/60 font-mono font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Reading
            </h2>
            <button 
               onClick={() => {
                  setReadBlocks(SCRIPT_LINES.map(l => l.id));
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-white"
            >
               Cut to Ending
            </button>
         </div>
      )}
      
    </div>
  );
}
