"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const TARGET_CODE = "1984";

// Angle positions for the holes on the dial when at rest (0 rotation)
// 0 deg is Right. Clockwise is positive.
const STOPPER_ANGLE = 45; // Degrees

const DIGITS = [
   { num: "1", angle: 15 },
   { num: "2", angle: -15 },
   { num: "3", angle: -45 },
   { num: "4", angle: -75 },
   { num: "5", angle: -105 },
   { num: "6", angle: -135 },
   { num: "7", angle: -165 },
   { num: "8", angle: -195 },
   { num: "9", angle: -225 },
   { num: "0", angle: -255 },
];

export function RotaryDial({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0f766e"; // Teal 700
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // Amber 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  
  const dialRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const startRot = useRef(0);
  
  const controls = useAnimation();

  const getAngle = (e: React.PointerEvent | PointerEvent) => {
     if (!dialRef.current) return 0;
     const rect = dialRef.current.getBoundingClientRect();
     const cx = rect.left + rect.width / 2;
     const cy = rect.top + rect.height / 2;
     return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
     if (gameState !== "playing") return;
     isDragging.current = true;
     startAngle.current = getAngle(e);
     startRot.current = rotation;
     controls.stop(); // Stop any ongoing spring back
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     
     const currentAngle = getAngle(e);
     let diff = currentAngle - startAngle.current;
     
     // Handle wraparound
     if (diff > 180) diff -= 360;
     if (diff < -180) diff += 360;

     let newRot = startRot.current + diff;
     
     // Constraint: Can only rotate clockwise (positive)
     if (newRot < 0) newRot = 0;

     // Constraint: Max rotation hits the stopper
     // Max rotation is whatever pulls the '0' hole (at -255) to the stopper (45) => 300 degrees
     if (newRot > 305) newRot = 305;

     setRotation(newRot);
  };

  const handlePointerUp = () => {
     if (!isDragging.current) return;
     isDragging.current = false;

     // Check what number was dialed
     // If rotation is close to the expected rotation for a digit, register it.
     let dialedDigit = null;
     
     for (const d of DIGITS) {
        const expectedRot = STOPPER_ANGLE - d.angle; 
        if (Math.abs(rotation - expectedRot) < 15) {
           dialedDigit = d.num;
           break;
        }
     }

     if (dialedDigit) {
        setEnteredCode(prev => {
           const next = prev + dialedDigit;
           if (next.length >= TARGET_CODE.length) {
              if (next === TARGET_CODE) {
                 setGameState("won");
    onComplete?.();
                 setTimeout(() => setShowPayload(true), 1500);
              } else {
                 // Incorrect
                 setTimeout(() => setEnteredCode(""), 800);
              }
           }
           return next;
        });
     }

     // Spring back to 0
     controls.start({
        rotate: 0,
        transition: {
           type: "spring",
           stiffness: 100,
           damping: 15,
           mass: 1
        }
     }).then(() => {
        setRotation(0);
     });
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Handle global pointer up in case they drag off the dial
  useEffect(() => {
     const upHandler = () => handlePointerUp();
     window.addEventListener('pointerup', upHandler);
     return () => window.removeEventListener('pointerup', upHandler);
  }, [rotation]); // Need current rotation in handler

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         className={`relative w-full max-w-sm aspect-[3/4] bg-[#e2e8f0] border-8 border-[#cbd5e1] rounded-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.1),_0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100"}`}
      >
         
         {/* Top HUD */}
         <div className="absolute top-8 w-full flex flex-col items-center">
            <div className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Dial Code</div>
            <div className="flex gap-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                     key={i}
                     className="w-12 h-16 bg-white rounded-lg shadow-inner flex items-center justify-center text-3xl font-black text-slate-800 border border-slate-300"
                  >
                     {enteredCode[i] || ""}
                  </div>
               ))}
            </div>
            {enteredCode.length === 4 && enteredCode !== TARGET_CODE && (
               <div className="absolute top-24 text-red-500 font-black uppercase tracking-widest text-sm animate-pulse">
                  Incorrect
               </div>
            )}
         </div>

         {/* The Phone Base */}
         <div className="relative w-72 h-72 rounded-full bg-[#f8fafc] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1),_0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center mt-20 border-2 border-white">
            
            {/* Fixed Numbers underneath */}
            {DIGITS.map(d => (
               <div 
                  key={`num-${d.num}`}
                  className="absolute text-slate-800 font-bold text-xl flex items-center justify-center w-10 h-10"
                  style={{
                     transform: `rotate(${d.angle}deg) translate(105px) rotate(${-d.angle}deg)`
                  }}
               >
                  {d.num}
               </div>
            ))}

            {/* Center Decal */}
            <div className="absolute w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-inner flex items-center justify-center">
               <span className="text-slate-400 font-black tracking-widest text-[10px]">EVENTCRAFT</span>
            </div>

            {/* Stopper */}
            <div 
               className="absolute w-12 h-4 bg-slate-400 rounded-l-full shadow-lg z-20 pointer-events-none"
               style={{
                  transformOrigin: "left center",
                  left: "50%",
                  transform: `rotate(${STOPPER_ANGLE}deg) translate(100px)`
               }}
            >
               <div className="w-full h-full bg-gradient-to-r from-slate-300 to-slate-500 rounded-l-full" />
            </div>

            {/* Rotating Dial Plate */}
            <motion.div
               ref={dialRef}
               className="absolute w-full h-full rounded-full border-[12px] border-white/50 z-10 touch-none"
               style={{ rotate: rotation }}
               animate={controls}
               onPointerDown={handlePointerDown}
               onPointerMove={handlePointerMove}
               // pointer up is handled globally
            >
               {/* Holes */}
               {DIGITS.map(d => (
                  <div 
                     key={`hole-${d.num}`}
                     className="absolute w-12 h-12 rounded-full border-4 border-white/50 bg-transparent flex items-center justify-center cursor-grab active:cursor-grabbing"
                     style={{
                        top: '50%', left: '50%',
                        marginTop: -24, marginLeft: -24,
                        transform: `rotate(${d.angle}deg) translate(105px)`
                     }}
                  >
                     {/* The hole shows the background (numbers) through it */}
                     <div className="w-full h-full rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.3)] bg-transparent pointer-events-none" />
                  </div>
               ))}
            </motion.div>

         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-sm mb-4 text-center px-4 leading-tight">
                     Rotary Dial
                  </div>
                  <div className="text-slate-300 font-medium mb-8 text-center px-8 text-sm tracking-wide leading-relaxed">
                     Dial the code: <span className="font-black text-white">1984</span><br/>Drag numbers to the stopper.
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="bg-white text-slate-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:translate-y-0 transition-transform"
                  >
                     Pick Up
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
                  className="bg-white p-10 md:p-14 rounded-[2rem] max-w-2xl w-full text-center shadow-[0_20px_80px_rgba(255,255,255,0.2)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-slate-500 font-black uppercase tracking-widest mb-6 text-sm">Line Connected</div>
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
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/50 backdrop-blur-xl border border-white p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setEnteredCode(TARGET_CODE);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
            >
               Auto-Dial Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
