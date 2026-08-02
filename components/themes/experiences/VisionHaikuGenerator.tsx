"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Type, Loader2 } from "lucide-react";

export function VisionHaikuGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [phase, setPhase] = useState<"upload" | "analyzing" | "generating" | "result">("upload");
  const [tags, setTags] = useState<string[]>([]);

  // We use a high-quality static image representing a serene scene to simulate "uploaded" photo
  const uploadedImage = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"; // scenic landscape

  const haiku = [
     "Mountains kiss the sky,",
     "Silent fields of green below,",
     "Peace breathes in the wind."
  ];

  const handleUpload = () => {
     setPhase("analyzing");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock Computer Vision API extraction
     setTimeout(() => {
        setTags(["mountain", "valley", "greenery", "serene", "landscape", "sky"]);
        setPhase("generating");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50]);

        // Mock LLM generation from tags
        setTimeout(() => {
           setPhase("result");
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
           if (onComplete) setTimeout(onComplete, 8000);
        }, 2500);
     }, 2500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      <AnimatePresence mode="wait">
         {phase === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
               <div className="text-center max-w-sm">
                  <Eye size={48} className="mx-auto text-slate-300 mb-6" />
                  <h2 className="text-xl font-black uppercase tracking-widest mb-2">Vision-to-Poetry</h2>
                  <p className="text-sm text-slate-500 mb-8">
                     Upload a photograph. Our Computer Vision API will extract structural labels, and an LLM will synthesize them into a strict 5-7-5 Haiku.
                  </p>
                  <button 
                     onClick={handleUpload}
                     className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest transition-colors shadow-xl"
                  >
                     Select Photo
                  </button>
               </div>
            </motion.div>
         )}

         {(phase === "analyzing" || phase === "generating") && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900">
               
               <div className="relative w-64 h-64 rounded-2xl overflow-hidden mb-8 border border-slate-700 shadow-2xl">
                  <img src={uploadedImage} className="w-full h-full object-cover opacity-50 grayscale" />
                  
                  {/* Scanning line effect */}
                  <motion.div 
                     className="absolute inset-x-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]"
                     animate={{ top: ["0%", "100%", "0%"] }}
                     transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  />
               </div>

               <div className="h-24 flex flex-col items-center justify-center text-center">
                  {phase === "analyzing" ? (
                     <>
                        <Loader2 size={24} className="animate-spin text-green-400 mb-2" />
                        <div className="text-xs font-bold uppercase tracking-widest text-green-500">Extracting Vision Arrays...</div>
                     </>
                  ) : (
                     <>
                        <div className="flex flex-wrap gap-2 justify-center mb-4 max-w-xs">
                           {tags.map((t, i) => (
                              <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">#{t}</span>
                           ))}
                        </div>
                        <Loader2 size={24} className="animate-spin text-blue-400 mb-2" />
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-500">LLM Formatting Haiku...</div>
                     </>
                  )}
               </div>

            </motion.div>
         )}

         {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col bg-black">
               
               {/* Background Image full screen */}
               <div className="absolute inset-0">
                  <img src={uploadedImage} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
               </div>

               <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                     <span key={i} className="text-[10px] bg-black/50 backdrop-blur text-white/50 px-2 py-1 rounded border border-white/10">{t}</span>
                  ))}
               </div>

               <div className="flex-1 relative z-10 flex flex-col items-center justify-end pb-24 px-6 text-center">
                  <motion.div 
                     initial={{ y: 20, opacity: 0 }} 
                     animate={{ y: 0, opacity: 1 }} 
                     transition={{ delay: 0.5, duration: 1 }}
                     className="space-y-4"
                  >
                     <div className="text-3xl font-serif text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-relaxed">
                        {haiku.map((line, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1 + (i * 1.5) }}
                           >
                              {line}
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>
                  
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 6 }}
                     className="mt-12 text-[10px] uppercase tracking-widest text-white/50 flex items-center justify-center gap-2"
                  >
                     <Type size={12} /> Auto-Generated
                  </motion.div>
               </div>

            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
