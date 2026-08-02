"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Copy, CheckCircle } from "lucide-react";

const AGGRESSIVE_WORDS = ["hate", "stupid", "idiot", "worst", "terrible", "never", "always", "furious", "angry", "disgusting", "pathetic", "dumb"];

export function ToneChecker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafafa"]; // neutral-50

  const title = config.title || "Pre-Flight Check";
  
  const [text, setText] = useState("This is absolutely terrible! I am so angry and furious. You always do this and it's stupid.");
  const [score, setScore] = useState(0); // 0 to 100 aggressiveness
  const [copied, setCopied] = useState(false);

  // Simple NLP scoring
  useEffect(() => {
     let tempScore = 0;
     const words = text.toLowerCase().split(/\W+/);
     
     // Count aggressive words
     const aggCount = words.filter(w => AGGRESSIVE_WORDS.includes(w)).length;
     tempScore += aggCount * 15;

     // Count ALL CAPS words
     const capsCount = text.split(/\W+/).filter(w => w.length > 2 && w === w.toUpperCase()).length;
     tempScore += capsCount * 10;

     // Count Exclamation points
     const exclamCount = (text.match(/!/g) || []).length;
     tempScore += exclamCount * 10;

     setScore(Math.min(tempScore, 100));
  }, [text]);

  const threshold = 40;
  const isAggressive = score >= threshold;

  const handleCopy = () => {
     if (isAggressive) return; // Blocked

     navigator.clipboard.writeText(text);
     setCopied(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     setTimeout(() => setCopied(false), 2000);

     if (onComplete) setTimeout(onComplete, 3000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-neutral-50 text-neutral-900 p-6" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="text-center z-10 mb-6">
         <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-800">{title}</h2>
         <p className="text-xs text-neutral-500 mt-1 font-medium">Draft your email. We'll check the tone.</p>
      </div>

      <div className="flex-1 flex flex-col relative z-10 space-y-6">
         
         {/* Input Area */}
         <div className="flex-1 relative flex flex-col">
            <textarea 
               value={text}
               onChange={e => setText(e.target.value)}
               className={`flex-1 w-full p-4 rounded-xl border-2 resize-none outline-none leading-relaxed transition-colors duration-500 ${
                  isAggressive ? 'bg-red-50/50 border-red-200 text-red-900 focus:border-red-400' : 'bg-white border-neutral-200 text-neutral-700 focus:border-blue-300'
               }`}
            />

            {/* Alert Overlay */}
            <AnimatePresence>
               {isAggressive && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="absolute -top-3 left-4 bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm"
                  >
                     <ShieldAlert size={14} /> Tone Too Aggressive
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Score Meter */}
         <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-end mb-2">
               <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Hostility Index</span>
               <span className={`text-xl font-black ${isAggressive ? 'text-red-500' : 'text-emerald-500'}`}>{score}</span>
            </div>
            
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden relative">
               {/* Threshold Marker */}
               <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: `${threshold}%` }} />
               
               <motion.div 
                  className={`h-full rounded-full transition-colors duration-500 ${isAggressive ? 'bg-red-500' : 'bg-emerald-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
               />
            </div>
            {isAggressive && (
               <p className="text-[10px] text-red-500 mt-2 font-medium">Score exceeds {threshold}. Please soften your language.</p>
            )}
         </div>

         {/* Copy Action */}
         <button 
            onClick={handleCopy}
            disabled={isAggressive}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
               isAggressive 
               ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300' 
               : copied 
                 ? 'bg-emerald-500 text-white shadow-lg'
                 : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 shadow-xl'
            }`}
         >
            {copied ? <><CheckCircle size={18} /> Copied to Clipboard</> : <><Copy size={18} /> Copy to Clipboard</>}
         </button>

      </div>

    </div>
  );
}
