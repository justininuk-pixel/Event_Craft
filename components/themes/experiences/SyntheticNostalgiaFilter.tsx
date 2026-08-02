"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, Loader2, Upload } from "lucide-react";

export function SyntheticNostalgiaFilter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // stone-900

  const [phase, setPhase] = useState<"upload" | "processing" | "result">("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = () => {
     if (phase !== "upload") return;
     
     // Mocking an upload
     setPhase("processing");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        // Mock returning a heavily degraded image
        setImageUrl("https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"); // Retro looking film photo
        setPhase("result");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 3000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-stone-900 text-stone-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-stone-800 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-stone-400">
            <Camera size={16} /> Algorithmic Degradation
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center relative">
         
         <AnimatePresence mode="wait">
            
            {phase === "upload" && (
               <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm space-y-8 text-center">
                  <div className="space-y-2">
                     <h1 className="text-3xl font-black text-white">Synthetic Nostalgia</h1>
                     <p className="text-sm text-stone-500">
                        Upload a perfect, modern 4K photograph. We will use an Image-to-Image API with hardcoded negative constraints to systematically ruin it with 1998 disposable camera artifacts.
                     </p>
                  </div>

                  <button 
                     onClick={handleUpload}
                     className="w-full aspect-square border-2 border-dashed border-stone-700 hover:border-stone-500 rounded-3xl flex flex-col items-center justify-center gap-4 transition-colors group bg-stone-800/30"
                  >
                     <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-stone-400" />
                     </div>
                     <div className="font-bold uppercase tracking-widest text-xs text-stone-500">Select Image</div>
                  </button>
               </motion.div>
            )}

            {phase === "processing" && (
               <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-6">
                  <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  >
                     <Loader2 size={48} className="text-orange-500" />
                  </motion.div>
                  <div className="text-center">
                     <div className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Applying Strict Prompt</div>
                     <div className="text-[10px] uppercase tracking-widest text-stone-500 font-mono">
                        "1998 disposable camera, heavy grain, light leaks, chromatic aberration"
                     </div>
                  </div>
               </motion.div>
            )}

            {phase === "result" && imageUrl && (
               <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md flex flex-col items-center">
                  
                  <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6">Data Degradation Complete</div>

                  {/* Fake Polaroid Frame */}
                  <div className="bg-white p-4 pb-16 shadow-2xl relative">
                     {/* The degraded image */}
                     <img src={imageUrl} className="w-full h-auto filter contrast-125 saturate-150 sepia-[0.2]" alt="Degraded" />
                     
                     {/* Fake timestamp overlay */}
                     <div className="absolute bottom-20 right-6 text-orange-500 font-mono text-lg font-black drop-shadow-md tracking-tighter filter blur-[0.5px]">
                        '98 10 24
                     </div>
                  </div>

                  <button 
                     onClick={() => setPhase("upload")}
                     className="mt-12 text-[10px] uppercase font-bold tracking-widest text-stone-600 hover:text-stone-400 transition-colors"
                  >
                     Degrade Another Image
                  </button>

               </motion.div>
            )}

         </AnimatePresence>

      </div>

    </div>
  );
}
