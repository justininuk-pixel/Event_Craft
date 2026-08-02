"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Film, X, Grid3x3 } from "lucide-react";

export function VideoFrameSlicer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];
  const title = config.title || "The Laugh";

  // Since we can't actually slice video in a static demo, we simulate with generated frames
  const frameSrc = (config.experience as any)?.frameSrc || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200&auto=format&fit=crop";
  const frameCount = (config.experience as any)?.frameCount || 30;

  const [frames, setFrames] = useState<string[]>([]);
  const [expandedFrame, setExpandedFrame] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(true);

  useEffect(() => {
    // Simulate frame extraction with slight variations
    const timer = setTimeout(() => {
      const generated = Array.from({ length: frameCount }, (_, i) => frameSrc + `&seed=${i}`);
      setFrames(generated);
      setIsExtracting(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm p-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Film size={18} className="text-amber-500" />
          <h2 className="text-lg font-black text-white uppercase tracking-widest">{title}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Grid3x3 size={14} />
          {frames.length} frames
        </div>
      </div>

      {isExtracting ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mb-4" />
          <p className="text-sm text-gray-500 font-mono">Extracting frames at 30fps...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div className="grid grid-cols-5 gap-1">
            {frames.map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="aspect-video bg-gray-800 relative cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all rounded-sm overflow-hidden"
                onClick={() => { setExpandedFrame(idx); if (onComplete) onComplete(); }}
              >
                <img src={src} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" style={{ filter: `hue-rotate(${idx * 3}deg) brightness(${0.8 + (idx % 5) * 0.05})` }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-gray-400 py-0.5">
                  {(idx / 30).toFixed(2)}s
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded frame modal */}
      <AnimatePresence>
        {expandedFrame !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setExpandedFrame(null)}
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative max-w-md w-full">
              <img
                src={frames[expandedFrame]}
                alt={`Frame ${expandedFrame + 1}`}
                className="w-full rounded-lg shadow-2xl"
                style={{ filter: `hue-rotate(${expandedFrame * 3}deg) brightness(${0.8 + (expandedFrame % 5) * 0.05})` }}
              />
              <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded text-amber-400 text-xs font-mono">
                Frame {expandedFrame + 1} / {frames.length} · {(expandedFrame / 30).toFixed(3)}s
              </div>
              <button onClick={() => setExpandedFrame(null)} className="absolute top-2 right-2 text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
