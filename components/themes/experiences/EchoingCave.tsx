"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Waves } from "lucide-react";

export function EchoingCave({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isEchoing, setIsEchoing] = useState(false);
  const [echoProgress, setEchoProgress] = useState(0); // 0 to 1
  const [revealed, setRevealed] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8";
  
  const requestMic = async () => {
    try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       setHasPermission(true);
       streamRef.current = stream;
       startListening(stream);
    } catch (err) {
       console.error("Mic permission denied", err);
       setHasPermission(false);
    }
  };

  const startListening = (stream: MediaStream) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    setIsListening(true);
    checkVolume();
  };

  const checkVolume = () => {
    if (!analyzerRef.current || isEchoing) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
       sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // Volume threshold to trigger the echo
    if (average > 30) {
       triggerEcho();
    } else {
       rafRef.current = requestAnimationFrame(checkVolume);
    }
  };

  const triggerEcho = () => {
    setIsListening(false);
    setIsEchoing(true);
    
    // Stop recording
    if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioContextRef.current) {
       audioContextRef.current.close();
    }

    // Simulate an echo bouncing around the cave, slowly revealing the text
    let progress = 0;
    const echoInterval = setInterval(() => {
       progress += 0.05;
       setEchoProgress(Math.min(1, progress));
       
       if (progress >= 1) {
          clearInterval(echoInterval);
          setRevealed(true);
          if (onComplete) onComplete();
       }
    }, 200);
  };

  // Cleanup
  useEffect(() => {
     return () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }
     };
  }, []);

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative flex flex-col items-center justify-center font-serif select-none overflow-hidden text-white">
      
      {/* Cave Background */}
      <div 
         className="absolute inset-0 opacity-30 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-rock.png')" }} 
      />

      <div className="relative z-10 w-full max-w-lg p-8 flex flex-col items-center justify-center min-h-[50vh]">
         
         <AnimatePresence mode="wait">
            {hasPermission === null && !revealed && (
               <motion.div 
                  key="request"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center gap-6"
               >
                  <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center">
                     <Mic size={48} className="text-zinc-500" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold mb-2 text-zinc-300">The Cave is Silent</h2>
                     <p className="text-zinc-500 text-sm mb-8">It will only respond if you call out to it.</p>
                     <button 
                        onClick={requestMic}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs rounded-full transition-colors"
                     >
                        Enable Microphone
                     </button>
                  </div>
               </motion.div>
            )}

            {hasPermission === false && (
               <motion.div key="denied" className="text-center text-red-400">
                  Microphone access denied. The cave remains silent forever.
               </motion.div>
            )}

            {isListening && !isEchoing && (
               <motion.div 
                  key="listening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
               >
                  <div className="w-32 h-32 relative flex items-center justify-center">
                     <div className="absolute inset-0 border-2 border-zinc-600 rounded-full animate-ping" />
                     <Mic size={32} className="text-zinc-400 animate-pulse" />
                  </div>
                  <p className="mt-8 text-xl text-zinc-400 font-serif italic tracking-wider">
                     Say "Hello" into the darkness...
                  </p>
               </motion.div>
            )}

            {isEchoing && (
               <motion.div 
                  key="echoing"
                  className="w-full relative flex flex-col items-center"
               >
                  {/* The Echo Rings */}
                  {!revealed && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div 
                           className="w-full aspect-square border-2 border-white/20 rounded-full"
                           animate={{ scale: [1, 3], opacity: [1, 0] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.div 
                           className="absolute w-full aspect-square border-2 border-white/10 rounded-full"
                           animate={{ scale: [1, 3], opacity: [1, 0] }}
                           transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                        />
                     </div>
                  )}
                  
                  <div className="relative z-10 w-full text-center">
                     <motion.h2 
                        className="text-3xl font-bold mb-8 uppercase tracking-[0.2em]"
                        style={{ color: primaryColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: echoProgress }}
                     >
                        {config.title || "The Response"}
                     </motion.h2>
                     
                     <div className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-md mx-auto whitespace-pre-wrap px-4 font-medium" style={{ textShadow: "0 4px 20px rgba(255,255,255,0.2)" }}>
                        {/* Reveal text character by character based on echoProgress */}
                        {(config.body || "Hello... hello... hello...\n\nI have been waiting for you to speak.\nThe silence was deafening.").split("").map((char, i, arr) => {
                           const threshold = i / arr.length;
                           return (
                              <span 
                                 key={i} 
                                 style={{ 
                                    opacity: echoProgress > threshold ? 1 : 0,
                                    filter: echoProgress > threshold ? "blur(0px)" : "blur(10px)",
                                    transition: "opacity 0.5s, filter 0.5s"
                                 }}
                              >
                                 {char}
                              </span>
                           );
                        })}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isEchoing && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setHasPermission(true);
                  triggerEcho();
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Simulate Shout (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
