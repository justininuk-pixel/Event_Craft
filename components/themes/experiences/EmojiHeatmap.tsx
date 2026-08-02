"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Placement {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  emoji: string;
}

const EMOJI_PALETTE = ["🔥", "❤️", "🤔", "👀", "😂"];

export function EmojiHeatmap({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"interactive" | "revealed">("interactive");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_PALETTE[0]);
  const [myPlacementsCount, setMyPlacementsCount] = useState(0);
  
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const selectedEmojiRef = useRef(selectedEmoji);
  useEffect(() => { selectedEmojiRef.current = selectedEmoji; }, [selectedEmoji]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playPop = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);
  
  useEffect(() => {
    if (phase !== "interactive") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "interactive") return;
       
       setPlacements(prev => {
          const newId = Math.random().toString();
          const rx = 20 + Math.random() * 60;
          const ry = 20 + Math.random() * 60;
          const randEmoji = EMOJI_PALETTE[Math.floor(Math.random() * EMOJI_PALETTE.length)];
          
          const next = [...prev, { id: newId, x: rx, y: ry, emoji: randEmoji }];
          if (next.length > 50) next.shift();
          return next;
       });
       
    }, 800);

    return () => clearInterval(interval);
  }, [phase]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (phase !== "interactive") return;
     initAudio();
     playPop();
     
     const rect = e.currentTarget.getBoundingClientRect();
     const x = ((e.clientX - rect.left) / rect.width) * 100;
     const y = ((e.clientY - rect.top) / rect.height) * 100;
     
     setPlacements(prev => [...prev, { id: Date.now().toString(), x, y, emoji: selectedEmoji }]);
     
     setMyPlacementsCount(c => {
        const next = c + 1;
        if (next >= 3) {
           setTimeout(() => {
              setPhase("revealed");
              if (onComplete) onComplete();
           }, 1000);
        }
        return next;
     });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-sans">
      
      {/* Background Canvas */}
      <div 
         className="absolute inset-0 cursor-crosshair overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black transition-all duration-1000"
         onClick={handleCanvasClick}
         style={{
            filter: phase === "revealed" ? 'blur(20px)' : 'none',
            opacity: phase === "revealed" ? 0.3 : 1
         }}
      >
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         
         <AnimatePresence>
            {placements.map(p => (
               <motion.span
                  key={p.id}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="absolute text-4xl drop-shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
               >
                  {p.emoji}
               </motion.span>
            ))}
         </AnimatePresence>
      </div>

      {/* Foreground Palette */}
      <AnimatePresence>
         {phase === "interactive" && (
            <motion.div
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl p-3 rounded-full border border-white/20 flex gap-2 shadow-2xl z-20 pointer-events-auto"
            >
               {EMOJI_PALETTE.map(emoji => (
                  <button
                     key={emoji}
                     onClick={(e) => { e.stopPropagation(); setSelectedEmoji(emoji); initAudio(); }}
                     className={`w-14 h-14 rounded-full text-3xl flex items-center justify-center transition-all ${
                        selectedEmoji === emoji ? "bg-white/30 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "hover:bg-white/10 opacity-70 hover:opacity-100"
                     }`}
                  >
                     {emoji}
                  </button>
               ))}
            </motion.div>
         )}
      </AnimatePresence>
      
      {/* Instructions */}
      <AnimatePresence>
         {phase === "interactive" && (
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-sm font-bold tracking-widest pointer-events-none z-20"
            >
               TAP TO PLACE ({3 - myPlacementsCount} LEFT)
            </motion.div>
         )}
      </AnimatePresence>

      {/* Background Revealed Content */}
      <AnimatePresence>
         {phase === "revealed" && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1, transition: { duration: 0.8 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-auto"
            >
               <div className="w-full max-w-lg bg-zinc-900 p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-800">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
                   {config.title}
                 </h1>
                 <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
