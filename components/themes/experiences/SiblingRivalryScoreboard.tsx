"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Swords, X } from "lucide-react";

type RivalryEvent = {
  id: string;
  winner: "p1" | "p2" | "tie";
  title: string;
  detail: string;
};

const defaultEvents: RivalryEvent[] = [
  { id: "e1", winner: "p2", title: "Monopoly Incident", detail: "Flipped the board. Refused to pay rent on Boardwalk." },
  { id: "e2", winner: "p1", title: "Foot Race to the Car", detail: "Called shotgun first, cleanly." },
  { id: "e3", winner: "tie", title: "Who broke the lamp?", detail: "Neither confessed. Both grounded." },
  { id: "e4", winner: "p1", title: "Mario Kart", detail: "Blue shell on the final lap." },
];

export function SiblingRivalryScoreboard({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // red-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // gray-900
  
  const title = config.title || "The Eternal Scoreboard";
  const events: RivalryEvent[] = (config.experience as any)?.events || defaultEvents;
  
  const p1Name = (config.experience as any)?.p1Name || "Me";
  const p2Name = (config.experience as any)?.p2Name || "You";

  const [visibleEvents, setVisibleEvents] = useState<RivalryEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const p1Score = visibleEvents.filter(e => e.winner === "p1").length;
  const p2Score = visibleEvents.filter(e => e.winner === "p2").length;

  const revealNext = () => {
    if (currentIndex < events.length) {
      setVisibleEvents(prev => [...prev, events[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      
      if (currentIndex === events.length - 1 && onComplete) {
         setTimeout(onComplete, 3000);
      }
    }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-gray-900 cursor-pointer" 
      style={{ backgroundColor: bgColors[0] }}
      onClick={revealNext}
    >
      
      {/* Stadium Lights / Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="p-6 text-center z-10 relative">
         <Swords size={24} className="mx-auto text-gray-500 mb-2" />
         <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
         {currentIndex < events.length && <p className="text-xs text-gray-400 mt-2 animate-pulse">Tap to reveal history</p>}
      </div>

      {/* Big Scoreboard */}
      <div className="flex justify-center items-center gap-4 px-6 py-4 z-10 relative">
         <div className="flex flex-col items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{p1Name}</span>
            <div className="bg-black border-4 border-gray-800 w-24 h-32 rounded flex items-center justify-center shadow-inner relative overflow-hidden">
               <motion.span 
                 key={p1Score}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-6xl font-black text-red-500 font-sans"
                 style={{ color: primaryColor, textShadow: `0 0 20px ${primaryColor}` }}
               >
                 {p1Score}
               </motion.span>
               {/* Scanlines */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
            </div>
         </div>
         
         <div className="text-gray-600 text-4xl font-black">:</div>
         
         <div className="flex flex-col items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{p2Name}</span>
            <div className="bg-black border-4 border-gray-800 w-24 h-32 rounded flex items-center justify-center shadow-inner relative overflow-hidden">
               <motion.span 
                 key={p2Score}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-6xl font-black text-blue-500 font-sans"
                 style={{ textShadow: `0 0 20px #3b82f6` }}
               >
                 {p2Score}
               </motion.span>
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
            </div>
         </div>
      </div>

      {/* History Log */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 mt-4 space-y-3 z-10 relative">
        <AnimatePresence>
           {[...visibleEvents].reverse().map((ev, i) => (
             <motion.div
               key={ev.id}
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-gray-800/80 p-4 rounded border-l-4 shadow-md backdrop-blur-sm"
               style={{ 
                  borderLeftColor: ev.winner === 'p1' ? primaryColor : (ev.winner === 'p2' ? '#3b82f6' : '#6b7280') 
               }}
             >
                <div className="flex justify-between items-start mb-1">
                   <h3 className="text-white font-bold text-sm font-sans">{ev.title}</h3>
                   <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      ev.winner === 'p1' ? 'bg-red-500/20 text-red-400' :
                      ev.winner === 'p2' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                   }`}>
                      {ev.winner === 'p1' ? p1Name : (ev.winner === 'p2' ? p2Name : 'Draw')}
                   </span>
                </div>
                <p className="text-gray-400 text-xs">{ev.detail}</p>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>

      {/* Trophy Modal at End */}
      <AnimatePresence>
        {currentIndex === events.length && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-none"
           >
              <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl">
                 <Trophy size={48} className={`mx-auto mb-4 ${p1Score > p2Score ? 'text-red-500' : p2Score > p1Score ? 'text-blue-500' : 'text-gray-400'}`} />
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                    {p1Score > p2Score ? `${p1Name} Wins` : p2Score > p1Score ? `${p2Name} Wins` : "It's a Tie"}
                 </h3>
                 <p className="text-gray-400 text-sm italic">
                    (But we both know the score is never really settled.)
                 </p>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
