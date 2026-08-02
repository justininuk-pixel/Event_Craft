"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Eye, Star } from "lucide-react";

type TasteOption = {
  id: string;
  trueName: string;
  aliasColor: string;
  rating: number; // 0-10
};

const defaultOptions: TasteOption[] = [
  { id: "o1", trueName: "Coca-Cola", aliasColor: "#ef4444", rating: 5 }, // red
  { id: "o2", trueName: "Pepsi", aliasColor: "#3b82f6", rating: 5 }, // blue
  { id: "o3", trueName: "RC Cola", aliasColor: "#10b981", rating: 5 }, // green
];

export function BlindTasteTester({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f4f4f5"]; // zinc-100

  const [options, setOptions] = useState<TasteOption[]>(defaultOptions);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleRating = (id: string, newRating: number) => {
    if (isRevealed) return;
    setOptions(options.map(o => o.id === id ? { ...o, rating: newRating } : o));
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  const sortedOptions = [...options].sort((a, b) => b.rating - a.rating);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-100" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-8 pb-4 text-center z-10">
         {!isRevealed ? <EyeOff size={24} className="mx-auto text-zinc-400 mb-2" /> : <Eye size={24} className="mx-auto text-amber-500 mb-2" />}
         <h2 className="text-xl font-black text-zinc-900 uppercase tracking-widest">Blind Taste Test</h2>
         <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{isRevealed ? "The Truth Revealed" : "Rate each cup purely on taste"}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">
         <AnimatePresence mode="wait">
            {!isRevealed ? (
               <motion.div key="blind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {options.map((opt) => (
                     <div key={opt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center border-2 border-white" style={{ backgroundColor: opt.aliasColor }}>
                              <span className="text-white font-bold text-lg drop-shadow-md">{opt.id.replace('o', '')}</span>
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-zinc-700 capitalize">Cup {opt.aliasColor.replace('#', '')}</h3>
                              <p className="text-xs text-zinc-400">Rate 1-10</p>
                           </div>
                           <div className="w-10 text-center font-black text-xl text-zinc-800">{opt.rating}</div>
                        </div>
                        <input 
                          type="range" 
                          min="1" max="10" 
                          value={opt.rating} 
                          onChange={(e) => handleRating(opt.id, parseInt(e.target.value))}
                          className="w-full accent-zinc-800"
                        />
                     </div>
                  ))}
               </motion.div>
            ) : (
               <motion.div key="revealed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {sortedOptions.map((opt, index) => (
                     <div key={opt.id} className="bg-white p-4 rounded-2xl shadow-md border-2 relative overflow-hidden" style={{ borderColor: index === 0 ? '#fbbf24' : '#e4e4e7' }}>
                        {/* Background tint of the alias color */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: opt.aliasColor }} />
                        
                        <div className="flex items-center justify-between relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 font-bold text-zinc-500 text-sm">
                                 #{index + 1}
                              </div>
                              <div>
                                 <h3 className="font-black text-xl text-zinc-900">{opt.trueName}</h3>
                                 <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.aliasColor }} />
                                    Was Cup {opt.id.replace('o', '')}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-1 bg-zinc-900 text-white px-3 py-1.5 rounded-lg font-bold">
                              {opt.rating} <Star size={14} className="text-amber-400 fill-amber-400" />
                           </div>
                        </div>
                     </div>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Master Reveal Button */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-zinc-100 via-zinc-100 to-transparent">
         {!isRevealed && (
            <button 
              onClick={() => {
                 setIsRevealed(true);
    onComplete?.();
                 if (onComplete) setTimeout(onComplete, 5000);
              }}
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              Reveal True Brands
            </button>
         )}
      </div>

    </div>
  );
}
