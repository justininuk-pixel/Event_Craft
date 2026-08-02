"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

interface Firefly {
   x: number;
   y: number;
   basePhase: number;      // Natural frequency starting phase
   frequency: number;      // Intrinsic frequency (omega)
   currentPhase: number;   // Current phase in the cycle
   radius: number;
}

export function FireflySync({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const animationRef = useRef<number>(0);
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [globalBrightness, setGlobalBrightness] = useState(0);
  const [couplingSpeed, setCouplingSpeed] = useState(0.02); // 0.02 takes ~45-60s

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#facc15"; // Yellow 400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // Slate 950

  useEffect(() => {
     if (!canvasRef.current) return;
     const canvas = canvasRef.current;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     // Setup Canvas
     const resize = () => {
        const parent = canvas.parentElement;
        canvas.width = parent?.clientWidth || 320;
        canvas.height = parent?.clientHeight || 480;
     };
     window.addEventListener("resize", resize);
     resize();

     // Initialize Fireflies (~150)
     const numFireflies = canvas.width > 500 ? 150 : 80;
     firefliesRef.current = Array.from({ length: numFireflies }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        basePhase: Math.random() * Math.PI * 2,
        frequency: (Math.random() * 0.5 + 0.5) * 2, // Speed of blinking
        currentPhase: Math.random() * Math.PI * 2,
        radius: Math.random() * 2 + 1
     }));

     let lastTime = performance.now();
     let hasSignaledCompletion = false;

     // Kuramoto Model Update Loop
     const render = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        // Clear canvas with slight trail effect
        ctx.fillStyle = `rgba(0,0,0, 0.2)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const fireflies = firefliesRef.current;
        
        // Calculate Mean Phase (Order Parameter)
        let sumSin = 0;
        let sumCos = 0;
        for (let i = 0; i < fireflies.length; i++) {
           sumSin += Math.sin(fireflies[i].currentPhase);
           sumCos += Math.cos(fireflies[i].currentPhase);
        }
        
        const meanPhase = Math.atan2(sumSin / fireflies.length, sumCos / fireflies.length);
        const orderParameter = Math.sqrt(
           Math.pow(sumSin / fireflies.length, 2) + Math.pow(sumCos / fireflies.length, 2)
        );

        // Update Global Brightness based on alignment
        // If order parameter is high (>0.9), they are mostly flashing together
        // The meanPhase determines when the actual "flash" occurs in the cycle
        const synchronizedFlash = Math.max(0, Math.sin(meanPhase));
        
        // Let the global brightness track the synchronicity * the flash
        const currentGlobalBrightness = orderParameter * synchronizedFlash;
        setGlobalBrightness(currentGlobalBrightness);

        // Check for reveal threshold
        if (orderParameter > 0.95 && synchronizedFlash > 0.9 && !hasSignaledCompletion) {
           hasSignaledCompletion = true;
           setIsRevealed(true);
    onComplete?.();
           if (onComplete) {
              setTimeout(onComplete, 8000); // 8 seconds after unison
           }
        }

        // Draw and Update Fireflies
        for (let i = 0; i < fireflies.length; i++) {
           const f = fireflies[i];
           
           // Kuramoto Model Equation: dPhase/dt = NaturalFreq + (Coupling / N) * sum(sin(Phase_j - Phase_i))
           // Simplified to mean field: Coupling * orderParam * sin(meanPhase - Phase_i)
           const couplingEffect = couplingSpeed * Math.sin(meanPhase - f.currentPhase);
           f.currentPhase += (f.frequency + couplingEffect) * dt;

           // Keep in 0-2PI bounds
           f.currentPhase = f.currentPhase % (Math.PI * 2);

           // Draw Firefly
           const brightness = Math.max(0, Math.sin(f.currentPhase));
           const alpha = Math.pow(brightness, 3); // Sharper blinks
           
           ctx.beginPath();
           ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
           ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`; // Yellow-ish
           ctx.shadowBlur = alpha * 15;
           ctx.shadowColor = "rgba(250, 204, 21, 1)";
           ctx.fill();

           // Drift slowly
           f.x += Math.sin(time / 1000 + i) * 0.2;
           f.y += Math.cos(time / 1500 + i) * 0.2;
           
           // Wrap
           if (f.x < 0) f.x = canvas.width;
           if (f.x > canvas.width) f.x = 0;
           if (f.y < 0) f.y = canvas.height;
           if (f.y > canvas.height) f.y = 0;
        }

        animationRef.current = requestAnimationFrame(render);
     };

     animationRef.current = requestAnimationFrame(render);

     return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationRef.current);
     };
  }, [couplingSpeed, onComplete]);


  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* The Firefly Canvas */}
      <canvas 
         ref={canvasRef} 
         className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
      />

      {/* The Payload (Revealed by global brightness) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
         
         <motion.div 
            className="text-center max-w-3xl mix-blend-plus-lighter"
            style={{ opacity: isRevealed ? 1 : globalBrightness * 0.8 }} // Flash with the swarm, lock on reveal
            animate={isRevealed ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 1 }}
         >
            <h1 
               className="text-5xl md:text-7xl font-bold tracking-tight mb-8" 
               style={{ 
                  color: primaryColor,
                  textShadow: `0 0 40px ${primaryColor}` 
               }}
            >
               {config.title}
            </h1>
            
            <p className="text-xl md:text-3xl font-serif leading-relaxed text-white/90">
               {config.body}
            </p>
         </motion.div>

      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && !isRevealed && (
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Kuramoto Coupling
            </h2>
            <div className="flex w-full items-center gap-4">
               <span className="text-zinc-500 text-xs font-mono">Slow</span>
               <input 
                  type="range" 
                  min="0.01" 
                  max="1.0" 
                  step="0.01"
                  value={couplingSpeed} 
                  onChange={(e) => setCouplingSpeed(parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400"
               />
               <span className="text-zinc-500 text-xs font-mono">Fast</span>
            </div>
            <div className="text-[9px] text-zinc-500 mt-3 text-center uppercase tracking-widest">
               Higher coupling forces immediate synchronization
            </div>
         </div>
      )}
      
    </div>
  );
}
