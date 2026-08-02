"use client";

import React, { useState, useRef, useMemo } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Plus, Sparkles } from "lucide-react";

type FlowerData = {
   id: string;
   text: string;
   x: number;
   y: number;
   hue: number;
   scale: number;
   type: "tulip" | "daisy" | "sunflower";
};

export function GratitudeGarden({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfccb"]; // lime-50

  // Start with some history or empty
  const initialData = ((config.experience as any)?.items as any[])?.map((f: any, i: number) => ({
     id: `init-${i}`,
     text: f.title || f.text,
     x: 20 + Math.random() * 60,
     y: 20 + Math.random() * 60,
     hue: Math.random() * 360,
     scale: 0.8 + Math.random() * 0.4,
     type: (["tulip", "daisy", "sunflower"] as const)[Math.floor(Math.random() * 3)]
  })) || [];

  const [flowers, setFlowers] = useState<FlowerData[]>(initialData);
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeFlowerId, setActiveFlowerId] = useState<string | null>(null);

  const gardenRef = useRef<HTMLDivElement>(null);

  const handleAddGratitude = (e: React.FormEvent) => {
     e.preventDefault();
     if (!inputText.trim()) return;

     const newFlower: FlowerData = {
        id: `flower-${Date.now()}`,
        text: inputText,
        x: 10 + Math.random() * 80, // % width
        y: 10 + Math.random() * 80, // % height
        hue: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.6,
        type: ["tulip", "daisy", "sunflower"][Math.floor(Math.random() * 3)] as any
     };

     setFlowers([...flowers, newFlower]);
     setInputText("");
     setIsAdding(false);

     if (onComplete && flowers.length >= 3) {
        onComplete();
     }
  };

  const renderFlowerSVG = (type: string, hue: number) => {
     // Very simplified SVG representations
     if (type === "daisy") {
        return (
           <svg width="40" height="40" viewBox="0 0 40 40">
              <g style={{ transformOrigin: '20px 20px', transform: 'scale(0.8)' }}>
                 {/* Petals */}
                 {[0, 45, 90, 135, 180, 225, 270, 315].map(rot => (
                    <ellipse key={rot} cx="20" cy="10" rx="4" ry="12" fill="white" transform={`rotate(${rot} 20 20)`} />
                 ))}
                 {/* Center */}
                 <circle cx="20" cy="20" r="6" fill={`hsl(${hue}, 80%, 50%)`} />
              </g>
           </svg>
        );
     }
     if (type === "tulip") {
        return (
           <svg width="40" height="40" viewBox="0 0 40 40">
              <path d="M 10 30 Q 10 10 20 10 Q 30 10 30 30 Z" fill={`hsl(${hue}, 80%, 60%)`} />
              <path d="M 10 30 Q 15 15 20 25 Q 25 15 30 30 Z" fill={`hsl(${hue}, 80%, 50%)`} />
           </svg>
        );
     }
     // sunflower
     return (
        <svg width="40" height="40" viewBox="0 0 40 40">
           <g style={{ transformOrigin: '20px 20px', transform: 'scale(0.9)' }}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(rot => (
                 <ellipse key={rot} cx="20" cy="8" rx="3" ry="10" fill="#facc15" transform={`rotate(${rot} 20 20)`} />
              ))}
              <circle cx="20" cy="20" r="8" fill="#422006" />
           </g>
        </svg>
     );
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Garden Area (Perspective) */}
      <div className="flex-1 relative w-full overflow-hidden" style={{ perspective: "1000px" }}>
         
         {/* The Dirt / Grass plane */}
         <motion.div 
            className="absolute inset-0 top-1/4 rounded-t-full origin-bottom"
            style={{ 
               background: `radial-gradient(ellipse at center, ${primaryColor} 0%, #064e3b 100%)`,
               transform: 'rotateX(60deg) scale(2)'
            }}
         />

         {/* The Flowers */}
         <div className="absolute inset-0" ref={gardenRef}>
            <AnimatePresence>
               {flowers.map((f, i) => (
                  <motion.div
                     key={f.id}
                     initial={{ scale: 0, y: 50, opacity: 0 }}
                     animate={{ scale: f.scale, y: 0, opacity: 1 }}
                     transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 10,
                        delay: i * 0.1 // Stagger initial render
                     }}
                     className="absolute w-[60px] h-[100px] flex flex-col items-center justify-end group cursor-pointer"
                     style={{ 
                        left: `${f.x}%`, 
                        top: `${f.y}%`,
                        transform: `translate(-50%, -100%) scale(${f.scale})`,
                        zIndex: Math.floor(f.y) // Y-sorting for pseudo 3D
                     }}
                     onClick={() => setActiveFlowerId(f.id)}
                  >
                     {/* Stem */}
                     <div className="w-1 h-12 bg-green-600 rounded-full" />
                     {/* Leaves */}
                     <div className="absolute bottom-4 left-2 w-4 h-2 bg-green-500 rounded-full rotate-[-45deg]" />
                     <div className="absolute bottom-6 right-2 w-4 h-2 bg-green-500 rounded-full rotate-[45deg]" />
                     
                     {/* Flower Head */}
                     <motion.div 
                        className="absolute top-0 origin-bottom"
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                     >
                        {renderFlowerSVG(f.type, f.hue)}
                     </motion.div>

                     {/* Highlight effect on hover */}
                     <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

      </div>

      {/* Floating Action Button for new gratitude */}
      <button 
         onClick={() => setIsAdding(true)}
         className="absolute bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-20"
         style={{ backgroundColor: primaryColor }}
      >
         <Plus size={32} />
      </button>

      <div className="absolute top-8 left-8 z-20">
         <h2 className="text-3xl font-black text-emerald-900 drop-shadow-md">
            Gratitude Garden
         </h2>
         <p className="text-emerald-800 font-bold opacity-70">
            {flowers.length} blossoms planted
         </p>
      </div>

      {/* Input Modal */}
      <AnimatePresence>
         {isAdding && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
               onClick={() => setIsAdding(false)}
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Leaf size={20} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-800">
                        Plant a Seed
                     </h3>
                  </div>

                  <form onSubmit={handleAddGratitude}>
                     <textarea 
                        autoFocus
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Today, I am grateful for..."
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium mb-4"
                     />
                     <div className="flex justify-end gap-2">
                        <button 
                           type="button"
                           onClick={() => setIsAdding(false)}
                           className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={!inputText.trim()}
                           className={`px-8 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 ${!inputText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 transition-all'}`}
                           style={{ backgroundColor: primaryColor }}
                        >
                           Plant <Sparkles size={16} />
                        </button>
                     </div>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* View Flower Modal */}
      <AnimatePresence>
         {activeFlowerId && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
               onClick={() => setActiveFlowerId(null)}
            >
               <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
                  <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                     <Sparkles size={24} />
                  </div>
                  <p className="text-xl font-serif text-slate-700 leading-relaxed italic mb-8">
                     "{flowers.find(f => f.id === activeFlowerId)?.text}"
                  </p>
                  <button 
                     onClick={() => setActiveFlowerId(null)}
                     className="px-8 py-2 rounded-full font-bold text-slate-400 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                     Close
                  </button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
