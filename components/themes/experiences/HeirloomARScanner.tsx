"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, Maximize, AlertCircle } from "lucide-react";

export function HeirloomARScanner({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#06b6d4"; // cyan-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const targetImage = (config.experience as any)?.targetImage || "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=400&auto=format&fit=crop"; // An old pocket watch
  const memoryText = config.body || "Given to me by Grandpa Joe in 1995. It hasn't ticked since 2012, but I still wind it every Sunday.";
  const title = config.title || "Grandpa's Watch";

  const [scanState, setScanState] = useState<"initializing" | "scanning" | "found">("initializing");
  
  useEffect(() => {
     // Simulate the AR startup sequence
     const t1 = setTimeout(() => setScanState("scanning"), 1500);
     const t2 = setTimeout(() => {
        setScanState("found");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     }, 4000);
     
     return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Simulated Camera Feed Background */}
      <div className="absolute inset-0 z-0">
         <img 
            src={targetImage} 
            alt="Camera Feed" 
            className={`w-full h-full object-cover transition-all duration-1000 ${
               scanState === "found" ? "scale-105 blur-sm" : "scale-100 blur-md grayscale opacity-50"
            }`}
         />
         <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* AR UI Overlay */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col">
         
         {/* Top HUD */}
         <div className="flex justify-between items-center opacity-70">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC
            </div>
            <div className="text-[10px] font-mono border border-white/20 px-2 py-1 rounded">
               WebXR : ACTIVE
            </div>
         </div>

         {/* Center Reticle / Scanning Area */}
         <div className="flex-1 flex items-center justify-center relative">
            
            <AnimatePresence mode="wait">
               {scanState === "initializing" && (
                  <motion.div 
                     key="init"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="flex flex-col items-center text-cyan-400 font-mono"
                  >
                     <Camera size={32} className="mb-4 animate-bounce" />
                     <p className="text-xs uppercase tracking-widest animate-pulse">Initializing Camera...</p>
                  </motion.div>
               )}

               {scanState === "scanning" && (
                  <motion.div 
                     key="scan"
                     initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
                     className="relative w-64 h-64 flex items-center justify-center"
                  >
                     {/* Scanning Box Corners */}
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
                     
                     {/* Scanning Line */}
                     <motion.div 
                        className="absolute left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     />

                     <div className="absolute -bottom-8 text-[10px] font-mono text-cyan-400 tracking-widest uppercase animate-pulse flex items-center gap-2">
                        <Scan size={12} /> Searching for Image Target...
                     </div>
                  </motion.div>
               )}

               {scanState === "found" && (
                  <motion.div 
                     key="found"
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                     className="relative flex flex-col items-center"
                  >
                     {/* 3D-ish Hologram Card anchored to object */}
                     <div 
                        className="bg-black/80 backdrop-blur-md border border-cyan-500/50 p-6 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] max-w-sm relative"
                        style={{
                           transformStyle: "preserve-3d",
                           transform: "perspective(1000px) rotateX(10deg) rotateY(-5deg)",
                        }}
                     >
                        <div className="absolute -top-3 -left-3 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                           Target Locked
                        </div>
                        
                        <h3 className="text-xl font-black italic mb-3 text-cyan-50" style={{ transform: "translateZ(20px)" }}>
                           {title}
                        </h3>
                        <p className="text-sm leading-relaxed text-cyan-100/80 font-mono" style={{ transform: "translateZ(10px)" }}>
                           {memoryText}
                        </p>

                        <div className="mt-6 flex justify-end">
                           <button 
                              onClick={() => { if (onComplete) onComplete(); }}
                              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded text-cyan-300 text-xs font-bold uppercase tracking-widest transition-colors"
                              style={{ transform: "translateZ(30px)" }}
                           >
                              Close
                           </button>
                        </div>
                     </div>
                     
                     {/* Connecting Line to object */}
                     <div className="w-[2px] h-16 bg-gradient-to-b from-cyan-500/50 to-transparent mt-2" />
                     
                     {/* Ground target reticle */}
                     <div className="w-16 h-16 border border-cyan-500/50 rounded-full" style={{ transform: "perspective(500px) rotateX(70deg)" }}>
                        <div className="w-full h-full border-2 border-dashed border-cyan-400 rounded-full animate-[spin_4s_linear_infinite]" />
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>
         
         {/* Bottom HUD */}
         <div className="mt-auto pt-6 flex justify-between items-end opacity-50 font-mono text-[10px]">
            <div>LAT: 40.7128° N<br/>LNG: 74.0060° W</div>
            <Maximize size={20} className="text-cyan-400" />
         </div>

      </div>

    </div>
  );
}
