"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";

const surface = "color-mix(in srgb, var(--exp-text) 6%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

export function ScratchCard({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const hint = config.experience?.scratchHint ?? theme.experienceDefaults?.scratchHint ?? "Scratch to reveal";

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);

  // Paint the foil coating; returns when canvas is sized.
  const paintCoating = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, palette.secondary);
    grad.addColorStop(0.5, palette.primary);
    grad.addColorStop(1, palette.accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // subtle foil sheen
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = -h; i < w; i += 26) {
      ctx.fillRect(i, 0, 10, h);
    }
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `bold ${compact ? 13 : 18}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(compact ? "Scratch" : hint, w / 2, h / 2);
    // a couple of decorative scratch streaks so it reads as a scratch card
    if (compact) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.35);
      ctx.lineTo(w * 0.75, h * 0.55);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  useEffect(() => {
    paintCoating();
    if (compact) return;
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (!revealed) paintCoating();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, palette.primary, palette.secondary, palette.accent]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  const percentCleared = (): number => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) {
      total++;
      if (data[i] === 0) cleared++;
    }
    return total ? cleared / total : 0;
  };

  const checkReveal = () => {
    if (revealed) return;
    if (percentCleared() > 0.5) {
      setRevealed(true);
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (compact || revealed) return;
    drawing.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || compact || revealed) return;
    scratchAt(e.clientX, e.clientY);
  };
  const onPointerUp = () => {
    if (compact) return;
    drawing.current = false;
    checkReveal();
  };

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center", compact ? "p-3" : "p-6")}>
      <h1
        className={clsx("font-bold text-center mb-3", compact ? "text-sm" : "text-2xl sm:text-3xl")}
        style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
      >
        {config.title || theme.content.title}
      </h1>

      <div
        ref={wrapRef}
        className={clsx("relative rounded-2xl overflow-hidden w-full", compact ? "max-w-[180px] h-28" : "max-w-sm h-56")}
        style={{ border: `1.5px solid ${hairline}`, background: surface }}
      >
        {/* Hidden prize underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Sparkles className={compact ? "w-5 h-5 mb-1" : "w-7 h-7 mb-2"} style={{ color: "var(--exp-accent)" }} />
          <p
            className={clsx("font-bold leading-snug", compact ? "text-[10px]" : "text-base")}
            style={{ color: "var(--exp-text)", fontFamily: "var(--exp-font-heading)" }}
          >
            {config.body || theme.content.body}
          </p>
          {config.sender && !compact && (
            <p className="text-xs mt-2 font-semibold" style={{ color: "var(--exp-accent)" }}>
             , {config.sender}
            </p>
          )}
        </div>

        {/* Scratch coating */}
        <motion.canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={clsx("absolute inset-0 w-full h-full touch-none", !compact && !revealed && "cursor-grab")}
          animate={{ opacity: revealed ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          style={{ pointerEvents: revealed ? "none" : "auto" }}
        />
      </div>

      {!compact && (
        <p className="text-xs mt-3" style={{ color: "var(--exp-text-secondary)" }}>
          {revealed ? "✨ Revealed!" : hint}
        </p>
      )}
    </div>
  );
}

export default ScratchCard;
