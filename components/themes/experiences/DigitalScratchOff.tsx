"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function DigitalScratchOff({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [clearedPercentage, setClearedPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set real size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Paint opaque foil layer
    ctx.fillStyle = palette.secondary || "#cccccc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise or pattern to make it look like foil
    ctx.fillStyle = palette.text;
    ctx.font = "bold 32px var(--exp-font-heading)";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Me!", canvas.width / 2, canvas.height / 2);

    // Setup for scratching
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 60; // Brush size
    ctx.globalCompositeOperation = "destination-out";
  }, [palette, isRevealed]);

  const calculateClearedArea = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    
    // Check alpha channel of every 16th pixel to save CPU
    const step = 4 * 16;
    let checked = 0;
    for (let i = 3; i < imageData.length; i += step) {
      if (imageData[i] < 128) transparentPixels++;
      checked++;
    }

    const percent = (transparentPixels / checked) * 100;
    setClearedPercentage(percent);

    if (percent > 60 && !isRevealed) {
      setIsRevealed(true);
      onComplete?.();
    }
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Only calculate occasionally to save performance
    if (Math.random() < 0.1) calculateClearedArea();
  };

  const startScratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    setIsScratching(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const endScratch = () => {
    setIsScratching(false);
    calculateClearedArea();
  };

  return (
    <div className="w-full h-full flex flex-col relative text-[var(--exp-text)]" ref={containerRef}>
      
      {/* Background Revealed Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[var(--exp-primary)]">
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Surprise" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-secondary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text-secondary)] whitespace-pre-wrap">
          {config.body}
        </p>
      </div>

      {/* Foreground Canvas Mask */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            onPointerDown={startScratch}
            onPointerMove={scratch}
            onPointerUp={endScratch}
            onPointerCancel={endScratch}
            className="absolute inset-0 w-full h-full touch-none cursor-pointer z-10"
            style={{ touchAction: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Progress Meter */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div 
            className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm pointer-events-none z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div 
              className="h-full bg-[var(--exp-accent)] transition-all duration-200 ease-out" 
              style={{ width: `${Math.min(100, (clearedPercentage / 60) * 100)}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
