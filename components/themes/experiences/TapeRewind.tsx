"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function TapeRewind({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"finished" | "rewinding" | "playing" | "revealed">("finished");
  const [progress, setProgress] = useState(100); 
  const isRewinding = useRef(false);
  const rafRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.value = 1200;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {}
  }, []);

  const startRewindSound = () => {
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    if (gainRef.current && oscRef.current) {
      gainRef.current.gain.setTargetAtTime(0.05, audioCtxRef.current!.currentTime, 0.1);
      
      const modulate = () => {
        if (!isRewinding.current || !oscRef.current) return;
        oscRef.current.frequency.setTargetAtTime(1200 + Math.random() * 800, audioCtxRef.current!.currentTime, 0.05);
        setTimeout(modulate, 50);
      };
      modulate();
    }
  };

  const stopRewindSound = () => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const playClunk = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handlePointerDown = () => {
    if (phase === "playing" || phase === "revealed") return;
    initAudio();
    isRewinding.current = true;
    setPhase("rewinding");
    startRewindSound();
    playClunk();
  };

  const handlePointerUp = () => {
    if (phase === "playing" || phase === "revealed") return;
    isRewinding.current = false;
    setPhase("finished");
    stopRewindSound();
    playClunk();
  };

  useEffect(() => {
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (isRewinding.current) {
        setProgress(prev => {
          const next = prev - (dt * 0.05); 
          if (next <= 0) {
            isRewinding.current = false;
            setPhase("playing");
            stopRewindSound();
            playClunk();
            setTimeout(() => {
              setPhase("revealed");
              onComplete?.();
            }, 1000);
            return 0;
          }
          return next;
        });
      }
      
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopRewindSound();
    };
  }, [onComplete]);

  const timeTotalSeconds = 5 * 60; 
  const currentSeconds = Math.floor((progress / 100) * timeTotalSeconds);
  const displayMins = Math.floor(currentSeconds / 60).toString().padStart(2, '0');
  const displaySecs = (currentSeconds % 60).toString().padStart(2, '0');

  const leftSpoolScale = 0.5 + (1 - (progress / 100)) * 0.5;
  const rightSpoolScale = 0.5 + (progress / 100) * 0.5;
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Cassette UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900 p-4"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, ease: "easeIn" }}
          >
            
            {/* The Cassette Tape */}
            <div className="w-full max-w-md aspect-[3/2] bg-zinc-800 rounded-xl border-4 border-zinc-700 shadow-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-x-8 inset-y-6 bg-[var(--exp-primary)] rounded-lg shadow-inner flex flex-col items-center opacity-80" />
              
              <div className="z-10 font-mono text-zinc-900 text-lg font-bold mb-4 uppercase mix-blend-color-burn">
                Mix Tape
              </div>

              {/* The spools window */}
              <div className="z-10 w-3/4 h-24 bg-zinc-900/50 border-2 border-zinc-900 rounded-full flex items-center justify-between px-6 shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)]">
                
                {/* Left Spool */}
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <motion.div 
                    className="absolute rounded-full bg-zinc-800"
                    style={{ width: 64, height: 64, scale: leftSpoolScale }}
                  />
                  <motion.div 
                    className="w-10 h-10 border-4 border-white/80 rounded-full flex items-center justify-center relative z-10"
                    animate={phase === 'rewinding' ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
                  >
                    {[0, 60, 120].map(deg => (
                      <div key={deg} className="absolute w-10 h-1 bg-white/80" style={{ transform: `rotate(${deg}deg)` }} />
                    ))}
                    <div className="w-3 h-3 bg-zinc-900 rounded-full z-20" />
                  </motion.div>
                </div>

                {/* Right Spool */}
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <motion.div 
                    className="absolute rounded-full bg-zinc-800"
                    style={{ width: 64, height: 64, scale: rightSpoolScale }}
                  />
                  <motion.div 
                    className="w-10 h-10 border-4 border-white/80 rounded-full flex items-center justify-center relative z-10"
                    animate={phase === 'rewinding' ? { rotate: -360 } : { rotate: 0 }}
                    transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
                  >
                    {[0, 60, 120].map(deg => (
                      <div key={deg} className="absolute w-10 h-1 bg-white/80" style={{ transform: `rotate(${deg}deg)` }} />
                    ))}
                    <div className="w-3 h-3 bg-zinc-900 rounded-full z-20" />
                  </motion.div>
                </div>

              </div>
              
              <div className="z-10 mt-2 font-mono text-zinc-900 text-xs font-bold opacity-50 mix-blend-color-burn">
                90 MIN
              </div>
            </div>

            {/* Time Counter */}
            <div className="mt-12 bg-black px-6 py-2 rounded-lg border-2 border-zinc-700 shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
              <span className={`font-mono text-4xl tracking-widest ${phase === 'playing' ? 'text-green-500 shadow-[0_0_10px_#22c55e]' : 'text-red-500 shadow-[0_0_10px_#ef4444]'}`}>
                {displayMins}:{displaySecs}
              </span>
            </div>

            {/* Controls */}
            <div className="mt-12 flex gap-4">
              <button 
                className="w-32 h-16 bg-zinc-700 border-b-8 border-zinc-900 rounded-lg active:border-b-0 active:translate-y-2 transition-all font-mono text-zinc-300 font-bold uppercase select-none flex items-center justify-center"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="flex gap-1 pointer-events-none">
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-zinc-300" />
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-zinc-300" />
                </div>
              </button>
            </div>
            
            <p className="mt-8 font-mono text-zinc-500 uppercase text-sm animate-pulse pointer-events-none">
              {progress > 0 ? "Hold to rewind tape" : "Playing..."}
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
