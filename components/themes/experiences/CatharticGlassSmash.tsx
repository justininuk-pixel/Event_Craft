"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { HandMetal, Sun, ShieldAlert } from "lucide-react";

type Shard = {
   id: number;
   clipPath: string;
   tx: number; // translate X
   ty: number; // translate Y
   r: number;  // rotate
   scale: number;
};

// Generate some basic shards
function generateShards(): Shard[] {
   const shards: Shard[] = [];
   const rows = 4;
   const cols = 4;
   let id = 0;
   
   for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
         // Create irregular polygons for each cell
         const x1 = (j / cols) * 100;
         const y1 = (i / rows) * 100;
         const x2 = ((j + 1) / cols) * 100;
         const y2 = ((i + 1) / rows) * 100;
         
         // Jitter corners
         const cx = (x1 + x2) / 2 + (Math.random() * 10 - 5);
         const cy = (y1 + y2) / 2 + (Math.random() * 10 - 5);

         shards.push({
            id: id++,
            clipPath: `polygon(${x1}% ${y1}%, ${cx}% ${y1}%, ${x2}% ${y1}%, ${x2}% ${y2}%, ${x1}% ${y2}%)`,
            tx: (Math.random() * 400 - 200),
            ty: (Math.random() * 400 + 100), // Mostly fall down
            r: (Math.random() * 720 - 360),
            scale: Math.random() * 0.5 + 0.5
         });
         
         shards.push({
            id: id++,
            clipPath: `polygon(${cx}% ${y1}%, ${x2}% ${y1}%, ${x2}% ${y2}%, ${cx}% ${y2}%)`,
            tx: (Math.random() * 400 - 200),
            ty: (Math.random() * 400 + 100),
            r: (Math.random() * 720 - 360),
            scale: Math.random() * 0.5 + 0.5
         });
      }
   }
   return shards;
}

export function CatharticGlassSmash({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#38bdf8"; // sky-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e0f2fe"]; // sky-100

  const [isShattered, setIsShattered] = useState(false);
  const [shards, setShards] = useState<Shard[]>([]);

  useEffect(() => {
     setShards(generateShards());
  }, []);

  const handleSmash = (e: React.TouchEvent | React.MouseEvent) => {
     if (isShattered) return;

     let force = 0;
     
     // Calculate force based on touch radius (if available)
     if ((e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 0) {
        const touch = (e as React.TouchEvent).touches[0];
        // WebKit/Blink provide radiusX/Y, Firefox doesn't always
        const radiusX = (touch as any).radiusX || 0;
        const radiusY = (touch as any).radiusY || 0;
        force = Math.max(radiusX, radiusY);
     } else {
        // Fallback for mouse/editor
        force = 50; 
     }

     // In editor preview, any click works. In real app, we need a hard hit (radius > 15 usually means a flat thumb/palm hit)
     if (mode === "editor-preview" || force > 15) {
        shatter();
     }
  };

  const shatter = () => {
     setIsShattered(true);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
     }

     // Mock sound
     try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // Simple white noise burst to simulate glass shattering
        const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
           data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1)); // Exponential decay
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 2000; // Glassy EQ
        
        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start();
     } catch (e) {
        console.error("Audio error", e);
     }

     if (onComplete) {
        setTimeout(onComplete, 4000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background (Peace) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0">
         <Sun size={64} className="mb-6 opacity-80" style={{ color: primaryColor }} />
         <h2 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm mb-4 text-center">
            {config.body || "It's going to be okay."}
         </h2>
      </div>

      {/* The Glass Overlay */}
      <AnimatePresence>
         {!isShattered && (
            <motion.div
               exit={{ opacity: 0 }}
               transition={{ duration: 0.1 }}
               className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
               onClick={handleSmash}
               onTouchStart={handleSmash}
            >
               {/* Glass styling */}
               <div className="absolute inset-4 rounded-xl border border-white/40 shadow-2xl overflow-hidden backdrop-blur-md bg-white/10" style={{ boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2)' }}>
                  
                  {/* Reflections */}
                  <div className="absolute top-0 left-[-50%] w-[200%] h-32 bg-gradient-to-b from-white/30 to-transparent rotate-45 transform origin-top-left pointer-events-none" />
                  
                  {/* The Stressor Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                     <ShieldAlert size={48} className="text-slate-800/50 mb-6 drop-shadow-md" />
                     <h3 className="text-3xl font-black text-slate-900 tracking-tighter drop-shadow-md uppercase">
                        {config.title || "ANXIETY"}
                     </h3>
                     <p className="mt-4 text-slate-800/80 font-bold max-w-[200px] text-sm uppercase tracking-widest">
                        Hit screen to break
                     </p>
                  </div>

               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* The Shards (Only visible when shattering) */}
      {isShattered && (
         <div className="absolute inset-4 z-20 pointer-events-none">
            {shards.map(shard => (
               <motion.div
                  key={shard.id}
                  className="absolute inset-0 backdrop-blur-sm bg-white/20 border border-white/50"
                  style={{ clipPath: shard.clipPath }}
                  initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                  animate={{ 
                     x: shard.tx, 
                     y: shard.ty, 
                     rotate: shard.r, 
                     scale: shard.scale, 
                     opacity: 0 
                  }}
                  transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
               />
            ))}
         </div>
      )}

    </div>
  );
}
