"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export function HeartbeatSculpture({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];
  const title = config.title || "Resting Heart Rate, 2026";

  const [taps, setTaps] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  // Create an array of circles for the sculpture based on tap deltas
  const [sculpturePoints, setSculpturePoints] = useState<number[]>([]);

  const handleTap = () => {
    if (hasRecorded) return;
    const now = Date.now();
    
    if (!isRecording) {
      setIsRecording(true);
      setTaps([now]);
    } else {
      setTaps((prev) => [...prev, now]);
      if (taps.length >= 10) {
        setIsRecording(false);
        setHasRecorded(true);
        generateSculpture([...taps, now]);
        if (onComplete) setTimeout(onComplete, 3000);
      }
    }
    
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
  };

  const generateSculpture = (finalTaps: number[]) => {
    const deltas: number[] = [];
    for (let i = 1; i < finalTaps.length; i++) {
      deltas.push(finalTaps[i] - finalTaps[i - 1]);
    }
    setSculpturePoints(deltas);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none items-center justify-center p-6" style={{ backgroundColor: bgColors[0] }}>
      
      {!hasRecorded ? (
        <div className="text-center z-10 flex flex-col items-center">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-white/50 text-sm mb-12 max-w-xs">
            {isRecording ? "Keep tapping to your pulse..." : "Hold two fingers to your wrist. Tap the button in time with your pulse to record it."}
          </p>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleTap}
            className="w-32 h-32 rounded-full border-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex items-center justify-center transition-colors"
            style={{ 
              borderColor: isRecording ? primaryColor : "rgba(255,255,255,0.2)",
              backgroundColor: isRecording ? "rgba(239,68,68,0.1)" : "transparent"
            }}
          >
            <Heart size={48} style={{ color: isRecording ? primaryColor : "rgba(255,255,255,0.4)" }} className={isRecording ? "animate-pulse" : ""} />
          </motion.button>
          
          <div className="mt-8 text-xs font-mono text-white/30">
            {taps.length} / 10 taps recorded
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="absolute top-8 left-0 right-0 text-center z-20">
             <h2 className="text-lg font-black text-white uppercase tracking-widest">{title}</h2>
             <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">Preserved as Abstract Geometry</p>
          </div>

          {/* Generative Sculpture */}
          <div className="relative w-64 h-64 perspective-1000">
            {sculpturePoints.map((delta, i) => {
              // Normalize delta (e.g. 600ms - 1000ms is typical resting hr)
              // We'll use delta to affect size, rotation speed, and color offset
              const normalized = Math.min(Math.max((delta - 500) / 1000, 0), 1); 
              
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/20 mix-blend-screen"
                  style={{
                    borderTopColor: primaryColor,
                    borderBottomColor: primaryColor,
                  }}
                  animate={{
                    rotateX: [0, 360],
                    rotateY: [0, 360],
                    scale: [1 - normalized * 0.2, 1 + normalized * 0.2, 1 - normalized * 0.2]
                  }}
                  transition={{
                    rotateX: { repeat: Infinity, duration: 4 + (delta / 200), ease: "linear" },
                    rotateY: { repeat: Infinity, duration: 5 + (delta / 150), ease: "linear" },
                    scale: { repeat: Infinity, duration: delta / 1000, ease: "easeInOut" }
                  }}
                />
              );
            })}
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center z-20 text-xs font-mono text-white/40">
            Average BPM: {Math.round(60000 / (sculpturePoints.reduce((a,b)=>a+b,0) / sculpturePoints.length))}
          </div>
        </div>
      )}
    </div>
  );
}
