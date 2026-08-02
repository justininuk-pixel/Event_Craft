"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ErasurePoem({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#000000";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"];

  // Default wall of text
  const rawText = config.body || "The world is full of noise. We hear a thousand voices every day telling us what to think, where to go, how to be. But if you strip it all away, if you take the time to erase the doubts and the fears, you might find something true underneath it all. I know it's hard. Sometimes the chaos feels overwhelming, like a storm that won't end. I just want you to know that I am always here, waiting for the dust to settle, hoping you will find your way back. Love is a patient thing, even when the world is not. It will wait for you.";

  // The hidden message we want the user to isolate
  const hiddenMessagePhrase = "I will always love you";
  const hiddenWordsList = hiddenMessagePhrase.split(" ").map(w => w.toLowerCase());

  // Parse the raw text into an array of words
  const parsedWords = useMemo(() => {
     // Split by whitespace
     const words = rawText.split(/\s+/);
     
     // We need to designate which indices correspond to the hidden message.
     // To do this simply, we will find the first occurrence of each hidden word in order.
     const targetIndices: number[] = [];
     let searchIdx = 0;
     
     words.forEach((word, idx) => {
        if (searchIdx < hiddenWordsList.length) {
           const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
           if (cleanWord === hiddenWordsList[searchIdx]) {
              targetIndices.push(idx);
              searchIdx++;
           }
        }
     });
     
     // If the raw text doesn't actually contain the hidden words in order,
     // we'll just fall back to making some arbitrary words the target, or
     // inject them. For this theme, we assume the author wrote the text properly.
     // But we should gracefully handle it if they didn't.
     const hasValidTargets = targetIndices.length === hiddenWordsList.length;

     return words.map((word, idx) => ({
        id: idx,
        text: word,
        isTarget: hasValidTargets ? targetIndices.includes(idx) : false
     }));
  }, [rawText, hiddenWordsList]);

  // Set of erased word IDs
  const [erasedIds, setErasedIds] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleWord = (id: number, isTarget: boolean) => {
     if (isCompleted) return;

     setErasedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
           // We allow "un-erasing" if they made a mistake
           next.delete(id);
        } else {
           // If they try to erase a target word, we prevent it (or let them, but it ruins the puzzle? Let's protect targets for usability)
           if (isTarget) {
              // Shake effect could go here, but for simplicity we just return
              return prev; 
           }
           next.add(id);
        }
        return next;
     });
  };

  // Completion Check
  useEffect(() => {
     if (isCompleted) return;

     // Calculate total "noise" words
     const totalNoise = parsedWords.filter(w => !w.isTarget).length;
     
     // If the number of erased words equals the total noise words, they found the message!
     if (erasedIds.size === totalNoise && totalNoise > 0) {
        setIsCompleted(true);
        if (onComplete) onComplete();
     }
  }, [erasedIds, parsedWords, isCompleted, onComplete]);

  // Mode helpers
  const handleEditorComplete = () => {
     const allNoiseIds = parsedWords.filter(w => !w.isTarget).map(w => w.id);
     setErasedIds(new Set(allNoiseIds));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center font-serif overflow-hidden select-none transition-colors duration-1000"
      style={{ 
         backgroundColor: isCompleted ? primaryColor : bgColors[0],
         color: isCompleted ? bgColors[0] : primaryColor
      }}
    >
      
      {/* Background Texture */}
      <div 
         className="absolute inset-0 opacity-40 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }} 
      />

      <div className="relative z-10 w-full max-w-2xl p-8 md:p-12 h-full flex flex-col justify-center">
         
         <AnimatePresence>
            {!isCompleted && (
               <motion.div 
                  className="mb-8 text-center opacity-50 text-sm tracking-widest uppercase font-sans"
                  exit={{ opacity: 0, y: -20 }}
               >
                  Tap the noise to erase it. Find the message.
               </motion.div>
            )}
         </AnimatePresence>

         <motion.div 
            className="flex flex-wrap gap-x-2 gap-y-3 leading-relaxed text-lg md:text-2xl justify-center text-center"
            layout
         >
            {parsedWords.map((word) => {
               const isErased = erasedIds.has(word.id);
               
               return (
                  <motion.span
                     key={word.id}
                     layout
                     onClick={() => toggleWord(word.id, word.isTarget)}
                     className={`cursor-pointer transition-all duration-300 relative inline-block`}
                     style={{
                        opacity: isErased ? 0 : 1,
                        pointerEvents: isErased ? 'none' : 'auto', // can't click it once it's gone
                        // If it's a target and the puzzle is solved, make it pop
                        transform: isCompleted && word.isTarget ? 'scale(1.2)' : 'scale(1)',
                        fontWeight: isCompleted && word.isTarget ? 'bold' : 'normal',
                        margin: isErased ? '0 -2px' : '0' // collapse space slightly when erased
                     }}
                     whileHover={!isErased && !word.isTarget ? { opacity: 0.5 } : {}}
                     whileTap={!isErased && !word.isTarget ? { opacity: 0, scale: 0.8 } : { x: [-2, 2, -2, 2, 0] }} // shake if target
                  >
                     {word.text}
                     
                     {/* Strikethrough effect on erase */}
                     {isErased && (
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black -translate-y-1/2" />
                     )}
                  </motion.span>
               );
            })}
         </motion.div>
         
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isCompleted && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleEditorComplete}
               className="bg-black/20 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
               style={{ color: primaryColor }}
            >
               Erase Noise (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
