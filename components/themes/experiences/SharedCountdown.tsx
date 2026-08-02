"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type LogEntry = {
  id: string;
  name: string;
  action: "+1 HOUR" | "-1 HOUR";
};

export function SharedCountdown({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"waiting" | "revealed">("waiting");
  
  const [targetTime, setTargetTime] = useState(() => Date.now() + (2 * 60 * 60 * 1000));
  const [now, setNow] = useState(() => Date.now());
  const [logs, setLogs] = useState<LogEntry[]>([]);

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

  const playClick = useCallback((isDown: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(isDown ? 300 : 600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isDown ? 150 : 300, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playAlarm = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    
    for(let i=0; i<4; i++) {
       gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + i*0.5 + 0.1);
       gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i*0.5 + 0.4);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  }, []);

  useEffect(() => {
    if (phase !== "waiting") return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      
      if (phaseRef.current === "waiting") {
        setTargetTime(prev => {
          if (prev <= current) {
             setPhase("revealed");
             playAlarm();
             if (onComplete) onComplete();
          }
          return prev;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase, playAlarm, onComplete]);

  useEffect(() => {
    if (phase !== "waiting") return;

    const mockNames = ["Guest_912", "TimeLord", "AgentX", "Anon", "TrollMaster"];

    const interval = setInterval(() => {
      if (phaseRef.current !== "waiting") return;
      if (Math.random() > 0.6) {
        const isUp = Math.random() > 0.3; 
        const action = (isUp ? "+1 HOUR" : "-1 HOUR") as "+1 HOUR" | "-1 HOUR";
        const amt = isUp ? 3600000 : -3600000;
        
        setTargetTime(prev => prev + amt);
        setLogs(prev => [
           { id: Date.now().toString(), name: mockNames[Math.floor(Math.random()*mockNames.length)], action },
           ...prev
        ].slice(0, 5));
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [phase]);

  const handleModify = (amt: number, label: "+1 HOUR" | "-1 HOUR") => {
    if (phase !== "waiting") return;
    initAudio();
    playClick(amt < 0);
    
    setTargetTime(prev => prev + amt);
    setLogs(prev => [
       { id: Date.now().toString(), name: "You", action: label },
       ...prev
    ].slice(0, 5));
  };

  const timeLeft = Math.max(0, targetTime - now);
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const ms = Math.floor((timeLeft % 1000) / 10);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center justify-center font-mono text-zinc-100">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-2xl border-4 border-white/20"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-300 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "waiting" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8 }}
          >
            
            <div className="mb-4 text-zinc-500 uppercase tracking-widest text-sm text-center">
              Time Remaining
              <br/>
              <span className="text-[10px]">(Fight the crowd to reach 00:00:00)</span>
            </div>

            {/* Giant Clock Face */}
            <div className="text-6xl md:text-8xl font-black mb-12 font-mono flex items-baseline tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span>{hours.toString().padStart(2, '0')}</span>
              <span className="text-zinc-500 animate-pulse">:</span>
              <span>{mins.toString().padStart(2, '0')}</span>
              <span className="text-zinc-500 animate-pulse">:</span>
              <span>{secs.toString().padStart(2, '0')}</span>
              <span className="text-2xl md:text-4xl text-emerald-400 ml-2 w-12 text-left">.{ms.toString().padStart(2, '0')}</span>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-12 pointer-events-auto">
              <button
                onPointerDown={() => handleModify(-3600000, "-1 HOUR")}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-[0_10px_0_#047857] active:shadow-none active:translate-y-[10px] transition-all flex flex-col items-center justify-center font-black text-white text-2xl md:text-3xl border-4 border-emerald-400"
              >
                -1<br/><span className="text-sm tracking-widest">HOUR</span>
              </button>
              
              <button
                onPointerDown={() => handleModify(3600000, "+1 HOUR")}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-[0_10px_0_#be123c] active:shadow-none active:translate-y-[10px] transition-all flex flex-col items-center justify-center font-black text-white text-2xl md:text-3xl border-4 border-rose-400"
              >
                +1<br/><span className="text-sm tracking-widest">HOUR</span>
              </button>
            </div>

            {/* Log */}
            <div 
              className="w-full max-w-sm h-32 overflow-hidden flex flex-col gap-2 relative"
              style={{ maskImage: 'linear-gradient(to bottom, white 20%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, white 20%, transparent)' }}
            >
              <AnimatePresence>
                {logs.map(log => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className="flex justify-between items-center text-xs bg-zinc-900/50 p-2 rounded"
                  >
                    <span className="text-zinc-400 font-bold">{log.name}</span>
                    <span className={log.action === "-1 HOUR" ? "text-emerald-400 font-black" : "text-rose-400 font-black"}>
                      {log.action}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
