"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Memory = {
   id: number;
   question: string;
   hint: string;
   answer: string;
   unlockedText: string;
};

const MEMORIES: Memory[] = [
   {
      id: 0,
      question: "What is your name?",
      hint: "The name they called you in the lab.",
      answer: "subject", // Forgiving match
      unlockedText: "Subject 42. That's what they called you. You remember the sterile white walls and the humming of the machines."
   },
   {
      id: 1,
      question: "What were you looking for?",
      hint: "It was glowing blue.",
      answer: "core",
      unlockedText: "The core. A dense sphere of energy. It was the only thing keeping the facility powered... and you stole it."
   },
   {
      id: 2,
      question: "Where did you hide it?",
      hint: "Under the floorboards.",
      answer: "floor",
      unlockedText: "You pried up the loose board in the maintenance tunnel. It's still there. Waiting."
   }
];

export function AmnesiaRebuild({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#cbd5e1"; // Slate 300
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // Slate 950

  const [gameState, setGameState] = useState<"start" | "rebuilding" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [errorState, setErrorState] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (gameState !== "rebuilding" || currentMemoryIndex >= MEMORIES.length) return;

     const targetAnswer = MEMORIES[currentMemoryIndex].answer.toLowerCase();
     const normalizedInput = inputValue.trim().toLowerCase();

     // Forgiving match (if input contains the core answer keyword)
     if (normalizedInput.includes(targetAnswer)) {
        setInputValue("");
        const nextIndex = currentMemoryIndex + 1;
        setCurrentMemoryIndex(nextIndex);
        
        if (nextIndex === MEMORIES.length) {
           setTimeout(() => {
              setGameState("won");
    onComplete?.();
              setTimeout(() => setShowPayload(true), 2500);
           }, 1500);
        } else {
           // Refocus input for next question
           setTimeout(() => inputRef.current?.focus(), 100);
        }
     } else {
        setErrorState(true);
        setTimeout(() => setErrorState(false), 500);
     }
  };

  // Auto-scroll when new memory is unlocked
  useEffect(() => {
     if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
     }
  }, [currentMemoryIndex]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Calculate fog intensity based on progress (less fog as memories are unlocked)
  const progressPercent = currentMemoryIndex / MEMORIES.length;
  const fogOpacity = Math.max(0, 0.8 - (progressPercent * 0.8));

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-black shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-[2px] pointer-events-none" : "scale-100"}`}
      >
         
         {/* Ethereal Fog Layer */}
         <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms] z-20 mix-blend-screen"
            style={{ 
               opacity: fogOpacity,
               backgroundImage: 'url("https://www.transparenttextures.com/patterns/dust.png")',
               backgroundSize: '150px'
            }}
         />

         {/* Memory Stream (Unlocked text) */}
         <div 
            ref={scrollContainerRef}
            className="w-full h-full p-8 pb-32 overflow-y-auto no-scrollbar relative z-10 flex flex-col justify-end min-h-full"
         >
            <div className="flex-1" /> {/* Push content to bottom initially */}
            
            <AnimatePresence initial={false}>
               {MEMORIES.slice(0, currentMemoryIndex).map((memory) => (
                  <motion.div
                     key={`memory-${memory.id}`}
                     initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                     animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="mb-8"
                  >
                     <p className="text-sm leading-loose font-serif text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {memory.unlockedText}
                     </p>
                  </motion.div>
               ))}
            </AnimatePresence>

            {/* Current Question & Input */}
            <AnimatePresence>
               {gameState === "rebuilding" && currentMemoryIndex < MEMORIES.length && (
                  <motion.div
                     key={`question-${currentMemoryIndex}`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 1, delay: 0.5 }}
                     className="mt-4 pt-4 border-t border-white/10"
                  >
                     <label htmlFor="amnesia-input" className="block text-xs uppercase tracking-widest text-white/50 mb-2 font-mono">
                        {MEMORIES[currentMemoryIndex].question}
                     </label>
                     <form onSubmit={handleSubmit} className="relative">
                        <motion.input
                           ref={inputRef}
                           id="amnesia-input"
                           type="text"
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                           className={`w-full bg-transparent border-b ${errorState ? "border-red-500 text-red-400" : "border-white/30 text-white"} pb-2 outline-none font-serif text-lg focus:border-white transition-colors`}
                           placeholder="..."
                           autoComplete="off"
                           animate={errorState ? { x: [-5, 5, -5, 5, 0] } : {}}
                           transition={{ duration: 0.4 }}
                        />
                     </form>
                     <div className="text-[9px] text-white/30 mt-2 font-serif italic text-right">
                        Hint: {MEMORIES[currentMemoryIndex].hint}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
                  exit={{ opacity: 0, transition: { duration: 1.5 } }}
               >
                  <div className="w-12 h-12 rounded-full border border-white/20 mb-6 flex items-center justify-center animate-pulse">
                     <div className="w-2 h-2 bg-white rounded-full blur-[1px]" />
                  </div>
                  <h2 className="uppercase tracking-[0.3em] font-light mb-4 text-xl text-white font-mono">
                     Amnesia
                  </h2>
                  <p className="text-xs text-white/40 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Your mind is blank. Answer the prompts to rebuild your memory.
                  </p>
                  <button 
                     onClick={() => {
                        setGameState("rebuilding");
                        setTimeout(() => inputRef.current?.focus(), 1500);
                     }}
                     className="px-8 py-3 uppercase tracking-widest text-[10px] font-bold text-black bg-white hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                     Wake Up
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 3 }} // Long slow fade to blinding white
            >
               <motion.div 
                  className="w-full max-w-sm text-center relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 2, delay: 1 }}
               >
                  
                  <div className="font-mono text-[10px] text-black/40 tracking-[0.3em] uppercase mb-8">
                     Memory Restored
                  </div>

                  <h1 className="text-3xl font-serif text-black mb-8 leading-tight tracking-wide">
                     {config.title}
                  </h1>
                  
                  <p className="text-sm leading-loose font-sans font-light text-black/80 text-justify">
                     {config.body}
                  </p>

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "rebuilding" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white/50 font-sans font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  setCurrentMemoryIndex(MEMORIES.length);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-black font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md bg-white"
            >
               Unlock All Memories
            </button>
         </div>
      )}
      
    </div>
  );
}
