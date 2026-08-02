"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ZoomIn, ZoomOut } from "lucide-react";

export function InteractiveDiary({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [digits, setDigits] = useState<string[]>(["0", "0", "0"]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  
  const targetCode = ["7", "4", "2"]; // Hidden on the cover
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3f3f46";

  const handleDigitChange = (index: number, delta: number) => {
    setDigits(prev => {
      const newDigits = [...prev];
      let val = parseInt(newDigits[index], 10) + delta;
      if (val > 9) val = 0;
      if (val < 0) val = 9;
      newDigits[index] = val.toString();
      
      if (newDigits.join("") === targetCode.join("")) {
        setTimeout(() => {
          setIsUnlocked(true);
    onComplete?.();
          if (onComplete) {
            setTimeout(onComplete, 8000);
          }
        }, 500);
      }
      return newDigits;
    });
  };

  return (
    <div className="w-full h-full relative bg-zinc-900 flex items-center justify-center overflow-hidden font-serif">
      
      <AnimatePresence>
        {!isUnlocked ? (
          <motion.div 
            key="cover"
            className="w-full h-full absolute inset-0 flex flex-col items-center justify-center p-4 bg-zinc-800"
            exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1.5 }}
          >
             {/* The Diary Cover */}
             <div className="relative w-[320px] h-[480px] bg-amber-900 rounded-r-2xl rounded-l-md shadow-2xl border-l-[16px] border-amber-950 overflow-hidden transform-gpu"
                  style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/leather.png')" }}>
                
                {/* The zoomable art area */}
                <motion.div 
                   className="absolute inset-0 cursor-move"
                   drag
                   dragConstraints={{ left: -100, right: 100, top: -150, bottom: 150 }}
                   animate={{ scale: zoomLevel }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                   {/* Title */}
                   <div className="absolute top-12 left-0 w-full text-center pointer-events-none">
                      <h1 className="text-amber-300/40 text-4xl uppercase tracking-[0.3em] font-black" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 1px rgba(255,255,255,0.1)" }}>
                         Journal
                      </h1>
                   </div>

                   {/* Doodle / Clue 1: '7' hidden in a scratched star */}
                   <div className="absolute top-32 left-12 opacity-40 mix-blend-multiply pointer-events-none rotate-12">
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="3">
                         <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
                         {/* The 7 */}
                         <path d="M45 40 L55 40 L50 60" stroke="#000" strokeWidth="5" />
                      </svg>
                   </div>

                   {/* Doodle / Clue 2: '4' hidden in coffee stain */}
                   <div className="absolute bottom-40 right-8 w-24 h-24 rounded-full border-4 border-black/20 opacity-50 mix-blend-multiply pointer-events-none" style={{ backgroundColor: "#3e272333" }}>
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                         {/* The 4 */}
                         <path d="M60 70 L60 30 L35 55 L70 55" fill="none" stroke="#000" strokeWidth="4" className="opacity-40" />
                      </svg>
                   </div>

                   {/* Doodle / Clue 3: '2' in the spine stitching */}
                   <div className="absolute top-64 left-2 w-8 h-16 pointer-events-none opacity-30 mix-blend-multiply">
                      <svg width="100%" height="100%" viewBox="0 0 50 100">
                         <path d="M10 20 Q30 20 30 50 Q10 80 40 80" fill="none" stroke="#000" strokeWidth="4" />
                      </svg>
                   </div>
                </motion.div>

                {/* The Lock Strap & Mechanism (Fixed, doesn't zoom) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-20 bg-amber-800 rounded-l-lg border-y-4 border-l-4 border-amber-950 flex items-center justify-center shadow-[-5px_0_15px_rgba(0,0,0,0.5)] z-20 pointer-events-auto">
                   <div className="bg-zinc-300 p-2 rounded shadow-inner border border-zinc-500 flex gap-1">
                      {[0, 1, 2].map(idx => (
                         <div key={idx} className="flex flex-col items-center">
                            <button onClick={() => handleDigitChange(idx, 1)} className="text-zinc-600 hover:text-black active:scale-95 text-xs p-1">▲</button>
                            <div className="w-6 h-8 bg-zinc-100 border-t-2 border-b-2 border-zinc-400 flex items-center justify-center font-mono font-bold text-lg shadow-inner">
                               {digits[idx]}
                            </div>
                            <button onClick={() => handleDigitChange(idx, -1)} className="text-zinc-600 hover:text-black active:scale-95 text-xs p-1">▼</button>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                   <button 
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                      className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur"
                   >
                      <ZoomIn size={18} />
                   </button>
                   <button 
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                      className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur"
                   >
                      <ZoomOut size={18} />
                   </button>
                </div>

             </div>
             <p className="text-white/40 mt-8 text-sm italic">Inspect the cover to find the 3-digit code.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="pages"
            className="w-full h-full absolute inset-0 bg-[#fdfbf7] p-8 overflow-y-auto"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ transformOrigin: "left center" }}
          >
             <div className="max-w-md mx-auto relative min-h-full pb-32">
                {/* Lined paper effect */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "100% 32px", marginTop: "48px" }} />
                
                <h1 className="text-4xl font-serif text-zinc-800 mb-8 pt-4 pb-2 border-b-2 border-zinc-300" style={{ color: primaryColor }}>
                   {config.title || "The Diary"}
                </h1>
                
                <div className="font-serif text-lg leading-[32px] text-zinc-700 whitespace-pre-wrap relative z-10" style={{ fontFamily: "Georgia, serif" }}>
                   {config.body || "It's been a long time since I opened this..."}
                </div>
                
                {/* Simulated handwritten signoff */}
                <div className="mt-16 text-right font-script text-3xl text-blue-900/80 -rotate-2 opacity-80" style={{ fontFamily: "'Dancing Script', cursive" }}>
                   — {config.recipient || "A Friend"}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isUnlocked && (
         <div className="absolute top-4 right-4 z-50">
            <button 
               onClick={() => {
                 setIsUnlocked(true);
                 onComplete?.();
               }}
               className="bg-amber-500 text-black px-4 py-2 text-xs font-bold uppercase rounded shadow-lg"
            >
               Unlock (Editor Bypass)
            </button>
         </div>
      )}

    </div>
  );
}
