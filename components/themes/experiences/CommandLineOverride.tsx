"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function CommandLineOverride({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"booting" | "input" | "access_granted" | "revealed">("booting");
  const [log, setLog] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playKeystroke = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playError = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, []);

  const playSuccess = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }, []);

  useEffect(() => {
    const bootSequence = [
      "INITIALIZING SYSTEM...",
      "LOADING KERNEL v4.1.2...",
      "ESTABLISHING SECURE CONNECTION...",
      "FIREWALL DETECTED.",
      "AWAITING OVERRIDE COMMAND (Hint: override)"
    ];

    let step = 0;
    const interval = setInterval(() => {
      setLog(prev => [...prev, bootSequence[step]]);
      step++;
      if (step >= bootSequence.length) {
        clearInterval(interval);
        setPhase("input");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "input") return;
    
    const cmd = inputValue.trim().toLowerCase();
    setLog(prev => [...prev, `> ${inputValue}`]);
    setInputValue("");

    if (cmd === "override") {
      setPhase("access_granted");
      playSuccess();
      setLog(prev => [...prev, "ACCESS GRANTED.", "DECRYPTING PAYLOAD..."]);
      setTimeout(() => {
        setPhase("revealed");
        onComplete?.();
      }, 1500);
    } else {
      playError();
      setLog(prev => [...prev, "ACCESS DENIED. UNRECOGNIZED COMMAND."]);
    }
  };

  const handleContainerClick = () => {
    initAudio();
    if (phase === "input") {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black select-none flex items-center justify-center">
      
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

      {/* Foreground Terminal Grid */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-start justify-start p-6 bg-zinc-950 font-mono text-green-500 overflow-y-auto overflow-x-hidden cursor-text"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
            transition={{ duration: 0.8 }}
            onClick={handleContainerClick}
            ref={containerRef}
            style={{ textShadow: '0 0 5px rgba(34,197,94,0.5)' }}
          >
            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat" />

            <div className="w-full flex flex-col gap-2 pt-12 pb-24 text-sm sm:text-base">
              {log.map((line, i) => (
                <div key={i} className="break-all opacity-90">{line}</div>
              ))}
              
              {phase === "input" && (
                <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2 w-full">
                  <span className="shrink-0">{">"}</span>
                  <input 
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={() => { initAudio(); playKeystroke(); }}
                    className="flex-1 bg-transparent outline-none border-none text-green-500 placeholder-green-900 w-full"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    placeholder="Type here..."
                  />
                </form>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
