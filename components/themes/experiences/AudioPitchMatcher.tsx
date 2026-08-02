"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_FREQ = 440; // A4
const MIN_FREQ = 200;
const MAX_FREQ = 800;
const MARGIN_OF_ERROR = 4;
const WIN_DURATION = 3000; // ms

export function AudioPitchMatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // Emerald 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // Emerald 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [userFreq, setUserFreq] = useState(() => MIN_FREQ + Math.random() * (MAX_FREQ - MIN_FREQ));
  const [matchProgress, setMatchProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const targetOscRef = useRef<OscillatorNode | null>(null);
  const userOscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  
  const userFreqRef = useRef(userFreq);
  const gameLoopRef = useRef(0);
  const matchStartRef = useRef<number | null>(null);

  const initAudio = () => {
     try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const gain = ctx.createGain();
        gain.gain.value = 0.1; // Keep it quiet
        gain.connect(ctx.destination);
        gainRef.current = gain;

        const tOsc = ctx.createOscillator();
        tOsc.type = "sine";
        tOsc.frequency.value = TARGET_FREQ;
        tOsc.connect(gain);
        tOsc.start();
        targetOscRef.current = tOsc;

        const uOsc = ctx.createOscillator();
        uOsc.type = "sine";
        uOsc.frequency.value = userFreq;
        uOsc.connect(gain);
        uOsc.start();
        userOscRef.current = uOsc;

        setGameState("playing");
        startLoop();
     } catch (e) {
        console.error("Web Audio API not supported", e);
     }
  };

  const startLoop = () => {
     const loop = () => {
        // The context is nulled after a win/cleanup; a stray queued frame must bail out
        // (the old `?.state === "closed"` check let a NULL ref fall through and crash).
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === "closed") return;

        const currentFreq = userFreqRef.current;
        if (userOscRef.current) {
           // Smooth frequency transition to avoid clicking/popping
           userOscRef.current.frequency.setTargetAtTime(currentFreq, ctx.currentTime, 0.05);
        }

        const isMatching = Math.abs(currentFreq - TARGET_FREQ) <= MARGIN_OF_ERROR;

        if (isMatching) {
           if (matchStartRef.current === null) {
              matchStartRef.current = Date.now();
           } else {
              const duration = Date.now() - matchStartRef.current;
              const progress = Math.min(100, (duration / WIN_DURATION) * 100);
              setMatchProgress(progress);

              if (progress >= 100) {
                 handleWin();
                 return; // Stop loop
              }
           }
        } else {
           matchStartRef.current = null;
           setMatchProgress(prev => Math.max(0, prev - 5)); // Decay progress slowly
        }

        gameLoopRef.current = requestAnimationFrame(loop);
     };
     gameLoopRef.current = requestAnimationFrame(loop);
  };

  const handleWin = () => {
     if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
     setGameState("won");
    onComplete?.();
     if (gainRef.current && audioCtxRef.current) {
        // Fade out nicely
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
           audioCtxRef.current?.close();
           audioCtxRef.current = null;
        }, 1000);
     }
     setTimeout(() => setShowPayload(true), 1500);
  };

  useEffect(() => {
     return () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (audioCtxRef.current?.state !== "closed") {
           audioCtxRef.current?.close();
        }
     };
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = parseFloat(e.target.value);
     setUserFreq(val);
     userFreqRef.current = val;
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[3/4] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col items-center p-6 ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         <div className="w-full flex justify-between items-center mb-10">
            <div className="flex flex-col">
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">Target</span>
               <div className="h-1 w-8 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-slate-400 animate-pulse" />
               </div>
            </div>
            <div className="text-white font-black text-xl tracking-widest text-shadow-sm opacity-50">
               TUNE
            </div>
            <div className="flex flex-col items-end">
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">You</span>
               <div className="h-1 w-8 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all" style={{ width: `${((userFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100}%`, backgroundColor: primaryColor }} />
               </div>
            </div>
         </div>

         {/* Circular Visualizer */}
         <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
            {/* Target Ring */}
            <div className="absolute w-full h-full rounded-full border-2 border-slate-600 border-dashed animate-[spin_10s_linear_infinite]" />
            
            {/* User Ring */}
            <div 
               className="absolute rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-75"
               style={{
                  width: `${((userFreq / MAX_FREQ) * 80) + 20}%`,
                  height: `${((userFreq / MAX_FREQ) * 80) + 20}%`,
                  borderColor: primaryColor,
                  opacity: 0.5 + (matchProgress / 200)
               }}
            />

            {/* Match Progress Glow */}
            <div 
               className="absolute w-full h-full rounded-full transition-all duration-300 pointer-events-none mix-blend-screen"
               style={{
                  background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
                  opacity: matchProgress / 100,
                  transform: `scale(${1 + (matchProgress / 100) * 0.5})`
               }}
            />

            {matchProgress > 0 && matchProgress < 100 && (
               <div className="absolute font-black text-white text-3xl drop-shadow-md">
                  {Math.floor(matchProgress)}%
               </div>
            )}
            {matchProgress === 100 && (
               <div className="absolute font-black text-white text-3xl drop-shadow-md">
                  LOCKED
               </div>
            )}
         </div>

         {/* Slider Container */}
         <div className="w-full flex-1 flex flex-col items-center justify-center relative px-4">
            <div className="w-full flex justify-between text-slate-500 text-xs font-bold mb-4">
               <span>LOW</span>
               <span>HIGH</span>
            </div>
            
            <input 
               type="range" 
               min={MIN_FREQ} 
               max={MAX_FREQ} 
               step="0.1"
               value={userFreq}
               onChange={handleSliderChange}
               className="w-full appearance-none bg-slate-800 h-12 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg cursor-pointer"
               style={{
                  // Webkit slider thumb colored shadow hack doesn't work easily with inline styles, 
                  // but we can give the track a background based on primaryColor
                  background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${((userFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100}%, #1e293b ${((userFreq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100}%, #1e293b 100%)`
               }}
            />
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Pitch Match
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Listen closely.<br/>Tune the slider until your pitch matches the target.
                  </div>
                  <button 
                     onClick={initAudio}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform flex items-center gap-3"
                     style={{ backgroundColor: primaryColor }}
                  >
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M8 5v14l11-7z" />
                     </svg>
                     Listen & Play
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(16,185,129,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Perfect Harmony</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
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
               onClick={handleWin}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Tune Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
