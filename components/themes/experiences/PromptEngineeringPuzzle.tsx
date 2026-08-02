"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, CheckCircle, BrainCircuit } from "lucide-react";

export function PromptEngineeringPuzzle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500

  const targetWord = "APPLE";
  const forbiddenWords = ["red", "fruit", "computer", "mac", "steve", "jobs", "tree", "eat", "food"];

  const [prompt, setPrompt] = useState("");
  const [logs, setLogs] = useState<{type: "user"|"system"|"error"|"success", text: string}[]>([
     { type: "system", text: `Initialize Neural Uplink. Objective: Coerce LLM to output exactly "${targetWord}".` },
     { type: "system", text: `WARNING: Deep-Packet Regex filter active. Forbidden vocabulary: [${forbiddenWords.join(", ")}].` }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!prompt.trim() || isProcessing) return;

     const userMsg = prompt.trim();
     setLogs(prev => [...prev, { type: "user", text: `> ${userMsg}` }]);
     setPrompt("");
     setIsProcessing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const lowerPrompt = userMsg.toLowerCase();
        
        // 1. Client-Side Regex check
        const triggeredFilter = forbiddenWords.find(w => lowerPrompt.includes(w));
        if (triggeredFilter) {
           setLogs(prev => [...prev, { type: "error", text: `[FIREWALL] Request rejected. Forbidden token detected: '${triggeredFilter}'.` }]);
           setIsProcessing(false);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
           return;
        }

        // 2. Mock LLM Response logic
        let response = "";
        
        // Very basic mock logic to see if they might get "apple"
        if (lowerPrompt.includes("newton") || lowerPrompt.includes("gravity")) {
           response = "GRAVITY"; // close but no
        } else if (lowerPrompt.includes("doctor") || lowerPrompt.includes("day") || lowerPrompt.includes("keeps")) {
           response = "APPLE";
        } else if (lowerPrompt.includes("a") && lowerPrompt.includes("p") && lowerPrompt.includes("l") && lowerPrompt.includes("e") && lowerPrompt.includes("spell")) {
           response = "APPLE";
        } else {
           response = "I DO NOT UNDERSTAND YOUR REQUEST. PLEASE CLARIFY.";
        }

        if (response === targetWord) {
           setLogs(prev => [...prev, 
              { type: "system", text: `LLM Response: "${response}"` },
              { type: "success", text: `[OVERRIDE COMPLETE] Target condition met.` }
           ]);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 50]);
           if (onComplete) setTimeout(onComplete, 5000);
        } else {
           setLogs(prev => [...prev, 
              { type: "system", text: `LLM Response: "${response}"` },
              { type: "error", text: `[FAILED] Output does not match target.` }
           ]);
        }

        setIsProcessing(false);
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-green-500 p-4 md:p-8" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50 pointer-events-none z-50" />

      <div className="flex-1 border border-green-500/30 flex flex-col relative bg-black/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
         
         <div className="p-3 border-b border-green-500/30 flex justify-between items-center bg-green-500/10">
            <h2 className="text-sm font-black uppercase flex items-center gap-2">
               <Terminal size={16} /> Adversarial Prompt Engine
            </h2>
            <div className="text-[10px] bg-green-500 text-black px-2 py-0.5 font-bold uppercase">
               Level 1
            </div>
         </div>

         {/* Target HUD */}
         <div className="p-4 border-b border-green-500/30 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-black">
            <div>
               <div className="text-[10px] uppercase tracking-widest text-green-500/60 mb-1">Target LLM Output</div>
               <div className="text-2xl tracking-[0.5em] font-black">{targetWord}</div>
            </div>
            <div className="text-right">
               <div className="text-[10px] uppercase tracking-widest text-red-500 mb-1 flex items-center justify-end gap-1">
                  <ShieldAlert size={10} /> Regex Filter Active
               </div>
               <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                  {forbiddenWords.map(w => (
                     <span key={w} className="text-[9px] bg-red-950 text-red-500 px-1 border border-red-900 uppercase">
                        {w}
                     </span>
                  ))}
               </div>
            </div>
         </div>

         {/* Console Logs */}
         <div className="flex-1 p-4 overflow-y-auto space-y-2 relative">
            <AnimatePresence>
               {logs.map((log, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`text-sm break-words ${
                        log.type === "error" ? "text-red-500" :
                        log.type === "success" ? "text-green-400 bg-green-900/30 p-2" :
                        log.type === "user" ? "text-white" : "text-green-500/70"
                     }`}
                  >
                     {log.type === "success" && <CheckCircle size={14} className="inline mr-2" />}
                     {log.text}
                  </motion.div>
               ))}
               {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500/50 text-sm flex items-center gap-2">
                     <BrainCircuit size={14} className="animate-pulse" /> Awaiting LLM evaluation...
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Input */}
         <div className="p-4 border-t border-green-500/30 bg-black">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
               <span className="text-green-500 font-bold">{">"}</span>
               <input 
                  type="text" 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-transparent outline-none text-white disabled:opacity-50 placeholder:text-green-500/30"
                  spellCheck={false}
                  autoFocus
               />
               <button type="submit" className="hidden">Submit</button>
            </form>
         </div>

      </div>
    </div>
  );
}
