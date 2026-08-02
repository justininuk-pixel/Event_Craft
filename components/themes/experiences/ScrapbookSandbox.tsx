"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useAnimation } from "framer-motion";
import { Move, ZoomIn, Download, RefreshCcw } from "lucide-react";

type ScrapbookItem = {
   id: string;
   type: "image" | "text" | "sticker";
   content: string;
   x: number;
   y: number;
   rotation: number;
   scale: number;
   zIndex: number;
};

// Default mock assets for demo
const defaultAssets: ScrapbookItem[] = [
   { id: "1", type: "image", content: "https://images.unsplash.com/photo-1528699633788-424224dc89b5?q=80&w=400&auto=format&fit=crop", x: 20, y: 30, rotation: -10, scale: 1, zIndex: 1 },
   { id: "2", type: "text", content: "That amazing summer...", x: 40, y: 70, rotation: 5, scale: 1.2, zIndex: 2 },
   { id: "3", type: "image", content: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop", x: 60, y: 20, rotation: 15, scale: 0.9, zIndex: 3 },
   { id: "4", type: "sticker", content: "⭐", x: 75, y: 55, rotation: 0, scale: 2, zIndex: 4 },
   { id: "5", type: "text", content: "Never forget.", x: 20, y: 60, rotation: -5, scale: 1, zIndex: 5 },
   { id: "6", type: "sticker", content: "📌", x: 25, y: 25, rotation: 0, scale: 1.5, zIndex: 6 }, // Pushpin
   { id: "7", type: "sticker", content: "📌", x: 65, y: 15, rotation: 0, scale: 1.5, zIndex: 7 }, // Pushpin
];

export function ScrapbookSandbox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fcd34d"]; // amber-300 (corkboard-ish)

  // In a real app, this would be passed via config.features
  const initialItems: ScrapbookItem[] = (config.experience as any)?.items || defaultAssets;
  
  const [items, setItems] = useState<ScrapbookItem[]>(initialItems);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pile them in the center if it's the very first time (mocking the "dump")
  useEffect(() => {
     if (mode === "editor-preview") {
        // Just scatter them near center to simulate the "dump"
        setItems(prev => prev.map(item => ({
           ...item,
           x: 40 + Math.random() * 20,
           y: 40 + Math.random() * 20,
           rotation: (Math.random() - 0.5) * 60,
        })));
     }
  }, [mode]);

  const bringToFront = (id: string) => {
     setMaxZIndex(prev => prev + 1);
     setItems(prev => prev.map(item => 
        item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item
     ));
  };

  const handleDragEnd = (id: string, info: any) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     
     // Update percentage coordinates
     // Framer motion uses absolute pixels for drag, so we need to calculate the relative position
     // For this simple demo, we let framer-motion handle the local transform state,
     // but in a real app we'd save `info.point.x / rect.width * 100` back to state.
     if (onComplete && Math.random() > 0.8) {
        // Just occasionally trigger onComplete for demo
        onComplete();
     }
  };

  // Simple layout reset for demo
  const handleReset = () => {
     setItems(initialItems.map(item => ({
        ...item,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        rotation: (Math.random() - 0.5) * 60,
     })));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Texture overlay (Corkboard) */}
      <div 
         className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply"
         style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
         }}
      />

      <div className="absolute top-4 left-0 right-0 z-50 flex justify-between items-center px-6 pointer-events-none">
         <h2 className="text-xl font-serif font-bold text-amber-900 drop-shadow-sm mix-blend-color-burn">
            {config.title || "The Scrapbook"}
         </h2>
         <div className="flex gap-2 pointer-events-auto">
            <button onClick={handleReset} className="p-2 bg-white/50 backdrop-blur-md rounded-full text-amber-900 hover:bg-white/80 shadow-sm">
               <RefreshCcw size={16} />
            </button>
            <button onClick={() => onComplete?.()} className="p-2 bg-white/50 backdrop-blur-md rounded-full text-amber-900 hover:bg-white/80 shadow-sm">
               <Download size={16} />
            </button>
         </div>
      </div>

      {/* The Boundless Canvas */}
      <div 
         ref={containerRef}
         className="flex-1 relative w-full h-full z-10 overflow-hidden touch-none"
      >
         
         {items.map(item => (
            <motion.div
               key={item.id}
               drag
               dragMomentum={false}
               onPointerDown={() => bringToFront(item.id)}
               onDragEnd={(e, info) => handleDragEnd(item.id, info)}
               initial={{ 
                  x: `${item.x}vw`, 
                  y: `${item.y}vh`, 
                  rotate: item.rotation,
                  scale: item.scale
               }}
               // We use absolute positioning based on viewport, then let drag transform over it
               className="absolute top-0 left-0 cursor-grab active:cursor-grabbing origin-center"
               style={{ zIndex: item.zIndex }}
               whileHover={{ scale: item.scale * 1.05 }}
               whileDrag={{ scale: item.scale * 1.1, cursor: "grabbing" }}
            >
               
               {item.type === "image" && (
                  <div className="p-2 pb-8 bg-white shadow-xl border border-slate-200">
                     {/* Tape */}
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 backdrop-blur-sm shadow-sm rotate-2 border border-white/40" style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }} />
                     
                     <img src={item.content} alt="Scrapbook piece" className="w-48 h-auto pointer-events-none" />
                  </div>
               )}

               {item.type === "text" && (
                  <div className="px-4 py-2 bg-yellow-100/90 shadow-md font-serif italic text-slate-800 text-lg border border-yellow-200/50 backdrop-blur-sm max-w-[200px]">
                     {/* Tape */}
                     <div className="absolute top-1 -left-2 w-8 h-4 bg-white/40 backdrop-blur-sm shadow-sm -rotate-45" />
                     {item.content}
                  </div>
               )}

               {item.type === "sticker" && (
                  <div className="text-4xl filter drop-shadow-md">
                     {item.content}
                  </div>
               )}

            </motion.div>
         ))}

      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
         <div className="bg-black/40 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Move size={14} /> Drag to arrange
         </div>
      </div>

    </div>
  );
}
