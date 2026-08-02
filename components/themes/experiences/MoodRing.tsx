"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Fingerprint, Sparkles, Activity } from "lucide-react";

export function MoodRing({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<{ color: string, text: string } | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const startScan = async () => {
     if (isScanning || result) return;
     setIsScanning(true);
     setScanProgress(0);
     setHasCameraError(false);

     try {
        if (mode === "editor-preview") {
           // Simulate scan
           simulateScan();
           return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
           video: { 
              facingMode: "environment",
              // Try to request torch, some browsers support this via constraints
              advanced: [{ torch: true } as any] 
           } 
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
           videoRef.current.srcObject = stream;
           await videoRef.current.play();
           analyzeFrame();
        }

     } catch (err) {
        console.error("Camera error:", err);
        setHasCameraError(true);
        // Fallback to simulation
        simulateScan();
     }
  };

  const simulateScan = () => {
     let progress = 0;
     const interval = setInterval(() => {
        progress += 2;
        setScanProgress(progress);
        if (progress >= 100) {
           clearInterval(interval);
           finishScan();
        }
     }, 100);
  };

  const analyzeFrame = () => {
     if (!videoRef.current || !canvasRef.current) return;
     
     const ctx = canvasRef.current.getContext("2d");
     if (!ctx) return;

     let startTime = Date.now();
     const scanDuration = 5000; // 5 seconds

     const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / scanDuration) * 100);
        setScanProgress(progress);

        if (videoRef.current!.readyState === videoRef.current!.HAVE_ENOUGH_DATA) {
           // Draw video to canvas (just a small region to analyze)
           ctx.drawImage(videoRef.current!, 0, 0, 64, 64);
           // We would analyze redness here for pulse, but for visual effect we just progress
        }

        if (progress < 100) {
           animationRef.current = requestAnimationFrame(tick);
        } else {
           finishScan();
        }
     };

     animationRef.current = requestAnimationFrame(tick);
  };

  const finishScan = () => {
     stopCamera();
     
     // Randomize a mood
     const moods = [
        { color: "#3b82f6", text: "Deep Calm" },      // blue
        { color: "#10b981", text: "Growth & Healing" }, // green
        { color: "#f59e0b", text: "Warm Energy" },    // amber
        { color: "#8b5cf6", text: "Mystical Focus" }, // violet
        { color: "#f43f5e", text: "Passionate Love" } // rose
     ];
     
     const mood = moods[Math.floor(Math.random() * moods.length)];
     setResult(mood);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     
     if (onComplete) {
        setTimeout(onComplete, 5000);
     }
  };

  const stopCamera = () => {
     if (animationRef.current) cancelAnimationFrame(animationRef.current);
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
     }
  };

  useEffect(() => {
     return () => stopCamera();
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Hidden elements for analysis */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={64} height={64} className="hidden" />

      {/* Dynamic Background based on result */}
      <AnimatePresence>
         {result && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="absolute inset-0 z-0 pointer-events-none"
               style={{ 
                  background: `radial-gradient(circle at center, ${result.color}40 0%, transparent 70%)` 
               }}
            />
         )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-between p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-8">
            <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
               {config.title || "The Mood Ring"}
            </h2>
            <p className="text-white/60 font-medium text-sm mt-2 max-w-[250px] mx-auto leading-relaxed">
               {result ? "Your aura is revealed." : (config.body || "Place your finger over the rear camera lens.")}
            </p>
         </div>

         {/* The Interaction Zone */}
         <div className="relative w-64 h-64 flex items-center justify-center my-12">
            
            {!result ? (
               <motion.div 
                  className="relative w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center cursor-pointer overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] bg-slate-800"
                  onPointerDown={startScan}
                  animate={{ 
                     scale: isScanning ? 0.95 : 1,
                     boxShadow: isScanning ? `0 0 ${20 + (scanProgress / 2)}px rgba(255,255,255,${scanProgress/100})` : 'none'
                  }}
               >
                  <Fingerprint size={64} className={`transition-opacity duration-300 ${isScanning ? 'opacity-20' : 'opacity-80 text-slate-400'}`} />
                  
                  {isScanning && (
                     <>
                        {/* Scanning wave */}
                        <div 
                           className="absolute left-0 right-0 h-2 bg-white/50 blur-[2px]"
                           style={{ 
                              top: `${scanProgress}%`, 
                              boxShadow: '0 0 10px white, 0 0 20px white' 
                           }}
                        />
                        {/* Plasma effect under finger */}
                        <div 
                           className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ef4444_0%,_transparent_60%)] mix-blend-screen transition-opacity"
                           style={{ opacity: 0.3 + (scanProgress / 200) }}
                        />
                     </>
                  )}
               </motion.div>
            ) : (
               <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl relative"
                  style={{ backgroundColor: result.color }}
               >
                  {/* Swirling color effect inside the ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/30 to-white/30 mix-blend-overlay animate-spin-slow" />
                  <div className="absolute inset-2 rounded-full border-2 border-white/40 shadow-inner" />
                  
                  <Sparkles size={48} className="text-white drop-shadow-md z-10" />
               </motion.div>
            )}

            {/* Instruction bubble */}
            {!isScanning && !result && (
               <motion.div 
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-lg flex items-center gap-2"
               >
                  <Camera size={14} /> Press & Hold
               </motion.div>
            )}
         </div>

         {/* Result Text */}
         <div className="w-full text-center h-24 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
               {isScanning ? (
                  <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <div className="flex items-center gap-2 text-white/50">
                        <Activity size={16} className="animate-pulse" /> Reading pulse...
                     </div>
                  </motion.div>
               ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                     <h3 className="text-3xl font-black uppercase tracking-widest drop-shadow-lg" style={{ color: result.color }}>
                        {result.text}
                     </h3>
                     <p className="text-white/70 font-medium text-sm mt-2">
                        Your energy is resonating perfectly.
                     </p>
                  </motion.div>
               ) : null}
            </AnimatePresence>
         </div>

         {hasCameraError && (
            <div className="absolute top-4 left-4 right-4 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-lg border border-amber-500/20 text-xs text-center backdrop-blur-md z-50">
               Camera unavailable. Running simulation.
            </div>
         )}

      </div>

    </div>
  );
}
