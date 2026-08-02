"use client";

import React, { useRef, useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Heart } from "lucide-react";

export function ApologyEraser({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // emerald-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // emerald-50

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isErased, setIsErased] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const apologyText = config.title || "I'm sorry I lost my temper.";
  const hiddenText = config.body || "Thank you for forgiving me. I love you.";

  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     // Resize canvas to match container
     const resize = () => {
        if (containerRef.current) {
           canvas.width = containerRef.current.clientWidth;
           canvas.height = containerRef.current.clientHeight;
           drawTopLayer();
        }
     };

     const drawTopLayer = () => {
        // Draw Chalkboard / Dirty Window
        ctx.fillStyle = "#1e293b"; // slate-800
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some noise/texture (simplified for performance)
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        for (let i = 0; i < 500; i++) {
           ctx.beginPath();
           ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
           ctx.fill();
        }

        // Draw Apology Text
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Simple word wrap
        const words = apologyText.split(' ');
        let line = '';
        let y = canvas.height / 2 - 40;
        const lineHeight = 40;
        
        for(let n = 0; n < words.length; n++) {
           const testLine = line + words[n] + ' ';
           const metrics = ctx.measureText(testLine);
           const testWidth = metrics.width;
           if (testWidth > canvas.width - 60 && n > 0) {
              ctx.fillText(line, canvas.width / 2, y);
              line = words[n] + ' ';
              y += lineHeight;
           }
           else {
              line = testLine;
           }
        }
        ctx.fillText(line, canvas.width / 2, y);
        
        // Instruction
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("RUB TO ERASE", canvas.width / 2, canvas.height - 40);
     };

     resize();
     window.addEventListener('resize', resize);
     return () => window.removeEventListener('resize', resize);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apologyText]);

  // Handle erasing
  const erase = (clientX: number, clientY: number) => {
     if (isErased) return;
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;
     
     const rect = canvas.getBoundingClientRect();
     const x = clientX - rect.left;
     const y = clientY - rect.top;

     ctx.globalCompositeOperation = "destination-out";
     ctx.beginPath();
     ctx.arc(x, y, 40, 0, Math.PI * 2, false);
     ctx.fill();

     // Check progress occasionally
     if (Math.random() < 0.1) checkCompletion();
  };

  const checkCompletion = () => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
     const data = imgData.data;
     let transparentPixels = 0;
     
     // Sample every 4th pixel for speed
     for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) transparentPixels++;
     }

     const totalPixels = data.length / 16;
     const percentClear = (transparentPixels / totalPixels) * 100;

     // 60% cleared is usually enough to reveal the message clearly
     if (percentClear > 60) {
        setIsErased(true);
        if (onComplete) {
           setTimeout(onComplete, 2000);
        }
     }
  };

  // Mouse & Touch events
  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
     setIsDrawing(true);
     if ('touches' in e) {
        erase(e.touches[0].clientX, e.touches[0].clientY);
     } else {
        erase(e.clientX, e.clientY);
     }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
     if (!isDrawing) return;
     if ('touches' in e) {
        erase(e.touches[0].clientX, e.touches[0].clientY);
     } else {
        erase(e.clientX, e.clientY);
     }
  };

  const handleUp = () => {
     setIsDrawing(false);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Bottom Layer: The positive hidden message */}
      <div 
         ref={containerRef}
         className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white"
      >
         <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isErased ? 1 : 0.9, opacity: isErased ? 1 : 0.5 }}
            transition={{ duration: 1 }}
         >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner" style={{ backgroundColor: bgColors[0], color: primaryColor }}>
               <Heart size={40} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800 mb-4">
               {hiddenText}
            </h2>
         </motion.div>
      </div>

      {/* Top Layer: The Chalkboard */}
      <canvas
         ref={canvasRef}
         className={`absolute inset-0 w-full h-full z-10 cursor-pointer transition-opacity duration-1000 ${isErased ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
         onMouseDown={handleDown}
         onMouseMove={handleMove}
         onMouseUp={handleUp}
         onMouseLeave={handleUp}
         onTouchStart={handleDown}
         onTouchMove={handleMove}
         onTouchEnd={handleUp}
         onTouchCancel={handleUp}
      />
      
      {/* Editor Bypass */}
      {mode === "editor-preview" && !isErased && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setIsErased(true)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               <RefreshCw size={10} /> Auto-Erase
            </button>
         </div>
      )}

    </div>
  );
}
