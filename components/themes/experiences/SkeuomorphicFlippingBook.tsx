"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from "framer-motion";

const PAGES = [
   "I write this in haste. The candle burns low.",
   "You must not follow the path they showed you.",
   "Look for the mark of the crescent on the eastern wall.",
   "When you find it, you will know what to do."
];

export function SkeuomorphicFlippingBook({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#92400e"; // Amber 800
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#292524"]; // Stone 800

  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [showPayload, setShowPayload] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);

  // Framer motion values for the currently dragged page
  const x = useMotionValue(0);
  
  // As x goes from 0 (resting) to -300 (dragged full left), rotateY goes from 0 to -180
  const rotateY = useTransform(x, [0, -250], [0, -180]);
  
  // Add a slight bend on the Z axis and a shadow gradient for 3D realism
  const z = useTransform(x, [0, -125, -250], [0, 50, 0]);
  const shadowOpacity = useTransform(x, [0, -125, -250], [0, 0.4, 0]);

  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: any) => {
     // If dragged more than halfway (or fast enough), flip the page
     if (info.offset.x < -100 || info.velocity.x < -500) {
        // Complete the flip animation
        await controls.start({ x: -300, transition: { duration: 0.3, ease: "easeOut" } });
        
        // Next page
        if (currentPage < PAGES.length - 1) {
           setCurrentPage(prev => prev + 1);
           // Reset for the new page without animating back
           x.set(0);
           controls.set({ x: 0 });
        } else {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1000);
        }
     } else {
        // Snap back
        controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-serif flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0], perspective: 1200 }} // Critical for 3D effect
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-r-2xl rounded-l-md shadow-[20px_20px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ transformStyle: 'preserve-3d' }}
      >
         
         {/* The Book Background / Back Cover */}
         <div className="absolute inset-0 bg-[#e7d9c1] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] rounded-r-2xl border-y-4 border-r-4 border-l-8 border-[#3e2723]" />

         {/* The Stack of Pages (Underneath the active page) */}
         <div className="absolute inset-0 left-2 bg-[#f4ebd8] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] rounded-r-xl border-y border-r border-[#d7c4a1] flex items-center justify-center p-8 pointer-events-none">
            {/* Show the NEXT page content here so it's revealed as the current page flips */}
            {currentPage < PAGES.length - 1 && (
               <div className="text-xl leading-relaxed text-[#4e342e]">
                  {PAGES[currentPage + 1]}
               </div>
            )}
            {/* If it's the last page, show the end graphic underneath */}
            {currentPage === PAGES.length - 1 && (
               <div className="flex flex-col items-center opacity-50">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4e342e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
               </div>
            )}
            
            {/* Book Spine Shadow (inner crease) */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent mix-blend-multiply" />
         </div>

         {/* The Active Draggable Page */}
         {gameState === "playing" && (
            <motion.div 
               className="absolute inset-0 left-2 bg-[#fdf8ed] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] rounded-r-xl border-y border-r border-[#e0cfb3] flex items-center justify-center p-8 origin-left will-change-transform"
               style={{ 
                  rotateY, 
                  z,
                  x: 0, // x is purely a driver, we don't actually translate the element, we only rotate it
               }}
            >
               {/* Invisible drag surface. We put it on the right edge so the user HAS to grab the edge */}
               <motion.div 
                  className="absolute right-0 top-0 bottom-0 w-24 cursor-grab active:cursor-grabbing z-20"
                  drag="x"
                  dragConstraints={{ left: -300, right: 0 }}
                  dragElastic={0}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  style={{ x }}
                  animate={controls}
               >
                  {/* Hint indicator on first page */}
                  {currentPage === 0 && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-40 pointer-events-none animate-pulse">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#4e342e] rotate-90 whitespace-nowrap mb-8">
                           Turn Page
                        </span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4e342e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                     </div>
                  )}
               </motion.div>

               {/* Page Content */}
               <div className="text-xl leading-relaxed text-[#3e2723] z-10 pointer-events-none">
                  {PAGES[currentPage]}
               </div>

               {/* Page Numbers */}
               <div className="absolute bottom-4 right-6 text-xs font-sans text-[#a1887f]">
                  {currentPage + 1}
               </div>

               {/* Dynamic 3D Shadow Overlay (darkens as it flips) */}
               <motion.div 
                  className="absolute inset-0 bg-black pointer-events-none rounded-r-xl mix-blend-overlay"
                  style={{ opacity: shadowOpacity }}
               />
               
               {/* Spine crease shadow on the left */}
               <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent mix-blend-multiply pointer-events-none" />

            </motion.div>
         )}

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
                  className="bg-[#fdf8ed] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] p-10 md:p-14 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden rounded-sm border border-[#e0cfb3]"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="font-sans uppercase tracking-[0.3em] mb-8 text-xs text-[#8d6e63]">Epilogue</div>
                  <h1 className="text-3xl md:text-4xl font-serif mb-6 text-[#3e2723] leading-tight">
                     {config.title}
                  </h1>
                  <div className="w-16 h-[1px] bg-[#d7c4a1] mx-auto mb-8" />
                  <p className="text-lg text-[#5d4037] leading-relaxed font-serif italic">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-stone-200 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-stone-500 font-sans font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-sans font-black uppercase tracking-widest py-3 rounded-lg active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Read Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
