"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Music, Play, Square } from "lucide-react";

export function DataSonifier({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const data = [10, 15, 20, 12, 8, 30, 45, 50, 40, 25, 20, 35]; // e.g. Monthly sales
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = (value: number) => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     const ctx = audioCtxRef.current;
     if (ctx.state === 'suspended') ctx.resume();

     const osc = ctx.createOscillator();
     const gainNode = ctx.createGain();

     // Map data value to frequency (e.g., 200Hz to 800Hz)
     const norm = (value - minVal) / (maxVal - minVal);
     const freq = 200 + (norm * 600);
     
     osc.type = "sine";
     osc.frequency.setValueAtTime(freq, ctx.currentTime);
     
     // Envelope
     gainNode.gain.setValueAtTime(0, ctx.currentTime);
     gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
     gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

     osc.connect(gainNode);
     gainNode.connect(ctx.destination);
     
     osc.start();
     osc.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
     if (!isPlaying) return;

     let i = 0;
     setCurrentIndex(0);
     playNote(data[0]);

     const interval = setInterval(() => {
        i++;
        if (i >= data.length) {
           setIsPlaying(false);
           setCurrentIndex(-1);
           clearInterval(interval);
           if (onComplete) setTimeout(onComplete, 3000);
           return;
        }
        setCurrentIndex(i);
        playNote(data[i]);
     }, 400); // 400ms per data point

     return () => clearInterval(interval);
  }, [isPlaying, onComplete]);

  const togglePlay = () => {
     if (isPlaying) {
        setIsPlaying(false);
        setCurrentIndex(-1);
     } else {
        setIsPlaying(true);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-950 text-emerald-400 p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(16, 185, 129, .3) 25%, rgba(16, 185, 129, .3) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .3) 75%, rgba(16, 185, 129, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 185, 129, .3) 25%, rgba(16, 185, 129, .3) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .3) 75%, rgba(16, 185, 129, .3) 76%, transparent 77%, transparent)', backgroundSize: '40px 40px' }} />

      <div className="text-center z-10 flex flex-col items-center">
         <Music size={24} className="mb-2 opacity-80" />
         <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Data Sonification</h2>
         <p className="text-[10px] text-emerald-800 mt-1 font-mono">12-Month Array -&gt; Oscillator Frequencies</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
         
         <div className="w-full max-w-md h-64 bg-slate-900 border-2 border-emerald-900 rounded-xl p-4 flex items-end justify-between gap-1 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
            
            {/* The Bars */}
            {data.map((val, i) => {
               const heightPct = (val / maxVal) * 100;
               const isActive = currentIndex === i;
               return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                     <div 
                        className={`w-full transition-all duration-75 ${isActive ? 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'bg-emerald-900'}`}
                        style={{ height: `${heightPct}%` }}
                     />
                     <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono transition-opacity ${isActive ? 'opacity-100 text-emerald-400' : 'opacity-0 text-emerald-700'}`}>
                        {val}
                     </span>
                  </div>
               );
            })}

            {/* Scanning line */}
            <motion.div 
               className="absolute top-0 bottom-0 w-px bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,1)]"
               initial={{ left: "0%" }}
               animate={{ left: isPlaying ? "100%" : "0%" }}
               transition={{ duration: isPlaying ? data.length * 0.4 : 0, ease: "linear" }}
               style={{ display: isPlaying ? "block" : "none" }}
            />
         </div>

         <button 
            onClick={togglePlay}
            className={`mt-12 px-8 py-4 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
               isPlaying 
               ? 'bg-slate-800 text-emerald-600 border border-emerald-900' 
               : 'bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
            }`}
         >
            {isPlaying ? <><Square size={16} fill="currentColor" /> Stop Sonification</> : <><Play size={16} fill="currentColor" /> Play Dataset</>}
         </button>

      </div>

    </div>
  );
}
