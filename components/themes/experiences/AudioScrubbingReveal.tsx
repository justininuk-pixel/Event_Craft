"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Play, Pause } from "lucide-react";
import { AUDIO_PRESETS } from "@/lib/themes/audio-presets";

export function AudioScrubbingReveal({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [hasCompleted, setHasCompleted] = useState(false);

  // Fallback to a default preset if none provided
  const audioSrc = config.voiceUrl || (config.audioPreset && config.audioPreset !== "none" ? AUDIO_PRESETS[config.audioPreset]?.filePath : AUDIO_PRESETS["romantic-piano"].filePath);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        const p = audio.currentTime / audio.duration;
        setProgress(p);
        if (p >= 0.99 && !hasCompleted) {
          setHasCompleted(true);
          onComplete?.();
        }
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [hasCompleted, onComplete]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = parseFloat(e.target.value);
    setProgress(p);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = p * audioRef.current.duration;
    }
  };

  // The visual metamorphosis: a circular clip path that expands as progress goes from 0 to 1
  // We'll scale the circle radius from 0% to 150% (to ensure it fully covers the corners)
  const clipRadius = progress * 150; 
  const clipPathStyle = `circle(${clipRadius}% at 50% 50%)`;

  return (
    <div className="w-full h-full flex flex-col relative text-[var(--exp-text)] bg-[var(--exp-primary)]">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Top 80% Visual Metamorphosis Container */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        
        {/* Unrevealed State (Blurred/Solid) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50" style={{ background: 'var(--exp-secondary)' }}>
          <p className="text-xl font-heading animate-pulse text-[var(--exp-text)]">Scrub to reveal...</p>
        </div>

        {/* Revealed State (Masked by clip-path) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center p-8"
          style={{ 
            clipPath: clipPathStyle, 
            transition: 'clip-path 0.1s ease-out',
            background: 'var(--exp-primary)'
          }}
        >
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Memory" 
              className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-secondary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-[var(--exp-text-secondary)] whitespace-pre-wrap">
            {config.body}
          </p>
        </div>

      </div>

      {/* Bottom 20% Scrubber UI */}
      <div className="h-[20%] min-h-[120px] bg-black/20 flex flex-col items-center justify-center p-6 backdrop-blur-sm z-10">
        <div className="w-full max-w-md flex items-center space-x-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            style={{ backgroundColor: 'var(--exp-accent)', color: 'var(--exp-primary)' }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <input 
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={handleScrub}
            className="flex-1 h-3 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--exp-accent) ${progress * 100}%, rgba(255,255,255,0.2) ${progress * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
