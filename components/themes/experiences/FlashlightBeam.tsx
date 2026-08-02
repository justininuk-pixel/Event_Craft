"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

export function FlashlightBeam({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"exploring" | "lights_on">("exploring");
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const distanceTravelled = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playClickSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      x.set(containerRef.current.clientWidth / 2);
      y.set(containerRef.current.clientHeight / 2);
      lastPos.current = { x: containerRef.current.clientWidth / 2, y: containerRef.current.clientHeight / 2 };
    }
  }, [x, y]);

  const handleDrag = (event: any, info: any) => {
    if (phase !== "exploring") return;
    
    const dx = info.point.x - lastPos.current.x;
    const dy = info.point.y - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    distanceTravelled.current += dist;
    lastPos.current = { x: info.point.x, y: info.point.y };

    if (distanceTravelled.current > 3000) {
      setPhase("lights_on");
      playClickSound();
      setTimeout(() => onComplete?.(), 1000);
    }
  };

  const maskImage = useMotionTemplate`radial-gradient(circle 200px at ${x}px calc(${y}px - 100px), transparent 0%, rgba(0,0,0,0.8) 70%, black 100%)`;

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center"
      ref={containerRef}
      onPointerDown={initAudio}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
        style={{ 
          backgroundColor: palette.background as string 
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Darkness Layer */}
      <motion.div 
        className="absolute inset-0 bg-black z-10 pointer-events-none"
        style={{ 
          WebkitMaskImage: maskImage, 
          maskImage: maskImage 
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "lights_on" ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Foreground Draggable Flashlight Handle */}
      {phase === "exploring" && (
        <motion.div
          drag
          dragMomentum={false}
          onDrag={handleDrag}
          style={{ x, y }}
          className="absolute z-20 w-16 h-24 rounded-full border-4 border-zinc-700 bg-zinc-800 shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing flex flex-col items-center justify-start pt-2"
          initial={{ x: '-50%', y: '-50%' }}
        >
          <div className="w-12 h-6 bg-yellow-100 rounded-t-full shadow-[0_0_20px_#fef08a]" />
          <div className="w-8 h-2 bg-red-500 rounded-full mt-4" />
        </motion.div>
      )}
      
      {phase === "exploring" && (
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-zinc-500 tracking-widest uppercase text-xs pointer-events-none z-30 drop-shadow-md animate-pulse">
          Drag flashlight to explore
        </p>
      )}

    </div>
  );
}
