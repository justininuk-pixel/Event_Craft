"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

export function MemoryBlanket({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafaf9"]; // stone-50

  // Fallback images
  const images = ((config.experience as any)?.items as any[])?.map((f: any) => f.imageUrl).filter(Boolean) || [
     "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1516589178581-6cd78532f146?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
  ];

  // We want a large grid, let's tile the images
  const gridImages = Array.from({ length: 64 }).map((_, i) => images[i % images.length]);

  const [scale, setScale] = useState(1);
  const maxScale = 5;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handlePinch = (e: any) => {
     // A proper implementation would use a library like 'react-use-gesture' for real pinch-zoom
     // For this demo, we can just use wheel events or a simple slider
  };

  const handleWheel = (e: React.WheelEvent) => {
     setScale(prev => {
        let newScale = prev - e.deltaY * 0.01;
        newScale = Math.max(1, Math.min(newScale, maxScale));
        if (newScale >= maxScale && onComplete) {
           onComplete();
        }
        return newScale;
     });
  };

  // The quilt texture fades out as scale increases
  const textureOpacity = Math.max(0, 1 - ((scale - 1) / 2)); 

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none"
      style={{ backgroundColor: bgColors[0] }}
      onWheel={handleWheel}
      ref={containerRef}
    >
      
      {/* Zoom Instructions */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 pointer-events-none transition-opacity duration-500" style={{ opacity: scale > 1.5 ? 0 : 1 }}>
         <ZoomIn size={16} className="text-slate-500" />
         <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Scroll or pinch to zoom in
         </span>
      </div>

      <div className="flex-1 flex items-center justify-center relative w-full h-full">
         
         {/* The zooming container */}
         <motion.div 
            className="relative grid grid-cols-8 grid-rows-8 gap-0 cursor-grab active:cursor-grabbing w-[100vw] h-[100vw] md:w-[800px] md:h-[800px]"
            style={{ 
               width: '200vw', 
               height: '200vw',
               maxWidth: '1600px',
               maxHeight: '1600px'
            }}
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag
            dragConstraints={containerRef}
         >
            
            {/* The individual photos */}
            {gridImages.map((src, i) => (
               <div key={i} className="relative w-full h-full overflow-hidden border border-white/10">
                  <Image src={src} alt={`Memory ${i}`} fill className="object-cover" />
               </div>
            ))}

            {/* The procedural quilt texture overlay */}
            <div 
               className="absolute inset-0 pointer-events-none"
               style={{ 
                  opacity: textureOpacity,
                  backgroundImage: `
                     linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1)), 
                     linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.1))
                  `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
               }}
            >
               {/* Knit pattern mockup using SVG filter or base64 noise could go here */}
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                  <filter id="noise">
                     <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                     <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.2 0" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#noise)" />
               </svg>
            </div>
            
            {/* Stitching lines overlay */}
            <div 
               className="absolute inset-0 pointer-events-none mix-blend-overlay"
               style={{
                  opacity: textureOpacity,
                  backgroundImage: `
                     linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(255,255,255,0.8) 1px, transparent 1px)
                  `,
                  backgroundSize: '12.5% 12.5%'
               }}
            />

         </motion.div>

      </div>

      {/* Manual zoom controls for mobile / accessibility */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
         <button 
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
            onClick={() => setScale(s => Math.min(s + 0.5, maxScale))}
         >
            <span className="text-xl font-bold">+</span>
         </button>
         <button 
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
            onClick={() => setScale(s => Math.max(s - 0.5, 1))}
         >
            <span className="text-xl font-bold">-</span>
         </button>
      </div>

    </div>
  );
}
