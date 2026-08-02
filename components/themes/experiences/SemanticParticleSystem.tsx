"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Atom } from "lucide-react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export function SemanticParticleSystem({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState("");
  const [semantics, setSemantics] = useState({
     color: "#94a3b8", // slate-400
     gravityY: 0.1,
     spread: 2,
     speed: 2,
     category: "Neutral"
  });

  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Analyze word to map to physics
  const analyzeWord = (word: string) => {
     const lower = word.toLowerCase().trim();
     if (!lower) return;

     if (lower.match(/fire|burn|hot|flame|anger/)) {
        setSemantics({ color: "#ef4444", gravityY: -0.2, spread: 4, speed: 5, category: "Fire/Upward" });
     } else if (lower.match(/water|rain|cry|sea|ocean|drop/)) {
        setSemantics({ color: "#3b82f6", gravityY: 0.3, spread: 1, speed: 3, category: "Water/Heavy" });
     } else if (lower.match(/wind|air|breeze|fly|float/)) {
        setSemantics({ color: "#a7f3d0", gravityY: 0, spread: 8, speed: 6, category: "Air/Chaotic" });
     } else if (lower.match(/earth|stone|rock|heavy|solid/)) {
        setSemantics({ color: "#d97706", gravityY: 0.8, spread: 0.5, speed: 1, category: "Earth/Dense" });
     } else {
        setSemantics({ color: "#a855f7", gravityY: 0.1, spread: 2, speed: 2, category: "Neutral/Default" });
     }

     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  };

  // Canvas loop
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     let w = canvas.width;
     let h = canvas.height;

     const render = () => {
        ctx.fillStyle = "rgba(2, 6, 23, 0.2)"; // trailing
        ctx.fillRect(0, 0, w, h);

        const particles = particlesRef.current;
        const s = semantics;

        // Spawn new particles from center
        for(let i=0; i<3; i++) {
           particles.push({
              x: w/2,
              y: h/2,
              vx: (Math.random() - 0.5) * s.spread * s.speed,
              vy: (Math.random() - 0.5) * s.spread * s.speed,
              life: 1.0
           });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
           const p = particles[i];

           p.vy += s.gravityY;
           p.x += p.vx;
           p.y += p.vy;
           p.life -= 0.01;

           if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
              particles.splice(i, 1);
              continue;
           }

           ctx.beginPath();
           ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
           ctx.fillStyle = s.color;
           ctx.globalAlpha = p.life;
           ctx.fill();
           ctx.globalAlpha = 1.0;
        }

        animationRef.current = requestAnimationFrame(render);
     };

     render();

     return () => cancelAnimationFrame(animationRef.current);
  }, [semantics]);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     analyzeWord(input);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-slate-950 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <Atom size={16} /> Semantic Physics
            </h2>
            <div className="text-[10px] text-slate-500 mt-2 uppercase space-y-1">
               <div>Gravity Y: {semantics.gravityY.toFixed(2)}</div>
               <div>Vector Spread: {semantics.spread.toFixed(1)}</div>
               <div>Category: <span style={{color: semantics.color}}>{semantics.category}</span></div>
            </div>
         </div>
      </div>

      {/* Canvas */}
      <canvas 
         ref={canvasRef}
         width={800}
         height={800}
         className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Input Form */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center">
         <form onSubmit={handleSubmit} className="w-full max-w-xs relative">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Type a word (e.g. fire, rain, rock)"
               className="w-full bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-blue-500 shadow-2xl"
            />
         </form>
      </div>

    </div>
  );
}
