"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ANGLE_PER_LETTER = 360 / 26;

// Helper to encrypt text
const encryptText = (text: string, shift: number) => {
   return text.split('').map(char => {
      const upper = char.toUpperCase();
      const idx = ALPHABET.indexOf(upper);
      if (idx === -1) return char; // Non-alphabetic stays the same
      
      const newIdx = (idx + shift) % 26;
      const isLower = char === char.toLowerCase() && char !== char.toUpperCase();
      const newChar = ALPHABET[newIdx];
      return isLower ? newChar.toLowerCase() : newChar;
   }).join('');
};

// Helper to decrypt text
const decryptText = (text: string, shift: number) => {
   // Shifting backwards is the same as shifting forward by (26 - shift)
   return encryptText(text, (26 - shift) % 26);
};

export function CaesarCypher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#b45309"; // Amber 700
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // Amber 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [targetShift, setTargetShift] = useState(0);
  const [currentShift, setCurrentShift] = useState(0);
  const [encryptedTitle, setEncryptedTitle] = useState("");
  const [encryptedBody, setEncryptedBody] = useState("");

  const ringRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
     // Pick a random shift from 1 to 25
     const shift = Math.floor(Math.random() * 25) + 1;
     setTargetShift(shift);
     setEncryptedTitle(encryptText(config.title, shift));
     setEncryptedBody(encryptText(config.body, shift));
  }, [config.title, config.body]);

  // Handle Drag Rotation mapping
  // Since Framer Motion's drag is linear, we'll map a horizontal drag to a rotation.
  // We'll use a hidden motion value to track the raw drag, then transform it.
  const rawDragX = useMotionValue(0);
  
  // 1 pixel of drag = 0.5 degrees
  const rotation = useTransform(rawDragX, (x) => x * 0.5);

  // When dragging stops, we want to snap to the nearest letter
  const handleDragEnd = () => {
     if (gameState !== "playing") return;
     
     const currentRot = rotation.get();
     // Find nearest multiple of ANGLE_PER_LETTER
     const snappedRot = Math.round(currentRot / ANGLE_PER_LETTER) * ANGLE_PER_LETTER;
     
     // Animate the raw drag value to match the snapped rotation
     // rawDragX = rotation / 0.5 = snappedRot * 2
     // Actually, we'll just set it immediately or animate it via a wrapper state if needed.
     // To keep it simple and perfectly synced, let's just use state for the shift and let 
     // Framer animate the rotation style directly.
     
     // Let's rewrite the interaction to use simple buttons for precision, or standard touch tracking.
     // Actually, let's use a simpler approach: Just state for rotation, and Framer Motion animates it.
  };

  // Alternative explicit state approach for rotation:
  const handleTurnLeft = () => {
     if (gameState !== "playing") return;
     setCurrentShift(prev => (prev - 1 + 26) % 26);
  };

  const handleTurnRight = () => {
     if (gameState !== "playing") return;
     setCurrentShift(prev => (prev + 1) % 26);
  };

  useEffect(() => {
     if (gameState === "playing" && currentShift === targetShift) {
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 2000);
     }
  }, [currentShift, targetShift, gameState]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Live decrypted text
  const liveTitle = gameState === "start" ? encryptedTitle : decryptText(encryptedTitle, currentShift);
  const liveBody = gameState === "start" ? encryptedBody : decryptText(encryptedBody, currentShift);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[4/5] bg-slate-900 border-8 border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Live Text Display */}
         <div className="w-full h-1/2 p-6 flex flex-col items-center justify-center bg-slate-800 border-b-4 border-slate-700 relative z-10 text-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Encrypted Transmission</span>
            <div className="font-mono bg-slate-900 p-4 rounded-xl border border-slate-700 w-full shadow-inner h-full overflow-hidden flex flex-col gap-2">
               <h2 className={`font-black text-lg transition-colors duration-300 ${gameState === 'won' ? 'text-green-400' : 'text-slate-300'}`}>
                  {liveTitle}
               </h2>
               <p className={`text-sm opacity-80 transition-colors duration-300 ${gameState === 'won' ? 'text-green-200' : 'text-slate-400'}`}>
                  {liveBody}
               </p>
            </div>
         </div>

         {/* The Ring System */}
         <div className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 relative flex items-center justify-center overflow-hidden z-0">
            
            <div className="relative w-64 h-64 flex items-center justify-center">
               
               {/* Outer Ring (Fixed) */}
               <div className="absolute w-64 h-64 rounded-full border-[12px] border-slate-500 shadow-2xl bg-slate-800">
                  {ALPHABET.split('').map((char, i) => (
                     <div 
                        key={`outer-${char}`}
                        className="absolute w-4 h-6 -ml-2 -mt-3 text-center font-black text-[10px] text-slate-300 left-1/2 top-1/2"
                        style={{
                           transform: `rotate(${i * ANGLE_PER_LETTER}deg) translateY(-114px)`
                        }}
                     >
                        {char}
                     </div>
                  ))}
               </div>

               {/* Inner Ring (Rotatable) */}
               <motion.div 
                  className="absolute w-44 h-44 rounded-full border-8 border-amber-600 shadow-lg bg-amber-100"
                  animate={{ rotate: currentShift * ANGLE_PER_LETTER }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
               >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.4),_transparent)] pointer-events-none rounded-full" />
                  
                  {ALPHABET.split('').map((char, i) => (
                     <div 
                        key={`inner-${char}`}
                        className="absolute w-4 h-6 -ml-2 -mt-3 text-center font-black text-[10px] text-amber-900 left-1/2 top-1/2"
                        style={{
                           transform: `rotate(${i * ANGLE_PER_LETTER}deg) translateY(-74px)`
                        }}
                     >
                        {char}
                     </div>
                  ))}
                  
                  {/* Center Hub */}
                  <div className="absolute w-12 h-12 bg-amber-700 rounded-full left-1/2 top-1/2 -ml-6 -mt-6 border-4 border-amber-900 shadow-inner flex items-center justify-center">
                     <div className="w-2 h-2 bg-amber-300 rounded-full" />
                  </div>
               </motion.div>

               {/* Readout Marker */}
               <div className="absolute top-0 left-1/2 -ml-1 -mt-2 w-2 h-16 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 pointer-events-none" />

            </div>

            {/* Turn Controls */}
            {gameState === "playing" && (
               <>
                  <button 
                     onClick={handleTurnLeft}
                     className="absolute left-4 bottom-4 w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-slate-300 active:scale-95 shadow-lg"
                  >
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 rotate-180">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button>
                  <button 
                     onClick={handleTurnRight}
                     className="absolute right-4 bottom-4 w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-slate-300 active:scale-95 shadow-lg"
                  >
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button>
               </>
            )}

         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Decode
                  </div>
                  <div className="text-slate-400 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     The message is encrypted.<br/>Turn the cipher ring to find the correct shift key.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                     style={{ backgroundColor: primaryColor }}
                  >
                     Start Decryption
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(180,83,9,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="font-black uppercase tracking-widest mb-6 text-sm" style={{ color: primaryColor }}>Message Decoded</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setCurrentShift(targetShift);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-colors shadow-lg"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Decode Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
