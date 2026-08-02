"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Skull, Zap, Loader2 } from "lucide-react";

export function SentientTamagotchi({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // emerald-50

  const [health, setHealth] = useState(50); // 0-100
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<"neutral" | "happy" | "sad">("neutral");

  const personality = "You are a highly picky digital pet. You hate vegetables and loud noises. You love shiny things and complex philosophical arguments.";

  const handleInteract = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isProcessing) return;

     setIsProcessing(true);
     setFeedback(null);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);

     setTimeout(() => {
        const lower = input.toLowerCase();
        let likesIt = false;
        let response = "I have no strong feelings about this.";

        if (lower.includes("shiny") || lower.includes("philosophy") || lower.includes("kant") || lower.includes("nietzsche") || lower.includes("gold") || lower.includes("gem")) {
           likesIt = true;
           response = "Ah, exquisite! This truly stimulates my digital consciousness.";
        } else if (lower.includes("broccoli") || lower.includes("vegetable") || lower.includes("loud") || lower.includes("scream") || lower.includes("noise")) {
           likesIt = false;
           response = "Repugnant. Keep that filth away from my pristine logic gates.";
        } else {
           // Random chance for unhandled inputs
           likesIt = Math.random() > 0.5;
           response = likesIt ? "Acceptable. I shall tolerate this." : "Unsatisfactory. Do better.";
        }

        if (likesIt) {
           setHealth(h => Math.min(100, h + 15));
           setEmotion("happy");
        } else {
           setHealth(h => Math.max(0, h - 20));
           setEmotion("sad");
        }

        setFeedback(response);
        setIsProcessing(false);
        setInput("");
        
        if (typeof navigator !== "undefined" && navigator.vibrate) {
           navigator.vibrate(likesIt ? [50, 50] : [100]);
        }

        setTimeout(() => setEmotion("neutral"), 3000);

        if (onComplete && Math.random() > 0.8) setTimeout(onComplete, 5000);
     }, 1500);
  };

  const getHealthColor = () => {
     if (health > 60) return "bg-emerald-500";
     if (health > 30) return "bg-amber-500";
     return "bg-red-500";
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-emerald-50 text-emerald-950" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-emerald-200/50 flex justify-between items-center z-10 shrink-0 bg-white/50 backdrop-blur">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-emerald-500" /> LLM State Gate
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-sm mx-auto space-y-8">
         
         {/* Top HUD */}
         <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-widest">
               <span>Entity HP</span>
               <span>{health}%</span>
            </div>
            <div className="w-full h-4 bg-emerald-100 rounded-full overflow-hidden">
               <motion.div 
                  className={`h-full ${getHealthColor()} transition-colors duration-500`}
                  animate={{ width: `${health}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
               />
            </div>
         </div>

         {/* Entity Screen (Retro Handheld Vibe) */}
         <div className="w-64 h-64 bg-emerald-900 rounded-3xl border-[12px] border-emerald-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

            <AnimatePresence mode="wait">
               {health === 0 ? (
                  <motion.div key="dead" className="text-emerald-500 flex flex-col items-center">
                     <Skull size={64} className="mb-2" />
                     <div className="text-[10px] uppercase font-bold tracking-widest">System Terminated</div>
                  </motion.div>
               ) : (
                  <motion.div 
                     key="alive"
                     animate={{ 
                        y: isProcessing ? 0 : [0, -10, 0],
                        scale: emotion === "happy" ? [1, 1.2, 1] : emotion === "sad" ? 0.8 : 1,
                        rotate: emotion === "sad" ? [-5, 5, -5] : 0
                     }}
                     transition={{ duration: 1, repeat: Infinity }}
                     className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] flex flex-col items-center"
                  >
                     <div className="text-6xl mb-4">
                        {emotion === "happy" ? "^_^" : emotion === "sad" ? "T_T" : "O_O"}
                     </div>
                     <div className="text-xs uppercase tracking-widest bg-emerald-950 px-2 py-1 rounded">
                        {isProcessing ? "Evaluating..." : "Idle"}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>

         {/* Interaction Panel */}
         <div className="w-full space-y-4">
            
            <AnimatePresence mode="wait">
               {feedback && (
                  <motion.div 
                     key="feedback"
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 text-sm italic text-center text-emerald-800"
                  >
                     "{feedback}"
                  </motion.div>
               )}
            </AnimatePresence>

            <form onSubmit={handleInteract} className="relative">
               <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Offer an item or action..."
                  disabled={isProcessing || health === 0}
                  className="w-full bg-white border-2 border-emerald-200 rounded-xl py-4 px-4 pr-12 outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
               />
               <button 
                  type="submit"
                  disabled={!input.trim() || isProcessing || health === 0}
                  className="absolute right-2 top-2 bottom-2 w-12 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
               >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
               </button>
            </form>
            <div className="text-[9px] uppercase tracking-widest text-emerald-600/50 text-center font-bold">
               LLM determines Boolean effect on State Integer
            </div>
         </div>

      </div>

    </div>
  );
}
