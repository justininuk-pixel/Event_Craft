"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Point = { x: number; y: number };
type Line = { points: Point[] };
type ChainItem = 
  | { type: "prompt"; text: string }
  | { type: "drawing"; lines: Line[] };

export function WhisperDownTheLane({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [chain, setChain] = useState<ChainItem[]>([
    { type: "prompt", text: config.title || "A dog eating pizza" }
  ]);
  const [phase, setPhase] = useState<"draw" | "guess" | "revealed">("draw");
  const [currentLines, setCurrentLines] = useState<Line[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phase !== "draw") return;
    setIsDrawing(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentLines(prev => [...prev, { points: [{ x, y }] }]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || phase !== "draw") return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentLines(prev => {
      const newLines = [...prev];
      const currentLine = newLines[newLines.length - 1];
      if (currentLine) {
        currentLine.points.push({ x, y });
      }
      return newLines;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleSubmitDraw = () => {
    if (currentLines.length === 0) return;
    setChain(prev => [...prev, { type: "drawing", lines: currentLines }]);
    setCurrentLines([]);
    
    if (chain.length >= 4) {
       finishChain();
    } else {
       setPhase("guess");
    }
  };

  const handleSubmitGuess = () => {
    if (!currentGuess.trim()) return;
    setChain(prev => [...prev, { type: "prompt", text: currentGuess }]);
    setCurrentGuess("");
    
    if (chain.length >= 4) {
       finishChain();
    } else {
       setPhase("draw");
    }
  };

  const finishChain = () => {
    setPhase("revealed");
    setTimeout(() => {
       if (onComplete) onComplete();
    }, 1000);
  };

  const renderLines = (lines: Line[], stroke: string) => (
    <>
      {lines.map((line, i) => (
        <path
          key={i}
          d={`M ${line.points.map(p => `${p.x},${p.y}`).join(" L ")}`}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none"
      style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
    >
      
      {/* Top Bar showing chain length */}
      {phase !== "revealed" && (
         <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-black/10 backdrop-blur-sm">
            <span className="text-xs font-bold tracking-widest uppercase opacity-60">Turn {chain.length} of 5</span>
            <span className="text-xs font-bold tracking-widest uppercase bg-black/20 px-3 py-1 rounded-full">
               {phase === "draw" ? "DRAW THIS" : "GUESS THIS"}
            </span>
         </div>
      )}

      <AnimatePresence mode="wait">
         {phase === "draw" && (
            <motion.div
               key="draw-phase"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-20"
            >
               <h2 className="text-2xl font-bold mb-6 text-center shadow-sm">
                  {chain[chain.length - 1].type === "prompt" 
                     ? (chain[chain.length - 1] as any).text 
                     : "Draw..."}
               </h2>
               
               <div className="relative w-full max-w-md aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50 touch-none">
                  <svg
                     ref={svgRef}
                     className="w-full h-full cursor-crosshair touch-none"
                     onPointerDown={handlePointerDown}
                     onPointerMove={handlePointerMove}
                     onPointerUp={handlePointerUp}
                     onPointerLeave={handlePointerUp}
                  >
                     {renderLines(currentLines, primaryColor)}
                  </svg>
               </div>
               
               <button
                  onClick={handleSubmitDraw}
                  disabled={currentLines.length === 0}
                  className="mt-8 px-8 py-3 rounded-full font-bold text-white shadow-xl transition-transform active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
               >
                  SUBMIT DRAWING
               </button>
            </motion.div>
         )}

         {phase === "guess" && (
            <motion.div
               key="guess-phase"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-20"
            >
               <h2 className="text-2xl font-bold mb-6 text-center shadow-sm">
                  What is this?
               </h2>
               
               <div className="relative w-full max-w-md aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50 mb-8 pointer-events-none">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                     <g transform="scale(0.25)"> {/* Very rough scale adjustment for preview */}
                        {chain[chain.length - 1].type === "drawing" && 
                           renderLines((chain[chain.length - 1] as any).lines, primaryColor)
                        }
                     </g>
                  </svg>
               </div>
               
               <input
                  type="text"
                  value={currentGuess}
                  onChange={e => setCurrentGuess(e.target.value)}
                  placeholder="Type your guess here..."
                  className="w-full max-w-md px-6 py-4 rounded-2xl text-lg text-zinc-900 shadow-xl border-2 border-transparent focus:border-blue-500 outline-none text-center font-bold"
                  onKeyDown={e => e.key === "Enter" && handleSubmitGuess()}
               />
               
               <button
                  onClick={handleSubmitGuess}
                  disabled={!currentGuess.trim()}
                  className="mt-4 px-8 py-3 rounded-full font-bold text-white shadow-xl transition-transform active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
               >
                  SUBMIT GUESS
               </button>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed-phase"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute inset-0 overflow-y-auto pb-32 pt-20 px-8 flex flex-col items-center custom-scrollbar"
            >
               <h2 className="text-3xl font-black mb-12 text-center opacity-80">
                  The Whisper Chain
               </h2>
               
               <div className="w-full max-w-md flex flex-col gap-8">
                  {chain.map((item, idx) => (
                     <div key={idx} className="flex flex-col items-center bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-xl relative border border-white/30">
                        <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-md">
                           {idx + 1}
                        </span>
                        
                        {item.type === "prompt" && (
                           <div className="text-2xl font-bold text-center py-4 px-2 break-words max-w-full">
                              "{item.text}"
                           </div>
                        )}
                        
                        {item.type === "drawing" && (
                           <div className="w-full aspect-square bg-white rounded-xl shadow-inner overflow-hidden">
                              <svg viewBox="0 0 400 400" className="w-full h-full pointer-events-none">
                                 {renderLines(item.lines, primaryColor)}
                              </svg>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
               
               {/* Final Card Content */}
               <div className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl mt-12 flex flex-col items-center shadow-2xl border border-zinc-700 text-center">
                 {config.mediaUrl && (
                   <img 
                     src={config.mediaUrl} 
                     alt="Revealed" 
                     className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
                   />
                 )}
                 <h1 className="text-3xl font-heading mb-4" style={{ color: primaryColor }}>
                   {config.title}
                 </h1>
                 <p className="text-base font-body text-zinc-300 whitespace-pre-wrap max-w-sm">
                   {config.body}
                 </p>
               </div>
               
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
