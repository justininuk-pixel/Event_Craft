"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScratchRevealProps {
  children: React.ReactNode;
  scratchColor?: "gold" | "silver" | string;
  revealThreshold?: number; // percentage of scratched surface needed to fully reveal (0 to 1, e.g. 0.5)
  onRevealed?: () => void;
  className?: string;
  brushSize?: number;
}

export function ScratchReveal({
  children,
  scratchColor = "gold",
  revealThreshold = 0.5,
  onRevealed,
  className,
  brushSize = 35,
}: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth || 300);
    let height = (canvas.height = container.clientHeight || 200);

    // Initial draw of the scratch card texture
    const drawScratchLayer = () => {
      ctx.save();
      if (scratchColor === "gold") {
        // Gold Metallic Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#d4af37");
        grad.addColorStop(0.25, "#f3e5ab");
        grad.addColorStop(0.5, "#aa771c");
        grad.addColorStop(0.75, "#ffd700");
        grad.addColorStop(1, "#8b6508");
        ctx.fillStyle = grad;
      } else if (scratchColor === "silver") {
        // Silver Metallic Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#8a95a5");
        grad.addColorStop(0.3, "#cfd2d6");
        grad.addColorStop(0.5, "#e3e4e6");
        grad.addColorStop(0.7, "#a1a8b3");
        grad.addColorStop(1, "#636d7a");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = scratchColor;
      }
      ctx.fillRect(0, 0, width, height);

      // Add speckles for metallic noise texture
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      for (let i = 0; i < (width * height) / 4; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < (width * height) / 4; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Border frame
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      // Scratch Prompt Text
      ctx.fillStyle = scratchColor === "gold" ? "#4a3308" : "#2d3540";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Scratch Here! ✨", width / 2, height / 2);

      ctx.restore();
    };

    drawScratchLayer();

    const handleResize = () => {
      // Don't redraw if already revealed/scratched
      if (isScratched) return;
      width = canvas.width = container.clientWidth || 300;
      height = canvas.height = container.clientHeight || 200;
      drawScratchLayer();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scratchColor, isScratched]);

  // Scratch Action Calculations
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Scan pixels at a stride to prevent heavy UI lag
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const stride = 16; // Check every 16th pixel (both x and y)
    let totalChecked = 0;
    let transparentCount = 0;

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const idx = (y * width + x) * 4;
        totalChecked++;
        // Check alpha channel
        if (pixels[idx + 3] === 0) {
          transparentCount++;
        }
      }
    }

    const ratio = transparentCount / totalChecked;
    if (ratio >= revealThreshold) {
      revealCard();
    }
  };

  const revealCard = () => {
    setIsScratched(true);
    if (onRevealed) {
      onRevealed();
    }
  };

  // Drawing routines
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startScratching = (e: React.MouseEvent | React.TouchEvent) => {
    if (isScratched) return;
    setIsDrawing(true);
    scratch(e);
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isScratched) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const stopScratching = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    checkScratchPercentage();
  };

  return (
    <div
      ref={containerRef}
      className={className ? `select-none touch-none ${className}` : "relative select-none touch-none"}
    >
      {/* Target card content underneath */}
      <div className="w-full h-full">{children}</div>

      {/* Erasable scratch canvas */}
      {!isScratched && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 top-0 left-0 w-full h-full cursor-crosshair z-25 transition-opacity duration-500 ease-out"
          style={{ opacity: isScratched ? 0 : 1 }}
          onMouseDown={startScratching}
          onMouseMove={scratch}
          onMouseUp={stopScratching}
          onMouseLeave={stopScratching}
          onTouchStart={startScratching}
          onTouchMove={scratch}
          onTouchEnd={stopScratching}
        />
      )}
    </div>
  );
}

export default ScratchReveal;
