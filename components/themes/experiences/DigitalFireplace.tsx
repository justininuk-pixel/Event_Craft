"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Users, User } from "lucide-react";

export function DigitalFireplace({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ea580c"; // orange-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  // Mock WebSocket presence
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [hasBothConnected, setHasBothConnected] = useState(false);

  useEffect(() => {
     // In editor mode, we mock the second user joining after 5 seconds
     if (mode === "editor-preview") {
        const timer = setTimeout(() => {
           setConnectedUsers(2);
           setHasBothConnected(true);
           if (onComplete) {
              setTimeout(onComplete, 5000);
           }
        }, 5000);
        return () => clearTimeout(timer);
     }
  }, [mode, onComplete]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Environmental Ambient Glow */}
      <motion.div 
         className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
         animate={{ 
            background: connectedUsers > 1 
               ? `radial-gradient(circle at 50% 80%, ${primaryColor} 0%, transparent 80%)`
               : `radial-gradient(circle at 50% 80%, #9a3412 0%, transparent 60%)`, // orange-800
            opacity: [0.3, 0.4, 0.3]
         }}
         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
         <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 shadow-lg">
            {connectedUsers === 1 ? (
               <>
                  <User size={16} className="text-white/50" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                     Waiting...
                  </span>
               </>
            ) : (
               <>
                  <Users size={16} className="text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                     Both Here
                  </span>
               </>
            )}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full z-10">
         
         <div className="relative w-64 h-64 flex items-end justify-center mb-16">
            
            {/* The Fire */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-48 flex justify-center items-end mix-blend-screen pointer-events-none">
               {/* Core Flame */}
               <motion.div 
                  className="w-24 h-32 bg-yellow-500 rounded-full blur-[20px] origin-bottom absolute bottom-0"
                  animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1], scaleX: [1, 0.9, 1.1, 0.9, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               />
               <motion.div 
                  className="w-32 h-48 bg-orange-600 rounded-full blur-[30px] origin-bottom absolute bottom-0"
                  animate={{ scaleY: [1, 1.1, 0.9, 1], scaleX: [1, 0.95, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
               />
               <motion.div 
                  className="w-40 h-56 bg-red-600 rounded-full blur-[40px] origin-bottom absolute bottom-0 opacity-80"
                  animate={{ scaleY: [1, 1.15, 0.95, 1], scaleX: [1, 0.9, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
               />
            </div>

            {/* The Logs */}
            <div className="relative z-10 flex gap-1">
               {/* Log 1 (Always present) */}
               <div className="w-24 h-8 bg-zinc-800 rounded-full border border-zinc-900 shadow-2xl rotate-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-orange-900/50" />
                  <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
               </div>
               
               {/* Log 2 (Appears when connected) */}
               <AnimatePresence>
                  {connectedUsers > 1 && (
                     <motion.div 
                        initial={{ opacity: 0, y: -20, rotate: -45 }}
                        animate={{ opacity: 1, y: 0, rotate: -12 }}
                        className="w-24 h-8 bg-zinc-800 rounded-full border border-zinc-900 shadow-2xl relative overflow-hidden -ml-12 mt-4"
                     >
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-orange-900/50" />
                        <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

         </div>

         {/* Message */}
         <div className="text-center px-8">
            <AnimatePresence mode="wait">
               {connectedUsers === 1 ? (
                  <motion.div
                     key="alone"
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                     <p className="text-white/40 font-serif italic text-xl">
                        Just keeping the fire warm...
                     </p>
                  </motion.div>
               ) : (
                  <motion.div
                     key="together"
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  >
                     <p className="text-orange-200 font-serif italic text-2xl drop-shadow-md">
                        {config.body || "It's always better when we're both here."}
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
