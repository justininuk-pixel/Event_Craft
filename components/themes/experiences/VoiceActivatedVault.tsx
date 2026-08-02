"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Lock, Unlock, ShieldAlert, Terminal } from "lucide-react";

export function VoiceActivatedVault({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const password = ((config.experience as any)?.password || "open sesame").toLowerCase();
  const hiddenMemory = config.body || "This is the secret hidden inside the vault.";

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
     if (typeof window !== "undefined") {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
           const rec = new SpeechRecognition();
           rec.continuous = false;
           rec.interimResults = true;
           
           rec.onresult = (event: any) => {
              const current = event.resultIndex;
              const trans = event.results[current][0].transcript;
              setTranscript(trans);
           };

           rec.onerror = (event: any) => {
              console.error("Speech recognition error", event.error);
              setErrorMsg(`Error: ${event.error}`);
              setIsListening(false);
           };

           rec.onend = () => {
              setIsListening(false);
           };

           setRecognition(rec);
        } else {
           setErrorMsg("Speech Recognition API not supported in this browser.");
        }
     }
  }, []);

  // Validate whenever transcript updates
  useEffect(() => {
     if (!isUnlocked && transcript.toLowerCase().includes(password)) {
        handleUnlock();
     }
  }, [transcript]);

  const toggleListen = () => {
     setErrorMsg("");
     if (isListening) {
        recognition?.stop();
        setIsListening(false);
     } else {
        if (recognition) {
           try {
              setTranscript("");
              recognition.start();
              setIsListening(true);
           } catch (e) {
              setErrorMsg("Could not start microphone.");
           }
        }
     }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (manualInput.toLowerCase().includes(password)) {
        handleUnlock();
     } else {
        setErrorMsg("Access Denied");
        setManualInput("");
     }
  };

  const handleUnlock = () => {
     setIsUnlocked(true);
    onComplete?.();
     if (recognition && isListening) recognition.stop();
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
     if (onComplete) setTimeout(onComplete, 5000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-slate-300 items-center justify-center p-6"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background vault texture */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <AnimatePresence mode="wait">
         {!isUnlocked ? (
            <motion.div 
               key="locked"
               exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
               transition={{ duration: 0.8, ease: "easeIn" }}
               className="relative z-10 flex flex-col items-center max-w-sm w-full"
            >
               
               <div className="w-48 h-48 rounded-full border-[16px] border-slate-700 bg-slate-900 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] mb-12 relative">
                  {/* Rotating vault mechanics */}
                  <motion.div 
                     className="absolute inset-0 rounded-full border-[4px] border-dashed border-slate-600/50 m-4"
                     animate={{ rotate: isListening ? 360 : 0 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {isListening ? (
                     <Mic size={48} className="text-red-500 animate-pulse" />
                  ) : (
                     <Lock size={48} className="text-slate-500" />
                  )}
               </div>

               <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2 text-center">
                  {config.title || "Acoustic Vault"}
               </h2>
               
               <p className="text-sm text-slate-500 mb-8 text-center px-4 leading-relaxed">
                  Voice recognition active. <br/>Speak the passphrase to unlock.
               </p>

               <div className="w-full flex flex-col gap-4">
                  {useFallback ? (
                     <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input 
                           type="text" 
                           value={manualInput}
                           onChange={(e) => setManualInput(e.target.value)}
                           placeholder="Type passphrase..."
                           className="flex-1 bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                        />
                        <button type="submit" className="bg-slate-700 px-4 rounded font-bold hover:bg-slate-600 transition-colors">
                           Enter
                        </button>
                     </form>
                  ) : (
                     <button 
                        onClick={toggleListen}
                        className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest transition-all ${
                           isListening 
                              ? "bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                              : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                        }`}
                     >
                        {isListening ? "Listening..." : "Hold to Speak"}
                     </button>
                  )}

                  <div className="h-16 w-full flex items-center justify-center">
                     {transcript && (
                        <p className="text-yellow-400 italic text-center w-full truncate px-4">
                           "{transcript}"
                        </p>
                     )}
                     {errorMsg && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                           <ShieldAlert size={12} /> {errorMsg}
                        </p>
                     )}
                  </div>

                  {!useFallback && (
                     <button 
                        onClick={() => { setUseFallback(true); if (recognition) recognition.stop(); setIsListening(false); }}
                        className="text-xs text-slate-500 hover:text-slate-300 underline flex items-center justify-center gap-1 mt-4"
                     >
                        <Terminal size={12} /> Use Keyboard Override
                     </button>
                  )}
               </div>

            </motion.div>
         ) : (
            <motion.div 
               key="unlocked"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="relative z-10 w-full max-w-md bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-xl shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col items-center text-center"
            >
               <div className="w-16 h-16 bg-yellow-500 text-slate-900 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                  <Unlock size={32} />
               </div>
               
               <h3 className="text-2xl font-black text-yellow-400 mb-4 tracking-tight">
                  Access Granted
               </h3>
               
               <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-6" />
               
               <p className="text-lg text-slate-200 leading-relaxed font-sans font-medium">
                  {hiddenMemory}
               </p>

            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
