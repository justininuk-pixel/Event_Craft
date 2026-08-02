"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Stamp, CheckCircle, Heart } from "lucide-react";

export function EnvelopeSeal({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const waxColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // red-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // slate-100

  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [isSealed, setIsSealed] = useState(false);
  
  const pressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startPress = () => {
     if (isSealed) return;
     setIsPressing(true);
     startTimeRef.current = Date.now() - (pressProgress * 20); // Maintain progress if let go
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const targetDuration = 2000; // 2 seconds to seal
        const progress = Math.min(100, (elapsed / targetDuration) * 100);
        
        setPressProgress(progress);

        if (progress < 100) {
           pressTimerRef.current = requestAnimationFrame(updateProgress);
        } else {
           finishSeal();
        }
     };

     pressTimerRef.current = requestAnimationFrame(updateProgress);
  };

  const stopPress = () => {
     if (isSealed) return;
     setIsPressing(false);
     if (pressTimerRef.current) {
        cancelAnimationFrame(pressTimerRef.current);
     }
     // Quickly lose progress if let go before sealing
     const decay = setInterval(() => {
        setPressProgress(prev => {
           if (prev <= 0) {
              clearInterval(decay);
              return 0;
           }
           return prev - 5;
        });
     }, 50);
  };

  const finishSeal = () => {
     setIsSealed(true);
     setIsPressing(false);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
     }
     
     if (onComplete) {
        setTimeout(onComplete, 3000);
     }
  };

  useEffect(() => {
     return () => {
        if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
     };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-4">
            <h2 className="text-2xl font-serif italic tracking-tight text-slate-700">
               {config.title || "The Letter."}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-[250px] mx-auto">
               {isSealed ? "Sealed and sent." : "Press and hold to seal the envelope."}
            </p>
         </div>

         {/* The Envelope */}
         <div className="relative w-full max-w-sm mt-12 mb-8">
            <motion.div 
               className="relative w-full aspect-[4/3] bg-[#f8f9fa] shadow-xl rounded-md border border-slate-200 overflow-hidden"
               animate={{ y: isSealed ? [0, -20, 1000] : 0, opacity: isSealed ? [1, 1, 0] : 1 }}
               transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
            >
               {/* Envelope Flap (Top Triangle) */}
               <div 
                  className="absolute top-0 left-0 w-full h-[60%] bg-[#e9ecef] shadow-sm z-10 origin-top border-b border-slate-300"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
               />
               
               {/* Letter sticking out before seal */}
               {!isSealed && (
                  <div className="absolute top-4 left-4 right-4 h-full bg-white border border-slate-200 p-4 font-serif text-[8px] leading-relaxed text-slate-400 z-0 shadow-inner">
                     {config.body || "My dearest,\n\nWords cannot express the depth of my feelings for you. I hope this letter finds you well and brings a smile to your face.\n\nForever yours,\n..."}
                  </div>
               )}

               {/* Envelope Bottom */}
               <div 
                  className="absolute bottom-0 left-0 w-full h-[70%] bg-[#f8f9fa] shadow-sm z-20 border-t border-slate-200"
                  style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
               />

               {/* The Wax Seal Interaction Area */}
               <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-24 h-24">
                  
                  {/* The Wax Blob */}
                  <motion.div
                     onPointerDown={startPress}
                     onPointerUp={stopPress}
                     onPointerLeave={stopPress}
                     className="relative flex items-center justify-center cursor-pointer"
                     animate={{
                        width: isSealed ? 60 : 40 + (pressProgress * 0.2),
                        height: isSealed ? 60 : 40 + (pressProgress * 0.2),
                        borderRadius: isSealed ? '50%' : `${50 + (Math.random()*10 - 5)}%`,
                     }}
                     transition={{ type: "tween", duration: 0.1 }}
                  >
                     <div 
                        className="absolute inset-0 transition-colors shadow-lg"
                        style={{ 
                           backgroundColor: waxColor,
                           borderRadius: 'inherit',
                           boxShadow: `inset 0 5px 10px rgba(255,255,255,0.4), inset 0 -5px 10px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.3)`
                        }}
                     />
                     
                     {/* The Insignia (appears when sealed) */}
                     <motion.div 
                        className="relative z-10 text-white opacity-0"
                        animate={{ opacity: pressProgress > 80 ? (pressProgress - 80) / 20 : 0 }}
                        style={{ filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.5))' }}
                     >
                        <Heart size={24} fill="currentColor" />
                     </motion.div>
                  </motion.div>

               </div>

            </motion.div>
         </div>

         {/* Interaction Guide */}
         {!isSealed && (
            <div className="flex flex-col items-center">
               <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden mb-4 shadow-inner">
                  <div 
                     className="h-full transition-all duration-100 ease-linear"
                     style={{ width: `${pressProgress}%`, backgroundColor: waxColor }}
                  />
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-slate-200">
                  <Stamp size={16} /> Hold thumb on wax
               </div>
            </div>
         )}
         
         {isSealed && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}
               className="flex flex-col items-center text-green-600"
            >
               <CheckCircle size={48} className="mb-2 drop-shadow-sm" />
               <p className="font-bold uppercase tracking-widest text-sm drop-shadow-sm">Sent.</p>
            </motion.div>
         )}

      </div>

    </div>
  );
}
