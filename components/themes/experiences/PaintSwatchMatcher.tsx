"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Droplet, Check, Target, Save, X } from "lucide-react";

type PaintColor = { name: string; hex: string; brand: string };

const paintDatabase: PaintColor[] = [
  { name: "Sea Salt", hex: "#CDD1C4", brand: "Sherwin-Williams" },
  { name: "Navajo White", hex: "#F3EAD3", brand: "Benjamin Moore" },
  { name: "Hale Navy", hex: "#2B374B", brand: "Benjamin Moore" },
  { name: "Accessible Beige", hex: "#D1C7B8", brand: "Sherwin-Williams" },
  { name: "Tricorn Black", hex: "#2F2F30", brand: "Sherwin-Williams" },
  { name: "Peale Green", hex: "#4C5B4F", brand: "Benjamin Moore" },
  { name: "Agreeable Gray", hex: "#D1CBC1", brand: "Sherwin-Williams" },
  { name: "Revere Pewter", hex: "#CCC7B9", brand: "Benjamin Moore" },
];

// Helper to convert hex to rgb
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Euclidean distance between two colors
const colorDistance = (rgb1: {r:number,g:number,b:number}, rgb2: {r:number,g:number,b:number}) => {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) + 
    Math.pow(rgb1.g - rgb2.g, 2) + 
    Math.pow(rgb1.b - rgb2.b, 2)
  );
};

export function PaintSwatchMatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [streamActive, setStreamActive] = useState(false);
  const [sampledColor, setSampledColor] = useState<{rgb: {r:number,g:number,b:number}, hex: string} | null>(null);
  const [matchedPaint, setMatchedPaint] = useState<PaintColor | null>(null);
  const [savedSwatches, setSavedSwatches] = useState<PaintColor[]>([]);

  // Simulated "camera" effect for demo environments where getUserMedia isn't available
  const [demoHue, setDemoHue] = useState(0);
  useEffect(() => {
     let interval: NodeJS.Timeout;
     if (streamActive && mode === "editor-preview") {
        interval = setInterval(() => {
           setDemoHue(prev => (prev + 5) % 360);
        }, 100);
     }
     return () => clearInterval(interval);
  }, [streamActive, mode]);

  const rgbToHex = (r: number, g: number, b: number) => {
     return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  };

  const handleCapture = () => {
     // In a real app, this would draw the video frame to a canvas and getImageData at center
     // For demo, we'll generate a random color based on the current demo hue
     let r, g, b;
     
     if (mode === "editor-preview") {
        // HSL to RGB approx for demo
        const h = demoHue / 360;
        const s = 0.5;
        const l = 0.6;
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hue2rgb = (p: number, q: number, t: number) => {
           if (t < 0) t += 1;
           if (t > 1) t -= 1;
           if (t < 1/6) return p + (q - p) * 6 * t;
           if (t < 1/2) return q;
           if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
           return p;
        };
        r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
        g = Math.round(hue2rgb(p, q, h) * 255);
        b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
     } else {
        // Just pick a random color near one of our paints for demo purposes if not editor
        const randomTarget = paintDatabase[Math.floor(Math.random() * paintDatabase.length)];
        const base = hexToRgb(randomTarget.hex);
        r = Math.min(255, Math.max(0, base.r + Math.floor(Math.random() * 40 - 20)));
        g = Math.min(255, Math.max(0, base.g + Math.floor(Math.random() * 40 - 20)));
        b = Math.min(255, Math.max(0, base.b + Math.floor(Math.random() * 40 - 20)));
     }

     const hex = rgbToHex(r, g, b);
     setSampledColor({ rgb: {r,g,b}, hex });

     // Find closest match
     let closest = paintDatabase[0];
     let minDistance = Infinity;

     for (const paint of paintDatabase) {
        const paintRgb = hexToRgb(paint.hex);
        const dist = colorDistance({r,g,b}, paintRgb);
        if (dist < minDistance) {
           minDistance = dist;
           closest = paint;
        }
     }

     setMatchedPaint(closest);
     setStreamActive(false);
  };

  const handleSave = () => {
     if (matchedPaint && !savedSwatches.find(s => s.hex === matchedPaint.hex)) {
        setSavedSwatches(prev => [...prev, matchedPaint]);
        
        if (savedSwatches.length >= 2 && onComplete) {
           onComplete();
        }
     }
     setSampledColor(null);
     setMatchedPaint(null);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-xl font-black tracking-tight mb-1 flex items-center gap-2" style={{ color: primaryColor }}>
               <Droplet size={20} />
               {config.title || "Color Match"}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Find the perfect paint"}
            </p>
         </div>
      </div>

      {/* Main Viewfinder / Result Area */}
      <div className="flex-1 w-full relative">
         
         <AnimatePresence mode="wait">
            {streamActive ? (
               <motion.div 
                  key="camera"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900 flex items-center justify-center cursor-pointer"
                  onClick={handleCapture}
               >
                  {/* Fake Video Stream */}
                  {mode === "editor-preview" ? (
                     <div 
                        className="absolute inset-0 transition-colors duration-200"
                        style={{ backgroundColor: `hsl(${demoHue}, 40%, 50%)` }}
                     />
                  ) : (
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff, #000)' }} />
                  )}
                  
                  {/* Target Reticle */}
                  <div className="relative z-10 text-white/50 flex flex-col items-center pointer-events-none">
                     <Target size={64} strokeWidth={1} />
                     <span className="mt-4 text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">Tap to capture</span>
                  </div>
               </motion.div>
            ) : matchedPaint ? (
               <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-100"
               >
                  <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                     
                     {/* Color Comparison Split */}
                     <div className="flex h-48 w-full relative">
                        {/* Sampled */}
                        <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: sampledColor?.hex }}>
                           <span className="bg-black/20 text-white backdrop-blur text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Camera</span>
                        </div>
                        {/* Matched */}
                        <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: matchedPaint.hex }}>
                           <span className="bg-black/20 text-white backdrop-blur text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Database</span>
                        </div>
                        
                        {/* Connecting overlay line */}
                        <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                     </div>

                     <div className="p-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                           Closest Match Found
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{matchedPaint.name}</h3>
                        <p className="text-slate-500 text-sm font-medium">{matchedPaint.brand}</p>
                        
                        <div className="mt-6 flex gap-3">
                           <button 
                              onClick={() => { setMatchedPaint(null); setSampledColor(null); setStreamActive(true); }}
                              className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                           >
                              Retake
                           </button>
                           <button 
                              onClick={handleSave}
                              className="flex-1 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                              style={{ backgroundColor: primaryColor }}
                           >
                              <Save size={16} /> Save Swatch
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6"
               >
                  <button 
                     onClick={() => setStreamActive(true)}
                     className="w-32 h-32 rounded-full bg-white shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-100 hover:scale-105 active:scale-95 transition-all"
                  >
                     <Camera size={40} className="mb-2" />
                     <span className="text-xs font-bold uppercase tracking-widest">Open Cam</span>
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Saved Swatches Tray */}
      <div className="h-32 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-30 p-4">
         <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Project Palette</h4>
         
         <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {savedSwatches.length === 0 ? (
               <div className="h-16 flex items-center text-sm font-medium text-slate-300 italic px-2">
                  No swatches saved yet.
               </div>
            ) : (
               savedSwatches.map((swatch, idx) => (
                  <div key={idx} className="flex-shrink-0 w-32 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-sm group relative">
                     <div className="h-10 w-full" style={{ backgroundColor: swatch.hex }} />
                     <div className="p-2">
                        <div className="text-[10px] font-black truncate">{swatch.name}</div>
                        <div className="text-[8px] text-slate-400 uppercase tracking-widest truncate">{swatch.hex}</div>
                     </div>
                     <button 
                        onClick={() => setSavedSwatches(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
                     >
                        <X size={10} />
                     </button>
                  </div>
               ))
            )}
         </div>
      </div>

    </div>
  );
}
