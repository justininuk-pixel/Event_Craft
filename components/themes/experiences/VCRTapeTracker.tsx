"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, FastForward, Rewind, Tv } from "lucide-react";

type Tape = {
   id: string;
   label: string;
   videoSrc: string; // Mocked as image/color for this demo if needed, but we'll try an mp4
};

const defaultTapes: Tape[] = [
   { id: "1", label: "Summer 1999", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4" },
   { id: "2", label: "Graduation", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4" },
   { id: "3", label: "Roadtrip", videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

export function VCRTapeTracker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // gray-900

  const tapes = (config.experience as any)?.tapes || defaultTapes;
  
  const [activeTape, setActiveTape] = useState<Tape | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  
  const vcrRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragEnd = (e: any, info: any, tape: Tape) => {
     if (!vcrRef.current) return;
     
     const vcrRect = vcrRef.current.getBoundingClientRect();
     // Check if dragged over VCR (roughly)
     if (
        info.point.x > vcrRect.left && info.point.x < vcrRect.right &&
        info.point.y > vcrRect.top && info.point.y < vcrRect.bottom
     ) {
        insertTape(tape);
     }
  };

  const insertTape = (tape: Tape) => {
     setActiveTape(tape);
     setShowStatic(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     
     // Simulate VCR loading
     setTimeout(() => {
        setShowStatic(false);
        setIsPlaying(true);
        if (videoRef.current) {
           videoRef.current.play().catch(e => console.log("Autoplay blocked"));
        }
     }, 1500);
  };

  const ejectTape = () => {
     if (videoRef.current) videoRef.current.pause();
     setIsPlaying(false);
     setShowStatic(true);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(100);
     
     setTimeout(() => {
        setShowStatic(false);
        setActiveTape(null);
        if (onComplete) onComplete();
     }, 500);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* SVG Filters for VHS effect */}
      <svg className="hidden">
         <filter id="vhs-glitch">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.95" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
         </filter>
         <filter id="tv-static">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" in="noise" result="coloredNoise" />
         </filter>
      </svg>

      <div className="flex-1 flex flex-col p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-4">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
               {config.title || "VCR Player"}
            </h2>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">
               {config.body || "Drag a tape into the VCR"}
            </p>
         </div>

         {/* Tape Stack */}
         <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 relative z-20">
            <AnimatePresence>
               {!activeTape && tapes.map((tape: Tape, idx: number) => (
                  <motion.div
                     key={tape.id}
                     drag
                     dragSnapToOrigin
                     onDragEnd={(e, info) => handleDragEnd(e, info, tape)}
                     whileDrag={{ scale: 1.05, zIndex: 50, rotate: 2 }}
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     transition={{ delay: idx * 0.1 }}
                     className="w-64 h-20 bg-slate-800 border-2 border-slate-700 rounded-md shadow-xl flex items-center relative cursor-grab active:cursor-grabbing overflow-hidden"
                  >
                     {/* Tape details */}
                     <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900 border-r border-slate-700 flex flex-col justify-around py-2 items-center opacity-50">
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-slate-800" /></div>
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-slate-800" /></div>
                     </div>
                     <div className="ml-12 w-48 h-12 bg-white rounded-sm p-1 border-t-8 border-red-500 flex items-center justify-center rotate-[-1deg]">
                        <span className="font-marker text-slate-900 text-lg handwriting tracking-wide">
                           {tape.label}
                        </span>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         {/* The VCR Deck */}
         <div className="w-full h-32 mt-auto relative z-10 flex flex-col items-center">
            <div 
               ref={vcrRef}
               className="w-full max-w-sm h-full bg-black border-t-4 border-slate-700 rounded-t-xl flex flex-col p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
               {/* VCR Slot */}
               <div className={`w-3/4 h-6 mx-auto bg-slate-900 rounded-sm border border-slate-800 shadow-inner flex items-center justify-center transition-colors ${activeTape ? 'bg-green-900/20 shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]' : ''}`}>
                  <div className="w-full h-1 bg-black opacity-50" />
               </div>
               
               {/* VCR Display & Buttons */}
               <div className="flex justify-between items-end mt-auto px-4">
                  <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-green-500 text-[10px] font-mono shadow-[inset_0_0_5px_rgba(0,0,0,1)]">
                     {activeTape ? (isPlaying ? "PLAY" : "LOAD") : "12:00"}
                  </div>
                  
                  <div className="flex gap-2">
                     <button className="p-2 bg-slate-800 rounded-sm hover:bg-slate-700 active:bg-slate-900"><Rewind size={14} className="text-slate-400" /></button>
                     <button className="p-2 bg-slate-800 rounded-sm hover:bg-slate-700 active:bg-slate-900"><Play size={14} className="text-slate-400" /></button>
                     <button className="p-2 bg-slate-800 rounded-sm hover:bg-slate-700 active:bg-slate-900"><FastForward size={14} className="text-slate-400" /></button>
                     <button onClick={ejectTape} disabled={!activeTape} className="p-2 bg-slate-800 rounded-sm hover:bg-slate-700 active:bg-slate-900"><Square size={14} className="text-red-500" /></button>
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* Fullscreen Video / Static Overlay */}
      <AnimatePresence>
         {(activeTape || showStatic) && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 bg-black flex flex-col"
            >
               {showStatic ? (
                  // Static effect
                  <div 
                     className="w-full h-full opacity-50 mix-blend-screen"
                     style={{ filter: 'url(#tv-static)' }}
                  />
               ) : (
                  <>
                     {/* Video Output */}
                     <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                        {activeTape && (
                           <video 
                              ref={videoRef}
                              src={activeTape.videoSrc}
                              className="w-full h-full object-cover"
                              playsInline
                              loop
                              style={{ 
                                 filter: 'url(#vhs-glitch) sepia(0.3) saturate(1.5) contrast(1.2)', 
                                 mixBlendMode: 'screen' 
                              }}
                           />
                        )}
                        
                        {/* CRT Scanline Overlay */}
                        <div 
                           className="absolute inset-0 pointer-events-none opacity-20"
                           style={{ 
                              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                              backgroundSize: '100% 2px, 3px 100%' 
                           }}
                        />

                        {/* OSD (On Screen Display) */}
                        <div className="absolute top-8 left-8 text-green-500 font-mono text-xl uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,255,0,0.8)] opacity-80">
                           PLAY ► <br/>
                           <span className="text-sm mt-2 block">{activeTape?.label}</span>
                        </div>
                     </div>
                     
                     <div className="w-full h-24 bg-black p-4 flex items-center justify-center border-t-2 border-slate-800">
                        <button 
                           onClick={ejectTape}
                           className="px-6 py-2 bg-slate-900 border border-slate-700 rounded text-red-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-lg"
                        >
                           <Square size={14} fill="currentColor" /> Eject
                        </button>
                     </div>
                  </>
               )}
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
