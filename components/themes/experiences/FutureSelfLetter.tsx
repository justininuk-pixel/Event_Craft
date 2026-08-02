"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Clock, FileText, Settings } from "lucide-react";

export function FutureSelfLetter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  // Fallback defaults if the data model hasn't specifically structured this yet
  const letterBody = config.body || "Dear Future Me, \n\nI hope you are happy. I hope you finally took that trip. Remember who you were today.\n\nLove, \nPast You";
  
  // Simulated Target Date (1 year in the future by default, or read from features)
  // To allow testing, we add a mock toggle for "Editor Preview"
  const defaultTargetDate = Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 year
  
  const [now, setNow] = useState(() => Date.now());
  const [isLocked, setIsLocked] = useState(true);
  const [mockUnlock, setMockUnlock] = useState(false);

  const targetDate = mockUnlock ? now - 1000 : defaultTargetDate;

  useEffect(() => {
     const interval = setInterval(() => {
        setNow(Date.now());
     }, 1000);
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     if (now >= targetDate && isLocked) {
        setIsLocked(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
     }
  }, [now, targetDate, isLocked]);

  const getTimeRemaining = () => {
     const diff = Math.max(0, targetDate - now);
     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
     const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
     const secs = Math.floor((diff % (1000 * 60)) / 1000);

     if (days > 0) return `${days}d ${hours}h`;
     if (hours > 0) return `${hours}h ${mins}m`;
     return `${mins}m ${secs}s`;
  };

  const handleCompleteRead = () => {
     if (onComplete) {
        onComplete();
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {mode === "editor-preview" && isLocked && (
         <button 
            onClick={() => setMockUnlock(true)}
            className="absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/20 transition-all"
         >
            <Settings size={14} /> Force Unlock
         </button>
      )}

      <div className="flex-1 flex items-center justify-center relative w-full h-full p-6">
         
         <AnimatePresence mode="wait">
            {isLocked ? (
               <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, rotateY: 90 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full max-w-sm flex flex-col items-center"
               >
                  {/* The Vault UI */}
                  <div className="w-64 h-64 bg-slate-800 rounded-full border-[12px] border-slate-700 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden mb-8">
                     {/* Vault texture/shadows */}
                     <div className="absolute inset-0 shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)] pointer-events-none" />
                     <div className="absolute w-[150%] h-[150%] animate-[spin_60s_linear_infinite]" 
                          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.05) 90deg, transparent 180deg, rgba(255,255,255,0.05) 270deg, transparent 360deg)' }} />

                     <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 text-slate-500">
                        <Lock size={32} />
                     </div>

                     <div className="absolute bottom-8 text-xs font-mono font-bold text-slate-400 z-10 flex items-center gap-2 bg-black/50 px-4 py-1 rounded-full border border-slate-700">
                        <Clock size={12} /> {getTimeRemaining()}
                     </div>
                  </div>

                  <h2 className="text-3xl font-black text-white tracking-tight text-center mb-2">
                     Time Capsule
                  </h2>
                  <p className="text-slate-400 font-medium text-center max-w-[250px] leading-relaxed">
                     This letter is cryptographically locked until {new Date(defaultTargetDate).toLocaleDateString()}.
                  </p>

               </motion.div>
            ) : (
               <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-full max-w-md h-full py-12 flex flex-col"
               >
                  
                  <div className="flex items-center justify-center mb-8 gap-3 text-emerald-400">
                     <Unlock size={24} />
                     <h2 className="text-xl font-bold uppercase tracking-widest">
                        Capsule Opened
                     </h2>
                  </div>

                  <div className="flex-1 bg-[#fdfbf7] rounded-sm p-8 shadow-2xl relative border border-slate-200 overflow-y-auto">
                     {/* Paper texture */}
                     <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                     
                     <div className="w-full flex justify-between items-end border-b-2 border-slate-300 pb-4 mb-6 relative z-10">
                        <h3 className="text-3xl font-serif font-bold text-slate-800">
                           {config.title || "To Future Me"}
                        </h3>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                           {new Date(defaultTargetDate).getFullYear()}
                        </div>
                     </div>

                     <div className="prose prose-slate prose-p:font-serif prose-p:leading-loose text-slate-700 relative z-10">
                        {letterBody.split('\n').map((paragraph, i) => (
                           <p key={i} className="mb-4">{paragraph}</p>
                        ))}
                     </div>
                  </div>

                  <button
                     onClick={handleCompleteRead}
                     className="mt-8 py-4 px-8 rounded-full font-bold text-white shadow-lg mx-auto flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     <FileText size={18} /> I've read it
                  </button>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
