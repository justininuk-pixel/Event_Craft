"use client";

import React, { useEffect, useRef } from "react";
import { prefersReducedMotion, getHardwareTier } from "../../../lib/utils/device";

interface SnowfallCanvasProps {
  className?: string;
  snowColor?: string;
  accumulate?: boolean;
}

interface Snowflake {
  x: number;
  y: number;
  r: number; // radius
  d: number; // density (speed factor)
  opacity: number;
}

export function SnowfallCanvas({
  className,
  snowColor = "rgba(255, 255, 255, 0.85)",
  accumulate = true,
}: SnowfallCanvasProps) {
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
    const snowCount = hardwareTier === "low" ? 40 : hardwareTier === "medium" ? 80 : 160;

    // Snowflakes setup
    const flakes: Snowflake[] = Array.from({ length: snowCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      d: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.3,
    }));

    // Accumulation height map setup
    const colWidth = 4; // Width of each ground column
    const totalCols = Math.ceil(width / colWidth);
    let groundHeights = new Float32Array(totalCols); // Height of accumulated snow at each col

    const handleResize = () => {
      const oldWidth = width;
      const oldHeight = height;

      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;

      // Adjust height map size and scale
      const newTotalCols = Math.ceil(width / colWidth);
      const newHeights = new Float32Array(newTotalCols);

      // Copy old height map values proportionally
      for (let i = 0; i < newTotalCols; i++) {
        const sourceIndex = Math.floor((i / newTotalCols) * totalCols);
        newHeights[i] = groundHeights[sourceIndex] || 0;
      }
      // Re-assign height map
      groundHeights = newHeights;

      flakes.forEach((f) => {
        f.x = (f.x / oldWidth) * width;
        f.y = (f.y / oldHeight) * height;
      });
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Draw fallen snow accumulation
      if (accumulate) {
        ctx.fillStyle = snowColor;
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let i = 0; i < groundHeights.length; i++) {
          const x = i * colWidth;
          const y = height - groundHeights[i];
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      // Dynamic wind drift based on time
      const wind = Math.sin(time) * 0.5;

      // Draw and update snowflakes
      ctx.fillStyle = snowColor;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        ctx.save();
        ctx.globalAlpha = f.opacity;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update positions
        f.y += f.d; // vertical fall
        f.x += wind + (Math.sin(time + f.d) * 0.2); // swaying float

        // Check if hitting ground / accumulation boundary
        const colIndex = Math.floor(f.x / colWidth);
        const currentGround = colIndex >= 0 && colIndex < groundHeights.length ? groundHeights[colIndex] : 0;

        if (f.y >= height - currentGround) {
          // Accumulate snow if enabled
          if (accumulate && colIndex >= 0 && colIndex < groundHeights.length) {
            // Distribute flake mass to columns around the impact point for smooth heap creation
            const spreadWidth = 3;
            for (let w = -spreadWidth; w <= spreadWidth; w++) {
              const checkIdx = colIndex + w;
              if (checkIdx >= 0 && checkIdx < groundHeights.length) {
                // Diminishing heap amount outwards
                const distFactor = (spreadWidth - Math.abs(w)) / spreadWidth;
                groundHeights[checkIdx] += f.r * 0.15 * distFactor;

                // Cap maximum accumulation height (e.g. 50px)
                if (groundHeights[checkIdx] > 50) {
                  groundHeights[checkIdx] = 50;
                }
              }
            }
          }

          // Recycle snowflake to top
          f.y = -10;
          f.x = Math.random() * width;
        }

        // Out of screen bounds resets
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [snowColor, accumulate]);

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

export default SnowfallCanvas;
