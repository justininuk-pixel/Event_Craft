"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Move, Maximize, Compass } from "lucide-react";

export function PanoramaMemory({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const panoramaSrc = (config.experience as any)?.panoramaSrc || "https://images.unsplash.com/photo-1542401886-65d6c61de152?q=80&w=2000&auto=format&fit=crop"; 
  const title = config.title || "The Summit";
  const body = config.body || "360° View from the top of the world.";

  const containerRef = useRef<HTMLDivElement>(null);
  
  // We use motion values to track the "camera" pan position (x)
  const panX = useMotionValue(0);
  
  // Wrap the pan value so it loops endlessly (e.g. 0 to -100%)
  // Since we'll render two identical images side by side, panning from 0 to -50% represents one full rotation.
  const backgroundX = useTransform(panX, (val) => {
     // Modulo arithmetic to keep it looping seamlessly.
     // If the image is 200% wide (two copies of 100%), sliding -100% means we've shifted exactly one copy.
     // So we wrap between 0 and -50% (assuming the container holds 2 full images side-by-side).
     // Actually, simpler: let's track pixels and wrap based on image width.
     return val; 
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const [imgWidth, setImgWidth] = useState(1000);

  useEffect(() => {
     // Auto-pan until interaction
     let controls: any;
     if (!hasInteracted && imgWidth > 0) {
        controls = animate(panX, panX.get() - imgWidth, {
           duration: 60, // slow rotation
           ease: "linear",
           repeat: Infinity,
           onUpdate: (latest) => {
              if (latest <= -imgWidth) {
                 panX.set(0);
              }
           }
        });
     }
     
     return () => {
        if (controls) controls.stop();
     };
  }, [hasInteracted, imgWidth, panX]);

  const handleDragStart = () => {
     setHasInteracted(true);
  };

  const handleDrag = (event: any, info: any) => {
     // Update panX manually during drag
     let newX = panX.get() + info.delta.x;
     // Wrap logic
     if (newX > 0) newX -= imgWidth;
     if (newX < -imgWidth) newX += imgWidth;
     
     panX.set(newX);
  };
  
  const handleDragEnd = () => {
     if (onComplete) {
        // Debounce completion
        setTimeout(onComplete, 3000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white bg-black touch-none select-none"
    >
      
      {/* Immersive Panorama Container */}
      <div 
         ref={containerRef}
         className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      >
         {/* We render a very wide div that holds multiple copies of the image for seamless looping */}
         <motion.div 
            className="absolute top-0 bottom-0 flex"
            style={{ x: backgroundX }}
            drag="x"
            dragConstraints={{ left: -10000, right: 10000 }} // virtually infinite, we handle wrapping manually
            dragElastic={0}
            dragMomentum={true}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
         >
            {/* Render 3 copies of the equirectangular image to ensure seamless wrapping during drag bounce */}
            <img 
               src={panoramaSrc} 
               alt="Panorama" 
               className="h-full w-auto object-cover max-w-none pointer-events-none"
               onLoad={(e) => setImgWidth(e.currentTarget.width)}
            />
            <img 
               src={panoramaSrc} 
               alt="Panorama" 
               className="h-full w-auto object-cover max-w-none pointer-events-none"
            />
            <img 
               src={panoramaSrc} 
               alt="Panorama" 
               className="h-full w-auto object-cover max-w-none pointer-events-none"
            />
         </motion.div>
         
         {/* Lens vignette / sphere distortion approximation using CSS radial gradient */}
         <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
         
         <div 
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
            style={{ background: 'radial-gradient(circle, transparent 30%, black 100%)' }}
         />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between z-10">
         
         {/* Top Header */}
         <div className="flex justify-between items-start">
            <div>
               <h2 className="text-2xl font-black tracking-widest uppercase drop-shadow-md">
                  {title}
               </h2>
               <p className="text-sm text-white/70 drop-shadow max-w-xs mt-1">
                  {body}
               </p>
            </div>
            <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg">
               <Compass size={20} className="text-white/80" />
            </div>
         </div>

         {/* Bottom HUD */}
         <div className="flex justify-between items-end">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 text-xs uppercase tracking-widest">
               <Move size={14} className="animate-pulse" />
               {!hasInteracted ? "Drag to look around" : "Manual Control"}
            </div>
            
            <div className="text-[10px] font-mono text-white/50 text-right">
               360° Equirectangular<br/>
               FOV: 90°
            </div>
         </div>

      </div>

    </div>
  );
}
