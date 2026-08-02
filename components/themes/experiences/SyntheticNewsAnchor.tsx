"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Mic, Loader2 } from "lucide-react";

export function SyntheticNewsAnchor({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb"; // blue-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const [headlines, setHeadlines] = useState<string[] | null>(null);
  const [currentHeadline, setCurrentHeadline] = useState<string | null>(null);
  const [isLipSyncing, setIsLipSyncing] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const loopRef = useRef<number>(0);

  useEffect(() => {
     if (typeof window !== "undefined") {
        synthRef.current = window.speechSynthesis;
     }

     // Mock fetching top headlines
     setTimeout(() => {
        setHeadlines([
           "Global markets rally amidst unprecedented AI infrastructure investments.",
           "New quantum computing breakthrough promises to redefine cryptography.",
           "Meteorologists warn of severe solar storm activity disrupting satellites."
        ]);
     }, 2000);

     return () => {
        if (synthRef.current) synthRef.current.cancel();
        cancelAnimationFrame(loopRef.current);
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close();
     };
  }, []);

  const handleStartBroadcast = async () => {
     if (!headlines) return;
     setAudioReady(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // We simulate audio context volume analysis because window.speechSynthesis doesn't natively pipe into WebAudio nodes easily in all browsers.
     // To make it robust, we will mock the volume based on whether TTS is speaking, combined with a sine wave for the visual lip-sync.
     
     const playNext = (index: number) => {
        if (index >= headlines.length) {
           setIsLipSyncing(false);
           setCurrentHeadline(null);
           if (onComplete) setTimeout(onComplete, 5000);
           return;
        }

        const script = `Breaking News: ${headlines[index]}.`;
        setCurrentHeadline(script);

        if (synthRef.current) {
           const utterance = new SpeechSynthesisUtterance(script);
           utterance.rate = 0.95; // News anchor pace
           
           // Lip sync animation loop
           setIsLipSyncing(true);
           let time = 0;
           const simLipSync = () => {
              if (synthRef.current?.speaking) {
                 time += 0.2;
                 // Mock volume thresholding for visemes
                 const vol = Math.abs(Math.sin(time)) > 0.3;
                 setIsLipSyncing(vol);
                 loopRef.current = requestAnimationFrame(simLipSync);
              } else {
                 setIsLipSyncing(false);
              }
           };
           simLipSync();

           utterance.onend = () => {
              cancelAnimationFrame(loopRef.current);
              setIsLipSyncing(false);
              setTimeout(() => playNext(index + 1), 1000); // Pause between headlines
           };

           utteranceRef.current = utterance;
           synthRef.current.speak(utterance);
        }
     };

     playNext(0);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-800 text-slate-100" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Broadcast Header */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4 bg-red-600 text-white px-4 py-2 font-black uppercase tracking-widest text-lg shadow-lg">
         <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> LIVE
      </div>

      <div className="absolute top-6 right-6 z-20 bg-blue-600 text-white px-4 py-2 font-black uppercase tracking-widest text-lg shadow-lg">
         NEWS NETWORK
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
         
         {/* The 3D Avatar (Mocked with a simple CSS constructed face) */}
         <div className="relative w-full max-w-lg aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
               
               {/* Head */}
               <div className="w-64 h-80 bg-orange-200 rounded-[100px] border-4 border-slate-900 flex flex-col items-center pt-24 relative shadow-2xl">
                  {/* Hair */}
                  <div className="absolute -top-4 -left-4 -right-4 h-32 bg-slate-900 rounded-t-[100px] rounded-b-[40px]" />
                  
                  {/* Eyes */}
                  <div className="flex gap-12 z-10 w-full justify-center">
                     <div className="w-4 h-4 bg-slate-900 rounded-full" />
                     <div className="w-4 h-4 bg-slate-900 rounded-full" />
                  </div>

                  {/* Nose */}
                  <div className="w-2 h-6 bg-orange-300 rounded-full mt-4 z-10" />

                  {/* Mouth (The Lip-Sync Component) */}
                  <div className="mt-8 z-10">
                     <motion.div 
                        className="bg-slate-900 rounded-full"
                        animate={{
                           width: isLipSyncing ? 40 : 20,
                           height: isLipSyncing ? 20 : 4,
                           borderRadius: isLipSyncing ? "100px" : "4px"
                        }}
                        transition={{ type: "tween", duration: 0.1 }}
                     />
                  </div>

                  {/* Suit */}
                  <div className="absolute -bottom-20 w-[150%] h-40 bg-blue-800 rounded-t-[200px] border-4 border-slate-900 flex justify-center z-20">
                     <div className="w-16 h-full bg-white relative flex justify-center">
                        {/* Tie */}
                        <div className="w-4 h-full bg-red-600 border-x-2 border-slate-900 mt-4" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* Lower Third Ticker */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex">
         <div className="bg-red-600 text-white font-black uppercase px-6 py-4 flex items-center shadow-lg whitespace-nowrap">
            BREAKING NEWS
         </div>
         <div className="flex-1 bg-blue-600 text-white px-6 py-4 font-bold flex items-center overflow-hidden shadow-lg border-l-4 border-white">
            <div className="w-full relative h-6 overflow-hidden">
               <AnimatePresence mode="popLayout">
                  {currentHeadline ? (
                     <motion.div 
                        key={currentHeadline}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        className="absolute inset-0 whitespace-nowrap truncate text-lg"
                     >
                        {currentHeadline}
                     </motion.div>
                  ) : (
                     <motion.div 
                        key="idle"
                        className="absolute inset-0 text-white/50 text-sm uppercase tracking-widest flex items-center"
                     >
                        Awaiting Audio Initialization
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* Control Overlay for initial play (Browsers block TTS without user interaction) */}
      {!audioReady && (
         <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur flex items-center justify-center">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
               <div className="mx-auto w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                  <Rss size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">Initialize Broadcast</h3>
                  <p className="text-sm text-slate-400">Browser policy requires interaction to begin Text-to-Speech audio pipelining.</p>
               </div>
               <button 
                  onClick={handleStartBroadcast}
                  disabled={!headlines}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
               >
                  {!headlines ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                  Start Broadcast
               </button>
            </div>
         </div>
      )}

    </div>
  );
}
