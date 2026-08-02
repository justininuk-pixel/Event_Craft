"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Archetype = {
   name: string;
   numeral: string;
   icon: React.ReactNode;
};

const ARCHETYPES: Archetype[] = [
   { name: "The Fool", numeral: "0", icon: <circle cx="12" cy="12" r="6" /> },
   { name: "The Magician", numeral: "I", icon: <polygon points="12 2 15 10 22 12 15 14 12 22 9 14 2 12 9 10" /> },
   { name: "The High Priestess", numeral: "II", icon: <path d="M12 2a10 10 0 1 0 10 10H12z" /> },
   { name: "The Empress", numeral: "III", icon: <path d="M12 2v20M2 12h20" /> },
   { name: "The Hierophant", numeral: "V", icon: <rect x="8" y="2" width="8" height="20" rx="2" /> },
   { name: "The Lovers", numeral: "VI", icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /> },
   { name: "The Chariot", numeral: "VII", icon: <rect x="3" y="10" width="18" height="10" rx="2" /> },
   { name: "Strength", numeral: "VIII", icon: <circle cx="12" cy="12" r="8" fill="none" strokeWidth="2" /> },
   { name: "The Hermit", numeral: "IX", icon: <path d="M12 2v10M8 6l4-4 4 4" /> },
   { name: "Wheel of Fortune", numeral: "X", icon: <circle cx="12" cy="12" r="9" strokeDasharray="4 4" fill="none" strokeWidth="2" /> },
   { name: "Death", numeral: "XIII", icon: <path d="M4 4h16v16H4z" fill="none" strokeWidth="2" /> },
   { name: "The Tower", numeral: "XVI", icon: <path d="M8 2h8v20H8z" /> },
   { name: "The Star", numeral: "XVII", icon: <polygon points="12 2 14 8 20 8 15 12 17 18 12 14 7 18 9 12 4 8 10 8" /> },
   { name: "The Sun", numeral: "XIX", icon: <circle cx="12" cy="12" r="5" /> },
];

export function TarotCardReading({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d4af37"; // Gold
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // Zinc 900

  const [gameState, setGameState] = useState<"start" | "selecting" | "reading" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  // Track selected indices from the deck (0 to 11)
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  // We need to map selected indices to a specific archetype drawn from the pool
  const [drawnArchetypes, setDrawnArchetypes] = useState<Archetype[]>([]);

  const DECK_SIZE = 12; // Total cards in the visual spread

  // Draw a random archetype without replacement
  const drawArchetype = () => {
     const available = ARCHETYPES.filter(a => !drawnArchetypes.includes(a));
     const random = available[Math.floor(Math.random() * available.length)];
     setDrawnArchetypes(prev => [...prev, random]);
  };

  const handleCardClick = (index: number) => {
     if (gameState !== "selecting") return;
     if (selectedCards.includes(index)) return;
     if (selectedCards.length >= 3) return;

     setSelectedCards(prev => [...prev, index]);
     drawArchetype();

     if (selectedCards.length === 2) {
        // This is the 3rd card being drawn
        setTimeout(() => setGameState("reading"), 1000);
     }
  };

  useEffect(() => {
     if (gameState === "reading") {
        setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 2000);
        }, 3000); // Dramatic pause for the "reading"
     }
  }, [gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0], perspective: 1200 }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] bg-zinc-950 rounded-lg shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)'
         }}
      >
         
         {/* Deck Spread */}
         {gameState === "selecting" && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full h-40 flex justify-center items-center pointer-events-none">
               {[...Array(DECK_SIZE)].map((_, i) => {
                  const isSelected = selectedCards.includes(i);
                  // Fan out the cards in an arc
                  const rotation = (i - (DECK_SIZE - 1) / 2) * 8; // -44deg to +44deg
                  const translateY = Math.abs(i - (DECK_SIZE - 1) / 2) * 5; 
                  
                  return (
                     <motion.div
                        key={i}
                        className="absolute w-12 h-20 rounded shadow-md pointer-events-auto cursor-pointer"
                        style={{ 
                           // Velvety back texture
                           backgroundColor: '#27272a', // zinc-800
                           border: "1px solid " + primaryColor + "40"
                        }}
                        initial={{ opacity: 0, y: 100, rotate: 0 }}
                        animate={{ 
                           opacity: isSelected ? 0 : 1, 
                           y: isSelected ? -50 : translateY, 
                           rotate: isSelected ? 0 : rotation,
                           scale: isSelected ? 0 : 1
                        }}
                        whileHover={{ y: translateY - 10, scale: 1.1 }}
                        transition={{ 
                           type: "spring", 
                           stiffness: 200, 
                           damping: 20,
                           delay: i * 0.05
                        }}
                        onClick={() => handleCardClick(i)}
                     >
                        <div className="absolute inset-1 border border-zinc-700 rounded-sm opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1"><polygon points="12 2 15 10 22 12 15 14 12 22 9 14 2 12 9 10" /></svg>
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         )}

         {/* 3 Selected Slots (Past, Present, Future) */}
         <div className="absolute bottom-16 w-full flex justify-center gap-4 px-4 z-20">
            {["Past", "Present", "Future"].map((label, i) => {
               const archetype = drawnArchetypes[i];
               const hasCard = !!archetype;
               
               return (
                  <div key={label} className="flex flex-col items-center gap-4">
                     {/* The Slot / Card Container */}
                     <div className="w-20 h-32 relative" style={{ perspective: 1000 }}>
                        {/* Slot outline */}
                        <div className="absolute inset-0 border-2 border-dashed border-zinc-800 rounded-md" />
                        
                        {/* The Actual Card */}
                        <AnimatePresence>
                           {hasCard && (
                              <motion.div 
                                 className="absolute inset-0 w-full h-full"
                                 style={{ transformStyle: "preserve-3d" }}
                                 initial={{ rotateY: 180, scale: 1.5, y: -150, opacity: 0 }}
                                 animate={{ rotateY: 0, scale: 1, y: 0, opacity: 1 }}
                                 transition={{ type: "spring", stiffness: 60, damping: 15 }}
                              >
                                 {/* Front of Card */}
                                 <div 
                                    className="absolute inset-0 bg-[#e5e5e5] rounded-md shadow-[0_0_15px_rgba(0,0,0,0.8)] border flex flex-col items-center p-2"
                                    style={{ 
                                       backfaceVisibility: "hidden", 
                                       borderColor: primaryColor,
                                       backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")'
                                    }}
                                 >
                                    <div className="border w-full h-full border-zinc-400 flex flex-col items-center p-1 justify-between">
                                       <span className="font-serif text-[8px] font-bold text-zinc-800">{archetype.numeral}</span>
                                       
                                       <div className="w-full h-10 border border-zinc-300 flex items-center justify-center">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1.5">
                                             {archetype.icon}
                                          </svg>
                                       </div>
                                       
                                       <span className="font-serif text-[6px] font-bold text-zinc-800 uppercase tracking-widest text-center leading-tight">
                                          {archetype.name}
                                       </span>
                                    </div>
                                 </div>
                                 
                                 {/* Back of Card (visible during flip) */}
                                 <div 
                                    className="absolute inset-0 bg-zinc-800 rounded-md shadow-lg border"
                                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: primaryColor + "40" }}
                                 />
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                     
                     <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: primaryColor }}>
                        {label}
                     </span>
                  </div>
               );
            })}
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 mb-6 flex items-center justify-center">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                        <circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>
                     </svg>
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-serif mb-4 text-xl" style={{ color: primaryColor }}>
                     The Spread
                  </h2>
                  <p className="text-xs text-zinc-400 mb-12 text-center px-8 leading-relaxed font-serif italic">
                     Draw three cards from the deck to divine your fate and unlock the payload.
                  </p>
                  <button 
                     onClick={() => setGameState("selecting")}
                     className="px-8 py-3 rounded uppercase tracking-widest text-[10px] font-bold text-zinc-950 shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Draw Cards
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
         
         {/* Reading Overlay (Dramatic Pause) */}
         <AnimatePresence>
            {gameState === "reading" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                  <motion.div 
                     animate={{ opacity: [0, 1, 0] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="font-serif italic text-lg" style={{ color: primaryColor }}
                  >
                     Interpreting the signs...
                  </motion.div>
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
                  className="border p-10 md:p-14 max-w-2xl w-full text-center relative overflow-hidden rounded-sm bg-zinc-950"
                  style={{ borderColor: primaryColor, boxShadow: "0 0 30px " + primaryColor + "20" }}
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  
                  <div className="font-serif uppercase tracking-[0.3em] mb-6 text-[10px]" style={{ color: primaryColor }}>The Reading</div>
                  <h1 className="text-2xl md:text-3xl font-serif mb-8 leading-tight text-white">
                     {config.title}
                  </h1>
                  <p className="text-base leading-loose text-zinc-300 font-serif italic">
                     {config.body}
                  </p>
                  
                  {/* Subtle arcane symbol in background of payload */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                     <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="0.5">
                        <circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>
                     </svg>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "selecting" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-zinc-400 font-sans font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Ritual
            </h2>
            <button 
               onClick={() => {
                  setSelectedCards([0, 1, 2]);
                  setDrawnArchetypes([ARCHETYPES[0], ARCHETYPES[1], ARCHETYPES[2]]);
                  setGameState("reading");
               }}
               className="w-full text-zinc-950 font-sans font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Draw 3 Cards
            </button>
         </div>
      )}
      
    </div>
  );
}
