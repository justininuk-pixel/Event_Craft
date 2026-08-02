"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Play } from "lucide-react";

export function MonteCarloSimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const goalName = config.title || "Retire by 50";
  const targetAmount = 1000000;
  const initialAmount = 100000;
  const years = 20;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successRate, setSuccessRate] = useState<number | null>(null);

  const numSimulations = 1000;
  
  const runSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    setSuccessRate(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentSim = 0;
    let successes = 0;
    const simsPerFrame = 25; // How many lines to draw per frame

    const drawFrame = () => {
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1;

      for (let s = 0; s < simsPerFrame; s++) {
        if (currentSim >= numSimulations) break;

        let balance = initialAmount;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - (balance / (targetAmount * 1.5)) * canvas.height);

        for (let y = 1; y <= years; y++) {
           // Random return between -5% and 15%
           const returnRate = (Math.random() * 0.20) - 0.05;
           balance = balance * (1 + returnRate) + 12000; // adding 12k/yr

           const x = (y / years) * canvas.width;
           const cy = canvas.height - (balance / (targetAmount * 1.5)) * canvas.height;
           ctx.lineTo(x, cy);
        }

        if (balance >= targetAmount) {
           successes++;
           ctx.strokeStyle = primaryColor; // Green for success
        } else {
           ctx.strokeStyle = "#ef4444"; // Red for failure
        }
        
        ctx.stroke();
        currentSim++;
      }

      setProgress(currentSim / numSimulations);

      if (currentSim < numSimulations) {
         requestAnimationFrame(drawFrame);
      } else {
         setIsRunning(false);
         setSuccessRate(successes / numSimulations);
         if (onComplete) setTimeout(onComplete, 4000);
         if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    };

    requestAnimationFrame(drawFrame);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-900 text-slate-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-800 flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur">
         <div>
            <h2 className="text-lg font-black text-white">{goalName}</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Monte Carlo Simulation</p>
         </div>
         <Calculator size={24} className="text-slate-600" />
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
         
         {/* The Canvas Graph */}
         <div className="w-full h-64 bg-slate-800/50 rounded border border-slate-700 relative overflow-hidden shadow-inner">
            
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />

            {/* Target Line */}
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500/50 pointer-events-none z-10" style={{ top: '33.33%' }} />
            <div className="absolute left-2 text-[10px] text-emerald-500 font-bold z-10" style={{ top: 'calc(33.33% - 14px)' }}>Target: $1M</div>

            <canvas 
               ref={canvasRef}
               width={400} 
               height={300} 
               className="w-full h-full relative z-0"
            />
         </div>

         {/* Controls & Output */}
         <div className="w-full mt-8 flex flex-col items-center">
            {progress === 0 && !isRunning && successRate === null && (
               <button 
                 onClick={runSimulation}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded font-bold uppercase tracking-widest text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
               >
                 <Play size={16} /> Run 10,000 Sims
               </button>
            )}

            {isRunning && (
               <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-2 text-slate-400">
                     <span>Simulating...</span>
                     <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: `${progress * 100}%` }} />
                  </div>
               </div>
            )}

            <AnimatePresence>
               {successRate !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="text-center"
                  >
                     <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Probability of Success</div>
                     <div className="text-5xl font-black text-white" style={{ textShadow: `0 0 20px ${successRate > 0.5 ? '#10b981' : '#ef4444'}` }}>
                        {Math.round(successRate * 100)}%
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
