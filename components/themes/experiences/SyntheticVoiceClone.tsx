"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Mic, Volume2, Loader2, Play } from "lucide-react";

export function SyntheticVoiceClone({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // sky-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSynthesize = () => {
     if (!input.trim() || isProcessing || isPlaying) return;

     setIsProcessing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock ElevenLabs API delay
     setTimeout(() => {
        setIsProcessing(false);
        setIsPlaying(true);
        
        // Use browser TTS as a proxy for "cloned voice"
        if ("speechSynthesis" in window) {
           const utterance = new SpeechSynthesisUtterance(input);
           
           // Try to find a specific voice to sound unique (like a clone)
           const voices = window.speechSynthesis.getVoices();
           if (voices.length > 0) {
              // Pick the last voice or a specific one to ensure it sounds different from default
              utterance.voice = voices[voices.length - 1]; 
           }
           
           utterance.pitch = 0.8; // Deepen slightly to simulate a specific identity
           utterance.rate = 0.9;
           
           utterance.onend = () => {
              setIsPlaying(false);
              if (onComplete) setTimeout(onComplete, 3000);
           };

           window.speechSynthesis.speak(utterance);
        } else {
           // Fallback
           setTimeout(() => {
              setIsPlaying(false);
              if (onComplete) setTimeout(onComplete, 3000);
           }, 3000);
        }
        
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-800 flex justify-between items-center z-10 bg-slate-950/50 backdrop-blur-md">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
               <Mic size={16} /> Synthetic Clone
            </h2>
            <div className="text-[10px] text-sky-500/50 mt-1 uppercase flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
               Model: v2_custom_identity_04
            </div>
         </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
         
         <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Input Text Payload</label>
            <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Type something to hear it in their voice..."
               className="w-full h-32 bg-slate-900/50 text-slate-200 border border-slate-700 rounded-xl p-4 focus:outline-none focus:border-sky-500 resize-none transition-colors"
               disabled={isProcessing || isPlaying}
            />

            <div className="mt-6 flex justify-end">
               <button 
                  onClick={handleSynthesize}
                  disabled={!input.trim() || isProcessing || isPlaying}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-900/20"
               >
                  {isProcessing ? (
                     <><Loader2 size={16} className="animate-spin" /> Synthesizing Audio Buffer...</>
                  ) : isPlaying ? (
                     <><Volume2 size={16} className="animate-pulse" /> Playback Active</>
                  ) : (
                     <><Play size={16} /> Generate Audio</>
                  )}
               </button>
            </div>
         </div>

         {/* Visualizer */}
         <div className="mt-12 w-full h-24 flex items-center justify-center gap-1 opacity-50">
            {Array.from({ length: 30 }).map((_, i) => (
               <motion.div 
                  key={i}
                  className="w-1 bg-sky-500 rounded-full"
                  initial={{ height: 4 }}
                  animate={{ 
                     height: isPlaying ? Math.random() * 60 + 10 : 4,
                     opacity: isPlaying ? 1 : 0.2
                  }}
                  transition={{
                     duration: 0.1,
                     repeat: isPlaying ? Infinity : 0,
                     repeatType: "reverse"
                  }}
               />
            ))}
         </div>

      </div>

    </div>
  );
}
