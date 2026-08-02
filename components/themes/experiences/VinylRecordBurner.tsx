"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Disc, Music } from "lucide-react";

export function VinylRecordBurner({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // gray-900

  const audioSrc = (config.experience as any)?.audioSrc || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const title = config.title || "The Wedding Toast";
  const artStyle = (config.experience as any)?.artStyle || "geometric"; // "geometric" | "fluid"

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const reqIdRef = useRef<number>(0);

  const initAudio = () => {
     if (!audioRef.current) return;
     
     if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        
        try {
           sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
           sourceRef.current.connect(analyserRef.current);
           analyserRef.current.connect(audioCtxRef.current.destination);
           analyserRef.current.fftSize = 256;
        } catch (e) {
           console.log("Audio routing already connected or failed", e);
        }
     }
     
     if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
     }
  };

  const togglePlay = () => {
     if (!audioRef.current) return;
     
     if (!hasStarted) {
        setHasStarted(true);
        initAudio();
     }
     
     if (isPlaying) {
        audioRef.current.pause();
     } else {
        audioRef.current.play();
        drawVisualizer();
     }
     setIsPlaying(!isPlaying);
  };

  const drawVisualizer = () => {
     if (!analyserRef.current || !canvasRef.current) return;
     
     const canvas = canvasRef.current;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;
     
     const bufferLength = analyserRef.current.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);
     
     const draw = () => {
        reqIdRef.current = requestAnimationFrame(draw);
        
        analyserRef.current!.getByteFrequencyData(dataArray);
        
        const width = canvas.width;
        const height = canvas.height;
        
        // Don't fully clear, create trailing effect
        ctx.fillStyle = "rgba(17, 24, 39, 0.1)"; // slate-900 with alpha
        ctx.fillRect(0, 0, width, height);
        
        if (artStyle === "geometric") {
           // Draw circular geometric rings based on bass frequencies
           const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
           const mid = dataArray.slice(10, 50).reduce((a, b) => a + b, 0) / 40;
           const treble = dataArray.slice(50, 128).reduce((a, b) => a + b, 0) / 78;
           
           const centerX = width / 2;
           const centerY = height / 2;
           
           ctx.beginPath();
           ctx.arc(centerX, centerY, bass * 1.5, 0, Math.PI * 2);
           ctx.strokeStyle = `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, ${bass / 255})`;
           ctx.lineWidth = 2;
           ctx.stroke();

           ctx.beginPath();
           ctx.arc(centerX, centerY, mid * 2, 0, Math.PI * 2);
           ctx.strokeStyle = `rgba(255, 255, 255, ${mid / 255})`;
           ctx.lineWidth = 1;
           ctx.stroke();

           // Random geometric lines
           if (treble > 100) {
              ctx.beginPath();
              ctx.moveTo(centerX + (Math.random() - 0.5) * treble * 2, centerY + (Math.random() - 0.5) * treble * 2);
              ctx.lineTo(centerX + (Math.random() - 0.5) * treble * 3, centerY + (Math.random() - 0.5) * treble * 3);
              ctx.strokeStyle = primaryColor;
              ctx.stroke();
           }

        } else {
           // Fluid wave style
           ctx.beginPath();
           const sliceWidth = width * 1.0 / bufferLength;
           let x = 0;
           
           for(let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0;
              const y = v * height / 2;

              if(i === 0) {
                 ctx.moveTo(x, y);
              } else {
                 ctx.lineTo(x, y);
              }

              x += sliceWidth;
           }
           
           ctx.lineTo(canvas.width, canvas.height / 2);
           ctx.strokeStyle = primaryColor;
           ctx.lineWidth = 2;
           ctx.stroke();
        }
     };
     
     draw();
  };

  useEffect(() => {
     return () => {
        if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
           audioCtxRef.current.close().catch(console.error);
        }
     };
  }, []);

  const handleAudioEnd = () => {
     setIsPlaying(false);
     if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-200 justify-center items-center p-6"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <audio 
         ref={audioRef} 
         src={audioSrc} 
         crossOrigin="anonymous" 
         onEnded={handleAudioEnd}
         onPause={() => { if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current); }}
         onPlay={() => { if (hasStarted) drawVisualizer(); }}
      />

      {/* The Record Sleeve Container */}
      <div className="relative w-full max-w-sm aspect-square">
         
         {/* The Vinyl Record (slides out) */}
         <motion.div 
            className="absolute top-0 w-full h-full rounded-full bg-slate-950 border-[10px] border-black shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden"
            initial={{ left: 0, rotate: 0 }}
            animate={{ 
               left: isPlaying ? '30%' : (hasStarted ? '5%' : '0%'),
               rotate: isPlaying ? 360 : 0
            }}
            transition={{ 
               left: { duration: 0.8, ease: "easeInOut" },
               rotate: { repeat: Infinity, duration: 4, ease: "linear" }
            }}
         >
            {/* Record Grooves */}
            <div className="absolute inset-0 rounded-full border border-white/5 m-4" />
            <div className="absolute inset-0 rounded-full border border-white/5 m-8" />
            <div className="absolute inset-0 rounded-full border border-white/5 m-12" />
            <div className="absolute inset-0 rounded-full border border-white/5 m-16" />
            <div className="absolute inset-0 rounded-full border border-white/5 m-20" />
            
            {/* Center Label */}
            <div className="w-1/3 h-1/3 rounded-full flex flex-col items-center justify-center shadow-inner relative z-10" style={{ backgroundColor: primaryColor }}>
               <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-950 shadow-inner z-20" />
               <div className="absolute top-4 w-full text-center px-2">
                  <span className="text-[8px] font-bold uppercase text-white/80 block leading-none truncate">
                     {title}
                  </span>
               </div>
            </div>
            
            {/* Stylized reflection sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/40 pointer-events-none" />
         </motion.div>

         {/* The Cardboard Sleeve */}
         <div className="absolute inset-0 bg-slate-800 rounded-md shadow-2xl border border-slate-700 flex flex-col overflow-hidden z-20">
            
            {/* Generative Canvas Cover Art */}
            <div className="flex-1 w-full bg-slate-900 relative border-b border-slate-700">
               <canvas 
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
               />
               
               {/* Initial overlay instruction */}
               <AnimatePresence>
                  {!hasStarted && (
                     <motion.div 
                        initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                     >
                        <Music size={32} className="text-white/50 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-white/70">
                           Audio-Reactive Vinyl
                        </p>
                        <p className="text-[10px] text-white/40 mt-1 max-w-[200px] text-center">
                           The cover art generates procedurally from the memory's audio frequencies.
                        </p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Sleeve Spine / Text */}
            <div className="h-16 w-full bg-slate-800 px-4 py-2 flex flex-col justify-center">
               <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Side A
               </div>
               <div className="text-base font-serif italic text-white truncate shadow-black drop-shadow-md">
                  {title}
               </div>
            </div>
            
            {/* Worn texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
         </div>

      </div>

      {/* Playback Controls */}
      <div className="mt-16 z-30">
         <button 
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 border-2 border-slate-700 text-white shadow-lg active:scale-95 transition-transform"
         >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
         </button>
      </div>

    </div>
  );
}
