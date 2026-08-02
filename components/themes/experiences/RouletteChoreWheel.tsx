"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dices, Users } from "lucide-react";

const CHORES = [
   "Take out the Trash",
   "Do the Dishes",
   "Vacuum Living Room",
   "Clean Bathroom",
   "Wipe Kitchen Counters"
];

const ROOMMATES = [
   "Alice", "Bob", "Charlie"
];

// We need slices for the wheel. Let's just put the chores on the wheel.
// When it lands on a chore, it assigns it to the "current" roommate, then moves to next.

export function RouletteChoreWheel({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899"; // pink
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf2f8"];

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // { chore: roommate }
  const [currentRoommateIndex, setCurrentRoommateIndex] = useState(0);
  
  const [selectedChore, setSelectedChore] = useState<string | null>(null);

  const numSlices = CHORES.length;
  const sliceAngle = 360 / numSlices;

  // Wheel colors
  const sliceColors = [
     "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"
  ];

  const handleSpin = () => {
     if (isSpinning) return;
     if (Object.keys(assignments).length >= CHORES.length) return; // all done

     setIsSpinning(true);
     setSelectedChore(null);

     // Calculate random rotation
     // At least 5 full spins (1800 deg) + random angle
     const extraSpins = 5;
     const randomDegree = Math.floor(Math.random() * 360);
     const totalNewRotation = rotation + (extraSpins * 360) + randomDegree;

     setRotation(totalNewRotation);

     // Calculate which slice it landed on
     // The pointer is at the top (0 degrees). 
     // We need to normalize the total rotation.
     setTimeout(() => {
        const normalizedRotation = totalNewRotation % 360;
        
        // Because the wheel rotates clockwise, the top pointer (0 deg) actually points
        // to a slice that is offset counter-clockwise.
        // Slice 0 starts at 0 to sliceAngle.
        // If we rotate by X degrees, the pointer is effectively at 360 - X on the wheel.
        const pointerAngleOnWheel = (360 - normalizedRotation) % 360;
        
        const landedSliceIndex = Math.floor(pointerAngleOnWheel / sliceAngle);
        const landedChore = CHORES[landedSliceIndex];

        setSelectedChore(landedChore);
        
        // Assign to current roommate
        const currentRoommate = ROOMMATES[currentRoommateIndex];
        setAssignments(prev => ({ ...prev, [landedChore]: currentRoommate }));
        
        // Advance roommate
        setCurrentRoommateIndex(prev => (prev + 1) % ROOMMATES.length);
        
        setIsSpinning(false);
     }, 4000); // Wait for the CSS transition to finish
  };

  useEffect(() => {
     if (Object.keys(assignments).length >= CHORES.length && onComplete) {
        onComplete();
     }
  }, [assignments, onComplete]);

  // SVG pie slice path generator
  const createSlicePath = (index: number) => {
     const startAngle = index * sliceAngle;
     const endAngle = (index + 1) * sliceAngle;
     
     // Math for drawing arc
     const startX = 50 + 50 * Math.cos(Math.PI * (startAngle - 90) / 180);
     const startY = 50 + 50 * Math.sin(Math.PI * (startAngle - 90) / 180);
     const endX = 50 + 50 * Math.cos(Math.PI * (endAngle - 90) / 180);
     const endY = 50 + 50 * Math.sin(Math.PI * (endAngle - 90) / 180);
     
     const largeArcFlag = sliceAngle > 180 ? 1 : 0;
     
     return `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const isAllAssigned = Object.keys(assignments).length >= CHORES.length;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center overflow-hidden"
      >
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[200vw] h-[200vw] rounded-full border-[100px] border-dashed border-pink-200"
         />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row h-full z-10 relative">
         
         {/* Left: The Wheel */}
         <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
            
            <h2 className="text-3xl font-black tracking-tight mb-8 text-center" style={{ color: primaryColor }}>
               {config.title || "Chore Roulette"}
            </h2>

            {/* Wheel Container */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
               
               {/* The Pointer */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-xl text-yellow-500">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 22L2 2h20L12 22z" />
                  </svg>
               </div>

               {/* The Spinning Wheel */}
               <div 
                  className="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden"
                  style={{
                     transform: `rotate(${rotation}deg)`,
                     transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none' // easeOutQuint-ish
                  }}
               >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                     {CHORES.map((chore, i) => (
                        <g key={i}>
                           {/* Slice */}
                           <path 
                              d={createSlicePath(i)} 
                              fill={sliceColors[i % sliceColors.length]}
                              stroke="white"
                              strokeWidth="0.5"
                           />
                           {/* Text (Requires a text path or tricky positioning. For SVG, text along arc or rotation is easiest) */}
                           <g transform={`translate(50, 50) rotate(${i * sliceAngle + (sliceAngle / 2)})`}>
                              <text 
                                 x="25" 
                                 y="2" 
                                 fill="white" 
                                 fontSize="5" 
                                 fontWeight="bold"
                                 className="drop-shadow-md font-sans"
                                 textAnchor="middle"
                                 style={{
                                    textDecoration: assignments[chore] ? 'line-through' : 'none',
                                    opacity: assignments[chore] ? 0.5 : 1
                                 }}
                              >
                                 {chore.length > 12 ? chore.substring(0, 10) + '...' : chore}
                              </text>
                           </g>
                        </g>
                     ))}
                     
                     {/* Center Hub */}
                     <circle cx="50" cy="50" r="10" fill="white" />
                     <circle cx="50" cy="50" r="7" fill={primaryColor} />
                  </svg>
               </div>
            </div>

            {/* Spin Button */}
            <div className="mt-12">
               <button
                  onClick={handleSpin}
                  disabled={isSpinning || isAllAssigned}
                  className={`px-12 py-4 rounded-full font-black text-2xl uppercase tracking-widest text-white shadow-xl transition-all ${
                     (isSpinning || isAllAssigned)
                        ? 'opacity-50 cursor-not-allowed scale-95'
                        : 'hover:scale-105 hover:shadow-2xl active:scale-95'
                  }`}
                  style={{ backgroundColor: primaryColor }}
               >
                  {isAllAssigned ? "All Assigned" : isSpinning ? "Spinning..." : "Spin"}
               </button>
            </div>

         </div>

         {/* Right: The Assignments */}
         <div className="w-full md:w-80 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-100 flex flex-col z-20">
            <div className="p-6 bg-slate-50 border-b border-slate-100">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-slate-400" />
                  Roommates
               </h3>
               
               <div className="mt-4 flex gap-2">
                  {ROOMMATES.map((r, i) => (
                     <div 
                        key={r} 
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-sm transition-colors ${
                           i === currentRoommateIndex && !isAllAssigned
                              ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 shadow-sm'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                     >
                        {r}
                     </div>
                  ))}
               </div>
               {!isAllAssigned && (
                  <p className="text-xs text-center text-slate-400 mt-2">
                     Currently rolling for: <strong className="text-slate-700">{ROOMMATES[currentRoommateIndex]}</strong>
                  </p>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  Assignments
               </h3>
               
               <AnimatePresence>
                  {CHORES.map((chore) => {
                     const assignee = assignments[chore];
                     const justAssigned = selectedChore === chore;

                     if (!assignee) return null;

                     return (
                        <motion.div
                           key={chore}
                           initial={{ opacity: 0, x: 20, scale: 0.9 }}
                           animate={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: 1,
                              backgroundColor: justAssigned ? '#fef9c3' : '#ffffff' // flash yellow if just assigned
                           }}
                           transition={{ type: "spring", stiffness: 300, damping: 20 }}
                           className="p-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                           <div className="text-sm font-bold text-slate-500 mb-1">{assignee} got:</div>
                           <div className="text-lg font-black text-slate-800">{chore}</div>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>

               {Object.keys(assignments).length === 0 && (
                  <div className="text-center p-8 text-slate-400 italic flex flex-col items-center gap-2">
                     <Dices size={32} className="opacity-20" />
                     Spin the wheel to assign chores!
                  </div>
               )}
            </div>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isAllAssigned && !isSpinning && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  const newAssignments: Record<string, string> = {};
                  CHORES.forEach((c, i) => {
                     newAssignments[c] = ROOMMATES[i % ROOMMATES.length];
                  });
                  setAssignments(newAssignments);
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Auto-Assign All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
