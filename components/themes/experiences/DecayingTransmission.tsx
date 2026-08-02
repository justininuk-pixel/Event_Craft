"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";

export function DecayingTransmission({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [isHolding, setIsHolding] = useState(false);
  const [decayAmount, setDecayAmount] = useState(0); // 0 to 100
  const [isCompletelyDecayed, setIsCompletelyDecayed] = useState(false);
  
  const textRef = useRef<HTMLDivElement>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  const originalMessage = config.body || "INCOMING TRANSMISSION:\n\nThey found us. We don't have much time. \nThe coordinates are 45.92 N, 12.33 E.\nDo not trust the operative in Berlin. \nBurn this message after reading.\n\nEND TRANSMISSION";

  // The decay timer
  useEffect(() => {
    if (!isHolding || isCompletelyDecayed) return;
    if (mode === "editor-preview") return; // disable in editor so they can read it

    const interval = setInterval(() => {
      setDecayAmount(prev => {
         const next = prev + 1; // 1% per 50ms = 5 seconds to full decay
         if (next >= 100) {
            setIsCompletelyDecayed(true);
            if (onComplete) onComplete();
            return 100;
         }
         return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isHolding, isCompletelyDecayed, mode, onComplete]);

  // Function to scramble text based on decay amount
  const renderScrambledText = () => {
     if (!isHolding && !isCompletelyDecayed) return null; // Hidden when not holding

     const chars = originalMessage.split("");
     const corruptChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
     
     return chars.map((char, index) => {
        if (char === "\n") return <br key={index} />;
        if (char === " ") return <span key={index}>&nbsp;</span>;

        // The higher the decay, the higher the chance to scramble or hide a character
        const randomVal = Math.random() * 100;
        
        let displayChar = char;
        let opacity = 1;

        if (randomVal < decayAmount) {
           // It's affected by decay
           if (Math.random() > 0.5) {
              // Scramble it
              displayChar = corruptChars[Math.floor(Math.random() * corruptChars.length)];
              opacity = 0.5 + Math.random() * 0.5;
           } else {
              // Erase it entirely
              opacity = 0;
           }
        }

        return (
           <span key={index} style={{ opacity, transition: 'opacity 0.1s' }}>
              {displayChar}
           </span>
        );
     });
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center font-mono select-none overflow-hidden"
      style={{ backgroundColor: bgColors[0], color: primaryColor }}
      onPointerDown={() => !isCompletelyDecayed && setIsHolding(true)}
      onPointerUp={() => setIsHolding(false)}
      onPointerLeave={() => setIsHolding(false)}
      onContextMenu={(e) => e.preventDefault()} // prevent context menu on mobile hold
    >
      
      {/* Glitch Overlay */}
      {isHolding && decayAmount > 20 && (
         <div 
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20 z-0"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/tv-noise.png')" }}
         />
      )}

      {/* Main Content Area */}
      <div className="z-10 w-full max-w-md p-8 relative min-h-[50vh] flex flex-col items-center justify-center">
         
         <AnimatePresence mode="wait">
            {!isHolding && !isCompletelyDecayed ? (
               <motion.div 
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 animate-pulse"
               >
                  <div className="p-6 rounded-full border-2" style={{ borderColor: primaryColor }}>
                     <Fingerprint size={64} color={primaryColor} />
                  </div>
                  <p className="text-center font-bold tracking-widest uppercase text-sm">
                     Hold to decrypt
                  </p>
                  <p className="text-center text-xs opacity-50 mt-4 max-w-xs">
                     Warning: This message is highly unstable. Exposure to cognitive rendering will cause permanent data decay.
                  </p>
               </motion.div>
            ) : isCompletelyDecayed ? (
               <motion.div 
                  key="destroyed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4"
               >
                  <p className="text-xl font-black uppercase tracking-widest text-red-500 glitch-text">
                     TRANSMISSION LOST
                  </p>
                  <p className="text-xs text-red-500/50 uppercase tracking-widest">
                     Data permanently corrupted.
                  </p>
                  {onComplete && (
                     <button 
                        onClick={() => onComplete()}
                        className="mt-8 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-900/30 transition-colors uppercase text-xs font-bold"
                     >
                        Acknowledge
                     </button>
                  )}
               </motion.div>
            ) : (
               <motion.div 
                  key="message"
                  ref={textRef}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  className="w-full text-left text-sm sm:text-base leading-relaxed tracking-wide drop-shadow-[0_0_8px_currentColor]"
               >
                  <h2 className="text-lg font-bold mb-4 uppercase border-b pb-2" style={{ borderColor: `${primaryColor}50` }}>
                     {config.title || "Classified Intel"}
                  </h2>
                  <div className="break-words">
                     {renderScrambledText()}
                  </div>

                  {/* Progress bar showing decay */}
                  <div className="w-full h-1 bg-black mt-12 rounded overflow-hidden">
                     <div 
                        className="h-full bg-red-500 transition-all duration-75"
                        style={{ width: `${decayAmount}%` }}
                     />
                  </div>
                  <p className="text-[10px] text-right mt-1 uppercase text-red-500">
                     Signal Integrity: {100 - decayAmount}%
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setIsCompletelyDecayed(true);
                  if (onComplete) onComplete();
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Force Decay (Editor)
            </button>
         </div>
      )}

      {/* Glitch CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .glitch-text {
          position: relative;
        }
        .glitch-text::before, .glitch-text::after {
          content: "TRANSMISSION LOST";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${bgColors[0]};
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 red;
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -1px 0 blue;
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 10% 0); }
          40% { clip-path: inset(40% 0 50% 0); }
          60% { clip-path: inset(80% 0 5% 0); }
          80% { clip-path: inset(10% 0 70% 0); }
          100% { clip-path: inset(30% 0 20% 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 60% 0); }
          20% { clip-path: inset(30% 0 20% 0); }
          40% { clip-path: inset(70% 0 10% 0); }
          60% { clip-path: inset(20% 0 50% 0); }
          80% { clip-path: inset(50% 0 30% 0); }
          100% { clip-path: inset(5% 0 80% 0); }
        }
      `}} />

    </div>
  );
}
