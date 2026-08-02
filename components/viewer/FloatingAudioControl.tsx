"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface FloatingAudioControlProps {
  audioMuted: boolean;
  isPlaying: boolean;
  volume: number; // 0 to 1
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (vol: number) => void;
}

export function FloatingAudioControl({
  audioMuted,
  isPlaying,
  volume,
  onToggleMute,
  onTogglePlay,
  onVolumeChange,
}: FloatingAudioControlProps) {
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cc-audio-position");
      if (saved) {
        try {
          setPosition(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse audio position", e);
        }
      }
      setMounted(true);
    }
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };
    setPosition(newPos);
    localStorage.setItem("cc-audio-position", JSON.stringify(newPos));
  };

  const barVariants = {
    animate: (customDelay: number) => ({
      scaleY: [0.3, 1, 0.4, 0.8, 0.3],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: customDelay,
      },
    }),
    idle: {
      scaleY: 0.3,
    },
  };

  if (!mounted) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      animate={{ x: position.x, y: position.y }}
      onDragEnd={handleDragEnd}
      className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-floating select-none cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Expanded Panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-card/90 border border-border p-4 rounded-3xl flex flex-col items-center gap-3.5 shadow-2xl backdrop-blur-md w-32"
            >
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center transition active:scale-95 shadow-sm focus-ring cursor-pointer"
                title={isPlaying ? "Pause music" : "Play music"}
              >
                {isPlaying ? (
                  <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume Controller Slider */}
              <div className="flex flex-col items-center gap-2.5 w-full">
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground">
                  <span>Volume</span>
                  <span className="font-mono">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
              </div>

              {/* Mute Toggle inside Panel */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute();
                }}
                className={clsx(
                  "text-[10px] font-bold px-3 py-1.5 rounded-full border cursor-pointer focus-ring transition-all duration-200 active:scale-95 w-full text-center",
                  audioMuted
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {audioMuted ? "Unmute" : "Mute"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Pill Trigger Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 active:scale-95 focus-ring cursor-pointer select-none",
            expanded
              ? "bg-primary border-primary/20 text-primary-foreground"
              : "bg-card/85 border-border hover:border-muted-foreground/30 text-foreground hover:scale-105"
          )}
        >
          {/* Animated Equalizer Visualizer Bars */}
          <div className="flex items-end gap-[1.5px] h-3.5 w-4 shrink-0 select-none overflow-hidden pb-[1px]">
            {[0.1, 0.4, 0.2, 0.5].map((delay, index) => (
              <motion.span
                key={index}
                custom={delay}
                variants={barVariants}
                animate={isPlaying && !audioMuted ? "animate" : "idle"}
                className={clsx(
                  "w-[2px] h-3 origin-bottom rounded-full",
                  expanded ? "bg-primary-foreground" : "bg-primary"
                )}
              />
            ))}
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
            {expanded ? "Close" : "Music"}
          </span>

          <span className="text-xs ml-0.5 shrink-0 opacity-80">
            {audioMuted ? (
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
