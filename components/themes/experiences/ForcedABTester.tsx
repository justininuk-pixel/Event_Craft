"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

export function ForcedABTester({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  const optionA = { id: "a", name: "Red Dress", img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400&h=600", currentVotes: 42 };
  const optionB = { id: "b", name: "Blue Jumpsuit", img: "https://images.unsplash.com/photo-1515347619152-16e00ca16212?auto=format&fit=crop&q=80&w=400&h=600", currentVotes: 89 };

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalVotes = optionA.currentVotes + optionB.currentVotes + 1; // +1 for our vote

  const handleVote = (id: string) => {
    setSelectedOption(id);
    setHasVoted(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    if (onComplete) setTimeout(onComplete, 5000);
  };

  const getPercent = (baseVotes: number, id: string) => {
    const votes = baseVotes + (selectedOption === id ? 1 : 0);
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="w-full h-full relative flex font-sans overflow-hidden select-none bg-white" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Option A (Left Half) */}
      <div 
         className="flex-1 relative cursor-pointer group"
         onClick={() => !hasVoted && handleVote("a")}
      >
         <img src={optionA.img} alt="A" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
         <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
         
         <div className="absolute bottom-12 left-0 w-full text-center z-20">
            <h3 className="text-3xl font-black text-white drop-shadow-md">A</h3>
         </div>

         {/* Results Overlay */}
         <AnimatePresence>
            {hasVoted && (
               <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-30"
               >
                  <span className="text-5xl font-black text-white">{getPercent(optionA.currentVotes, "a")}%</span>
                  <span className="text-white/70 uppercase tracking-widest mt-2 text-xs font-bold">{getPercent(optionA.currentVotes, "a") > 50 ? 'Winner' : 'Loser'}</span>
                  {selectedOption === "a" && <span className="mt-4 bg-white text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">Your Pick</span>}
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Vertical Divider */}
      <div className="w-1 bg-white relative z-40">
         {!hasVoted ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
               <Lock size={20} className="text-black" />
            </div>
         ) : (
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)] text-white"
            >
               <Unlock size={20} />
            </motion.div>
         )}
      </div>

      {/* Option B (Right Half) */}
      <div 
         className="flex-1 relative cursor-pointer group"
         onClick={() => !hasVoted && handleVote("b")}
      >
         <img src={optionB.img} alt="B" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
         <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
         
         <div className="absolute bottom-12 left-0 w-full text-center z-20">
            <h3 className="text-3xl font-black text-white drop-shadow-md">B</h3>
         </div>

         {/* Results Overlay */}
         <AnimatePresence>
            {hasVoted && (
               <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-30"
               >
                  <span className="text-5xl font-black text-white">{getPercent(optionB.currentVotes, "b")}%</span>
                  <span className="text-white/70 uppercase tracking-widest mt-2 text-xs font-bold">{getPercent(optionB.currentVotes, "b") > 50 ? 'Winner' : 'Loser'}</span>
                  {selectedOption === "b" && <span className="mt-4 bg-white text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">Your Pick</span>}
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Instruction Banner */}
      {!hasVoted && (
         <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-2xl z-50 pointer-events-none border border-black/5">
            <h2 className="text-sm font-black text-black uppercase tracking-widest">Vote to unlock results</h2>
         </div>
      )}

    </div>
  );
}
