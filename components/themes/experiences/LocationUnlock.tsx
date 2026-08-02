"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
];

export function LocationUnlock({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"locked" | "revealing" | "revealed">("locked");
  const [unlockedCountries, setUnlockedCountries] = useState<typeof MOCK_COUNTRIES>([]);
  const [hasPinged, setHasPinged] = useState(false);
  
  const REQUIRED = 10;
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  // Initialize with a few random countries already unlocked
  useEffect(() => {
     const shuffled = [...MOCK_COUNTRIES].sort(() => 0.5 - Math.random());
     setUnlockedCountries(shuffled.slice(0, 7)); // Start with 7/10
  }, []);

  // Simulate global traffic trickling in
  useEffect(() => {
    if (phase !== "locked" || !hasPinged) return;
    
    const interval = setInterval(() => {
       setUnlockedCountries(prev => {
          if (prev.length >= REQUIRED) return prev;
          const remaining = MOCK_COUNTRIES.filter(c => !prev.find(p => p.code === c.code));
          if (remaining.length === 0) return prev;
          
          const next = remaining[Math.floor(Math.random() * remaining.length)];
          const newArray = [...prev, next];
          
          if (newArray.length >= REQUIRED) {
             handleUnlock();
          }
          return newArray;
       });
    }, 2500);

    return () => clearInterval(interval);
  }, [phase, hasPinged]);

  const handlePing = () => {
     if (hasPinged) return;
     setHasPinged(true);
     
     setUnlockedCountries(prev => {
        const remaining = MOCK_COUNTRIES.filter(c => !prev.find(p => p.code === c.code));
        if (remaining.length === 0) return prev;
        
        // Let's pretend the user is from one of the remaining countries
        const next = remaining[0];
        const newArray = [...prev, next];
        
        if (newArray.length >= REQUIRED) {
           handleUnlock();
        }
        return newArray;
     });
  };

  const handleUnlock = () => {
     setPhase("revealing");
     setTimeout(() => {
        setPhase("revealed");
        if (onComplete) onComplete();
     }, 2000);
  };

  const progress = Math.min(100, (unlockedCountries.length / REQUIRED) * 100);
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      <AnimatePresence mode="wait">
         {phase === "locked" && (
            <motion.div
               key="locked"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 z-30 bg-zinc-950"
            >
               
               <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-8 text-center max-w-xs">
                  Awaiting Global Check-ins
               </h2>

               {/* Progress Circle */}
               <div className="relative flex items-center justify-center mb-12">
                  <svg className="transform -rotate-90 w-72 h-72">
                     {/* Background Circle */}
                     <circle
                        cx="144"
                        cy="144"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-zinc-800"
                     />
                     {/* Progress Circle */}
                     <motion.circle
                        cx="144"
                        cy="144"
                        r={radius}
                        stroke={primaryColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        style={{ strokeDasharray: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                     />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-6xl font-black mb-2" style={{ color: primaryColor }}>
                        {unlockedCountries.length}
                     </span>
                     <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        of {REQUIRED}
                     </span>
                     <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-1">
                        Countries
                     </span>
                  </div>
               </div>

               {/* Country List (Scrolling) */}
               <div className="w-full max-w-md h-16 relative overflow-hidden mb-12">
                  <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
                  <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
                  
                  <div className="flex gap-4 items-center h-full px-12 overflow-x-auto custom-scrollbar whitespace-nowrap">
                     <AnimatePresence>
                        {unlockedCountries.map(c => (
                           <motion.div
                              key={c.code}
                              initial={{ opacity: 0, scale: 0, width: 0 }}
                              animate={{ opacity: 1, scale: 1, width: "auto" }}
                              className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 shrink-0"
                           >
                              <span className="text-xl">{c.flag}</span>
                              <span className="font-bold text-sm text-zinc-300">{c.name}</span>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
               </div>
               
               <button
                  onClick={handlePing}
                  disabled={hasPinged}
                  className="px-8 py-4 rounded-full font-bold text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
                  style={{ backgroundColor: primaryColor }}
               >
                  {hasPinged ? "LOCATION VERIFIED" : "PING MY LOCATION"}
               </button>
            </motion.div>
         )}

         {phase === "revealing" && (
            <motion.div
               key="revealing"
               className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-zinc-950"
            >
               <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 1, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-full h-full flex flex-col items-center justify-center"
               >
                  <span className="text-8xl mb-8">🌍</span>
                  <h1 className="text-4xl font-black text-white tracking-widest uppercase">Global Link Established</h1>
               </motion.div>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 overflow-y-auto pb-32 pt-16 px-8 flex flex-col items-center justify-center bg-zinc-950"
            >
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl flex flex-col items-center shadow-2xl border border-zinc-700 text-center"
               >
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-3xl font-heading mb-4 text-white">
                   {config.title}
                 </h1>
                 <p className="text-base font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
