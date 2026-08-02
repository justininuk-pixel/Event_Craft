"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Users } from "lucide-react";

// Simple frequencies for C4 to B4 (Local) and C5 to B5 (Remote/Mock)
const NOTES = {
   "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
   "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
};

const LOCAL_KEYS = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];
const REMOTE_KEYS = ["C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"];

export function TwoPlayerPiano({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"]; // indigo-950

  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ [key: string]: { osc: OscillatorNode, gain: GainNode } }>({});

  const targetChord = ["C4", "E4", "G4", "C5"]; // C major split

  useEffect(() => {
     // Check unlock condition
     const isChordPlayed = targetChord.every(note => activeKeys.has(note));
     if (isChordPlayed && !unlocked) {
        setUnlocked(true);
    onComplete?.();
        if (onComplete) {
           setTimeout(onComplete, 5000);
        }
     }
  }, [activeKeys, unlocked, onComplete, targetChord]);

  const getAudioCtx = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
     }
     return audioCtxRef.current;
  };

  const playNote = (note: string) => {
     if (activeKeys.has(note)) return;
     setActiveKeys(prev => new Set(prev).add(note));

     try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Soft synth piano sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(NOTES[note as keyof typeof NOTES], ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05); // quick attack
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2); // decay

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorsRef.current[note] = { osc, gain };
     } catch (e) {
        console.error("Audio playback failed", e);
     }
  };

  const stopNote = (note: string) => {
     setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
     });

     try {
        const ctx = getAudioCtx();
        const nodes = oscillatorsRef.current[note];
        if (nodes) {
           nodes.gain.gain.cancelScheduledValues(ctx.currentTime);
           nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, ctx.currentTime);
           nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
           nodes.osc.stop(ctx.currentTime + 0.1);
           delete oscillatorsRef.current[note];
        }
     } catch (e) {}
  };

  // Mock remote player for demo
  useEffect(() => {
     if (mode === "editor-preview" && !unlocked) {
        const interval = setInterval(() => {
           // Randomly play remote target notes
           const remoteTargets = targetChord.filter(n => REMOTE_KEYS.includes(n));
           if (remoteTargets.length > 0) {
              const note = remoteTargets[Math.floor(Math.random() * remoteTargets.length)];
              playNote(note);
              setTimeout(() => stopNote(note), 1000);
           }
        }, 3000);
        return () => clearInterval(interval);
     }
  }, [mode, unlocked]);

  const renderKey = (note: string, isRemote: boolean) => {
     const isSharp = note.includes("#");
     const isActive = activeKeys.has(note);
     const isTarget = targetChord.includes(note);
     
     // Very basic piano layout math for demo
     const isWhite = !isSharp;
     
     return (
        <div 
           key={note}
           onPointerDown={(e) => { e.preventDefault(); !isRemote && playNote(note); }}
           onPointerUp={(e) => { e.preventDefault(); !isRemote && stopNote(note); }}
           onPointerLeave={(e) => { e.preventDefault(); !isRemote && stopNote(note); }}
           className={`
              relative flex-shrink-0 cursor-pointer select-none border border-slate-300 transition-colors
              ${isWhite ? 'w-12 h-40 bg-white rounded-b-md z-0' : 'w-8 h-24 bg-slate-900 rounded-b-sm -ml-4 -mr-4 z-10'}
              ${isActive ? (isWhite ? 'bg-slate-200' : 'bg-slate-700') : ''}
              ${isRemote && !isActive ? 'opacity-50 pointer-events-none' : ''}
           `}
        >
           {/* Hint dots for target chord */}
           {isTarget && (
              <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isWhite ? 'bg-violet-500' : 'bg-white'} ${isActive ? 'animate-ping' : ''}`} />
           )}
        </div>
     );
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
         
         <AnimatePresence mode="wait">
            {!unlocked ? (
               <motion.div
                  key="playing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="w-full max-w-2xl flex flex-col items-center"
               >
                  <div className="flex items-center gap-4 mb-12">
                     <Users size={32} className="text-violet-400" />
                     <h2 className="text-2xl font-black text-white">
                        Two-Player Piano
                     </h2>
                  </div>

                  <p className="text-white/60 mb-8 font-medium text-center">
                     Play the chord together to unlock the message.
                  </p>

                  <div className="flex flex-col gap-12 w-full max-w-full overflow-x-auto pb-8 items-center">
                     
                     {/* Remote Piano */}
                     <div className="flex flex-col items-center">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                           Partner's Keys (High Octave)
                        </div>
                        <div className="flex bg-slate-800 p-2 rounded-lg shadow-inner">
                           {REMOTE_KEYS.map(k => renderKey(k, true))}
                        </div>
                     </div>

                     {/* Local Piano */}
                     <div className="flex flex-col items-center">
                        <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">
                           Your Keys (Low Octave)
                        </div>
                        <div className="flex bg-slate-800 p-2 rounded-lg shadow-2xl">
                           {LOCAL_KEYS.map(k => renderKey(k, false))}
                        </div>
                     </div>

                  </div>

               </motion.div>
            ) : (
               <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center relative border-4"
                  style={{ borderColor: primaryColor }}
               >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center text-white" style={{ borderColor: primaryColor, backgroundColor: primaryColor }}>
                     <Music size={32} />
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mt-8 mb-4">
                     Perfect Harmony.
                  </h3>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed">
                     {config.body || "We are better when we play together."}
                  </p>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
