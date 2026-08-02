"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_SENTENCES = [
  "Once upon a time in a city that never slept, a shadow moved across the rooftops.",
  "It was carrying a glowing orb that pulsed with the rhythm of a heartbeat.",
  "Suddenly, the orb whispered a secret that could unravel the universe."
];

export function PassedNote({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"reading" | "writing" | "revealed">("reading");
  const [sentences, setSentences] = useState<string[]>(INITIAL_SENTENCES);
  const [mySentence, setMySentence] = useState("");
  
  const lastSentence = sentences[sentences.length - 1];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playScribble = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100 + Math.random() * 200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100 + Math.random() * 200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);
  
  const playFold = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(50, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const handleStartWriting = () => {
     initAudio();
     setPhase("writing");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     setMySentence(e.target.value);
     if (Math.random() > 0.7) playScribble();
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!mySentence.trim()) return;
     
     setSentences(prev => [...prev, mySentence.trim()]);
     setPhase("revealed");
     playFold();
     
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-sans">
      
      {/* Background Revealed Content */}
      <AnimatePresence>
         {phase === "revealed" && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1, transition: { delay: 1, duration: 1 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 bg-black/60 backdrop-blur pointer-events-none"
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

      {/* Foreground UI */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 pointer-events-none">
         
         <AnimatePresence mode="wait">
            
            {/* Phase 1: Reading */}
            {phase === "reading" && (
               <motion.div 
                  key="reading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md bg-[#fdfbf7] p-10 rounded-xl shadow-2xl border border-zinc-300 flex flex-col items-center pointer-events-auto"
               >
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2 w-full text-center">
                     The story so far... (Previous line)
                  </p>
                  
                  <p className="text-2xl text-zinc-800 italic leading-relaxed text-center font-serif">
                     "... {lastSentence}"
                  </p>
                  
                  <button
                     onClick={handleStartWriting}
                     className="mt-12 bg-zinc-900 text-white font-bold tracking-widest text-sm px-8 py-4 rounded-full shadow-lg hover:bg-zinc-800 transition-colors pointer-events-auto"
                  >
                     CONTINUE THE STORY
                  </button>
               </motion.div>
            )}

            {/* Phase 2: Writing */}
            {phase === "writing" && (
               <motion.div 
                  key="writing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-md bg-[#fdfbf7] p-10 rounded-xl shadow-2xl border border-zinc-300 flex flex-col pointer-events-auto"
               >
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-200 pb-2">
                     Your Turn
                  </p>
                  
                  <p className="text-lg text-zinc-500 italic mb-4 font-serif">
                     "... {lastSentence}"
                  </p>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col w-full">
                     <textarea
                        value={mySentence}
                        onChange={handleTextChange}
                        placeholder="And then..."
                        rows={4}
                        autoFocus
                        className="w-full bg-transparent border-none text-2xl text-zinc-900 font-serif placeholder:text-zinc-300 outline-none resize-none leading-relaxed"
                     />
                     
                     <div className="mt-8 flex justify-end">
                        <button
                           type="submit"
                           disabled={!mySentence.trim()}
                           className="bg-zinc-900 text-white font-bold tracking-widest text-sm px-8 py-4 rounded-full shadow-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                        >
                           FOLD & PASS
                        </button>
                     </div>
                  </form>
               </motion.div>
            )}

            {/* Phase 3: Revealed (The Full Story) */}
            {phase === "revealed" && (
               <motion.div 
                  key="revealed"
                  initial={{ opacity: 0, y: 50, rotateX: 90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                  className="w-full max-w-lg bg-[#fdfbf7] p-10 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-zinc-300 flex flex-col max-h-[70vh] overflow-y-auto pointer-events-auto"
               >
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-200 pb-2 w-full text-center">
                     The Full Story
                  </p>
                  
                  <div className="flex flex-col gap-4">
                     {sentences.map((sent, idx) => (
                        <motion.p 
                           key={idx}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 0.5 + idx * 0.5 }}
                           className={`text-xl font-serif leading-relaxed ${idx === sentences.length - 1 ? "text-indigo-700 font-bold" : "text-zinc-800"}`}
                        >
                           {sent}
                        </motion.p>
                     ))}
                  </div>
               </motion.div>
            )}
            
         </AnimatePresence>
      </div>

    </div>
  );
}
