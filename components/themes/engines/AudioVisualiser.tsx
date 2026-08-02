"use client";

import React, { useEffect, useRef } from "react";
import { Howler } from "howler";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface AudioVisualiserProps {
  className?: string;
  barColor?: string;
  barCount?: number;
  gap?: number;
}

export function AudioVisualiser({
  className,
  barColor = "#ec4899", // magenta
  barCount = 32,
  gap = 3,
}: AudioVisualiserProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.clientWidth || 300);
    const height = (canvas.height = canvas.clientHeight || 100);

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array = new Uint8Array(0);

    // Attempt to hook into Howler global Audio Context
    try {
      audioCtx = Howler.ctx;
      const masterGain = Howler.masterGain;

      if (audioCtx && masterGain && audioCtx.state !== "closed") {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; // 64 frequency bins
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Intercept Howler's masterGain output and route it through our Analyser
        masterGain.disconnect();
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
    } catch (e) {
      console.warn("Could not initialize AudioVisualiser Web Audio node", e);
    }

    let animationId: number;
    let simPhase = 0; // Phase for simulated sine wave if audio is inactive

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      let hasActiveAudio = false;

      if (analyser && audioCtx && audioCtx.state === "running") {
        analyser.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>);
        // Check if there is any volume/audio signal
        const sum = dataArray.reduce((a: number, b: number) => a + b, 0);
        if (sum > 10) {
          hasActiveAudio = true;
        }
      }

      const barWidth = (width / barCount) - gap;

      ctx.save();
      // Centered or bottom aligned layout
      // Let's draw mirrored bars from the middle horizontally, bouncing vertically
      for (let i = 0; i < barCount; i++) {
        let value = 0;

        if (hasActiveAudio && dataArray.length > 0) {
          // Map visualizer bars to frequency bins (logarithmic grouping looks better)
          const dataIndex = Math.floor((i / barCount) * dataArray.length);
          value = dataArray[dataIndex] / 255; // 0.0 to 1.0
        } else {
          // Generate a smooth simulated breathing wave if audio is quiet
          const wave = Math.sin(simPhase + i * 0.15) * 0.4 + 0.6;
          const noise = Math.sin(simPhase * 3 + i * 0.8) * 0.1;
          value = Math.max(0.1, wave * 0.35 + noise);
        }

        // Apply clamping and multiplier
        const barHeight = Math.max(4, value * height * 0.9);
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight;

        // Create elegant gradient bar
        const grad = ctx.createLinearGradient(x, y, x, height);
        grad.addColorStop(0, barColor);
        grad.addColorStop(0.5, `${barColor}bb`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0.1)");

        ctx.fillStyle = grad;

        // Draw rounded top bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Draw glowing drop shadow under the peaks
        ctx.shadowBlur = 8;
        ctx.shadowColor = barColor;
      }
      ctx.restore();

      simPhase += 0.035; // Increment simulation phase
      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth || 300;
      canvas.height = canvas.clientHeight || 100;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      // Clean up Audio Connection (Reconnect masterGain straight to destination)
      try {
        const masterGain = Howler.masterGain;
        if (masterGain && audioCtx) {
          masterGain.disconnect();
          if (analyser) {
            analyser.disconnect();
          }
          masterGain.connect(audioCtx.destination);
        }
      } catch (e) {
        console.warn("Error disconnecting AudioVisualiser node", e);
      }
    };
  }, [barColor, barCount, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className || ""}`}
      style={{ minHeight: "30px" }}
    />
  );
}

export default AudioVisualiser;
