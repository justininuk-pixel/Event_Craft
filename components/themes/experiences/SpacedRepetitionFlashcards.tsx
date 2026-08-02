"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ThumbsUp, ThumbsDown, RotateCw, CheckCircle2 } from "lucide-react";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  interval: number; // Days until next review
  ease: number; // SuperMemo2 ease factor
  reps: number;
};

export function SpacedRepetitionFlashcards({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f5f3ff"]; // violet-50

  const [deck, setDeck] = useState<Flashcard[]>([
     { id: "1", front: "El Perro", back: "The Dog", interval: 0, ease: 2.5, reps: 0 },
     { id: "2", front: "La Gata", back: "The Cat", interval: 0, ease: 2.5, reps: 0 },
     { id: "3", front: "La Biblioteca", back: "The Library", interval: 0, ease: 2.5, reps: 0 },
     { id: "4", front: "El Coche", back: "The Car", interval: 0, ease: 2.5, reps: 0 },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipedDir, setSwipedDir] = useState<"left" | "right" | null>(null); // For animation

  // Very simplified SM-2 calculation
  const processCard = (quality: number) => {
     const currentCard = deck[currentIndex];
     let newReps = currentCard.reps;
     let newInterval = currentCard.interval;
     let newEase = currentCard.ease;

     if (quality >= 3) {
        // Correct response
        if (newReps === 0) newInterval = 1;
        else if (newReps === 1) newInterval = 6;
        else newInterval = Math.round(newInterval * newEase);
        
        newReps++;
     } else {
        // Incorrect (Hard)
        newReps = 0;
        newInterval = 1;
     }

     newEase = newEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
     if (newEase < 1.3) newEase = 1.3;

     // Update deck
     setDeck(prev => {
        const next = [...prev];
        next[currentIndex] = {
           ...currentCard,
           interval: newInterval,
           ease: newEase,
           reps: newReps
        };
        return next;
     });

     // Move to next un-reviewed or "hard" card in the queue, or finish session
     if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
     } else {
        // End of deck
        if (onComplete) onComplete();
     }
  };

  const handleSwipeLeft = () => {
     setSwipedDir("left");
     setTimeout(() => {
        processCard(1); // quality 1 = hard/forgot
        setSwipedDir(null);
     }, 300);
  };

  const handleSwipeRight = () => {
     setSwipedDir("right");
     setTimeout(() => {
        processCard(4); // quality 4 = easy/remembered
        setSwipedDir(null);
     }, 300);
  };

  const currentCard = deck[currentIndex];
  const isFinished = currentIndex >= deck.length && !swipedDir; // all done

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2" style={{ color: primaryColor }}>
               <BrainCircuit size={24} />
               {config.title || "Daily Review"}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Spaced Repetition Algorithm"}
            </p>
         </div>
         {!isFinished && (
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-500 border border-slate-200">
               {currentIndex + 1} / {deck.length}
            </div>
         )}
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto perspective-[1000px]">
         
         <AnimatePresence mode="wait">
            {!isFinished ? (
               <motion.div
                  key={currentCard?.id || "empty"}
                  initial={{ x: 100, opacity: 0, rotateY: 0 }}
                  animate={{ 
                     x: swipedDir === "left" ? -200 : swipedDir === "right" ? 200 : 0, 
                     opacity: swipedDir ? 0 : 1,
                     rotateZ: swipedDir === "left" ? -10 : swipedDir === "right" ? 10 : 0,
                  }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                  className="w-full aspect-[4/3] relative cursor-pointer group"
                  onClick={() => !swipedDir && setIsFlipped(!isFlipped)}
               >
                  
                  {/* Card Front & Back Container for 3D flip */}
                  <motion.div 
                     className="w-full h-full transform-style-3d transition-transform duration-500 ease-out"
                     initial={false}
                     animate={{ rotateX: isFlipped ? 180 : 0 }}
                  >
                     {/* FRONT */}
                     <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-8 backface-hidden">
                        
                        {/* Fake Index Card Lines */}
                        <div className="absolute top-12 left-0 right-0 h-px bg-red-200" />
                        <div className="absolute top-20 left-0 right-0 h-px bg-blue-100" />
                        <div className="absolute top-28 left-0 right-0 h-px bg-blue-100" />
                        <div className="absolute top-36 left-0 right-0 h-px bg-blue-100" />

                        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                           <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                              {currentCard?.front}
                           </h3>
                           <div className="mt-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                              <RotateCw size={14} /> Tap to flip
                           </div>
                        </div>
                     </div>

                     {/* BACK */}
                     <div className="absolute inset-0 bg-slate-50 rounded-3xl shadow-xl border-2 border-indigo-100 flex flex-col items-center justify-center p-8 backface-hidden [transform:rotateX(180deg)]">
                        <div className="relative z-10 text-center">
                           <h3 className="text-4xl font-black tracking-tight leading-tight" style={{ color: primaryColor }}>
                              {currentCard?.back}
                           </h3>
                        </div>
                     </div>

                  </motion.div>

               </motion.div>
            ) : (
               <motion.div 
                  key="done"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100 flex flex-col items-center text-center w-full"
               >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-slate-800">Session Complete!</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                     All cards have been rescheduled algorithmically. Check back tomorrow.
                  </p>
                  <button 
                     onClick={() => window.location.reload()}
                     className="bg-slate-800 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full"
                  >
                     Reset Demo
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Action Buttons (Appears only when flipped) */}
      <AnimatePresence>
         {isFlipped && !isFinished && !swipedDir && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-8 left-6 right-6 z-30 flex gap-4 max-w-md mx-auto"
            >
               <button 
                  onClick={(e) => { e.stopPropagation(); handleSwipeLeft(); }}
                  className="flex-1 bg-white border border-red-200 text-red-500 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-red-50 active:scale-95 transition-all group"
               >
                  <ThumbsDown size={24} className="group-hover:-rotate-12 transition-transform" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Hard (10m)</span>
               </button>
               
               <button 
                  onClick={(e) => { e.stopPropagation(); handleSwipeRight(); }}
                  className="flex-1 text-white py-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg hover:brightness-110 active:scale-95 transition-all group"
                  style={{ backgroundColor: primaryColor }}
               >
                  <ThumbsUp size={24} className="group-hover:rotate-12 transition-transform" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Easy (4d)</span>
               </button>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
