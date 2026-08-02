"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_CODE = "827391645012";

export function PasscodeFragments({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"entering" | "error" | "revealed">("entering");
  const [inputCode, setInputCode] = useState("");
  const [myFragment, setMyFragment] = useState("************");
  
  useEffect(() => {
     const chunkIndex = Math.floor(Math.random() * 4); 
     const start = chunkIndex * 3;
     let frag = "";
     for (let i = 0; i < 12; i++) {
        if (i >= start && i < start + 3) {
           frag += TARGET_CODE[i];
        } else {
           frag += "*";
        }
     }
     setMyFragment(frag);
  }, []);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playBeep = useCallback((type: "key" | "error" | "success") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === "key") {
       osc.type = "sine";
       osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
       gain.gain.setValueAtTime(0.2, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
       osc.start();
       osc.stop(ctx.currentTime + 0.1);
    } else if (type === "error") {
       osc.type = "sawtooth";
       osc.frequency.setValueAtTime(150, ctx.currentTime);
       osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
       gain.gain.setValueAtTime(0.3, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
       osc.start();
       osc.stop(ctx.currentTime + 0.3);
    } else {
       osc.type = "square";
       osc.frequency.setValueAtTime(600, ctx.currentTime);
       osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
       osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
       gain.gain.setValueAtTime(0.2, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
       osc.start();
       osc.stop(ctx.currentTime + 0.4);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
  }, []);

  const handleKeyPress = (key: string) => {
     if (phase !== "entering") return;
     initAudio();
     
     if (key === "CLEAR") {
        setInputCode("");
        playBeep("key");
        return;
     }
     
     if (key === "SUBMIT") {
        if (inputCode === TARGET_CODE) {
           setPhase("revealed");
           playBeep("success");
           if (onComplete) onComplete();
        } else {
           setPhase("error");
           playBeep("error");
           setTimeout(() => {
              setPhase("entering");
              setInputCode("");
           }, 800);
        }
        return;
     }
     
     if (inputCode.length < 12) {
        setInputCode(prev => prev + key);
        playBeep("key");
     }
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  const formatCode = (code: string, fillWith: string = "_") => {
     let padded = code.padEnd(12, fillWith);
     return `${padded.slice(0,3)}-${padded.slice(3,6)}-${padded.slice(6,9)}-${padded.slice(9,12)}`;
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d1117] touch-none select-none flex flex-col items-center justify-center font-mono">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-emerald-900/50">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-emerald-500"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-emerald-100 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-[#0d1117]/90 backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            
            <div className="w-full max-w-sm border border-slate-800 bg-[#161b22] rounded-2xl p-6 shadow-2xl flex flex-col items-center">
               
               <h2 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-4 w-full text-left">
                  Authentication Required
               </h2>

               {/* Readout */}
               <motion.div 
                  className={`w-full bg-black border-2 rounded-xl p-4 mb-6 flex justify-center ${phase === 'error' ? 'border-red-500 text-red-500' : 'border-emerald-500/50 text-emerald-400'}`}
                  animate={phase === "error" ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
               >
                  <span className="text-2xl tracking-[0.2em] font-bold">
                     {phase === "error" ? "ACCESS DENIED" : formatCode(inputCode)}
                  </span>
               </motion.div>

               {/* Intel Fragment */}
               <div className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 mb-8 flex flex-col items-center">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">
                     Intercepted Intel Fragment
                  </span>
                  <span className="text-amber-500 font-bold tracking-[0.2em]">
                     {formatCode(myFragment, "*")}
                  </span>
               </div>

               {/* Keypad */}
               <div className="grid grid-cols-3 gap-3 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                     <button
                        key={n}
                        onPointerDown={() => handleKeyPress(n.toString())}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all shadow-[0_4px_0_rgb(30,41,59)] active:shadow-[0_0px_0_rgb(30,41,59)] active:translate-y-1"
                     >
                        {n}
                     </button>
                  ))}
                  <button
                     onPointerDown={() => handleKeyPress("CLEAR")}
                     className="bg-red-900/50 hover:bg-red-800 text-red-200 font-bold text-sm py-4 rounded-xl active:scale-95 transition-all shadow-[0_4px_0_rgba(127,29,29,0.5)] active:shadow-[0_0px_0_rgba(127,29,29,0.5)] active:translate-y-1"
                  >
                     CLR
                  </button>
                  <button
                     onPointerDown={() => handleKeyPress("0")}
                     className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all shadow-[0_4px_0_rgb(30,41,59)] active:shadow-[0_0px_0_rgb(30,41,59)] active:translate-y-1"
                  >
                     0
                  </button>
                  <button
                     onPointerDown={() => handleKeyPress("SUBMIT")}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-4 rounded-xl active:scale-95 transition-all shadow-[0_4px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1"
                  >
                     ENT
                  </button>
               </div>

            </div>

            <button
               onClick={handleReveal}
               className="mt-12 text-slate-500/50 hover:text-slate-300 transition-colors text-[10px] font-bold tracking-widest border border-slate-800 px-4 py-2 rounded-full"
            >
               OVERRIDE / SKIP
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
