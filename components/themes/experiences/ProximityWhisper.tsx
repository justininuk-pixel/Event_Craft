"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Ear, EyeOff, Mic, PlayCircle } from "lucide-react";

export function ProximityWhisper({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isNear, setIsNear] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
     // Mocking proximity sensor API which is largely defunct on modern web
     // We will use a mock listener for the editor, or a mouseenter/leave on a dark overlay
     const handleUserProximity = (e: any) => {
        setIsNear(e.near);
     };

     if ('onuserproximity' in window) {
        window.addEventListener('userproximity', handleUserProximity);
     }

     return () => {
        if ('onuserproximity' in window) {
           window.removeEventListener('userproximity', handleUserProximity);
        }
     };
  }, []);

  const triggerMockProximity = (state: boolean) => {
     setIsNear(state);
  };

  useEffect(() => {
     if (isNear) {
        startWhisper();
     } else {
        stopWhisper();
     }
  }, [isNear]);

  const startWhisper = () => {
     if (!isPlaying) {
        setIsPlaying(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        
        // Mock audio synthesis for a whisper-like noise
        try {
           if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
           }
           if (audioCtxRef.current.state === "suspended") {
              audioCtxRef.current.resume();
           }
           
           const ctx = audioCtxRef.current;
           const bufferSize = ctx.sampleRate * 2;
           const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
           const data = buffer.getChannelData(0);
           for (let i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * 0.1; // quiet noise
           }
           const noiseSource = ctx.createBufferSource();
           noiseSource.buffer = buffer;
           noiseSource.loop = true;

           const filter = ctx.createBiquadFilter();
           filter.type = "bandpass";
           filter.frequency.value = 1000;

           const gain = ctx.createGain();
           gain.gain.value = 0.2; // very quiet

           noiseSource.connect(filter);
           filter.connect(gain);
           gain.connect(ctx.destination);
           
           noiseSource.start();
           gainNodeRef.current = gain;
           (audioCtxRef.current as any).currentSource = noiseSource;

        } catch (e) {
           console.error("Audio failed", e);
        }

        setTimeout(() => {
           setHasPlayed(true);
           if (onComplete) onComplete();
        }, 5000);
     }
  };

  const stopWhisper = () => {
     if (isPlaying) {
        setIsPlaying(false);
        if (audioCtxRef.current && (audioCtxRef.current as any).currentSource) {
           const source = (audioCtxRef.current as any).currentSource;
           source.stop();
        }
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: isNear ? '#000000' : bgColors[0] }}
    >
      
      {/* Editor Mock Tools */}
      {mode === "editor-preview" && !isNear && (
         <div className="absolute top-8 left-0 right-0 flex justify-center z-50">
            <button
               onPointerDown={() => triggerMockProximity(true)}
               onPointerUp={() => triggerMockProximity(false)}
               onPointerLeave={() => triggerMockProximity(false)}
               className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
               <EyeOff size={16} /> Hold to Mock Proximity
            </button>
         </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 w-full h-full">
         
         <AnimatePresence mode="wait">
            {!isNear ? (
               <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
               >
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                     <Ear size={40} className="text-white/50" />
                  </div>
                  
                  <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-md">
                     {config.title || "Listen closely."}
                  </h2>
                  
                  <p className="text-white/60 font-medium max-w-[250px] leading-relaxed">
                     {hasPlayed ? "You heard it." : "Put the phone exactly against your ear. I have a secret."}
                  </p>
               </motion.div>
            ) : (
               <motion.div
                  key="playing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none"
               >
                  {/* Screen goes totally black to save power and increase immersion, just a tiny indicator */}
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
