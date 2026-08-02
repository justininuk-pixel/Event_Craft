"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Camera, CameraOff } from "lucide-react";

export function EmpathyMirror({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff1f2"]; // rose-50

  const affirmations = ((config.experience as any)?.items as any[])?.map((f: any) => f.title) || [
     "You are enough.",
     "Your feelings are valid.",
     "You are stronger than you know.",
     "Take a deep breath.",
     "You are loved."
  ];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);

  useEffect(() => {
     let stream: MediaStream | null = null;
     
     const startCamera = async () => {
        try {
           if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
              if (videoRef.current) {
                 videoRef.current.srcObject = stream;
                 setStreamActive(true);
              }
           } else {
              setCameraError(true);
           }
        } catch (err) {
           console.error("Camera access error:", err);
           setCameraError(true);
        }
     };

     // In editor preview, we might just mock it to avoid prompt spam
     if (mode === "editor-preview") {
        setCameraError(true);
     } else {
        startCamera();
     }

     return () => {
        if (stream) {
           stream.getTracks().forEach(track => track.stop());
        }
     };
  }, [mode]);

  useEffect(() => {
     const interval = setInterval(() => {
        setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
     }, 4000); // Change affirmation every 4 seconds
     return () => clearInterval(interval);
  }, [affirmations.length]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Camera Layer */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
         
         {!cameraError ? (
            <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="min-w-full min-h-full object-cover scale-x-[-1] blur-[2px] opacity-70"
            />
         ) : (
            // Mock Fallback for Editor or denied permission
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-200 to-rose-400">
               <motion.div 
                  className="absolute inset-0 opacity-30" 
                  style={{ backgroundImage: 'radial-gradient(circle, #fff, transparent)' }} 
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               />
               <CameraOff size={64} className="text-white/20" />
            </div>
         )}
         
         {/* Warm / Soft Focus Filter Overlay */}
         <div className="absolute inset-0 bg-rose-900/20 mix-blend-overlay pointer-events-none" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-center items-start pointer-events-none">
         <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <Heart size={14} className="text-rose-400" fill="currentColor" /> {config.title || "The Empathy Mirror"}
         </div>
      </div>

      {/* Main Affirmation Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
         <AnimatePresence mode="wait">
            <motion.h2 
               key={currentAffirmation}
               initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
               animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
               exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl max-w-sm"
               style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
            >
               {affirmations[currentAffirmation]}
            </motion.h2>
         </AnimatePresence>
      </div>

      {/* Footer controls (mock) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-center pointer-events-none">
         {onComplete && (
            <button 
               onClick={onComplete}
               className="pointer-events-auto bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold shadow-xl border border-white/30 hover:bg-white/30 transition-colors uppercase tracking-widest text-sm"
            >
               I'm Ready
            </button>
         )}
      </div>

    </div>
  );
}
