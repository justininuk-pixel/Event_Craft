"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, CheckCircle2 } from "lucide-react";

export function FingerprintMatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#06b6d4"; // cyan-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#083344"]; // cyan-950

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [isMatched, setIsMatched] = useState(false);
  
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
     if (isMatched) return;
     setIsScanning(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
     
     scanIntervalRef.current = setInterval(() => {
        setScanProgress(prev => {
           const next = prev + 2; // Roughly 2 seconds to reach 100
           if (next >= 100) {
              clearInterval(scanIntervalRef.current!);
              handleMatch();
              return 100;
           }
           return next;
        });
     }, 40); // 40ms * 50 steps = 2000ms
  };

  const stopScan = () => {
     if (isMatched) return;
     setIsScanning(false);
     setScanProgress(0);
     if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
     }
  };

  const handleMatch = () => {
     setIsMatched(true);
     setIsScanning(false);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     if (onComplete) {
        setTimeout(onComplete, 8000);
     }
  };

  useEffect(() => {
     return () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
     };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full h-full">
         
         <AnimatePresence mode="wait">
            {!isMatched ? (
               <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 0.8 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  <h2 className="text-xl font-bold uppercase tracking-widest text-cyan-200 mb-2">
                     Identity Verification
                  </h2>
                  <p className="text-cyan-400/60 text-sm mb-16 max-w-[250px]">
                     Hold your thumb on the scanner to match fingerprints.
                  </p>

                  {/* Fingerprint Scanner Area */}
                  <div 
                     className="relative w-48 h-64 flex items-center justify-center cursor-pointer"
                     onPointerDown={startScan}
                     onPointerUp={stopScan}
                     onPointerLeave={stopScan}
                  >
                     {/* The base fingerprint (Sender's print) */}
                     <Fingerprint 
                        size={160} 
                        className={`transition-all duration-300 ${isScanning ? 'opacity-20' : 'opacity-40'}`} 
                        style={{ color: primaryColor }} 
                     />
                     
                     {/* The scanning effect (Receiver's print matching) */}
                     <div 
                        className="absolute inset-0 overflow-hidden flex items-end justify-center pb-[20px]"
                        style={{ height: `${scanProgress}%` }}
                     >
                        <Fingerprint 
                           size={160} 
                           className="drop-shadow-[0_0_15px_currentColor]"
                           style={{ color: primaryColor }} 
                        />
                     </div>

                     {/* Scanning Line */}
                     {isScanning && (
                        <div 
                           className="absolute w-[180px] h-[2px] bg-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                           style={{ bottom: `${100 - scanProgress}%` }}
                        />
                     )}

                     {/* Glow ring */}
                     <div className={`absolute inset-[-40px] border-4 rounded-[40px] transition-all duration-300 ${isScanning ? 'border-cyan-400 opacity-50 scale-100' : 'border-cyan-900 opacity-30 scale-110'}`} />
                  </div>

                  <div className="mt-16 text-cyan-400/40 font-mono text-sm uppercase tracking-widest">
                     Match: {scanProgress}%
                  </div>
               </motion.div>
            ) : (
               <motion.div
                  key="matched"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="w-full max-w-sm text-center flex flex-col items-center"
               >
                  <motion.div 
                     initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 1 }}
                     className="w-24 h-24 rounded-full bg-cyan-900/50 flex items-center justify-center border-2 mb-8"
                     style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                     <CheckCircle2 size={40} />
                  </motion.div>
                  
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                     Perfect Match.
                  </h3>
                  
                  <div className="w-12 h-1 rounded-full mb-8" style={{ backgroundColor: primaryColor }} />
                  
                  <p className="text-cyan-100/90 text-lg font-medium leading-relaxed">
                     {config.body || "There is no one else in the world I'd rather hold hands with."}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
