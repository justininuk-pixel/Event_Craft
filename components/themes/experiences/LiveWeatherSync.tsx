"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type WeatherState = "sunny" | "rainy" | "snowy" | "cloudy" | "loading";

const WEATHER_GRADIENTS: Record<WeatherState, string> = {
  loading: "linear-gradient(to bottom, #1e293b, #0f172a)",
  sunny: "linear-gradient(to bottom, #38bdf8, #bae6fd)",
  rainy: "linear-gradient(to bottom, #334155, #0f172a)",
  snowy: "linear-gradient(to bottom, #94a3b8, #cbd5e1)",
  cloudy: "linear-gradient(to bottom, #64748b, #94a3b8)",
};

export function LiveWeatherSync({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [weather, setWeather] = useState<WeatherState>("loading");
  const [simulatedWeather, setSimulatedWeather] = useState<WeatherState | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const textColor = Array.isArray(palette.text) ? palette.text[0] : palette.text || "#1e293b";

  useEffect(() => {
     // Mock API Fetch
     const timer = setTimeout(() => {
        const states: WeatherState[] = ["sunny", "rainy", "snowy", "cloudy"];
        const randomState = states[Math.floor(Math.random() * states.length)];
        setWeather(randomState);
     }, 1500);

     return () => clearTimeout(timer);
  }, []);

  const activeWeather = simulatedWeather || weather;

  useEffect(() => {
     if (activeWeather !== "loading" && onComplete) {
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
     }
  }, [activeWeather, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-all duration-[2000ms] flex flex-col items-center justify-center p-8"
      style={{ background: WEATHER_GRADIENTS[activeWeather] }} 
    >
      
      {/* Weather Particle Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <AnimatePresence mode="popLayout">
            
            {activeWeather === "sunny" && (
               <motion.div 
                  key="sun"
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute -top-12 -right-12 md:top-12 md:right-24 w-64 h-64 bg-amber-300 rounded-full blur-2xl opacity-60"
               />
            )}

            {activeWeather === "rainy" && (
               <motion.div key="rain" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 40 }).map((_, i) => (
                     <motion.div
                        key={`rain-${i}`}
                        className="absolute bg-blue-300/60 w-0.5 rounded-full"
                        style={{
                           left: `${Math.random() * 100}%`,
                           top: -20,
                           height: Math.random() * 30 + 20,
                        }}
                        animate={{
                           y: ['0vh', '120vh']
                        }}
                        transition={{
                           duration: Math.random() * 0.5 + 0.5,
                           repeat: Infinity,
                           ease: "linear",
                           delay: Math.random() * 2
                        }}
                     />
                  ))}
               </motion.div>
            )}

            {activeWeather === "snowy" && (
               <motion.div key="snow" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                     <motion.div
                        key={`snow-${i}`}
                        className="absolute bg-white rounded-full blur-[1px]"
                        style={{
                           left: `${Math.random() * 100}%`,
                           top: -20,
                           width: Math.random() * 6 + 2,
                           height: Math.random() * 6 + 2,
                           opacity: Math.random() * 0.6 + 0.4
                        }}
                        animate={{
                           y: ['0vh', '120vh'],
                           x: [0, Math.random() * 100 - 50, 0]
                        }}
                        transition={{
                           duration: Math.random() * 3 + 3,
                           repeat: Infinity,
                           ease: "linear",
                           delay: Math.random() * 5
                        }}
                     />
                  ))}
               </motion.div>
            )}

            {activeWeather === "cloudy" && (
               <motion.div key="clouds" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <motion.div
                        key={`cloud-${i}`}
                        className="absolute bg-slate-300/40 rounded-full blur-3xl"
                        style={{
                           left: `${Math.random() * 100}%`,
                           top: `${Math.random() * 40}%`,
                           width: Math.random() * 300 + 200,
                           height: Math.random() * 100 + 100,
                        }}
                        animate={{
                           x: ['-20vw', '20vw', '-20vw']
                        }}
                        transition={{
                           duration: Math.random() * 20 + 20,
                           repeat: Infinity,
                           ease: "linear"
                        }}
                     />
                  ))}
               </motion.div>
            )}
            
         </AnimatePresence>
      </div>

      {/* Content Layer (Glassmorphism to stand out from background) */}
      <AnimatePresence>
         {activeWeather !== "loading" ? (
            <motion.div 
               className="relative z-10 w-full max-w-2xl bg-white/20 backdrop-blur-xl border border-white/30 p-8 md:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-center"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               style={{ color: activeWeather === 'rainy' ? '#f1f5f9' : textColor }}
            >
               <div className="absolute top-4 right-6 text-[10px] uppercase tracking-widest opacity-50 font-bold font-mono">
                  Sync: {activeWeather}
               </div>

               <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter" style={{ color: activeWeather === 'rainy' ? '#bae6fd' : primaryColor }}>
                  {config.title}
               </h1>
               
               <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
                  {config.body}
               </p>
            </motion.div>
         ) : (
            <motion.div 
               className="relative z-10 text-white font-mono uppercase tracking-[0.3em] text-sm flex items-center gap-4"
               initial={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
               Syncing Metrological Data...
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/50 backdrop-blur-xl border border-white/10 p-4 flex flex-col items-center shadow-2xl z-50 rounded-2xl">
            <h2 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Override Weather Engine
            </h2>
            <div className="flex gap-2 w-full">
               {(["sunny", "rainy", "snowy", "cloudy"] as WeatherState[]).map(w => (
                  <button 
                     key={w}
                     className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                        activeWeather === w 
                           ? "bg-white/20 border-white text-white" 
                           : "bg-transparent border-white/20 text-white/60 hover:bg-white/10"
                     }`}
                     onClick={() => setSimulatedWeather(w)}
                  >
                     {w}
                  </button>
               ))}
               {simulatedWeather !== null && (
                  <button 
                     className="px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                     onClick={() => setSimulatedWeather(null)}
                     title="Reset to Random/API"
                  >
                     ✕
                  </button>
               )}
            </div>
         </div>
      )}
      
    </div>
  );
}
