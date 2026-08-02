"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

export function BlowtorchBurn({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const metalCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const isDragging = useRef(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);
  const currentPos = useRef<{ x: number, y: number } | null>(null);
  const distBurned = useRef(0);
  const reqRef = useRef(0);

  const WIN_DISTANCE = 5000;
  const TORCH_RADIUS = 30;
  const GLOW_RADIUS = 45;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (isRevealed || !containerRef.current || !metalCanvasRef.current || !glowCanvasRef.current) return;

    const metalCanvas = metalCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    const metalCtx = metalCanvas.getContext("2d", { willReadFrequently: false });
    const glowCtx = glowCanvas.getContext("2d", { willReadFrequently: false });
    if (!metalCtx || !glowCtx) return;

    const resize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      metalCanvas.width = rect.width;
      metalCanvas.height = rect.height;
      glowCanvas.width = rect.width;
      glowCanvas.height = rect.height;

      metalCtx.fillStyle = "#27272a"; 
      metalCtx.fillRect(0, 0, rect.width, rect.height);
      
      metalCtx.fillStyle = "rgba(255,255,255,0.03)";
      for(let i=0; i<1000; i++) {
        metalCtx.fillRect(Math.random() * rect.width, Math.random() * rect.height, 2, 2);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      if (isRevealed) return;

      glowCtx.globalCompositeOperation = 'destination-out';
      glowCtx.fillStyle = 'rgba(0, 0, 0, 0.08)'; 
      glowCtx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);

      if (isDragging.current && currentPos.current && lastPos.current) {
        const x1 = lastPos.current.x;
        const y1 = lastPos.current.y;
        const x2 = currentPos.current.x;
        const y2 = currentPos.current.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        distBurned.current += dist;

        metalCtx.globalCompositeOperation = 'destination-out';
        metalCtx.lineWidth = TORCH_RADIUS * 2;
        metalCtx.lineCap = 'round';
        metalCtx.beginPath();
        metalCtx.moveTo(x1, y1);
        metalCtx.lineTo(x2, y2);
        metalCtx.stroke();

        glowCtx.globalCompositeOperation = 'source-over';
        glowCtx.lineWidth = GLOW_RADIUS * 2;
        glowCtx.lineCap = 'round';
        glowCtx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        glowCtx.shadowColor = 'rgba(249, 115, 22, 1)'; 
        glowCtx.shadowBlur = 15;
        glowCtx.beginPath();
        glowCtx.moveTo(x1, y1);
        glowCtx.lineTo(x2, y2);
        glowCtx.stroke();

        glowCtx.shadowBlur = 0;

        glowCtx.globalCompositeOperation = 'destination-out';
        glowCtx.lineWidth = TORCH_RADIUS * 2;
        glowCtx.lineCap = 'round';
        glowCtx.beginPath();
        glowCtx.moveTo(x1, y1);
        glowCtx.lineTo(x2, y2);
        glowCtx.stroke();

        lastPos.current = { x: x2, y: y2 };

        if (distBurned.current > WIN_DISTANCE) {
          setIsRevealed(true);
          onComplete?.();
          
          if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
          }
          return;
        }
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(reqRef.current);
    };
  }, [isRevealed, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRevealed || !containerRef.current) return;
    initAudio();
    isDragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lastPos.current = pos;
    currentPos.current = pos;

    if (gainNodeRef.current && audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.05);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRevealed || !isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    currentPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    lastPos.current = null;
    currentPos.current = null;

    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
    }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: palette.background as string 
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Burn Canvases */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1 }}
          >
            {/* The metal layer */}
            <canvas ref={metalCanvasRef} className="absolute inset-0 w-full h-full" />
            
            {/* The glowing hot edges layer */}
            <canvas ref={glowCanvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen' }} />
            
            {/* Overlay hint */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full border border-orange-900/50">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <p className="font-mono text-orange-200/70 tracking-widest uppercase text-xs">
                Burn to reveal
              </p>
            </div>
            
            {/* Render a fake torch flame following the cursor if dragging */}
            {isDragging.current && currentPos.current && (
              <div 
                className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  left: currentPos.current.x,
                  top: currentPos.current.y,
                  background: 'radial-gradient(circle, rgba(56,189,248,1) 0%, rgba(249,115,22,0.8) 40%, rgba(0,0,0,0) 70%)',
                  boxShadow: '0 0 30px rgba(56,189,248,0.5), 0 0 50px rgba(249,115,22,0.5)',
                  mixBlendMode: 'screen'
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
