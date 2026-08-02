"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Globe, ArrowRight, RefreshCw } from "lucide-react";

export function TranslationTelephone({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog in the middle of a beautiful summer night.");
  const [history, setHistory] = useState<{lang: string, text: string}[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Mock translation pipeline showcasing linguistic degradation
  const runTelephone = () => {
     if (!input.trim() || isTranslating) return;
     
     setIsTranslating(true);
     setHistory([{ lang: "English (Original)", text: input }]);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     const sequence = [
        { lang: "Japanese", delay: 1000, text: "素早い茶色のキツネは、美しい夏の夜の真ん中で怠惰な犬を飛び越えます。" },
        { lang: "Swahili", delay: 2000, text: "Mbweha mwepesi wa kahawia anaruka juu ya mbwa mvivu katikati ya usiku mzuri wa majira ya joto." },
        { lang: "Russian", delay: 3000, text: "Быстрая коричневая лиса перепрыгивает через ленивую собаку посреди прекрасной летней ночи." },
        { lang: "English (Final)", delay: 4000, text: "A speedy coffee-colored wolf leaps above a dog without ambition during the center of a hot evening." }
     ];

     sequence.forEach((step, idx) => {
        setTimeout(() => {
           setHistory(prev => [...prev, { lang: step.lang, text: step.text }]);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
           
           if (idx === sequence.length - 1) {
              setIsTranslating(false);
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
              if (onComplete) setTimeout(onComplete, 8000);
           }
        }, step.delay);
     });
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-50 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-200 flex justify-between items-center z-10 bg-white shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Globe size={16} className="text-blue-500" /> Translation Telephone
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">
         
         {history.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">Input Text</label>
               <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full h-32 text-lg text-slate-700 outline-none resize-none bg-transparent placeholder:text-slate-300"
                  placeholder="Enter a nuanced sentence to put through the grinder..."
               />
               <button 
                  onClick={runTelephone}
                  disabled={!input.trim()}
                  className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex justify-center items-center gap-2"
               >
                  <RefreshCw size={16} /> Start Recursive Pipeline
               </button>
            </motion.div>
         ) : (
            <div className="space-y-4">
               {history.map((h, i) => {
                  const isFinal = h.lang.includes("(Final)");
                  const isOriginal = h.lang.includes("(Original)");
                  return (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-5 rounded-2xl border relative ${
                           isFinal ? 'bg-blue-50 border-blue-200 shadow-md' : 
                           isOriginal ? 'bg-white border-slate-200 shadow-sm' : 
                           'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                     >
                        {!isOriginal && (
                           <div className="absolute -top-3 left-6 bg-slate-50 text-slate-400 px-2 flex items-center gap-1">
                              <ArrowRight size={14} />
                           </div>
                        )}
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isFinal ? 'text-blue-500' : 'text-slate-400'}`}>
                           {h.lang}
                        </div>
                        <div className={`font-serif ${isFinal ? 'text-xl text-blue-900' : isOriginal ? 'text-xl text-slate-800' : 'text-lg italic'}`}>
                           {h.text}
                        </div>
                     </motion.div>
                  )
               })}

               {isTranslating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4">
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0.4s" }} />
                     </div>
                  </motion.div>
               )}
            </div>
         )}

      </div>

    </div>
  );
}
