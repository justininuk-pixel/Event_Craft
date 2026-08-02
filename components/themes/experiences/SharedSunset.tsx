"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, CloudRain, Clock, MapPin } from "lucide-react";

export function SharedSunset({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const partnerLocation = (config.recipient as any)?.location || "Seattle, WA";
  const partnerName = (config.recipient as any)?.name || config.recipient || "them";

  // If editor, start daytime, transition to sunset after 3s to demo
  const [isSunset, setIsSunset] = useState(false);

  useEffect(() => {
     let timer: NodeJS.Timeout;
     
     if (mode === "editor-preview") {
        timer = setTimeout(() => {
           setIsSunset(true);
        }, 3000);
     } else {
        // In real app, fetch sunrise-sunset.org API for partnerLocation coords
        // For demo, just trigger it randomly or after a delay
        timer = setTimeout(() => {
           setIsSunset(true);
        }, 5000);
     }

     return () => clearTimeout(timer);
  }, [mode]);

  // Complete experience a few seconds after sunset
  useEffect(() => {
     if (isSunset && onComplete) {
        const timer = setTimeout(() => {
           onComplete();
        }, 8000);
        return () => clearTimeout(timer);
     }
  }, [isSunset, onComplete]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white transition-colors duration-[3000ms]"
      style={{ 
         // Day gradient vs Sunset gradient
         background: isSunset 
            ? 'linear-gradient(to bottom, #c026d3 0%, #f43f5e 50%, #f59e0b 100%)' // fuchsia to rose to amber
            : 'linear-gradient(to bottom, #38bdf8 0%, #bae6fd 100%)' // sky blue
      }}
    >
      
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
         <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-md">
            <MapPin size={16} />
            Your Local Time
         </div>
         <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-md">
            <Clock size={16} />
            {isSunset ? '8:02 PM' : '2:15 PM'}
         </div>
      </div>

      {/* The Sun / Sky elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         {/* Sun */}
         <motion.div 
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_100px_rgba(255,255,255,1)]"
            initial={{ top: "20%", width: 100, height: 100 }}
            animate={{ 
               top: isSunset ? "70%" : "20%",
               width: isSunset ? 200 : 100,
               height: isSunset ? 200 : 100,
               backgroundColor: isSunset ? "#fef08a" : "#ffffff"
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
         />
         
         {/* Clouds (day only) */}
         <AnimatePresence>
            {!isSunset && (
               <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
               >
                  <div className="absolute top-32 left-12 opacity-80 text-white"><CloudRain size={64} fill="currentColor" /></div>
                  <div className="absolute top-20 right-24 opacity-60 text-white"><CloudRain size={48} fill="currentColor" /></div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* The Message */}
      <div className="flex-1 flex flex-col items-center justify-end pb-32 p-8 z-30 text-center">
         <AnimatePresence mode="wait">
            {isSunset ? (
               <motion.div
                  key="sunset"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 2 }}
                  className="bg-black/30 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20"
               >
                  <Sun size={40} className="text-yellow-300 mx-auto mb-6 animate-[spin_10s_linear_infinite]" />
                  <h2 className="text-2xl font-black mb-4 drop-shadow-md">
                     {config.title || `The sun is setting on ${partnerName}.`}
                  </h2>
                  <p className="text-white/80 font-medium text-lg leading-relaxed">
                     {config.body || `Wherever you are, take a moment. The sky is painting itself in ${partnerLocation} right now. Think of them.`}
                  </p>
               </motion.div>
            ) : (
               <motion.div
                  key="day"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/70 font-bold uppercase tracking-widest text-sm drop-shadow-md"
               >
                  Waiting for their sky...
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
