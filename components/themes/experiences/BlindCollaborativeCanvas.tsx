"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Check, Eye } from "lucide-react";

export function BlindCollaborativeCanvas({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // indigo-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [isDrawing, setIsDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
     if (canvasRef.current) {
        const canvas = canvasRef.current;
        // High DPI canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
           ctx.scale(dpr, dpr);
           ctx.lineCap = "round";
           ctx.lineJoin = "round";
           ctx.strokeStyle = primaryColor;
           ctx.lineWidth = 4;
           ctxRef.current = ctx;
        }
     }
  }, [primaryColor]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
     if (isReady || isRevealed) return;
     setIsDrawing(true);
     draw(e);
  };

  const draw = (e: any) => {
     if (!isDrawing || !ctxRef.current || !canvasRef.current || isReady || isRevealed) return;
     
     const rect = canvasRef.current.getBoundingClientRect();
     let clientX, clientY;

     if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
     } else if (e.clientX && e.clientY) {
        clientX = e.clientX;
        clientY = e.clientY;
     } else {
        return;
     }

     const x = clientX - rect.left;
     const y = clientY - rect.top;

     // Restrict drawing to the left half (or right half depending on config)
     // Let's assume this user is assigned the LEFT half.
     if (x > rect.width / 2) {
        ctxRef.current.beginPath(); // Stop line if it crosses
        return;
     }

     if (e.type === "mousedown" || e.type === "touchstart" || e.type === "pointerdown") {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x, y);
     } else {
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
     }
  };

  const stopDrawing = () => {
     if (!isDrawing || isReady || isRevealed) return;
     setIsDrawing(false);
     if (ctxRef.current) ctxRef.current.beginPath();
  };

  const handleReady = () => {
     setIsReady(true);
     // Simulate partner finishing shortly after
     if (mode === "editor-preview") {
        setTimeout(() => setPartnerReady(true), 2000);
     }
  };

  const handleReveal = () => {
     setIsRevealed(true);
    onComplete?.();
     
     // Mock the partner's drawing by mirroring the left side to the right
     if (mode === "editor-preview" && canvasRef.current && ctxRef.current) {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Save current content
        const imageData = ctx.getImageData(0, 0, canvas.width / 2, canvas.height);
        
        // Flip and draw on right half
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width / 2;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext('2d');
        if (tCtx) {
           tCtx.putImageData(imageData, 0, 0);
           ctx.save();
           ctx.scale(-1, 1);
           // Draw mirrored (note scale -1 means X coordinates are inverted)
           ctx.drawImage(tempCanvas, -canvas.width / window.devicePixelRatio, 0, canvas.width / 2 / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
           ctx.restore();
        }
     }

     if (onComplete) setTimeout(onComplete, 4000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center p-6 relative z-10 w-full h-full">
         
         <div className="text-center mt-4 mb-6">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
               {config.title || "Draw our future house"}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
               {isRevealed ? "A masterpiece." : "You can only see your half."}
            </p>
         </div>

         {/* Canvas Container */}
         <div className="relative w-full max-w-sm aspect-square bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mx-auto">
            
            {/* The hidden right half overlay */}
            <AnimatePresence>
               {!isRevealed && (
                  <motion.div 
                     initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
                     className="absolute inset-y-0 right-0 w-1/2 bg-slate-100 border-l-2 border-dashed border-slate-300 flex items-center justify-center z-20 backdrop-blur-sm"
                  >
                     <div className="text-center p-4">
                        <Eye size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                           {partnerReady ? "Partner Ready" : "Partner Drawing..."}
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Left side indicator */}
            {!isRevealed && (
               <div className="absolute top-2 left-2 px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded z-20 pointer-events-none">
                  Your Half
               </div>
            )}

            <canvas
               ref={canvasRef}
               className="w-full h-full touch-none"
               style={{ width: '100%', height: '100%' }}
               onPointerDown={startDrawing}
               onPointerMove={draw}
               onPointerUp={stopDrawing}
               onPointerLeave={stopDrawing}
               onTouchStart={startDrawing}
               onTouchMove={draw}
               onTouchEnd={stopDrawing}
               onTouchCancel={stopDrawing}
            />

         </div>

         {/* Controls */}
         <div className="mt-8 flex flex-col items-center w-full max-w-sm gap-4">
            {!isReady ? (
               <button 
                  onClick={handleReady}
                  className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 uppercase tracking-widest text-sm"
                  style={{ backgroundColor: primaryColor }}
               >
                  <Check size={18} /> I'm Done
               </button>
            ) : !isRevealed ? (
               <button 
                  onClick={handleReveal}
                  disabled={!partnerReady}
                  className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm
                     ${partnerReady ? 'bg-indigo-500 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  style={partnerReady ? { backgroundColor: primaryColor } : {}}
               >
                  <Eye size={18} /> {partnerReady ? "Reveal Canvas" : "Waiting for partner..."}
               </button>
            ) : (
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2"
               >
                  <Paintbrush size={16} /> Art Complete
               </motion.div>
            )}
         </div>

      </div>

    </div>
  );
}
