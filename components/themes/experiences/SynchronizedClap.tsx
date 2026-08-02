"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Particle = {
  id: string;
  x: number;
  icon: string;
};

const ICONS = ["👏", "🙌", "🎉", "🔥", "✨"];

export function SynchronizedClap({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"clapping" | "revealed">("clapping");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [intensity, setIntensity] = useState(0); 
  
  const intensityRef = useRef(intensity);
  const phaseRef = useRef(phase);

  useEffect(() => {
    intensityRef.current = intensity;
    phaseRef.current = phase;
  }, [intensity, phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; 
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400; 
      
      const gain = ctx.createGain();
      gain.gain.value = 0; 

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
      
      noiseNodeRef.current = noise;
      noiseFilterRef.current = filter;
      noiseGainRef.current = gain;

    } catch (e) {}
  }, []);

  const playSingleClap = useCallback(() => {
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

  const handleClap = () => {
    if (phase !== "clapping") return;
    
    initAudio();
    playSingleClap();

    const newParticles: Particle[] = [];
    const count = Math.floor(Math.random() * 3) + 1;
    for(let i=0; i<count; i++) {
       newParticles.push({
         id: `p-${Date.now()}-${i}`,
         x: Math.random() * 80 + 10, 
         icon: ICONS[Math.floor(Math.random() * ICONS.length)]
       });
    }

    setParticles(prev => [...prev, ...newParticles]);
    setIntensity(prev => Math.min(100, prev + 5));

    setTimeout(() => {
       setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 2000);
  };

  useEffect(() => {
    if (phase !== "clapping") return;

    const interval = setInterval(() => {
      if (phaseRef.current !== "clapping") return;

      setIntensity(prev => {
        let next = prev;
        
        next = Math.max(0, next - 2);
        
        if (Math.random() > 0.7) {
           next = Math.min(100, next + 3);
        }

        if (noiseGainRef.current && noiseFilterRef.current && audioCtxRef.current) {
           const norm = next / 100;
           noiseGainRef.current.gain.setTargetAtTime(norm * 0.3, audioCtxRef.current.currentTime, 0.1);
           noiseFilterRef.current.frequency.setTargetAtTime(400 + (norm * 2000), audioCtxRef.current.currentTime, 0.1);
        }

        if (next >= 95) {
           setPhase("revealed");
           if (onComplete) onComplete();
           
           if (noiseGainRef.current && audioCtxRef.current) {
              noiseGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 1.0);
           }
        }

        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.stop(); } catch(e){}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.2,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(10px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/40 p-8 rounded-3xl backdrop-blur flex flex-col items-center">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-2xl border-4 border-white/10"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "clapping" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ y: '100%', opacity: 1, scale: 0.5, x: `${p.x}vw` }}
                    animate={{ y: '-20%', opacity: 0, scale: 2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute bottom-32 text-4xl"
                    style={{ left: `${p.x}%` }}
                  >
                    {p.icon}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Intensity Meter */}
            <div className="w-64 h-4 bg-zinc-800 rounded-full mb-8 overflow-hidden border border-zinc-700 relative pointer-events-none">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 origin-left"
                animate={{ scaleX: intensity / 100 }}
                transition={{ type: "tween", ease: "linear", duration: 0.2 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/50 tracking-widest uppercase">
                Global Applause
              </div>
            </div>

            {/* Clap Button */}
            <button
              onPointerDown={handleClap}
              className="pointer-events-auto relative w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] active:scale-95 transition-transform border-4 border-white/20"
            >
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-400" />
              <span className="text-white font-black text-4xl tracking-widest z-10">CLAP</span>
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
