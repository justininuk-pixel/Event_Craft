"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type ElementType = "text" | "sticker";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content: string;
  author?: string;
  rotation: number;
}

const STICKERS = ["💖", "🔥", "✨", "🎉", "✌️", "⭐", "🎈"];
const MOCK_MESSAGES = ["Hello!", "I was here", "Amazing", "Greetings", "Love it", "Hi from Texas"];

export function DigitalGuestbook({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"signing" | "revealed">("signing");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType>("sticker");
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const movedSinceDown = useRef(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playSound = useCallback((type: "drop" | "pop") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === "drop") {
       osc.type = "sine";
       osc.frequency.setValueAtTime(800, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
       gain.gain.setValueAtTime(0.2, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
       osc.start();
       osc.stop(ctx.currentTime + 0.1);
    } else {
       osc.type = "triangle";
       osc.frequency.setValueAtTime(400, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
       gain.gain.setValueAtTime(0.2, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
       osc.start();
       osc.stop(ctx.currentTime + 0.1);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
  }, []);

  useEffect(() => {
    if (phase !== "signing") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "signing") return;
       
       const isSticker = Math.random() > 0.3;
       
       const x = (Math.random() - 0.5) * 2000;
       const y = (Math.random() - 0.5) * 2000;
       
       const newEl: CanvasElement = {
          id: Math.random().toString(),
          type: isSticker ? "sticker" : "text",
          x,
          y,
          content: isSticker 
             ? STICKERS[Math.floor(Math.random() * STICKERS.length)]
             : MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
          rotation: (Math.random() - 0.5) * 40
       };
       
       setElements(prev => [...prev, newEl]);
       
    }, 2500);

    return () => clearInterval(interval);
  }, [phase]);

  const handlePointerDown = (e: React.PointerEvent) => {
     if (phase !== "signing") return;
     if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.toolbar')) return;
     
     initAudio();
     isDragging.current = true;
     movedSinceDown.current = false;
     lastPointer.current = { x: e.clientX, y: e.clientY };
     (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     
     const dx = e.clientX - lastPointer.current.x;
     const dy = e.clientY - lastPointer.current.y;
     
     if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        movedSinceDown.current = true;
     }
     
     setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
     lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
     if (!isDragging.current) return;
     isDragging.current = false;
     (e.target as HTMLElement).releasePointerCapture(e.pointerId);
     
     if (!movedSinceDown.current) {
        handleTap(e.clientX, e.clientY);
     }
  };

  const handleTap = (clientX: number, clientY: number) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     
     const canvasX = clientX - rect.left - (rect.width / 2) - pan.x;
     const canvasY = clientY - rect.top - (rect.height / 2) - pan.y;
     
     let content = "";
     if (selectedTool === "sticker") {
        content = STICKERS[Math.floor(Math.random() * STICKERS.length)];
     } else {
        const msg = prompt("Enter a short message:");
        if (!msg) return;
        content = msg;
     }
     
     const newEl: CanvasElement = {
        id: Math.random().toString(),
        type: selectedTool,
        x: canvasX,
        y: canvasY,
        content,
        rotation: (Math.random() - 0.5) * 20
     };
     
     setElements(prev => [...prev, newEl]);
     setHasInteracted(true);
     playSound("drop");
  };

  const handleRevealClick = () => {
     setPhase("revealed");
     playSound("pop");
     if (onComplete) onComplete();
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#e5e5f7] touch-none select-none font-sans"
      style={{ backgroundImage: 'radial-gradient(#444cf7 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: `${pan.x}px ${pan.y}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10 pointer-events-none"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)'
        }}
      >
        <div className="w-full max-w-lg bg-white/90 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-indigo-100 shadow-2xl pointer-events-auto">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-indigo-50"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-indigo-900">
            {config.title}
          </h1>
          <p className="text-lg font-body text-indigo-700 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "signing" && (
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            
            {/* The Infinite Canvas Container */}
            <div 
               className="absolute top-1/2 left-1/2 w-0 h-0"
               style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
            >
               {elements.map(el => (
                  <motion.div
                     key={el.id}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className={`absolute whitespace-nowrap px-4 py-2 drop-shadow-md rounded-xl ${el.type === 'text' ? 'bg-white text-indigo-900 font-bold border-2 border-indigo-100 text-lg' : 'text-5xl drop-shadow-xl'}`}
                     style={{
                        left: el.x,
                        top: el.y,
                        transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                     }}
                  >
                     {el.content}
                  </motion.div>
               ))}
            </div>

            {/* Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full p-2 shadow-2xl border border-indigo-100 flex items-center gap-2 pointer-events-auto toolbar">
               <button
                  onClick={() => setSelectedTool("sticker")}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${selectedTool === 'sticker' ? 'bg-indigo-600 text-white' : 'text-indigo-900 hover:bg-indigo-50'}`}
               >
                  Sticker
               </button>
               <button
                  onClick={() => setSelectedTool("text")}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${selectedTool === 'text' ? 'bg-indigo-600 text-white' : 'text-indigo-900 hover:bg-indigo-50'}`}
               >
                  Text
               </button>
            </div>

            {hasInteracted && (
               <button
                  onClick={handleRevealClick}
                  className="absolute top-6 right-6 text-indigo-600 hover:bg-indigo-50 bg-white shadow-lg transition-colors text-xs font-bold tracking-widest px-6 py-3 rounded-full pointer-events-auto"
               >
                  FINISH
               </button>
            )}

            {!hasInteracted && (
               <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-2 rounded-full font-bold shadow-lg opacity-80 text-sm">
                  Drag to pan. Tap to place.
               </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
