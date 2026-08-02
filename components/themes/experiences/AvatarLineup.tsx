"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
const EYES = ["normal", "angry", "happy", "sleepy"];
const HATS = ["none", "cap", "crown", "beanie"];

type AvatarConfig = {
  id: string;
  bodyColor: string;
  eyeType: string;
  hatType: string;
};

function Avatar({ config, isUser = false }: { config: AvatarConfig, isUser?: boolean }) {
  return (
    <div className="relative w-24 h-32 flex flex-col items-center justify-end">
      {isUser && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: -60, opacity: 1 }} 
          className="absolute z-30 bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none"
        >
          YOU
        </motion.div>
      )}

      <div className="absolute top-0 z-20">
        {config.hatType === "cap" && <div className="w-16 h-8 bg-blue-800 rounded-t-full relative"><div className="absolute bottom-0 -right-4 w-12 h-2 bg-blue-800 rounded-full" /></div>}
        {config.hatType === "crown" && <div className="w-16 h-8 bg-yellow-400 relative" style={{ clipPath: 'polygon(0 0, 20% 100%, 50% 20%, 80% 100%, 100% 0, 100% 100%, 0 100%)' }} />}
        {config.hatType === "beanie" && <div className="w-16 h-10 bg-red-600 rounded-t-full relative border-b-4 border-red-800"><div className="absolute -top-3 left-6 w-4 h-4 bg-red-500 rounded-full" /></div>}
      </div>

      <div 
        className="w-20 h-24 rounded-t-3xl rounded-b-md shadow-[inset_0_-10px_20px_rgba(0,0,0,0.3)] relative z-10 flex flex-col items-center"
        style={{ backgroundColor: config.bodyColor }}
      >
        <div className="flex gap-2 mt-6">
          {config.eyeType === "normal" && (
            <>
              <div className="w-3 h-4 bg-black rounded-full" />
              <div className="w-3 h-4 bg-black rounded-full" />
            </>
          )}
          {config.eyeType === "angry" && (
            <>
              <div className="w-3 h-3 bg-black relative"><div className="absolute -top-2 -left-1 w-4 h-1 bg-black rotate-45" /></div>
              <div className="w-3 h-3 bg-black relative"><div className="absolute -top-2 -right-1 w-4 h-1 bg-black -rotate-45" /></div>
            </>
          )}
          {config.eyeType === "happy" && (
            <>
              <div className="w-4 h-2 border-t-2 border-black rounded-t-full" />
              <div className="w-4 h-2 border-t-2 border-black rounded-t-full" />
            </>
          )}
          {config.eyeType === "sleepy" && (
            <>
              <div className="w-4 h-1 bg-black mt-2" />
              <div className="w-4 h-1 bg-black mt-2" />
            </>
          )}
        </div>
      </div>
      
      <div className="w-16 h-2 bg-black/20 rounded-full mt-1" />
    </div>
  );
}

export function AvatarLineup({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"creator" | "lineup">("creator");
  
  const [bodyColor, setBodyColor] = useState(COLORS[0]);
  const [eyeType, setEyeType] = useState(EYES[0]);
  const [hatType, setHatType] = useState(HATS[0]);

  const [crowd, setCrowd] = useState<AvatarConfig[]>([]);

  useEffect(() => {
    const newCrowd: AvatarConfig[] = [];
    for(let i=0; i<20; i++) {
      newCrowd.push({
        id: `mock-${i}`,
        bodyColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        eyeType: EYES[Math.floor(Math.random() * EYES.length)],
        hatType: HATS[Math.floor(Math.random() * HATS.length)]
      });
    }
    setCrowd(newCrowd);
  }, []);

  const handleJoin = () => {
    setPhase("lineup");
    onComplete?.();
  };

  const userAvatarConfig: AvatarConfig = {
    id: "user",
    bodyColor,
    eyeType,
    hatType
  };

  const lineup = [...crowd];
  lineup.splice(10, 0, userAvatarConfig);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-start pt-16 p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "lineup" ? 1 : 0,
          backgroundColor: palette.background as string 
        }}
      >
        <motion.div
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: phase === "lineup" ? 0 : -50, opacity: phase === "lineup" ? 1 : 0 }}
           transition={{ delay: 0.5, duration: 1 }}
           className="bg-black/80 text-white p-8 rounded-2xl shadow-2xl backdrop-blur-sm max-w-lg w-full flex flex-col items-center"
        >
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-32 h-32 object-cover shadow-2xl mb-6 rounded-full border-4 border-white/20"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-300 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </motion.div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "creator" && (
          <motion.div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-zinc-700">
              <h2 className="text-2xl font-heading text-white mb-8">Build Your Avatar</h2>
              
              <div className="bg-zinc-900 p-8 rounded-2xl mb-8 flex items-center justify-center min-h-[160px] shadow-inner w-full border border-zinc-800">
                 <Avatar config={userAvatarConfig} />
              </div>

              {/* Controls */}
              <div className="w-full flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Color</span>
                  <button onClick={() => setBodyColor(COLORS[(COLORS.indexOf(bodyColor) + 1) % COLORS.length])} className="bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold">NEXT</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Eyes</span>
                  <button onClick={() => setEyeType(EYES[(EYES.indexOf(eyeType) + 1) % EYES.length])} className="bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold">NEXT</button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Hat</span>
                  <button onClick={() => setHatType(HATS[(HATS.indexOf(hatType) + 1) % HATS.length])} className="bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold">NEXT</button>
                </div>
              </div>

              <button 
                onClick={handleJoin}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-black text-xl shadow-[0_5px_0_#065f46] active:translate-y-[5px] active:shadow-none transition-all"
              >
                JOIN LINEUP
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Lineup Stage */}
      <div className="absolute bottom-0 left-0 right-0 h-64 z-20 flex items-end overflow-x-auto pb-12" style={{ scrollbarWidth: 'none' }}>
         <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/40 backdrop-blur border-t-4 border-white/10" />
         
         <div className="relative z-10 flex gap-4 px-24 w-max h-full items-end">
           {lineup.map((conf, i) => {
              const isUser = conf.id === "user";
              
              if (phase === "creator" && isUser) {
                return <div key={conf.id} className="w-24 opacity-0" />;
              }

              return (
                <motion.div 
                  key={conf.id}
                  initial={isUser ? { y: -500, opacity: 0 } : { y: 0, opacity: 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={isUser ? { type: "spring", bounce: 0.5, duration: 1 } : { delay: i * 0.05 }}
                  className="shrink-0"
                >
                   <Avatar config={conf} isUser={isUser && phase === "lineup"} />
                </motion.div>
              );
           })}
         </div>
      </div>
      
    </div>
  );
}
