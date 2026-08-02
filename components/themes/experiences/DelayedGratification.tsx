"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function DelayedGratification({
  theme,
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  // Creator-configured wait time (seconds); falls back to 3 minutes. Preview is capped short
  // so the editor is testable without actually waiting minutes.
  const configuredSeconds = Number(
    config.experience?.waitSeconds ?? theme.experienceDefaults?.waitSeconds ?? 180,
  );
  const safeSeconds = Number.isFinite(configuredSeconds) && configuredSeconds > 0
    ? Math.round(configuredSeconds)
    : 180;
  const REQUIRED_SECONDS = mode === "editor-preview" ? Math.min(10, safeSeconds) : safeSeconds;

  const [status, setStatus] = useState<"idle" | "waiting" | "failed" | "success">("idle");
  const [timeLeft, setTimeLeft] = useState(REQUIRED_SECONDS);
  const [failReason, setFailReason] = useState("");

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const touchBypassRef = useRef<boolean>(false);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];

  const updateTimer = () => {
     if (status !== "waiting") return;
     // Runs from requestAnimationFrame (an async callback), not during render.
     // eslint-disable-next-line react-hooks/purity
     const now = Date.now();
     const elapsed = Math.floor((now - startTimeRef.current) / 1000);
     const remaining = Math.max(0, REQUIRED_SECONDS - elapsed);

     setTimeLeft(remaining);

     if (remaining <= 0) {
        setStatus("success");
        if (onComplete) {
           setTimeout(() => onComplete(), 1000);
        }
     } else {
        requestRef.current = requestAnimationFrame(updateTimer);
     }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
     e.stopPropagation();
     // We need to bypass the immediate click that started it
     touchBypassRef.current = true;
     
     setStatus("waiting");
     setTimeLeft(REQUIRED_SECONDS);
     startTimeRef.current = Date.now();
     requestRef.current = requestAnimationFrame(updateTimer);

     setTimeout(() => {
        touchBypassRef.current = false;
     }, 500);
  };

  const handleFail = (reason: string) => {
     if (touchBypassRef.current) return;
     if (status !== "waiting") return;
     
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
     setFailReason(reason);
     setStatus("failed");
  };

  const handleRestart = (e: React.MouseEvent | React.TouchEvent) => {
     e.stopPropagation();
     setStatus("idle");
     setTimeLeft(REQUIRED_SECONDS);
  };

  useEffect(() => {
     if (status === "waiting") {
        const onInteraction = (e: Event) => {
           // Allow mousemove but punish clicks and keystrokes
           if (e.type === "mousedown" || e.type === "touchstart") handleFail("You touched the screen.");
           if (e.type === "keydown") handleFail("You typed a key.");
           if (e.type === "visibilitychange" && document.hidden) handleFail("You looked away.");
        };

        window.addEventListener("mousedown", onInteraction);
        window.addEventListener("touchstart", onInteraction);
        window.addEventListener("keydown", onInteraction);
        document.addEventListener("visibilitychange", onInteraction);

        return () => {
           window.removeEventListener("mousedown", onInteraction);
           window.removeEventListener("touchstart", onInteraction);
           window.removeEventListener("keydown", onInteraction);
           document.removeEventListener("visibilitychange", onInteraction);
        };
     }
  }, [status]);

  useEffect(() => {
     return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
     };
  }, []);

  const formatTime = (seconds: number) => {
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none items-center justify-center transition-colors duration-1000"
      style={{ background: status === "failed" ? "#7f1d1d" : `linear-gradient(to bottom, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
    >
      <AnimatePresence mode="wait">
         {status === "idle" && (
            <motion.div
               key="idle"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative z-10 w-full max-w-md p-8 text-center"
            >
               <h1 className="text-3xl font-bold text-white mb-6 tracking-wider">
                  A Test of Patience
               </h1>
               <div className="bg-black/20 p-6 rounded-2xl mb-8 border border-white/10 backdrop-blur-md text-slate-300 space-y-4">
                  <p>1. Press Start.</p>
                  <p>2. Do absolutely nothing for {formatTime(REQUIRED_SECONDS)}.</p>
                  <p>3. <strong className="text-white">Do not</strong> touch the screen.</p>
                  <p>4. <strong className="text-white">Do not</strong> switch tabs or minimize.</p>
               </div>
               
               <button
                  onMouseDown={handleStart}
                  onTouchStart={handleStart}
                  className="px-12 py-4 rounded-full font-bold text-lg uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border-2 border-white/20"
                  style={{ backgroundColor: primaryColor }}
               >
                  Start
               </button>
            </motion.div>
         )}

         {status === "waiting" && (
            <motion.div
               key="waiting"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center"
            >
               {/* Hypnotic Breathing Ring */}
               <motion.div
                  className="absolute w-64 h-64 border-[4px] border-white/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               />
               <motion.div
                  className="absolute w-48 h-48 border-[2px] border-white/40 rounded-full"
                  animate={{ scale: [1.5, 1, 1.5], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               />

               <div className="text-white text-6xl md:text-8xl font-black tracking-widest tabular-nums z-20 mix-blend-overlay">
                  {formatTime(timeLeft)}
               </div>
               <p className="text-white/50 uppercase tracking-[0.3em] text-sm mt-8 z-20">
                  Focus. Breathe.
               </p>
            </motion.div>
         )}

         {status === "failed" && (
            <motion.div
               key="failed"
               initial={{ scale: 1.2, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-red-900"
            >
               <div className="text-7xl mb-6">❌</div>
               <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-4">
                  Focus Lost
               </h2>
               <p className="text-red-200 font-bold uppercase tracking-widest text-sm mb-12">
                  {failReason}
               </p>

               <button
                  onMouseDown={handleRestart}
                  onTouchStart={handleRestart}
                  className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-red-900 bg-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
               >
                  Try Again
               </button>
            </motion.div>
         )}

         {status === "success" && (
            <motion.div
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl text-center"
            >
               <h2 className="text-3xl font-bold mb-6 text-white tracking-widest uppercase">
                  {config.title || theme.content.title}
               </h2>
               <p className="text-xl text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">
                  {config.body || theme.content.body}
               </p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && status === "waiting" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
            <button 
               onMouseDown={(e) => { e.stopPropagation(); handleFail("Simulated distraction."); }}
               className="px-6 py-3 bg-red-600/80 hover:bg-red-500 border border-red-400 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors shadow-xl backdrop-blur-md"
            >
               Simulate Distraction
            </button>
         </div>
      )}
      
    </div>
  );
}
