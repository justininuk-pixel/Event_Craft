"use client";

import React, { useState, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain } from "lucide-react";

const POSITIVE_WORDS = ["happy", "good", "great", "love", "awesome", "perfect", "excited", "joy", "peace", "beautiful", "best", "win"];
const NEGATIVE_WORDS = ["angry", "bad", "hate", "terrible", "worst", "sad", "mad", "upset", "frustrated", "lose", "stupid", "annoying"];
const STOP_WORDS = ["the", "and", "is", "in", "it", "to", "of", "a", "that", "i", "you", "my", "this", "for", "on", "was", "with"];

export function SentimentWordCloud({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [text, setText] = useState("I am so happy and excited today. The weather is beautiful and everything is perfect. Even though yesterday was terrible and I was angry, today is good.");
  const [analyzed, setAnalyzed] = useState(false);

  const wordData = useMemo(() => {
     if (!analyzed) return [];
     
     const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
     const freqs: Record<string, number> = {};
     
     words.forEach(w => {
        if (!w || STOP_WORDS.includes(w)) return;
        freqs[w] = (freqs[w] || 0) + 1;
     });

     // Convert to array and determine color based on sentiment dictionaries
     const data = Object.keys(freqs).map(w => {
        let color = "#64748b"; // neutral slate-500
        let sentiment = 0; // 0 neutral, 1 pos, -1 neg
        
        if (POSITIVE_WORDS.includes(w)) {
           color = "#10b981"; // emerald-500
           sentiment = 1;
        } else if (NEGATIVE_WORDS.includes(w)) {
           color = "#ef4444"; // red-500
           sentiment = -1;
        }

        return { word: w, count: freqs[w], color, sentiment };
     });

     return data.sort((a, b) => b.count - a.count).slice(0, 30); // Top 30 words
  }, [text, analyzed]);

  const handleAnalyze = () => {
     setAnalyzed(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 pb-0 z-20 flex justify-between items-center">
         <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <CloudRain size={20} className="text-slate-400" />
            Vibe Check
         </h2>
      </div>

      <div className="flex-1 flex flex-col relative z-10 p-6">
         
         <AnimatePresence mode="wait">
            {!analyzed ? (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                  <textarea 
                     value={text}
                     onChange={e => setText(e.target.value)}
                     className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none outline-none text-slate-700 leading-relaxed focus:border-blue-300 transition-colors"
                     placeholder="Paste journal entry here..."
                  />
                  <button 
                     onClick={handleAnalyze}
                     className="mt-4 py-4 w-full bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                  >
                     Analyze Sentiment
                  </button>
               </motion.div>
            ) : (
               <motion.div key="cloud" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 relative flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  
                  {/* Word Cloud Container */}
                  <div className="relative w-full h-full flex flex-wrap content-center justify-center p-4 gap-2">
                     {wordData.map((item, i) => {
                        // Math to scatter them slightly but keep centered
                        const scale = 1 + (item.count - 1) * 0.5; // size multiplier
                        const rotation = Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? 90 : -90; // sometimes rotate
                        
                        return (
                           <motion.span 
                              key={item.word}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05, type: "spring" }}
                              className="font-black inline-block mix-blend-multiply"
                              style={{ 
                                 fontSize: `${Math.max(14, scale * 16)}px`, 
                                 color: item.color,
                                 opacity: 0.7 + (item.count * 0.1) // more freq = more opaque
                              }}
                           >
                              {item.word}
                           </motion.span>
                        );
                     })}
                  </div>
                  
                  {/* Sentiment Bar */}
                  <motion.div 
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 1 }}
                     className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-xl flex justify-between items-center border border-slate-100"
                  >
                     <div className="flex gap-2">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full" /><span className="text-[10px] font-bold text-slate-500">Positive</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-500 rounded-full" /><span className="text-[10px] font-bold text-slate-500">Neutral</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-[10px] font-bold text-slate-500">Negative</span></div>
                     </div>
                  </motion.div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
