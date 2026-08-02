"use client";

import React, { useRef, useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { CloudRain } from "lucide-react";

export function TearsInRain({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWashedAway, setIsWashedAway] = useState(false);

  const message = config.title || "I'll never forget this moment.";

  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d", { willReadFrequently: true });
     if (!ctx) return;

     let animationFrameId: number;
     let width = 0;
     let height = 0;
     
     // Rain particles
     const particles: {x: number, y: number, speed: number, length: number}[] = [];
     const maxParticles = 100;

     // Blur pass counter
     let blurPasses = 0;

     const init = () => {
        if (containerRef.current) {
           width = containerRef.current.clientWidth;
           height = containerRef.current.clientHeight;
           canvas.width = width;
           canvas.height = height;
        }

        // Draw initial text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Word wrap
        const words = message.split(' ');
        let line = '';
        let y = height / 2 - 40;
        const lineHeight = 50;
        
        for(let n = 0; n < words.length; n++) {
           const testLine = line + words[n] + ' ';
           const metrics = ctx.measureText(testLine);
           if (metrics.width > width - 60 && n > 0) {
              ctx.fillText(line, width / 2, y);
              line = words[n] + ' ';
              y += lineHeight;
           } else {
              line = testLine;
           }
        }
        ctx.fillText(line, width / 2, y);

        // Initialize rain
        for (let i = 0; i < maxParticles; i++) {
           particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speed: Math.random() * 15 + 10,
              length: Math.random() * 20 + 10
           });
        }
     };

     const animate = () => {
        // We do NOT clear the canvas completely, to allow smudging
        // We draw a semi-transparent black rectangle to fade out the old text/rain slightly
        ctx.fillStyle = `rgba(15, 23, 42, 0.05)`; // fade to slate-900 slowly
        ctx.fillRect(0, 0, width, height);

        // Draw rain
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        let rainHitText = false;

        for (let i = 0; i < maxParticles; i++) {
           const p = particles[i];
           ctx.moveTo(p.x, p.y);
           ctx.lineTo(p.x, p.y + p.length);
           
           p.y += p.speed;
           
           if (p.y > height) {
              p.y = -p.length;
              p.x = Math.random() * width;
           }

           // Chance to "smudge" where rain falls
           if (Math.random() < 0.1 && blurPasses < 500) {
               rainHitText = true;
           }
        }
        ctx.stroke();

        // Apply a global blur over time to simulate washing away
        blurPasses++;
        if (blurPasses % 5 === 0 && blurPasses < 300) {
           ctx.filter = `blur(${Math.min(blurPasses/20, 15)}px)`;
           // Re-draw the canvas onto itself to lock in the blur
           ctx.drawImage(canvas, 0, 0);
           ctx.filter = "none";
        }

        if (blurPasses >= 300 && !isWashedAway) {
           setIsWashedAway(true);
           if (onComplete) {
              setTimeout(onComplete, 2000);
           }
        }

        animationFrameId = requestAnimationFrame(animate);
     };

     init();
     animate();

     return () => {
        cancelAnimationFrame(animationFrameId);
     };
  }, [message, isWashedAway, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Canvas */}
      <canvas
         ref={canvasRef}
         className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* Weather Icon (fades out as rain washes text away) */}
      <div className={`absolute top-6 left-6 z-20 text-slate-600 transition-opacity duration-[10000ms] ${isWashedAway ? 'opacity-0' : 'opacity-100'}`}>
         <CloudRain size={24} />
      </div>

    </div>
  );
}
