"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Palette, Droplets } from "lucide-react";

export function ColorPaletteExtractor({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];
  const photoSrc = config.mediaUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop";
  const title = config.title || "Beach Sunset, 2019";

  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // Simple quantization: collect pixel samples and cluster
      const buckets: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }

      const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5).map(([key]) => {
        const [r, g, b] = key.split(",").map(Number);
        return `rgb(${r},${g},${b})`;
      });

      setDominantColors(top5);
      setIsProcessing(false);
      if (onComplete) setTimeout(onComplete, 3000);
    };
    img.onerror = () => {
      setDominantColors(["#f97316", "#0ea5e9", "#eab308", "#6366f1", "#10b981"]);
      setIsProcessing(false);
    };
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none items-center justify-center p-6" style={{ backgroundColor: bgColors[0] }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* Generative art background using extracted colors */}
      {dominantColors.length > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {dominantColors.map((color, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                backgroundColor: color,
                width: `${60 + i * 20}%`,
                height: `${60 + i * 20}%`,
                left: `${10 + i * 15 - 20}%`,
                top: `${10 + i * 10 - 10}%`,
                opacity: 0.3,
              }}
              animate={{
                x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
                y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ repeat: Infinity, duration: 8 + i * 2, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        <Palette size={28} className="text-white/60 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
        <p className="text-white/50 text-sm mb-8 max-w-xs">
          {config.body || "The dominant colors from this memory, turned into living art."}
        </p>

        {/* Color Swatches */}
        {isProcessing ? (
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/60 text-sm font-mono">
            Analyzing colors...
          </motion.div>
        ) : (
          <div className="flex gap-3">
            {dominantColors.map((color, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-lg shadow-lg border-2 border-white/20" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-mono text-white/40">{color.replace("rgb(", "").replace(")", "")}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
