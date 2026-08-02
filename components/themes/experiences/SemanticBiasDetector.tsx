"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, Loader2, Info } from "lucide-react";

export function SemanticBiasDetector({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSentences, setAnalyzedSentences] = useState<{text: string, type: "objective"|"hyperbolic"|"neutral"}[] | null>(null);

  const mockText = "The tech giant announced its highly anticipated new smartphone today. Critics claim the device is an absolute disaster that will completely ruin the company's reputation forever. However, the device features a new 5nm processor and a larger battery. Fans are already crying tears of joy over the unprecedented, magical design. It will retail for $999 starting next month.";

  const handleAnalyze = () => {
     const textToAnalyze = input.trim() || mockText;
     setIsAnalyzing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock semantic NLP extraction
     setTimeout(() => {
        // Split roughly by periods
        const sentences = textToAnalyze.match(/[^.!?]+[.!?]+/g) || [textToAnalyze];
        
        const results = sentences.map(s => {
           const lower = s.toLowerCase();
           let type: "objective"|"hyperbolic"|"neutral" = "neutral";
           
           if (lower.match(/disaster|ruin|forever|tears of joy|unprecedented|magical|absolutely|worst|best/)) {
              type = "hyperbolic";
           } else if (lower.match(/announced|features|processor|battery|retail|\$[0-9]/)) {
              type = "objective";
           }

           return { text: s, type };
        });

        setAnalyzedSentences(results);
        setIsAnalyzing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 50, 30]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-slate-50 text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-slate-200 flex justify-between items-center z-10 shrink-0 bg-white shadow-sm">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
            <ScanSearch size={16} className="text-blue-600" /> Semantic Bias Detector
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col p-6 w-full max-w-3xl mx-auto overflow-y-auto space-y-6">
         
         <AnimatePresence mode="wait">
            {!analyzedSentences && !isAnalyzing && (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start gap-3 text-sm text-slate-600 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                     <p>Paste a news article or opinion piece. The NLP engine will parse the semantic structure, highlighting hyperbolic, subjective statements in <span className="text-red-500 font-bold bg-red-100 px-1">Red</span> and objective, verifiable facts in <span className="text-blue-600 font-bold bg-blue-100 px-1">Blue</span>.</p>
                  </div>

                  <textarea 
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     placeholder={mockText}
                     className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-serif resize-none outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-shadow"
                  />

                  <button 
                     onClick={handleAnalyze}
                     className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors shadow-lg"
                  >
                     Run NLP Objectivity Analysis
                  </button>
               </motion.div>
            )}

            {isAnalyzing && (
               <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                     <ScanSearch size={64} className="text-slate-300" />
                     <motion.div 
                        className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                     />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Deconstructing Semantic Intent...</div>
               </motion.div>
            )}

            {analyzedSentences && !isAnalyzing && (
               <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200">
                  <h3 className="text-3xl font-black mb-8 border-b-4 border-slate-900 pb-4 inline-block">Analysis Complete</h3>
                  
                  <div className="text-xl md:text-2xl leading-loose font-serif text-slate-800">
                     {analyzedSentences.map((s, i) => (
                        <span 
                           key={i} 
                           className={`transition-colors duration-500 ${
                              s.type === "hyperbolic" ? "bg-red-200/60 text-red-900 border-b-2 border-red-400" :
                              s.type === "objective" ? "bg-blue-100/60 text-blue-900 border-b-2 border-blue-400" :
                              ""
                           }`}
                        >
                           {s.text}
                        </span>
                     ))}
                  </div>

                  <div className="mt-12 flex gap-6 text-xs uppercase tracking-widest font-bold font-sans border-t border-slate-200 pt-6">
                     <div className="flex items-center gap-2 text-red-600"><div className="w-4 h-4 bg-red-200 border-2 border-red-400" /> Subjective / Hyperbolic</div>
                     <div className="flex items-center gap-2 text-blue-600"><div className="w-4 h-4 bg-blue-100 border-2 border-blue-400" /> Objective Fact</div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
