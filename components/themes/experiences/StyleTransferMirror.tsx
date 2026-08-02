"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Paintbrush, Loader2 } from "lucide-react";

export function StyleTransferMirror({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899"; // pink-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<"normal" | "starry" | "scream" | "sketch">("normal");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
     let stream: MediaStream | null = null;

     const startCamera = async () => {
        try {
           stream = await navigator.mediaDevices.getUserMedia({ video: true });
           if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setStreamActive(true);
           }
        } catch (err) {
           console.warn("Camera access denied or unavailable.");
        }
     };

     startCamera();

     return () => {
        if (stream) {
           stream.getTracks().forEach(track => track.stop());
        }
     };
  }, []);

  const handleStyleChange = (style: "normal" | "starry" | "scream" | "sketch") => {
     if (style === currentStyle) return;
     setIsProcessing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);
     
     // Simulate loading a heavy TensorFlow model into VRAM
     setTimeout(() => {
        setCurrentStyle(style);
        setIsProcessing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        
        if (style !== "normal" && onComplete) {
           setTimeout(onComplete, 8000);
        }
     }, 1500);
  };

  // Simulated CSS-based "Neural Style Transfer" filters
  const getFilterCSS = () => {
     switch (currentStyle) {
        case "starry": return "contrast(1.5) saturate(2) sepia(0.5) hue-rotate(180deg) brightness(0.8)";
        case "scream": return "contrast(2) saturate(1.5) sepia(1) hue-rotate(-50deg) blur(1px)";
        case "sketch": return "grayscale(1) contrast(3) brightness(1.2)";
        default: return "none";
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Viewport */}
      <div className="flex-1 relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
         
         {!streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
               <Camera size={48} className="opacity-20" />
               <div className="text-xs uppercase tracking-widest font-bold">Awaiting Camera Feed</div>
            </div>
         )}

         {/* Camera Layer */}
         <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1] transition-all duration-1000"
            style={{ filter: getFilterCSS() }}
         />

         {/* Model Loading Overlay */}
         <AnimatePresence>
            {isProcessing && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20"
               >
                  <Loader2 size={48} className="animate-spin text-pink-500 mb-4" />
                  <div className="text-xs font-mono text-pink-400 uppercase tracking-widest">Compiling TFJS Graph...</div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
         <div className="flex justify-center gap-4">
            
            <button onClick={() => handleStyleChange("normal")} className={`w-16 h-16 rounded-full border-2 bg-slate-800 flex items-center justify-center transition-all ${currentStyle === "normal" ? 'border-white scale-110' : 'border-transparent opacity-50'}`}>
               <Camera size={24} />
            </button>

            <button onClick={() => handleStyleChange("starry")} className={`w-16 h-16 rounded-full border-2 bg-blue-900 flex items-center justify-center transition-all overflow-hidden relative ${currentStyle === "starry" ? 'border-white scale-110' : 'border-transparent opacity-50'}`}>
               <div className="absolute inset-0 bg-blue-600/50" />
               <Paintbrush size={24} className="relative z-10 text-yellow-300" />
            </button>

            <button onClick={() => handleStyleChange("scream")} className={`w-16 h-16 rounded-full border-2 bg-orange-900 flex items-center justify-center transition-all overflow-hidden relative ${currentStyle === "scream" ? 'border-white scale-110' : 'border-transparent opacity-50'}`}>
               <div className="absolute inset-0 bg-red-600/50" />
               <Paintbrush size={24} className="relative z-10 text-orange-200" />
            </button>

            <button onClick={() => handleStyleChange("sketch")} className={`w-16 h-16 rounded-full border-2 bg-white flex items-center justify-center transition-all overflow-hidden relative ${currentStyle === "sketch" ? 'border-black scale-110' : 'border-transparent opacity-50'}`}>
               <Paintbrush size={24} className="relative z-10 text-slate-900" />
            </button>

         </div>
      </div>

    </div>
  );
}
