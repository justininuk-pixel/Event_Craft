"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, Heart, Send } from "lucide-react";

export function ArgumentDiffuser({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // sky-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0f9ff"]; // sky-50

  const lockoutSeconds = 60; // 60 seconds
  const [state, setState] = useState<"idle" | "locked" | "unlocked">("idle");
  const [timeLeft, setTimeLeft] = useState(lockoutSeconds);
  const [message, setMessage] = useState("");

  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (state === "locked" && timeLeft > 0) {
        interval = setInterval(() => {
           setTimeLeft((prev) => {
              if (prev <= 1) {
                 setState("unlocked");
                 return 0;
              }
              // Editor preview speed up
              if (mode === "editor-preview") return prev - 10;
              return prev - 1;
           });
        }, 1000);
     }
     return () => clearInterval(interval);
  }, [state, timeLeft, mode]);

  const handleSend = () => {
     if (message.trim() && onComplete) {
        onComplete();
     }
  };

  const getBreathingInstruction = () => {
     // A standard breathing cycle might be 4s in, 4s hold, 4s out. Let's simplify to 4s in, 4s out = 8s total cycle.
     // Cycle index: (lockoutSeconds - timeLeft) % 8
     const elapsed = lockoutSeconds - timeLeft;
     const cyclePhase = elapsed % 8;
     if (cyclePhase < 4) return "Breathe In...";
     return "Breathe Out...";
  };

  const elapsed = lockoutSeconds - timeLeft;
  const cyclePhase = elapsed % 8;
  const isBreathingIn = cyclePhase < 4;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 transition-colors duration-1000"
      style={{ backgroundColor: state === "locked" ? primaryColor : bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto relative">
         
         <AnimatePresence mode="wait">
            {state === "idle" ? (
               <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-8 shadow-inner border border-red-200">
                     <AlertOctagon size={48} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4 text-slate-800">
                     {config.title || "I'm Mad at You."}
                  </h2>
                  <p className="text-sm font-medium text-slate-600 mb-12 max-w-[280px]">
                     {config.body || "It's okay to be angry. But before you write anything you might regret, let's take a minute."}
                  </p>

                  <button
                     onClick={() => setState("locked")}
                     className="w-full py-5 rounded-2xl font-black text-white text-xl shadow-[0_10px_0_rgba(185,28,28,1)] bg-red-500 hover:bg-red-400 active:translate-y-2 active:shadow-[0_2px_0_rgba(185,28,28,1)] transition-all uppercase tracking-widest"
                  >
                     I NEED TO VENT
                  </button>
               </motion.div>
            ) : state === "locked" ? (
               <motion.div 
                  key="locked"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center text-center text-white"
               >
                  {/* Breathing UI */}
                  <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                     <motion.div 
                        className="absolute inset-0 border-[4px] border-white/20 rounded-full"
                        animate={{ scale: isBreathingIn ? 1.2 : 0.8, opacity: isBreathingIn ? 1 : 0.5 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                     />
                     <motion.div 
                        className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/30"
                        animate={{ scale: isBreathingIn ? 1.5 : 1 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                     >
                        <Heart size={32} className="text-white opacity-80" fill="currentColor" />
                     </motion.div>
                  </div>

                  <h3 className="text-4xl font-black tracking-tighter mb-2">
                     {getBreathingInstruction()}
                  </h3>
                  <div className="text-white/60 font-medium uppercase tracking-widest text-xs mb-8">
                     Keyboard Locked
                  </div>

                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden max-w-[200px] mb-4">
                     <motion.div 
                        className="h-full bg-white"
                        animate={{ width: `${(timeLeft / lockoutSeconds) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                     />
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                     {timeLeft}s remaining
                  </div>

               </motion.div>
            ) : (
               <motion.div 
                  key="unlocked"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center"
               >
                  <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col">
                     <h3 className="text-xl font-black text-slate-800 mb-2">
                        Okay. I'm listening.
                     </h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        Keyboard Unlocked
                     </p>
                     
                     <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 mb-6"
                     />

                     <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        style={{ backgroundColor: primaryColor }}
                     >
                        <Send size={18} /> Send Message
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
