"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MagnifyingGlass({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // percentages
  const [isRevealed, setIsRevealed] = useState(false);
  const activeTimeRef = useRef(0);
  const lastMoveRef = useRef(0);

  useEffect(() => {
    let req: number;
    const loop = (t: number) => {
      if (isRevealed) return;
      if (lastMoveRef.current > 0 && t - lastMoveRef.current < 200) {
        // user is currently actively moving the lens
        activeTimeRef.current += 16; // approximate frame time
        if (activeTimeRef.current > 5000) {
          setIsRevealed(true);
          onComplete?.();
        }
      }
      req = requestAnimationFrame(loop);
    };
    req = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(req);
  }, [isRevealed, onComplete]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || isRevealed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
    lastMoveRef.current = performance.now();
  };

  const Content = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
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
      <p className="text-lg font-body whitespace-pre-wrap max-w-sm text-[var(--exp-text)]">
        {config.body}
      </p>
    </div>
  );

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] touch-none select-none cursor-none"
      ref={containerRef}
      onPointerMove={handlePointerMove}
    >
      
      {/* Background (Blurry & Scaled Up) */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center bg-[var(--exp-primary)]"
        style={{ 
          filter: isRevealed ? "none" : "blur(12px) brightness(0.6)",
          transform: isRevealed ? "scale(1)" : "scale(1.5)",
        }}
      >
        <Content />
      </div>

      {/* Foreground (Sharp & Masked) */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-10 bg-[var(--exp-primary)]"
            style={{ 
              WebkitMaskImage: `radial-gradient(circle 80px at ${pos.x}% ${pos.y}%, black 90%, transparent 100%)`,
              maskImage: `radial-gradient(circle 80px at ${pos.x}% ${pos.y}%, black 90%, transparent 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <Content />
            {/* Magnifying Glass Ring */}
            <div 
              className="absolute pointer-events-none rounded-full border-[4px] border-white/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]"
              style={{
                width: 160,
                height: 160,
                left: `calc(${pos.x}% - 80px)`,
                top: `calc(${pos.y}% - 80px)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
