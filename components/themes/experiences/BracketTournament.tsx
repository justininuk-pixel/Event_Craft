"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type MatchItem = {
  id: string;
  name: string;
  emoji: string;
};

type Match = {
  id: string;
  item1: MatchItem;
  item2: MatchItem;
  votes1: number;
  votes2: number;
  winner: string | null;
  round: number;
};

const STARTING_ITEMS: MatchItem[] = [
  { id: "i1", name: "Pizza", emoji: "🍕" },
  { id: "i2", name: "Burger", emoji: "🍔" },
  { id: "i3", name: "Taco", emoji: "🌮" },
  { id: "i4", name: "Sushi", emoji: "🍣" },
  { id: "i5", name: "Pasta", emoji: "🍝" },
  { id: "i6", name: "Salad", emoji: "🥗" },
  { id: "i7", name: "Steak", emoji: "🥩" },
  { id: "i8", name: "Soup", emoji: "🥣" },
];

export function BracketTournament({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"tournament" | "champion">("tournament");
  const [round, setRound] = useState(1);
  const [matches, setMatches] = useState<Match[]>(() => [
    { id: "m1", round: 1, item1: STARTING_ITEMS[0], item2: STARTING_ITEMS[1], votes1: 0, votes2: 0, winner: null },
    { id: "m2", round: 1, item1: STARTING_ITEMS[2], item2: STARTING_ITEMS[3], votes1: 0, votes2: 0, winner: null },
    { id: "m3", round: 1, item1: STARTING_ITEMS[4], item2: STARTING_ITEMS[5], votes1: 0, votes2: 0, winner: null },
    { id: "m4", round: 1, item1: STARTING_ITEMS[6], item2: STARTING_ITEMS[7], votes1: 0, votes2: 0, winner: null },
  ]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [champion, setChampion] = useState<MatchItem | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";

  // Simulate mock votes trickling in
  useEffect(() => {
    if (phase !== "tournament") return;
    
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.round !== round || m.winner) return m;
        // Randomly add a vote to either side
        if (Math.random() > 0.5) {
          return { ...m, votes1: m.votes1 + 1 };
        } else {
          return { ...m, votes2: m.votes2 + 1 };
        }
      }));
    }, 800);

    return () => clearInterval(interval);
  }, [phase, round]);

  const activeMatches = matches.filter(m => m.round === round);
  const allVotedForRound = activeMatches.every(m => userVotes[m.id]);

  const handleVote = (matchId: string, itemId: string) => {
    if (userVotes[matchId]) return; // already voted in this match
    
    setUserVotes(prev => ({ ...prev, [matchId]: itemId }));
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        if (m.item1.id === itemId) return { ...m, votes1: m.votes1 + 10 }; // User vote carries weight
        if (m.item2.id === itemId) return { ...m, votes2: m.votes2 + 10 };
      }
      return m;
    }));
  };

  const advanceRound = () => {
    // Determine winners
    const winners = activeMatches.map(m => {
      const winnerItem = m.votes1 >= m.votes2 ? m.item1 : m.item2;
      return winnerItem;
    });

    if (round === 3) {
       // We have a final champion
       setChampion(winners[0]);
       setPhase("champion");
       setTimeout(() => {
          if (onComplete) onComplete();
       }, 3000);
    } else if (round === 1) {
       // Create Semifinals
       const newMatches: Match[] = [
          { id: "m5", round: 2, item1: winners[0], item2: winners[1], votes1: 0, votes2: 0, winner: null },
          { id: "m6", round: 2, item1: winners[2], item2: winners[3], votes1: 0, votes2: 0, winner: null },
       ];
       setMatches(prev => [...prev, ...newMatches]);
       setRound(2);
    } else if (round === 2) {
       // Create Finals
       const newMatches: Match[] = [
          { id: "m7", round: 3, item1: winners[0], item2: winners[1], votes1: 0, votes2: 0, winner: null },
       ];
       setMatches(prev => [...prev, ...newMatches]);
       setRound(3);
    }
  };

  const getPercentage = (v1: number, v2: number) => {
    const total = v1 + v2;
    if (total === 0) return 50;
    return Math.round((v1 / total) * 100);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white flex flex-col font-sans">
      
      {/* Background champion reveal */}
      <AnimatePresence>
         {phase === "champion" && champion && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1, transition: { duration: 1 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-auto bg-zinc-950/95 backdrop-blur-xl"
            >
               <motion.div 
                 initial={{ scale: 0, rotate: -180 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
                 className="text-9xl mb-8 filter drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]"
               >
                 {champion.emoji}
               </motion.div>
               <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-yellow-400">
                  {champion.name} Wins!
               </h2>

               <div className="w-full max-w-lg bg-zinc-900/90 p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-700">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-4xl font-heading mb-4 text-white">
                   {config.title}
                 </h1>
                 <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "tournament" && (
           <motion.div 
              key={`round-${round}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute inset-0 flex flex-col pt-16 px-6 pb-24 overflow-y-auto"
           >
              <h2 className="text-2xl font-black uppercase tracking-widest text-center mb-8 text-zinc-400">
                 {round === 1 ? "Quarterfinals" : round === 2 ? "Semifinals" : "Finals"}
              </h2>

              <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
                 {activeMatches.map((m, i) => {
                    const p1 = getPercentage(m.votes1, m.votes2);
                    const p2 = 100 - p1;
                    const hasVoted = !!userVotes[m.id];
                    const votedItem = userVotes[m.id];

                    return (
                       <div key={m.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl flex flex-col">
                          <div className="flex w-full min-h-[100px]">
                             <button
                                onClick={() => handleVote(m.id, m.item1.id)}
                                disabled={hasVoted}
                                className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors ${
                                   votedItem === m.item1.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                                } ${hasVoted && votedItem !== m.item1.id ? "opacity-30 grayscale" : ""}`}
                             >
                                <span className="text-4xl mb-2">{m.item1.emoji}</span>
                                <span className="font-bold text-sm truncate w-full text-center">{m.item1.name}</span>
                             </button>
                             <div className="w-px bg-zinc-800 flex flex-col items-center justify-center relative">
                                <span className="absolute bg-zinc-900 p-2 rounded-full text-xs font-bold text-zinc-500">VS</span>
                             </div>
                             <button
                                onClick={() => handleVote(m.id, m.item2.id)}
                                disabled={hasVoted}
                                className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors ${
                                   votedItem === m.item2.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                                } ${hasVoted && votedItem !== m.item2.id ? "opacity-30 grayscale" : ""}`}
                             >
                                <span className="text-4xl mb-2">{m.item2.emoji}</span>
                                <span className="font-bold text-sm truncate w-full text-center">{m.item2.name}</span>
                             </button>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-3 bg-zinc-800 flex relative overflow-hidden">
                             <motion.div 
                                className="h-full"
                                style={{ backgroundColor: primaryColor }}
                                animate={{ width: `${p1}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                             />
                             <div className="absolute inset-0 flex justify-between px-2 items-center text-[10px] font-bold mix-blend-difference text-white/50 pointer-events-none">
                                <span>{p1}%</span>
                                <span>{p2}%</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>

           </motion.div>
        )}
      </AnimatePresence>

      {phase === "tournament" && (
         <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-zinc-950 to-transparent flex justify-center z-20">
            <AnimatePresence>
               {allVotedForRound && (
                  <motion.button
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 20 }}
                     onClick={advanceRound}
                     className="px-8 py-4 rounded-full font-bold text-white shadow-xl transition-transform active:scale-95"
                     style={{ backgroundColor: primaryColor }}
                  >
                     {round === 3 ? "CROWN CHAMPION" : "SIMULATE NEXT ROUND"}
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
      )}

    </div>
  );
}
