"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function BlacklightScan({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lightPos = useRef<{ x: number, y: number } | null>(null);
  const [renderPos, setRenderPos] = useState<{ x: number, y: number } | null>(null);
  
  const isDragging = useRef(false);
  const dragTimeRef = useRef(0);
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const WIN_DRAG_TIME = 3000; // 3 seconds of scanning to unlock

  useEffect(() => {
    if (isRevealed) return;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isDragging.current && lightPos.current) {
        dragTimeRef.current += dt;
        setRenderPos(lightPos.current); // Force re-render for mask position
        
        if (dragTimeRef.current > WIN_DRAG_TIME) {
          setIsRevealed(true);
          onComplete?.();
          return;
        }
      } else {
        setRenderPos(null);
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(reqRef.current);
    };
  }, [isRevealed, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRevealed || !containerRef.current) return;
    isDragging.current = true;
    updatePointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRevealed || !isDragging.current || !containerRef.current) return;
    updatePointer(e);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    lightPos.current = null;
  };

  const updatePointer = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    lightPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Mask styles based on state
  const maskStyle = isRevealed 
    ? { maskImage: 'none', WebkitMaskImage: 'none' }
    : renderPos 
      ? {
          maskImage: `radial-gradient(circle 120px at ${renderPos.x}px ${renderPos.y}px, black 40%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 120px at ${renderPos.x}px ${renderPos.y}px, black 40%, transparent 100%)`
        }
      : { maskImage: 'none', WebkitMaskImage: 'none', opacity: 0 };

  return (
    <div 
      className="w-full h-full relative overflow-hidden touch-none select-none flex items-center justify-center p-8 bg-black"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Background (Dark unlit surface) */}
      {!isRevealed && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center pointer-events-none z-0">
          <p className="font-mono text-zinc-800 tracking-widest uppercase text-sm animate-pulse">
            Area Secure
          </p>
        </div>
      )}

      {/* Hidden Content Layer (The UV ink) */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 transition-all duration-1000"
        style={{
          ...maskStyle,
          // When revealed, it switches to normal palette. When hidden, it's glowing neon.
          backgroundColor: isRevealed ? palette.background as string : '#09090b',
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className={`w-48 h-48 object-cover rounded-xl shadow-2xl mb-6 transition-all duration-1000 ${
              !isRevealed ? 'grayscale contrast-200 hue-rotate-180 brightness-150 drop-shadow-[0_0_15px_#22d3ee]' : ''
            }`}
          />
        )}
        <h1 className={`text-4xl font-heading mb-4 transition-colors duration-1000 ${
          isRevealed ? 'text-[var(--exp-primary)]' : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]'
        }`}>
          {config.title}
        </h1>
        <p className={`text-lg font-body whitespace-pre-wrap max-w-sm transition-colors duration-1000 ${
          isRevealed ? 'text-[var(--exp-text)]' : 'text-fuchsia-400 font-mono drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]'
        }`}>
          {config.body}
        </p>

        {!isRevealed && (
           <div className="absolute inset-0 pointer-events-none" style={{
             background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.05) 2px, rgba(34,211,238,0.05) 4px)'
           }} />
        )}
      </div>

      {/* Intro Text */}
      <AnimatePresence>
        {!isRevealed && !renderPos && (
          <motion.div 
            className="absolute z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-cyan-500/50 tracking-widest uppercase text-xs text-center border border-cyan-900/30 bg-cyan-950/20 px-4 py-2 rounded-full">
              Touch to scan with UV light
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
