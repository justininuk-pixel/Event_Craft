"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

const GRID_SIZE = 3;
const SNAP_THRESHOLD = 40;

interface Piece {
  id: number;
  row: number;
  col: number;
  isPlaced: boolean;
  startX: number;
  startY: number;
}

export function JigsawPuzzle({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardRect, setBoardRect] = useState({ top: 0, left: 0, width: 300, height: 300 });

  useEffect(() => {
    // Initialize pieces with random start positions in the lower half of the screen
    const newPieces: Piece[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newPieces.push({
        id: i,
        row: Math.floor(i / GRID_SIZE),
        col: i % GRID_SIZE,
        isPlaced: false,
        startX: (Math.random() - 0.5) * 150, // relative to center of tray
        startY: (Math.random() - 0.5) * 100,
      });
    }
    // Shuffle them so they render in random z-index order initially
    newPieces.sort(() => Math.random() - 0.5);
    setPieces(newPieces);
    
    const updateRect = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      }
    };
    
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  const handleDragEnd = (id: number, info: any) => {
    if (!boardRef.current || !containerRef.current) return;
    
    // Find the piece
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;

    // Get current global position of the dragged piece
    // info.point is global mouse/touch coordinate. 
    // Wait, framer motion info.point is the pointer. 
    // We need the visual center of the piece. It's easier to check where the pointer dropped relative to the slots.
    
    const pieceWidth = boardRect.width / GRID_SIZE;
    const pieceHeight = boardRect.height / GRID_SIZE;
    
    // The target slot global bounds
    const targetLeft = boardRect.left + piece.col * pieceWidth;
    const targetTop = boardRect.top + piece.row * pieceHeight;
    const targetCenterX = targetLeft + pieceWidth / 2;
    const targetCenterY = targetTop + pieceHeight / 2;
    
    // Pointer drop coordinates
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (Math.abs(dropX - targetCenterX) < SNAP_THRESHOLD && Math.abs(dropY - targetCenterY) < SNAP_THRESHOLD) {
      // Snapped!
      setPieces(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, isPlaced: true } : p);
        if (updated.every(p => p.isPlaced)) {
          setIsRevealed(true);
          setTimeout(() => onComplete?.(), 1000);
        }
        return updated;
      });
    }
  };

  const bgUrl = config.mediaUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800";

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex flex-col"
      ref={containerRef}
    >
      
      {/* Revealed State background fade */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          backgroundColor: palette.primary as string 
        }}
      />

      {/* Top half: The Board */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 pointer-events-none mt-12">
        
        {isRevealed && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-heading text-[var(--exp-secondary)] drop-shadow-md mb-2">{config.title}</h1>
            <p className="text-[var(--exp-text)] max-w-sm drop-shadow-md bg-black/50 p-4 rounded-xl">{config.body}</p>
          </motion.div>
        )}

        <div 
          ref={boardRef}
          className="w-full max-w-[300px] aspect-square relative bg-white/5 border-2 transition-colors duration-1000"
          style={{ 
            borderColor: isRevealed ? 'transparent' : 'rgba(255,255,255,0.2)',
            boxShadow: isRevealed ? '0 25px 50px -12px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          {/* Grid lines */}
          {!isRevealed && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>
          )}

          {/* Placed pieces stay here exactly */}
          {pieces.map(piece => piece.isPlaced && (
            <div
              key={`placed-${piece.id}`}
              className="absolute pointer-events-none"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                top: `${piece.row * (100 / GRID_SIZE)}%`,
                left: `${piece.col * (100 / GRID_SIZE)}%`,
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                backgroundPosition: `${(piece.col / (GRID_SIZE - 1)) * 100}% ${(piece.row / (GRID_SIZE - 1)) * 100}%`,
                border: isRevealed ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: 'border 1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom half: The Tray */}
      <div className="flex-1 relative z-20 flex items-center justify-center pointer-events-none">
        
        {!isRevealed && (
          <p className="absolute top-0 w-full text-center text-white/40 font-heading animate-pulse text-sm">
            Drag pieces to assemble
          </p>
        )}

        {/* Unplaced draggable pieces */}
        <div className="relative w-[200px] h-[150px]">
          {pieces.map(piece => !piece.isPlaced && (
            <DraggablePiece 
              key={`tray-${piece.id}`}
              piece={piece}
              bgUrl={bgUrl}
              onDragEnd={(info: any) => handleDragEnd(piece.id, info)}
              pieceWidth={boardRect.width / GRID_SIZE}
              pieceHeight={boardRect.height / GRID_SIZE}
              containerRef={containerRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component for draggable pieces so Framer Motion handles their individual transforms cleanly
function DraggablePiece({ piece, bgUrl, onDragEnd, pieceWidth, pieceHeight, containerRef }: any) {
  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={(e, info) => onDragEnd(info)}
      whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}
      className="absolute bg-zinc-800 shadow-md cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{
        width: pieceWidth,
        height: pieceHeight,
        x: piece.startX,
        y: piece.startY,
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
        backgroundPosition: `${(piece.col / (GRID_SIZE - 1)) * 100}% ${(piece.row / (GRID_SIZE - 1)) * 100}%`,
        border: '1px solid rgba(255,255,255,0.3)'
      }}
    />
  );
}
