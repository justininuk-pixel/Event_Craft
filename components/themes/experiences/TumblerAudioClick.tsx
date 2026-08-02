"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const COMBINATION = [34, 72, 15]; // 3 secret numbers

// AudioContext singleton to reuse
let audioCtx: AudioContext | null = null;

const initAudio = () => {
   if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
   }
   if (audioCtx.state === 'suspended') {
      audioCtx.resume();
   }
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number) => {
   if (!audioCtx) return;
   
   const osc = audioCtx.createOscillator();
   const gain = audioCtx.createGain();
   
   osc.type = type;
   osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
   
   gain.gain.setValueAtTime(vol, audioCtx.currentTime);
   gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
   
   osc.connect(gain);
   gain.connect(audioCtx.destination);
   
   osc.start();
   osc.stop(audioCtx.currentTime + duration);
};

const playTick = () => playTone(300, 'triangle', 0.05, 0.2);
const playPing = () => playTone(800, 'sine', 0.15, 0.5); // Distinct higher pitch
const playSuccess = () => {
   playTone(400, 'sine', 0.1, 0.3);
   setTimeout(() => playTone(600, 'sine', 0.1, 0.3), 100);
   setTimeout(() => playTone(800, 'sine', 0.3, 0.3), 200);
};
const playError = () => playTone(150, 'sawtooth', 0.3, 0.4);

export function TumblerAudioClick({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // Amber 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // Slate 800

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [stage, setStage] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [flashTick, setFlashTick] = useState(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const lastReportedNumber = useRef(0);

  const handleStart = () => {
     initAudio();
     setGameState("playing");
  };

  const getAngle = (e: React.PointerEvent) => {
     if (!dialRef.current) return 0;
     const rect = dialRef.current.getBoundingClientRect();
     const cx = rect.left + rect.width / 2;
     const cy = rect.top + rect.height / 2;
     return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     isDragging.current = true;
     lastAngle.current = getAngle(e);
     (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     
     const angle = getAngle(e);
     let delta = angle - lastAngle.current;
     
     // Handle wrap around
     if (delta > 180) delta -= 360;
     if (delta < -180) delta += 360;
     
     const newRotation = rotation + delta;
     setRotation(newRotation);
     lastAngle.current = angle;

     // Calculate number (100 numbers per revolution, so 3.6 degrees per number)
     // Normalize rotation to 0-360
     let normalizedRot = newRotation % 360;
     if (normalizedRot < 0) normalizedRot += 360;
     
     // 0 degrees is number 0, going clockwise increases number
     const num = Math.floor(normalizedRot / 3.6);
     
     if (num !== lastReportedNumber.current) {
        setCurrentNumber(num);
        lastReportedNumber.current = num;
        
        // Play sound based on if it's the target number
        const isTarget = num === COMBINATION[stage];
        if (isTarget) {
           playPing();
           // Visual fallback
           setFlashTick(true);
           setTimeout(() => setFlashTick(false), 200);
        } else {
           playTick();
        }
     }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
     isDragging.current = false;
     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleEnter = () => {
     if (gameState !== "playing") return;
     
     if (currentNumber === COMBINATION[stage]) {
        // Correct
        playSuccess();
        if (stage === 2) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        } else {
           setStage(prev => prev + 1);
        }
     } else {
        // Wrong
        playError();
        setStage(0); // Reset progress
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-[320px] h-[480px] rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{
            background: 'radial-gradient(circle at center, #334155, #0f172a)'
         }}
      >
         
         <div className="w-full h-24 flex flex-col items-center justify-end px-6 pb-2 shrink-0 z-10 border-b border-slate-700/50 shadow-md bg-slate-800">
            <span className="text-slate-400 font-bold tracking-widest uppercase text-xs mb-2">Security Vault</span>
            {/* Stage Indicators */}
            <div className="flex gap-4">
               {[0, 1, 2].map(i => (
                  <div 
                     key={i}
                     className="w-4 h-4 rounded-full border-2 border-slate-900 transition-colors duration-300"
                     style={{
                        backgroundColor: i < stage ? primaryColor : (i === stage && flashTick ? primaryColor : '#1e293b'),
                        boxShadow: i < stage || (i === stage && flashTick) ? `0 0 10px ${primaryColor}` : 'inset 0 2px 4px rgba(0,0,0,0.5)'
                     }}
                  />
               ))}
            </div>
         </div>

         {/* The Safe Dial Area */}
         <div className="flex-1 w-full relative flex flex-col items-center justify-center gap-10">
            
            <div 
               className="relative w-64 h-64 rounded-full bg-slate-900 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8),_0_2px_4px_rgba(255,255,255,0.1)] flex items-center justify-center"
            >
               {/* Fixed Tick mark for center top */}
               <div className="absolute top-2 w-1 h-4 bg-red-500 rounded-sm z-20 shadow-sm" />

               {/* The Draggable Dial */}
               <div 
                  ref={dialRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-52 h-52 rounded-full cursor-grab active:cursor-grabbing relative flex items-center justify-center border-[8px] border-slate-700"
                  style={{
                     background: 'conic-gradient(from 0deg, #475569, #1e293b, #475569, #1e293b, #475569)',
                     transform: `rotate(${rotation}deg)`,
                     boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.2)'
                  }}
               >
                  {/* Grip notches */}
                  {Array.from({ length: 40 }).map((_, i) => (
                     <div 
                        key={i}
                        className="absolute w-1 h-2 bg-slate-900 top-0 origin-[50%_104px]"
                        style={{ transform: `rotate(${i * 9}deg)` }}
                     />
                  ))}

                  {/* Inner metallic core */}
                  <div className="w-32 h-32 rounded-full bg-slate-800 shadow-inner flex items-center justify-center relative border border-slate-600">
                     <div className="w-16 h-16 rounded-full bg-slate-700 shadow-xl" />
                  </div>
               </div>
            </div>

            {/* Enter Button */}
            <button
               onClick={handleEnter}
               className="w-24 h-12 rounded-lg bg-slate-800 border-b-4 border-slate-900 text-slate-300 font-bold uppercase tracking-widest active:translate-y-1 active:border-b-0 transition-all shadow-lg hover:text-white"
            >
               Enter
            </button>
            
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Safecracker
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Listen closely. Turn the dial and find the distinctly pitched click for each of the 3 stages.
                  </div>
                  <button 
                     onClick={handleStart}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Listen
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-slate-900 border border-slate-700 p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(251,191,36,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Vault Opened</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-300 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setStage(3);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 1500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Crack Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
