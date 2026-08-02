"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function TugOfWar({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"pulling" | "revealed">("pulling");
  const [ropePos, setRopePos] = useState(50);
  const [winner, setWinner] = useState<"left" | "right" | null>(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const ropeRef = useRef(ropePos);
  useEffect(() => { ropeRef.current = ropePos; }, [ropePos]);
  const winnerRef = useRef(winner);
  useEffect(() => { winnerRef.current = winner; }, [winner]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playThud = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const handleTap = (side: "left" | "right") => {
     if (phase !== "pulling" || winnerRef.current) return;
     initAudio();
     playThud();
     
     setRopePos(prev => {
        let next = side === "left" ? prev - 2 : prev + 2;
        if (next <= 0) {
           next = 0;
           setWinner("left");
        } else if (next >= 100) {
           next = 100;
           setWinner("right");
        }
        return next;
     });
  };

  useEffect(() => {
    if (phase !== "pulling") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "pulling" || winnerRef.current) return;
       
       setRopePos(prev => {
          let pull = (Math.random() - 0.5) * 6; 
          let next = prev + pull;
          
          if (next <= 0) {
             next = 0;
             setWinner("left");
          } else if (next >= 100) {
             next = 100;
             setWinner("right");
          }
          return next;
       });
       
    }, 200);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
     if (winner && phase === "pulling") {
        const t = setTimeout(() => {
           setPhase("revealed");
           if (onComplete) onComplete();
        }, 2000);
        return () => clearTimeout(t);
     }
  }, [winner, phase, onComplete]);

  const handleRevealClick = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-zinc-700"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-300 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "pulling" && (
          <motion.div 
            className="absolute inset-0 z-20 flex"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
          >
            
            {/* Split Screen Buttons */}
            <div 
               className="flex-1 bg-red-600 active:bg-red-700 transition-colors cursor-pointer flex flex-col items-center justify-center relative overflow-hidden"
               onPointerDown={() => handleTap("left")}
            >
               {winner === "left" && (
                  <motion.div 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 5, opacity: 1 }}
                     transition={{ duration: 0.5 }}
                     className="absolute w-32 h-32 bg-white/20 rounded-full"
                  />
               )}
               <span className="text-white/50 font-black text-6xl tracking-tighter uppercase -rotate-90 md:rotate-0 select-none pointer-events-none">
                  TEAM A
               </span>
               <span className="text-white font-bold tracking-widest mt-4 opacity-70 pointer-events-none">
                  TAP TO PULL
               </span>
            </div>
            
            <div 
               className="flex-1 bg-blue-600 active:bg-blue-700 transition-colors cursor-pointer flex flex-col items-center justify-center relative overflow-hidden"
               onPointerDown={() => handleTap("right")}
            >
               {winner === "right" && (
                  <motion.div 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 5, opacity: 1 }}
                     transition={{ duration: 0.5 }}
                     className="absolute w-32 h-32 bg-white/20 rounded-full"
                  />
               )}
               <span className="text-white/50 font-black text-6xl tracking-tighter uppercase rotate-90 md:rotate-0 select-none pointer-events-none">
                  TEAM B
               </span>
               <span className="text-white font-bold tracking-widest mt-4 opacity-70 pointer-events-none">
                  TAP TO PULL
               </span>
            </div>

            {/* The Rope & Indicator */}
            <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 pointer-events-none">
               {/* Rope Line */}
               <div className="absolute top-1/2 left-0 w-full h-2 bg-zinc-800 -translate-y-1/2 shadow-lg" />
               <div className="absolute top-1/2 left-0 w-full h-2 bg-white/10 -translate-y-1/2" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)' }} />
               
               {/* Indicator Flag */}
               <motion.div 
                  className="absolute top-1/2 w-10 h-24 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-sm shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center"
                  animate={{ left: `${ropePos}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
               >
                  <div className="w-1 h-full bg-black/20" />
               </motion.div>
            </div>

            <button
               onClick={handleRevealClick}
               className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors text-[10px] font-bold tracking-widest bg-black/50 px-4 py-2 rounded-full z-30"
            >
               SKIP MATCH
            </button>
            
            {/* Winner Overlay */}
            <AnimatePresence>
               {winner && (
                  <motion.div 
                     className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                  >
                     <div className="bg-white text-black px-12 py-6 rounded-3xl shadow-2xl font-black text-4xl uppercase tracking-widest border-4 border-black">
                        {winner === "left" ? "Team A Wins!" : "Team B Wins!"}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
