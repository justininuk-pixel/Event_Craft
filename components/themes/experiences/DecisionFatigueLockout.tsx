"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, HelpCircle } from "lucide-react";

const responses = [
  "Yes, absolutely.", "No, bad idea.", "Wait until tomorrow.", 
  "Trust your gut.", "Ask a friend.", "Flip a coin.", "Go for it."
];

export function DecisionFatigueLockout({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#9333ea"; // purple-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#faf5ff"]; // fuchsia-50

  const [clicks, setClicks] = useState<number[]>([]);
  const [answer, setAnswer] = useState<string>("Ask me anything.");
  const [locked, setLocked] = useState(false);

  const handleAsk = () => {
     if (locked) return;

     const now = Date.now();
     const newClicks = [...clicks, now].filter(t => now - t < 3600000); // within 1 hour
     setClicks(newClicks);

     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);

     if (newClicks.length > 5) {
        setLocked(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 200]);
        if (onComplete) setTimeout(onComplete, 6000);
     } else {
        const rnd = responses[Math.floor(Math.random() * responses.length)];
        setAnswer(rnd);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-fuchsia-50 text-fuchsia-950 justify-center items-center p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <AnimatePresence mode="wait">
         {!locked ? (
            <motion.div 
               key="active"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ filter: "blur(10px)", scale: 0.9, opacity: 0.5 }}
               className="flex flex-col items-center justify-center w-full z-10"
            >
               <div className="mb-12 relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-800 shadow-[0_20px_50px_rgba(147,51,234,0.3)] flex items-center justify-center p-6 text-center border-4 border-fuchsia-200">
                     <span className="text-white font-bold text-lg drop-shadow-md">{answer}</span>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/10 rounded-[100%] blur-sm" />
               </div>

               <button 
                  onClick={handleAsk}
                  className="px-8 py-4 bg-white rounded-full shadow-lg font-bold text-fuchsia-900 border border-fuchsia-100 uppercase tracking-widest text-sm hover:bg-fuchsia-50 active:scale-95 transition-all"
               >
                  Consult Oracle
               </button>

               <div className="mt-8 flex gap-2">
                  {/* Indicators for how many questions asked */}
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${i < clicks.length ? 'bg-purple-600' : 'bg-fuchsia-200'}`}
                     />
                  ))}
               </div>
            </motion.div>
         ) : (
            <motion.div 
               key="locked"
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center text-center z-20 absolute inset-0 bg-fuchsia-950/90 backdrop-blur-xl text-white p-8"
            >
               <Lock size={48} className="text-fuchsia-400 mb-6" />
               <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Decision Fatigue</h2>
               <p className="text-fuchsia-200 text-sm max-w-xs leading-relaxed mb-8">
                  You have consulted the oracle too many times recently. Software cannot solve this. Trust your gut.
               </p>
               <div className="text-[10px] font-mono text-fuchsia-400 bg-black/30 px-4 py-2 rounded">
                  LOCKED FOR 1 HOUR
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
