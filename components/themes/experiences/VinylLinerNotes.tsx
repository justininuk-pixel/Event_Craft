"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Track = {
   id: string;
   number: string;
   title: string;
   duration: string;
   notes: string;
};

const TRACKS: Track[] = [
   { id: "t1", number: "01", title: "The Beginning", duration: "3:42", notes: "Recorded in the basement. The acoustics were terrible, but it captured the raw energy we needed. Notice the slight tape hiss." },
   { id: "t2", number: "02", title: "Middle of Nowhere", duration: "4:15", notes: "A late night jam that turned into something more. The synth line was an accident. We kept it." },
   { id: "t3", number: "03", title: "Static Interference", duration: "2:50", notes: "Lyrically inspired by old radio broadcasts. We ran the vocals through a broken amplifier we found in an alley." },
   { id: "t4", number: "04", title: "The Revelation", duration: "5:11", notes: "The centerpiece. This is what it all builds up to. Everything else was just prelude." },
];

export function VinylLinerNotes({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // Red 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // Off-white cream

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [readTracks, setReadTracks] = useState<string[]>([]);

  const handleTrackClick = (id: string) => {
     if (gameState !== "playing") return;
     
     if (expandedTrackId === id) {
        setExpandedTrackId(null);
     } else {
        setExpandedTrackId(id);
        if (!readTracks.includes(id)) {
           setReadTracks(prev => [...prev, id]);
        }
     }
  };

  useEffect(() => {
     if (gameState === "playing" && readTracks.length === TRACKS.length) {
        // All tracks have been read. Wait a moment, then unlock payload.
        const timer = setTimeout(() => {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }, 1500);
        return () => clearTimeout(timer);
     }
  }, [readTracks, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container - The "Vinyl Sleeve" */}
      <div 
         className={`relative w-[320px] h-[480px] rounded shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
         style={{
            backgroundColor: bgColors[0],
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard.png")',
            border: "1px solid rgba(0,0,0,0.1)"
         }}
      >
         
         {/* Top Header Section */}
         <div className="p-6 pb-2 border-b-2 border-black">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-black mb-1">
               Liner Notes
            </h2>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/60">
               <span>Stereo LP</span>
               <span>Side A</span>
            </div>
         </div>

         {/* Tracklist Accordion */}
         <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            
            <div className="text-[9px] uppercase tracking-widest font-bold mb-4 opacity-40">
               Select track for commentary
            </div>

            <div className="flex flex-col border-t border-black">
               {TRACKS.map((track) => {
                  const isExpanded = expandedTrackId === track.id;
                  const isRead = readTracks.includes(track.id);

                  return (
                     <div key={track.id} className="border-b border-black">
                        
                        {/* Track Header (Clickable) */}
                        <button 
                           onClick={() => handleTrackClick(track.id)}
                           className="w-full py-4 flex items-center justify-between group transition-colors hover:bg-black/5"
                        >
                           <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold w-4 text-left" style={{ color: isRead ? primaryColor : "black" }}>
                                 {track.number}.
                              </span>
                              <span className={`font-bold text-sm tracking-tight text-black transition-all ${isExpanded ? "scale-105 origin-left" : ""}`}>
                                 {track.title}
                              </span>
                           </div>
                           <span className="font-mono text-xs opacity-50">
                              {track.duration}
                           </span>
                        </button>

                        {/* Expandable Liner Notes */}
                        <AnimatePresence initial={false}>
                           {isExpanded && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                 className="overflow-hidden"
                              >
                                 <div className="pb-4 pl-7 pr-2">
                                    <div className="p-3 bg-black/5 border-l-2 text-xs text-black/80 font-serif italic leading-relaxed" style={{ borderColor: primaryColor }}>
                                       "{track.notes}"
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  );
               })}
            </div>

            {/* Bottom Graphic Element */}
            <div className="mt-8 flex justify-center opacity-20">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1">
                  <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
               </svg>
            </div>

         </div>

         {/* Ring Wear overlay */}
         <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03]"
              style={{
                 background: "radial-gradient(circle at center, transparent 30%, black 70%)",
                 borderRadius: "100%"
              }}
         />

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(253, 251, 247, 0.9)" }} // Matches off-white
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-6">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <h2 className="uppercase tracking-tighter font-black mb-4 text-2xl text-black">
                     Side A
                  </h2>
                  <p className="text-xs text-black/60 mb-12 text-center px-8 leading-relaxed font-bold">
                     Read the liner notes for all tracks to flip the record and hear the payload.
                  </p>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-3 rounded uppercase tracking-widest text-[10px] font-black text-white active:scale-95 transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Drop the Needle
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               <motion.div 
                  className="p-10 md:p-14 max-w-2xl w-full text-center relative overflow-hidden rounded-full aspect-square flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: "#111" }} // The Vinyl Record itself
                  initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  {/* Grooves */}
                  <div className="absolute inset-4 rounded-full border border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/5" />
                  <div className="absolute inset-12 rounded-full border border-white/5" />
                  <div className="absolute inset-16 rounded-full border border-white/5" />
                  
                  {/* Record Label (The Payload) */}
                  <div 
                     className="relative z-10 rounded-full w-full max-w-[280px] aspect-square flex flex-col justify-center items-center p-6 text-center shadow-2xl"
                     style={{ backgroundColor: primaryColor }}
                  >
                     {/* Spindle Hole */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111] rounded-full" />
                     
                     <div className="font-sans uppercase tracking-widest mb-4 text-[8px] font-bold text-black/70 mt-8">Side B: Payload</div>
                     <h1 className="text-xl md:text-2xl font-black mb-4 leading-tight text-white uppercase tracking-tighter">
                        {config.title}
                     </h1>
                     <p className="text-[10px] leading-relaxed font-bold text-black/80 px-4">
                        {config.body}
                     </p>
                  </div>

                  {/* Spinning highlight reflection */}
                  <motion.div 
                     className="absolute inset-0 rounded-full pointer-events-none"
                     style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.1) 15%, transparent 30%, transparent 50%, rgba(255,255,255,0.1) 65%, transparent 80%)' }}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />

               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-black/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-black/50 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Reading
            </h2>
            <button 
               onClick={() => {
                  setReadTracks(TRACKS.map(t => t.id));
               }}
               className="w-full text-white font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Unlock All Notes
            </button>
         </div>
      )}
      
    </div>
  );
}
