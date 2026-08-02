"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

export function TrustFall({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"waiting" | "falling" | "caught" | "shattered">("waiting");
  
  // Randomize the catch button position on the right side for the simulator
  const [catchPos, setCatchPos] = useState({ top: "50%", left: "50%" });

  const fallControls = useAnimation();

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"];

  const handleFall = async () => {
     setPhase("falling");
     setCatchPos({
        top: `${Math.floor(Math.random() * 60 + 20)}%`, // 20% to 80%
        left: `${Math.floor(Math.random() * 60 + 20)}%`
     });
     
     await fallControls.start({
        y: "400px",
        rotate: 180,
        transition: { duration: 1.5, ease: "easeIn" }
     });

     // If await finishes and we're still falling, it means it hit the ground
     setPhase(prev => {
        if (prev === "falling") return "shattered";
        return prev;
     });
  };

  const handleCatch = () => {
     if (phase !== "falling") return;
     fallControls.stop(); // Stop the animation mid-air
     setPhase("caught");
     
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 2000);
  };

  const handleRetry = () => {
     setPhase("waiting");
     fallControls.set({ y: 0, rotate: 0 });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex font-sans select-none items-center justify-center bg-zinc-950 text-white"
    >
      <div 
         className="absolute inset-0 opacity-40 pointer-events-none" 
         style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} 
      />
      
      {/* Simulation Split Screen Layout */}
      <div className="absolute inset-0 flex">
         {/* Left Side: Initiator */}
         <div className="flex-1 border-r border-white/10 flex flex-col items-center justify-center p-8 relative">
            <span className="absolute top-8 text-zinc-600 font-black uppercase tracking-widest text-sm">User 1 (You)</span>
            
            <AnimatePresence>
               {phase === "waiting" && (
                  <motion.button
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     onClick={handleFall}
                     className="w-32 h-32 rounded-full font-black text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
                     style={{ backgroundColor: primaryColor }}
                  >
                     FALL
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
         
         {/* Center: The Object */}
         <div className="w-32 flex justify-center relative">
            <motion.div
               animate={fallControls}
               initial={{ y: 0, rotate: 0 }}
               className="absolute top-10"
            >
               {phase !== "shattered" ? (
                  <div className="w-16 h-24 bg-white rounded-t-xl rounded-b-3xl shadow-[0_0_20px_rgba(255,255,255,0.5)] flex flex-col justify-end overflow-hidden border-2 border-zinc-200">
                     <div className="w-full h-1/2 opacity-20" style={{ backgroundColor: primaryColor }} />
                  </div>
               ) : (
                  <div className="w-24 h-24 relative">
                     {/* Shatter pieces */}
                     {[...Array(6)].map((_, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 1, x: 0, y: 0 }}
                           animate={{ 
                              opacity: 0, 
                              x: (Math.random() - 0.5) * 100, 
                              y: (Math.random() - 0.5) * 100,
                              rotate: Math.random() * 360
                           }}
                           transition={{ duration: 0.5 }}
                           className="absolute top-1/2 left-1/2 w-8 h-8 bg-white"
                           style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                        />
                     ))}
                  </div>
               )}
               
            </motion.div>
            
            {/* Ground Line */}
            <div className="absolute top-[490px] w-full h-1 bg-red-500/50" />
         </div>

         {/* Right Side: Catcher */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <span className="absolute top-8 text-zinc-600 font-black uppercase tracking-widest text-sm">User 2 (Partner)</span>
            
            {phase === "falling" && (
               <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleCatch}
                  className="absolute w-32 h-32 rounded-full font-black text-2xl bg-white text-zinc-900 shadow-[0_0_30px_white] transition-transform hover:scale-105 active:scale-95"
                  style={{ top: catchPos.top, left: catchPos.left, transform: "translate(-50%, -50%)" }}
               >
                  CATCH!
               </motion.button>
            )}

            <AnimatePresence>
               {phase === "shattered" && (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center gap-6"
                  >
                     <p className="text-3xl font-black text-red-500 uppercase tracking-widest">TOO LATE</p>
                     <button
                        onClick={handleRetry}
                        className="px-8 py-3 rounded-full font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                     >
                        TRY AGAIN
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <AnimatePresence>
         {phase === "caught" && (
            <motion.div
               key="caught"
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className="absolute z-20 w-full max-w-md bg-zinc-900 border border-white/20 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center"
            >
               <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-6xl mb-6"
               >
                  🤝
               </motion.div>
               <h1 className="text-3xl font-black uppercase text-white mb-2">
                 Trust Earned
               </h1>
               <p className="text-zinc-400 font-bold mb-8">
                  You caught them when they fell.
               </p>
               
               <div className="w-full bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    {config.title}
                  </h2>
                  <p className="text-zinc-300">
                    {config.body}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
