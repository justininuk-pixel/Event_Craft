"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, X } from "lucide-react";

type VinylRecord = {
  id: string;
  artist: string;
  album: string;
  coverSrc: string;
  memory: string;
};

const defaultRecords: VinylRecord[] = [
  { id: "v1", artist: "Fleetwood Mac", album: "Rumours", coverSrc: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop", memory: "Mom played this every Sunday morning while making pancakes." },
  { id: "v2", artist: "Pink Floyd", album: "Dark Side", coverSrc: "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=300&auto=format&fit=crop", memory: "My first real concert. Still have the t-shirt." },
  { id: "v3", artist: "Miles Davis", album: "Kind of Blue", coverSrc: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300&auto=format&fit=crop", memory: "Rainy days in the old apartment before we moved to the city." },
  { id: "v4", artist: "The Beatles", album: "Abbey Road", coverSrc: "https://images.unsplash.com/photo-1595971294624-9ea971161d9a?q=80&w=300&auto=format&fit=crop", memory: "Dad taught me how to drop the needle on this exact pressing." },
  { id: "v5", artist: "Nirvana", album: "Nevermind", coverSrc: "https://images.unsplash.com/photo-1603924925828-5690b2b80f1a?q=80&w=300&auto=format&fit=crop", memory: "Driving to school in the 94 civic with the windows down." },
];

export function VinylCrateDigger({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#facc15";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#27272a"]; // zinc-800
  const title = config.title || "The Basement Collection";

  const records: VinylRecord[] = (config.experience as any)?.records || defaultRecords;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pulledRecord, setPulledRecord] = useState<VinylRecord | null>(null);

  // Swipe up to flip record forward (reveal next)
  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.y < -50) {
      // Swiped UP
      if (currentIndex < records.length - 1) {
         if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
         setCurrentIndex(prev => prev + 1);
      }
    } else if (info.offset.y > 50) {
      // Swiped DOWN
      if (currentIndex > 0) {
         if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
         setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handlePullRecord = (record: VinylRecord) => {
    setPulledRecord(record);
    if (onComplete) setTimeout(onComplete, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center font-sans overflow-hidden select-none bg-zinc-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Title */}
      <div className="absolute top-8 text-center z-10 pointer-events-none">
        <h2 className="text-xl font-black text-zinc-300 uppercase tracking-widest">{title}</h2>
        <p className="text-xs text-zinc-500 mt-1">Swipe UP to flip through records</p>
      </div>

      {/* The Crate Area */}
      <div className="flex-1 w-full relative flex items-center justify-center mt-20" style={{ perspective: "1000px" }}>
        
        {/* Render records back to front */}
        {records.map((record, i) => {
          // If the record is BEFORE the current index, it has been flipped forward
          const isFlipped = i < currentIndex;
          const isActive = i === currentIndex;
          
          // Z-index calculation: flipped records should be in front
          const zIndex = isFlipped ? records.length + i : records.length - i;
          
          return (
            <motion.div
              key={record.id}
              className="absolute w-64 h-64 cursor-grab active:cursor-grabbing origin-bottom"
              style={{ zIndex }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onClick={() => isActive && handlePullRecord(record)}
              initial={false}
              animate={{
                rotateX: isFlipped ? -80 : 0,
                y: isFlipped ? 40 : (i - currentIndex) * -8,
                translateZ: isFlipped ? 100 : (i - currentIndex) * -20,
                opacity: isFlipped ? 0.3 : 1 - ((i - currentIndex) * 0.15)
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Record Sleeve */}
              <div className="w-full h-full rounded shadow-[0_-5px_15px_rgba(0,0,0,0.5)] border-t border-white/10 relative overflow-hidden bg-zinc-800">
                <img src={record.coverSrc} alt={record.album} className="w-full h-full object-cover opacity-90 mix-blend-luminosity" />
                
                {/* Wear and tear overlay */}
                <div className="absolute inset-0 border-[8px] border-black/40 rounded mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none" />
                
                {/* LP ridge visible at top */}
                <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-[95%] h-2 bg-black rounded-full opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pulled Record Modal */}
      <AnimatePresence>
        {pulledRecord && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute inset-0 z-40 bg-zinc-900 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-2 text-zinc-400">
                  <Disc3 size={20} className="animate-spin-slow text-yellow-500" />
                  <span className="text-xs uppercase tracking-widest font-bold">Liner Notes</span>
               </div>
               <button onClick={() => setPulledRecord(null)} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white">
                 <X size={20} />
               </button>
            </div>

            <div className="w-full aspect-square bg-zinc-800 rounded shadow-2xl mb-8 relative overflow-hidden border border-zinc-700">
               <img src={pulledRecord.coverSrc} alt={pulledRecord.album} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
               <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{pulledRecord.album}</h3>
               <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-6">{pulledRecord.artist}</p>
               
               <div className="p-4 bg-zinc-800/50 border-l-2 border-yellow-500 rounded-r">
                 <p className="text-zinc-300 leading-relaxed text-sm font-serif italic">
                    "{pulledRecord.memory}"
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
