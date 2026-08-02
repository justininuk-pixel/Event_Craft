"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ChorusLine({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"intro" | "recording" | "analyzing" | "chorus" | "revealed">("intro");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#a855f7";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  useEffect(() => {
    return () => {
      stopChorus();
    };
  }, []);

  const handlePointerDown = () => {
    if (phase !== "intro") return;
    setPhase("recording");
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
       setPhase("analyzing");
       
       setTimeout(() => {
          setPhase("chorus");
       }, 1500);
    }, 3000);
  };

  const startChorus = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // Create AudioContext
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current) {
       audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    
    // frequencies for a rich major 9th chord across 3 octaves
    const baseFrequencies = [
      130.81, // C3
      164.81, // E3
      196.00, // G3
      246.94, // B3
      293.66, // D4
      329.63, // E4
      392.00, // G4
      523.25, // C5
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2); // fade in
    masterGain.connect(ctx.destination);

    // Create 30 slightly detuned oscillators to simulate a massive crowd
    for (let i = 0; i < 30; i++) {
       const osc = ctx.createOscillator();
       const oscGain = ctx.createGain();
       
       const baseFreq = baseFrequencies[i % baseFrequencies.length];
       // Detune by random amount +/- 15 cents
       const detune = (Math.random() - 0.5) * 30;
       
       osc.type = "sine";
       if (i % 3 === 0) osc.type = "triangle";
       
       osc.frequency.value = baseFreq;
       osc.detune.value = detune;
       
       oscGain.gain.value = 1 / 30; // mix down
       
       osc.connect(oscGain);
       oscGain.connect(masterGain);
       
       osc.start();
       oscillatorsRef.current.push(osc);
    }
    
    // Automatically end after 6 seconds of glorious sound
    setTimeout(() => {
       stopChorus();
       setPhase("revealed");
       setTimeout(() => {
          if (onComplete) onComplete();
       }, 1000);
    }, 6000);
  };

  const stopChorus = () => {
     if (audioCtxRef.current && oscillatorsRef.current.length > 0) {
        const ctx = audioCtxRef.current;
        oscillatorsRef.current.forEach(osc => {
           try { osc.stop(); } catch(e) {}
        });
        oscillatorsRef.current = [];
        ctx.close();
        audioCtxRef.current = null;
     }
     setIsPlaying(false);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      <AnimatePresence mode="wait">
         {phase === "intro" && (
            <motion.div
               key="intro"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, y: -50 }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 z-30 bg-zinc-950"
            >
               <h1 className="text-4xl font-black mb-6 text-center uppercase tracking-tighter">
                  The Global Chorus
               </h1>
               <p className="text-lg mb-12 text-center opacity-80 max-w-sm leading-relaxed">
                  Press and hold the button below. Hum a single, clear note for 3 seconds. Your voice will be mixed into the global chord.
               </p>
               
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onPointerDown={handlePointerDown}
                  className="w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 border-transparent shadow-[0_0_40px_rgba(255,255,255,0.1)] relative"
                  style={{ backgroundColor: primaryColor }}
               >
                  <span className="text-4xl mb-2">🎤</span>
                  <span className="font-bold tracking-widest uppercase text-sm text-white">Hold to hum</span>
               </motion.button>
            </motion.div>
         )}

         {phase === "recording" && (
            <motion.div
               key="recording"
               className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-zinc-950"
            >
               <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-8xl mb-12"
               >
                  🎤
               </motion.div>
               
               <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-8">
                  Recording Note...
               </h2>

               {/* 3s Progress Bar */}
               <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: "0%" }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 3, ease: "linear" }}
                     className="h-full"
                     style={{ backgroundColor: primaryColor }}
                  />
               </div>
            </motion.div>
         )}

         {phase === "analyzing" && (
            <motion.div
               key="analyzing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-zinc-950"
            >
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 border-4 border-zinc-800 border-t-zinc-400 rounded-full mb-8"
               />
               <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">
                  Mixing with global voices...
               </h2>
            </motion.div>
         )}

         {phase === "chorus" && (
            <motion.div
               key="chorus"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, filter: "blur(20px)" }}
               className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-zinc-950"
            >
               {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
                     {/* Generative Visualizer Particles */}
                     {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                           key={i}
                           className="absolute rounded-full mix-blend-screen"
                           style={{ backgroundColor: primaryColor }}
                           initial={{ 
                              width: Math.random() * 100 + 50,
                              height: Math.random() * 100 + 50,
                              x: 0, 
                              y: 0,
                              opacity: 0 
                           }}
                           animate={{
                              x: (Math.random() - 0.5) * 600,
                              y: (Math.random() - 0.5) * 600,
                              opacity: [0, 0.5, 0],
                              scale: [0.5, 1.5, 0.5]
                           }}
                           transition={{ 
                              duration: Math.random() * 3 + 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                           }}
                        />
                     ))}
                  </div>
               )}

               <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 text-white relative z-10">
                  Your Voice is Mixed
               </h2>

               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startChorus}
                  disabled={isPlaying}
                  className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative z-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: isPlaying ? "transparent" : primaryColor, border: isPlaying ? `4px solid ${primaryColor}` : "none" }}
               >
                  <span className="text-6xl mb-4">{isPlaying ? "🎶" : "▶️"}</span>
                  <span className="font-bold tracking-widest uppercase text-sm text-white">
                     {isPlaying ? "Experiencing Chorus..." : "Play Global Chorus"}
                  </span>
               </motion.button>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 overflow-y-auto pb-32 pt-16 px-8 flex flex-col items-center justify-center bg-zinc-950"
            >
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-700 text-center"
               >
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-3xl font-heading mb-4 text-white">
                   {config.title}
                 </h1>
                 <p className="text-base font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
