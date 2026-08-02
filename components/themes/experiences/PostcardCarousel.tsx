"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export function PostcardCarousel({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [activePostcard, setActivePostcard] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsRead, setCardsRead] = useState<Record<number, boolean>>({});

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e";
  
  const x = useMotionValue(0); // tracks swipe distance

  // Mock postcards
  const postcards = [
    { id: 1, front: "https://images.unsplash.com/photo-1506744626753-26c5f0a25a4d?q=80&w=400&auto=format&fit=crop", back: "Greetings from the mountains! The air here is so crisp.", title: "Alpine Ridge" },
    { id: 2, front: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=400&auto=format&fit=crop", back: "Paris is beautiful in the spring. Wish you were here.", title: "City of Light" },
    { id: 3, front: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop", back: "The water is warmer than it looks. See you soon.", title: "Tropical Beach" },
    { id: 4, front: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=400&auto=format&fit=crop", back: "Lost in the city again. Typical me.", title: "Neon Nights" },
    { id: 5, front: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop", back: "Taking the scenic route home.", title: "Desert Highway" },
    { id: 6, front: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop", back: "I rowed all the way out here just for this shot.", title: "Lake House" },
  ];

  const totalCards = postcards.length;
  const radius = 250; // radius of the carousel

  // Base rotation is driven by the drag X value
  // Let's say 1 pixel of drag = 0.5 degrees
  const rotation = useTransform(x, (val) => val * 0.5);

  const handleCardClick = (id: number) => {
     if (activePostcard === id) {
        // If it's already active, flip it
        setIsFlipped(prev => {
           const nextState = !prev;
           if (nextState) {
              setCardsRead(c => ({...c, [id]: true}));
           }
           return nextState;
        });
     } else {
        // Open a new card
        setActivePostcard(id);
        setIsFlipped(false);
     }
  };

  const closeCard = () => {
     setActivePostcard(null);
     setIsFlipped(false);
  };

  // Completion check
  useEffect(() => {
     if (Object.keys(cardsRead).length === totalCards && onComplete) {
        onComplete();
     }
  }, [cardsRead, totalCards, onComplete]);

  return (
    <div className="w-full h-full bg-[#fafaf9] relative flex items-center justify-center font-sans overflow-hidden select-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/notebook.png')" }}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/5" />
      
      {/* 3D Scene Container */}
      <div 
         className="w-full h-full flex items-center justify-center relative perspective-[1200px]"
         style={{ perspective: 1200 }}
      >
         
         {/* The Spin Rack Wrapper (Draggable) */}
         <motion.div 
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ transformStyle: "preserve-3d", x }}
            drag="x"
            dragConstraints={{ left: -10000, right: 10000 }} // virtually infinite spin
            dragElastic={0}
            dragMomentum={true}
         >
            {/* The Actual Carousel (rotates based on X drag) */}
            <motion.div 
               className="relative flex items-center justify-center"
               style={{ 
                  transformStyle: "preserve-3d",
                  rotateY: rotation,
                  // Negate the X translation so the carousel stays in center while spinning
                  x: useTransform(x, v => -v) 
               }}
            >
               {/* Center Pole */}
               <div className="absolute w-2 h-96 bg-zinc-300 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] -translate-y-1/2" />
               <div className="absolute w-4 h-4 bg-zinc-400 rounded-full -top-48 -translate-x-1" />

               {/* Cards on the rack */}
               {postcards.map((card, i) => {
                  const angle = (360 / totalCards) * i;
                  // Transform for a cylindrical layout
                  return (
                     <div 
                        key={card.id}
                        className="absolute w-32 h-24 sm:w-48 sm:h-32 bg-white shadow-md p-1 border border-zinc-200 cursor-pointer hover:border-blue-400 transition-colors"
                        style={{
                           transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                           backfaceVisibility: "hidden"
                        }}
                        onClick={(e) => {
                           e.stopPropagation(); // don't drag if clicking a card
                           handleCardClick(card.id);
                        }}
                     >
                        <div 
                           className="w-full h-full bg-cover bg-center"
                           style={{ backgroundImage: `url(${card.front})` }}
                        />
                        {/* Status indicator if read */}
                        {cardsRead[card.id] && (
                           <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                        )}
                     </div>
                  );
               })}
            </motion.div>
         </motion.div>
      </div>

      {/* Instruction */}
      {!activePostcard && (
         <div className="absolute bottom-12 w-full text-center pointer-events-none">
            <span className="bg-white/80 px-4 py-2 rounded-full shadow text-xs font-bold uppercase tracking-widest text-zinc-600">
               Swipe to spin the rack
            </span>
         </div>
      )}

      {/* The Focused/Pulled-out Card Modal */}
      <AnimatePresence>
         {activePostcard && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={closeCard} // Click background to close
            >
               <motion.div 
                  className="relative w-[min(90%,480px)] max-w-full aspect-[3/2] cursor-pointer"
                  style={{ perspective: 1000 }}
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  onClick={(e) => {
                     e.stopPropagation(); // don't close
                     handleCardClick(activePostcard);
                  }}
               >
                  {/* The Flipping Container */}
                  <motion.div 
                     className="w-full h-full relative"
                     style={{ transformStyle: "preserve-3d" }}
                     animate={{ rotateY: isFlipped ? 180 : 0 }}
                     transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                     
                     {/* Front of Card (Photo) */}
                     <div 
                        className="absolute inset-0 bg-white p-3 shadow-2xl rounded"
                        style={{ backfaceVisibility: "hidden" }}
                     >
                        <div 
                           className="w-full h-full bg-cover bg-center rounded-sm"
                           style={{ backgroundImage: `url(${postcards.find(c => c.id === activePostcard)?.front})` }}
                        />
                        <div className="absolute bottom-6 right-6 bg-white/90 px-3 py-1 rounded shadow text-[10px] uppercase font-bold text-zinc-800">
                           Tap to flip
                        </div>
                     </div>

                     {/* Back of Card (Message) */}
                     <div 
                        className="absolute inset-0 bg-[#fffdf0] p-6 shadow-2xl rounded flex flex-col"
                        style={{ 
                           backfaceVisibility: "hidden",
                           transform: "rotateY(180deg)",
                           backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" 
                        }}
                     >
                        <div className="w-full border-b-2 border-red-500/20 pb-2 mb-4 flex justify-between items-center">
                           <span className="font-serif italic text-zinc-500">Postcard</span>
                           {/* Stamp area */}
                           <div className="w-12 h-16 border-2 border-dashed border-zinc-300 flex items-center justify-center">
                              <span className="text-[8px] text-zinc-300 uppercase">Stamp</span>
                           </div>
                        </div>
                        <div className="flex-1 flex text-lg font-serif italic text-zinc-800 leading-relaxed pr-8 border-r border-zinc-300">
                           {postcards.find(c => c.id === activePostcard)?.back}
                        </div>
                     </div>

                  </motion.div>
               </motion.div>

               <div className="absolute top-8 right-8 text-white text-sm uppercase tracking-widest font-bold">
                  Tap outside to close
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Bypass */}
      {mode === "editor-preview" && Object.keys(cardsRead).length < totalCards && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  const all = postcards.reduce((acc, c) => ({...acc, [c.id]: true}), {});
                  setCardsRead(all);
                  if (onComplete) onComplete();
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Read All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
