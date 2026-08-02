"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Music, Play, Square, Loader2 } from "lucide-react";

export function ProceduralEmotionMusicBox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"]; // indigo-950

  const [input, setInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [params, setParams] = useState({ tempo: 120, key: "C Major", mood: "Neutral" });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sequenceRef = useRef<number | null>(null);

  const analyzeEmotion = (text: string) => {
     const lower = text.toLowerCase();
     let tempo = 90;
     let key = "C Major";
     let mood = "Neutral";

     if (lower.match(/sad|lonely|cry|rain|alone|depressed/)) {
        tempo = 60;
        key = "D Minor";
        mood = "Melancholy";
     } else if (lower.match(/happy|joy|sun|excited|great|awesome/)) {
        tempo = 140;
        key = "G Major";
        mood = "Euphoric";
     } else if (lower.match(/angry|mad|rage|furious|hate/)) {
        tempo = 160;
        key = "E Phrygian";
        mood = "Aggressive";
     } else if (lower.match(/calm|peace|sleep|quiet|relax/)) {
        tempo = 50;
        key = "F Lydian";
        mood = "Tranquil";
     }

     return { tempo, key, mood };
  };

  const playProceduralMusic = (p: { tempo: number, key: string, mood: string }) => {
     if (!window.AudioContext && !(window as any).webkitAudioContext) return;
     
     const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
     const ctx = new AudioContextClass();
     audioCtxRef.current = ctx;

     // Synthesize a very simple sequence based on tempo
     const intervalMs = (60 / p.tempo) * 1000;
     
     const playNote = () => {
        if (!isPlaying && !audioCtxRef.current) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Simple scale mapping
        let baseFreq = 261.63; // C4
        if (p.key.includes("Minor")) baseFreq = 293.66; // D4
        if (p.key.includes("Phrygian")) baseFreq = 329.63; // E4
        if (p.key.includes("Lydian")) baseFreq = 349.23; // F4
        if (p.key.includes("G Major")) baseFreq = 392.00; // G4

        // Random note in the triad/scale
        const mults = [1, 1.2, 1.5, 2];
        const freq = baseFreq * mults[Math.floor(Math.random() * mults.length)];

        osc.type = p.mood === "Aggressive" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (intervalMs/1000) * 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + (intervalMs/1000));

        sequenceRef.current = window.setTimeout(playNote, intervalMs);
     };

     playNote();
  };

  const handleStart = () => {
     if (!input.trim() || isAnalyzing || isPlaying) return;

     setIsAnalyzing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const p = analyzeEmotion(input);
        setParams(p);
        setIsAnalyzing(false);
        setIsPlaying(true);
        playProceduralMusic(p);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
     }, 1500);
  };

  const handleStop = () => {
     setIsPlaying(false);
     if (sequenceRef.current) clearTimeout(sequenceRef.current);
     if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
     }
     if (onComplete) setTimeout(onComplete, 2000);
  };

  useEffect(() => {
     return () => handleStop(); // Cleanup
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-indigo-950 text-indigo-100" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-indigo-900/50 bg-indigo-950/80 backdrop-blur-md">
         <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex justify-center items-center gap-2">
            <Music size={16} /> Procedural Audio
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto z-10">
         
         <div className="w-full bg-indigo-900/30 border border-indigo-800/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* Spinning Vinyl Background Graphic */}
            <motion.div 
               className="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[20px] border-indigo-900/20 opacity-30 pointer-events-none"
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 60 / params.tempo, repeat: Infinity, ease: "linear" }}
            />

            {!isPlaying && !isAnalyzing ? (
               <div className="relative z-10 space-y-6">
                  <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2 block">Describe an emotion</label>
                     <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="e.g. Waking up to the sound of heavy rain..."
                        className="w-full h-24 bg-indigo-950/50 text-indigo-200 border border-indigo-800 rounded-xl p-4 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                     />
                  </div>
                  <button 
                     onClick={handleStart}
                     disabled={!input.trim()}
                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-500/50 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all"
                  >
                     <Play size={16} fill="currentColor" /> Generate MIDI Sequence
                  </button>
               </div>
            ) : isAnalyzing ? (
               <div className="relative z-10 flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <div className="text-[10px] uppercase tracking-widest text-indigo-400">Performing NLP Sentiment Analysis</div>
               </div>
            ) : (
               <div className="relative z-10 flex flex-col items-center py-4">
                  
                  <div className="text-[10px] uppercase tracking-widest text-indigo-400 mb-6 text-center">
                     <span className="opacity-50">Input:</span> "{input.substring(0,30)}..."
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full mb-8">
                     <div className="bg-indigo-950/50 rounded-lg p-3 text-center border border-indigo-800/50">
                        <div className="text-[9px] uppercase tracking-widest text-indigo-500 mb-1">Tempo</div>
                        <div className="text-lg font-black text-indigo-200">{params.tempo}</div>
                     </div>
                     <div className="bg-indigo-950/50 rounded-lg p-3 text-center border border-indigo-800/50">
                        <div className="text-[9px] uppercase tracking-widest text-indigo-500 mb-1">Key</div>
                        <div className="text-lg font-black text-indigo-200">{params.key}</div>
                     </div>
                     <div className="bg-indigo-950/50 rounded-lg p-3 text-center border border-indigo-800/50">
                        <div className="text-[9px] uppercase tracking-widest text-indigo-500 mb-1">Valence</div>
                        <div className="text-lg font-black text-indigo-200">{params.mood}</div>
                     </div>
                  </div>

                  {/* Visualizer bars */}
                  <div className="flex gap-1 h-16 items-end justify-center w-full mb-8">
                     {Array.from({length: 20}).map((_, i) => (
                        <motion.div 
                           key={i}
                           className="w-2 bg-indigo-500 rounded-t-sm opacity-80"
                           animate={{ height: Math.random() * 64 + 4 }}
                           transition={{ 
                              duration: (60 / params.tempo) / 2, 
                              repeat: Infinity, 
                              repeatType: "reverse",
                              delay: i * 0.05
                           }}
                        />
                     ))}
                  </div>

                  <button 
                     onClick={handleStop}
                     className="w-full py-4 bg-indigo-950 hover:bg-indigo-900 text-red-400 border border-red-900/50 rounded-xl font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all"
                  >
                     <Square size={16} fill="currentColor" /> Stop Playback
                  </button>

               </div>
            )}

         </div>

      </div>

    </div>
  );
}
