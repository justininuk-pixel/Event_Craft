"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const OPTIONS = [
  { id: "opt1", label: "Midnight Blue", color: "#1e3a8a" },
  { id: "opt2", label: "Crimson Red", color: "#991b1b" },
  { id: "opt3", label: "Emerald Green", color: "#065f46" },
  { id: "opt4", label: "Goldenrod", color: "#b45309" }
];

export function BlindVotingBooth({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"voting" | "revealed">("voting");
  const [myVote, setMyVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({
     opt1: 12,
     opt2: 8,
     opt3: 5,
     opt4: 15
  });
  
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playClick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);
  
  const playReveal = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  useEffect(() => {
    if (phase !== "voting") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "voting") return;
       
       const randomOpt = OPTIONS[Math.floor(Math.random() * OPTIONS.length)].id;
       
       setVotes(prev => ({
          ...prev,
          [randomOpt]: prev[randomOpt] + 1
       }));
       
    }, 1200);

    return () => clearInterval(interval);
  }, [phase]);

  const handleVote = (optId: string) => {
     if (phase !== "voting") return;
     initAudio();
     playClick();
     
     setMyVote(optId);
     setVotes(prev => ({
        ...prev,
        [optId]: prev[optId] + 1
     }));
     
     setTimeout(() => {
        setPhase("revealed");
        playReveal();
        if (onComplete) onComplete();
     }, 600);
  };

  const handleSkip = () => {
     if (phase !== "voting") return;
     initAudio();
     setPhase("revealed");
     playReveal();
     if (onComplete) onComplete();
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 0.15 : 0,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          pointerEvents: "none"
        }}
      >
        <div className="w-full max-w-lg bg-black p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
            />
          )}
          <h1 className="text-4xl font-heading mb-4" style={{ color: palette.primary }}>
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <div className="absolute inset-0 z-20 flex flex-col p-8">
         <div className="mb-12 text-center mt-8">
            <h2 className="text-3xl font-heading text-white tracking-tight">
               {phase === "voting" ? "Cast Your Vote" : "The Results Are In"}
            </h2>
            <p className="text-zinc-500 mt-2 font-medium">
               {phase === "voting" ? "Results are hidden until you participate." : `${totalVotes} total votes cast.`}
            </p>
         </div>

         <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-center gap-4">
            <LayoutGroup>
               {OPTIONS.map(opt => {
                  const voteCount = votes[opt.id] || 0;
                  const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                  const isSelected = myVote === opt.id;
                  
                  return (
                     <motion.div
                        layout
                        key={opt.id}
                        onClick={() => phase === "voting" && handleVote(opt.id)}
                        className={`relative w-full overflow-hidden rounded-2xl border-2 transition-colors ${
                           phase === "voting" 
                              ? "bg-zinc-900 border-zinc-800 hover:border-zinc-600 cursor-pointer active:scale-[0.98]" 
                              : isSelected ? "bg-zinc-900 border-white" : "bg-zinc-900 border-zinc-800"
                        }`}
                        style={{ height: phase === "voting" ? '80px' : '64px' }}
                     >
                        {/* The Bar Chart Fill (Only visible in revealed phase) */}
                        <motion.div
                           className="absolute top-0 left-0 bottom-0 z-0"
                           style={{ backgroundColor: opt.color }}
                           initial={{ width: "0%" }}
                           animate={{ width: phase === "revealed" ? `${percentage}%` : "0%" }}
                           transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        />
                        
                        {/* Option Content */}
                        <div className="absolute inset-0 z-10 flex items-center justify-between px-6 pointer-events-none">
                           <span className={`font-bold text-lg tracking-wide ${phase === "voting" ? "text-zinc-300" : "text-white drop-shadow-md"}`}>
                              {opt.label} {isSelected && phase === "revealed" && "(You)"}
                           </span>
                           
                           <AnimatePresence>
                              {phase === "revealed" && (
                                 <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="flex items-end gap-2 text-white drop-shadow-md"
                                 >
                                    <span className="text-2xl font-black">{percentage}%</span>
                                    <span className="text-sm opacity-70 font-medium mb-1">{voteCount} votes</span>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </motion.div>
                  );
               })}
            </LayoutGroup>
         </div>

         {/* Skip Button */}
         <AnimatePresence>
            {phase === "voting" && (
               <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-12 text-center"
               >
                  <button
                     onClick={handleSkip}
                     className="text-zinc-500 hover:text-zinc-300 text-sm font-bold tracking-widest transition-colors px-8 py-4"
                  >
                     SKIP AND REVEAL
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
         
      </div>
    </div>
  );
}
