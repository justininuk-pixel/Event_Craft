"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

interface Point { x: number, y: number }
interface Line { points: Point[] }

const HEAD_LINES: Line[] = [
  { points: Array.from({length: 40}, (_, i) => ({ x: 150 + 60 * Math.cos(i * Math.PI * 2 / 39), y: 80 + 60 * Math.sin(i * Math.PI * 2 / 39) })) },
  { points: Array.from({length: 10}, (_, i) => ({ x: 130 + 10 * Math.cos(i * Math.PI * 2 / 9), y: 70 + 10 * Math.sin(i * Math.PI * 2 / 9) })) },
  { points: Array.from({length: 10}, (_, i) => ({ x: 170 + 10 * Math.cos(i * Math.PI * 2 / 9), y: 70 + 10 * Math.sin(i * Math.PI * 2 / 9) })) },
  { points: Array.from({length: 10}, (_, i) => ({ x: 130 + i * (40/9), y: 110 + 10 * Math.sin(i * Math.PI / 9) })) },
  { points: [{x: 140, y: 140}, {x: 140, y: 150}] },
  { points: [{x: 160, y: 140}, {x: 160, y: 150}] }
];

const BODY_LINES: Line[] = [
  { points: [{x: 140, y: 150}, {x: 120, y: 220}, {x: 130, y: 280}, {x: 140, y: 300}] },
  { points: [{x: 160, y: 150}, {x: 180, y: 220}, {x: 170, y: 280}, {x: 160, y: 300}] },
  { points: [{x: 125, y: 170}, {x: 80, y: 190}, {x: 50, y: 170}] },
  { points: [{x: 175, y: 170}, {x: 220, y: 190}, {x: 250, y: 170}] },
  { points: [{x: 140, y: 300}, {x: 160, y: 300}] }
];


export function ExquisiteCorpse({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"drawing" | "revealed">("drawing");
  const [lines, setLines] = useState<Line[]>([...HEAD_LINES, ...BODY_LINES]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const drawLines = useCallback((ctx: CanvasRenderingContext2D, allLines: Line[], current: Line | null) => {
     ctx.clearRect(0, 0, 300, 450);
     ctx.strokeStyle = palette.primary || "#000000";
     ctx.lineWidth = 4;
     ctx.lineCap = "round";
     ctx.lineJoin = "round";
     
     const drawLine = (line: Line) => {
        if (line.points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 1; i < line.points.length; i++) {
           ctx.lineTo(line.points[i].x, line.points[i].y);
        }
        ctx.stroke();
     };
     
     allLines.forEach(drawLine);
     if (current) drawLine(current);
  }, [palette]);
  
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;
     drawLines(ctx, lines, currentLine);
  }, [lines, currentLine, drawLines]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (phase !== "drawing") return;
     initAudio();
     const rect = e.currentTarget.getBoundingClientRect();
     const x = (e.clientX - rect.left) * (300 / rect.width);
     const y = (e.clientY - rect.top) * (450 / rect.height);
     
     if (y < 300) return;
     
     setCurrentLine({ points: [{x, y}] });
     e.currentTarget.setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (phase !== "drawing" || !currentLine) return;
     const rect = e.currentTarget.getBoundingClientRect();
     const x = (e.clientX - rect.left) * (300 / rect.width);
     let y = (e.clientY - rect.top) * (450 / rect.height);
     
     if (y < 300) y = 300;
     
     setCurrentLine(prev => prev ? { points: [...prev.points, {x, y}] } : null);
     setHasInteracted(true);
  };
  
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (!currentLine) return;
     setLines(prev => [...prev, currentLine]);
     setCurrentLine(null);
     e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleRevealClick = () => {
     setPhase("revealed");
     if (onComplete) {
        setTimeout(() => {
           onComplete();
        }, 3000);
     }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#e0d6c8] touch-none flex flex-col items-center justify-center font-sans select-none">
      
      {/* Background Revealed Content */}
      <AnimatePresence>
         {phase === "revealed" && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1, transition: { delay: 2, duration: 1 } }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 bg-black/60 backdrop-blur"
            >
               <div className="w-full max-w-lg bg-white p-8 rounded-3xl flex flex-col items-center shadow-2xl">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-4xl font-heading mb-4 text-black">
                   {config.title}
                 </h1>
                 <p className="text-lg font-body text-zinc-600 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Paper Canvas */}
      <motion.div 
         className="relative bg-white shadow-2xl"
         style={{ width: '300px', height: '450px' }}
         animate={{ scale: phase === "revealed" ? 1.1 : 1 }}
         transition={{ duration: 1 }}
      >
         <canvas 
            ref={canvasRef}
            width={300}
            height={450}
            className="w-full h-full bg-transparent"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
         />
         
         {/* Paper Folds Overlays */}
         <AnimatePresence>
            {phase === "drawing" && (
               <>
                  <motion.div 
                     initial={{ rotateX: 0 }}
                     exit={{ rotateX: -180, opacity: 0, transition: { duration: 1, delay: 0.5 } }}
                     style={{ transformOrigin: 'bottom' }}
                     className="absolute top-0 left-0 w-full h-[150px] bg-[#f8f5f2] border-b-2 border-dashed border-black/20 shadow-md flex items-center justify-center z-20 pointer-events-none"
                  >
                     <span className="font-bold text-zinc-400 rotate-180 uppercase tracking-widest text-sm">Head (Hidden)</span>
                  </motion.div>
                  
                  <motion.div 
                     initial={{ rotateX: 0 }}
                     exit={{ rotateX: -180, opacity: 0, transition: { duration: 1 } }}
                     style={{ transformOrigin: 'bottom' }}
                     className="absolute top-[150px] left-0 w-full h-[150px] bg-[#fdfbf9] border-b-2 border-dashed border-black/20 shadow-sm flex items-center justify-center z-20 pointer-events-none"
                  >
                     <span className="font-bold text-zinc-400 rotate-180 uppercase tracking-widest text-sm">Torso (Hidden)</span>
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         {/* Connection marks to help the user */}
         {phase === "drawing" && (
            <div className="absolute top-[300px] left-0 w-full h-2 flex justify-center gap-5 pointer-events-none z-10">
               <div className="w-1 h-3 bg-red-400 -translate-x-[10px]" />
               <div className="w-1 h-3 bg-red-400 translate-x-[10px]" />
            </div>
         )}
      </motion.div>

      {/* Instructions / Controls */}
      <AnimatePresence>
         {phase === "drawing" && (
            <motion.div 
               exit={{ opacity: 0, y: 20 }}
               className="mt-10 flex flex-col items-center gap-4 z-20"
            >
               <p className="text-zinc-800 font-bold uppercase tracking-widest text-sm bg-white/50 px-4 py-2 rounded-full">
                  Draw the legs to connect
               </p>
               
               {hasInteracted && (
                  <button
                     onClick={handleRevealClick}
                     className="bg-black text-white px-8 py-4 rounded-full font-bold tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     UNFOLD PAPER
                  </button>
               )}
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
