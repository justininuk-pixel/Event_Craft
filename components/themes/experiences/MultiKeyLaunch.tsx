"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MultiKeyLaunch({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"waiting" | "launched">("waiting");
  const [ghost1Hold, setGhost1Hold] = useState(false);
  const [ghost2Hold, setGhost2Hold] = useState(false);
  const [myHold, setMyHold] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playClick = useCallback((isOn: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(isOn ? 800 : 300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isOn ? 1200 : 200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playAlarm = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    for(let i=0; i<4; i++) {
       osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + i*0.5 + 0.25);
       osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + i*0.5 + 0.5);
    }
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }, []);

  useEffect(() => {
    if (phase !== "waiting") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "waiting") return;
       
       if (Math.random() > 0.3) setGhost1Hold(true);
       else setGhost1Hold(false);
       
       if (Math.random() > 0.5) setGhost2Hold(true);
       else setGhost2Hold(false);
       
    }, 1500);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
     if (phase !== "waiting") return;

     if (ghost1Hold && ghost2Hold && myHold) {
        setIsVerifying(true);
        const timer = setTimeout(() => {
           if (ghost1Hold && ghost2Hold && myHold) {
              setPhase("launched");
              playAlarm();
              if (onComplete) onComplete();
           } else {
              setIsVerifying(false);
           }
        }, 1000);
        return () => clearTimeout(timer);
     } else {
        setIsVerifying(false);
     }
  }, [ghost1Hold, ghost2Hold, myHold, phase, onComplete, playAlarm]);

  const handlePointerDown = () => {
     if (phase !== "waiting") return;
     initAudio();
     playClick(true);
     setMyHold(true);
  };
  
  const handlePointerUp = () => {
     if (phase !== "waiting") return;
     playClick(false);
     setMyHold(false);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 text-white touch-none flex flex-col font-mono select-none">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "launched" ? 1 : 0.05,
          filter: phase === "launched" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "launched" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "launched" ? (Array.isArray(palette.background) ? palette.background[0] : palette.background) || '#000' : 'transparent',
          pointerEvents: phase === "launched" ? "auto" : "none"
        }}
      >
        <div className="w-full max-w-lg bg-zinc-900 p-8 rounded-3xl shadow-[0_0_100px_rgba(255,0,0,0.5)] flex flex-col items-center border-4 border-red-900">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-red-500 uppercase tracking-widest font-black">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
         {phase === "waiting" && (
            <motion.div 
               className="absolute inset-0 z-20 flex flex-col bg-zinc-950"
               initial={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.5 }}
               transition={{ duration: 0.8 }}
            >
               
               <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <h2 className="text-3xl md:text-5xl font-black text-red-600 tracking-widest text-center uppercase mb-2">
                     Authorization Required
                  </h2>
                  <p className="text-red-400/70 uppercase tracking-widest text-sm mb-16">
                     Requires 3 synchronized keys
                  </p>
                  
                  {/* Status Dashboard */}
                  <div className="flex justify-center gap-6 mb-16 w-full max-w-md">
                     {[
                        { id: 1, label: "CONN 1", hold: ghost1Hold },
                        { id: 2, label: "CONN 2", hold: ghost2Hold },
                        { id: 3, label: "LOCAL", hold: myHold },
                     ].map(key => (
                        <div key={key.id} className="flex flex-col items-center gap-3">
                           <div className={`w-16 h-24 border-4 rounded-md transition-all duration-300 flex items-center justify-center ${key.hold ? "border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.4)]" : "border-zinc-800"}`}>
                              <div className={`w-full h-full transition-all duration-300 ${key.hold ? "bg-red-500" : "bg-transparent"}`} />
                           </div>
                           <span className={`text-xs font-bold tracking-widest ${key.hold ? "text-red-500" : "text-zinc-600"}`}>
                              {key.label}
                           </span>
                        </div>
                     ))}
                  </div>
                  
                  {/* The Button */}
                  <div className="relative">
                     {/* Verifying Animation Ring */}
                     <AnimatePresence>
                        {isVerifying && (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1.5 }}
                              exit={{ opacity: 0, scale: 2 }}
                              transition={{ duration: 1 }}
                              className="absolute inset-0 rounded-full border-4 border-red-500 pointer-events-none"
                           />
                        )}
                     </AnimatePresence>
                     
                     <motion.button
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        whileTap={{ scale: 0.95 }}
                        className={`w-48 h-48 rounded-full border-8 shadow-2xl flex items-center justify-center transition-colors duration-300 ${
                           myHold 
                              ? "bg-red-600 border-red-500 text-white shadow-[0_0_50px_rgba(255,0,0,0.8)]" 
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}
                     >
                        <span className="text-2xl font-black uppercase tracking-widest">
                           {myHold ? "HOLD" : "TURN KEY"}
                        </span>
                     </motion.button>
                  </div>
                  
                  <AnimatePresence>
                     {isVerifying && (
                        <motion.p 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="text-red-500 font-bold tracking-widest animate-pulse mt-8"
                        >
                           VERIFYING MULTI-LOCK...
                        </motion.p>
                     )}
                  </AnimatePresence>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
