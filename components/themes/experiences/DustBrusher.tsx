"use client";

import React, { useRef, useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Brush } from "lucide-react";

export function DustBrusher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#292524"];
  const photoSrc = config.mediaUrl || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop";
  const title = config.title || "Forgotten Photo";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealPercent, setRevealPercent] = useState(0);
  const dustRegenRef = useRef<number>(0);
  const brushSize = 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with dust
    ctx.fillStyle = "#78716c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 60;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Start dust regeneration loop
    const regenerateDust = () => {
      const ctx2 = canvas.getContext("2d");
      if (!ctx2) return;
      ctx2.fillStyle = "rgba(120, 113, 108, 0.008)";
      ctx2.fillRect(0, 0, canvas.width, canvas.height);
      dustRegenRef.current = requestAnimationFrame(regenerateDust);
    };
    dustRegenRef.current = requestAnimationFrame(regenerateDust);

    return () => {
      if (dustRegenRef.current) cancelAnimationFrame(dustRegenRef.current);
    };
  }, []);

  const eraseAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Calculate reveal percentage
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] < 50) transparent++;
    }
    const pct = (transparent / (canvas.width * canvas.height)) * 100;
    setRevealPercent(pct);
    if (pct > 60 && onComplete) onComplete();
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
    eraseAt(x, y);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h2 className="text-lg font-black text-stone-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <Brush size={16} /> {title}
        </h2>
        <p className="text-[10px] text-stone-500 mt-1">Rub to brush away the dust</p>
      </div>

      <div className="flex-1 relative m-6 mt-14 rounded-lg overflow-hidden shadow-2xl">
        <img src={photoSrc} alt="Hidden Photo" className="absolute inset-0 w-full h-full object-cover" />
        <canvas
          ref={canvasRef}
          width={500}
          height={600}
          className="absolute inset-0 w-full h-full z-10 cursor-pointer"
          onMouseMove={handleMove}
          onTouchMove={handleMove}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-stone-800/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-stone-300 font-mono">
        {revealPercent.toFixed(0)}% revealed
      </div>
    </div>
  );
}
