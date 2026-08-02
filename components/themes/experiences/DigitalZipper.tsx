"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export function DigitalZipper({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(1000);
  const zipperY = useMotionValue(0);

  const progress = useTransform(zipperY, [0, containerHeight - 64], [0, 1]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsub = progress.on("change", (latest) => {
      if (latest > 0.95 && !isRevealed) {
        setIsRevealed(true);
        onComplete?.();
      }
    });
    return () => unsub();
  }, [progress, isRevealed, onComplete]);

  const leftClipPath = useTransform(progress, (p) => {
    const yPercent = p * 100;
    const topX = 100 - (p * 50); 
    return `polygon(0% 0%, 0% 100%, 100% 100%, 100% ${yPercent}%, ${topX}% 0%)`;
  });

  const rightClipPath = useTransform(progress, (p) => {
    const yPercent = p * 100;
    const topX = p * 50; 
    return `polygon(100% 0%, 100% 100%, 0% 100%, 0% ${yPercent}%, ${topX}% 0%)`;
  });

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex items-center justify-center"
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
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Zipper Layer */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            
            {/* Left Fabric */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-zinc-800 pointer-events-none border-r border-zinc-900 shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
              style={{ clipPath: leftClipPath }}
            >
               {/* Fabric texture */}
               <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
               }} />
            </motion.div>

            {/* Right Fabric */}
            <motion.div 
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-zinc-800 pointer-events-none border-l border-zinc-900 shadow-[-2px_0_10px_rgba(0,0,0,0.5)]"
              style={{ clipPath: rightClipPath }}
            >
               {/* Fabric texture */}
               <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
               }} />
            </motion.div>

            {/* Center Zipper Track */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4 bg-zinc-900 pointer-events-none"
              style={{ 
                top: zipperY,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, #3f3f46 4px, #3f3f46 8px)'
              }}
            />

            {/* The Draggable Zipper Head */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-20 pointer-events-auto flex justify-center">
              <motion.div 
                className="w-12 h-16 bg-zinc-400 rounded-b-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing border-b-4 border-zinc-500 relative"
                drag="y"
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                style={{ y: zipperY }}
              >
                {/* Zipper Pull Hole */}
                <div className="w-4 h-8 border-2 border-zinc-600 rounded-full mt-4" />
                {/* Top Connector */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-300 rounded-t-md border-t-2 border-zinc-400" />
              </motion.div>
            </div>

            <p className="absolute top-12 left-1/2 -translate-x-1/2 font-mono text-zinc-400 tracking-widest uppercase text-sm pointer-events-none animate-pulse">
              Pull Down
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
