"use client";

import React, { useEffect, useRef } from "react";
import { prefersReducedMotion, getHardwareTier } from "../../../lib/utils/device";

interface RainCanvasProps {
  className?: string;
  rainColor?: string;
}

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  wind: number;
}

interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
  active: boolean;
}

const MAX_SPLASHES = 150;
const splashPool: Splash[] = Array.from({ length: MAX_SPLASHES }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  alpha: 0,
  radius: 1,
  active: false,
}));

function getInactiveSplash(): Splash | null {
  for (let i = 0; i < MAX_SPLASHES; i++) {
    if (!splashPool[i].active) return splashPool[i];
  }
  return null;
}

export function RainCanvas({
  className,
  rainColor = "rgba(156, 163, 175, 0.4)",
}: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    const hardwareTier = getHardwareTier();
    const dropCount = hardwareTier === "low" ? 60 : hardwareTier === "medium" ? 120 : 250;

    // Set up raindrops
    const drops: Raindrop[] = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      length: Math.random() * 20 + 15,
      speed: Math.random() * 10 + 12,
      wind: -1.5, // slightly diagonal rain
    }));

    const createSplash = (x: number, y: number) => {
      // Spawn 3-5 splash drops
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const s = getInactiveSplash();
        if (!s) break;
        s.x = x;
        s.y = y;
        // Explode upward and outward
        s.vx = (Math.random() - 0.5) * 4;
        s.vy = -(Math.random() * 3 + 1);
        s.alpha = 1.0;
        s.radius = Math.random() * 1.2 + 0.8;
        s.active = true;
      }
    };

    const handleResize = () => {
      const oldWidth = width;
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;

      drops.forEach((d) => {
        d.x = (d.x / oldWidth) * width;
      });
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update raindrops
      ctx.strokeStyle = rainColor;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // Draw droplet line
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.wind * (d.length / 10), d.y + d.length);
        ctx.stroke();

        // Update positions
        d.y += d.speed;
        d.x += d.wind;

        // Check if hit the ground
        if (d.y >= height) {
          createSplash(d.x, height - 2);
          // Recycle raindrop above top edge
          d.y = Math.random() * -50;
          d.x = Math.random() * width;
        }

        // Left/Right wrap boundaries
        if (d.x < -20) {
          d.x = width + 10;
        } else if (d.x > width + 20) {
          d.x = -10;
        }
      }

      // 2. Draw and update active splashes
      for (let i = 0; i < MAX_SPLASHES; i++) {
        const s = splashPool[i];
        if (!s.active) continue;

        // Draw tiny splash droplet
        ctx.save();
        ctx.fillStyle = rainColor;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update position (gravity slows upward path)
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.25; // gravity factor
        s.alpha -= 0.04; // fade rate

        if (s.alpha <= 0 || s.y > height) {
          s.active = false;
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      splashPool.forEach((s) => (s.active = false));
    };
  }, [rainColor]);

  return (
    <div ref={containerRef} className={className || "relative w-full h-full overflow-hidden"}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export default RainCanvas;
