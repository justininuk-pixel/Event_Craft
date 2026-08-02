"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, ShieldAlert, Check } from "lucide-react";

export function WorryShredder({
  config,
  palette,
  onComplete
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#64748b"; // slate-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [worry, setWorry] = useState("");
  const [isShredding, setIsShredding] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  const slices = 20;
  const sliceAnimations = Array.from({ length: slices }).map(() => ({
      rotateZ: Math.random() * 20 - 10,
      x: Math.random() * 20 - 10,
      delay: 0.5 + Math.random() * 0.5,
    }));

  const handleShred = () => {
     if (!worry.trim()) return;
     setIsShredding(true);
     
     // Simulate destruction time
     setTimeout(() => {
        setIsDestroyed(true);
        if (onComplete) {
           setTimeout(onComplete, 4000); // 4 seconds after destruction
        }
     }, 2000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center opacity-5">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            <Wind size={600} />
         </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto">
         
         <AnimatePresence mode="wait">
            {!isShredding && !isDestroyed ? (
               <motion.div 
                  key="input"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
               >
                  <div className="w-16 h-16 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                     <ShieldAlert size={32} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 text-center text-slate-800">
                     {config.title || "The Worry Shredder"}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mb-8 text-center max-w-[250px]">
                     Write down something that&apos;s causing you anxiety right now.
                  </p>

                  <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-6">
                     <textarea
                        value={worry}
                        onChange={(e) => setWorry(e.target.value)}
                        placeholder="I'm worried about..."
                        className="w-full h-32 bg-transparent border-none resize-none p-4 outline-none font-medium text-slate-700 placeholder-slate-400"
                     />
                  </div>

                  <button
                     onClick={handleShred}
                     disabled={!worry.trim()}
                     className={`w-full py-4 rounded-2xl font-black text-white text-lg uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 transition-all ${
                        !worry.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                     }`}
                     style={{ backgroundColor: primaryColor }}
                  >
                     <Wind size={20} /> Let It Go
                  </button>
               </motion.div>
            ) : isShredding && !isDestroyed ? (
               <motion.div 
                  key="shredding"
                  initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center relative"
               >
                  {/* The visual shredder slot */}
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-900 rounded-full z-20 shadow-inner flex items-center justify-center border-y border-slate-700">
                     <div className="w-1/2 h-1 bg-red-500 rounded-full animate-pulse" />
                  </div>

                  {/* The paper being fed down */}
                  <motion.div 
                     className="w-full bg-white rounded-t-2xl shadow-xl border-t border-x border-slate-200 p-6 relative overflow-hidden"
                     style={{ height: 200, originY: 1 }}
                     animate={{ y: 150 }} // move down into slot
                     transition={{ duration: 1.5, ease: "linear" }}
                  >
                     <p className="font-medium text-slate-700 whitespace-pre-wrap">{worry}</p>
                  </motion.div>

                  {/* The shredded slices coming out bottom */}
                  <div className="w-full absolute top-[calc(50%+10px)] left-0 right-0 h-[200px] flex overflow-hidden z-10">
                     {sliceAnimations.map((anim, i) => (
                        <motion.div 
                           key={i}
                           className="flex-1 bg-white border-r border-slate-100"
                           initial={{ y: -200 }}
                           animate={{ y: 200, rotateZ: anim.rotateZ, x: anim.x }}
                           transition={{ 
                              duration: 1, 
                              delay: anim.delay,
                              ease: "easeIn"
                           }}
                        />
                     ))}
                  </div>

               </motion.div>
            ) : (
               <motion.div 
                  key="calm"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  
                  {/* Breathing Circle */}
                  <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                     <motion.div 
                        className="absolute inset-0 rounded-full opacity-20"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                     />
                     <motion.div 
                        className="absolute inset-4 rounded-full opacity-40"
                        style={{ backgroundColor: primaryColor }}
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                     />
                     <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center relative z-10 text-emerald-500">
                        <Check size={32} />
                     </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-4">
                     It&apos;s gone.
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-[250px]">
                     {config.body || "Take a deep breath. You are safe. That thought no longer has power over you."}
                  </p>

                  <button
                     onClick={() => { setWorry(""); setIsShredding(false); setIsDestroyed(false); }}
                     className="mt-12 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                     Write another
                  </button>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
