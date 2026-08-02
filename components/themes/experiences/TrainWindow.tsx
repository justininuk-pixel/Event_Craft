"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, BookOpen } from "lucide-react";

export function TrainWindow({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [journalOpen, setJournalOpen] = useState(false);
  const [capturedSnaps, setCapturedSnaps] = useState<number[]>([]);
  const [flash, setFlash] = useState(false);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#64748b";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  // Mock Landmarks that appear at specific horizontal positions
  const landmarks = [
    { id: 1, pos: 15, name: "The Old Clocktower", story: "It stopped working the day you left. Some say it's just rust, but I think it's waiting." },
    { id: 2, pos: 45, name: "Silvertide Bridge", story: "Do you remember the bridge? We stood here for hours watching the cars go by underneath." },
    { id: 3, pos: 75, name: "The Ruined Keep", story: "I always wondered what was inside. Now, looking at it blur past, I realize I prefer the mystery." },
  ];

  // We'll use a continuous background loop, but the landmarks are positioned relative to a single cycle.
  // The user taps the screen to try and catch a landmark.
  const windowRef = useRef<HTMLDivElement>(null);
  
  // Track the current offset of the train scenery (0 to 100%)
  const [sceneryOffset, setSceneryOffset] = useState(0);

  useEffect(() => {
    // Train animation loop
    const speed = 0.5; // percentage per frame (fast!)
    
    const interval = setInterval(() => {
       setSceneryOffset(prev => {
          let next = prev + speed;
          if (next >= 100) next = 0;
          return next;
       });
    }, 16); // roughly 60fps

    return () => clearInterval(interval);
  }, []);

  const handleSnap = () => {
    if (journalOpen) return;

    // Trigger flash
    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    // Check if we hit any landmark (tolerance of ±5% viewport width)
    const tolerance = 5;
    
    // Scenery offset moves right-to-left, so scenery is at -sceneryOffset
    // A landmark at pos `P` is currently at `P - sceneryOffset` (wrapping at 100)
    
    landmarks.forEach(lm => {
       if (capturedSnaps.includes(lm.id)) return; // already caught

       // Calculate current visual position on screen (0-100)
       let currentPos = lm.pos - sceneryOffset;
       if (currentPos < 0) currentPos += 100;
       
       // If it's near the center of the window (50%)
       if (Math.abs(currentPos - 50) < tolerance) {
          setCapturedSnaps(prev => [...prev, lm.id]);
       }
    });
  };

  // Completion check
  useEffect(() => {
     if (capturedSnaps.length === landmarks.length && onComplete) {
        onComplete();
     }
  }, [capturedSnaps.length, landmarks.length, onComplete]);

  return (
    <div className="w-full h-full bg-[#111] relative flex items-center justify-center font-sans select-none overflow-hidden text-zinc-200">
      
      {/* Train Interior Frame */}
      <div className="absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] border-[24px] border-[#222] rounded-3xl" />
      
      <div className="absolute top-4 w-full flex justify-between px-10 z-40">
         <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase">Express Line</span>
         <span className="text-zinc-500 font-bold tracking-widest text-xs uppercase text-right">
            {capturedSnaps.length}/{landmarks.length} Snaps
         </span>
      </div>

      {/* The Train Window (where the action happens) */}
      <div 
         ref={windowRef}
         className="relative w-full h-[60%] sm:h-[70%] max-w-4xl bg-sky-900 overflow-hidden border-4 border-black cursor-crosshair z-10 mx-8"
         onClick={handleSnap}
      >
         {/* Moving Scenery Layer (Distant) */}
         <div 
            className="absolute top-0 bottom-0 w-[200%] flex opacity-50"
            style={{ transform: `translateX(-${sceneryOffset/2}%)` }}
         >
            <div className="w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] bg-cover" />
            <div className="w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] bg-cover" />
         </div>

         {/* Moving Scenery Layer (Foreground & Landmarks) */}
         <div 
            className="absolute top-0 bottom-0 w-[200%] flex"
            style={{ transform: `translateX(-${sceneryOffset}%)` }}
         >
            {/* Cycle 1 */}
            <div className="w-1/2 h-full relative">
               {/* Ground */}
               <div className="absolute bottom-0 w-full h-1/3 bg-[#0d1321]" />
               
               {/* Landmarks */}
               {landmarks.map(lm => {
                  const isCaught = capturedSnaps.includes(lm.id);
                  return (
                     <div 
                        key={lm.id}
                        className="absolute bottom-1/3 w-16 h-32 flex flex-col items-center justify-end"
                        style={{ left: `${lm.pos}%`, transform: 'translateX(-50%)' }}
                     >
                        <div 
                           className={`w-full h-full bg-[#1d2d44] rounded-t-lg transition-opacity duration-300 ${isCaught ? 'opacity-30' : 'opacity-100'}`} 
                        />
                        {/* Target Reticle visual */}
                        {!isCaught && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-red-500/50 rounded-full" />
                        )}
                     </div>
                  );
               })}
            </div>
            {/* Cycle 2 (for seamless looping) */}
            <div className="w-1/2 h-full relative">
               {/* Ground */}
               <div className="absolute bottom-0 w-full h-1/3 bg-[#0d1321]" />
               {/* Landmarks duplicate */}
               {landmarks.map(lm => {
                  const isCaught = capturedSnaps.includes(lm.id);
                  return (
                     <div 
                        key={lm.id + "_copy"}
                        className="absolute bottom-1/3 w-16 h-32 flex flex-col items-center justify-end"
                        style={{ left: `${lm.pos}%`, transform: 'translateX(-50%)' }}
                     >
                        <div 
                           className={`w-full h-full bg-[#1d2d44] rounded-t-lg transition-opacity duration-300 ${isCaught ? 'opacity-30' : 'opacity-100'}`} 
                        />
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Center Aiming Guide */}
         <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10 pointer-events-none" />

         {/* Camera Flash */}
         <AnimatePresence>
            {flash && (
               <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white z-50 pointer-events-none" 
               />
            )}
         </AnimatePresence>

         {/* Instruction Overlay */}
         <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-50 text-[10px] uppercase font-bold tracking-widest text-white">
            Tap to snap a photo when centered
         </div>
      </div>

      {/* Action Buttons (Bottom Bar) */}
      <div className="absolute bottom-8 w-full flex justify-center z-40">
         <button
            onClick={() => setJournalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-full shadow-lg hover:bg-zinc-700 transition-colors uppercase text-xs font-bold tracking-widest"
         >
            <BookOpen size={16} />
            Open Journal
            {capturedSnaps.length > 0 && (
               <span className="ml-2 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white text-[10px]">
                  {capturedSnaps.length}
               </span>
            )}
         </button>
      </div>

      {/* Journal Modal */}
      <AnimatePresence>
         {journalOpen && (
            <motion.div 
               className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <motion.div 
                  className="bg-[#f5f5f4] w-full max-w-2xl h-[80%] rounded-lg shadow-2xl flex flex-col overflow-hidden text-zinc-900"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
               >
                  <div className="p-4 border-b border-zinc-300 flex justify-between items-center bg-[#e5e5e5]">
                     <h2 className="font-serif font-bold text-lg">Travel Journal</h2>
                     <button onClick={() => setJournalOpen(false)} className="text-zinc-500 hover:text-black uppercase text-xs font-bold px-4 py-2">
                        Close
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-12">
                     {capturedSnaps.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
                           <Camera size={48} className="mb-4" />
                           <p className="font-serif italic text-lg">No photos taken yet.</p>
                        </div>
                     ) : (
                        <div className="space-y-12">
                           {landmarks.filter(lm => capturedSnaps.includes(lm.id)).map(lm => (
                              <div key={lm.id} className="flex flex-col md:flex-row gap-6 items-start border-b border-zinc-200 pb-12">
                                 {/* Photo placeholder */}
                                 <div className="w-full md:w-1/2 aspect-video bg-[#1d2d44] p-2 bg-white shadow-md flex items-center justify-center rounded-sm rotate-1 border border-zinc-300">
                                    <div className="w-full h-full bg-[#1d2d44]" />
                                 </div>
                                 <div className="flex-1 font-serif text-lg leading-relaxed pt-2">
                                    <h3 className="font-bold text-xl mb-4 font-sans uppercase tracking-widest text-xs" style={{ color: primaryColor }}>
                                       {lm.name}
                                    </h3>
                                    <p className="italic text-zinc-700">
                                       {lm.story}
                                    </p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Bypass */}
      {mode === "editor-preview" && capturedSnaps.length < landmarks.length && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setCapturedSnaps(landmarks.map(lm => lm.id));
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Snap All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
