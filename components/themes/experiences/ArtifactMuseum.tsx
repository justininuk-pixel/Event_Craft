"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type Artifact = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

const defaultArtifacts: Artifact[] = [
  { id: "a1", name: "Wooden Top", emoji: "🪀", description: "Carved by Uncle Ben. It still spins for almost two minutes perfectly balanced." },
  { id: "a2", name: "Pocket Watch", emoji: "⏱️", description: "Given to Grandpa when he retired after 40 years at the plant. It stopped at 3:15." },
  { id: "a3", name: "First Shell", emoji: "🐚", description: "Found on the beach during our first family vacation to Florida in 1989." },
  { id: "a4", name: "Silver Coin", emoji: "🪙", description: "A lucky 1921 silver dollar I kept in my shoe during every spelling bee." },
];

export function ArtifactMuseum({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#94a3b8"; // slate-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const artifacts: Artifact[] = (config.experience as any)?.artifacts || defaultArtifacts;
  const title = config.title || "The Family Archives";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlacard, setShowPlacard] = useState(false);

  const nextArtifact = () => {
    setShowPlacard(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % artifacts.length), 150);
    if (onComplete && currentIndex === artifacts.length - 2) setTimeout(onComplete, 3000);
  };

  const prevArtifact = () => {
    setShowPlacard(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + artifacts.length) % artifacts.length), 150);
  };

  const current = artifacts[currentIndex];

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>

      {/* Museum Lighting & Architecture */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Overhead Spotlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-96 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
        {/* Marble floor texture */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, mixBlendMode: "overlay" }} />
      </div>

      <div className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">{title}</h2>
      </div>

      {/* 3D Carousel Simulation (using framer-motion x-translation and scaling) */}
      <div className="flex-1 relative z-10 flex items-center justify-center pt-10">
        
        {/* Navigation Buttons */}
        <button onClick={prevArtifact} className="absolute left-4 z-30 w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
          <ChevronLeft size={32} />
        </button>
        <button onClick={nextArtifact} className="absolute right-4 z-30 w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
          <ChevronRight size={32} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative flex flex-col items-center"
            >
              {/* Pedestal Base */}
              <div className="absolute bottom-0 w-32 h-40 bg-gradient-to-b from-slate-800 to-black border-x border-t border-slate-700 shadow-2xl z-0 rounded-t-sm">
                <div className="w-full h-4 bg-slate-700/50 absolute top-0" />
              </div>

              {/* The Artifact */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 mb-32 text-8xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] cursor-pointer"
                onClick={() => setShowPlacard(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {current.emoji}
                
                {/* Interactive hint */}
                {!showPlacard && (
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-slate-400 font-sans tracking-widest uppercase opacity-60">
                      <Search size={10} /> Inspect
                   </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Museum Placard Modal */}
      <AnimatePresence>
        {showPlacard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-sm bg-slate-200 border-4 border-slate-300 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-sm"
          >
            <div className="flex justify-between items-start mb-4 border-b border-slate-400 pb-2">
              <div>
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider">{current.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">Exhibit {currentIndex + 1}</p>
              </div>
              <button onClick={() => setShowPlacard(false)} className="text-slate-500 hover:text-slate-900 font-sans text-xs underline">Close</button>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              {current.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
