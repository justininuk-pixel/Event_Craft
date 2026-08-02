"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function GroupVirtualPet({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"alive" | "dead" | "revealed">("alive");
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(80);
  const [petState, setPetState] = useState<"idle" | "eating" | "playing">("idle");
  const [ghostActions, setGhostActions] = useState<{id: string, text: string, type: 'feed'|'play'}[]>([]);

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

  const playSound = useCallback((type: "eating" | "playing" | "die") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === "eating") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(400, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "playing") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    }
  }, []);

  useEffect(() => {
    if (phase !== "alive") return;

    const interval = setInterval(() => {
      if (phaseRef.current !== "alive") return;
      
      setHunger(h => {
        const next = Math.max(0, h - 1.5);
        if (next === 0) setPhase("dead");
        return next;
      });
      
      setHappiness(h => {
        const next = Math.max(0, h - 1.0);
        if (next === 0) setPhase("dead");
        return next;
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "alive") return;
    
    const interval = setInterval(() => {
       if (Math.random() > 0.6) {
          const isFeed = Math.random() > 0.5;
          if (isFeed) {
             setHunger(h => Math.min(100, h + 10));
          } else {
             setHappiness(h => Math.min(100, h + 10));
          }
          
          const text = isFeed ? "Guest_45 fed the pet" : "Anon played with the pet";
          const newAction = { id: Date.now().toString(), text, type: isFeed ? 'feed' as const : 'play' as const };
          setGhostActions(prev => [newAction, ...prev].slice(0, 3));
       }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "dead") {
       initAudio();
       playSound("die");
    }
  }, [phase, playSound, initAudio]);

  const handleAction = (type: "feed" | "play") => {
    if (phase !== "alive") return;
    initAudio();
    
    if (type === "feed") {
       setHunger(h => Math.min(100, h + 20));
       setPetState("eating");
       playSound("eating");
    } else {
       setHappiness(h => Math.min(100, h + 20));
       setPetState("playing");
       playSound("playing");
    }

    setTimeout(() => {
       setPetState("idle");
    }, 1000);
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
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
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">The Virtual Pet</h2>
            <p className="text-zinc-400 text-sm mb-12 text-center max-w-xs">
              Don't let the meters hit zero, or the content is locked forever.
            </p>

            {/* Meters */}
            <div className="w-full max-w-xs space-y-4 mb-12">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 font-bold mb-1 uppercase tracking-widest">
                  <span>Hunger</span>
                  <span>{Math.floor(hunger)}%</span>
                </div>
                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    animate={{ width: `${hunger}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-zinc-400 font-bold mb-1 uppercase tracking-widest">
                  <span>Happiness</span>
                  <span>{Math.floor(happiness)}%</span>
                </div>
                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <motion.div 
                    className="h-full bg-amber-400"
                    animate={{ width: `${happiness}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Pet Sprite */}
            <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
              {phase === "alive" ? (
                <motion.div
                  className="text-8xl"
                  animate={{
                     y: petState === "playing" ? [0, -30, 0] : (petState === "eating" ? [0, 5, 0, 5, 0] : [0, -10, 0]),
                     rotate: petState === "playing" ? [0, 15, -15, 0] : 0,
                     scale: petState === "eating" ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                     duration: petState === "idle" ? 2 : 0.5,
                     repeat: petState === "idle" ? Infinity : 1,
                     ease: "easeInOut"
                  }}
                >
                  👾
                </motion.div>
              ) : (
                <motion.div
                  className="text-8xl opacity-50 filter grayscale"
                  initial={{ opacity: 1, scale: 1, y: 0 }}
                  animate={{ opacity: 0, scale: 0.5, y: -50 }}
                  transition={{ duration: 2 }}
                >
                  👻
                </motion.div>
              )}

              {/* Ghost actions log */}
              <div className="absolute top-0 right-0 w-48 text-right pointer-events-none text-xs flex flex-col gap-1 items-end">
                 <AnimatePresence>
                    {ghostActions.map(action => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: 20, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`px-2 py-1 rounded bg-black/50 backdrop-blur font-bold ${action.type === 'feed' ? 'text-emerald-400' : 'text-amber-400'}`}
                      >
                        {action.text}
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            {phase === "alive" ? (
              <div className="flex gap-4 mb-8">
                <button
                  onPointerDown={() => handleAction("feed")}
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 transition-all font-black text-white text-xl border-b-4 border-emerald-800 active:border-b-0"
                >
                  🍖 Feed
                </button>
                <button
                  onPointerDown={() => handleAction("play")}
                  className="px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 active:scale-95 transition-all font-black text-amber-950 text-xl border-b-4 border-amber-700 active:border-b-0"
                >
                  🎾 Play
                </button>
              </div>
            ) : (
              <div className="text-rose-500 font-black text-2xl mb-8 uppercase tracking-widest text-center">
                The pet ran away. <br/>Content Locked.
              </div>
            )}

            <button
              onClick={handleReveal}
              className="text-zinc-500 hover:text-white transition-colors text-sm font-bold tracking-widest border border-zinc-700 px-6 py-3 rounded-full hover:bg-zinc-800"
            >
              SKIP / REVEAL CONTENT
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
