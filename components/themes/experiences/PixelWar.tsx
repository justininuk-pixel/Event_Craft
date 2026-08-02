"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#ffffff", "#000000", "#e4e4e7", "#71717a", 
  "#ef4444", "#f97316", "#f59e0b", "#eab308", 
  "#84cc16", "#22c55e", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899"
];

const CANVAS_SIZE = 50;

export function PixelWar({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"playing" | "revealed">("playing");
  const [selectedColor, setSelectedColor] = useState(COLORS[4]); 
  const [cooldown, setCooldown] = useState(0); 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playPop = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const drawPixel = useCallback((x: number, y: number, color: string) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    for(let i=0; i<300; i++) {
       const rx = Math.floor(Math.random() * CANVAS_SIZE);
       const ry = Math.floor(Math.random() * CANVAS_SIZE);
       const rc = COLORS[Math.floor(Math.random() * COLORS.length)];
       drawPixel(rx, ry, rc);
    }
  }, [drawPixel]);

  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
       if (phaseRef.current !== "playing") return;
       const count = Math.floor(Math.random() * 5) + 1;
       for(let i=0; i<count; i++) {
         const rx = Math.floor(Math.random() * CANVAS_SIZE);
         const ry = Math.floor(Math.random() * CANVAS_SIZE);
         const rc = COLORS[Math.floor(Math.random() * COLORS.length)];
         drawPixel(rx, ry, rc);
       }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, drawPixel]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    if (cooldown > 0) return; 

    const canvas = canvasRef.current;
    if (!canvas) return;

    initAudio();
    playPop();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      drawPixel(x, y, selectedColor);
      setCooldown(5); 
    }
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full h-full max-w-2xl bg-black/40 p-8 rounded-3xl backdrop-blur flex flex-col items-center justify-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-64 h-64 object-cover shadow-2xl mb-6 rounded border-4 border-white"
            />
          )}
          <h1 className="text-5xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-xl font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-md">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-zinc-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">r/event_craft</h2>
            <p className="text-zinc-400 text-sm mb-6 text-center max-w-xs">
              Coordinate with others. Place a pixel. Wait for the cooldown.
            </p>

            {/* Canvas Container */}
            <div className="relative mb-6 p-2 bg-white rounded-lg shadow-2xl border border-zinc-800">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onPointerDown={handleCanvasClick}
                className="w-72 h-72 md:w-96 md:h-96 cursor-crosshair border border-zinc-300 shadow-inner"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* Cooldown Overlay */}
              <AnimatePresence>
                {cooldown > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-2 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-6xl font-mono"
                  >
                    {cooldown}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Palette */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[280px] mb-8">
              {COLORS.map(c => (
                <button
                  key={c}
                  onPointerDown={() => setSelectedColor(c)}
                  className={`w-10 h-10 rounded border-2 transition-transform ${selectedColor === c ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10' : 'border-zinc-800 shadow-sm'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <button
              onClick={handleReveal}
              className="text-zinc-500 hover:text-white transition-colors text-sm font-bold tracking-widest border border-zinc-700 px-6 py-3 rounded-full hover:bg-zinc-800"
            >
              SKIP / REVEAL CONTENT
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
