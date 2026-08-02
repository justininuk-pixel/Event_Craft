"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

type Item = {
  id: string;
  name: string;
  img: string;
};

// Mocking the partner's hidden right-swipes
const partnerLikes = ["m3", "m7", "m9"];

const movies: Item[] = [
  { id: "m1", name: "Inception", img: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600&h=800" },
  { id: "m2", name: "The Matrix", img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=600&h=800" },
  { id: "m3", name: "Interstellar", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600&h=800" }, // Partner likes this
  { id: "m4", name: "Dune", img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=600&h=800" },
];

export function MutualSwipeMatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const [deck, setDeck] = useState(movies);
  const [match, setMatch] = useState<Item | null>(null);

  const handleSwipe = (direction: "left" | "right", item: Item) => {
     // Remove from deck
     const newDeck = deck.slice(1);
     setDeck(newDeck);

     if (direction === "right") {
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
        // Check if partner liked it
        if (partnerLikes.includes(item.id)) {
           setMatch(item);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
           if (onComplete) setTimeout(onComplete, 5000);
        }
     }
  };

  const currentItem = deck[0];

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-900 text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-8 text-center z-10">
         <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Mutual Decision</h2>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6">
         
         <AnimatePresence>
            {!match && currentItem ? (
               <motion.div 
                  key={currentItem.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0, x: -100 }} // simplified exit without drag physics for basic layout
                  className="w-full max-w-sm aspect-[3/4] bg-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
               >
                  <img src={currentItem.img} alt={currentItem.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 pb-24">
                     <h3 className="text-4xl font-black mb-2 leading-none">{currentItem.name}</h3>
                     <p className="text-zinc-400 font-medium">Do you want to watch this?</p>
                  </div>

                  {/* Buttons */}
                  <div className="absolute bottom-8 left-0 w-full flex justify-center gap-8 z-10">
                     <button 
                        onClick={() => handleSwipe("left", currentItem)}
                        className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-300 border border-white/20 hover:bg-white/20 active:scale-90 transition-all"
                     >
                        <X size={32} />
                     </button>
                     <button 
                        onClick={() => handleSwipe("right", currentItem)}
                        className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white border-4 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-90 transition-all"
                     >
                        <Heart size={32} fill="currentColor" />
                     </button>
                  </div>
               </motion.div>
            ) : match ? (
               <motion.div 
                  key="match"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="w-full max-w-sm text-center relative z-20"
               >
                  <div className="relative w-full aspect-[3/4] rounded-3xl shadow-[0_0_100px_rgba(244,63,94,0.4)] overflow-hidden border-4 border-rose-500 mb-8">
                     <img src={match.img} alt={match.name} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-rose-900 to-transparent flex flex-col justify-end p-8">
                        <div className="text-rose-300 font-bold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
                           <Heart size={14} fill="currentColor" className="animate-pulse" /> Mutual Match
                        </div>
                        <h3 className="text-4xl font-black text-white">{match.name}</h3>
                     </div>
                  </div>
               </motion.div>
            ) : (
               <div className="text-center text-zinc-500">
                  <h3 className="font-bold text-xl">Out of Options</h3>
                  <p>You didn't match on anything.</p>
               </div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
