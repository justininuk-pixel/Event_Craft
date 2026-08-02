"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, MousePointer2 } from "lucide-react";

export function BiometricConfidenceRater({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [phase, setPhase] = useState<"intro" | "question" | "result">("intro");
  
  const startTime = useRef(0);
  const hoverCount = useRef(0);
  const lastHoverTime = useRef(0);

  const [metrics, setMetrics] = useState({
     timeToClick: 0,
     hoverSwitches: 0,
     confidenceScore: 100
  });

  const question = "Which architectural pattern restricts direct DOM manipulation?";
  const options = ["MVC", "Flux", "REST", "SOAP"];

  const startQuiz = () => {
     setPhase("question");
     startTime.current = performance.now();
     hoverCount.current = 0;
  };

  const handleHover = (opt: string) => {
     const now = performance.now();
     if (now - lastHoverTime.current > 300) { // Debounce hovers
        hoverCount.current += 1;
        lastHoverTime.current = now;
     }
  };

  const handleAnswer = (opt: string) => {
     const endTime = performance.now();
     const deltaMs = endTime - startTime.current;
     
     // Calculate Confidence
     // Fast answer (< 2000ms) = High confidence. Slow (> 8000ms) = Low.
     // Many hovers = Low confidence.
     let score = 100;
     
     const timePenalty = Math.max(0, (deltaMs - 2000) / 100); // lose 1 point per 100ms over 2s
     const hoverPenalty = hoverCount.current * 5; // lose 5 points per hover switch
     
     score = Math.max(0, Math.min(100, 100 - timePenalty - hoverPenalty));

     setMetrics({
        timeToClick: deltaMs,
        hoverSwitches: hoverCount.current,
        confidenceScore: Math.round(score)
     });

     setPhase("result");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-blue-500" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="p-6 border-b border-blue-900/50 flex justify-between items-center z-10 bg-black/80 backdrop-blur">
         <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
            <BrainCircuit size={16} /> Biometric Analysis
         </h2>
         {phase === "question" && (
            <div className="text-[10px] font-mono text-red-500 animate-pulse">Recording Saccades...</div>
         )}
      </div>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
         
         <AnimatePresence mode="wait">
            {phase === "intro" ? (
               <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <MousePointer2 size={48} className="mx-auto mb-6 text-blue-600 opacity-50" />
                  <h3 className="text-xl font-black text-blue-300 mb-2">Confidence Rating</h3>
                  <p className="text-xs text-blue-700 mb-8 max-w-xs mx-auto">We measure hesitation. Answer quickly and definitively. Hovering indicates doubt.</p>
                  <button onClick={startQuiz} className="px-8 py-3 border border-blue-500 text-blue-400 uppercase tracking-widest font-bold text-xs hover:bg-blue-900/30 transition-colors">Begin Test</button>
               </motion.div>
            ) : phase === "question" ? (
               <motion.div key="q" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full">
                  <h3 className="text-xl font-bold text-blue-100 text-center mb-12">{question}</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {options.map((opt, i) => (
                        <button 
                           key={i}
                           onMouseEnter={() => handleHover(opt)}
                           onClick={() => handleAnswer(opt)}
                           className="p-6 border border-blue-800 bg-blue-950/20 hover:bg-blue-900/40 text-blue-300 text-lg font-bold transition-colors relative overflow-hidden group"
                        >
                           <div className="absolute inset-0 bg-blue-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform" />
                           {opt}
                        </button>
                     ))}
                  </div>
               </motion.div>
            ) : (
               <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center border border-blue-900 bg-black p-8 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500" />

                  <div className="text-[10px] uppercase text-blue-600 tracking-[0.2em] mb-8">Analysis Complete</div>
                  
                  <div className="flex justify-center items-end gap-2 mb-2">
                     <span className="text-6xl font-black text-blue-400">{metrics.confidenceScore}</span>
                     <span className="text-xl text-blue-700 font-bold mb-1">%</span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-blue-500 mb-8">Calculated Confidence</div>

                  <div className="space-y-2 text-left bg-blue-950/30 p-4 border border-blue-900/50">
                     <div className="flex justify-between text-xs text-blue-400">
                        <span>Reaction Time (Δt):</span>
                        <span className="font-mono text-blue-200">{metrics.timeToClick.toFixed(0)}ms</span>
                     </div>
                     <div className="flex justify-between text-xs text-blue-400">
                        <span>Cursor Hesitations:</span>
                        <span className="font-mono text-blue-200">{metrics.hoverSwitches}</span>
                     </div>
                  </div>
                  
                  {metrics.confidenceScore < 50 && (
                     <div className="mt-4 text-[10px] text-red-500 uppercase font-bold tracking-widest animate-pulse">High Hesitation Detected</div>
                  )}

               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
