"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Unlock, Lock, Users, Hourglass } from "lucide-react";

export function MultiKeyTimeCapsule({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const requiredKeys = (config.experience as any)?.requiredKeys || 3;
  
  const [keysEntered, setKeysEntered] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Simulation for editor/demo
  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (keysEntered > 0 && keysEntered < requiredKeys && !isUnlocked) {
        if (timeLeft === null) setTimeLeft(60);
        
        interval = setInterval(() => {
           setTimeLeft(prev => {
              if (prev !== null && prev <= 1) {
                 clearInterval(interval);
                 setKeysEntered(0); // Reset if time runs out
                 return null;
              }
              return prev !== null ? prev - 1 : null;
           });
        }, 1000);
     } else if (keysEntered >= requiredKeys) {
        setIsUnlocked(true);
    onComplete?.();
        setTimeLeft(null);
        if (onComplete) setTimeout(onComplete, 5000);
     }

     return () => clearInterval(interval);
  }, [keysEntered, requiredKeys, isUnlocked, timeLeft, onComplete]);

  const insertKey = () => {
     if (isUnlocked) return;
     setKeysEntered(prev => Math.min(requiredKeys, prev + 1));
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
  };

  const simulateFriends = () => {
     if (isUnlocked) return;
     let added = 0;
     const interval = setInterval(() => {
        if (added < requiredKeys - 1) {
           insertKey();
           added++;
        } else {
           clearInterval(interval);
        }
     }, 1500);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white transition-colors duration-1000"
      style={{ backgroundColor: isUnlocked ? "#f8fafc" : bgColors[0] }}
    >
      
      {/* Background Vault Door */}
      {!isUnlocked && (
         <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[120%] aspect-square rounded-full border-[40px] border-white/20 border-dashed" style={{ animation: 'spin 60s linear infinite' }} />
            <div className="absolute w-[80%] aspect-square rounded-full border-[20px] border-white/30" />
            <div className="absolute w-[40%] aspect-square rounded-full border-[10px] border-white/40 border-dotted" style={{ animation: 'spin 30s linear infinite reverse' }} />
         </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight drop-shadow-md mb-2" style={{ color: isUnlocked ? primaryColor : "white" }}>
               {isUnlocked ? "Vault Opened" : (config.title || "The Time Capsule")}
            </h2>
            <p className="font-medium text-sm max-w-[280px] mx-auto leading-relaxed" style={{ color: isUnlocked ? "#64748b" : "rgba(255,255,255,0.6)" }}>
               {isUnlocked 
                  ? "The memories are now available to everyone." 
                  : config.body || `This vault requires ${requiredKeys} people to unlock it simultaneously.`}
            </p>
         </div>

         {/* The Lock Mechanism */}
         <AnimatePresence mode="wait">
            {!isUnlocked ? (
               <motion.div 
                  key="locked"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center w-full max-w-sm"
               >
                  <div className="relative w-48 h-48 rounded-full border-8 border-slate-700 bg-slate-800 flex items-center justify-center shadow-2xl mb-8">
                     <Lock size={64} className="text-slate-500" />
                     
                     {/* Keyhole indicators */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {Array.from({ length: requiredKeys }).map((_, i) => {
                           const angle = (i * (360 / requiredKeys)) * (Math.PI / 180);
                           const radius = 96; // outside the circle
                           const x = Math.cos(angle) * radius;
                           const y = Math.sin(angle) * radius;
                           const isEntered = i < keysEntered;
                           
                           return (
                              <motion.div 
                                 key={i}
                                 className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300"
                                 style={{ 
                                    left: `calc(50% + ${x}px)`, 
                                    top: `calc(50% + ${y}px)`,
                                    backgroundColor: isEntered ? primaryColor : '#334155'
                                 }}
                                 animate={isEntered ? { scale: [1, 1.2, 1] } : {}}
                              >
                                 <Key size={14} className={isEntered ? "text-white" : "text-slate-500"} />
                              </motion.div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Timer */}
                  {timeLeft !== null && (
                     <div className="flex items-center gap-2 text-amber-400 font-bold mb-6 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
                        <Hourglass size={16} className="animate-spin-slow" /> Window closing: {timeLeft}s
                     </div>
                  )}

                  {/* User Controls */}
                  <div className="flex flex-col items-center gap-4 w-full">
                     <button 
                        onClick={insertKey}
                        disabled={keysEntered >= requiredKeys}
                        className="w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-white uppercase tracking-widest text-sm disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                     >
                        <Key size={18} /> Insert Your Key
                     </button>
                     
                     {mode === "editor-preview" && keysEntered === 1 && (
                        <button 
                           onClick={simulateFriends}
                           className="w-full py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2"
                        >
                           <Users size={14} /> Simulate Friends Joining
                        </button>
                     )}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="unlocked"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="flex flex-col items-center text-slate-800"
               >
                  <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-8" style={{ backgroundColor: primaryColor }}>
                     <Unlock size={64} className="text-white" />
                  </div>
                  
                  <div className="p-6 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm text-center">
                     <p className="font-serif italic text-lg leading-relaxed text-slate-600">
                        "Here are the memories we locked away. Safe and sound."
                     </p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
