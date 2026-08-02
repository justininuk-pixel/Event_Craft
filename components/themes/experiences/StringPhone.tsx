"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Mic, Phone, PhoneOff, Settings2, ShieldAlert } from "lucide-react";

export function StringPhone({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8"; // slate-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0); // For visualizing mic input

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const initCall = async () => {
     try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        setHasMicPermission(true);
        setIsConnected(true);
        
        // Setup Audio Context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        
        // --- Tin Can Audio Filter Chain ---
        
        // 1. Bandpass filter to cut highs and lows (makes it sound hollow/telephonic)
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 1200; // Center freq
        bandpass.Q.value = 0.8;

        // 2. Highpass filter to aggressively cut bass
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 600;

        // 3. Lowpass filter to cut sharp highs
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 3000;

        // 4. WaveShaper for distortion (tin rattle)
        const distortion = ctx.createWaveShaper();
        distortion.curve = makeDistortionCurve(100);
        distortion.oversample = '4x';

        // 5. Analyser for UI
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Connect chain: Source -> Filters -> Distortion -> Analyser
        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(bandpass);
        bandpass.connect(distortion);
        distortion.connect(analyser);

        // In a real app, we'd send this stream over WebRTC.
        // For Editor/Demo, we connect to destination so the user can hear the effect on their own voice.
        // (Note: this causes feedback if they aren't using headphones, so we keep gain very low or warn them)
        const gain = ctx.createGain();
        gain.gain.value = 0.5;
        analyser.connect(gain);
        gain.connect(ctx.destination);

        monitorVolume();

        if (onComplete) setTimeout(onComplete, 10000); // mark complete after 10s of being in call
     } catch (e) {
        console.error("Mic error:", e);
        setHasMicPermission(false);
     }
  };

  const endCall = () => {
     setIsConnected(false);
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
     }
     if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
     }
     if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
     }
  };

  useEffect(() => {
     return () => endCall();
  }, []);

  const monitorVolume = () => {
     if (!analyserRef.current) return;
     const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
     
     const update = () => {
        analyserRef.current!.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        setVolume(avg);
        rafRef.current = requestAnimationFrame(update);
     };
     update();
  };

  // Distortion curve generator
  function makeDistortionCurve(amount: number) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      let x;
      for (let i = 0; i < n_samples; ++i ) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
  }

  // Visual string vibration based on volume
  const vibrationAmount = isConnected ? (volume / 255) * 10 : 0;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background String Graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <motion.div 
            className="w-full h-1 bg-white/50"
            animate={{ 
               y: [0, -vibrationAmount, vibrationAmount, 0]
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
         />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mt-12">
            <h2 className="text-3xl font-black tracking-tight mb-2">
               {config.title || "The String Phone"}
            </h2>
            <p className="text-white/60 font-medium">
               {isConnected ? "Connection established. Try speaking." : (config.body || "A direct line to me.")}
            </p>
         </div>

         {/* The Tin Can Visual */}
         <div className="relative flex flex-col items-center justify-center my-12">
            <motion.div 
               className="w-48 h-48 rounded-full border-4 shadow-2xl flex items-center justify-center relative overflow-hidden"
               style={{ 
                  backgroundColor: "#cbd5e1", // tin color
                  borderColor: "#94a3b8"
               }}
               animate={{ scale: isConnected ? 1.05 + (volume / 255) * 0.1 : 1 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
               {/* Tin texture rings */}
               <div className="absolute inset-2 rounded-full border border-black/10" />
               <div className="absolute inset-8 rounded-full border border-black/10" />
               <div className="absolute inset-14 rounded-full border-2 border-black/20 shadow-inner" />
               
               {/* The string hole */}
               <div className="w-4 h-4 bg-black rounded-full shadow-inner z-10 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white/80 rounded-full" />
               </div>

               {/* Ambient overlay */}
               <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/20 mix-blend-overlay pointer-events-none" />
            </motion.div>

            {/* String coming out */}
            <motion.div 
               className="absolute top-1/2 left-1/2 w-1 -ml-[2px] bg-amber-100 origin-top shadow-sm z-0"
               style={{ height: '300px' }}
               animate={{ 
                  rotate: isConnected ? (Math.random() - 0.5) * (volume / 255) * 10 : 0
               }}
            />
         </div>

         {/* Controls */}
         <div className="w-full flex flex-col items-center gap-4 mb-8">
            
            {!isConnected ? (
               <button 
                  onClick={initCall}
                  className="bg-green-500 hover:bg-green-400 text-white p-6 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
               >
                  <Phone size={32} />
               </button>
            ) : (
               <div className="flex gap-4">
                  <button 
                     onClick={endCall}
                     className="bg-red-500 hover:bg-red-400 text-white p-6 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
                  >
                     <PhoneOff size={32} />
                  </button>
               </div>
            )}

            {hasMicPermission === false && (
               <div className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-4 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/20">
                  <ShieldAlert size={14} /> Microphone permission denied
               </div>
            )}

            {mode === "editor-preview" && isConnected && (
               <div className="text-xs text-white/50 text-center max-w-[250px] mt-4 bg-black/20 p-3 rounded-lg border border-white/10">
                  <Settings2 size={12} className="inline mr-1" />
                  <strong>Editor Preview:</strong> Your microphone is looped back to your speakers so you can hear the filter. Wear headphones to avoid echo.
               </div>
            )}
         </div>

      </div>

    </div>
  );
}
