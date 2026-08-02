"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function HatDraw({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"input" | "dropping" | "drawing" | "revealed">("input");
  const [name, setName] = useState("");
  const [drawnName, setDrawnName] = useState("");

  const mockNames = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George"];

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playDrop = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const playReveal = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1); 
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2); 
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    initAudio();
    playDrop();
    setPhase("dropping");

    const available = mockNames.filter(n => n.toLowerCase() !== name.trim().toLowerCase());
    const result = available[Math.floor(Math.random() * available.length)] || "Unknown";
    setDrawnName(result);

    setTimeout(() => {
      setPhase("drawing");
    }, 600);

    setTimeout(() => {
      playReveal();
      setPhase("revealed");
      onComplete?.();
    }, 2600);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#222] touch-none select-none flex flex-col items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          backgroundColor: palette.background as string 
        }}
      >
        <motion.div
           initial={{ scale: 0.5, y: 100 }}
           animate={{ scale: phase === "revealed" ? 1 : 0.5, y: phase === "revealed" ? 0 : 100 }}
           transition={{ type: "spring", damping: 15, stiffness: 100 }}
           className="w-full max-w-sm bg-amber-100 text-amber-900 p-8 rounded shadow-2xl flex flex-col items-center rotate-[-2deg]"
        >
           <p className="font-mono text-sm uppercase tracking-widest text-amber-900/50 mb-2">You drew:</p>
           <h2 className="font-heading text-5xl font-black mb-8 border-b-2 border-amber-900/20 pb-4">{drawnName}</h2>
           
           {config.mediaUrl && (
             <img 
               src={config.mediaUrl} 
               alt="Revealed" 
               className="w-32 h-32 object-cover rounded shadow mb-6 grayscale mix-blend-multiply"
             />
           )}
           <h1 className="text-2xl font-heading mb-2 text-amber-900">
             {config.title}
           </h1>
           <p className="text-sm font-body whitespace-pre-wrap max-w-sm text-amber-800">
             {config.body}
           </p>
        </motion.div>
      </div>

      {/* Foreground Hat UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            
            {/* The Paper Input */}
            <AnimatePresence>
              {(phase === "input" || phase === "dropping") && (
                <motion.form 
                  onSubmit={handleSubmit}
                  className="absolute top-32 w-64 h-32 bg-amber-50 shadow-md flex flex-col items-center justify-center p-4 rounded-sm rotate-2 z-10"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ 
                    y: phase === "dropping" ? 300 : 0,
                    scale: phase === "dropping" ? 0.5 : 1,
                    opacity: phase === "dropping" ? 0 : 1,
                    rotate: phase === "dropping" ? 15 : 2
                  }}
                  transition={{ duration: 0.6, ease: "easeIn" }}
                >
                   <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-2 w-full text-left">Your Name:</p>
                   <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-transparent border-b-2 border-black/20 focus:border-black/50 outline-none text-2xl font-heading text-black text-center"
                     autoFocus
                     required
                   />
                   {phase === "input" && (
                     <button type="submit" className="mt-4 px-4 py-2 bg-black text-white text-xs uppercase font-mono tracking-widest rounded-full">
                       Drop in Hat
                     </button>
                   )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* The Magic Hat */}
            <motion.div 
               className="absolute bottom-1/4 flex flex-col items-center z-20"
               animate={phase === "drawing" ? {
                 rotate: [0, -10, 10, -10, 10, -5, 5, 0],
                 scale: [1, 1.05, 1, 1.05, 1],
                 y: [0, -20, 0, -10, 0]
               } : {}}
               transition={{ duration: 1.5 }}
            >
               {/* Hat Top */}
               <div className="w-48 h-12 bg-zinc-800 rounded-[100%] shadow-[inset_0_-20px_20px_rgba(0,0,0,0.8)] relative z-10 border border-zinc-700 overflow-hidden">
                 <div className="absolute inset-0 bg-black/50 rounded-[100%] scale-90 translate-y-2" />
               </div>
               
               {/* Hat Body */}
               <div className="w-48 h-48 bg-zinc-800 -mt-6 rounded-b-xl shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8)] flex items-end justify-center pb-4 relative z-0">
                 <div className="w-full h-8 bg-red-800 mb-4" />
               </div>

               {/* Hat Brim */}
               <div className="w-72 h-16 bg-zinc-800 -mt-8 rounded-[100%] shadow-2xl relative z-20 border border-zinc-700 flex items-center justify-center">
                 <div className="w-48 h-12 rounded-[100%] shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
               </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
