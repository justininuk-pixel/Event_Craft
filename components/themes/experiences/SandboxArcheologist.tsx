"use client";

import React, { useRef, useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Shovel, Clock } from "lucide-react";

export function SandboxArcheologist({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#d4d4d8"];
  const title = config.title || "The Time Capsule";
  const hiddenMemory = config.body || "We buried this in the backyard behind the shed. Inside was a baseball card, a plastic dinosaur, and a note to our future selves.";
  const timeLimit = (config.experience as any)?.timeLimit || 15; // seconds

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [isDigging, setIsDigging] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [revealPercent, setRevealPercent] = useState(0);

  const brushSize = 60; // large brush for frantic digging

  // Setup Sand Canvas
  const fillSand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sand color
    ctx.fillStyle = "#eab308"; // yellow-500
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sand noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 80;
      data[i] = Math.min(255, Math.max(0, data[i] + noise)); // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
    }
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    fillSand();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isFound || !isDigging) return;

    if (timeLeft <= 0) {
      // Time's up! Reset sand
      setIsDigging(false);
      setTimeLeft(timeLimit);
      setRevealPercent(0);
      fillSand();
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 100, 100]);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isDigging, timeLeft, isFound, timeLimit]);

  const digAt = (x: number, y: number) => {
    if (isFound) return;
    if (!isDigging) setIsDigging(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Subtractive blending to erase sand
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    // Rough, jagged brush for digging
    for (let i = 0; i < 5; i++) {
       const ox = (Math.random() - 0.5) * 20;
       const oy = (Math.random() - 0.5) * 20;
       ctx.arc(x + ox, y + oy, brushSize * Math.random(), 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Calculate how much of the CENTER is revealed
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const targetSize = 150; // area to check
    
    const imgData = ctx.getImageData(cx - targetSize/2, cy - targetSize/2, targetSize, targetSize);
    let transparent = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] < 50) transparent++;
    }
    
    const pct = (transparent / (targetSize * targetSize)) * 100;
    setRevealPercent(pct);

    if (pct > 80) {
      setIsFound(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (onComplete) setTimeout(onComplete, 3000);
    }
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    if ("touches" in e) {
      x = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
      y = ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height;
    } else {
      const me = e as React.MouseEvent;
      if (me.buttons !== 1) return;
      x = ((me.clientX - rect.left) / rect.width) * canvas.width;
      y = ((me.clientY - rect.top) / rect.height) * canvas.height;
    }
    digAt(x, y);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-zinc-300" style={{ backgroundColor: bgColors[0] }}>
      
      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center bg-white/80 backdrop-blur px-4 py-2 rounded shadow-sm border border-zinc-300">
        <h2 className="font-bold text-zinc-800 flex items-center gap-2">
           <Shovel size={16} className="text-yellow-600" /> Dig!
        </h2>
        <div className={`flex items-center gap-2 font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-zinc-700'}`}>
           <Clock size={16} /> 00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* The Sandbox */}
      <div className="flex-1 relative w-full h-full">
        
        {/* The Hidden Treasure (only revealed when sand is erased) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8 z-0">
           <div className="bg-white p-6 rounded shadow-xl border-4 border-zinc-200 max-w-sm w-full text-center transform -rotate-2">
              <h3 className="text-2xl font-black text-zinc-900 mb-2 font-sans tracking-tight">{title}</h3>
              <p className="text-zinc-600 font-serif leading-relaxed text-sm">
                 {hiddenMemory}
              </p>
           </div>
        </div>

        {/* The Sand Layer */}
        <canvas
          ref={canvasRef}
          width={400}
          height={800}
          className={`absolute inset-0 w-full h-full z-10 cursor-crosshair transition-opacity duration-1000 ${isFound ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
        />
        
        {/* Dig Instruction Overlay */}
        {!isDigging && !isFound && (
           <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white px-6 py-3 rounded-full animate-bounce backdrop-blur-sm">
                 Swipe rapidly to dig
              </div>
           </div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isFound && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute bottom-10 left-10 right-10 z-30 bg-green-500 text-white p-4 rounded-lg shadow-2xl text-center border-2 border-green-400"
           >
              <h3 className="font-black uppercase tracking-widest mb-1">Capsule Unearthed</h3>
              <p className="text-sm font-bold text-green-100">With {timeLeft} seconds to spare.</p>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
