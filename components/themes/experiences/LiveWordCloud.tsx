"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const MOCK_WORDS = [
  "Love", "Family", "Amazing", "Awesome", "Yes", "Beautiful", "Exciting",
  "Fun", "Together", "Magic", "Epic", "Wow", "Joy", "Happy", "Perfect"
];

export function LiveWordCloud({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"answering" | "revealed">("answering");
  const [words, setWords] = useState<Record<string, { weight: number, color: string, rotation: number }>>({
     "Celebration": { weight: 5, color: "#f43f5e", rotation: -5 },
     "Party": { weight: 3, color: "#3b82f6", rotation: 5 },
  });
  const [myInput, setMyInput] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
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

  const playPop = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(400 + Math.random() * 400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (phase !== "answering") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "answering") return;
       
       const randomWord = MOCK_WORDS[Math.floor(Math.random() * MOCK_WORDS.length)];
       
       setWords(prev => {
          const w = randomWord.toUpperCase();
          const existing = prev[w];
          
          if (existing) {
             return { ...prev, [w]: { ...existing, weight: existing.weight + 1 } };
          } else {
             const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
             return {
                ...prev,
                [w]: {
                   weight: 1,
                   color: colors[Math.floor(Math.random() * colors.length)],
                   rotation: (Math.random() - 0.5) * 20
                }
             };
          }
       });
       
       if (Math.random() > 0.5) playPop();
       
    }, 1500);

    return () => clearInterval(interval);
  }, [phase, playPop]);


  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!myInput.trim()) return;
     initAudio();
     playPop();
     
     const w = myInput.trim().toUpperCase();
     
     setWords(prev => {
        const existing = prev[w];
        if (existing) {
           return { ...prev, [w]: { ...existing, weight: existing.weight + 5 } };
        } else {
           const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
           return {
              ...prev,
              [w]: {
                 weight: 5,
                 color: colors[Math.floor(Math.random() * colors.length)],
                 rotation: (Math.random() - 0.5) * 20
              }
           };
        }
     });
     
     setMyInput("");
     setHasSubmitted(true);
  };

  const handleRevealClick = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  const sortedWords = Object.entries(words).sort((a, b) => b[1].weight - a[1].weight).slice(0, 40);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 touch-none flex flex-col font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent',
          pointerEvents: phase === "revealed" ? "auto" : "none"
        }}
      >
        <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-100">
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
          <p className="text-lg font-body text-slate-600 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "answering" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col bg-slate-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
          >
            
            <div className="p-8 pb-0 text-center">
               <h2 className="text-3xl font-heading text-slate-800">
                  {config.title || "Describe this in one word"}
               </h2>
               <p className="text-slate-500 mt-2">See what everyone else thinks in real-time.</p>
            </div>

            {/* Word Cloud Container */}
            <div className="flex-1 w-full p-8 flex items-center justify-center overflow-hidden">
               <LayoutGroup>
                  <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl content-center h-full">
                     <AnimatePresence>
                        {sortedWords.map(([word, data]) => {
                           const size = Math.max(16, Math.min(80, 12 + data.weight * 4));
                           
                           return (
                              <motion.span
                                 layout
                                 key={word}
                                 initial={{ scale: 0, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 exit={{ scale: 0, opacity: 0 }}
                                 transition={{ type: "spring", bounce: 0.3 }}
                                 className="font-bold leading-none inline-block drop-shadow-sm"
                                 style={{ 
                                    fontSize: `${size}px`, 
                                    color: data.color,
                                    rotate: data.rotation
                                 }}
                              >
                                 {word}
                              </motion.span>
                           );
                        })}
                     </AnimatePresence>
                  </div>
               </LayoutGroup>
            </div>

            {/* Bottom Input Area */}
            <div className="w-full bg-white p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30 flex flex-col items-center">
               <form onSubmit={handleSubmit} className="w-full max-w-sm relative">
                  <input
                     type="text"
                     value={myInput}
                     onChange={(e) => setMyInput(e.target.value)}
                     maxLength={20}
                     placeholder="One word..."
                     className="w-full bg-slate-100 border-2 border-slate-200 rounded-full px-6 py-4 text-lg outline-none focus:border-indigo-500 font-bold text-slate-700 transition-colors"
                  />
                  <button
                     type="submit"
                     className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full px-6 transition-transform active:scale-95"
                  >
                     SEND
                  </button>
               </form>
               
               {hasSubmitted && (
                  <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={handleRevealClick}
                     className="mt-6 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold tracking-widest px-6 py-2"
                  >
                     FINISH / REVEAL CONTENT
                  </motion.button>
               )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
