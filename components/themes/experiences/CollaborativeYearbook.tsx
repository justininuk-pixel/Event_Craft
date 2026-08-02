"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Pen, Eraser, Palette } from "lucide-react";

const BRUSH_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#000000"];

export function CollaborativeYearbook({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"];

  const photoSrc = config.mediaUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop";
  const title = config.title || "Sign My Yearbook!";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushSize, setBrushSize] = useState(3);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    lastPosRef.current = getPos(e);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !lastPosRef.current) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const endDraw = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    if (onComplete) onComplete();
  };

  return (
    <div
      className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* Yearbook page texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <h2 className="text-xl font-black text-amber-900 uppercase tracking-widest">{title}</h2>
        <p className="text-[10px] text-amber-700/50 mt-1">Draw messages over the photo</p>
      </div>

      {/* Photo + Canvas overlay */}
      <div className="flex-1 relative mt-16 mx-4 mb-20 rounded-lg overflow-hidden shadow-xl border-4 border-white">
        <img src={photoSrc} alt="Yearbook Photo" className="absolute inset-0 w-full h-full object-cover" />
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-amber-200 p-3 flex items-center gap-3 justify-center">
        <Pen size={16} className="text-amber-700 shrink-0" />
        {BRUSH_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setBrushColor(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${brushColor === c ? "scale-125 border-amber-900" : "border-transparent scale-100"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="w-px h-6 bg-amber-300 mx-1" />
        <button onClick={() => setBrushSize(brushSize === 3 ? 8 : 3)} className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100 px-2 py-1 rounded">
          {brushSize === 3 ? "Thin" : "Thick"}
        </button>
      </div>
    </div>
  );
}
