"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function DigitalOuija({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"playing" | "revealed">("playing");
  const [spelledWord, setSpelledWord] = useState("");
  
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const touchRef = useRef<{ x: number, y: number } | null>(null);
  
  const planchetteRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playHoverSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    
    let lastTime = performance.now();
    let ghostTime = 0;

    const tick = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      ghostTime += dt;

      const ghostX = Math.sin(ghostTime * 1.5) * Math.cos(ghostTime * 0.8) * 40;
      const ghostY = Math.cos(ghostTime * 1.2) * Math.sin(ghostTime * 0.5) * 40;
      
      let forceX = ghostX;
      let forceY = ghostY;

      if (touchRef.current) {
         const dx = touchRef.current.x - posRef.current.x;
         const dy = touchRef.current.y - posRef.current.y;
         forceX += dx * 5;
         forceY += dy * 5;
      }

      velRef.current.x += forceX * dt;
      velRef.current.y += forceY * dt;
      
      velRef.current.x *= 0.95;
      velRef.current.y *= 0.95;

      posRef.current.x += velRef.current.x * dt;
      posRef.current.y += velRef.current.y * dt;

      const limit = 150;
      if (posRef.current.x > limit) posRef.current.x = limit;
      if (posRef.current.x < -limit) posRef.current.x = -limit;
      if (posRef.current.y > limit) posRef.current.y = limit;
      if (posRef.current.y < -limit) posRef.current.y = -limit;

      if (planchetteRef.current) {
         planchetteRef.current.style.transform = `translate(-50%, -50%) translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }

      animationRef.current = requestAnimationFrame(tick);
    };
    
    animationRef.current = requestAnimationFrame(tick);
    return () => {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [phase]);

  const handlePointerDown = (e: React.PointerEvent) => {
    initAudio();
    updateTouch(e);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) updateTouch(e);
  };
  const handlePointerUp = () => {
    touchRef.current = null;
  };
  
  const updateTouch = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    touchRef.current = {
      x: e.clientX - rect.left - cx,
      y: e.clientY - rect.top - cy
    };
  };

  const handleGoodbye = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-orange-950/20 touch-none select-none flex flex-col items-center justify-center font-serif text-[#e7d5b8]">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.0,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(10px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-orange-900/50">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-orange-200"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-orange-100 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-stone-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-black/50" />
            
            <h2 className="relative text-3xl font-black mb-2 tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              Digital Ouija
            </h2>
            <p className="relative text-orange-200/50 text-sm mb-8 text-center max-w-xs drop-shadow-md">
              Touch and hold to pull the planchette. Fight the spirits to spell words, or go to GOODBYE.
            </p>

            <div className="relative text-2xl font-mono tracking-[0.5em] mb-4 h-8 text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
               {spelledWord}
            </div>

            {/* Board Container */}
            <div 
              ref={containerRef}
              className="relative w-80 h-80 border-4 border-[#5a4231] rounded-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] bg-[#2c1f16] flex items-center justify-center overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
               {/* Letters Arc */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {LETTERS.map((letter, i) => {
                     const angle = -120 + (i * (240 / (LETTERS.length - 1)));
                     const rad = angle * (Math.PI / 180);
                     const r = 110;
                     const x = Math.sin(rad) * r;
                     const y = -Math.cos(rad) * r + 20;
                     return (
                        <div 
                          key={letter} 
                          className="absolute text-xl font-bold opacity-80"
                          style={{ transform: `translate(${x}px, ${y}px) rotate(${angle}deg)` }}
                        >
                           {letter}
                        </div>
                     );
                  })}
               </div>

               {/* Goodbye */}
               <button
                  onPointerDown={(e) => { e.stopPropagation(); handleGoodbye(); }}
                  className="absolute bottom-8 px-6 py-2 border-2 border-orange-900 rounded-full text-xl font-bold tracking-widest text-orange-400 hover:text-white hover:border-orange-500 hover:bg-orange-900/50 transition-all pointer-events-auto"
               >
                  GOODBYE
               </button>

               {/* Planchette */}
               <div 
                 ref={planchetteRef}
                 className="absolute left-1/2 top-1/2 w-16 h-20 -mt-2 pointer-events-none"
                 style={{ transform: 'translate(-50%, -50%)' }}
               >
                 <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                    <path d="M50 0 C10 40 10 100 50 120 C90 100 90 40 50 0 Z" fill="rgba(200, 180, 150, 0.2)" stroke="#e7d5b8" strokeWidth="4" />
                    <circle cx="50" cy="80" r="15" fill="transparent" stroke="#e7d5b8" strokeWidth="4" />
                 </svg>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
