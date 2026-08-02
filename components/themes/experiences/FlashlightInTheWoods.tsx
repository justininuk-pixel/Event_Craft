"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

type HiddenItem = {
   id: string;
   x: number; // percentage 0-100
   y: number; // percentage 0-100
   text: string;
};

const HIDDEN_ITEMS: HiddenItem[] = [
   { id: "item1", x: 20, y: 30, text: "The muddy footprint." },
   { id: "item2", x: 75, y: 15, text: "A torn piece of fabric." },
   { id: "item3", x: 85, y: 70, text: "The discarded flashlight." },
   { id: "item4", x: 30, y: 85, text: "A dropped set of keys." },
   { id: "item5", x: 50, y: 50, text: "The final clue." }
];

export function FlashlightInTheWoods({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // Amber 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // Black

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [foundItems, setFoundItems] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<number>(0);

  // Mouse/Touch positions
  const mouseX = useMotionValue(160);
  const mouseY = useMotionValue(240);
  
  // Smooth the movement for a heavier "flashlight" feel
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     mouseX.set(e.clientX - rect.left);
     mouseY.set(e.clientY - rect.top);
  };

  // Intersection math loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const checkIntersections = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const currentX = smoothX.get();
        const currentY = smoothY.get();

        const flashlightRadius = 50; // pixels

        setFoundItems(prev => {
           let updated = [...prev];
           HIDDEN_ITEMS.forEach(item => {
              if (updated.includes(item.id)) return;

              // Convert percentage to pixel coordinates
              const itemPxX = (item.x / 100) * rect.width;
              const itemPxY = (item.y / 100) * rect.height;

              // Distance formula
              const dist = Math.sqrt(Math.pow(currentX - itemPxX, 2) + Math.pow(currentY - itemPxY, 2));

              if (dist < flashlightRadius) {
                 updated.push(item.id);
              }
           });
           
           if (updated.length === HIDDEN_ITEMS.length && prev.length !== HIDDEN_ITEMS.length) {
              // Win condition met
              setTimeout(() => {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 2000);
              }, 1000);
           }
           
           return updated;
        });

        loopRef.current = requestAnimationFrame(checkIntersections);
     };

     loopRef.current = requestAnimationFrame(checkIntersections);

     return () => {
        if (loopRef.current) cancelAnimationFrame(loopRef.current);
     };
  }, [gameState, smoothX, smoothY]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Construct the CSS mask
  // We use useMotionTemplate to dynamically generate the radial gradient based on smoothX/Y
  const maskImage = useMotionTemplate`radial-gradient(100px circle at ${smoothX}px ${smoothY}px, black 0%, transparent 80%)`;

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         ref={containerRef}
         onPointerMove={handlePointerMove}
         className={`relative w-[320px] h-[480px] bg-black border border-neutral-900 rounded-lg shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col cursor-none ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{ touchAction: 'none' }}
      >
         
         {/* Found Counter */}
         {gameState === "playing" && (
            <div className="absolute top-4 left-0 w-full flex justify-center z-20 pointer-events-none">
               <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
                  Found: {foundItems.length} / {HIDDEN_ITEMS.length}
               </span>
            </div>
         )}

         {/* The Underlying Layer (The Woods / Hidden Items) */}
         {/* This layer is ONLY visible where the mask allows it */}
         <motion.div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ 
               WebkitMaskImage: maskImage,
               maskImage: maskImage,
               // Subtle eerie texture
               backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-paper.png")',
               backgroundColor: '#111'
            }}
         >
            
            {/* The hidden items themselves */}
            {HIDDEN_ITEMS.map((item) => {
               const isFound = foundItems.includes(item.id);
               return (
                  <div 
                     key={item.id}
                     className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                     style={{ left: item.x + "%", top: item.y + "%" }}
                  >
                     <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ backgroundColor: primaryColor }} />
                     
                     {/* Text reveals permanently once found, but is still subject to the flashlight mask */}
                     {isFound && (
                        <span className="text-white text-xs font-serif italic text-center w-32 drop-shadow-md">
                           {item.text}
                        </span>
                     )}
                  </div>
               );
            })}
         </motion.div>

         {/* Found items persist globally across the screen faintly even outside the flashlight */}
         {gameState === "playing" && HIDDEN_ITEMS.map((item) => {
            const isFound = foundItems.includes(item.id);
            if (!isFound) return null;
            return (
               <div 
                  key={item.id + "_global"}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-20 pointer-events-none z-0"
                  style={{ left: item.x + "%", top: item.y + "%" }}
               >
                  <span className="text-white text-xs font-serif italic text-center w-32">
                     {item.text}
                  </span>
               </div>
            );
         })}

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse" style={{ borderColor: primaryColor, color: primaryColor }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <h2 className="uppercase tracking-[0.2em] font-black mb-4 text-xl text-white">
                     Search the Dark
                  </h2>
                  <p className="text-xs text-neutral-400 mb-12 text-center px-8 leading-relaxed">
                     Drag your finger to aim the flashlight. Find all hidden fragments.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-black shadow-lg active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Turn on Flashlight
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
                  className="border p-10 md:p-14 max-w-2xl w-full text-center relative overflow-hidden rounded-lg bg-neutral-950"
                  style={{ borderColor: primaryColor, boxShadow: "0 0 40px " + primaryColor + "20" }}
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  
                  <div className="font-sans uppercase tracking-[0.3em] mb-6 text-[10px]" style={{ color: primaryColor }}>All Fragments Found</div>
                  <h1 className="text-2xl md:text-3xl font-serif mb-8 leading-tight text-white">
                     {config.title}
                  </h1>
                  <p className="text-base leading-loose text-neutral-300 font-serif italic">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 p-4 flex flex-col items-center shadow-2xl z-50 rounded-lg pointer-events-auto">
            <h2 className="text-neutral-400 font-sans font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Search
            </h2>
            <button 
               onClick={() => {
                  setFoundItems(HIDDEN_ITEMS.map(i => i.id));
               }}
               className="w-full text-black font-sans font-black uppercase tracking-widest py-2 rounded-md active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Search
            </button>
         </div>
      )}
      
    </div>
  );
}
