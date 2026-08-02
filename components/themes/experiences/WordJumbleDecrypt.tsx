"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface TileData {
  id: string;
  char: string;
  currentIndex: number;
  correctIndex: number;
}

export function WordJumbleDecrypt({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  useEffect(() => {
    let target = (config.title || "UNLOCK").replace(/[^A-Za-z]/g, "").toUpperCase();
    if (target.length < 3) target = "UNLOCK";
    if (target.length > 12) target = target.substring(0, 12);

    const correctArr = target.split("");
    
    let initialTiles = correctArr.map((char, i) => ({
      id: `tile-${i}-${char}`,
      char,
      currentIndex: i,
      correctIndex: i
    }));

    const indices = initialTiles.map(t => t.currentIndex);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    if (indices.every((val, idx) => val === idx)) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }

    initialTiles = initialTiles.map((t, i) => ({
      ...t,
      currentIndex: indices[i]
    }));

    initialTiles.sort((a, b) => a.currentIndex - b.currentIndex);
    
    setTiles(initialTiles);
  }, [config.title]);

  const handleTileClick = (index: number) => {
    if (isRevealed) return;
    
    const tile = tiles[index];
    if (tile.currentIndex === tile.correctIndex) {
      return;
    }

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else {
      if (selectedIdx === index) {
        setSelectedIdx(null);
        return;
      }

      setTiles(prev => {
        const next = [...prev];
        const tileA = { ...next[selectedIdx] };
        const tileB = { ...next[index] };

        const tempIdx = tileA.currentIndex;
        tileA.currentIndex = tileB.currentIndex;
        tileB.currentIndex = tempIdx;

        next[selectedIdx] = tileB;
        next[index] = tileA;

        const isWin = next.every(t => t.currentIndex === t.correctIndex);
        if (isWin) {
          setTimeout(() => {
            setIsRevealed(true);
            onComplete?.();
          }, 1000);
        }

        return next;
      });

      setSelectedIdx(null);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex items-center justify-center p-8">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
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

      {/* Foreground Puzzle Layer */}
      <AnimatePresence>
        {!isRevealed && tiles.length > 0 && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            
            <p className="font-mono mb-12 text-zinc-400 tracking-widest uppercase text-sm">
              Decrypt the Passphrase
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              <AnimatePresence>
                {tiles.map((tile, i) => {
                  const isCorrect = tile.currentIndex === tile.correctIndex;
                  const isSelected = selectedIdx === i;

                  return (
                    <motion.div
                      key={tile.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      onClick={() => handleTileClick(i)}
                      className={`
                        w-14 h-14 flex items-center justify-center text-2xl font-bold font-mono rounded-lg cursor-pointer
                        border-b-4 transition-colors duration-200
                        ${isCorrect 
                          ? 'bg-green-600 border-green-800 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' 
                          : isSelected
                            ? 'bg-yellow-500 border-yellow-700 text-black scale-110 z-10 shadow-lg'
                            : 'bg-zinc-800 border-zinc-900 text-zinc-200 hover:bg-zinc-700'
                        }
                      `}
                    >
                      {tile.char}
                      {isCorrect && <Lock size={12} className="absolute top-1 right-1 opacity-50" />}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-16 text-zinc-500 font-mono text-xs max-w-[200px] text-center tracking-widest">
              Tap two letters to swap their positions
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
