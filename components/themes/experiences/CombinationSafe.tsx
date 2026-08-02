"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

export function CombinationSafe({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [angle, setAngle] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const TARGET_COMBINATION = [10, 20, 30];
  const TOTAL_NUMBERS = 100;
  
  const playClick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Ignore
    }
  }, []);

  const playClunk = useCallback(() => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    // Check if we hit the next sequence
    if (isRevealed) return;
    
    // Only register a combination entry when the user stops dragging
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        
        const targetIndex = sequence.length;
        if (targetIndex < TARGET_COMBINATION.length) {
          // Allow small tolerance? Let's say exact for now, it's 100 ticks.
          // Wait, 100 ticks on 360 degrees = 3.6 degrees per tick.
          // Tolerance +/- 1 tick.
          const diff = Math.abs(currentNumber - TARGET_COMBINATION[targetIndex]);
          const wrappedDiff = Math.min(diff, TOTAL_NUMBERS - diff);
          
          if (wrappedDiff <= 2) {
            setSequence(prev => {
              const next = [...prev, TARGET_COMBINATION[targetIndex]];
              if (next.length === TARGET_COMBINATION.length) {
                playClunk();
                setTimeout(() => {
                  setIsRevealed(true);
                  onComplete?.();
                }, 500);
              }
              return next;
            });
          } else {
            // Reset if wrong number is selected? Or just wait until they hit the right one.
            // A real safe resets if you mess up the rotation direction, but let's keep it simple:
            // Just let them keep trying to hit the next number.
          }
        }
      }
    };

    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointercancel", handleMouseUp);
    return () => {
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointercancel", handleMouseUp);
    };
  }, [currentNumber, sequence, isRevealed, onComplete, playClunk]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRevealed) return;
    isDragging.current = true;
    updateAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRevealed || !isDragging.current) return;
    updateAngle(e.clientX, e.clientY);
  };

  const updateAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // atan2 gives -PI to PI.
    // 0 is right. We want 0 to be top.
    // So subtract PI/2.
    let rad = Math.atan2(clientY - centerY, clientX - centerX);
    // Add 90 degrees so 0 is top
    rad += Math.PI / 2;
    
    let deg = rad * (180 / Math.PI);
    if (deg < 0) deg += 360;
    
    setAngle(deg);
    
    // Calculate number (0 at top, increasing clockwise or counter-clockwise? usually clockwise decreases number on the dial if the dial spins, but let's just map angle to number linearly)
    const num = Math.round((deg / 360) * TOTAL_NUMBERS) % TOTAL_NUMBERS;
    
    setCurrentNumber(prev => {
      if (prev !== num) {
        playClick();
        return num;
      }
      return prev;
    });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex items-center justify-center p-8"
      onPointerMove={handlePointerMove}
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

      {/* Foreground Safe Door */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-800"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            style={{
              backgroundImage: 'radial-gradient(circle at center, #3f3f46 0%, #18181b 100%)'
            }}
          >
            
            <p className="absolute top-12 font-mono text-zinc-400 tracking-widest uppercase text-sm">
              Enter Combination
            </p>

            {/* Sequence Indicator */}
            <div className="absolute top-24 flex gap-4">
              {TARGET_COMBINATION.map((target, idx) => (
                <div 
                  key={idx} 
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 ${
                    sequence.length > idx 
                      ? 'border-green-500 text-green-500' 
                      : 'border-zinc-700 text-zinc-700'
                  }`}
                >
                  {sequence.length > idx ? target : '?'}
                </div>
              ))}
            </div>

            {/* The Dial Assembly */}
            <div className="relative mt-12 w-64 h-64">
              
              {/* Outer Ring / Base */}
              <div className="absolute inset-[-10px] rounded-full bg-zinc-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-zinc-600" />
              
              {/* Fixed Top Marker */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-6 bg-red-500 z-30 rounded-sm shadow-md" />

              {/* The Rotating Dial */}
              <div 
                ref={dialRef}
                className="absolute inset-0 rounded-full bg-zinc-300 border-4 border-zinc-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                style={{
                  transform: `rotate(${-angle}deg)` // negative so dragging clockwise rotates dial clockwise
                }}
              >
                {/* Dial Ticks and Numbers */}
                {Array.from({ length: TOTAL_NUMBERS }).map((_, i) => {
                  const isMajor = i % 10 === 0;
                  const isMedium = i % 5 === 0 && !isMajor;
                  const rot = (i / TOTAL_NUMBERS) * 360;
                  return (
                    <div 
                      key={i}
                      className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center"
                      style={{ 
                        height: '50%',
                        transform: `rotate(${rot}deg)` 
                      }}
                    >
                      <div className={`bg-zinc-800 ${isMajor ? 'w-1 h-3' : isMedium ? 'w-0.5 h-2' : 'w-0.5 h-1'}`} />
                      {isMajor && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-zinc-800" style={{ transform: 'rotate(180deg)' }}>
                          {i}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Inner Grip */}
                <div className="absolute inset-16 rounded-full bg-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 border-zinc-600 flex items-center justify-center pointer-events-none">
                  <Lock className="text-zinc-600" size={32} />
                </div>
              </div>
              
            </div>

            <p className="absolute bottom-12 font-mono text-zinc-500 text-xs tracking-widest text-center max-w-xs">
              Rotate dial to the correct numbers and release to enter
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
