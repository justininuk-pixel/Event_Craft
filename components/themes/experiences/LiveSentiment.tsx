"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function LiveSentiment({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"viewing" | "revealed">("viewing");
  const [mySentiment, setMySentiment] = useState(50);
  const [history, setHistory] = useState<number[]>(Array(30).fill(50));
  
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const sentimentRef = useRef(mySentiment);
  useEffect(() => { sentimentRef.current = mySentiment; }, [mySentiment]);

  useEffect(() => {
    if (phase !== "viewing") return;

    let noise = 0;
    
    const interval = setInterval(() => {
      if (phaseRef.current !== "viewing") return;
      
      noise += (Math.random() - 0.5) * 5;
      noise *= 0.95;

      const userVal = sentimentRef.current;
      const crowdVal = 50 + noise;
      let nextAvg = (crowdVal * 0.8) + (userVal * 0.2);
      
      nextAvg = Math.max(0, Math.min(100, nextAvg));

      setHistory(prev => {
         const arr = [...prev, nextAvg];
         if (arr.length > 30) arr.shift();
         return arr;
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  const width = 1000;
  const height = 400;
  const padding = 50;
  
  let minV = Math.min(...history);
  let maxV = Math.max(...history);
  if (maxV - minV < 10) {
     const mid = (maxV + minV) / 2;
     minV = mid - 5;
     maxV = mid + 5;
  }
  
  const points = history.map((val, i) => {
     const x = (i / (history.length - 1)) * width;
     const normalized = (val - minV) / (maxV - minV);
     const y = (height - padding) - (normalized * (height - padding * 2));
     return `${x},${y}`;
  }).join(" ");

  const latestVal = history[history.length - 1] || 50;
  const prevVal = history[history.length - 2] || 50;
  const trend = latestVal >= prevVal ? "up" : "down";
  const trendColor = trend === "up" ? "#10b981" : "#ef4444";

  return (
    <div className="w-full h-full relative overflow-hidden bg-black touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-zinc-900/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-zinc-700"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-300 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "viewing" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col bg-zinc-950/80 backdrop-blur-sm p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            
            <div className="flex-1 flex flex-col mt-12">
               
               {/* Readout */}
               <div className="flex justify-between items-end px-8 mb-4">
                  <div>
                     <h2 className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-1">
                        Global Sentiment
                     </h2>
                     <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black font-mono transition-colors duration-1000" style={{ color: trendColor }}>
                           {latestVal.toFixed(1)}
                        </span>
                        <span className="text-2xl font-bold transition-colors duration-1000" style={{ color: trendColor }}>
                           {trend === "up" ? "▲" : "▼"}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Graph */}
               <div className="flex-1 relative w-full px-4 overflow-hidden mask-image-fade">
                  <svg 
                     viewBox={`0 0 ${width} ${height}`} 
                     className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000"
                  >
                     <polyline 
                        points={points}
                        fill="none"
                        stroke={trendColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-1000"
                     />
                     
                     <circle 
                        cx={width} 
                        cy={(height - padding) - (((latestVal - minV) / (maxV - minV)) * (height - padding * 2))} 
                        r="10" 
                        fill={trendColor}
                        className="transition-all duration-1000"
                     />
                  </svg>

                  <div className="absolute inset-0 border-b border-t border-zinc-800/50 pointer-events-none flex flex-col justify-between py-12">
                     <div className="border-b border-zinc-800/30 w-full" />
                     <div className="border-b border-zinc-800/30 w-full" />
                     <div className="border-b border-zinc-800/30 w-full" />
                  </div>
               </div>

               {/* Slider */}
               <div className="w-full px-8 py-12 pb-24">
                  <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">
                     Your Vibe
                  </h3>
                  <div className="flex items-center gap-4">
                     <span className="text-2xl">😴</span>
                     <input 
                        type="range"
                        min="0"
                        max="100"
                        value={mySentiment}
                        onChange={(e) => setMySentiment(parseFloat(e.target.value))}
                        className="flex-1 h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white outline-none"
                     />
                     <span className="text-2xl">🔥</span>
                  </div>
               </div>
            </div>

            <button
               onClick={handleReveal}
               className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold tracking-widest px-4 py-2"
            >
               SKIP
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
         .mask-image-fade {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
         }
      `}} />
    </div>
  );
}
