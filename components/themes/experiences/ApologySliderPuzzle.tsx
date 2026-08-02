"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { HeartCrack, Heart } from "lucide-react";

export function ApologySliderPuzzle({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff1f2"]; // rose-50

  const gridSize = 3;
  const tileCount = gridSize * gridSize;

  const [tiles, setTiles] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageUrl = config.mediaUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop";

  // Initialize and shuffle
  useEffect(() => {
     // Create solved array [0, 1, 2, 3, 4, 5, 6, 7, 8]
     let initial = Array.from({ length: tileCount }, (_, i) => i);
     
     // Simple shuffle that guarantees solvability:
     // Start solved, then randomly move the empty space (8) around N times
     let emptyIdx = tileCount - 1;
     for (let i = 0; i < 50; i++) { // 50 random moves
        const row = Math.floor(emptyIdx / gridSize);
        const col = emptyIdx % gridSize;
        const neighbors = [];
        if (row > 0) neighbors.push(emptyIdx - gridSize); // up
        if (row < gridSize - 1) neighbors.push(emptyIdx + gridSize); // down
        if (col > 0) neighbors.push(emptyIdx - 1); // left
        if (col < gridSize - 1) neighbors.push(emptyIdx + 1); // right
        
        const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
        // swap
        [initial[emptyIdx], initial[swapIdx]] = [initial[swapIdx], initial[emptyIdx]];
        emptyIdx = swapIdx;
     }

     setTiles(initial);
  }, [tileCount]);

  const handleTileClick = (index: number) => {
     if (isSolved) return;

     const emptyIdx = tiles.indexOf(tileCount - 1);
     
     // Check if adjacent
     const row = Math.floor(index / gridSize);
     const col = index % gridSize;
     const eRow = Math.floor(emptyIdx / gridSize);
     const eCol = emptyIdx % gridSize;

     const isAdjacent = (Math.abs(row - eRow) === 1 && col === eCol) || (Math.abs(col - eCol) === 1 && row === eRow);

     if (isAdjacent) {
        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
        setTiles(newTiles);

        // Check win
        if (newTiles.every((val, i) => val === i)) {
           setIsSolved(true);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100, 50]);
           if (onComplete) setTimeout(onComplete, 3000);
        }
     }
  };

  // Cheat code for editor
  const solvePuzzle = () => {
     setTiles(Array.from({ length: tileCount }, (_, i) => i));
     setIsSolved(true);
     if (onComplete) setTimeout(onComplete, 3000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Preload image silently */}
      <img src={imageUrl} alt="Apology" className="hidden" onLoad={() => setImageLoaded(true)} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 w-full h-full">
         
         <div className="w-full text-center mb-8">
            <HeartCrack size={32} className="mx-auto mb-4 opacity-50" style={{ color: primaryColor }} />
            <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
               {config.title || "I'm sorry."}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2 max-w-[250px] mx-auto leading-relaxed">
               {isSolved ? "Thank you for putting this back together." : "I made a mess of things. Please help me fix it."}
            </p>
         </div>

         {/* The Puzzle Grid */}
         <div className="relative w-full max-w-[300px] aspect-square mx-auto rounded-xl shadow-2xl p-2 bg-white border border-slate-200">
            <div className="w-full h-full relative">
               
               {imageLoaded ? (
                  tiles.map((tileVal, currentIdx) => {
                     const isSpace = tileVal === tileCount - 1;
                     
                     // Calculate where it SHOULD be visually drawn based on currentIdx
                     const drawRow = Math.floor(currentIdx / gridSize);
                     const drawCol = currentIdx % gridSize;
                     
                     // Calculate what part of the image it displays based on tileVal
                     const imgRow = Math.floor(tileVal / gridSize);
                     const imgCol = tileVal % gridSize;
                     
                     return (
                        <motion.div
                           key={tileVal}
                           className="absolute rounded shadow-sm border border-black/5 bg-slate-100"
                           style={{
                              width: `${100 / gridSize}%`,
                              height: `${100 / gridSize}%`,
                              backgroundImage: isSolved || !isSpace ? `url(${imageUrl})` : 'none',
                              backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                              backgroundPosition: `${(imgCol / (gridSize - 1)) * 100}% ${(imgRow / (gridSize - 1)) * 100}%`,
                              opacity: isSpace && !isSolved ? 0 : 1,
                              cursor: isSolved ? 'default' : 'pointer'
                           }}
                           initial={false}
                           animate={{
                              top: `${(drawRow / gridSize) * 100}%`,
                              left: `${(drawCol / gridSize) * 100}%`,
                           }}
                           transition={{ type: "spring", stiffness: 300, damping: 25 }}
                           onClick={() => handleTileClick(currentIdx)}
                        />
                     );
                  })
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 animate-pulse">
                     Loading image...
                  </div>
               )}

            </div>
         </div>

         <AnimatePresence>
            {isSolved && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-12 text-center"
               >
                  <Heart size={32} className="mx-auto mb-2 animate-bounce" style={{ color: primaryColor, fill: primaryColor }} />
                  <p className="text-xl font-serif italic text-slate-700 max-w-xs mx-auto leading-relaxed">
                     {config.body || "I promise to be better. Will you forgive me?"}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

         {mode === "editor-preview" && !isSolved && (
            <button 
               onClick={solvePuzzle}
               className="mt-8 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
            >
               Solve (Editor)
            </button>
         )}

      </div>

    </div>
  );
}
