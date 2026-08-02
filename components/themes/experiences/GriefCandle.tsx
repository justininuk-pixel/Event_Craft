"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Wind } from "lucide-react";

export function GriefCandle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // amber-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [isBurning, setIsBurning] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  // Microphone detection for "blowing"
  useEffect(() => {
     let isMounted = true;
     
     const startMic = async () => {
        try {
           if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              if (!isMounted) {
                 stream.getTracks().forEach(t => t.stop());
                 return;
              }
              
              streamRef.current = stream;
              setMicActive(true);
              
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              audioContextRef.current = audioCtx;
              
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);
              analyserRef.current = analyser;

              // Audio processing loop
              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);

              let blowCounter = 0;

              const checkAudio = () => {
                 if (!isBurning) return;
                 
                 analyser.getByteFrequencyData(dataArray);
                 
                 // Blowing creates low/mid frequency noise.
                 // We look at the lower bins to detect sustained loud noise.
                 let sum = 0;
                 for (let i = 0; i < 20; i++) {
                    sum += dataArray[i];
                 }
                 const average = sum / 20;

                 if (average > 150) { // arbitrary threshold
                    blowCounter++;
                    if (blowCounter > 10) { // Sustained for ~160ms (at 60fps)
                       setIsBurning(false);
                       if (onComplete) {
                          setTimeout(onComplete, 4000);
                       }
                       return; // stop checking
                    }
                 } else {
                    blowCounter = Math.max(0, blowCounter - 1);
                 }

                 frameRef.current = requestAnimationFrame(checkAudio);
              };

              checkAudio();
           } else {
              setMicError(true);
           }
        } catch (err) {
           console.error("Mic access denied or error:", err);
           setMicError(true);
        }
     };

     if (mode === "editor-preview") {
        setMicError(true); // Don't actually request mic in editor preview usually, or allow mock
     } else {
        startMic();
     }

     return () => {
        isMounted = false;
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (streamRef.current) {
           streamRef.current.getTracks().forEach(t => t.stop());
        }
        if (audioContextRef.current) {
           audioContextRef.current.close();
        }
     };
  }, [mode, isBurning, onComplete]);

  // Fallback for editor or no-mic
  const handleMockBlow = () => {
     setIsBurning(false);
     if (onComplete) {
        setTimeout(onComplete, 4000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 transition-colors duration-[3000ms]"
      style={{ backgroundColor: isBurning ? bgColors[0] : '#000000' }}
    >
      
      {/* Dynamic ambient light from candle */}
      <motion.div 
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none"
         style={{ backgroundColor: primaryColor }}
         animate={{ 
            opacity: isBurning ? [0.15, 0.25, 0.1, 0.2] : 0,
            scale: isBurning ? [1, 1.05, 0.95, 1.1] : 0.5
         }}
         transition={{ 
            opacity: { repeat: isBurning ? Infinity : 0, duration: 0.5, ease: "linear", repeatType: "mirror" },
            scale: { repeat: isBurning ? Infinity : 0, duration: 2, ease: "easeInOut", repeatType: "mirror" },
            default: { duration: 2 }
         }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 w-full h-full">
         
         <div className="flex-1 flex flex-col justify-end pb-12 w-full relative">
            
            {/* The Candle */}
            <div className="relative w-24 h-64 mx-auto flex flex-col items-center justify-end">
               
               <AnimatePresence>
                  {isBurning && (
                     <motion.div 
                        key="flame"
                        exit={{ opacity: 0, scale: 0, y: -20, transition: { duration: 0.5 } }}
                        className="relative z-10 -mb-2 flex flex-col items-center"
                     >
                        {/* Outer Glow */}
                        <motion.div 
                           className="absolute w-20 h-32 rounded-full blur-xl origin-bottom"
                           style={{ backgroundColor: primaryColor }}
                           animate={{ scaleX: [1, 1.1, 0.9, 1], scaleY: [1, 1.2, 0.9, 1] }}
                           transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
                        />
                        {/* Main Flame Shape */}
                        <motion.div 
                           className="w-8 h-16 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] origin-bottom shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 relative"
                           style={{ 
                              background: `radial-gradient(ellipse at bottom, white 10%, ${primaryColor} 50%, transparent 100%)` 
                           }}
                           animate={{ skewX: [-2, 3, -1, 2], scaleY: [1, 1.1, 0.95, 1.05] }}
                           transition={{ duration: 0.15, repeat: Infinity, repeatType: "mirror" }}
                        >
                           {/* Inner white hot core */}
                           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-6 bg-white rounded-full blur-[2px]" />
                        </motion.div>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* The Wick */}
               <div className="w-1 h-6 bg-black rounded-t-full relative z-0">
                  {!isBurning && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 opacity-50 blur-[1px] animate-pulse" />}
                  {!isBurning && <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-slate-400 blur-sm animate-[rise_3s_ease-out_forwards] opacity-0" />}
               </div>

               {/* The Wax Body */}
               <div className="w-full h-48 bg-gradient-to-b from-white/90 via-white/70 to-white/30 rounded-t-sm rounded-b-xl shadow-2xl relative overflow-hidden backdrop-blur-md">
                  {/* Wax dripping details */}
                  <div className="absolute top-0 left-2 w-2 h-12 bg-white/80 rounded-b-full" />
                  <div className="absolute top-0 right-4 w-3 h-8 bg-white/80 rounded-b-full" />
                  <div className="absolute top-0 left-8 w-1.5 h-16 bg-white/60 rounded-b-full" />
               </div>

            </div>

         </div>

         {/* The Text */}
         <motion.div 
            className="h-1/3 flex flex-col items-center justify-start text-center"
            animate={{ opacity: isBurning ? 1 : 0 }}
            transition={{ duration: 3 }}
         >
            <h2 className="text-2xl font-serif italic text-white/90 tracking-wide mb-4 px-6 max-w-sm drop-shadow-lg">
               {config.title || "In memory of what was."}
            </h2>
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest px-8">
               {config.body || "When you are ready, blow out the candle to let go."}
            </p>
         </motion.div>

      </div>

      {/* Mic Status / Editor Fallback */}
      {isBurning && (
         <div className="absolute top-6 right-6 z-20">
            {micError || mode === "editor-preview" ? (
               <button 
                  onClick={handleMockBlow}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
               >
                  <Wind size={14} /> Mock Blow
               </button>
            ) : micActive ? (
               <div className="bg-white/10 backdrop-blur text-white/50 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <Mic size={16} />
               </div>
            ) : (
               <div className="bg-white/10 backdrop-blur text-white/50 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                  <MicOff size={16} />
               </div>
            )}
         </div>
      )}

      {/* Global CSS for smoke animation */}
      <style dangerouslySetInnerHTML={{__html: `
         @keyframes rise {
            0% { transform: translateY(0) scale(1); opacity: 0.5; }
            100% { transform: translateY(-50px) scale(3); opacity: 0; }
         }
      `}} />

    </div>
  );
}
