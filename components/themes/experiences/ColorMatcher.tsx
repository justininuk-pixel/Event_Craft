"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function ColorMatcher({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"mixing" | "unlocked" | "revealed">("mixing");
  
  const [c, setC] = useState(0);
  const [m, setM] = useState(0);
  const [y, setY] = useState(0);

  const [targetRGB, setTargetRGB] = useState({ r: 0, g: 0, b: 0 });

  useEffect(() => {
    const randC = Math.floor(Math.random() * 80) + 10;
    const randM = Math.floor(Math.random() * 80) + 10;
    const randY = Math.floor(Math.random() * 80) + 10;

    setTargetRGB({
      r: Math.round(255 * (1 - randC / 100)),
      g: Math.round(255 * (1 - randM / 100)),
      b: Math.round(255 * (1 - randY / 100)),
    });
  }, []);

  const userR = Math.round(255 * (1 - c / 100));
  const userG = Math.round(255 * (1 - m / 100));
  const userB = Math.round(255 * (1 - y / 100));

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playTick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playSuccess = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); 
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); 
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, []);

  useEffect(() => {
    if (phase !== "mixing") return;
    
    const dist = Math.sqrt(
      Math.pow(userR - targetRGB.r, 2) + 
      Math.pow(userG - targetRGB.g, 2) + 
      Math.pow(userB - targetRGB.b, 2)
    );

    if (dist < 25 && targetRGB.r !== 0) { 
      setPhase("unlocked");
      playSuccess();
      setTimeout(() => {
        setPhase("revealed");
        onComplete?.();
      }, 1000);
    }
  }, [userR, userG, userB, targetRGB, phase, playSuccess, onComplete]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0,
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: palette.background as string 
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
          {config.body}
        </p>
      </div>

      {/* Foreground Door Layer */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-start bg-zinc-900 border-x-[16px] border-zinc-950 shadow-2xl"
            initial={{ y: 0 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onPointerDown={initAudio}
          >
            {/* Color Swatch Comparison */}
            <div className="w-full h-1/2 flex flex-col relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              {/* Target Color */}
              <div 
                className="w-full h-1/2 flex items-center justify-center"
                style={{ backgroundColor: `rgb(${targetRGB.r}, ${targetRGB.g}, ${targetRGB.b})` }}
              >
                <div className="bg-black/40 px-4 py-1 rounded-full text-white/80 font-mono text-xs uppercase tracking-widest backdrop-blur-sm">Target</div>
              </div>
              
              {/* User Color */}
              <div 
                className="w-full h-1/2 flex items-center justify-center transition-colors duration-75"
                style={{ backgroundColor: `rgb(${userR}, ${userG}, ${userB})` }}
              >
                <div className="bg-black/40 px-4 py-1 rounded-full text-white/80 font-mono text-xs uppercase tracking-widest backdrop-blur-sm">Current</div>
              </div>
            </div>

            {/* Sliders Container */}
            <div className="w-full h-1/2 p-8 flex flex-col justify-center gap-8 bg-zinc-900 relative">
              <div className="absolute top-[-2px] left-8 right-8 h-1 bg-black/20 rounded-full" />
              
              {/* Cyan Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs font-bold uppercase text-cyan-400">
                  <span>Cyan</span>
                  <span>{c}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={c} 
                  onChange={(e) => { setC(parseInt(e.target.value)); playTick(); }}
                  className="w-full h-4 appearance-none rounded-full outline-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  style={{
                    background: `linear-gradient(to right, #000000 0%, #00ffff 100%)`
                  }}
                  disabled={phase !== "mixing"}
                />
              </div>

              {/* Magenta Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs font-bold uppercase text-fuchsia-500">
                  <span>Magenta</span>
                  <span>{m}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={m} 
                  onChange={(e) => { setM(parseInt(e.target.value)); playTick(); }}
                  className="w-full h-4 appearance-none rounded-full outline-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  style={{
                    background: `linear-gradient(to right, #000000 0%, #ff00ff 100%)`
                  }}
                  disabled={phase !== "mixing"}
                />
              </div>

              {/* Yellow Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs font-bold uppercase text-yellow-400">
                  <span>Yellow</span>
                  <span>{y}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={y} 
                  onChange={(e) => { setY(parseInt(e.target.value)); playTick(); }}
                  className="w-full h-4 appearance-none rounded-full outline-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  style={{
                    background: `linear-gradient(to right, #000000 0%, #ffff00 100%)`
                  }}
                  disabled={phase !== "mixing"}
                />
              </div>
              
              <div className="flex justify-center mt-4">
                <motion.div 
                  className={`w-4 h-4 rounded-full ${phase === 'unlocked' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                  animate={{ scale: phase === 'unlocked' ? [1, 1.5, 1] : 1 }}
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 4px solid #18181b;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
      `}} />

    </div>
  );
}
