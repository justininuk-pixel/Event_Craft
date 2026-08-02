"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function MutualSecretAdmirer({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"asking" | "waiting" | "celebration">("asking");
  
  const confetti = Array.from({ length: 40 }).map(() => ({
    isPrimary: Math.random() > 0.5,
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 800,
    scale: Math.random() * 2 + 0.5,
  }));

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  const handleYes = () => {
     setPhase("waiting");
     
     // Simulate the remote partner also pressing YES exactly 3 seconds later
     setTimeout(() => {
        setPhase("celebration");
        setTimeout(() => {
           if (onComplete) onComplete();
        }, 3000);
     }, 3000);
  };

  const handleNo = () => {
     alert("Your secret is safe. We won't tell them.");
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      <AnimatePresence mode="wait">
         {phase === "asking" && (
            <motion.div
               key="asking"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 z-30"
            >
               <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-8xl mb-12 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]"
               >
                  💌
               </motion.div>
               
               <h1 className="text-3xl md:text-5xl font-black mb-16 text-center uppercase tracking-tighter leading-tight">
                  Do you have feelings for them?
               </h1>
               
               <div className="flex flex-col gap-6 w-full max-w-sm">
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={handleYes}
                     className="w-full py-6 rounded-full font-black text-3xl text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] transition-all"
                     style={{ backgroundColor: primaryColor }}
                  >
                     YES
                  </motion.button>
                  
                  <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleNo}
                     className="w-full py-4 rounded-full font-bold text-xl text-white/50 border-2 border-white/20 transition-all hover:bg-white/5 hover:text-white"
                  >
                     NOT REALLY
                  </motion.button>
               </div>
               
               <p className="mt-12 text-sm font-bold uppercase tracking-widest text-zinc-500 text-center max-w-xs">
                  They will <span className="text-zinc-300">never know</span> unless they also press Yes on their screen.
               </p>
            </motion.div>
         )}

         {phase === "waiting" && (
            <motion.div
               key="waiting"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-zinc-950"
            >
               {/* Beating Heart Lock */}
               <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                  className="text-9xl mb-12 relative"
               >
                  ❤️
                  <span className="absolute inset-0 flex items-center justify-center text-4xl mt-2 drop-shadow-xl">
                     🔒
                  </span>
               </motion.div>
               
               <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-4">
                  Secret Locked
               </h2>
               <p className="text-zinc-500 text-center max-w-xs font-bold uppercase tracking-widest">
                  Waiting to see if they feel the same way...
               </p>
               
               {/* Simulating Network... */}
               <div className="mt-12 flex gap-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-3 h-3 rounded-full bg-white/30" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }} className="w-3 h-3 rounded-full bg-white/30" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.6 }} className="w-3 h-3 rounded-full bg-white/30" />
               </div>
            </motion.div>
         )}

         {phase === "celebration" && (
            <motion.div
               key="celebration"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 overflow-y-auto pb-32 pt-16 px-8 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
            >
               {/* Confetti Explosion Background */}
               <div className="absolute inset-0 pointer-events-none opacity-50">
                  {confetti.map((c, i) => (
                     <motion.div
                        key={i}
                        className="absolute w-4 h-4 rounded-full"
                        style={{ 
                           backgroundColor: c.isPrimary ? primaryColor : "#ffffff",
                           left: "50%",
                           top: "50%"
                        }}
                        initial={{ x: 0, y: 0, scale: 0 }}
                        animate={{ 
                           x: c.x,
                           y: c.y,
                           scale: c.scale,
                           opacity: [1, 0]
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                     />
                  ))}
               </div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.5, y: 50 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ type: "spring", bounce: 0.5 }}
                 className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl flex flex-col items-center shadow-2xl border-4 text-center z-10"
                 style={{ borderColor: primaryColor }}
               >
                 <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-6xl mb-6"
                 >
                    💘
                 </motion.div>
                 
                 <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">
                   IT'S MUTUAL!
                 </h1>
                 
                 <div className="w-full h-px bg-zinc-800 my-6" />

                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                   {config.title}
                 </h2>
                 <p className="text-base font-body text-zinc-300 whitespace-pre-wrap max-w-sm font-bold">
                   {config.body}
                 </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
