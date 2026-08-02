"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";

export function AutoplayVHS({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = [
    { text: config.title || "PLAYING" },
    { text: config.body || "No signal..." },
    { text: "END OF TAPE" }
  ];

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || showStatic) return;

    const timer = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev < frames.length - 1) return prev + 1;
        if (onComplete) onComplete();
        return prev;
      });
    }, 3000); // 3 seconds per frame

    return () => clearInterval(timer);
  }, [isPlaying, showStatic, frames.length, onComplete]);

  // Static penalty for pausing
  const handlePauseAttempt = () => {
    setShowStatic(true);
    setTimeout(() => {
      setShowStatic(false);
    }, 1500); // 1.5 seconds of static
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col items-center justify-center font-mono text-white select-none overflow-hidden">
      
      {/* VCR UI Overlay */}
      <div className="absolute top-8 left-8 text-2xl font-bold tracking-widest text-white/80 z-20" style={{ textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}>
        {isPlaying ? (showStatic ? "TRACKING..." : "PLAY ►") : "STOP ◼"}
      </div>
      
      <div className="absolute top-8 right-8 text-2xl font-bold tracking-widest text-white/80 z-20" style={{ textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}>
        AM 12:00
      </div>

      {/* Screen Content */}
      <div className={`relative z-10 w-full max-w-lg p-12 text-center transition-all duration-500 ${showStatic ? 'opacity-0' : 'opacity-100'}`}>
        {!isPlaying ? (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-4xl uppercase font-black tracking-tighter text-blue-500/80 mb-12">Insert Tape</h2>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-8 py-4 bg-gray-200 text-black font-black uppercase text-xl rounded shadow-[inset_0_-4px_0_rgba(0,0,0,0.3)] hover:bg-white active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)] active:translate-y-[3px]"
            >
              Play
            </button>
          </div>
        ) : (
          <div className="text-3xl leading-relaxed font-bold animate-pulse">
             {frames[currentFrame].text}
          </div>
        )}
      </div>

      {/* VHS Static Effect */}
      {showStatic && (
        <div className="absolute inset-0 z-50 pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen" 
             style={{ 
               filter: 'contrast(200%) brightness(150%) grayscale(100%)',
               animation: 'flicker 0.1s infinite'
             }}>
           {/* Scanlines */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 pointer-events-none" />
        </div>
      )}

      {/* Global Scanlines & CRT curve */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-40">
        <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* Fake Pause Button (to trigger penalty) */}
      {isPlaying && mode !== "editor-preview" && (
        <button 
          onClick={handlePauseAttempt}
          className="absolute bottom-12 px-8 py-4 border-2 border-white/20 text-white/40 uppercase tracking-widest font-bold hover:bg-white/10 hover:text-white transition-colors z-50 rounded"
        >
          Pause
        </button>
      )}

      {/* Embedded CSS for flicker */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flicker {
          0% { opacity: 0.8; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-5px); }
          100% { opacity: 0.9; transform: translateY(5px); }
        }
      `}} />
    </div>
  );
}
