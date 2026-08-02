"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export function MagnetsInSand({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const magnetPos = useRef<{ x: number, y: number } | null>(null);
  const isDragging = useRef(false);
  const dragTimeRef = useRef(0);
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  const WIN_DRAG_TIME = 2500; // 2.5 seconds of dragging to clear
  const PARTICLE_COUNT = 1500;
  const ATTRACTION_RADIUS = 150;
  const ATTRACTION_STRENGTH = 0.5;
  const FRICTION = 0.85;

  useEffect(() => {
    if (isRevealed || !containerRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles(rect.width, rect.height);
    };

    const initParticles = (w: number, h: number) => {
      const p: Particle[] = [];
      const sandColors = [
        palette.accent as string || "#d4d4d8",
        "#a1a1aa",
        "#71717a",
        "#52525b"
      ];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        p.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          color: sandColors[Math.floor(Math.random() * sandColors.length)]
        });
      }
      particlesRef.current = p;
    };

    resize();
    window.addEventListener("resize", resize);

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = magnetPos.current?.x ?? 0;
      const my = magnetPos.current?.y ?? 0;
      const active = isDragging.current;

      if (active) {
        dragTimeRef.current += dt;
        if (dragTimeRef.current > WIN_DRAG_TIME) {
          setIsRevealed(true);
          onComplete?.();
          return; // Stop loop
        }
      } else {
        dragTimeRef.current = Math.max(0, dragTimeRef.current - dt * 2);
      }

      const particles = particlesRef.current;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < ATTRACTION_RADIUS) {
            // Apply force
            const force = (ATTRACTION_RADIUS - dist) / ATTRACTION_RADIUS;
            p.vx += (dx / dist) * force * ATTRACTION_STRENGTH * dt;
            p.vy += (dy / dist) * force * ATTRACTION_STRENGTH * dt;
          }
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      // Draw magnet glow if active
      if (active) {
        const radGrd = ctx.createRadialGradient(mx, my, 0, mx, my, ATTRACTION_RADIUS);
        radGrd.addColorStop(0, `${palette.primary}40`); // 25% opacity
        radGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(mx, my, ATTRACTION_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(reqRef.current);
    };
  }, [isRevealed, palette, onComplete]);

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
    magnetPos.current = null;
  };

  const updatePointer = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    magnetPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center p-8"
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

      {/* Foreground Sand Canvas */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-white/50 tracking-widest uppercase text-sm mix-blend-difference pointer-events-none animate-pulse">
              Drag to clear
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
