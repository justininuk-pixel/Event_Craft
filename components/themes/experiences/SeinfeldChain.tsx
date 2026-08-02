"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Flame, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export function SeinfeldChain({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  const daysInYear = 365;

  const [showIntro, setShowIntro] = useState(true);

  // Real "today" (day of year) and a real, persistent chain — the old version showed a fake
  // randomly-generated history, which made no sense to a recipient. Now the card is a genuine
  // challenge: mark each day you keep the promise; the chain survives revisits (localStorage).
  const storageKey = `cc-chain-${(config.title || "chain").slice(0, 40)}`;
  const currentDayIndex = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now.getTime() - start.getTime()) / 86400000) - 1;
  })();
  const [history, setHistory] = useState<boolean[]>(() => Array(daysInYear).fill(false));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, daysInYear));
      }
    } catch { /* fresh chain */ }
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(history)); } catch { /* full */ }
  }, [history, storageKey]);

  // Calculate current streak (walk backwards from today)
  const currentStreak = history.slice(0, currentDayIndex + 1).reverse().findIndex(val => val === false);
  const displayStreak = currentStreak === -1 ? currentDayIndex + 1 : currentStreak;

  const toggleDay = (index: number) => {
     if (index > currentDayIndex) return; // Can't toggle future days
     setHistory(prev => {
        const next = [...prev];
        next[index] = !next[index];
        return next;
     });
  };

  useEffect(() => {
     // arbitrary completion: if they have a streak of 30+
     if (displayStreak >= 30 && onComplete) {
        onComplete();
     }
  }, [displayStreak, onComplete]);

  return (
    <div
      className="w-full h-full relative flex flex-col font-sans text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >

      {/* Intro — explains the mechanic so the recipient knows what this is */}
      {showIntro && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
            <Flame size={40} className="mx-auto mb-4" style={{ color: primaryColor }} />
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">
              {config.title || "Don't Break The Chain"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              {config.body || "A little challenge, from me to you."}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Every day you keep it up, tap today&apos;s square. Keep the chain alive — a 30-day
              streak earns you a celebration. This page remembers your progress.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-3 rounded-xl text-white font-black uppercase tracking-widest text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Accept the challenge
            </button>
          </div>
        </div>
      )}

      {/* Header (Fixed) */}
      <div className="w-full bg-white border-b border-slate-200 p-6 flex items-center justify-between shadow-sm z-20">
         <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
               {config.title || "Don't Break The Chain"}
            </h2>
            <p className="text-slate-500 font-medium">
               {config.body || "Write 500 words daily."}
            </p>
         </div>
         
         <div className="flex flex-col items-center bg-slate-100 px-6 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Streak</span>
            <div className="flex items-center gap-2 text-2xl font-black" style={{ color: primaryColor }}>
               <Flame size={24} className={displayStreak > 0 ? "animate-pulse" : "opacity-50"} />
               {displayStreak} <span className="text-sm font-medium text-slate-400">days</span>
            </div>
         </div>
      </div>

      {/* Grid Container (Scrollable) */}
      <div className="flex-1 w-full overflow-auto p-4 sm:p-8 bg-slate-50 relative z-10">
         
         {/* We use a CSS grid for the boxes. We will overlay SVGs for the chains. */}
         <div className="w-full max-w-5xl mx-auto grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-20 gap-2 sm:gap-3">
            {history.map((isDone, i) => {
               const isFuture = i > currentDayIndex;
               const isToday = i === currentDayIndex;
               
               // Does it connect to the previous day?
               const connectsPrev = i > 0 && isDone && history[i - 1];
               
               return (
                  <div 
                     key={i} 
                     className="relative aspect-square"
                  >
                     {/* The Box */}
                     <motion.div
                        whileTap={!isFuture ? { scale: 0.9 } : {}}
                        onClick={() => toggleDay(i)}
                        className={`w-full h-full rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer relative z-10 ${
                           isFuture 
                              ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                              : isDone
                                 ? 'border-transparent shadow-sm'
                                 : isToday
                                    ? 'border-slate-400 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                        style={{ 
                           backgroundColor: isDone ? primaryColor : undefined,
                        }}
                     >
                        {isDone && <Check size={16} strokeWidth={4} className="text-white" />}
                        {(!isDone && !isFuture && !isToday) && <X size={12} className="text-slate-300" />}
                        
                        {/* Day indicator for today */}
                        {isToday && !isDone && (
                           <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                        )}
                     </motion.div>

                     {/* The Chain Link (Overlay connecting to previous box) */}
                     {/* Because of CSS Grid, we can't easily draw an SVG across rows unless we do absolute positioning.
                         Instead, we'll fake the chain visually if they are adjacent in the DOM, 
                         or we can just show a thick connecting line that bleeds out of the box. */}
                     {connectsPrev && (
                        <div 
                           className="absolute top-1/2 -left-3 w-4 h-2 z-0 rounded-full"
                           style={{ 
                              backgroundColor: primaryColor,
                              transform: "translateY(-50%)",
                              // If it's the first item in a row (mod col count), hide the connection visually or it wraps weirdly
                              // In a responsive grid we don't know the exact col count easily without JS.
                              // So we'll use a trick: give it a very low z-index so it hides behind the grid gap, 
                              // or just rely on flex/grid gaps. Let's make it a pseudo element on the box.
                           }}
                        />
                     )}
                     
                     {/* A better way to show the chain: a horizontal line that spans the gap */}
                     {/* We use a pseudo-element style div that overflows to the left. If it wraps to a new line, it might overflow the screen. */}
                     {connectsPrev && (
                        <div 
                           className="absolute top-1/2 left-0 w-[150%] h-2 -translate-x-1/2 -translate-y-1/2 z-0 hidden sm:block"
                           style={{ backgroundColor: primaryColor }}
                        />
                     )}
                     {/* The above handles visual linking. For a true chain, we'd need a canvas or absolute SVG overlay. For the UI component, this blocky connection works. */}
                  </div>
               )
            })}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && displayStreak < 30 && (
         <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  const newHist = [...history];
                  for(let i=30; i<=59; i++) {
                     newHist[i] = true;
                  }
                  setHistory(newHist);
               }}
               className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full shadow-xl"
            >
               Build 30-Day Streak (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
