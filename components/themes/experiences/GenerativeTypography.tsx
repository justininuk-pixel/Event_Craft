"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Mic, Square } from "lucide-react";

export function GenerativeTypography({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#000000";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f4f4f5"]; // zinc-100

  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("BREATHE");
  
  // Font parameters
  const [weight, setWeight] = useState(400); // 100-900
  const [width, setWidth] = useState(100);   // 50-200
  const [italic, setItalic] = useState(0);   // 0-1

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const loopRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = async () => {
     try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        setIsListening(true);
        analyzeAudio();

     } catch (err) {
        console.error("Mic access denied", err);
        // Fallback to simulated audio if denied
        setIsListening(true);
        simulateAudio();
     }
  };

  const simulateAudio = () => {
     let time = 0;
     const sim = () => {
        time += 0.05;
        const vol = (Math.sin(time) * 0.5 + 0.5) * 100; // 0-100
        const pitch = (Math.cos(time * 0.5) * 0.5 + 0.5) * 100;

        // Lerp for smooth simulated transitions
        setWeight(w => w + ((100 + (vol * 8)) - w) * 0.1);
        setWidth(wd => wd + ((50 + (pitch * 1.5)) - wd) * 0.1);
        setItalic(i => i + ((pitch > 70 ? 1 : 0) - i) * 0.1);

        loopRef.current = requestAnimationFrame(sim);
     };
     sim();
  };

  const analyzeAudio = () => {
     if (!analyzerRef.current) return;
     const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
     
     const render = () => {
        analyzerRef.current!.getByteFrequencyData(dataArray);

        // Calculate rough volume
        let sum = 0;
        for(let i=0; i<dataArray.length; i++) {
           sum += dataArray[i];
        }
        const avgVolume = sum / dataArray.length; // 0-255

        // Calculate rough pitch (center of mass)
        let weightedSum = 0;
        for(let i=0; i<dataArray.length; i++) {
           weightedSum += dataArray[i] * i;
        }
        const pitchIndex = sum === 0 ? 0 : weightedSum / sum;
        const normalizedPitch = Math.min(1, pitchIndex / (dataArray.length / 4)); // 0-1

        // Map to font axes
        const targetWeight = 100 + (avgVolume / 255) * 800; // 100 to 900
        const targetWidth = 50 + (normalizedPitch) * 150; // 50 to 200
        const targetItalic = normalizedPitch > 0.6 ? 1 : 0;

        setWeight(w => w + (targetWeight - w) * 0.2);
        setWidth(wd => wd + (targetWidth - wd) * 0.2);
        setItalic(i => i + (targetItalic - i) * 0.2);

        loopRef.current = requestAnimationFrame(render);
     };
     render();
  };

  const stopListening = () => {
     cancelAnimationFrame(loopRef.current);
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
     }
     if (audioCtxRef.current) {
        audioCtxRef.current.close();
     }
     setIsListening(false);
     setWeight(400);
     setWidth(100);
     setItalic(0);
     if (onComplete) setTimeout(onComplete, 2000);
  };

  useEffect(() => {
     return () => {
        cancelAnimationFrame(loopRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close();
     };
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-100 text-black" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Fallback to system fonts that support varying weight, but simulate the width via scaleX if needed, though real variable fonts are better. 
          We'll use a generic sans-serif but explicitly set font-variation-settings. */}
      
      <div className="p-6 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
            Audio-Reactive Type
         </h2>
         <button 
            onClick={isListening ? stopListening : startListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-black text-white animate-pulse' : 'bg-zinc-300 hover:bg-zinc-400 text-zinc-600'}`}
         >
            {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
         </button>
      </div>

      <div className="absolute top-24 left-6 right-6 flex flex-col items-center pointer-events-none">
         <input 
            type="text" 
            value={text}
            onChange={e => setText(e.target.value.toUpperCase())}
            maxLength={10}
            className="bg-transparent text-center text-xs uppercase tracking-widest font-bold text-zinc-400 border-b border-zinc-300 outline-none pb-1 pointer-events-auto"
            placeholder="Type a word..."
         />
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 w-full h-full">
         
         <div 
            className="text-[15vw] leading-none text-center select-text pointer-events-none transition-transform duration-75"
            style={{ 
               fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
               fontWeight: weight,
               fontStyle: italic > 0.5 ? 'italic' : 'normal',
               transform: `scaleX(${width / 100})`, // Faking font-stretch since not all system fonts support 'wdth' axis
               fontVariationSettings: `"wght" ${weight}, "wdth" ${width}, "slnt" ${italic * -10}`
            }}
         >
            {text}
         </div>

      </div>

      {isListening && (
         <div className="absolute bottom-6 left-6 right-6 flex justify-center gap-4 text-[10px] font-mono text-zinc-400 uppercase">
            <div>Wght: {Math.round(weight)}</div>
            <div>Wdth: {Math.round(width)}</div>
         </div>
      )}

    </div>
  );
}
