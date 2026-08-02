"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function MemoryErase({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];
  const title = config.title || "The Hard Times";
  const memoryText = config.body || "The year we barely spoke. The screaming matches. The nights I stayed at a friend's house. I want to let it all go.";

  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isErased, setIsErased] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const reqFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isErased) return;

    const animate = () => {
      setHoldProgress(prev => {
        if (isHolding) {
          const next = prev + 0.5; // speed of erasing
          if (next >= 100) {
             setIsErased(true);
             if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(200);
             if (onComplete) setTimeout(onComplete, 3000);
             return 100;
          }
          if (typeof navigator !== "undefined" && navigator.vibrate && Math.random() > 0.8) navigator.vibrate(10); // subtle haptic rumble
          return next;
        } else {
          return Math.max(0, prev - 2); // quickly revert if let go
        }
      });
      if (!isErased) reqFrameRef.current = requestAnimationFrame(animate);
    };

    reqFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
    };
  }, [isHolding, isErased, onComplete]);

  // The text gradually gets pulled into a black hole at the center
  // We use CSS blur and scale based on holdProgress
  const textBlur = (holdProgress / 100) * 10;
  const textScale = 1 - (holdProgress / 100) * 0.9;
  const textOpacity = 1 - (holdProgress / 100);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-black cursor-pointer" 
      style={{ backgroundColor: bgColors[0] }}
      onPointerDown={(e) => { e.preventDefault(); setIsHolding(true); }}
      onPointerUp={() => setIsHolding(false)}
      onPointerLeave={() => setIsHolding(false)}
    >
      
      {!isErased ? (
        <>
          <div className="absolute top-10 w-full text-center z-20 pointer-events-none">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
            <p className="text-xs text-red-500/80 mt-2 font-mono animate-pulse">Hold screen to erase</p>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 z-10 pointer-events-none">
            <motion.p 
              className="text-gray-300 text-xl leading-relaxed text-center"
              style={{
                filter: `blur(${textBlur}px)`,
                scale: textScale,
                opacity: textOpacity,
                rotate: holdProgress > 0 ? (Math.random() - 0.5) * (holdProgress / 5) : 0 // chaotic shake
              }}
            >
              {memoryText}
            </motion.p>
          </div>

          {/* Black hole visual */}
          {holdProgress > 0 && (
             <div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none mix-blend-difference"
               style={{
                 width: `${holdProgress * 3}px`,
                 height: `${holdProgress * 3}px`,
                 background: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
                 boxShadow: `0 0 ${holdProgress}px rgba(255,255,255,0.2)`
               }}
             />
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="w-full h-full flex items-center justify-center z-20"
        >
          <div className="text-center">
            <div className="w-16 h-1 bg-white mx-auto mb-6 rounded-full" />
            <p className="text-white text-sm tracking-[0.3em] uppercase">Gone.</p>
          </div>
        </motion.div>
      )}

    </div>
  );
}
