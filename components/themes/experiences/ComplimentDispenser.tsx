"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Hand, Heart, Sparkles } from "lucide-react";

export function ComplimentDispenser({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899"; // pink-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"]; // pink-50

  const compliments = ((config.experience as any)?.items as any[])?.map((f: any) => f.title) || [
     "You have the best smile.",
     "I love how weird you are.",
     "You're my favorite person to do nothing with.",
     "You look really cute today."
  ];

  const [step, setStep] = useState<"insert_coin" | "turn_crank" | "dispensing" | "opened">("insert_coin");
  const [crankAngle, setCrankAngle] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleCoinDragEnd = (e: any, info: any) => {
     // Slot is somewhere in the top middle
     if (info.offset.y < -50) {
        setStep("turn_crank");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
     }
  };

  const handleCrankDrag = (e: any, info: any) => {
     if (step !== "turn_crank") return;
     // Rough rotational drag map based on x offset
     const angle = Math.min(Math.max(info.offset.x, 0), 360);
     setCrankAngle(angle);
  };

  const handleCrankDragEnd = () => {
     if (step !== "turn_crank") return;
     if (crankAngle > 180) {
        setCrankAngle(360);
        setStep("dispensing");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => {
           const rand = compliments[Math.floor(Math.random() * compliments.length)];
           setResult(rand);
           setStep("opened");
    onComplete?.();
           if (onComplete) {
              setTimeout(onComplete, 5000);
           }
        }, 2000); // Dispense animation duration
     } else {
        setCrankAngle(0);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
         
         {/* The Gacha Machine */}
         <div className="relative w-[300px] h-[500px] flex flex-col items-center justify-end pb-8">
            
            {/* The Globe */}
            <div className="absolute top-0 w-64 h-64 bg-white/40 backdrop-blur-sm border-4 border-white/60 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden z-10">
               {/* Capsules inside */}
               <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-blue-400 opacity-80" />
               <div className="absolute bottom-2 right-8 w-16 h-16 rounded-full bg-yellow-400 opacity-80" />
               <div className="absolute bottom-12 left-20 w-16 h-16 rounded-full bg-green-400 opacity-80" />
               <div className="absolute top-1/2 left-8 w-16 h-16 rounded-full bg-purple-400 opacity-80" />
               
               {/* Target Capsule (moves down during dispense) */}
               <motion.div 
                  className="absolute bottom-16 right-16 w-16 h-16 rounded-full z-20"
                  style={{ backgroundColor: primaryColor }}
                  animate={{ 
                     y: step === "dispensing" || step === "opened" ? 300 : 0, // Fall down
                     opacity: step === "opened" ? 0 : 1
                  }}
                  transition={{ duration: 1.5, ease: "easeIn" }}
               />
               
               {/* Globe Highlight */}
               <div className="absolute top-4 left-4 w-16 h-32 bg-white/50 rounded-full rotate-45 blur-md" />
            </div>

            {/* The Machine Body */}
            <div 
               className="relative w-full h-64 rounded-t-3xl shadow-2xl flex flex-col items-center z-20"
               style={{ backgroundColor: primaryColor }}
            >
               
               {/* Coin Slot Panel */}
               <div className="absolute top-4 w-24 h-12 bg-black/20 rounded shadow-inner flex items-center justify-center">
                  <div className="w-2 h-8 bg-black rounded-full" />
               </div>

               {/* The Crank */}
               <div className="absolute top-20 w-32 h-32 bg-black/10 rounded-full shadow-inner flex items-center justify-center">
                  <motion.div 
                     className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center relative cursor-grab active:cursor-grabbing"
                     drag="x"
                     dragConstraints={{ left: 0, right: 360 }}
                     dragElastic={0}
                     onDrag={handleCrankDrag}
                     onDragEnd={handleCrankDragEnd}
                     animate={{ rotate: crankAngle }}
                     style={{ originX: 0.5, originY: 0.5 }}
                  >
                     <div className="w-8 h-8 rounded-full bg-white shadow-inner flex items-center justify-center">
                        <Hand size={16} className="text-slate-400" />
                     </div>
                     {/* The handle stick */}
                     <div className="absolute -right-4 w-6 h-6 rounded-full bg-white shadow-md" />
                  </motion.div>
               </div>

               {/* The Output Chute */}
               <div className="absolute bottom-6 w-24 h-16 bg-black/30 rounded-xl shadow-inner flex items-end justify-center overflow-hidden">
                  <div className="w-full h-8 bg-black/50 rounded-b-xl" />
                  
                  {/* The received capsule */}
                  <motion.div 
                     className="absolute -bottom-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                     style={{ backgroundColor: primaryColor }}
                     initial={{ y: -50, opacity: 0 }}
                     animate={{ 
                        y: step === "dispensing" ? [ -100, 0, -20, 0 ] : (step === "opened" ? 0 : -50),
                        opacity: step === "dispensing" || step === "opened" ? 1 : 0,
                        scale: step === "opened" ? 0 : 1
                     }}
                     transition={{ duration: 1.5 }}
                  >
                     <Heart size={16} className="text-white opacity-50" />
                  </motion.div>
               </div>
            </div>

         </div>

         {/* Interactive UI Overlays */}
         <AnimatePresence>
            {step === "insert_coin" && (
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute bottom-12 flex flex-col items-center"
               >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 animate-pulse">
                     Drag coin into slot
                  </p>
                  <motion.div
                     drag
                     dragSnapToOrigin
                     onDragEnd={handleCoinDragEnd}
                     className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-yellow-500 shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                  >
                     <Coins size={32} className="text-yellow-600" />
                  </motion.div>
               </motion.div>
            )}

            {step === "turn_crank" && (
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute bottom-12 flex flex-col items-center pointer-events-none"
               >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 animate-pulse">
                     Turn the crank right
                  </p>
               </motion.div>
            )}

            {step === "opened" && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 50 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
               >
                  <Sparkles size={48} className="text-yellow-400 mb-6 drop-shadow-md" />
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 max-w-sm" style={{ borderColor: primaryColor }}>
                     <h2 className="text-2xl font-black text-slate-800 leading-tight">
                        "{result}"
                     </h2>
                  </div>
                  
                  <button 
                     onClick={() => setStep("insert_coin")}
                     className="mt-12 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                     Play Again
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
