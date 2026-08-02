"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const PADS = Array.from({ length: 16 }, (_, i) => i);

export function SoundboardJam({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"jamming" | "revealed">("jamming");
  const [activePads, setActivePads] = useState<Record<number, boolean>>({});
  const [myHits, setMyHits] = useState(0);

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

  const playSound = useCallback((index: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    const row = Math.floor(index / 4);
    if (row === 3) {
       osc.type = "sine";
       osc.frequency.setValueAtTime(150, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    } else if (row === 2) {
       osc.type = "square";
       osc.frequency.setValueAtTime(300 + index * 50, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    } else {
       osc.type = "sawtooth";
       osc.frequency.setValueAtTime(220 * Math.pow(1.05946309, index), ctx.currentTime);
    }
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (row === 3 ? 0.5 : 0.2));
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, []);

  const triggerPad = useCallback((index: number, isLocal: boolean) => {
     if (phaseRef.current !== "jamming") return;
     
     playSound(index);
     
     setActivePads(prev => ({ ...prev, [index]: true }));
     setTimeout(() => {
        setActivePads(prev => ({ ...prev, [index]: false }));
     }, 150);

     if (isLocal) {
        setMyHits(prev => prev + 1);
     }
  }, [playSound]);

  useEffect(() => {
    if (phase !== "jamming") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "jamming") return;
       if (Math.random() > 0.4) {
          const randPad = Math.floor(Math.random() * 16);
          triggerPad(randPad, false);
       }
    }, 400);

    return () => clearInterval(interval);
  }, [phase, triggerPad]);

  const handlePadDown = (index: number) => {
     initAudio();
     triggerPad(index, true);
  };

  const handleDone = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-sans select-none">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (Array.isArray(palette.background) ? palette.background[0] : palette.background) || '#000' : 'transparent',
          pointerEvents: phase === "revealed" ? "auto" : "none"
        }}
      >
        <div className="w-full max-w-lg bg-zinc-900 p-8 rounded-3xl shadow-[0_0_100px_rgba(255,255,255,0.1)] flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)] font-black">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
         {phase === "jamming" && (
            <motion.div 
               className="absolute inset-0 z-20 flex flex-col bg-zinc-950 p-4 pb-12"
               initial={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.2 }}
               transition={{ duration: 0.8 }}
            >
               
               <div className="flex justify-between items-center mb-6 mt-4">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">
                     Soundboard Jam
                  </h2>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full">
                     Hits: {myHits}
                  </div>
               </div>
               
               {/* Grid */}
               <div className="flex-1 grid grid-cols-4 gap-3 max-w-xl mx-auto w-full aspect-square">
                  {PADS.map(index => {
                     const isActive = activePads[index];
                     const row = Math.floor(index / 4);
                     let colorClass = "bg-zinc-800 border-zinc-700";
                     let activeClass = "bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)]";
                     
                     if (row === 0) { colorClass = "bg-rose-950 border-rose-900"; activeClass = "bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.8)]"; }
                     if (row === 1) { colorClass = "bg-purple-950 border-purple-900"; activeClass = "bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.8)]"; }
                     if (row === 2) { colorClass = "bg-blue-950 border-blue-900"; activeClass = "bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.8)]"; }
                     if (row === 3) { colorClass = "bg-emerald-950 border-emerald-900"; activeClass = "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8)]"; }

                     return (
                        <motion.button
                           key={index}
                           onPointerDown={() => handlePadDown(index)}
                           className={`w-full h-full rounded-2xl border-b-4 transition-all duration-75 ${
                              isActive ? `${activeClass} translate-y-1 border-b-0` : `${colorClass}`
                           }`}
                        />
                     );
                  })}
               </div>
               
               {/* Done Button */}
               <AnimatePresence>
                  {myHits >= 5 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-12 flex justify-center"
                     >
                        <button
                           onClick={handleDone}
                           className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                           FINISH JAM
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
               
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
