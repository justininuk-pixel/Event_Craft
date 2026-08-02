"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image as ImageIcon, Loader2 } from "lucide-react";

export function DreamVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#c084fc"; // purple-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Mock Voice Recognition
  const handleRecord = () => {
     if (isListening || isGenerating || imageUrl) return;
     
     setIsListening(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Fake transcription over 4 seconds
     const mockSpeech = "I was flying over a city made entirely of giant ticking clocks while a violet moon watched me.";
     let currentIdx = 0;
     setTranscript("");

     const typing = setInterval(() => {
        currentIdx += 3;
        setTranscript(mockSpeech.substring(0, currentIdx));
        if (currentIdx >= mockSpeech.length) {
           clearInterval(typing);
           setIsListening(false);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 20]);
           
           // Auto-trigger generation
           setTimeout(handleGenerate, 1000);
        }
     }, 100);
  };

  const handleGenerate = () => {
     setIsGenerating(true);
     
     // Mock DALL-E / Midjourney delay
     setTimeout(() => {
        setIsGenerating(false);
        // Realistic unsplash placeholder representing a surreal clock scene
        setImageUrl("https://images.unsplash.com/photo-1501139083538-0139583c060f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 4000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto z-10">
         
         <AnimatePresence mode="wait">
            {!imageUrl ? (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
                  
                  <button 
                     onClick={handleRecord}
                     disabled={isListening || isGenerating}
                     className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                        isListening 
                           ? 'bg-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.6)] animate-pulse' 
                           : 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-700'
                     }`}
                  >
                     {isGenerating ? <Loader2 size={40} className="animate-spin text-purple-400" /> : <Mic size={40} className={isListening ? 'text-white' : 'text-slate-400'} />}
                  </button>

                  <div className="mt-8 text-center min-h-[100px] w-full px-4">
                     {isListening && (
                        <div className="text-[10px] uppercase tracking-widest text-purple-400 mb-2 animate-pulse">Recording Speech...</div>
                     )}
                     {isGenerating && (
                        <div className="text-[10px] uppercase tracking-widest text-fuchsia-400 mb-2 flex items-center justify-center gap-2">
                           <Loader2 size={12} className="animate-spin" /> Piping to Text-to-Image API...
                        </div>
                     )}
                     {!isListening && !isGenerating && !transcript && (
                        <div className="text-sm font-bold text-slate-500 mt-4">Tap to describe your dream</div>
                     )}
                     <div className="text-xl font-serif italic text-white/90">
                        {transcript}
                     </div>
                  </div>

               </motion.div>
            ) : (
               <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full relative">
                  
                  <div className="absolute -top-12 left-0 right-0 text-center">
                     <h3 className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                        <ImageIcon size={12} /> Render Complete
                     </h3>
                  </div>

                  <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 relative">
                     <img src={imageUrl} alt="Generated Dream" className="w-full h-full object-cover" />
                     <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <p className="text-sm font-serif italic text-slate-300 drop-shadow-md">
                           "{transcript}"
                        </p>
                     </div>
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
