"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudRain, Sun, CloudLightning, Search, Loader2 } from "lucide-react";

export function SentimentWeatherMap({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const [handle, setHandle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [weatherState, setWeatherState] = useState<"neutral" | "stormy" | "sunny" | "cloudy" | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
     e.preventDefault();
     if (!handle.trim() || isFetching) return;

     setIsFetching(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock fetching and sentiment analysis
     setTimeout(() => {
        setIsFetching(false);
        
        // Deterministic mock based on handle length to show different weathers
        const len = handle.length;
        let finalScore = 0;
        let state: any = "neutral";

        if (len < 5) {
           finalScore = -0.8;
           state = "stormy";
        } else if (len >= 5 && len < 9) {
           finalScore = 0.9;
           state = "sunny";
        } else {
           finalScore = -0.1;
           state = "cloudy";
        }

        setScore(finalScore);
        setWeatherState(state);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2500);
  };

  const getBackgroundClass = () => {
     switch (weatherState) {
        case "stormy": return "bg-slate-900";
        case "sunny": return "bg-sky-400";
        case "cloudy": return "bg-slate-400";
        default: return "bg-slate-800";
     }
  };

  return (
    <div className={`w-full h-full relative flex flex-col font-sans overflow-hidden select-none text-white transition-colors duration-1000 ${getBackgroundClass()}`}>
      
      {/* Weather Environmental Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         {weatherState === "sunny" && (
            <motion.div 
               className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full blur-[100px] opacity-80"
               animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
               transition={{ duration: 5, repeat: Infinity }}
            />
         )}

         {weatherState === "stormy" && (
            <>
               <div className="absolute inset-0 bg-slate-950/80" />
               {Array.from({length: 50}).map((_, i) => (
                  <motion.div 
                     key={i}
                     className="absolute w-0.5 bg-blue-400/40 h-20"
                     style={{ left: `${Math.random() * 100}%` }}
                     initial={{ top: -100 }}
                     animate={{ top: "120%" }}
                     transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() }}
                  />
               ))}
               <motion.div 
                  className="absolute inset-0 bg-white"
                  animate={{ opacity: [0, 0, 0.8, 0, 0, 0.3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.45, 0.5, 0.8, 0.85, 0.9] }}
               />
            </>
         )}

         {weatherState === "cloudy" && (
            <div className="absolute inset-0 flex items-start justify-center opacity-30 pt-10">
               <motion.div animate={{ x: [-50, 50, -50] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Cloud size={200} fill="currentColor" />
               </motion.div>
            </div>
         )}
      </div>

      <div className="p-6 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest drop-shadow-md">
            Sentiment Weather
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto z-10">
         
         <form onSubmit={handleAnalyze} className="w-full bg-black/30 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl relative">
            <label className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex items-center gap-2">
               Target Social Handle
            </label>
            <div className="flex items-center gap-2 bg-black/40 rounded-xl px-4 py-3">
               <span className="text-white/50">@</span>
               <input 
                  type="text" 
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  placeholder="username"
                  disabled={isFetching}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none w-full"
               />
            </div>

            <button 
               type="submit"
               disabled={!handle.trim() || isFetching}
               className="mt-6 w-full py-4 bg-white hover:bg-slate-200 disabled:bg-white/20 text-slate-900 disabled:text-white/50 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
            >
               {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
               {isFetching ? "Running NLP Analysis..." : "Fetch & Analyze"}
            </button>
         </form>

         <AnimatePresence>
            {weatherState && !isFetching && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 text-center"
               >
                  <div className="inline-block bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                     <div className="text-[10px] uppercase tracking-widest text-white/70 mb-2">Aggregate Sentiment Score</div>
                     <div className="text-4xl font-black">{score?.toFixed(2)}</div>
                     <div className="mt-2 text-sm font-medium opacity-80">
                        {weatherState === "stormy" && <span className="flex items-center justify-center gap-2 text-red-300"><CloudLightning size={16} /> Highly Negative / Angry</span>}
                        {weatherState === "sunny" && <span className="flex items-center justify-center gap-2 text-yellow-300"><Sun size={16} /> Highly Positive / Joyful</span>}
                        {weatherState === "cloudy" && <span className="flex items-center justify-center gap-2 text-slate-300"><Cloud size={16} /> Neutral / Ambiguous</span>}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
