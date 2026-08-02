"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Mic, Loader2 } from "lucide-react";

export function PersonalizedMeditation({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const [stressor, setStressor] = useState("");
  const [phase, setPhase] = useState<"input" | "generating" | "meditating">("input");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const breathLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
     if (typeof window !== "undefined") {
        synthRef.current = window.speechSynthesis;
     }
     return () => {
        if (synthRef.current) synthRef.current.cancel();
        if (breathLoopRef.current) clearInterval(breathLoopRef.current);
     };
  }, []);

  const handleStart = (e: React.FormEvent) => {
     e.preventDefault();
     if (!stressor.trim() || phase !== "input") return;

     setPhase("generating");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM generation pipelined into TTS
     setTimeout(() => {
        const script = `I hear that you are stressed about ${stressor.toLowerCase()}. That is completely understandable. But for the next moment, we are going to let that go. Focus only on the air filling your lungs. Breathe in... and breathe out. The ${stressor.toLowerCase()} cannot harm you in this present moment.`;
        
        if (synthRef.current) {
           const utterance = new SpeechSynthesisUtterance(script);
           utterance.rate = 0.7; // Slow, calming
           utterance.pitch = 0.8;
           // Try to find a calming voice
           const voices = synthRef.current.getVoices();
           const femaleVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Female") || v.name.includes("Google US English"));
           if (femaleVoice) utterance.voice = femaleVoice;

           utterance.onend = () => {
              if (breathLoopRef.current) clearInterval(breathLoopRef.current);
              setPhase("input");
              setStressor("");
              if (onComplete) onComplete();
           };

           utteranceRef.current = utterance;
           synthRef.current.speak(utterance);
        }

        setPhase("meditating");
        
        // Start synced breathing animation
        let tick = 0;
        breathLoopRef.current = setInterval(() => {
           tick++;
           if (tick % 3 === 0) setBreathPhase("in");
           else if (tick % 3 === 1) setBreathPhase("hold");
           else setBreathPhase("out");
        }, 4000); // 4 seconds per phase
        
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);

     }, 2000);
  };

  const stopMeditation = () => {
     if (synthRef.current) synthRef.current.cancel();
     if (breathLoopRef.current) clearInterval(breathLoopRef.current);
     setPhase("input");
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-950 text-slate-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 mix-blend-screen">
         {/* Ambient background glow */}
         <div className="w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto z-10">
         
         <AnimatePresence mode="wait">
            
            {phase === "input" && (
               <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full space-y-8 text-center">
                  <div className="space-y-4">
                     <h1 className="text-3xl font-light text-slate-100">Personalized Guide</h1>
                     <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                        Tell the LLM exactly what is causing you stress. It will generate a tailored script and pipe it directly into a calming TTS engine.
                     </p>
                  </div>

                  <form onSubmit={handleStart} className="space-y-6 relative z-20">
                     <input 
                        type="text" 
                        value={stressor}
                        onChange={e => setStressor(e.target.value)}
                        placeholder="e.g. I have a math test tomorrow..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-4 px-6 text-center outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all text-slate-200 placeholder:text-slate-600 shadow-inner"
                     />
                     <button 
                        type="submit"
                        disabled={!stressor.trim()}
                        className="w-16 h-16 mx-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] disabled:shadow-none"
                     >
                        <Play size={20} fill="currentColor" className="ml-1" />
                     </button>
                  </form>
               </motion.div>
            )}

            {phase === "generating" && (
               <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                     <Loader2 size={40} className="animate-spin text-indigo-500 opacity-20" />
                     <Mic size={20} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                     <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Synthesizing Audio</div>
                     <div className="text-[10px] uppercase tracking-widest text-slate-600">Pipelining LLM to window.speechSynthesis...</div>
                  </div>
               </motion.div>
            )}

            {phase === "meditating" && (
               <motion.div key="meditating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center">
                  
                  {/* Breathing Orb */}
                  <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                     <motion.div 
                        className="absolute w-full h-full rounded-full border border-indigo-500/30"
                        animate={{ 
                           scale: breathPhase === "in" ? 1.5 : breathPhase === "out" ? 0.8 : 1.5,
                           opacity: breathPhase === "hold" ? 0.3 : 0.1
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                     />
                     <motion.div 
                        className="w-32 h-32 rounded-full bg-indigo-900/50 backdrop-blur-xl border border-indigo-500/50 shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center justify-center"
                        animate={{ 
                           scale: breathPhase === "in" ? 1.5 : breathPhase === "out" ? 0.8 : 1.5,
                           backgroundColor: breathPhase === "in" ? "rgba(49, 46, 129, 0.5)" : breathPhase === "out" ? "rgba(30, 27, 75, 0.5)" : "rgba(67, 56, 202, 0.5)"
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                     >
                        <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-200">
                           {breathPhase === "in" ? "Breathe In" : breathPhase === "hold" ? "Hold" : "Breathe Out"}
                        </div>
                     </motion.div>
                  </div>

                  <button 
                     onClick={stopMeditation}
                     className="px-6 py-2 rounded-full border border-slate-800 text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors flex items-center gap-2"
                  >
                     <Square size={12} fill="currentColor" /> End Session
                  </button>

               </motion.div>
            )}

         </AnimatePresence>

      </div>

    </div>
  );
}
