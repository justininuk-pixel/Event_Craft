"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, DollarSign } from "lucide-react";

export function ReverseAuction({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"]; // gray-900

  const [price, setPrice] = useState(100);
  const [winner, setWinner] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const priceRef = useRef(100);

  useEffect(() => {
     if (!isStarted || winner) return;

     const interval = setInterval(() => {
        if (priceRef.current <= 0) {
           clearInterval(interval);
           return;
        }
        priceRef.current -= 1;
        setPrice(priceRef.current);
     }, 100); // Super fast drop for demo purposes

     return () => clearInterval(interval);
  }, [isStarted, winner]);

  const handleStop = () => {
     if (!isStarted) {
        setIsStarted(true);
        return;
     }

     if (winner) return;

     setWinner("You"); // In a real app with websockets, this would be the specific user who hit it first
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
     if (onComplete) setTimeout(onComplete, 5000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-gray-900 text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black pointer-events-none" />

      <div className="p-6 text-center z-10 flex flex-col items-center pt-12">
         <Gavel size={32} className="text-rose-500 mb-4" />
         <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">Reverse Auction</h2>
         <p className="text-xs text-gray-500 mt-2 max-w-[250px] leading-relaxed">
            Price drops automatically. First to hit STOP chooses dinner, but pays the screen amount.
         </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
         
         <AnimatePresence mode="wait">
            {!winner ? (
               <motion.div 
                  key="counter"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
               >
                  <div className={`text-8xl font-black tabular-nums transition-colors ${isStarted ? 'text-white' : 'text-gray-600'}`}>
                     ${price}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="winner"
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="flex flex-col items-center text-center bg-rose-500 p-8 rounded-3xl shadow-[0_0_100px_rgba(244,63,94,0.5)] border-4 border-rose-400 w-64"
               >
                  <div className="text-[10px] uppercase tracking-widest font-bold text-rose-900 mb-2">Winner Locked</div>
                  <h3 className="text-4xl font-black mb-4">YOU PAY</h3>
                  <div className="text-6xl font-black bg-white text-rose-600 px-6 py-2 rounded-xl tabular-nums shadow-inner border-b-4 border-rose-200">
                     ${price}
                  </div>
                  <p className="text-sm font-bold text-rose-100 mt-6">You now dictate dinner.</p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      <div className="p-8 z-10">
         {!winner && (
            <button 
               onClick={handleStop}
               className={`w-full py-8 rounded-3xl font-black text-3xl tracking-widest transition-all ${
                  isStarted 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_20px_0_rgb(159,18,57)] active:translate-y-[20px] active:shadow-none' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_20px_0_rgb(21,128,61)] active:translate-y-[20px] active:shadow-none'
               }`}
            >
               {isStarted ? "STOP" : "START"}
            </button>
         )}
      </div>

    </div>
  );
}
