"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen } from "lucide-react";

export function NestedEnvelopes({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  // E.g., 8 envelopes to open
  const totalEnvelopes = 8;
  const [openedCount, setOpenedCount] = useState(0);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const handleOpen = () => {
    if (openedCount < totalEnvelopes) {
      setOpenedCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (openedCount === totalEnvelopes && onComplete) {
       // Small delay to let the final envelope animate away before triggering completion log
       const t = setTimeout(() => {
          onComplete();
       }, 1000);
       return () => clearTimeout(t);
    }
  }, [openedCount, totalEnvelopes, onComplete]);

  // Generate the array of envelopes
  const envelopes = Array.from({ length: totalEnvelopes }, (_, i) => i);

  return (
    <div 
      className="w-full h-full relative flex items-center justify-center overflow-hidden font-sans select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Pattern */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} 
      />

      <div className="relative w-64 h-48 sm:w-80 sm:h-60 flex items-center justify-center">
         
         {/* The Final Message (Hidden behind the envelopes) */}
         <AnimatePresence>
            {openedCount === totalEnvelopes && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="absolute inset-0 bg-white shadow-2xl rounded p-6 flex flex-col items-center justify-center text-center z-0"
               >
                  <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                     {config.title || "Finally..."}
                  </h2>
                  <p className="text-zinc-600 leading-relaxed text-sm">
                     {config.body || "You made it to the center. Some things are worth the wait."}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

         {/* The Stack of Envelopes */}
         <AnimatePresence>
            {envelopes.map((idx) => {
               // If this envelope has been opened, don't render it
               if (idx < openedCount) return null;

               // Calculate stacking styles based on how far down the stack it is
               // 0 is the current top envelope (idx === openedCount)
               const depth = idx - openedCount;
               
               // The deeper it is, the smaller and darker it is
               const scale = 1 - (depth * 0.05);
               const yOffset = depth * 10;
               const brightness = 100 - (depth * 10);
               const zIndex = 50 - depth;

               // Alternate envelope shades slightly
               const isAlternate = idx % 2 === 0;

               return (
                  <motion.div 
                     key={idx}
                     className="absolute w-full h-full cursor-pointer shadow-xl flex items-center justify-center rounded-sm overflow-hidden border border-black/10"
                     style={{ 
                        zIndex,
                        backgroundColor: isAlternate ? primaryColor : "#ffffff",
                        color: isAlternate ? "#ffffff" : primaryColor,
                        filter: `brightness(${brightness}%)`
                     }}
                     initial={false}
                     animate={{ 
                        scale, 
                        y: yOffset,
                        rotate: idx % 2 === 0 ? depth * -1 : depth * 1 // slight tilt for stack effect
                     }}
                     exit={{ 
                        y: -500, // slide up and away
                        opacity: 0,
                        rotate: Math.random() * 20 - 10,
                        scale: 1.1
                     }}
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                     onClick={depth === 0 ? handleOpen : undefined} // Only top one is clickable
                  >
                     {/* Envelope Flap visual using CSS borders */}
                     <div className="absolute top-0 left-0 w-0 h-0 border-l-[128px] sm:border-l-[160px] border-r-[128px] sm:border-r-[160px] border-t-[80px] sm:border-t-[100px] border-l-transparent border-r-transparent opacity-20 pointer-events-none" 
                          style={{ borderTopColor: "black" }} />
                     
                     <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[128px] sm:border-l-[160px] border-r-[128px] sm:border-r-[160px] border-b-[80px] sm:border-b-[100px] border-l-transparent border-r-transparent opacity-10 pointer-events-none" 
                          style={{ borderBottomColor: "black" }} />

                     <div className="flex flex-col items-center gap-2 opacity-80 z-10 pointer-events-none">
                        <MailOpen size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">
                           {depth === 0 ? "Tap to open" : ""}
                        </span>
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && openedCount < totalEnvelopes && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setOpenedCount(totalEnvelopes)}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Open All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
