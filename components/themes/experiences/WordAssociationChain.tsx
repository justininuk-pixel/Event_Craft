"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function WordAssociationChain({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"ready" | "associating" | "revealed">("ready");
  const [chain, setChain] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  useEffect(() => {
     setChain([config.title || "Ocean"]);
  }, [config.title]);

  const startGame = () => {
     setPhase("associating");
     startTimer();
  };
  
  const startTimer = () => {
     setTimerKey(k => k + 1);
     if (timeoutRef.current) clearTimeout(timeoutRef.current);
     
     // 3 seconds limit
     timeoutRef.current = setTimeout(() => {
        endGame();
     }, 3000);
     
     // Auto-focus input
     setTimeout(() => {
        inputRef.current?.focus();
     }, 100);
  };
  
  const endGame = () => {
     if (timeoutRef.current) clearTimeout(timeoutRef.current);
     setPhase("revealed");
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 1000);
  };
  
  const handleSubmit = () => {
     const word = currentInput.trim();
     if (!word) return;
     
     setChain(prev => [...prev, word]);
     setCurrentInput("");
     
     if (chain.length >= 3) { // User completes 3 associations to finish the local demo
        endGame();
     } else {
        startTimer();
     }
  };

  const currentPrompt = chain[chain.length - 1];

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      <AnimatePresence mode="wait">
         {phase === "ready" && (
            <motion.div
               key="ready"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 z-30"
            >
               <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">
                  Word Association
               </h1>
               <p className="text-xl mb-12 text-center opacity-80 max-w-sm">
                  You will see a word. You have exactly <span className="font-bold text-red-400">3 seconds</span> to type the first word that comes to mind.
               </p>
               
               <button
                  onClick={startGame}
                  className="px-12 py-5 rounded-full font-black text-2xl text-white shadow-[0_0_40px_rgba(255,0,0,0.5)] transition-transform active:scale-95"
                  style={{ backgroundColor: primaryColor }}
               >
                  I'M READY
               </button>
            </motion.div>
         )}

         {phase === "associating" && (
            <motion.div
               key="associating"
               className="absolute inset-0 flex flex-col z-20 bg-zinc-950"
            >
               {/* Progress Bar Timer */}
               <div className="w-full h-4 bg-zinc-900 relative overflow-hidden flex-shrink-0">
                  <motion.div
                     key={timerKey} // Forces re-mount of animation on reset
                     initial={{ width: "100%", backgroundColor: "#22c55e" }}
                     animate={{ width: "0%", backgroundColor: "#ef4444" }}
                     transition={{ duration: 3, ease: "linear" }}
                     className="h-full absolute left-0 top-0 shadow-[0_0_20px_red]"
                  />
               </div>

               <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <span className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-4">
                     Prompt
                  </span>
                  <motion.h1 
                     key={currentPrompt}
                     initial={{ opacity: 0, y: -20, scale: 1.5 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className="text-6xl md:text-8xl font-black text-white text-center break-words mb-16 uppercase tracking-tighter"
                     style={{ textShadow: `0 0 40px ${primaryColor}` }}
                  >
                     {currentPrompt}
                  </motion.h1>

                  <input
                     ref={inputRef}
                     type="text"
                     value={currentInput}
                     onChange={e => setCurrentInput(e.target.value.replace(/\s/g, ""))} // Single words only
                     placeholder="Type first word..."
                     className="w-full max-w-md bg-transparent border-b-4 text-center text-4xl font-black py-4 outline-none placeholder:opacity-30 uppercase tracking-widest transition-colors focus:border-red-500 text-white"
                     onKeyDown={e => e.key === "Enter" && handleSubmit()}
                     autoFocus
                  />
               </div>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 overflow-y-auto pb-32 pt-16 px-8 flex flex-col items-center custom-scrollbar bg-zinc-950"
            >
               <h2 className="text-2xl font-black uppercase tracking-widest mb-12 text-zinc-500">
                  The Chain
               </h2>

               <div className="flex flex-col items-center gap-2 w-full max-w-md">
                  {chain.map((word, i) => (
                     <React.Fragment key={i}>
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className={`px-8 py-4 rounded-2xl font-black text-3xl uppercase tracking-tighter ${
                              i === 0 ? "bg-zinc-800 text-zinc-400" : "bg-white text-zinc-950"
                           }`}
                        >
                           {word}
                        </motion.div>
                        {i < chain.length - 1 && (
                           <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: 24 }}
                              transition={{ delay: i * 0.1 + 0.05 }}
                              className="w-1 bg-zinc-800"
                           />
                        )}
                     </React.Fragment>
                  ))}
               </div>

               {/* Final Card Content */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: chain.length * 0.1 + 0.5 }}
                 className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl mt-16 flex flex-col items-center shadow-2xl border border-zinc-700 text-center"
               >
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-3xl font-heading mb-4 text-white">
                   {config.title}
                 </h1>
                 <p className="text-base font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </motion.div>

            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
