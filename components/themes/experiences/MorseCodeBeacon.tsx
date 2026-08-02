"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Play, Square, Check } from "lucide-react";

// Standard International Morse Code map
const morseMap: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", 
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
  " ": " " // space between words
};

export function MorseCodeBeacon({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [hasPlayedFullSequence, setHasPlayedFullSequence] = useState(false);
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308";
  
  // Convert message to morse sequence
  const message = (config.body || "SOS HELP").toUpperCase();
  const speedWPM = 10; 
  const dotDuration = 1200 / speedWPM; // standard morse formula: dot duration in ms = 1200 / WPM
  
  const sequenceRef = useRef<{on: boolean, duration: number}[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Build the timing sequence on mount
  useEffect(() => {
    const seq: {on: boolean, duration: number}[] = [];
    
    for (let i = 0; i < message.length; i++) {
       const char = message[i];
       
       if (char === " ") {
          // Word gap = 7 dots (we subtract 3 because letter gap already adds 3)
          seq.push({ on: false, duration: dotDuration * 4 }); 
          continue;
       }

       const code = morseMap[char];
       if (code) {
          for (let j = 0; j < code.length; j++) {
             const symbol = code[j];
             // Beep
             seq.push({ on: true, duration: symbol === "." ? dotDuration : dotDuration * 3 });
             
             // Intra-character gap = 1 dot
             if (j < code.length - 1) {
                seq.push({ on: false, duration: dotDuration });
             }
          }
          // Inter-character gap = 3 dots
          seq.push({ on: false, duration: dotDuration * 3 });
       }
    }
    
    sequenceRef.current = seq;
  }, [message, dotDuration]);

  // The playback engine
  const playSequence = useCallback(async () => {
    setIsPlaying(true);
    let isCancelled = false;

    // Helper to sleep
    const sleep = (ms: number) => new Promise(resolve => {
       timeoutRef.current = setTimeout(resolve, ms);
    });

    for (const step of sequenceRef.current) {
       if (isCancelled) break; // Check if user stopped it

       setIsLightOn(step.on);
       await sleep(step.duration);
    }

    setIsLightOn(false);
    setIsPlaying(false);
    if (!isCancelled) {
       setHasPlayedFullSequence(true);
       if (onComplete) onComplete();
    }

    return () => { isCancelled = true; };
  }, [onComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
       if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleToggle = () => {
     if (isPlaying) {
        setIsPlaying(false);
        setIsLightOn(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
     } else {
        playSequence();
     }
  };

  return (
    <div className="w-full h-full bg-slate-950 relative flex flex-col items-center justify-center select-none overflow-hidden font-mono">
      
      {/* Background Ambience */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-sm p-8">
         
         {/* The Beacon */}
         <div className="relative flex items-center justify-center w-32 h-32">
            
            {/* The Lens (Always visible) */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner overflow-hidden">
               {/* Glass reflection */}
               <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-md" />
            </div>

            {/* The Light */}
            <div 
               className="absolute w-24 h-24 rounded-full transition-all duration-75"
               style={{ 
                  backgroundColor: isLightOn ? primaryColor : "transparent",
                  opacity: isLightOn ? 1 : 0,
                  boxShadow: isLightOn ? `0 0 40px ${primaryColor}, 0 0 80px ${primaryColor}` : 'none'
               }}
            />

            {/* Bloom overlay */}
            {isLightOn && (
               <div 
                  className="absolute inset-[-100%] z-50 pointer-events-none mix-blend-screen opacity-50 blur-3xl transition-opacity duration-75"
                  style={{ backgroundColor: primaryColor }}
               />
            )}
         </div>

         {/* Controls */}
         <div className="flex flex-col items-center gap-6 mt-8">
            <button 
               onClick={handleToggle}
               className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
               {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
            </button>
            <span className="text-slate-500 uppercase tracking-widest text-xs font-bold">
               {isPlaying ? "Transmitting..." : "Start Sequence"}
            </span>
         </div>

         {/* Status */}
         {hasPlayedFullSequence && !isPlaying && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 animate-pulse">
               <Check size={16} />
               <span className="text-xs uppercase tracking-widest font-bold">Sequence Complete</span>
            </div>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setHasPlayedFullSequence(true);
                  if (onComplete) onComplete();
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Auto-Complete (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
