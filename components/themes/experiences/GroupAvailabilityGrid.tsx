"use client";

import React, { useState, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Users, Calendar, MousePointerClick, RefreshCcw } from "lucide-react";

export function GroupAvailabilityGrid({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = [9, 10, 11, 12, 1, 2, 3, 4, 5];
  
  // Create a grid: [dayIndex][hourIndex] = count of people available
  const [grid, setGrid] = useState<number[][]>(() => 
     Array(days.length).fill(0).map(() => Array(hours.length).fill(0))
  );

  // Total users who have submitted so far (mock data starts with 3)
  const [totalUsers, setTotalUsers] = useState(3);
  
  // Track dragging state for painting
  const [isPainting, setIsPainting] = useState(false);
  const [paintState, setPaintState] = useState<boolean>(true); // true = adding, false = removing

  // Simulate some initial data from 3 users
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
     const newGrid = [...grid];
     // User 1
     newGrid[0][0] += 1; newGrid[0][1] += 1; newGrid[1][4] += 1;
     // User 2
     newGrid[0][1] += 1; newGrid[1][4] += 1; newGrid[2][2] += 1;
     // User 3
     newGrid[0][1] += 1; newGrid[1][4] += 1; newGrid[3][3] += 1; newGrid[4][7] += 1;
     setGrid(newGrid);
     setInitialized(true);
  }

  const handlePointerDown = (dayIdx: number, hourIdx: number) => {
     setIsPainting(true);
     // Determine if we are adding or removing based on the first cell we click
     const isCurrentlySelectedByMe = false; // In a real app we'd track "my" selections separately. For this demo, we just add to the count.
     setPaintState(true); 
     
     toggleCell(dayIdx, hourIdx, true);
  };

  const handlePointerOver = (dayIdx: number, hourIdx: number) => {
     if (isPainting) {
        toggleCell(dayIdx, hourIdx, paintState);
     }
  };

  const handlePointerUp = () => {
     setIsPainting(false);
     if (onComplete) onComplete();
  };

  const toggleCell = useCallback((dayIdx: number, hourIdx: number, add: boolean) => {
     setGrid(prev => {
        const newGrid = [...prev];
        const row = [...newGrid[dayIdx]];
        
        // Demo logic: We just blindly increment up to totalUsers + 1 (the current user)
        if (add && row[hourIdx] <= totalUsers) {
           row[hourIdx] += 1;
        }
        
        newGrid[dayIdx] = row;
        return newGrid;
     });
  }, [totalUsers]);

  const hexToRgb = (hex: string) => {
     let c = hex.substring(1).split('');
     if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
     const num = parseInt(c.join(''), 16);
     return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const getCellColor = (count: number) => {
     if (count === 0) return "rgba(0,0,0,0.02)"; // Empty state
     
     const maxPossible = totalUsers + 1; // Existing users + you
     const opacity = Math.min(1, count / maxPossible);
     
     const { r, g, b } = hexToRgb(primaryColor);
     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const formatHour = (h: number) => {
     return `${h}${h >= 9 && h < 12 ? 'am' : 'pm'}`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 select-none"
      style={{ backgroundColor: bgColors[0] }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full z-10 p-4 md:p-8">
         
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
               <h2 className="text-3xl font-black tracking-tight mb-1 flex items-center gap-3">
                  <Calendar size={28} style={{ color: primaryColor }} />
                  {config.title || "Team Sync"}
               </h2>
               <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                  <MousePointerClick size={16} />
                  {config.body || "Click and drag to paint your available times."}
               </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
               <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl bg-white shadow-sm" style={{ color: primaryColor }}>
                  {totalUsers}
               </div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500 leading-tight pr-2">
                  Responses<br/>So Far
               </div>
            </div>
         </div>

         {/* The Grid */}
         <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-4 md:p-6 overflow-x-auto touch-none">
            
            <div className="min-w-[600px] h-full flex flex-col">
               
               {/* Header Row (Days) */}
               <div className="flex mb-2">
                  <div className="w-16 shrink-0" /> {/* Corner empty space */}
                  {days.map(day => (
                     <div key={day} className="flex-1 text-center font-bold text-slate-400 uppercase tracking-widest text-sm pb-2 border-b border-slate-100">
                        {day}
                     </div>
                  ))}
               </div>

               {/* Grid Body */}
               <div className="flex-1 flex flex-col">
                  {hours.map((hour, hIdx) => (
                     <div key={hour} className="flex-1 flex min-h-[40px]">
                        
                        {/* Time Label (Y-Axis) */}
                        <div className="w-16 shrink-0 flex items-center justify-end pr-4 text-xs font-bold text-slate-400 border-r border-slate-100">
                           {formatHour(hour)}
                        </div>

                        {/* Cells for each day */}
                        {days.map((day, dIdx) => {
                           const count = grid[dIdx][hIdx];
                           const isOptimal = count === (totalUsers + 1); // Everyone including you
                           
                           return (
                              <div 
                                 key={`${dIdx}-${hIdx}`}
                                 className="flex-1 border-r border-b border-slate-50 transition-colors duration-200 relative group cursor-pointer"
                                 style={{ backgroundColor: getCellColor(count) }}
                                 onPointerDown={(e) => { e.preventDefault(); handlePointerDown(dIdx, hIdx); }}
                                 onPointerEnter={() => handlePointerOver(dIdx, hIdx)}
                              >
                                 {/* Hover/Optimal indicator */}
                                 {count > 0 && (
                                    <div className={`absolute inset-0 flex items-center justify-center text-white font-black text-lg drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${isOptimal ? 'opacity-100' : ''}`}>
                                       {count}
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  ))}
               </div>

            </div>
         </div>

         {/* Legend */}
         <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Legend:</span>
               <div className="flex">
                  <div className="w-6 h-6 border border-slate-200" style={{ backgroundColor: getCellColor(0) }} />
                  <div className="w-6 h-6" style={{ backgroundColor: getCellColor(1) }} />
                  <div className="w-6 h-6" style={{ backgroundColor: getCellColor(2) }} />
                  <div className="w-6 h-6" style={{ backgroundColor: getCellColor(3) }} />
                  <div className="w-6 h-6" style={{ backgroundColor: getCellColor(4) }} />
               </div>
            </div>
            
            <button className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl shadow-md active:scale-95 transition-transform" style={{ backgroundColor: primaryColor }}>
               <Users size={18} />
               Submit My Times
            </button>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setTotalUsers(totalUsers + 1);
               }}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20 flex items-center gap-1"
            >
               <RefreshCcw size={12} /> Simulate New User
            </button>
         </div>
      )}

    </div>
  );
}
