"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { AUDIO_PRESETS } from "@/lib/themes/audio-presets";
import { Volume2, VolumeX } from "lucide-react";

export function VolumeSlider({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const audioSrc = config.voiceUrl || (config.audioPreset && config.audioPreset !== "none" ? AUDIO_PRESETS[config.audioPreset]?.filePath : AUDIO_PRESETS["ambient-nature"]?.filePath);

  // Framer motion value for knob position (0 = bottom, 1 = top)
  const progress = useMotionValue(0);
  
  // Transform progress (0 to 1) to volume and brightness
  const brightness = useTransform(progress, [0, 1], [0, 1]); // 0 to 100%
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 0.5, 1]);

  useEffect(() => {
    const unsub = progress.onChange((v) => {
      if (audioRef.current) {
        audioRef.current.volume = v;
      }
      if (v > 0.1 && !isPlaying) {
        setIsPlaying(true);
        audioRef.current?.play().catch(()=>{});
      }
      
      if (v >= 0.95 && !isRevealed) {
        setIsRevealed(true);
        // Force to 1
        animate(progress, 1, { duration: 0.5 });
        onComplete?.();
      }
    });
    return unsub;
  }, [progress, isRevealed, isPlaying, onComplete]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center p-8"
      ref={containerRef}
    >
      
      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="metadata" />}

      {/* Background Revealed Content */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-transform duration-1000 z-10"
        style={{ 
          opacity: opacity,
          filter: `brightness(${brightness.get() * 100}%)`,
          backgroundColor: palette.background as string,
          scale: isRevealed ? 1 : 0.9
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-64 h-64 object-cover rounded-2xl shadow-2xl mb-8"
          />
        )}
        <h1 className="text-4xl sm:text-5xl font-heading mb-6 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg sm:text-xl font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-md">
          {config.body}
        </p>
      </motion.div>

      {/* Foreground Slider Layer */}
      <motion.div 
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        animate={{ opacity: isRevealed ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        
        {/* Massive Slider Track */}
        <div 
          ref={trackRef}
          className="relative w-24 h-2/3 max-h-[600px] bg-white/10 rounded-full border border-white/20 backdrop-blur-md pointer-events-auto"
        >
          
          {/* Track Fill */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-white/10 to-white/40 pointer-events-none"
            style={{ 
              height: useTransform(progress, [0, 1], ["0%", "100%"]),
              backgroundColor: palette.primary as string
            }}
          />

          {/* Icons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 pointer-events-none">
            <VolumeX size={24} />
          </div>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 pointer-events-none">
            <Volume2 size={24} />
          </div>

          {/* Draggable Knob */}
          <motion.div
            drag="y"
            dragConstraints={trackRef}
            dragElastic={0}
            dragMomentum={false}
            onDrag={(e, info) => {
              if (isRevealed || !trackRef.current) return;
              const rect = trackRef.current.getBoundingClientRect();
              const knobHeight = 96; // h-24 = 96px
              const availableHeight = rect.height - knobHeight;
              
              // Calculate relative Y inside the track
              let currentY = info.point.y - rect.top - (knobHeight / 2);
              
              // Clamp
              currentY = Math.max(0, Math.min(availableHeight, currentY));
              
              // Convert to 0-1 (inverted so top is 1)
              const p = 1 - (currentY / availableHeight);
              progress.set(p);
            }}
            className="absolute w-24 h-24 rounded-full bg-white shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center border-4"
            style={{ 
              borderColor: palette.accent as string,
              bottom: useTransform(progress, [0, 1], ["0%", "calc(100% - 96px)"])
            }}
          >
            <div className="w-12 h-2 rounded-full bg-black/20" />
            <div className="absolute w-12 h-2 rounded-full bg-black/20 -mt-6" />
            <div className="absolute w-12 h-2 rounded-full bg-black/20 mt-6" />
          </motion.div>

        </div>

        <p className="absolute bottom-12 w-full text-center text-white/50 font-heading tracking-widest uppercase animate-pulse">
          Slide up to reveal
        </p>

      </motion.div>

    </div>
  );
}
