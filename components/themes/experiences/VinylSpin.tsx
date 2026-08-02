"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { AUDIO_PRESETS } from "@/lib/themes/audio-presets";

export function VinylSpin({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [rotation, setRotation] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const stateRef = useRef({
    isDragging: false,
    lastAngle: 0,
    totalRotation: 0,
    lastTime: 0,
    velocity: 0 // degrees per ms
  });

  const audioSrc = config.voiceUrl || (config.audioPreset && config.audioPreset !== "none" ? AUDIO_PRESETS[config.audioPreset]?.filePath : AUDIO_PRESETS["jazz-smooth"]?.filePath);

  useEffect(() => {
    let reqId: number;
    const loop = () => {
      if (isRevealed) return;
      
      const st = stateRef.current;
      
      // Decay velocity if not dragging
      if (!st.isDragging) {
        st.velocity *= 0.95; 
        if (Math.abs(st.velocity) < 0.01) st.velocity = 0;
        
        st.totalRotation += st.velocity * 16;
        setRotation(st.totalRotation);
      }

      // Map velocity to playback rate
      // Let's say 0.2 deg/ms is normal speed (1.0)
      const absVel = Math.abs(st.velocity);
      let targetRate = absVel / 0.2;
      targetRate = Math.max(0, Math.min(2.0, targetRate));
      
      if (audioRef.current) {
        if (targetRate > 0.1) {
          if (!isPlaying) {
            audioRef.current.play().catch(()=>{});
            setIsPlaying(true);
          }
          audioRef.current.playbackRate = targetRate;
        } else {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }
      }

      // Check win condition (e.g. 5 full rotations = 1800 degrees)
      if (Math.abs(st.totalRotation) > 1800 && !isRevealed) {
        setIsRevealed(true);
        if (audioRef.current) {
          audioRef.current.playbackRate = 1;
          audioRef.current.play().catch(()=>{});
        }
        onComplete?.();
      }

      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [isRevealed, isPlaying, onComplete]);

  const getAngle = (e: React.PointerEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRevealed) return;
    const st = stateRef.current;
    st.isDragging = true;
    st.lastAngle = getAngle(e);
    st.lastTime = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const st = stateRef.current;
    if (!st.isDragging || isRevealed) return;
    
    const now = performance.now();
    const currentAngle = getAngle(e);
    
    let delta = currentAngle - st.lastAngle;
    
    // Handle wrapping around -180/180
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    
    st.totalRotation += delta;
    setRotation(st.totalRotation);
    
    const dt = now - st.lastTime;
    if (dt > 0) {
      st.velocity = delta / dt;
    }
    
    st.lastAngle = currentAngle;
    st.lastTime = now;
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  // 1800 deg = 100%
  const progress = Math.min(1, Math.abs(stateRef.current.totalRotation) / 1800);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] touch-none select-none"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" loop />}

      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-1000"
        style={{ opacity: isRevealed ? 1 : progress * 0.5 }} // Partially visible while spinning
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Surprise" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-md">
          {config.body}
        </p>
      </div>

      {/* The Vinyl Record */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-1000"
        style={{ 
          transform: isRevealed ? 'translateY(150%) scale(0.5)' : 'translateY(0) scale(1)',
          opacity: isRevealed ? 0 : 1
        }}
      >
        <div 
          className="w-80 h-80 rounded-full bg-black shadow-2xl relative flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{ transform: `rotate(${rotation}deg)` }}
          onPointerDown={handlePointerDown}
        >
          {/* Grooves */}
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <div className="absolute inset-4 rounded-full border border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/10" />
          <div className="absolute inset-12 rounded-full border border-white/5" />
          <div className="absolute inset-16 rounded-full border border-white/10" />

          {/* Inner Label */}
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden relative shadow-inner"
            style={{ backgroundColor: palette.accent as string }}
          >
            {config.mediaUrl ? (
              <img src={config.mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply pointer-events-none" alt="Label" />
            ) : null}
            <div className="w-4 h-4 bg-white rounded-full z-10 shadow-sm" /> {/* Spindle hole */}
          </div>
          
          {/* Highlight / Reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-white/20 pointer-events-none" />
        </div>
      </div>

      {!isRevealed && stateRef.current.totalRotation === 0 && (
        <p className="absolute bottom-12 w-full text-center text-[var(--exp-text)] font-heading animate-pulse pointer-events-none">
          Spin the record to play
        </p>
      )}
      
    </div>
  );
}
