"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Flashlight } from "lucide-react";

export function SecretDiaryUVLight({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"];
  const secretText = config.body || "Dear diary, today I told Sarah I liked her. She laughed. But then she held my hand on the walk home. I think that means she likes me too. I hope so. I really, really hope so.";
  const title = config.title || "The Secret Diary";

  const [lightPos, setLightPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lightRadius = 80;

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x: number, y: number;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }
    setLightPos({ x, y });
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>

      {/* Paper texture background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h2 className="text-lg font-black text-purple-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <Flashlight size={16} /> {title}
        </h2>
        <p className="text-[10px] text-purple-400/50 mt-1">Move your finger to reveal the invisible ink</p>
      </div>

      {/* Interactive area */}
      <div
        ref={containerRef}
        className="flex-1 relative mt-14 mx-6 mb-6 cursor-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {/* The hidden text - only visible under the UV light via clip-path */}
        <div
          className="absolute inset-0 p-8 leading-relaxed text-lg text-purple-200 font-serif"
          style={{
            clipPath: `circle(${lightRadius}px at ${lightPos.x}px ${lightPos.y}px)`,
          }}
        >
          <p className="whitespace-pre-wrap">{secretText}</p>
        </div>

        {/* UV Light glow effect */}
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: lightPos.x - lightRadius,
            top: lightPos.y - lightRadius,
            width: lightRadius * 2,
            height: lightRadius * 2,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 40%, transparent 70%)",
            boxShadow: "0 0 40px rgba(147,51,234,0.4), 0 0 80px rgba(147,51,234,0.2)",
          }}
        />

        {/* Faint ruled lines on the paper */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(transparent, transparent 28px, rgba(147,51,234,0.3) 28px, rgba(147,51,234,0.3) 29px)",
          backgroundSize: "100% 29px",
        }} />
      </div>
    </div>
  );
}
