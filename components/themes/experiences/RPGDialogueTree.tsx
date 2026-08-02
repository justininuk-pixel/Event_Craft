"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Expression = "neutral" | "happy" | "angry" | "surprised" | "sad" | "confused";

type DialogueNode = {
   id: string;
   text: string;
   expression: Expression;
   options: {
      text: string;
      nextNodeId: string | null; // null means end of dialogue
   }[];
};

const DIALOGUE_TREE: Record<string, DialogueNode> = {
   "start": {
      id: "start",
      text: "You're late. I almost left.",
      expression: "angry",
      options: [
         { text: "Sorry, got held up.", nextNodeId: "apology" },
         { text: "I'm here now, aren't I?", nextNodeId: "defensive" },
         { text: "Who are you again?", nextNodeId: "confused" }
      ]
   },
   "apology": {
      id: "apology",
      text: "Fine. At least you showed up. Do you have it?",
      expression: "neutral",
      options: [
         { text: "Yes. Right here.", nextNodeId: "deliver" },
         { text: "Have what?", nextNodeId: "confused" }
      ]
   },
   "defensive": {
      id: "defensive",
      text: "With that attitude, this is going to be a short transaction. Do you have the item?",
      expression: "angry",
      options: [
         { text: "I have it. Relax.", nextNodeId: "deliver" },
         { text: "Maybe I don't want to give it to you.", nextNodeId: "refusal" }
      ]
   },
   "confused": {
      id: "confused",
      text: "Very funny. You know exactly why we are here. Now, hand it over.",
      expression: "sad", // Disappointed
      options: [
         { text: "Okay, fine. Here.", nextNodeId: "deliver" },
         { text: "I'm keeping it.", nextNodeId: "refusal" }
      ]
   },
   "refusal": {
      id: "refusal",
      text: "That was not part of the deal! Give it to me!",
      expression: "surprised",
      options: [
         { text: "Just kidding. Here.", nextNodeId: "deliver" }
      ]
   },
   "deliver": {
      id: "deliver",
      text: "Excellent... This is exactly what I needed. I will unlock the payload for you.",
      expression: "happy",
      options: [
         { text: "Thank you.", nextNodeId: null },
         { text: "[Leave]", nextNodeId: null }
      ]
   }
};

const AvatarEntity = ({ expression, color }: { expression: Expression, color: string }) => {
   // A highly stylized SVG avatar that changes based on expression
   return (
      <motion.div 
         className="w-48 h-48 rounded-3xl bg-slate-800 shadow-2xl relative flex items-center justify-center overflow-hidden border-4"
         style={{ borderColor: color }}
         animate={{
            y: expression === "happy" ? [0, -10, 0] : expression === "sad" ? 10 : 0,
            scale: expression === "surprised" ? 1.05 : 1,
            rotate: expression === "confused" ? 5 : expression === "angry" ? [0, -2, 2, -2, 0] : 0
         }}
         transition={{ duration: 0.3 }}
      >
         {/* Face background gradient */}
         <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }} />
         
         {/* Eyes Container */}
         <div className="flex gap-8 relative z-10">
            {/* Left Eye */}
            <motion.div 
               className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden"
               animate={{
                  height: expression === "angry" || expression === "sad" ? 20 : 40,
                  borderRadius: expression === "surprised" ? "50%" : "20%",
                  scaleY: expression === "happy" ? 0.2 : 1
               }}
            >
               <motion.div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{
                     y: expression === "surprised" ? -5 : expression === "sad" ? 5 : 0,
                     x: expression === "angry" ? 5 : 0
                  }}
               />
            </motion.div>
            
            {/* Right Eye */}
            <motion.div 
               className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden"
               animate={{
                  height: expression === "angry" || expression === "sad" ? 20 : 40,
                  borderRadius: expression === "surprised" ? "50%" : "20%",
                  scaleY: expression === "happy" ? 0.2 : 1
               }}
            >
               <motion.div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{
                     y: expression === "surprised" ? -5 : expression === "sad" ? 5 : 0,
                     x: expression === "angry" ? -5 : 0
                  }}
               />
            </motion.div>
         </div>

         {/* Mouth */}
         <motion.div 
            className="absolute bottom-10 w-16 h-2 bg-white rounded-full"
            animate={{
               width: expression === "surprised" ? 20 : expression === "happy" ? 40 : 64,
               height: expression === "surprised" ? 20 : 8,
               borderRadius: expression === "surprised" ? "50%" : "999px",
               rotate: expression === "sad" ? 10 : expression === "angry" ? -5 : 0
            }}
         />
      </motion.div>
   );
};

export function RPGDialogueTree({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // Violet
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"]; // Indigo 950

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentNodeId, setCurrentNodeId] = useState<string>("start");

  const currentNode = DIALOGUE_TREE[currentNodeId];

  const handleOptionClick = (nextNodeId: string | null) => {
     if (nextNodeId === null) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        setCurrentNodeId(nextNodeId);
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
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-10"
              style={{
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
              }}
         />

         {gameState === "playing" && currentNode && (
            <div className="flex-1 flex flex-col z-10 w-full h-full relative">
               
               {/* 1. Character Avatar Area */}
               <div className="flex-1 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                     <motion.div 
                        key={currentNode.expression} // Animate when expression changes
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                     >
                        <AvatarEntity expression={currentNode.expression} color={primaryColor} />
                     </motion.div>
                  </AnimatePresence>
               </div>

               {/* 2. Dialogue Box Area */}
               <div className="bg-slate-900/90 backdrop-blur-md border-t-2 p-5 pb-4 min-h-[120px] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" style={{ borderColor: primaryColor }}>
                  <div className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-70" style={{ color: primaryColor }}>Unknown Entity</div>
                  
                  {/* Typewriter effect for dialogue text */}
                  <motion.p 
                     key={currentNode.id + "_text"}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="text-slate-200 text-sm leading-relaxed"
                  >
                     {currentNode.text}
                  </motion.p>
               </div>

               {/* 3. Options Area */}
               <div className="bg-slate-950 p-4 pb-6 flex flex-col gap-2">
                  {currentNode.options.map((opt, i) => (
                     <motion.button
                        key={currentNode.id + "_opt_" + i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }} // Staggered entrance
                        onClick={() => handleOptionClick(opt.nextNodeId)}
                        className="text-left px-4 py-3 rounded-md bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm border border-slate-700 hover:border-slate-500 transition-colors active:scale-[0.98]"
                     >
                        <span className="opacity-50 mr-2">{i + 1}.</span> {opt.text}
                     </motion.button>
                  ))}
               </div>

            </div>
         )}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-white">
                     Dialogue Event
                  </h2>
                  <p className="text-xs text-slate-400 mb-12 text-center px-8 leading-relaxed">
                     Navigate the conversation to unlock the payload.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Approach
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
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="bg-slate-900 border border-slate-800 p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden rounded-2xl"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="font-mono uppercase tracking-[0.3em] mb-4 text-[10px]" style={{ color: primaryColor }}>Trust Established</div>
                  <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight text-white tracking-tight">
                     {config.title}
                  </h1>
                  <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg leading-relaxed text-slate-300">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-sans font-bold uppercase tracking-widest text-[10px] mb-3 opacity-80">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-2 rounded-xl active:scale-95 transition-transform shadow-md border border-white/30 hover:bg-white/20"
               style={{ backgroundColor: primaryColor }}
            >
               Skip Conversation
            </button>
         </div>
      )}
      
    </div>
  );
}
