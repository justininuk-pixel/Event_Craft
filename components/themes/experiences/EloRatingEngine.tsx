"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy } from "lucide-react";

type Item = {
  id: string;
  name: string;
  elo: number;
};

const defaultItems: Item[] = [
  { id: "i1", name: "In-N-Out Burger", elo: 1200 },
  { id: "i2", name: "Shake Shack", elo: 1200 },
  { id: "i3", name: "Five Guys", elo: 1200 },
  { id: "i4", name: "Wendy's", elo: 1200 },
  { id: "i5", name: "McDonald's", elo: 1200 },
  { id: "i6", name: "Burger King", elo: 1200 },
];

export function EloRatingEngine({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const title = config.title || "The Ultimate Tier List";
  const initialItems = (config.experience as any)?.items || defaultItems;

  const [items, setItems] = useState<Item[]>(initialItems);
  const [matchCount, setMatchCount] = useState(0);
  const targetMatches = 10;

  // Pick two items to compare (simplified: just random for now)
  const getMatchup = () => {
    let a = Math.floor(Math.random() * items.length);
    let b = Math.floor(Math.random() * items.length);
    while (a === b) b = Math.floor(Math.random() * items.length);
    return [items[a], items[b]];
  };

  const [currentMatch, setCurrentMatch] = useState<Item[]>(() => getMatchup());

  const handleVote = (winnerId: string) => {
    const winnerIndex = items.findIndex(i => i.id === winnerId);
    const loserIndex = items.findIndex(i => i.id === (currentMatch[0].id === winnerId ? currentMatch[1].id : currentMatch[0].id));
    
    if (winnerIndex === -1 || loserIndex === -1) return;

    // Simple Elo calculation
    const K = 32;
    const Rw = items[winnerIndex].elo;
    const Rl = items[loserIndex].elo;
    
    const Ew = 1 / (1 + Math.pow(10, (Rl - Rw) / 400));
    const El = 1 / (1 + Math.pow(10, (Rw - Rl) / 400));

    const newItems = [...items];
    newItems[winnerIndex].elo = Math.round(Rw + K * (1 - Ew));
    newItems[loserIndex].elo = Math.round(Rl + K * (0 - El));

    setItems(newItems);
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

    const newMatchCount = matchCount + 1;
    setMatchCount(newMatchCount);

    if (newMatchCount >= targetMatches) {
       if (onComplete) setTimeout(onComplete, 3000);
    } else {
       setCurrentMatch(getMatchup());
    }
  };

  const sortedItems = [...items].sort((a, b) => b.elo - a.elo);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-8 pb-4 text-center z-10">
        <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">
           {matchCount < targetMatches ? `Match ${matchCount + 1} / ${targetMatches}` : "Final Rankings"}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {matchCount < targetMatches ? (
             <motion.div 
               key={`match-${matchCount}`}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-md flex flex-col items-center gap-6"
             >
                <div className="flex items-center justify-between w-full gap-4">
                   {/* Fighter 1 */}
                   <button 
                     onClick={() => handleVote(currentMatch[0].id)}
                     className="flex-1 aspect-square bg-zinc-800 rounded-xl border-4 border-zinc-700 shadow-xl flex items-center justify-center p-4 hover:border-red-500 active:scale-95 transition-all group"
                   >
                     <span className="text-xl font-black text-white text-center group-hover:text-red-400">{currentMatch[0].name}</span>
                   </button>

                   <Swords size={32} className="text-zinc-600 shrink-0" />

                   {/* Fighter 2 */}
                   <button 
                     onClick={() => handleVote(currentMatch[1].id)}
                     className="flex-1 aspect-square bg-zinc-800 rounded-xl border-4 border-zinc-700 shadow-xl flex items-center justify-center p-4 hover:border-blue-500 active:scale-95 transition-all group"
                   >
                     <span className="text-xl font-black text-white text-center group-hover:text-blue-400">{currentMatch[1].name}</span>
                   </button>
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest animate-pulse">Choose the winner</p>
             </motion.div>
          ) : (
             <motion.div 
               key="results"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-md bg-zinc-800 rounded-xl border border-zinc-700 p-6 shadow-2xl flex flex-col"
             >
                <Trophy size={32} className="mx-auto text-yellow-500 mb-6" />
                
                <div className="space-y-3">
                   {sortedItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                         <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                               {index + 1}
                            </span>
                            <span className={`font-bold ${index === 0 ? 'text-yellow-500' : 'text-zinc-200'}`}>{item.name}</span>
                         </div>
                         <span className="font-mono text-xs text-zinc-500 bg-black px-2 py-1 rounded">Elo: {item.elo}</span>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
