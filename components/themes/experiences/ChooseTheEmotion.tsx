"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type EmotionChoice = {
   label: string;
   color: string;
   resultText: string;
};

type NarrativeBeat = {
   id: number;
   intro: string;
   choices: EmotionChoice[];
};

const NARRATIVE_TREE: NarrativeBeat[] = [
   {
      id: 0,
      intro: "They stood at the edge of the ruined bridge, looking across the chasm. The artifact was right there in the thief's hands.",
      choices: [
         { label: "Angry", color: "#ef4444", resultText: "A surge of heat rushed through their veins. They yelled across the gap, words echoing sharply against the stone. 'You have no idea what you've done!'" },
         { label: "Forgiving", color: "#3b82f6", resultText: "A calm washed over them. They lowered their hands, sighing deeply. 'Keep it,' they called out gently. 'I hope it brings you peace.'" },
         { label: "Sad", color: "#8b5cf6", resultText: "Tears pricked their eyes. They fell to their knees on the broken cobblestone, the weight of the betrayal finally setting in." },
      ]
   },
   {
      id: 1,
      intro: "The thief hesitated, caught off guard by the reaction. A sudden tremor shook the ground.",
      choices: [
         { label: "Brave", color: "#f59e0b", resultText: "Without thinking, they leaped forward toward the crumbling edge, reaching out to catch the thief before the bridge collapsed entirely." },
         { label: "Fearful", color: "#64748b", resultText: "They scrambled backward, heart pounding in their chest, putting as much distance between themselves and the chasm as possible." },
      ]
   },
   {
      id: 2,
      intro: "Dust settled. The silence that followed was deafening.",
      choices: [
         { label: "Determined", color: "#10b981", resultText: "They stood up, dusting off their coat. The artifact was gone, but the journey wasn't over. They turned away from the chasm, ready to find another way." }
      ]
   }
];

export function ChooseTheEmotion({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#a855f7"; // Purple 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#09090b"]; // Zinc 950

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  
  // History of the story built so far.
  // Contains alternating intros and results.
  const [storyHistory, setStoryHistory] = useState<Array<{ text: string, color?: string, isIntro: boolean, id: string }>>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize the first intro when game starts
  useEffect(() => {
     if (gameState === "playing" && storyHistory.length === 0) {
        setStoryHistory([{ text: NARRATIVE_TREE[0].intro, isIntro: true, id: `intro-0` }]);
     }
  }, [gameState, storyHistory.length]);

  const handleChoice = (choice: EmotionChoice) => {
     if (gameState !== "playing") return;

     // 1. Append result text
     setStoryHistory(prev => [
        ...prev,
        { text: choice.resultText, color: choice.color, isIntro: false, id: `result-${currentBeatIndex}` }
     ]);

     // 2. Advance beat or win
     const nextIndex = currentBeatIndex + 1;
     setCurrentBeatIndex(nextIndex);

     if (nextIndex < NARRATIVE_TREE.length) {
        // Append next intro
        setTimeout(() => {
           setStoryHistory(prev => [
              ...prev,
              { text: NARRATIVE_TREE[nextIndex].intro, isIntro: true, id: `intro-${nextIndex}` }
           ]);
        }, 1000); // Small pause for pacing
     } else {
        // End of narrative tree
        setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2000);
        }, 1500);
     }
  };

  // Auto-scroll to bottom
  useEffect(() => {
     if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
     }
  }, [storyHistory, currentBeatIndex]);

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
         className={`relative w-[320px] h-[480px] bg-[#18181b] rounded border border-[#27272a] shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         <div 
            ref={scrollContainerRef}
            className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar relative z-10"
         >
            <AnimatePresence initial={false}>
               {storyHistory.map((block) => (
                  <motion.div
                     key={block.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8 }}
                  >
                     <p 
                        className={`text-sm leading-loose font-serif ${block.isIntro ? "text-zinc-300" : ""}`}
                        style={{ color: block.color || undefined, textShadow: block.color ? `0 0 10px ${block.color}40` : undefined }}
                     >
                        {block.text}
                     </p>
                  </motion.div>
               ))}
            </AnimatePresence>
            
            {/* The active choice buttons */}
            <AnimatePresence>
               {gameState === "playing" && currentBeatIndex < NARRATIVE_TREE.length && storyHistory.length % 2 !== 0 && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.5, delay: 0.5 }}
                     className="flex flex-col gap-3 mt-4 mb-12"
                  >
                     <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2 text-center">
                        How should they feel?
                     </div>
                     <div className="flex flex-wrap justify-center gap-3">
                        {NARRATIVE_TREE[currentBeatIndex].choices.map((choice, i) => (
                           <button
                              key={i}
                              onClick={() => handleChoice(choice)}
                              className="px-4 py-2 rounded-full border bg-[#18181b] transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest font-bold"
                              style={{ 
                                 borderColor: choice.color, 
                                 color: choice.color,
                                 boxShadow: `0 0 15px ${choice.color}20` 
                              }}
                           >
                              {choice.label}
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#09090b]/90 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1 } }}
               >
                  <div className="w-16 h-16 rounded-full border border-zinc-700 flex flex-wrap items-center justify-center gap-1 mb-6 p-2 relative overflow-hidden">
                     {/* Floating color orbs */}
                     <motion.div className="w-4 h-4 bg-red-500 rounded-full blur-[2px]" animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity }} />
                     <motion.div className="w-4 h-4 bg-blue-500 rounded-full blur-[2px]" animate={{ x: [2, -2, 2], y: [2, -2, 2] }} transition={{ duration: 4, repeat: Infinity }} />
                     <motion.div className="w-4 h-4 bg-amber-500 rounded-full blur-[2px]" animate={{ x: [-2, 2, -2], y: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity }} />
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-sans font-light mb-4 text-xl text-white">
                     Empathy
                  </h2>
                  <p className="text-xs text-zinc-400 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Guide the narrative by choosing how they feel.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all bg-zinc-800 border border-zinc-700"
                  >
                     Begin Story
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
               transition={{ duration: 2 }}
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
               >
                  
                  <div className="w-px h-16 bg-gradient-to-b from-transparent to-white/50 mb-8" />

                  <h1 className="text-3xl font-serif text-white mb-8 leading-tight tracking-wide" style={{ textShadow: `0 0 20px ${primaryColor}80` }}>
                     {config.title}
                  </h1>
                  
                  <div className="w-full p-6 border-y border-white/10 relative">
                     <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
                     <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
                     <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
                     <p className="text-sm leading-loose font-serif text-white/80">
                        {config.body}
                     </p>
                  </div>

                  <div className="w-px h-16 bg-gradient-to-t from-transparent to-white/50 mt-8" />

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Reading
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md border border-zinc-700 bg-zinc-800"
            >
               Auto-Complete Story
            </button>
         </div>
      )}
      
    </div>
  );
}
