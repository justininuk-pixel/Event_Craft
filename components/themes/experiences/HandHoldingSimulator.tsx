"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Heart, MousePointer2 } from "lucide-react";

type FingerPoint = { id: string; x: number; y: number; active: boolean };

export function HandHoldingSimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fb923c"; // orange-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // stone-900

  // The 5 target points relative to a 300x400 container
  const targetPoints: FingerPoint[] = [
     { id: "thumb", x: 40, y: 220, active: false },
     { id: "index", x: 100, y: 80, active: false },
     { id: "middle", x: 160, y: 60, active: false },
     { id: "ring", x: 220, y: 90, active: false },
     { id: "pinky", x: 270, y: 150, active: false },
  ];

  const [points, setPoints] = useState<FingerPoint[]>(targetPoints);
  const [isHolding, setIsHolding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const startHeartbeat = () => {
     if (heartbeatRef.current) return;
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        // Heartbeat pattern: lub-dub... lub-dub
        heartbeatRef.current = setInterval(() => {
           navigator.vibrate([100, 100, 150]);
        }, 1200);
     }
  };

  const stopHeartbeat = () => {
     if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
     }
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(0);
     }
  };

  useEffect(() => {
     const activeCount = points.filter(p => p.active).length;
     if (activeCount === 5) {
        if (!isHolding) {
           setIsHolding(true);
           startHeartbeat();
           if (onComplete) {
              setTimeout(onComplete, 8000);
           }
        }
     } else {
        if (isHolding) {
           setIsHolding(false);
           stopHeartbeat();
        }
     }
  }, [points, isHolding, onComplete]);

  // Clean up
  useEffect(() => {
     return () => stopHeartbeat();
  }, []);

  const handleTouchStart = (e: React.TouchEvent | React.PointerEvent) => {
     e.preventDefault();
     updateTouches(e);
  };

  const handleTouchMove = (e: React.TouchEvent | React.PointerEvent) => {
     e.preventDefault();
     updateTouches(e);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.PointerEvent) => {
     e.preventDefault();
     updateTouches(e);
  };

  const updateTouches = (e: any) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     
     // Extract all current touch coordinates
     const currentTouches: {x: number, y: number}[] = [];
     if (e.touches) {
        for(let i = 0; i < e.touches.length; i++) {
           currentTouches.push({
              x: e.touches[i].clientX - rect.left,
              y: e.touches[i].clientY - rect.top
           });
        }
     } else {
        // Fallback for single pointer/mouse (makes it impossible to get 5 normally)
        if (e.buttons > 0) {
           currentTouches.push({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
           });
        }
     }

     // Evaluate which targets are hit
     const tolerance = 40; // px radius
     setPoints(prev => prev.map(p => {
        const isHit = currentTouches.some(t => {
           const dist = Math.hypot(t.x - p.x, t.y - p.y);
           return dist < tolerance;
        });
        return { ...p, active: isHit };
     }));
  };

  const simulateAllTouches = () => {
     setPoints(prev => prev.map(p => ({ ...p, active: true })));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none transition-colors duration-1000"
      style={{ backgroundColor: isHolding ? "#3f1a0b" : bgColors[0] }} // Warms up when holding
    >
      
      {/* Editor Mock Button */}
      {mode === "editor-preview" && !isHolding && (
         <button 
            onClick={simulateAllTouches}
            className="absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20"
         >
            <MousePointer2 size={14} /> Simulate 5 Touches
         </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full">
         
         <AnimatePresence mode="wait">
            {!isHolding ? (
               <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
               >
                  <Hand size={32} className="text-white/30 mb-8" />
                  <h2 className="text-2xl font-serif italic text-white/80 mb-2 text-center">
                     Place your hand here.
                  </h2>
                  <p className="text-white/40 text-sm max-w-[200px] text-center">
                     Match your fingertips to the glowing points.
                  </p>
               </motion.div>
            ) : (
               <motion.div
                  key="holding"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
               >
                  <Heart size={48} className="text-orange-500 mb-8 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-[ping_1.2s_ease-in-out_infinite]" fill="currentColor" />
                  <h3 className="text-3xl font-black text-white drop-shadow-xl mb-4 tracking-tight">
                     {config.title || "I'm right here."}
                  </h3>
                  <p className="text-orange-100 text-lg font-medium px-8 text-center max-w-sm drop-shadow-md leading-relaxed">
                     {config.body || "I wish I could actually hold your hand right now. This will have to do until I see you."}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

         {/* The Interaction Zone */}
         <div 
            className="relative w-[300px] h-[400px] z-10"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onPointerDown={handleTouchStart}
            onPointerMove={handleTouchMove}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
         >
            {/* The Hand Outline (SVG) */}
            <svg viewBox="0 0 300 400" className={`w-full h-full transition-opacity duration-1000 ${isHolding ? 'opacity-20' : 'opacity-40'}`}>
               <path 
                  d="M140,400 C140,350 110,280 50,260 C20,250 20,210 50,200 C80,190 120,240 140,240 C140,160 100,100 110,70 C120,40 140,40 150,70 C150,150 160,180 160,180 C160,120 160,70 170,50 C180,30 200,30 210,50 C210,130 210,180 210,180 C210,130 230,80 240,70 C250,60 270,70 260,90 C250,150 240,200 240,200 C240,170 280,130 290,140 C300,150 280,180 280,220 C270,280 230,350 230,400 Z" 
                  fill="none" 
                  stroke={primaryColor} 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
               />
            </svg>

            {/* The Touch Targets */}
            {points.map(p => (
               <div
                  key={p.id}
                  className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center transition-all duration-300
                     ${p.active ? 'scale-125' : 'scale-100'}`}
                  style={{ left: p.x, top: p.y }}
               >
                  <div 
                     className={`w-6 h-6 rounded-full transition-colors duration-300 ${p.active ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)]' : 'bg-white/20 border border-white/50'}`}
                  />
                  {!p.active && (
                     <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" />
                  )}
               </div>
            ))}
         </div>

      </div>

    </div>
  );
}
