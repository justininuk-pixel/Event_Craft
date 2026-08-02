"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Music, Hand } from "lucide-react";

export function LullabyMusicBox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d97706"; // amber-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const isDragging = useRef(false);

  // Initialize AudioContext on first interaction
  const initAudio = () => {
     if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime); // start silent
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        
        audioCtxRef.current = ctx;
        oscillatorRef.current = osc;
        gainRef.current = gain;
     }
  };

  const getAngleFromCenter = (clientX: number, clientY: number) => {
     if (!containerRef.current) return 0;
     const rect = containerRef.current.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     const dx = clientX - centerX;
     const dy = clientY - centerY;
     return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     isDragging.current = true;
     initAudio();
     setIsPlaying(true);
     lastAngleRef.current = getAngleFromCenter(e.clientX, e.clientY);
     lastTimeRef.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     
     const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
     const now = Date.now();
     const dt = now - lastTimeRef.current;
     
     if (dt > 0) {
        let dTheta = currentAngle - lastAngleRef.current;
        // handle wrap around 180 / -180
        if (dTheta > 180) dTheta -= 360;
        if (dTheta < -180) dTheta += 360;

        // degrees per ms -> map to some playback rate or frequency modulation
        const vel = Math.abs(dTheta / dt);
        setVelocity(vel);

        // Map velocity to playback speed / pitch (Mocked via Oscillator frequency)
        if (oscillatorRef.current && gainRef.current && audioCtxRef.current) {
           const mappedFreq = 220 + (vel * 1000); // Base 220hz + velocity mod
           oscillatorRef.current.frequency.setTargetAtTime(mappedFreq, audioCtxRef.current.currentTime, 0.1);
           gainRef.current.gain.setTargetAtTime(Math.min(vel * 2, 0.5), audioCtxRef.current.currentTime, 0.1);
        }
        
        setAngle(prev => prev + dTheta);
        lastAngleRef.current = currentAngle;
        lastTimeRef.current = now;
     }
  };

  const handlePointerUp = () => {
     isDragging.current = false;
  };

  // Friction loop: gradually slow down when not dragging
  useEffect(() => {
     const friction = 0.95;
     let frame: number;

     const loop = () => {
        if (!isDragging.current && velocity > 0.01) {
           setVelocity(v => {
              const newV = v * friction;
              if (newV < 0.01) return 0;
              return newV;
           });

           // Also decay audio
           if (oscillatorRef.current && gainRef.current && audioCtxRef.current) {
              const currentV = velocity * friction;
              const mappedFreq = 220 + (currentV * 1000);
              oscillatorRef.current.frequency.setTargetAtTime(mappedFreq, audioCtxRef.current.currentTime, 0.1);
              gainRef.current.gain.setTargetAtTime(Math.min(currentV * 2, 0.5), audioCtxRef.current.currentTime, 0.1);
           }
        } else if (!isDragging.current && velocity <= 0.01 && isPlaying) {
           setIsPlaying(false);
           if (gainRef.current && audioCtxRef.current) {
              gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
           }
        }
        frame = requestAnimationFrame(loop);
     };

     frame = requestAnimationFrame(loop);
     return () => cancelAnimationFrame(frame);
  }, [velocity, isPlaying]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Decorative Musical Notes (only when playing) */}
      {isPlaying && (
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[1,2,3].map((i) => (
               <motion.div 
                  key={i}
                  className="absolute"
                  style={{ color: primaryColor }}
                  initial={{ opacity: 0, scale: 0.5, x: "50%", y: "50%" }}
                  animate={{ 
                     opacity: [0, 1, 0], 
                     scale: [0.5, 1.5, 2], 
                     y: ["50%", "20%", "0%"],
                     x: ["50%", `${50 + (Math.random() * 40 - 20)}%`, `${50 + (Math.random() * 60 - 30)}%`]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
               >
                  <Music size={32} />
               </motion.div>
            ))}
         </div>
      )}

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto pointer-events-none">
         
         <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-800" style={{ color: primaryColor }}>
               {config.title || "Our Song"}
            </h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
               {config.body || "A lullaby for you"}
            </p>
         </div>

         {/* The Crank */}
         <div 
            ref={containerRef}
            className="relative w-64 h-64 rounded-full border-8 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{ 
               backgroundColor: `${primaryColor}20`, // 20% opacity of primary
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
         >
            {/* The base pivot */}
            <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center relative z-20">
               <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>

            {/* The rotating arm */}
            <motion.div 
               className="absolute top-1/2 left-1/2 w-32 h-8 -translate-y-1/2 origin-left z-10 flex justify-end items-center pr-2"
               style={{ rotate: angle }}
            >
               {/* Arm bar */}
               <div className="absolute top-1/2 left-4 right-8 h-4 -translate-y-1/2 bg-white rounded-full shadow-md" />
               
               {/* The handle / knob */}
               <div className="w-12 h-12 rounded-full shadow-lg relative z-10 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <Hand size={20} color="white" className="opacity-50" />
               </div>
            </motion.div>
         </div>

         <div className="mt-16 text-xs font-bold uppercase tracking-widest text-slate-400">
            Drag the handle in circles to play
         </div>

      </div>

    </div>
  );
}
