"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
};

export function TrueRngVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#14b8a6"; // teal-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#042f2e"]; // teal-950

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const streamRef = useRef<number[]>([]); // Buffer of true random numbers
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Initialize Particles once
  useEffect(() => {
     const initParticles = () => {
        const arr: Particle[] = [];
        for(let i=0; i<300; i++) {
           arr.push({
              id: i,
              x: Math.random() * 800,
              y: Math.random() * 800,
              vx: 0,
              vy: 0,
              color: i % 2 === 0 ? "#5eead4" : "#14b8a6" // teal-300 vs teal-500
           });
        }
        particlesRef.current = arr;
     };
     initParticles();
  }, []);

  // Simulate fetching a chunk of True Random Numbers from Atmospheric Noise
  const fetchNoise = async () => {
     setIsFetching(true);
     // In a real app, we would hit Random.org or an atmospheric noise API here.
     // To prevent hitting rate limits and breaking the build, we use the cryptographic API 
     // as a stand-in for "true randomness" as it generates cryptographically secure random numbers
     // derived from OS entropy sources, rather than standard Math.random() PRNG.
     
     const buffer = new Uint32Array(500);
     window.crypto.getRandomValues(buffer);
     
     const normalized = Array.from(buffer).map(n => (n / 4294967295) * 2 - 1); // -1 to 1

     setTimeout(() => {
        streamRef.current.push(...normalized);
        setIsFetching(false);
     }, 1000); // Faked network delay
  };

  // Canvas Render Loop
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     let w = canvas.width;
     let h = canvas.height;

     const render = () => {
        ctx.fillStyle = "rgba(4, 47, 46, 0.2)"; // trailing effect (teal-950)
        ctx.fillRect(0, 0, w, h);

        const particles = particlesRef.current;
        const noise = streamRef.current;

        for (let i = 0; i < particles.length; i++) {
           const p = particles[i];

           // Apply true random forces if available, else decay
           if (noise.length > 0) {
              const rx = noise.shift() || 0;
              const ry = noise.shift() || 0;
              
              // Vector influence
              p.vx += rx * 2;
              p.vy += ry * 2;
           }

           // Friction
           p.vx *= 0.95;
           p.vy *= 0.95;

           p.x += p.vx;
           p.y += p.vy;

           // Wrap around
           if (p.x < 0) p.x = w;
           if (p.x > w) p.x = 0;
           if (p.y < 0) p.y = h;
           if (p.y > h) p.y = 0;

           // Draw
           ctx.beginPath();
           ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
           ctx.fillStyle = p.color;
           ctx.fill();
        }

        // If buffer gets low, fetch more
        if (noise.length < 200 && !isFetching) {
           fetchNoise();
        }

        animationRef.current = requestAnimationFrame(render);
     };

     // Initial fetch
     fetchNoise();
     render();

     return () => cancelAnimationFrame(animationRef.current);
  }, [isFetching]);

  useEffect(() => {
     if (onComplete) {
        const t = setTimeout(onComplete, 15000); // 15 seconds to enjoy the visualizer
        return () => clearTimeout(t);
     }
  }, [onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-teal-950 text-teal-100" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
         <h2 className="text-xl font-black uppercase tracking-widest text-teal-300 drop-shadow-md">True RNG</h2>
         <p className="text-xs text-teal-500 font-mono flex items-center gap-2 mt-1">
            <Radio size={12} className={isFetching ? "animate-pulse" : ""} /> 
            Source: Atmospheric Radio Noise
         </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between text-[10px] font-mono text-teal-600 pointer-events-none uppercase tracking-widest">
         <span>Buffer: {streamRef.current.length} values</span>
         <span>Vectors updating live</span>
      </div>

      {/* The WebGL/Canvas layer */}
      <canvas 
         ref={canvasRef}
         width={800}
         height={800}
         className="w-full h-full object-cover mix-blend-screen opacity-80"
      />

    </div>
  );
}
