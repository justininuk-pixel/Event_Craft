"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface BalloonState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  popped: boolean;
}

const GRAVITY = -100; // Float upwards
const FRICTION = 0.9;
const ATTRACTION_CENTER = 50;

export function BalloonPop({
  theme,
  config,
  palette,
  mode,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // DOM element refs live in their own array so they attach independently of when the
  // physics state array is built (fixes balloons never appearing on first paint / in the link).
  const elsRef = useRef<(HTMLDivElement | null)[]>([]);
  const balloonsRef = useRef<BalloonState[]>([]);
  const reqRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Honour the creator's chosen amount. Experience knobs live under config.experience
  // (set by the editor), falling back to the theme's defaults, then a sane default.
  const balloonCount = useMemo(() => {
    const n = Number(
      config.experience?.balloonCount ?? theme.experienceDefaults?.balloonCount ?? 6,
    );
    if (!Number.isFinite(n) || n <= 0) return 6;
    return Math.max(3, Math.min(40, Math.round(n)));
  }, [config.experience?.balloonCount, theme.experienceDefaults?.balloonCount]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch {}
  }, []);

  const playPopSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800 + Math.random() * 400;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(ctx.currentTime);
    whiteNoise.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (isRevealed) return;

    const colors = [
      palette.primary as string,
      palette.secondary as string,
      palette.accent as string,
      '#ec4899', '#3b82f6', '#10b981', '#f59e0b'
    ];

    const cw = containerRef.current?.offsetWidth || 320;
    const ch = containerRef.current?.offsetHeight || 480;

    const initialBalloons: BalloonState[] = Array.from({ length: balloonCount }).map((_, i) => ({
      id: i,
      x: cw / 2 + (Math.random() - 0.5) * Math.min(cw * 0.6, 160),
      y: ch / 2 + (Math.random() - 0.5) * Math.min(ch * 0.6, 160),
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      radius: 34 + Math.random() * 22,
      color: colors[i % colors.length],
      popped: false
    }));

    balloonsRef.current = initialBalloons;
    lastTimeRef.current = performance.now();

    // Apply size/colour to the actual DOM once, so the balloons are correct even before
    // the first animation frame runs.
    initialBalloons.forEach((b, i) => {
      const el = elsRef.current[i];
      if (!el) return;
      el.style.width = `${b.radius * 2}px`;
      el.style.height = `${b.radius * 2}px`;
      el.style.backgroundColor = b.color;
      el.style.transform = `translate(${b.x - b.radius}px, ${b.y - b.radius}px)`;
    });

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const balloons = balloonsRef.current;
      const cwNow = containerRef.current?.offsetWidth || 320;
      const chNow = containerRef.current?.offsetHeight || 480;
      const cx = cwNow / 2;
      const cy = chNow / 2;

      for (let i = 0; i < balloons.length; i++) {
        const b = balloons[i];
        if (b.popped) continue;

        b.vy += GRAVITY * dt;

        const dx = cx - b.x;
        const dy = cy - b.y;
        b.vx += dx * ATTRACTION_CENTER * dt;
        b.vy += dy * ATTRACTION_CENTER * dt;

        for (let j = i + 1; j < balloons.length; j++) {
          const b2 = balloons[j];
          if (b2.popped) continue;

          const dx2 = b2.x - b.x;
          const dy2 = b2.y - b.y;
          const distSq = dx2 * dx2 + dy2 * dy2;
          const minDist = b.radius + b2.radius;

          if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;
            const nx = dx2 / dist;
            const ny = dy2 / dist;

            const force = overlap * 50;
            b.vx -= nx * force * dt;
            b.vy -= ny * force * dt;
            b2.vx += nx * force * dt;
            b2.vy += ny * force * dt;
          }
        }

        b.vx *= FRICTION;
        b.vy *= FRICTION;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x < b.radius) { b.x = b.radius; b.vx *= -1; }
        if (b.x > cwNow - b.radius) { b.x = cwNow - b.radius; b.vx *= -1; }
        if (b.y < b.radius) { b.y = b.radius; b.vy *= -1; }
        if (b.y > chNow - b.radius) { b.y = chNow - b.radius; b.vy *= -1; }

        const el = elsRef.current[i];
        if (el) {
          el.style.transform = `translate(${b.x - b.radius}px, ${b.y - b.radius}px)`;
        }
      }

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(reqRef.current);
  }, [isRevealed, palette, balloonCount]);

  const popBalloon = (id: number) => {
    initAudio();
    const b = balloonsRef.current.find(x => x.id === id);
    if (!b || b.popped) return;

    b.popped = true;
    const el = elsRef.current[id];
    if (el) el.style.display = 'none';

    playPopSound();

    const balloons = balloonsRef.current;
    for (let i = 0; i < balloons.length; i++) {
      const b2 = balloons[i];
      if (!b2.popped && b2.id !== id) {
        const dx = b2.x - b.x;
        const dy = b2.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 150) {
          const force = (150 - dist) * 10;
          b2.vx += (dx / dist) * force;
          b2.vy += (dy / dist) * force;
        }
      }
    }

    const activeCount = balloons.filter(x => !x.popped).length;
    // Reveal once (almost) everything is popped, scale the threshold to the count.
    if (activeCount <= Math.max(1, Math.floor(balloonCount * 0.1))) {
      setIsRevealed(true);
      onComplete?.();
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex items-center justify-center"
      ref={containerRef}
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
          {config.title || theme.content.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body || theme.content.body}
        </p>
      </div>

      {/* Foreground Balloon Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-auto"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >

            {Array.from({ length: balloonCount }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { elsRef.current[i] = el; }}
                onPointerDown={() => popBalloon(i)}
                className="absolute top-0 left-0 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.3),_0_5px_15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-end overflow-visible cursor-pointer"
                style={{
                  transform: 'translate(-1000px, -1000px)',
                  width: 80,
                  height: 80,
                  backgroundColor: '#f43f5e',
                }}
              >
                {/* Highlight */}
                <div className="absolute top-[10%] left-[20%] w-[20%] h-[30%] bg-white/30 rounded-full rotate-45" />
                {/* Knot */}
                <div className="absolute -bottom-2 w-4 h-3 rounded-b-sm border-t border-black/10 bg-inherit" />
                {/* String */}
                <div className="absolute -bottom-16 w-0.5 h-16 bg-white/20 origin-top rotate-[-10deg]" />
              </div>
            ))}

            <p className="absolute top-12 left-1/2 -translate-x-1/2 font-mono text-zinc-400 tracking-widest uppercase text-sm pointer-events-none drop-shadow-md animate-pulse">
              {mode === "gallery-mini" ? "Balloon Pop" : "Pop them!"}
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
