"use client";

import React, { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface GlitchOverlayProps {
  children?: React.ReactNode;
  intensity?: "low" | "medium" | "high";
  active?: boolean;
  className?: string;
}

export function GlitchOverlay({
  children,
  intensity = "medium",
  active = true,
  className,
}: GlitchOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [glitchState, setGlitchState] = useState({ x: 0, y: 0, shadowColor: "" });

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;

    // Define intervals and factors based on intensity
    const intervalTime = intensity === "low" ? 800 : intensity === "medium" ? 350 : 120;
    const maxOffset = intensity === "low" ? 2 : intensity === "medium" ? 5 : 10;

    const interval = setInterval(() => {
      // Small chance to not glitch (making it feel more organic)
      if (Math.random() > 0.65) {
        setGlitchState({ x: 0, y: 0, shadowColor: "" });
        return;
      }

      const dx = (Math.random() - 0.5) * maxOffset;
      const dy = (Math.random() - 0.5) * maxOffset;
      const colors = ["rgba(255, 0, 80, 0.7)", "rgba(0, 240, 255, 0.7)", "rgba(0, 255, 0, 0.7)"];
      const rColor = colors[Math.floor(Math.random() * colors.length)];

      setGlitchState({ x: dx, y: dy, shadowColor: rColor });
    }, intervalTime);

    return () => {
      clearInterval(interval);
      setGlitchState({ x: 0, y: 0, shadowColor: "" });
    };
  }, [active, intensity]);

  // Canvas-driven digital noise / horizontal bars
  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 300;
      height = canvas.height = canvas.parentElement?.clientHeight || 200;
    };
    window.addEventListener("resize", handleResize);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const glitchChance = intensity === "low" ? 0.02 : intensity === "medium" ? 0.05 : 0.12;

      if (Math.random() < glitchChance) {
        // Draw 1-3 horizontal glitch slices
        const numSlices = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numSlices; i++) {
          const sy = Math.random() * height;
          const sh = Math.random() * (height * 0.15) + 5;
          const sx = (Math.random() - 0.5) * (intensity === "low" ? 10 : intensity === "medium" ? 30 : 60);

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
          ctx.fillRect(sx, sy, width, sh);

          // Digital line/bar
          if (Math.random() > 0.5) {
            ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 0, 85, 0.3)" : "rgba(0, 230, 255, 0.3)";
            ctx.fillRect(0, sy, width, 2);
          }
        }
      }

      // Draw subtle analog TV scan lines
      if (intensity !== "low") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, intensity]);

  return (
    <div
      ref={containerRef}
      className={className || "relative inline-block"}
      style={{
        transform: glitchState.x !== 0 ? `translate(${glitchState.x}px, ${glitchState.y}px)` : "none",
        textShadow: glitchState.shadowColor
          ? `${glitchState.x * 1.5}px ${glitchState.y * 1.5}px 0 ${glitchState.shadowColor}`
          : "none",
        transition: "transform 0.05s ease, text-shadow 0.05s ease",
      }}
    >
      {/* Glitch Overlay Canvas */}
      {active && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-50 w-full h-full mix-blend-screen"
        />
      )}
      {children}
    </div>
  );
}

export default GlitchOverlay;
