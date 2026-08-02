"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function SharedCanvasMask({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"erasing" | "revealed">("erasing");
  const [percentCleared, setPercentCleared] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playScratch = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSize = ctx.sampleRate * 0.05; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
       data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1000 + Math.random() * 2000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    
    const resize = () => {
       if (!containerRef.current) return;
       const rect = containerRef.current.getBoundingClientRect();
       canvas.width = rect.width;
       canvas.height = rect.height;
       
       ctx.fillStyle = "#0f172a"; 
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       ctx.fillStyle = "rgba(255,255,255,0.05)";
       ctx.font = "bold 40px sans-serif";
       ctx.textAlign = "center";
       ctx.textBaseline = "middle";
       for (let i=0; i<10; i++) {
          ctx.fillText("SCRATCH", Math.random() * canvas.width, Math.random() * canvas.height);
       }
    };
    
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const erasePath = useCallback((x1: number, y1: number, x2: number, y2: number, radius: number = 40) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = radius;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    initAudio();
    isDrawing.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    erasePath(lastPos.current.x, lastPos.current.y, lastPos.current.x + 1, lastPos.current.y);
    playScratch();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPos.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    erasePath(lastPos.current.x, lastPos.current.y, currentPos.x, currentPos.y);
    lastPos.current = currentPos;
    
    if (Math.random() < 0.1) playScratch();
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  useEffect(() => {
    if (phase !== "erasing") return;
    
    const interval = setInterval(() => {
      if (phaseRef.current !== "erasing") return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const length = 50 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      
      erasePath(x, y, x2, y2, 30 + Math.random() * 30);
      
    }, 400);

    return () => clearInterval(interval);
  }, [phase, erasePath]);

  useEffect(() => {
    if (phase !== "erasing") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "erasing") return;
       const canvas = canvasRef.current;
       if (!canvas) return;
       const ctx = canvas.getContext("2d");
       if (!ctx) return;

       const w = canvas.width;
       const h = canvas.height;
       
       const stride = 16;
       let transparentCount = 0;
       let totalChecked = 0;
       
       try {
          const imgData = ctx.getImageData(0, 0, w, h).data;
          for (let i = 3; i < imgData.length; i += stride * 4) {
             if (imgData[i] < 50) transparentCount++; 
             totalChecked++;
          }
          
          const percent = (transparentCount / totalChecked) * 100;
          setPercentCleared(percent);
          
          if (percent > 65) {
             setPhase("revealed");
             if (onComplete) onComplete();
          }
       } catch (e) {
       }

    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  const handleRevealClick = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-white touch-none select-none"
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          backgroundColor: palette.background as string,
        }}
      >
        <div className="w-full max-w-lg bg-black/5 p-8 rounded-3xl flex flex-col items-center border border-black/10">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-white"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-slate-700 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground Canvas Overlay */}
      <AnimatePresence>
        {phase === "erasing" && (
          <motion.div
             className="absolute inset-0 z-20"
             initial={{ opacity: 1 }}
             exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
             transition={{ duration: 1.5, ease: "easeOut" }}
          >
             <canvas
                ref={canvasRef}
                className="w-full h-full cursor-pointer"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
             />
             
             {/* Progress Overlay */}
             <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur rounded-full px-6 py-2 border border-slate-700 pointer-events-none shadow-lg">
                <span className="text-white font-mono font-bold tracking-widest">
                   {percentCleared.toFixed(1)}% CLEARED
                </span>
             </div>

             <button
               onClick={handleRevealClick}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-500 hover:text-white transition-colors text-xs font-bold tracking-widest border border-slate-700 bg-black/50 backdrop-blur px-6 py-3 rounded-full"
             >
               SKIP TO REVEAL
             </button>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
