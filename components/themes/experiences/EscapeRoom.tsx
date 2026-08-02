"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function EscapeRoom({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"locked" | "unlocked">("locked");
  const [role, setRole] = useState<"p1" | "p2" | "p3">("p1");
  const [enteredCode, setEnteredCode] = useState("");
  const [isError, setIsError] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playBeep = useCallback((freq: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playSuccess = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }, []);

  const handleKeyPress = (key: string) => {
     if (phase !== "locked") return;
     initAudio();
     playBeep(400 + parseInt(key) * 50);
     
     if (isError) {
        setIsError(false);
        setEnteredCode(key);
        return;
     }
     
     const nextCode = enteredCode + key;
     if (nextCode.length > 2) return;
     
     setEnteredCode(nextCode);
     
     if (nextCode.length === 2) {
        if (nextCode === "47") {
           playSuccess();
           setPhase("unlocked");
           setTimeout(() => {
              if (onComplete) onComplete();
           }, 2000);
        } else {
           setIsError(true);
           setTimeout(() => playBeep(200), 100);
           setTimeout(() => playBeep(150), 200);
        }
     }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-sans select-none">
      
      {/* Editor Simulator Toggle */}
      {phase === "locked" && (
         <div className="absolute top-0 left-0 w-full bg-zinc-900 border-b border-zinc-800 p-2 flex justify-center gap-2 z-50">
            <span className="text-xs font-bold text-zinc-500 mr-4 self-center tracking-widest uppercase">Simulate View:</span>
            {[
               { id: "p1", label: "Player 1" },
               { id: "p2", label: "Player 2" },
               { id: "p3", label: "Player 3" }
            ].map(r => (
               <button
                  key={r.id}
                  onClick={() => { setRole(r.id as any); setEnteredCode(""); setIsError(false); }}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${role === r.id ? "bg-indigo-600 text-white font-bold" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
               >
                  {r.label}
               </button>
            ))}
         </div>
      )}

      {/* Background Revealed Content */}
      <AnimatePresence>
         {phase === "unlocked" && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-30 pointer-events-auto bg-zinc-950"
            >
               <div className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-700">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-4xl font-heading mb-4 text-green-400">
                   {config.title}
                 </h1>
                 <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Foreground UI - Asymmetric Views */}
      <AnimatePresence mode="wait">
         {phase === "locked" && role === "p1" && (
            <motion.div 
               key="p1"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950"
            >
               <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase mb-16 px-8 text-center mt-12">
                  You are separated from your team. Communicate this to them.
               </p>
               <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Glowing Red Triangle */}
                  <svg viewBox="0 0 100 100" className="absolute w-full h-full drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
                     <polygon points="50,10 90,90 10,90" fill="none" stroke="red" strokeWidth="4" />
                  </svg>
                  <span className="text-6xl font-black text-red-500 mt-8 font-mono">4</span>
               </div>
            </motion.div>
         )}
         
         {phase === "locked" && role === "p2" && (
            <motion.div 
               key="p2"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950"
            >
               <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase mb-16 px-8 text-center mt-12">
                  You are separated from your team. Communicate this to them.
               </p>
               <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Glowing Blue Square */}
                  <svg viewBox="0 0 100 100" className="absolute w-full h-full drop-shadow-[0_0_30px_rgba(0,100,255,0.8)]">
                     <rect x="15" y="15" width="70" height="70" fill="none" stroke="#3b82f6" strokeWidth="4" />
                  </svg>
                  <span className="text-6xl font-black text-blue-500 font-mono">7</span>
               </div>
            </motion.div>
         )}
         
         {phase === "locked" && role === "p3" && (
            <motion.div 
               key="p3"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950"
            >
               <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase mb-8 px-8 text-center max-w-sm mt-12">
                  You found the lock. Ask the others for the code.
               </p>
               
               {/* Keypad Display */}
               <div className={`w-64 h-24 bg-zinc-900 border-4 mb-8 rounded-xl flex items-center justify-center text-5xl font-mono tracking-[1rem] pl-4 transition-colors ${
                  isError ? "border-red-500 text-red-500" : "border-zinc-700 text-green-400"
               }`}>
                  {isError ? "ERR" : enteredCode.padEnd(2, "_")}
               </div>
               
               {/* Keypad Buttons */}
               <div className="grid grid-cols-3 gap-4 w-64">
                  {["1","2","3","4","5","6","7","8","9","C","0","E"].map(k => (
                     <motion.button
                        key={k}
                        whileTap={{ scale: 0.9, backgroundColor: "#3f3f46" }}
                        onClick={() => {
                           if (k === "C") { setEnteredCode(""); setIsError(false); }
                           else if (k !== "E") handleKeyPress(k);
                        }}
                        className="aspect-square bg-zinc-800 rounded-lg flex items-center justify-center text-3xl font-mono text-white shadow-lg border-b-4 border-zinc-900 active:border-b-0 active:translate-y-1"
                     >
                        {k}
                     </motion.button>
                  ))}
               </div>
               
               {/* Tiny subtle hints on the lock frame */}
               <div className="mt-8 flex gap-8 opacity-30 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-8 h-8"><polygon points="50,10 90,90 10,90" fill="none" stroke="white" strokeWidth="4" /></svg>
                  <svg viewBox="0 0 100 100" className="w-8 h-8"><rect x="15" y="15" width="70" height="70" fill="none" stroke="white" strokeWidth="4" /></svg>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
