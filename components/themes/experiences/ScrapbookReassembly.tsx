"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, Reorder } from "framer-motion";

type Fragment = {
   id: string;
   correctIndex: number;
   date: string;
   text: string;
   rotation: number; // For scrapbook aesthetic
};

// The chronological truth
const TRUTH: Fragment[] = [
   { id: "f1", correctIndex: 0, date: "Oct 12", text: "Found the map hidden behind the old painting.", rotation: -2 },
   { id: "f2", correctIndex: 1, date: "Oct 14", text: "Followed the coordinates. They led to the basement of the library.", rotation: 1 },
   { id: "f3", correctIndex: 2, date: "Oct 18", text: "The basement door was locked. I need the brass key.", rotation: -1 },
   { id: "f4", correctIndex: 3, date: "Oct 22", text: "Got the key. Going in tonight. If I don't return...", rotation: 3 },
];

// Fisher-Yates Shuffle
function shuffle<T>(array: T[]): T[] {
   let currentIndex = array.length, randomIndex;
   const newArr = [...array];
   while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]];
   }
   return newArr;
}

export function ScrapbookReassembly({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d97706"; // Amber 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e7e5e4"]; // Stone 200

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  // State for the draggable list
  const [items, setItems] = useState<Fragment[]>([]);

  // Initialize shuffled items on start
  useEffect(() => {
     if (gameState === "playing" && items.length === 0) {
        // Ensure it's not accidentally perfectly sorted on mount
        let shuffled = shuffle(TRUTH);
        while (shuffled.every((item, i) => item.correctIndex === i)) {
           shuffled = shuffle(TRUTH);
        }
        setItems(shuffled);
     }
  }, [gameState, items.length]);

  // Check win condition whenever items order changes
  useEffect(() => {
     if (gameState !== "playing" || items.length === 0) return;
     
     const isPerfect = items.every((item, i) => item.correctIndex === i);
     if (isPerfect) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  }, [items, gameState]);

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
         className={`relative w-[320px] h-[480px] bg-stone-100 rounded-lg shadow-inner overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 blur-[2px] opacity-60" : "scale-100"}`}
      >
         
         {/* Corkboard texture background */}
         <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cork-board.png")' }} />

         {/* Header */}
         <div className="p-4 z-10 bg-white/50 backdrop-blur-sm border-b border-stone-300 flex justify-between items-center shadow-sm">
            <span className="font-serif font-bold text-stone-700">Chronology</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Drag to Sort</span>
         </div>

         {/* Draggable List Area */}
         <div className="flex-1 p-4 relative z-10 overflow-y-auto overflow-x-hidden no-scrollbar">
            
            {/* The vertical timeline spine */}
            <div className="absolute top-0 bottom-0 left-8 w-1 bg-stone-300/50 rounded-full" />

            {gameState === "playing" && items.length > 0 && (
               <Reorder.Group 
                  axis="y" 
                  values={items} 
                  onReorder={setItems} 
                  className="flex flex-col gap-4 relative z-20"
               >
                  {items.map((item) => (
                     <Reorder.Item 
                        key={item.id} 
                        value={item}
                        className="relative z-20 cursor-grab active:cursor-grabbing origin-center"
                     >
                        <motion.div 
                           className="bg-white p-4 pl-12 rounded shadow-md border border-stone-200"
                           initial={{ rotate: item.rotation }}
                           whileHover={{ scale: 1.02 }}
                           whileDrag={{ 
                              scale: 1.05, 
                              rotate: 0,
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" 
                           }}
                        >
                           {/* Pin / Node on timeline */}
                           <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: primaryColor }} />
                           
                           {/* Content */}
                           <div className="text-xs font-mono font-bold mb-1" style={{ color: primaryColor }}>{item.date}</div>
                           <div className="text-sm font-serif text-stone-800 leading-relaxed">{item.text}</div>
                        </motion.div>
                     </Reorder.Item>
                  ))}
               </Reorder.Group>
            )}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-6 shadow-xl rotate-12">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-white">
                     Fragmented Memory
                  </h2>
                  <p className="text-xs text-stone-300 mb-12 text-center px-8 leading-relaxed">
                     Reassemble the torn entries in exact chronological order to reveal the truth.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-md uppercase tracking-widest text-[10px] font-bold text-white shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Begin Sort
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
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="bg-[#fcfbf9] bg-[url('https://www.transparenttextures.com/patterns/clean-paper.png')] p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden rounded-sm"
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 60 }}
               >
                  {/* Tape */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-md rotate-2 border border-white/20 shadow-sm" />

                  <div className="font-mono uppercase tracking-[0.3em] mb-4 text-[10px]" style={{ color: primaryColor }}>Timeline Verified</div>
                  <h1 className="text-3xl md:text-4xl font-serif font-black mb-6 leading-tight text-stone-800 tracking-tight">
                     {config.title}
                  </h1>
                  <div className="w-16 h-1 mx-auto mb-6 opacity-30" style={{ backgroundColor: primaryColor }} />
                  <p className="text-lg leading-relaxed font-serif text-stone-600">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-stone-200 p-4 flex flex-col items-center shadow-2xl z-50 rounded-lg pointer-events-auto">
            <h2 className="text-stone-500 font-sans font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Puzzle
            </h2>
            <button 
               onClick={() => {
                  setItems(TRUTH); // instantly sorts them, triggering the win condition
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-2 rounded-md active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Solve Puzzle
            </button>
         </div>
      )}
      
    </div>
  );
}
