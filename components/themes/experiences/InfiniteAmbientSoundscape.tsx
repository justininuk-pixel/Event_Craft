"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Sliders, Volume2, Square } from "lucide-react";

export function InfiniteAmbientSoundscape({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isPlaying, setIsPlaying] = useState(false);
  
  // Mix Parameters (0.0 to 1.0)
  const [params, setParams] = useState({
     tension: 0.2, // detune/dissonance
     nature: 0.5, // noise/filter modulation
     industrial: 0.3 // fm synthesis depth
  });

  const ctxRef = useRef<AudioContext | null>(null);
  
  // Nodes refs for dynamic modulation
  const nodesRef = useRef<{
     osc1: OscillatorNode,
     osc2: OscillatorNode,
     fmOsc: OscillatorNode,
     noise: AudioBufferSourceNode,
     filter: BiquadFilterNode,
     masterGain: GainNode
  } | null>(null);

  const loopRef = useRef<number>(0);

  const startAudio = () => {
     if (isPlaying) return;
     if (!window.AudioContext && !(window as any).webkitAudioContext) return;
     
     const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
     ctxRef.current = ctx;

     // Setup Master Gain
     const masterGain = ctx.createGain();
     masterGain.gain.value = 0.5;
     masterGain.connect(ctx.destination);

     // Setup Delay FX
     const delay = ctx.createDelay(5.0);
     delay.delayTime.value = 1.5;
     const feedback = ctx.createGain();
     feedback.gain.value = 0.4;
     delay.connect(feedback);
     feedback.connect(delay);
     delay.connect(masterGain);

     // Setup Filter
     const filter = ctx.createBiquadFilter();
     filter.type = "lowpass";
     filter.Q.value = 5;
     filter.connect(masterGain);
     filter.connect(delay);

     // Base drones
     const osc1 = ctx.createOscillator();
     osc1.type = "sine";
     osc1.frequency.value = 55; // A1
     osc1.connect(filter);
     osc1.start();

     const osc2 = ctx.createOscillator();
     osc2.type = "triangle";
     osc2.frequency.value = 55 * 1.5; // P5
     osc2.connect(filter);
     osc2.start();

     // FM synthesis for "Industrial"
     const fmOsc = ctx.createOscillator();
     const fmGain = ctx.createGain();
     fmOsc.type = "square";
     fmOsc.frequency.value = 110;
     fmOsc.connect(fmGain);
     fmGain.connect(osc1.frequency); // modulate base drone frequency
     fmOsc.start();

     // Noise for "Nature" (wind/rain)
     const bufferSize = ctx.sampleRate * 2;
     const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
     const output = noiseBuffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
     }
     const noise = ctx.createBufferSource();
     noise.buffer = noiseBuffer;
     noise.loop = true;
     
     const noiseFilter = ctx.createBiquadFilter();
     noiseFilter.type = "bandpass";
     noiseFilter.connect(masterGain);
     noise.connect(noiseFilter);
     noise.start();

     nodesRef.current = { osc1, osc2, fmOsc, noise, filter: noiseFilter, masterGain };
     setIsPlaying(true);

     // Modulation Loop
     let time = 0;
     const modulate = () => {
        time += 0.05;
        
        // Use params to modulate actual web audio graph
        const { tension, nature, industrial } = params;

        // Tension: detunes osc2 and raises base filter cutoff slightly
        osc2.detune.setTargetAtTime(tension * 100 * Math.sin(time), ctx.currentTime, 0.1);
        filter.frequency.setTargetAtTime(100 + (tension * 500) + (nature * 200 * Math.sin(time * 0.5)), ctx.currentTime, 0.1);

        // Industrial: Increases FM depth and rate
        fmGain.gain.setTargetAtTime(industrial * 500, ctx.currentTime, 0.1);
        fmOsc.frequency.setTargetAtTime(55 + (industrial * 200), ctx.currentTime, 0.1);

        // Nature: Modulates noise filter to sound like wind swelling
        noiseFilter.frequency.setTargetAtTime(400 + (nature * 800) + (Math.sin(time * 0.2) * 300 * nature), ctx.currentTime, 0.1);
        
        loopRef.current = requestAnimationFrame(modulate);
     };
     modulate();
  };

  const stopAudio = () => {
     if (!isPlaying) return;
     cancelAnimationFrame(loopRef.current);
     if (ctxRef.current) {
        ctxRef.current.close();
     }
     setIsPlaying(false);
     if (onComplete) setTimeout(onComplete, 2000);
  };

  useEffect(() => {
     return () => {
        cancelAnimationFrame(loopRef.current);
        if (ctxRef.current && ctxRef.current.state !== 'closed') {
           ctxRef.current.close();
        }
     };
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
            <Volume2 size={16} className="text-cyan-500" /> Infinite Soundscape
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto z-10">
         
         <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-xl">
            
            <div className="mb-8">
               <button 
                  onClick={isPlaying ? stopAudio : startAudio}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${
                     isPlaying ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30" : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
               >
                  {isPlaying ? <><Square size={16} fill="currentColor" /> Stop Generator</> : <><Volume2 size={16} fill="currentColor" /> Initialize Audio Engine</>}
               </button>
            </div>

            <div className="space-y-8 opacity-90">
               {Object.entries(params).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{key} Mix</span>
                        <span>{Math.round(val * 100)}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={val}
                        onChange={e => setParams(prev => ({...prev, [key]: parseFloat(e.target.value)}))}
                        className="w-full accent-cyan-500 bg-slate-700 h-1 rounded-full appearance-none outline-none"
                     />
                  </div>
               ))}
            </div>

            {isPlaying && (
               <div className="mt-8 flex gap-1 h-12 items-end justify-center">
                  {Array.from({length: 30}).map((_, i) => (
                     <motion.div 
                        key={i}
                        className="w-1.5 bg-cyan-500 rounded-t-sm"
                        animate={{ height: Math.max(4, Math.random() * 40 * (params.tension + params.nature + params.industrial)) }}
                        transition={{ duration: 0.1 + Math.random() * 0.2, repeat: Infinity, repeatType: "reverse" }}
                     />
                  ))}
               </div>
            )}

         </div>

      </div>

    </div>
  );
}
