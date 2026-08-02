"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ZoomIn, Crop as CropIcon } from "lucide-react";

const ASPECTS: { id: string; label: string; ratio: number | null }[] = [
  { id: "orig", label: "Original", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
];

const VW = 280; // viewport width in CSS px

interface CropModalProps {
  src: string;
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

export function CropModal({ src, open, onClose, onApply }: CropModalProps) {
  const [mounted, setMounted] = useState(false);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [aspectId, setAspectId] = useState("1:1");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !src) return;
    setNat(null);
    setError(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNat({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => setError("Couldn't load this image for cropping.");
    img.src = src;
  }, [open, src]);

  if (!mounted || !open) return null;

  const ratio = ASPECTS.find((a) => a.id === aspectId)?.ratio;
  const aspect = ratio ?? (nat ? nat.w / nat.h : 1);
  const vh = VW / aspect;

  const baseScale = nat ? Math.max(VW / nat.w, vh / nat.h) : 1;
  const displayW = nat ? nat.w * baseScale * zoom : VW;
  const displayH = nat ? nat.h * baseScale * zoom : vh;
  const maxX = Math.max(0, (displayW - VW) / 2);
  const maxY = Math.max(0, (displayH - vh) / 2);

  const clamp = (o: { x: number; y: number }) => ({
    x: Math.max(-maxX, Math.min(maxX, o.x)),
    y: Math.max(-maxY, Math.min(maxY, o.y)),
  });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(clamp({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const apply = () => {
    const img = imgRef.current;
    if (!img || !nat) return;
    const imgX = (VW - displayW) / 2 + offset.x;
    const imgY = (vh - displayH) / 2 + offset.y;
    const srcX = (-imgX / displayW) * nat.w;
    const srcY = (-imgY / displayH) * nat.h;
    const srcW = (VW / displayW) * nat.w;
    const srcH = (vh / displayH) * nat.h;
    const outW = Math.max(1, Math.round(srcW));
    const outH = Math.max(1, Math.round(srcH));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      const dataUrl = canvas.toDataURL("image/png");
      onApply(dataUrl);
      onClose();
    } catch {
      setError("This image can't be cropped here (cross-origin). Try re-uploading it.");
    }
  };

  const offX = (VW - displayW) / 2 + offset.x;
  const offY = (vh - displayH) / 2 + offset.y;

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-2xl text-[#fafafa]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-primary" /> Crop image
          </h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#27272a] flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* aspect presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ASPECTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setAspectId(a.id);
                setOffset({ x: 0, y: 0 });
              }}
              className={
                "px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer " +
                (aspectId === a.id ? "bg-primary/20 border-primary text-primary" : "bg-[#27272a] border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa]")
              }
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* viewport */}
        <div className="flex justify-center">
          <div
            className="relative overflow-hidden rounded-xl bg-black touch-none cursor-grab active:cursor-grabbing ring-1 ring-[#3f3f46]"
            style={{ width: VW, height: vh }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {nat ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="crop"
                draggable={false}
                className="absolute select-none pointer-events-none max-w-none"
                style={{ width: displayW, height: displayH, left: offX, top: offY }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#a1a1aa]">
                {error || "Loading…"}
              </div>
            )}
            {/* grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        {/* zoom */}
        <div className="flex items-center gap-2 mt-4">
          <ZoomIn className="w-4 h-4 text-[#a1a1aa] shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              const z = Number(e.target.value);
              setZoom(z);
              setOffset((o) => clamp(o));
            }}
            className="flex-1 accent-primary"
          />
        </div>

        {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[#27272a] text-xs font-bold hover:bg-[#3f3f46] cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={!nat}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Apply crop
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CropModal;
