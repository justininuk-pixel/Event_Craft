"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";

const FAKE_CAPTIONS = [
  "When you realize it's Monday.",
  "Did I leave the stove on?",
  "Me pretending to listen.",
  "That one friend who always overreacts."
];

export function CaptionContest({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"submitting" | "voting" | "revealed">("submitting");
  const [currentInput, setCurrentInput] = useState("");
  const [captions, setCaptions] = useState<{id: number, text: string, score: number}[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  const imageToCaption = config.mediaUrl || "https://images.unsplash.com/photo-1543332143-4e8c27e3256f?q=80&w=1000&auto=format&fit=crop";

  const handleSubmit = () => {
     if (!currentInput.trim()) return;
     const userCaption = { id: 0, text: currentInput.trim(), score: 0 };
     
     const others = FAKE_CAPTIONS.map((text, i) => ({
        id: i + 1,
        text,
        score: Math.floor(Math.random() * 50)
     }));

     setCaptions([userCaption, ...others].sort(() => 0.5 - Math.random()));
     setPhase("voting");
  };

  const handleVoteEnd = () => {
     // Find winner (for the preview, we just pick the one with highest score)
     const sorted = [...captions].sort((a, b) => b.score - a.score);
     setWinner(sorted[0].text);
     
     setPhase("revealed");
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      {/* Persistent Image at the top (unless revealed, then it's big) */}
      <motion.div 
         layout
         className={`relative w-full max-w-lg mx-auto flex-shrink-0 transition-all duration-700 ease-in-out ${
            phase === "revealed" ? "h-full p-8 flex flex-col justify-center" : "h-[45%] pt-8 px-6 pb-2"
         }`}
      >
         <motion.div 
            layout
            className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative bg-zinc-900 border-4 border-white/10"
         >
            <img src={imageToCaption} alt="Caption me" className="w-full h-full object-cover" />
            
            {/* The winning caption stamped on it */}
            <AnimatePresence>
               {phase === "revealed" && winner && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                     className="absolute bottom-8 w-full px-6 text-center"
                  >
                     <h2 className="text-4xl md:text-5xl font-black uppercase text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight" style={{ WebkitTextStroke: "2px black" }}>
                        {winner}
                     </h2>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
         {phase === "submitting" && (
            <motion.div
               key="submitting"
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -50 }}
               className="flex-1 w-full max-w-lg px-6 pb-12 flex flex-col items-center justify-center z-10"
            >
               <h2 className="text-2xl font-bold mb-6 text-center">Caption This</h2>
               <textarea
                  value={currentInput}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder="Write something funny..."
                  className="w-full h-32 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-xl font-bold border-2 outline-none focus:border-pink-500 transition-colors resize-none mb-6"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
               />
               <button
                  onClick={handleSubmit}
                  disabled={!currentInput.trim()}
                  className="w-full py-4 rounded-xl font-black text-xl text-white shadow-xl transition-transform active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
               >
                  SUBMIT
               </button>
            </motion.div>
         )}

         {phase === "voting" && (
            <motion.div
               key="voting"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 w-full flex flex-col items-center pt-4 pb-12 relative z-10"
            >
               <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
                  Vote on Captions
               </h2>
               
               <div className="relative w-full max-w-sm flex-1">
                  <SwipeCardStack 
                     captions={captions} 
                     onComplete={handleVoteEnd}
                     primaryColor={primaryColor}
                  />
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Confetti or Title on Reveal */}
      <AnimatePresence>
         {phase === "revealed" && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.5 }}
               className="absolute top-12 w-full text-center pointer-events-none z-20 drop-shadow-md"
            >
               <h1 className="text-3xl font-black uppercase tracking-widest text-yellow-400">
                  Winning Caption
               </h1>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}


// --- Swipe Card Logic ---

function SwipeCardStack({ 
   captions, 
   onComplete,
   primaryColor 
}: { 
   captions: {id: number, text: string, score: number}[],
   onComplete: () => void,
   primaryColor: string
}) {
   const [cards, setCards] = useState(captions);

   const handleRemove = (id: number, direction: "left" | "right") => {
      // If right, we increment score
      if (direction === "right") {
         const card = cards.find(c => c.id === id);
         if (card) card.score += 100; // heavy weight for local user vote
      }
      
      setCards(prev => prev.filter(c => c.id !== id));
      
      if (cards.length <= 1) {
         onComplete();
      }
   };

   return (
      <div className="absolute inset-0 flex items-center justify-center">
         {cards.map((c, i) => {
            // Only render top 3 cards for performance
            const isTop = i === cards.length - 1;
            if (i < cards.length - 3) return null;
            
            return (
               <SwipeableCard
                  key={c.id}
                  caption={c}
                  isTop={isTop}
                  index={cards.length - 1 - i} // 0 is top, 1 is under, 2 is bottom
                  onRemove={handleRemove}
                  primaryColor={primaryColor}
               />
            );
         })}
         {cards.length === 0 && (
            <div className="text-white/50 font-bold uppercase tracking-widest">
               No more captions
            </div>
         )}
      </div>
   );
}

function SwipeableCard({ 
   caption, 
   isTop, 
   index, 
   onRemove,
   primaryColor
}: { 
   caption: {id: number, text: string}, 
   isTop: boolean, 
   index: number,
   onRemove: (id: number, dir: "left"|"right") => void,
   primaryColor: string
}) {
   const controls = useAnimation();
   const [exitX, setExitX] = useState(0);

   const handleDragEnd = (e: any, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
         setExitX(300);
         onRemove(caption.id, "right");
      } else if (info.offset.x < -threshold) {
         setExitX(-300);
         onRemove(caption.id, "left");
      } else {
         controls.start({ x: 0, y: 0, rotate: 0 });
      }
   };

   return (
      <motion.div
         drag={isTop ? "x" : false}
         dragConstraints={{ left: 0, right: 0 }}
         onDragEnd={handleDragEnd}
         animate={controls}
         initial={{ scale: 0.95 - index * 0.05, y: index * 20 }}
         exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
         whileTap={{ cursor: "grabbing" }}
         className="absolute w-5/6 aspect-[4/3] bg-white rounded-3xl shadow-2xl border-4 border-zinc-200 flex flex-col items-center justify-center p-8 text-center cursor-grab"
         style={{ 
            zIndex: 10 - index,
            backgroundColor: "white"
         }}
      >
         <h3 className="text-2xl md:text-3xl font-black text-zinc-900 leading-snug">
            "{caption.text}"
         </h3>

         {/* Hint Icons */}
         {isTop && (
            <div className="absolute bottom-6 w-full flex justify-between px-8 text-3xl opacity-20 pointer-events-none">
               <span>❌</span>
               <span style={{ color: primaryColor }}>🔥</span>
            </div>
         )}
      </motion.div>
   );
}
