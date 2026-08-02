"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Beaker, Check } from "lucide-react";

export function ScentAssociator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafaf9"]; // stone-50
  const title = config.title || "Grandma's Perfume";
  const memory = config.body || "She always smelled like roses and old paper. It filled the entire house before she even walked in the door.";

  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);
  const [isLocked, setIsLocked] = useState(false);

  const mixedColor = `rgb(${r}, ${g}, ${b})`;

  const handleSave = () => {
    setIsLocked(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if (onComplete) setTimeout(onComplete, 2500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-stone-50" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="pt-10 px-8 pb-4 text-center z-10 relative">
        <FlaskConical size={24} className="mx-auto text-stone-400 mb-4" />
        <h2 className="text-2xl font-black text-stone-800 tracking-tight">{title}</h2>
        <p className="text-sm text-stone-500 mt-2 font-sans max-w-xs mx-auto">
          Mix the primary colors to create a shade that visually represents this scent.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 z-10 relative">
        
        {/* The Mixed Fluid */}
        <div className="w-48 h-48 rounded-full border-8 border-white shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(0,0,0,0.1)] relative overflow-hidden bg-stone-200 mb-10 flex items-end justify-center">
           {/* Liquid Fill */}
           <motion.div 
             className="absolute w-[200%] h-[200%] rounded-[40%] opacity-90 mix-blend-multiply"
             style={{ backgroundColor: mixedColor }}
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
           />
           {/* Specular highlight for glass effect */}
           <div className="absolute top-2 right-4 w-10 h-10 bg-white/40 rounded-full blur-md" />
           <div className="absolute bottom-2 left-4 w-20 h-4 bg-white/20 rounded-full blur-sm transform rotate-12" />
        </div>

        {/* Sliders */}
        <AnimatePresence mode="wait">
          {!isLocked ? (
            <motion.div key="sliders" exit={{ opacity: 0, y: 20 }} className="w-full max-w-sm flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 font-sans">
              
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">R</div>
                 <input 
                   type="range" min="0" max="255" value={r} onChange={(e) => setR(parseInt(e.target.value))}
                   className="flex-1 accent-red-500"
                 />
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                 <input 
                   type="range" min="0" max="255" value={g} onChange={(e) => setG(parseInt(e.target.value))}
                   className="flex-1 accent-green-500"
                 />
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">B</div>
                 <input 
                   type="range" min="0" max="255" value={b} onChange={(e) => setB(parseInt(e.target.value))}
                   className="flex-1 accent-blue-500"
                 />
              </div>

              <button 
                onClick={handleSave}
                className="mt-2 w-full py-3 bg-stone-900 text-white rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-stone-800 transition-colors"
              >
                Synthesize Scent
              </button>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                   <Check size={24} />
                </div>
                <h3 className="font-bold text-stone-900 mb-2 font-sans">Hex: {`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`}</h3>
                <p className="text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-4 mt-2">
                  "{memory}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
