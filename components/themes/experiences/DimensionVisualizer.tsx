"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Box, User, Move3d } from "lucide-react";
import { motion } from "framer-motion";

export function DimensionVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // indigo-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e0e7ff"]; // indigo-100

  // Dimensions in inches
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(30);
  const [depth, setDepth] = useState(20);

  // Reference Human is 70 inches tall (5'10")
  const humanHeightInches = 70;
  
  // Base scale to fit screen (1 inch = 3px roughly, scaled by container later)
  const scaleMultiplier = 3.5;

  const scaledW = width * scaleMultiplier;
  const scaledH = height * scaleMultiplier;
  const scaledD = depth * scaleMultiplier;
  const scaledHumanH = humanHeightInches * scaleMultiplier;
  const scaledHumanW = 24 * scaleMultiplier; // ~24 inches wide shoulders

  const handleFinish = () => {
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* HUD Info */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="text-xl font-black tracking-tight mb-1 flex items-center gap-2 text-indigo-950">
               <Move3d size={20} />
               {config.title || "Will it fit?"}
            </h2>
            <p className="text-indigo-800/60 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Visual scale comparison"}
            </p>
         </div>
         {onComplete && (
            <button onClick={handleFinish} className="pointer-events-auto bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold">
               Done
            </button>
         )}
      </div>

      {/* Main 3D / Perspective Area */}
      <div className="flex-1 w-full relative flex items-end justify-center pb-[20%] overflow-hidden" style={{ perspective: '800px' }}>
         
         {/* Floor Grid */}
         <div 
            className="absolute bottom-0 w-[200%] h-64 left-1/2 -translate-x-1/2 origin-bottom pointer-events-none opacity-20"
            style={{ 
               backgroundImage: "linear-gradient(transparent 95%, #4f46e5 100%), linear-gradient(90deg, transparent 95%, #4f46e5 100%)",
               backgroundSize: "40px 40px",
               transform: "rotateX(75deg)"
            }}
         />

         {/* Human Silhouette Reference */}
         <div 
            className="absolute bottom-[20%] left-[20%] md:left-[30%] origin-bottom z-10 flex flex-col items-center opacity-70"
            style={{ 
               height: scaledHumanH, 
               width: scaledHumanW
            }}
         >
            <User size="100%" className="text-slate-500 drop-shadow-2xl" strokeWidth={1} />
            <div className="absolute -left-12 top-1/2 text-xs font-bold text-slate-400 rotate-90 -translate-y-1/2 tracking-widest whitespace-nowrap">
               5'10" (70")
            </div>
         </div>

         {/* Dynamic CSS 3D Box */}
         <motion.div 
            className="absolute bottom-[20%] right-[30%] md:right-[40%] transform-style-3d origin-bottom z-20"
            animate={{
               width: scaledW,
               height: scaledH,
               // Rotate slightly to see depth
               rotateY: -25,
               rotateX: 10
            }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.8 }}
         >
            {/* Front Face */}
            <div 
               className="absolute inset-0 border-2 border-white/50 flex items-center justify-center backdrop-blur-sm"
               style={{ backgroundColor: `${primaryColor}cc`, transform: `translateZ(${scaledD / 2}px)` }}
            >
               <span className="text-white/80 font-black text-xs mix-blend-overlay">FRONT</span>
            </div>
            {/* Back Face */}
            <div 
               className="absolute inset-0 border-2 border-white/50"
               style={{ backgroundColor: `${primaryColor}aa`, transform: `translateZ(${-scaledD / 2}px)` }}
            />
            {/* Top Face */}
            <div 
               className="absolute top-0 left-0 border-2 border-white/50"
               style={{ 
                  width: scaledW, height: scaledD, 
                  backgroundColor: `${primaryColor}ee`, 
                  transform: `rotateX(90deg) translateZ(${scaledD / 2}px)`,
                  transformOrigin: 'top'
               }}
            />
            {/* Bottom Face */}
            <div 
               className="absolute bottom-0 left-0 border-2 border-white/50"
               style={{ 
                  width: scaledW, height: scaledD, 
                  backgroundColor: `${primaryColor}88`, 
                  transform: `rotateX(-90deg) translateZ(${scaledD / 2}px)`,
                  transformOrigin: 'bottom'
               }}
            />
            {/* Left Face */}
            <div 
               className="absolute top-0 left-0 border-2 border-white/50"
               style={{ 
                  width: scaledD, height: scaledH, 
                  backgroundColor: `${primaryColor}dd`, 
                  transform: `rotateY(-90deg) translateZ(${scaledD / 2}px)`,
                  transformOrigin: 'left'
               }}
            />
            {/* Right Face */}
            <div 
               className="absolute top-0 right-0 border-2 border-white/50"
               style={{ 
                  width: scaledD, height: scaledH, 
                  backgroundColor: `${primaryColor}dd`, 
                  transform: `rotateY(90deg) translateZ(${scaledD / 2}px)`,
                  transformOrigin: 'right'
               }}
            />
            
            {/* Dimensions Annotations attached to the Box */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-indigo-900 font-bold text-xs bg-white/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
               W: {width}"
            </div>
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-indigo-900 font-bold text-xs bg-white/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap rotate-90">
               H: {height}"
            </div>
         </motion.div>

      </div>

      {/* Input Controls */}
      <div className="absolute bottom-6 left-6 right-6 z-30">
         <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-indigo-50 flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            
            <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Width (in)</label>
               <input 
                  type="range" min="10" max="100" 
                  value={width} onChange={e => setWidth(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
               />
            </div>

            <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Height (in)</label>
               <input 
                  type="range" min="10" max="100" 
                  value={height} onChange={e => setHeight(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
               />
            </div>

            <div className="flex-1 flex flex-col">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Depth (in)</label>
               <input 
                  type="range" min="10" max="100" 
                  value={depth} onChange={e => setDepth(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
               />
            </div>

         </div>
      </div>

    </div>
  );
}
