"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function SeedGrower({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isWatered, setIsWatered] = useState(false);
  const [isSunlit, setIsSunlit] = useState(false);
  const [growthStage, setGrowthStage] = useState(0); 
  
  const [showWaterDrops, setShowWaterDrops] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playWaterSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const playSunSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  };

  const playPopSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleWater = () => {
    if (isWatered) return;
    initAudio();
    setIsWatered(true);
    setShowWaterDrops(true);
    playWaterSound();
    setTimeout(() => setShowWaterDrops(false), 2000);
  };

  const handleSun = () => {
    if (isSunlit) return;
    initAudio();
    setIsSunlit(true);
    playSunSound();
  };

  useEffect(() => {
    if (isWatered && isSunlit && growthStage === 0) {
      const intervals = [1200, 2400, 3600, 5000];
      
      intervals.forEach((time, index) => {
        setTimeout(() => {
          setGrowthStage(index + 1);
          playPopSound();
          if (index + 1 === 4) {
            setTimeout(() => {
              onComplete?.();
            }, 1500);
          }
        }, time);
      });
    }
  }, [isWatered, isSunlit, growthStage, onComplete]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-sky-900 touch-none select-none flex items-center justify-center">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: growthStage === 4 ? 1 : 0,
          transform: growthStage === 4 ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Garden Layer */}
      <AnimatePresence>
        {growthStage < 4 && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-end overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: "easeIn" }}
            onPointerDown={initAudio}
          >
            {/* The Sunbeam */}
            <motion.div 
              className="absolute inset-0 bg-yellow-400/20 mix-blend-overlay origin-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: isSunlit ? 1 : 0 }}
              transition={{ duration: 1 }}
            />

            {/* The Sun Button */}
            <motion.div 
              className="absolute top-12 left-12 w-24 h-24 rounded-full bg-yellow-400 cursor-pointer shadow-[0_0_50px_#facc15] flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={isSunlit ? { scale: 1.2, backgroundColor: '#fef08a' } : { scale: 1 }}
              whileHover={!isSunlit ? { scale: 1.1 } : undefined}
              onPointerDown={handleSun}
            >
              <div className="absolute inset-[-20px] border-4 border-yellow-300/50 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
            </motion.div>

            {/* Watering Can */}
            <motion.div
              drag
              dragSnapToOrigin
              onDragEnd={(e, info) => {
                if (info.offset.y > 50) {
                  handleWater();
                }
              }}
              className="absolute top-24 right-12 w-20 h-20 bg-blue-400 rounded-bl-3xl rounded-tr-xl cursor-grab active:cursor-grabbing shadow-lg z-30 flex items-center justify-center"
              initial={{ rotate: 0 }}
              whileDrag={{ rotate: -30, scale: 1.1 }}
            >
              <div className="w-8 h-8 rounded-full border-4 border-white/50 -translate-x-4 -translate-y-4" />
              <div className="absolute -left-6 top-1/2 w-6 h-2 bg-blue-400" />
            </motion.div>

            {/* Rain Drops */}
            <AnimatePresence>
              {showWaterDrops && (
                <motion.div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {[0,1,2].map(i => (
                    <motion.div 
                      key={i} 
                      className="w-2 h-4 bg-blue-300 rounded-full"
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, repeat: 3, delay: i * 0.1 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Plant */}
            <div className="relative w-64 h-96 flex flex-col items-center justify-end z-10 pb-8">
              {/* Seed */}
              <motion.div 
                className="w-8 h-10 bg-[var(--exp-accent)] rounded-full absolute bottom-8 border-4 border-[var(--exp-primary)]"
                initial={{ scale: 1, y: 0 }}
                animate={growthStage > 0 ? { y: 20, opacity: 0 } : {}}
              />
              
              {/* Sprout & Stem */}
              <motion.div 
                className="w-4 bg-green-500 rounded-t-full origin-bottom relative"
                initial={{ height: 0 }}
                animate={{ height: growthStage === 1 ? 40 : growthStage >= 2 ? 200 : 0 }}
                transition={{ duration: 1, type: "spring" }}
              >
                {/* Leaves */}
                <motion.div 
                  className="absolute top-1/2 -left-12 w-12 h-6 bg-green-400 rounded-l-full rounded-br-full origin-right"
                  initial={{ scale: 0 }}
                  animate={{ scale: growthStage >= 2 ? 1 : 0 }}
                  transition={{ delay: 0.5 }}
                />
                <motion.div 
                  className="absolute top-1/4 -right-12 w-12 h-6 bg-green-400 rounded-r-full rounded-bl-full origin-left"
                  initial={{ scale: 0 }}
                  animate={{ scale: growthStage >= 2 ? 1 : 0 }}
                  transition={{ delay: 0.8 }}
                />

                {/* Bud */}
                <motion.div 
                  className="absolute -top-6 -left-4 w-12 h-12 bg-pink-400 rounded-full origin-bottom"
                  initial={{ scale: 0 }}
                  animate={{ scale: growthStage >= 3 ? 1 : 0 }}
                  transition={{ type: "spring" }}
                />
              </motion.div>
            </div>

            {/* Dirt */}
            <div className="w-full h-32 bg-[#4a3f35] rounded-t-[50%] absolute bottom-[-50px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] z-0" />
            
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-zinc-400 tracking-widest uppercase text-xs pointer-events-none opacity-50 z-30">
              {(!isWatered || !isSunlit) ? "Provide water and sunlight" : "Wait patiently"}
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
