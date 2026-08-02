"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export function VaultDoor({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"locked" | "unlocked" | "opened">("locked");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const isDraggingWheel = useRef(false);
  const lastAngle = useRef<number | null>(null);
  const totalRotation = useRef(0);
  const [renderRotation, setRenderRotation] = useState(0);

  const doorX = useMotionValue(0);
  const doorProgress = useTransform(doorX, [0, 500], [0, 1]); 

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playClank = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const playClick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  useEffect(() => {
    const unsub = doorProgress.on("change", (latest) => {
      if (latest > 0.8 && phase === "unlocked") {
        setPhase("opened");
        onComplete?.();
      }
    });
    return () => unsub();
  }, [doorProgress, phase, onComplete]);

  const handleWheelPointerDown = (e: React.PointerEvent) => {
    if (phase !== "locked") return;
    initAudio();
    isDraggingWheel.current = true;
    
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      lastAngle.current = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    }
  };

  const handleWheelPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingWheel.current || phase !== "locked" || lastAngle.current === null) return;
    
    if (wheelRef.current) {
      const rect = wheelRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      
      let delta = angle - lastAngle.current;
      
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      totalRotation.current += delta;
      lastAngle.current = angle;

      setRenderRotation(totalRotation.current);

      if (Math.abs(totalRotation.current % 30) < Math.abs(delta)) {
        playClick();
      }

      if (totalRotation.current > 720 || totalRotation.current < -720) {
        setPhase("unlocked");
        playClank();
        isDraggingWheel.current = false;
      }
    }
  };

  const handleWheelPointerUp = () => {
    isDraggingWheel.current = false;
    lastAngle.current = null;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center"
      ref={containerRef}
      onPointerMove={handleWheelPointerMove}
      onPointerUp={handleWheelPointerUp}
      onPointerCancel={handleWheelPointerUp}
      onPointerLeave={handleWheelPointerUp}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "opened" ? 1 : 0,
          transform: phase === "opened" ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Vault Door Layer */}
      <AnimatePresence>
        {phase !== "opened" && (
          <motion.div 
            className="absolute inset-0 z-20"
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 1, ease: "easeIn" }}
            drag={phase === "unlocked" ? "x" : false}
            dragConstraints={{ left: 0, right: 1000 }}
            dragElastic={0}
            dragMomentum={false}
            style={{ x: doorX }}
            onPointerDown={() => initAudio()}
          >
            {/* The Door Material */}
            <div className="absolute inset-0 bg-zinc-800 shadow-[inset_10px_0_20px_rgba(255,255,255,0.1),_inset_-10px_0_20px_rgba(0,0,0,0.5)] border-l-8 border-zinc-700 flex items-center justify-center">
              
              {/* Texture */}
              <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }} />

              {/* The Wheel */}
              <motion.div 
                ref={wheelRef}
                className={`w-64 h-64 rounded-full border-8 border-zinc-600 bg-zinc-700 shadow-[0_10px_30px_rgba(0,0,0,0.8),_inset_0_5px_15px_rgba(255,255,255,0.2)] flex items-center justify-center relative ${phase === 'locked' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ rotate: renderRotation }}
                onPointerDown={handleWheelPointerDown}
              >
                {/* Center Hub */}
                <div className="w-16 h-16 rounded-full bg-zinc-500 border-4 border-zinc-400 shadow-xl z-10" />
                
                {/* Spokes */}
                {[0, 45, 90, 135].map(deg => (
                  <div key={deg} className="absolute w-full h-4 bg-zinc-500 shadow-md border-y border-zinc-400/50" style={{ transform: `rotate(${deg}deg)` }} />
                ))}

                {/* Handles on the outer edge */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <div key={deg} className="absolute w-8 h-8 rounded-full bg-zinc-400 border-2 border-zinc-300 shadow-lg" style={{ 
                    transform: `rotate(${deg}deg) translateX(128px) rotate(-${deg}deg)` 
                  }} />
                ))}
              </motion.div>

              {/* Status Indicator */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${phase === 'locked' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-zinc-800'}`} />
                <div className={`w-4 h-4 rounded-full ${phase === 'unlocked' ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-zinc-800'}`} />
              </div>

              <p className="absolute bottom-1/4 left-1/2 -translate-x-1/2 font-mono text-zinc-400 tracking-widest uppercase text-sm pointer-events-none drop-shadow-md animate-pulse">
                {phase === "locked" ? "Spin to unlock" : "Drag to open"}
              </p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
