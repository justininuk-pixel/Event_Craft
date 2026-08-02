"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Map, Flag } from "lucide-react";

export function ProceduralLabyrinth({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(5); // 5x5, 7x7, 9x9...
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

  // Generate a simple maze using recursive backtracking
  const generateMaze = useCallback((size: number) => {
     // Create a fully walled grid
     const grid = Array(size).fill(0).map(() => Array(size).fill(1)); // 1 = wall, 0 = path

     const carve = (x: number, y: number) => {
        grid[y][x] = 0;
        const dirs = [ [0,-2], [0,2], [-2,0], [2,0] ].sort(() => Math.random() - 0.5);

        for (const [dx, dy] of dirs) {
           const nx = x + dx;
           const ny = y + dy;
           if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
              grid[y + dy/2][x + dx/2] = 0;
              carve(nx, ny);
           }
        }
     };

     // Start carving from (1,1)
     carve(1, 1);
     
     // Entrance and Exit
     grid[0][1] = 0; // entrance
     grid[size-1][size-2] = 0; // exit

     setMaze(grid);
     setPlayerPos({ x: 1, y: 0 });
  }, []);

  useEffect(() => {
     generateMaze(gridSize);
  }, [gridSize, generateMaze]);

  const handleKeyDown = (e: KeyboardEvent) => {
     if (maze.length === 0) return;

     setPlayerPos(prev => {
        let { x, y } = prev;
        if (e.key === "ArrowUp") y--;
        if (e.key === "ArrowDown") y++;
        if (e.key === "ArrowLeft") x--;
        if (e.key === "ArrowRight") x++;

        // Collision check
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && maze[y][x] === 0) {
           return { x, y };
        }
        return prev;
     });
  };

  useEffect(() => {
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maze, gridSize]);

  // Check Win Condition
  useEffect(() => {
     if (playerPos.y === gridSize - 1 && playerPos.x === gridSize - 2) {
        // Reached exit
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100, 50]);
        
        setTimeout(() => {
           setLevel(prev => prev + 1);
           setGridSize(prev => prev + 2); // Increase difficulty
        }, 500);

        if (level >= 3 && onComplete) {
           // Let them play a few levels
           setTimeout(onComplete, 5000);
        }
     }
  }, [playerPos, gridSize, level, onComplete]);

  // Touch controls for mobile
  const move = (dx: number, dy: number) => {
     setPlayerPos(prev => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && maze[ny][nx] === 0) {
           return { x: nx, y: ny };
        }
        return prev;
     });
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-green-500" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-green-900/50 flex justify-between items-center z-10 shrink-0">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Map size={16} /> Labyrinth Engine
            </h2>
         </div>
         <div className="text-xs uppercase tracking-widest bg-green-900/30 px-2 py-1 rounded">
            Level {level}
         </div>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4 w-full">
         
         {maze.length > 0 && (
            <div 
               className="relative bg-green-950 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-500"
               style={{ 
                  width: Math.min(300, gridSize * 20),
                  height: Math.min(300, gridSize * 20),
               }}
            >
               {/* Render walls */}
               {maze.map((row, y) => (
                  <div key={y} className="flex h-full">
                     {row.map((cell, x) => (
                        <div 
                           key={`${x}-${y}`} 
                           className="flex-1 h-full"
                           style={{ backgroundColor: cell === 1 ? '#22c55e' : 'transparent' }}
                        />
                     ))}
                  </div>
               ))}

               {/* Player */}
               <motion.div 
                  className="absolute bg-white shadow-[0_0_10px_white] z-10"
                  animate={{ 
                     left: `${(playerPos.x / gridSize) * 100}%`, 
                     top: `${(playerPos.y / gridSize) * 100}%`,
                     width: `${100 / gridSize}%`,
                     height: `${100 / gridSize}%`
                  }}
                  transition={{ type: "tween", duration: 0.1 }}
               />

               {/* Exit */}
               <div 
                  className="absolute bg-green-500/50 flex items-center justify-center z-0 animate-pulse"
                  style={{ 
                     left: `${((gridSize - 2) / gridSize) * 100}%`, 
                     top: `${((gridSize - 1) / gridSize) * 100}%`,
                     width: `${100 / gridSize}%`,
                     height: `${100 / gridSize}%`
                  }}
               >
                  <Flag size={12} className="text-white" />
               </div>
            </div>
         )}

         {/* Mobile D-Pad */}
         <div className="md:hidden mt-8 grid grid-cols-3 gap-2 w-48 mx-auto">
            <div />
            <button onClick={() => move(0, -1)} className="bg-green-900/50 p-4 rounded active:bg-green-700">↑</button>
            <div />
            <button onClick={() => move(-1, 0)} className="bg-green-900/50 p-4 rounded active:bg-green-700">←</button>
            <button onClick={() => move(0, 1)} className="bg-green-900/50 p-4 rounded active:bg-green-700">↓</button>
            <button onClick={() => move(1, 0)} className="bg-green-900/50 p-4 rounded active:bg-green-700">→</button>
         </div>
         <div className="hidden md:block mt-8 text-xs text-green-700 uppercase tracking-widest">Use Arrow Keys</div>

      </div>

    </div>
  );
}
