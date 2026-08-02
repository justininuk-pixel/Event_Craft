"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Coffee, Flame, Droplets, Volume2, EyeOff } from "lucide-react";

type ScentType = "snow" | "coffee" | "rain" | "campfire";

export function ScentMemorySimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const targetScent = ((config.experience as any)?.type as ScentType) || "snow";
  
  // Custom palettes based on scent, ignoring the global palette to ensure immersion
  const getThemeVars = () => {
     switch(targetScent) {
        case "coffee": return { bg: "#451a03", accent: "#d97706", icon: Coffee };
        case "campfire": return { bg: "#2a0a0a", accent: "#f97316", icon: Flame };
        case "rain": return { bg: "#0f172a", accent: "#38bdf8", icon: Droplets };
        case "snow": default: return { bg: "#082f49", accent: "#bae6fd", icon: Snowflake };
     }
  };
  const themeParams = getThemeVars();
  const Icon = themeParams.icon;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startSimulation = () => {
     setIsPlaying(true);
     
     // Trigger haptics loop
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        // Continuous low rumble (approximate with repeating pattern)
        const pattern = targetScent === "rain" ? [10, 50, 10, 50, 10, 50] :
                        targetScent === "campfire" ? [20, 100, 30, 80, 50] :
                        targetScent === "coffee" ? [5, 200, 5, 200] :
                        [100, 1000, 100, 1000]; // snow (wind shiver)
        
        // Browsers limit vibration duration, but we can fire it once.
        navigator.vibrate(pattern);
     }

     // Trigger Web Audio Noise/Wind/Rain (mock synthesis)
     try {
        if (!audioCtxRef.current) {
           audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
           audioCtxRef.current.resume();
        }
        
        const ctx = audioCtxRef.current;
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
           // White noise
           data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        // Filter the noise based on scent
        const filter = ctx.createBiquadFilter();
        if (targetScent === "snow") {
           filter.type = "lowpass";
           filter.frequency.value = 400; // Wind howl
        } else if (targetScent === "rain") {
           filter.type = "highpass";
           filter.frequency.value = 800; // Rain hiss
        } else if (targetScent === "campfire") {
           filter.type = "bandpass";
           filter.frequency.value = 200; // Crackle rumble
        } else {
           filter.type = "lowpass";
           filter.frequency.value = 200; // Coffee shop drone
        }

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2); // Fade in

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noiseSource.start();

        // Save reference to stop later
        (noiseSource as any).gainNode = gain;
        (audioCtxRef.current as any).currentSource = noiseSource;

     } catch (e) {
        console.error("Audio failed", e);
     }

     // Complete after 15s
     if (onComplete) {
        setTimeout(() => {
           stopSimulation();
           onComplete();
        }, 15000);
     }
  };

  const stopSimulation = () => {
     setIsPlaying(false);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(0);
     if (audioCtxRef.current && (audioCtxRef.current as any).currentSource) {
        const source = (audioCtxRef.current as any).currentSource;
        const gain = source.gainNode;
        gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1);
        source.stop(audioCtxRef.current.currentTime + 1);
     }
  };

  useEffect(() => {
     return () => stopSimulation();
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: themeParams.bg }}
    >
      
      {!isPlaying ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl border-2" style={{ borderColor: themeParams.accent, color: themeParams.accent }}>
               <Icon size={40} />
            </div>
            
            <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-md">
               {config.title || "Close your eyes."}
            </h2>
            
            <p className="text-white/70 font-medium mb-12 text-lg">
               {config.body || "Phones can't emit smells. But memory can. Turn up your volume, hold your phone tight, and remember the smell of Pine Needles & Snow."}
            </p>

            <button 
               onClick={startSimulation}
               className="py-4 px-12 rounded-full font-bold text-white shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-lg tracking-widest uppercase"
               style={{ backgroundColor: themeParams.accent, color: themeParams.bg }}
            >
               <Volume2 size={20} /> Immerse
            </button>
         </div>
      ) : (
         <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
            
            {/* Visual Overload / Environmental Filters */}
            <AnimatePresence>
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 z-0 pointer-events-none"
               >
                  {/* Frosted Glass / Fog */}
                  {targetScent === "snow" && (
                     <div className="absolute inset-0 bg-white/20 backdrop-blur-xl mix-blend-screen animate-pulse" />
                  )}
                  {/* Rain Overlay */}
                  {targetScent === "rain" && (
                     <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" 
                          style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.1) 100%)', backgroundSize: '100% 10px' }} />
                  )}
                  {/* Campfire Glow */}
                  {targetScent === "campfire" && (
                     <div className="absolute inset-0 bg-orange-500/20 mix-blend-color-dodge animate-[pulse_0.5s_linear_infinite]" />
                  )}
                  {/* Coffee Steam */}
                  {targetScent === "coffee" && (
                     <div className="absolute inset-0 bg-amber-900/30 backdrop-blur-[20px]" />
                  )}
               </motion.div>
            </AnimatePresence>

            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 1, duration: 2 }}
               className="z-10 flex flex-col items-center text-center p-6"
            >
               <EyeOff size={48} className="mb-6 opacity-50" style={{ color: themeParams.accent }} />
               <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-2xl">
                  Breathe In.
               </h3>
               <p className="text-white/80 font-serif italic text-xl max-w-sm">
                  Remember what it felt like. Remember what it smelled like.
               </p>
            </motion.div>

         </div>
      )}

    </div>
  );
}
