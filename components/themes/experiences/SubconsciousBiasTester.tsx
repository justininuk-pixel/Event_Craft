"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Trial = {
   word: string;
   category: "Technical" | "Creative";
};

export function SubconsciousBiasTester({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const trials: Trial[] = [
     { word: "Algorithm", category: "Technical" },
     { word: "Painting", category: "Creative" },
     { word: "Python", category: "Technical" },
     { word: "Poetry", category: "Creative" },
     { word: "Database", category: "Technical" },
     { word: "Sculpture", category: "Creative" },
     // Ambiguous ones to measure hesitation
     { word: "Architecture", category: "Technical" }, 
     { word: "Design", category: "Creative" },
  ];

  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<{word: string, expected: string, chosen: string, timeMs: number}[]>([]);
  const [isCrosshair, setIsCrosshair] = useState(false); // Interstitial screen

  const renderTimeRef = useRef(0);

  const startTest = () => {
     setPhase("test");
     showCrosshairThenWord();
  };

  const showCrosshairThenWord = () => {
     setIsCrosshair(true);
     setTimeout(() => {
        setIsCrosshair(false);
        renderTimeRef.current = performance.now();
     }, 1000);
  };

  const handleChoice = (choice: "Technical" | "Creative") => {
     if (isCrosshair) return;
     const clickTime = performance.now();
     const deltaMs = clickTime - renderTimeRef.current;
     
     const trial = trials[currentTrialIndex];
     
     setResults(prev => [...prev, {
        word: trial.word,
        expected: trial.category,
        chosen: choice,
        timeMs: deltaMs
     }]);

     if (currentTrialIndex < trials.length - 1) {
        setCurrentTrialIndex(prev => prev + 1);
        showCrosshairThenWord();
     } else {
        setPhase("result");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (onComplete) setTimeout(onComplete, 8000);
     }
  };

  // Keyboard support for speed
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (phase === "test" && !isCrosshair) {
           if (e.key === "ArrowLeft") handleChoice("Creative");
           if (e.key === "ArrowRight") handleChoice("Technical");
        }
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 w-full">
         
         <AnimatePresence mode="wait">
            {phase === "intro" && (
               <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm">
                  <h2 className="text-3xl font-black uppercase tracking-widest mb-4 border-b-4 border-white inline-block pb-2">IAT</h2>
                  <p className="text-xs text-gray-400 mb-8">Implicit Association Test.</p>
                  <p className="text-sm font-bold mb-8">Sort the words as fast as possible. Do not think. Just react. We are measuring millisecond delays.</p>
                  <button onClick={startTest} className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Start Assessment</button>
               </motion.div>
            )}

            {phase === "test" && (
               <motion.div key="test" className="w-full h-full flex flex-col items-center justify-center relative">
                  
                  {/* Fixed Labels */}
                  <div className="absolute top-12 left-6 text-xl font-bold text-gray-500 uppercase tracking-widest">Left (Creative)</div>
                  <div className="absolute top-12 right-6 text-xl font-bold text-gray-500 uppercase tracking-widest">Right (Technical)</div>

                  <div className="flex-1 flex items-center justify-center">
                     {isCrosshair ? (
                        <div className="text-4xl text-gray-700 font-black">+</div>
                     ) : (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black uppercase tracking-widest">
                           {trials[currentTrialIndex].word}
                        </motion.div>
                     )}
                  </div>

                  {/* Touch buttons for mobile */}
                  <div className="w-full grid grid-cols-2 gap-4 h-32 p-6 md:hidden">
                     <button onClick={() => handleChoice("Creative")} className="bg-gray-900 border border-gray-700 text-white font-bold uppercase active:bg-gray-800">Creative</button>
                     <button onClick={() => handleChoice("Technical")} className="bg-gray-900 border border-gray-700 text-white font-bold uppercase active:bg-gray-800">Technical</button>
                  </div>
               </motion.div>
            )}

            {phase === "result" && (
               <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg">
                  <div className="text-center mb-8">
                     <h3 className="text-xl font-black uppercase tracking-widest border-b border-gray-800 pb-4">Hesitation Analysis</h3>
                  </div>

                  <div className="space-y-2">
                     <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-2 mb-4">
                        <div>Word</div>
                        <div>Assigned</div>
                        <div className="text-right">Response Time (Δt)</div>
                     </div>
                     
                     {results.map((r, i) => {
                        // Highlight long delays (> 800ms)
                        const isSlow = r.timeMs > 800;
                        const isWrong = r.chosen !== r.expected;
                        
                        return (
                           <div key={i} className={`grid grid-cols-3 text-sm p-2 border-l-2 ${isSlow ? 'bg-red-900/20 border-red-500 text-red-200' : isWrong ? 'bg-orange-900/20 border-orange-500 text-orange-200' : 'border-transparent text-gray-300'}`}>
                              <div className="font-bold">{r.word}</div>
                              <div className="text-xs">{r.chosen}</div>
                              <div className="text-right font-mono">{r.timeMs.toFixed(0)}ms</div>
                           </div>
                        )
                     })}
                  </div>

                  <div className="mt-8 p-4 border border-gray-800 bg-gray-900/50 text-xs text-gray-400">
                     <span className="text-white font-bold">Conclusion:</span> Significant temporal delay (saccade hesitation) on ambiguous pairings reveals cognitive friction during categorization.
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
