"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalHighFive({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"waiting" | "success">("waiting");
  const [localActive, setLocalActive] = useState(false);
  const [remoteActive, setRemoteActive] = useState(false);
  
  const localTimerRef = useRef<NodeJS.Timeout | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#06b6d4";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  // Simulate remote "ghost" taps for the editor preview
  useEffect(() => {
     if (phase !== "waiting") return;
     
     const scheduleNextGhostTap = () => {
        const delay = Math.random() * 4000 + 2000; // 2 to 6 seconds
        setTimeout(() => {
           if (phase !== "waiting") return;
           setRemoteActive(true);
           
           // A remote tap lasts for 1 second (1000ms window)
           setTimeout(() => {
              setRemoteActive(false);
              scheduleNextGhostTap();
           }, 1000);
        }, delay);
     };
     
     scheduleNextGhostTap();
     
     return () => {
        // Cleanup not strictly necessary for simple timeouts in this specific editor context, 
        // but good practice. We rely on phase check to abort.
     };
  }, [phase]);

  // Check for overlap whenever either state changes
  useEffect(() => {
     if (phase === "waiting" && localActive && remoteActive) {
        handleSuccess();
     }
  }, [localActive, remoteActive, phase]);

  const handleTap = () => {
     if (phase !== "waiting") return;
     
     if (localTimerRef.current) clearTimeout(localTimerRef.current);
     setLocalActive(true);
     
     // Local tap is active for 1 second
     localTimerRef.current = setTimeout(() => {
        setLocalActive(false);
     }, 1000);
  };

  const handleSuccess = () => {
     setPhase("success");
     if (localTimerRef.current) clearTimeout(localTimerRef.current);
     
     setTimeout(() => {
        if (onComplete) onComplete();
     }, 3000);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center bg-zinc-950"
    >
      <div 
         className="absolute inset-0 transition-opacity duration-1000"
         style={{ 
            background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})`,
            opacity: phase === "success" ? 0 : 0.6
         }} 
      />

      {/* Remote Ghost Tap Indicator Background Flash */}
      <AnimatePresence>
         {phase === "waiting" && remoteActive && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.2 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="absolute inset-0 bg-white pointer-events-none"
            />
         )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
         {phase === "waiting" && (
            <motion.div
               key="waiting"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.5, filter: "brightness(2)" }}
               className="relative z-10 w-full h-full flex flex-col items-center justify-center"
               onPointerDown={handleTap}
            >
               <div className="absolute top-12 left-0 w-full text-center px-8 pointer-events-none">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">
                     The Global High Five
                  </h1>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">
                     Tap the screen. If someone else in the world taps within the exact same second, you connect.
                  </p>
               </div>
               
               {/* Massive Hand Outline */}
               <motion.div
                  animate={{ 
                     scale: localActive ? 0.9 : (remoteActive ? 1.05 : 1),
                     opacity: localActive ? 1 : 0.5,
                  }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-[200px] md:text-[300px] cursor-pointer drop-shadow-2xl flex items-center justify-center relative"
               >
                  ✋
                  
                  {/* Glowing aura when active */}
                  {localActive && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.5, scale: 1.2 }}
                        className="absolute inset-0 rounded-full blur-3xl -z-10"
                        style={{ backgroundColor: primaryColor }}
                     />
                  )}
               </motion.div>
               
               <div className="absolute bottom-12 left-0 w-full text-center pointer-events-none">
                  <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: localActive ? primaryColor : "rgba(255,255,255,0.3)" }}>
                     {localActive ? "SEARCHING FOR CONNECTION..." : "WAITING FOR YOUR TAP"}
                  </h2>
               </div>
            </motion.div>
         )}

         {phase === "success" && (
            <motion.div
               key="success"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 text-black overflow-hidden"
            >
               {/* Massive Flash */}
               <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-white z-0"
               />
               
               <motion.div 
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", bounce: 0.6, duration: 1 }}
                 className="relative z-10 text-center flex flex-col items-center"
               >
                 <div className="text-[150px] mb-8 drop-shadow-xl relative">
                    🙏
                    <motion.div
                       animate={{ scale: [1, 2], opacity: [1, 0] }}
                       transition={{ duration: 1, ease: "easeOut" }}
                       className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl -z-10"
                    />
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-black">
                   CONNECTION!
                 </h1>
                 
                 <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest text-zinc-600 mb-8 max-w-lg">
                   You high-fived a stranger across the globe.
                 </h2>

                 {config.title && (
                    <div className="mt-8 p-8 border-4 border-black rounded-3xl bg-zinc-100 shadow-2xl max-w-md">
                       <h3 className="text-2xl font-black uppercase mb-2">{config.title}</h3>
                       <p className="font-bold text-zinc-700">{config.body}</p>
                    </div>
                 )}
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
