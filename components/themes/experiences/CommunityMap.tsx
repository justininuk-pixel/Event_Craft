"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Pin = {
  id: string;
  x: number; 
  y: number; 
  isMe: boolean;
};

export function CommunityMap({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"viewing" | "revealed">("viewing");
  const [myPin, setMyPin] = useState<Pin | null>(null);
  const [otherPins, setOtherPins] = useState<Pin[]>([]);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playThunk = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "viewing") return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    initAudio();
    playThunk();

    setMyPin({ id: "me", x, y, isMe: true });
    
    setTimeout(() => {
       setPhase("revealed");
       if (onComplete) onComplete();
    }, 1000);
  };

  useEffect(() => {
    if (phase === "revealed") return;

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setOtherPins(prev => [
           ...prev,
           {
              id: Date.now().toString(),
              x: Math.random() * 80 + 10, 
              y: Math.random() * 80 + 10,
              isMe: false
           }
        ].slice(-20)); 
      }
    }, 800);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* The Map Background */}
      <div 
        className="absolute inset-0 cursor-crosshair z-0"
        onPointerDown={handleMapClick}
      >
        <div className="absolute inset-0 opacity-20" style={{
           backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)',
           backgroundSize: '20px 20px'
        }} />

        <div className="absolute top-[30%] left-[20%] w-[30%] h-[40%] bg-slate-800/30 blur-2xl rounded-[100%]" />
        <div className="absolute top-[20%] left-[60%] w-[25%] h-[50%] bg-slate-800/30 blur-2xl rounded-[100%]" />
        <div className="absolute top-[60%] left-[70%] w-[15%] h-[20%] bg-slate-800/30 blur-2xl rounded-[100%]" />

        {/* Pins */}
        <AnimatePresence>
           {otherPins.map(pin => (
             <motion.div
               key={pin.id}
               initial={{ y: -20, opacity: 0, scale: 0 }}
               animate={{ y: 0, opacity: 1, scale: 1 }}
               className="absolute w-3 h-3 bg-slate-500 rounded-full shadow-[0_0_10px_rgba(100,116,139,0.8)]"
               style={{ left: `calc(${pin.x}% - 6px)`, top: `calc(${pin.y}% - 6px)` }}
             />
           ))}
        </AnimatePresence>

        {myPin && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="absolute w-6 h-6 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(244,63,94,1)] z-10"
            style={{ left: `calc(${myPin.x}% - 12px)`, top: `calc(${myPin.y}% - 12px)` }}
          >
             <div className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-50" />
          </motion.div>
        )}
      </div>

      {/* Foreground UI / Instructions */}
      <AnimatePresence>
        {phase === "viewing" && (
          <motion.div 
            className="absolute top-12 left-0 w-full flex justify-center pointer-events-none z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-6 py-3 rounded-full text-slate-200 font-bold tracking-widest shadow-xl flex items-center gap-3">
              <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
              DROP YOUR PIN TO UNLOCK
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-20 pointer-events-none"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur-md flex flex-col items-center border border-slate-700 pointer-events-auto shadow-2xl">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded border-4 border-slate-400"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-slate-200 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>
      
    </div>
  );
}
