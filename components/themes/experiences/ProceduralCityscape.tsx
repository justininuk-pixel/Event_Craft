"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Building2 } from "lucide-react";

export function ProceduralCityscape({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#1e1b4b"; // indigo-950
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f97316"]; // orange-500 (sunset)

  const [density, setDensity] = useState(50); // 10-100
  const [age, setAge] = useState(0); // 0-100

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Deterministic random
  const seedRef = useRef(12345);
  const random = () => {
    const x = Math.sin(seedRef.current++) * 10000;
    return x - Math.floor(x);
  };

  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     let animationFrameId: number;

     const render = () => {
        // Reset seed for deterministic drawing based on current sliders
        seedRef.current = 12345;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const groundY = height * 0.9;

        // Draw ground
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, groundY, width, height - groundY);

        // Generate buildings based on density
        const buildingCount = Math.floor((density / 100) * 80) + 10;
        
        for (let i = 0; i < buildingCount; i++) {
           const bw = 20 + random() * 40;
           const bh = 50 + random() * 250;
           const bx = random() * width;
           const by = groundY - bh;

           ctx.fillStyle = primaryColor;
           ctx.fillRect(bx, by, bw, bh);

           // Degradation based on age
           if (age > 0) {
              const degradationFactor = age / 100;
              const ruinCount = Math.floor(bh * bw * 0.05 * degradationFactor);
              
              for (let j = 0; j < ruinCount; j++) {
                 // Clear chunks mostly from the top and sides to simulate decay
                 const rx = bx + random() * bw;
                 
                 // bias ruins towards top
                 const bias = random() * random(); 
                 const ry = by + (bias * bh);
                 
                 const rw = random() * 10 + 2;
                 const rh = random() * 10 + 2;

                 // Only clear if it's somewhat near the edge or if age is very high
                 if (rx < bx + 5 || rx > bx + bw - 5 || ry < by + 20 || age > 70) {
                     ctx.clearRect(rx, ry, rw, rh);
                 }
              }
           }
        }

        animationFrameId = requestAnimationFrame(render);
     };

     render();

     return () => {
        cancelAnimationFrame(animationFrameId);
     };
  }, [density, age, primaryColor]);

  const handleComplete = () => {
     if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-orange-500" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Sunset Gradient background if using default */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-rose-500 to-purple-800 opacity-80" />

      <div className="flex-1 relative">
         <canvas 
            ref={canvasRef}
            width={1000}
            height={600}
            className="w-full h-full object-cover touch-none relative z-10"
         />
         
         {/* Sun */}
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-sm z-0 opacity-80" />
      </div>

      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-md shrink-0 relative z-20 text-white space-y-6 border-t border-white/10">
         
         <div className="flex justify-between items-center border-b border-white/20 pb-4">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Building2 size={16} /> Procedural Skyline
            </h2>
            <button 
               onClick={handleComplete}
               className="text-[10px] uppercase font-bold tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
            >
               Finish
            </button>
         </div>

         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/70">
                  <span>Density (Array Length)</span>
                  <span>{density}</span>
               </div>
               <input 
                  type="range" 
                  min="10" max="100" 
                  value={density}
                  onChange={e => setDensity(Number(e.target.value))}
                  className="w-full accent-white h-2 bg-white/20 rounded-full appearance-none outline-none"
               />
            </div>

            <div className="flex-1 space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/70">
                  <span>Age (clearRect Masking)</span>
                  <span>{age}</span>
               </div>
               <input 
                  type="range" 
                  min="0" max="100" 
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-white/20 rounded-full appearance-none outline-none"
               />
            </div>
         </div>

      </div>

    </div>
  );
}
