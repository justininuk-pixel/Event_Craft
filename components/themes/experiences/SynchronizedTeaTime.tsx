"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Users, CheckCircle2 } from "lucide-react";

export function SynchronizedTeaTime({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#b45309"; // amber-700
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"]; // amber-50

  const durationSeconds = 5 * 60; // 5 minutes
  const [isReady, setIsReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [finished, setFinished] = useState(false);

  // Mocking the WebSocket handshake
  useEffect(() => {
     let timeout: NodeJS.Timeout;
     if (isReady && !partnerReady) {
        // If we are ready, pretend the partner connects and gets ready 3 seconds later
        timeout = setTimeout(() => {
           setPartnerReady(true);
        }, 3000);
     }
     return () => clearTimeout(timeout);
  }, [isReady, partnerReady]);

  // Start timer when both are ready
  useEffect(() => {
     if (isReady && partnerReady && !timerActive && !finished) {
        setTimerActive(true);
     }
  }, [isReady, partnerReady, timerActive, finished]);

  // The Timer
  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (timerActive && timeLeft > 0) {
        interval = setInterval(() => {
           setTimeLeft(prev => {
              if (prev <= 1) {
                 setTimerActive(false);
                 setFinished(true);
    onComplete?.();
                 if (onComplete) {
                    setTimeout(onComplete, 5000);
                 }
                 return 0;
              }
              // For editor preview speed, we could decrement faster, but let's just do real-time
              // or maybe a cheat code for preview:
              if (mode === "editor-preview") {
                 return prev - 15; // 15x speed
              }
              return prev - 1;
           });
        }, 1000);
     }
     return () => clearInterval(interval);
  }, [timerActive, timeLeft, mode, onComplete]);

  const formatTime = (secs: number) => {
     const m = Math.floor(secs / 60);
     const s = secs % 60;
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 w-full max-w-md mx-auto text-center">
         
         <AnimatePresence mode="wait">
            {!timerActive && !finished ? (
               <motion.div 
                  key="setup"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
               >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 text-amber-700">
                     <Coffee size={40} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4 text-slate-800">
                     {config.title || "Shared Silence"}
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mb-8 max-w-[280px]">
                     {config.body || "Make a cup of tea. When you both press ready, sit in silence together for 5 minutes."}
                  </p>

                  <div className="w-full bg-white/50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col gap-4 shadow-inner">
                     <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-2">
                           <Users size={16} className="text-slate-400" /> You
                        </span>
                        {isReady ? <CheckCircle2 className="text-emerald-500" size={20} /> : <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Waiting</span>}
                     </div>
                     <div className="h-px bg-amber-200 w-full" />
                     <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-2 text-slate-500">
                           <Users size={16} className="text-slate-400" /> Partner
                        </span>
                        {partnerReady ? <CheckCircle2 className="text-emerald-500" size={20} /> : <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Waiting</span>}
                     </div>
                  </div>

                  <button
                     onClick={() => setIsReady(true)}
                     disabled={isReady}
                     className={`w-full py-4 rounded-xl font-black text-white text-lg uppercase tracking-widest transition-all ${
                        isReady ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'hover:brightness-110 active:scale-95 shadow-lg'
                     }`}
                     style={{ backgroundColor: isReady ? undefined : primaryColor }}
                  >
                     {isReady ? "Waiting for Partner..." : "I'm Ready"}
                  </button>

               </motion.div>
            ) : timerActive && !finished ? (
               <motion.div 
                  key="timer"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center"
               >
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700/50 mb-12">
                     Do not touch the screen.
                  </p>

                  {/* Steeping Teabag Visual */}
                  <div className="relative w-48 h-64 border-4 border-white/40 bg-white/10 rounded-b-[40px] rounded-t-sm flex items-end justify-center overflow-hidden mb-12">
                     <motion.div 
                        className="absolute bottom-0 left-0 right-0"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ height: `${100 - (timeLeft / durationSeconds) * 100}%`, opacity: 0.8 }}
                     />
                     
                     {/* The Teabag */}
                     <motion.div 
                        className="absolute w-16 h-20 bg-amber-900/40 border border-amber-900/20 backdrop-blur-sm shadow-xl flex items-center justify-center -translate-y-8"
                        style={{ borderRadius: '4px 4px 16px 16px' }}
                        animate={{ y: [-30, -25, -30], rotate: [-2, 2, -2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     >
                        <div className="absolute -top-32 w-px h-32 bg-slate-300 left-1/2 -translate-x-1/2" />
                     </motion.div>
                  </div>

                  <div className="text-6xl font-black text-slate-800 tracking-tighter tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                     {formatTime(timeLeft)}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-8 text-emerald-500">
                     <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
                     Tea Time is Over
                  </h3>
                  <p className="text-slate-600 font-medium max-w-[250px] mx-auto leading-relaxed">
                     Thank you for sitting with me. I feel closer to you now.
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
