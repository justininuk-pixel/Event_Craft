"use client";

import React, { useEffect, useRef } from "react";
import { prefersReducedMotion, getHardwareTier } from "../../../lib/utils/device";

interface FireworksCanvasProps {
  colors?: string[];
  className?: string;
  autoLaunch?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  fade: number;
  size: number;
  gravity: number;
  friction: number;
  active: boolean;
}

// Particle pool size
const MAX_PARTICLES = 300;
const pool: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  color: "#ffffff",
  alpha: 1,
  fade: 0.015,
  size: 2,
  gravity: 0.05,
  friction: 0.96,
  active: false,
}));

function getInactiveParticle(): Particle | null {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    if (!pool[i].active) return pool[i];
  }
  return null;
}

export function FireworksCanvas({
  colors = ["#ff0055", "#00ffcc", "#ffcc00", "#ff00ff", "#00ff00", "#00ffff"],
  className,
  autoLaunch = true,
}: FireworksCanvasProps) {
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
    const particleMultiplier = hardwareTier === "low" ? 0.3 : hardwareTier === "medium" ? 0.6 : 1.0;

    const createBurst = (x: number, y: number, color: string) => {
      const numParticles = Math.round((50 + Math.random() * 40) * particleMultiplier);
      for (let i = 0; i < numParticles; i++) {
        const p = getInactiveParticle();
        if (!p) break;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;

        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.color = color;
        p.alpha = 1;
        p.fade = Math.random() * 0.015 + 0.01;
        p.size = Math.random() * 2.5 + 1.5;
        p.gravity = 0.08;
        p.friction = 0.95;
        p.active = true;
      }
    };

    const handleResize = () => {
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Dynamic launcher
    let launchTimer: number | null = null;
    if (autoLaunch) {
      const scheduleLaunch = () => {
        const nextTime = Math.random() * 1500 + 800; // between 0.8s and 2.3s
        launchTimer = window.setTimeout(() => {
          const rx = Math.random() * width * 0.8 + width * 0.1;
          const ry = Math.random() * height * 0.4 + height * 0.15;
          const rColor = colors[Math.floor(Math.random() * colors.length)];
          createBurst(rx, ry, rColor);
          scheduleLaunch();
        }, nextTime);
      };
      scheduleLaunch();
    }

    // Canvas click to spawn custom fireworks
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const rColor = colors[Math.floor(Math.random() * colors.length)];
      createBurst(clickX, clickY, rColor);
    };
    canvas.addEventListener("click", handleClick);

    let animationId: number;

    const animate = () => {
      // Draw faint translucent background for trailing effect
      ctx.fillStyle = "rgba(10, 10, 15, 0.2)";
      ctx.fillRect(0, 0, width, height);

      // Update & Render Particles
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = pool[i];
        if (!p.active) continue;

        // Apply friction and gravity
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;

        p.x += p.vx;
        p.y += p.vy;

        p.alpha -= p.fade;

        if (p.alpha <= 0 || p.x < 0 || p.x > width || p.y > height) {
          p.active = false;
          continue;
        }

        // Draw sparkly particle with subtle inner glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Tab visibility handling (pause to save performance)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
        if (launchTimer) {
          clearTimeout(launchTimer);
          launchTimer = null;
        }
      } else {
        animationId = requestAnimationFrame(animate);
        if (autoLaunch && !launchTimer) {
          const scheduleLaunch = () => {
            const nextTime = Math.random() * 1500 + 800;
            launchTimer = window.setTimeout(() => {
              const rx = Math.random() * width * 0.8 + width * 0.1;
              const ry = Math.random() * height * 0.4 + height * 0.15;
              const rColor = colors[Math.floor(Math.random() * colors.length)];
              createBurst(rx, ry, rColor);
              scheduleLaunch();
            }, nextTime);
          };
          scheduleLaunch();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("click", handleClick);
      if (launchTimer) clearTimeout(launchTimer);
      // Clean pool
      pool.forEach((p) => (p.active = false));
    };
  }, [colors, autoLaunch]);

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

export default FireworksCanvas;
