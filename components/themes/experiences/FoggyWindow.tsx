"use client";

import React, { useRef, useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";

export function FoggyWindow({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [clearedCells, setClearedCells] = useState<Set<string>>(new Set());

  // Grid for win condition calculation
  const GRID_SIZE = 40;
  const WIN_THRESHOLD = 0.5; // 50% cleared

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set real size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with "fog" (semi-transparent whiteish)
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some random "water drops"
    for(let i=0; i<30; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width, 
        Math.random() * canvas.height, 
        Math.random() * 4 + 2, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
    }

  }, []);

  const erase = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Soft erase brush
    const brushRadius = 30;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, brushRadius);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.5, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over"; // reset

    // Update cleared grid
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    const cellId = `${gridX},${gridY}`;
    
    if (!clearedCells.has(cellId)) {
      const newCleared = new Set(clearedCells).add(cellId);
      setClearedCells(newCleared);

      // Check win
      const totalCols = Math.ceil(canvas.width / GRID_SIZE);
      const totalRows = Math.ceil(canvas.height / GRID_SIZE);
      const totalCells = totalCols * totalRows;

      if (newCleared.size / totalCells > WIN_THRESHOLD && !isRevealed) {
        setIsRevealed(true);
        onComplete?.();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return; // Only erase if mouse is down
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    erase(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    erase(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] touch-none select-none"
      ref={containerRef}
    >
      
      {/* Background Revealed Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[var(--exp-background)]">
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Scenery" 
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

      {/* Fog Canvas Overlay */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-1000 ${isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ 
          backdropFilter: "blur(12px)", 
          WebkitBackdropFilter: "blur(12px)" // Safari support
        }}
      />
      
      {!isRevealed && (
        <p className="absolute bottom-12 w-full text-center text-black/50 font-heading animate-pulse pointer-events-none mix-blend-overlay">
          Wipe the window
        </p>
      )}

    </div>
  );
}
