"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Play, Square, Settings, Maximize } from "lucide-react";

export function TabataFlashTimer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [workSeconds, setWorkSeconds] = useState(20);
  const [restSeconds, setRestSeconds] = useState(10);
  const [totalRounds, setTotalRounds] = useState(8);
  
  const [status, setStatus] = useState<"idle" | "work" | "rest" | "finished">("idle");
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workSeconds);

  useEffect(() => {
     let interval: NodeJS.Timeout;
     
     if (status === "work" || status === "rest") {
        interval = setInterval(() => {
           setTimeLeft(prev => {
              if (prev > 1) return prev - 1;
              
              // Transition state
              if (status === "work") {
                 // Transition to rest or finish
                 if (currentRound >= totalRounds) {
                    setStatus("finished");
                    if (onComplete) onComplete();
                    return 0;
                 } else {
                    setStatus("rest");
                    return restSeconds;
                 }
              } else {
                 // Transition to work
                 setStatus("work");
                 setCurrentRound(r => r + 1);
                 return workSeconds;
              }
           });
        }, 1000);
     }

     return () => clearInterval(interval);
  }, [status, currentRound, totalRounds, workSeconds, restSeconds, onComplete]);

  const handleStart = () => {
     setStatus("work");
     setCurrentRound(1);
     setTimeLeft(workSeconds);
  };
  
  const handleStop = () => {
     setStatus("idle");
  };

  // Determine full-viewport color
  let bgColor = "#000000"; // idle (black)
  let textColor = "#ffffff";
  let label = "READY";
  
  if (status === "work") {
     bgColor = "#22c55e"; // green-500
     label = "WORK!";
  } else if (status === "rest") {
     bgColor = "#ef4444"; // red-500
     label = "REST";
  } else if (status === "finished") {
     bgColor = "#3b82f6"; // blue-500
     label = "DONE";
  }

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      
      {/* If Idle, show setup. If running, hide everything except massive timer */}
      {status === "idle" ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto w-full">
            
            <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic text-white">
               {config.title || "Tabata Flash"}
            </h2>
            <p className="text-neutral-400 font-bold mb-12 uppercase tracking-widest text-sm">
               {config.body || "High Visibility Interval Timer"}
            </p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full space-y-6 shadow-2xl">
               
               <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Work Time</span>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setWorkSeconds(Math.max(5, workSeconds - 5))} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">-</button>
                     <span className="w-8 text-center font-black text-xl">{workSeconds}s</span>
                     <button onClick={() => setWorkSeconds(workSeconds + 5)} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">+</button>
                  </div>
               </div>
               
               <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Rest Time</span>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setRestSeconds(Math.max(5, restSeconds - 5))} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">-</button>
                     <span className="w-8 text-center font-black text-xl">{restSeconds}s</span>
                     <button onClick={() => setRestSeconds(restSeconds + 5)} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">+</button>
                  </div>
               </div>

               <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Rounds</span>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setTotalRounds(Math.max(1, totalRounds - 1))} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">-</button>
                     <span className="w-8 text-center font-black text-xl">{totalRounds}</span>
                     <button onClick={() => setTotalRounds(totalRounds + 1)} className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold">+</button>
                  </div>
               </div>

            </div>

            <button
               onClick={handleStart}
               className="mt-12 bg-white text-black px-12 py-5 rounded-full font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
               <Play size={24} fill="black" /> START
            </button>
         </div>
      ) : (
         <div className="flex-1 flex flex-col relative">
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white/80 z-20">
               <span className="font-black text-2xl tracking-tighter">
                  ROUND {currentRound}/{totalRounds}
               </span>
               <button 
                  onClick={handleStop}
                  className="bg-black/20 hover:bg-black/40 p-3 rounded-xl transition-colors backdrop-blur"
               >
                  <Square size={24} fill="currentColor" />
               </button>
            </div>

            {/* Massive Viewport Text */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full">
               
               <span 
                  className="font-black tracking-tighter w-full text-center leading-none" 
                  style={{ fontSize: "clamp(4rem, 25vw, 40rem)", textShadow: "0 10px 50px rgba(0,0,0,0.3)" }}
               >
                  {timeLeft}
               </span>
               
               <span className="text-[clamp(2rem,10vw,8rem)] font-black uppercase tracking-widest mt-[-2%] opacity-80 mix-blend-overlay">
                  {label}
               </span>

            </div>

            {/* Progress Bar (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20 z-20">
               <div 
                  className="h-full bg-white transition-all ease-linear"
                  style={{ 
                     width: `${((status === "work" ? (workSeconds - timeLeft) / workSeconds : (restSeconds - timeLeft) / restSeconds)) * 100}%`,
                     transitionDuration: "1s"
                  }}
               />
            </div>
         </div>
      )}

      {/* Editor Bypass */}
      {mode === "editor-preview" && status === "work" && (
         <div className="absolute bottom-16 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setStatus("finished");
                  if(onComplete) onComplete();
               }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Finish (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
