"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Choice {
   text: string;
   targetId: string;
}

interface StoryNode {
   id: string;
   text: string;
   choices: Choice[];
}

const STORY_DATA: Record<string, StoryNode> = {
   "start": {
      id: "start",
      text: "You awaken in a dimly lit stone corridor. To your left, a heavy oak door sits slightly ajar, emitting a faint glow. To your right, the corridor descends into absolute darkness.",
      choices: [
         { text: "Open the oak door", targetId: "room" },
         { text: "Walk into the darkness", targetId: "dark" }
      ]
   },
   "room": {
      id: "room",
      text: "You push the door open to reveal a grand library. In the center of the room, a pedestal holds a shimmering crystal. Suddenly, you hear footsteps approaching from behind.",
      choices: [
         { text: "Grab the crystal and hide", targetId: "crystal" },
         { text: "Stand your ground", targetId: "fight" }
      ]
   },
   "dark": {
      id: "dark",
      text: "You feel your way along the cold stone walls. The air grows colder until you stumble upon a sleeping dragon. It stirs slightly.",
      choices: [
         { text: "Sneak past it", targetId: "sneak" },
         { text: "Wake it gently", targetId: "wake" }
      ]
   },
   "crystal": {
      id: "crystal",
      text: "You clutch the crystal. Its warmth fills you with sudden clarity. You have unlocked the secret of the castle.",
      choices: []
   },
   "fight": {
      id: "fight",
      text: "You turn to face your pursuer. It's an old wizard, smiling warmly. 'I see you are brave,' he says, handing you a key.",
      choices: []
   },
   "sneak": {
      id: "sneak",
      text: "You tiptoe carefully. You make it to the other side safely and find a treasure chest waiting for you.",
      choices: []
   },
   "wake": {
      id: "wake",
      text: "The dragon opens one massive eye, then nudges a pile of gold toward you. It seems you've made a powerful friend.",
      choices: []
   }
};

export function CrowdSourcedAdventure({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>("start");
  const [phase, setPhase] = useState<"reading" | "tallying" | "locked">("reading");
  
  // Tally state
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [votes, setVotes] = useState<number[]>([0, 0]);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"];

  const currentNode = STORY_DATA[currentNodeId];

  const handleVote = (index: number) => {
     setSelectedChoiceIndex(index);
     setPhase("tallying");
     setVotes([0, 0]); // reset visually

     // Simulate a quick 2.5s voting phase where random votes pour in, 
     // but the user's choice ultimately wins 60% to 40%
     let ticks = 0;
     const maxTicks = 20;
     const interval = setInterval(() => {
        ticks++;
        setVotes(prev => {
           const next = [...prev];
           // randomly assign votes, but bias toward the user's choice
           if (Math.random() < 0.65) {
              next[index] += Math.floor(Math.random() * 5) + 1;
           } else {
              next[1 - index] += Math.floor(Math.random() * 5) + 1;
           }
           return next;
        });

        if (ticks >= maxTicks) {
           clearInterval(interval);
           // Proceed to next node
           setTimeout(() => {
              const nextNodeId = currentNode.choices[index].targetId;
              setCurrentNodeId(nextNodeId);
              
              if (STORY_DATA[nextNodeId].choices.length === 0) {
                 setPhase("locked");
                 setTimeout(() => {
                    if (onComplete) onComplete();
                 }, 2000);
              } else {
                 setPhase("reading");
                 setSelectedChoiceIndex(null);
              }
           }, 1000);
        }
     }, 100);
  };

  const totalVotes = votes[0] + votes[1] || 1;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-serif items-center justify-center bg-indigo-950 text-indigo-50 p-6"
    >
      <div 
         className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay" 
         style={{ background: `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      {/* Decorative Book Border */}
      <div className="absolute inset-4 border-2 border-indigo-400/30 rounded-lg pointer-events-none" />
      
      <AnimatePresence mode="wait">
         {phase === "reading" && (
            <motion.div
               key={currentNodeId}
               initial={{ opacity: 0, filter: "blur(10px)" }}
               animate={{ opacity: 1, filter: "blur(0px)" }}
               exit={{ opacity: 0, filter: "blur(10px)" }}
               transition={{ duration: 0.8 }}
               className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center space-y-12"
            >
               <h2 className="text-sm font-sans font-bold tracking-[0.3em] uppercase text-indigo-300">
                  Chapter {currentNodeId === "start" ? "I" : "II"}
               </h2>
               
               <p className="text-2xl md:text-3xl leading-relaxed text-indigo-100 drop-shadow-md">
                  {currentNode.text}
               </p>
               
               <div className="w-full flex flex-col sm:flex-row gap-4 pt-8">
                  {currentNode.choices.map((choice, idx) => (
                     <button
                        key={idx}
                        onClick={() => handleVote(idx)}
                        className="flex-1 py-4 px-6 border-2 border-indigo-400/30 rounded-lg text-lg font-bold hover:bg-indigo-400/10 hover:border-indigo-400 transition-all hover:scale-[1.02] active:scale-95"
                     >
                        {choice.text}
                     </button>
                  ))}
               </div>
            </motion.div>
         )}

         {phase === "tallying" && selectedChoiceIndex !== null && (
            <motion.div
               key="tallying"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center space-y-8"
            >
               <h2 className="text-xl font-sans font-black tracking-widest uppercase text-indigo-300">
                  The Crowd Decides...
               </h2>
               
               <div className="w-full space-y-6">
                  {currentNode.choices.map((choice, idx) => {
                     const percent = Math.round((votes[idx] / totalVotes) * 100);
                     const isWinner = idx === selectedChoiceIndex;
                     return (
                        <div key={idx} className="w-full flex flex-col items-start gap-2">
                           <div className="flex justify-between w-full text-sm font-bold font-sans">
                              <span>{choice.text}</span>
                              <span>{votes[idx]} votes ({percent}%)</span>
                           </div>
                           <div className="w-full h-4 bg-indigo-900/50 rounded-full overflow-hidden">
                              <motion.div
                                 className="h-full rounded-full"
                                 style={{ backgroundColor: isWinner ? primaryColor : "#4f46e5" }}
                                 animate={{ width: `${percent}%` }}
                                 transition={{ type: "spring", damping: 20 }}
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            </motion.div>
         )}

         {phase === "locked" && (
            <motion.div
               key="locked"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               className="relative z-10 w-full max-w-2xl bg-indigo-900/80 backdrop-blur-md border border-indigo-400/30 p-10 rounded-2xl flex flex-col items-center shadow-2xl text-center"
            >
               <h1 className="text-3xl font-black font-sans uppercase text-indigo-100 mb-6 tracking-widest">
                 The End
               </h1>
               
               <p className="text-xl italic text-indigo-200 mb-10 leading-relaxed">
                  {currentNode.text}
               </p>
               
               <div className="w-full bg-indigo-950/80 rounded-xl p-8 border border-indigo-500/20 shadow-inner">
                  <h2 className="text-2xl font-bold font-sans mb-4 text-white">
                    {config.title}
                  </h2>
                  <p className="text-lg text-indigo-200 font-sans">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
