"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

export function VisualSortingAlgorithm({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#a855f7"; // purple-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#030712"]; // gray-950

  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  
  // Track sorting history
  const historyRef = useRef<{ arr: number[], active: number[] }[]>([]);

  // Generate random array
  const generateArray = () => {
     const arr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10);
     setArray(arr);
     setActiveIndices([]);
     historyRef.current = [];
  };

  useEffect(() => {
     generateArray();
  }, []);

  // Bubble sort generating history
  const generateBubbleSortHistory = (initialArray: number[]) => {
     const history: { arr: number[], active: number[] }[] = [];
     const arr = [...initialArray];
     let n = arr.length;
     let swapped;
     do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
           history.push({ arr: [...arr], active: [i, i + 1] });
           if (arr[i] > arr[i + 1]) {
              let temp = arr[i];
              arr[i] = arr[i + 1];
              arr[i + 1] = temp;
              swapped = true;
              history.push({ arr: [...arr], active: [i, i + 1] });
           }
        }
        n--;
     } while (swapped);
     
     // Final state
     history.push({ arr: [...arr], active: [] });
     return history;
  };

  const handleSort = () => {
     if (isSorting) return;
     setIsSorting(true);

     const history = generateBubbleSortHistory(array);
     historyRef.current = history;

     let step = 0;
     const interval = setInterval(() => {
        if (step >= history.length) {
           clearInterval(interval);
           setIsSorting(false);
           setActiveIndices([]);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
           if (onComplete) setTimeout(onComplete, 4000);
           return;
        }

        const currentStep = history[step];
        setArray(currentStep.arr);
        setActiveIndices(currentStep.active);
        
        // Play click sound/vibration if swap happened
        if (step > 0 && history[step].arr.join(',') !== history[step-1].arr.join(',')) {
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(5);
        }

        step++;
     }, 100); // 100ms per step
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-gray-950 text-purple-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 flex justify-between items-center z-10 border-b border-gray-900 bg-gray-950/50 backdrop-blur-md">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Visual Sort</h2>
            <p className="text-[10px] text-gray-500 mt-1">Bubble Sort O(n²)</p>
         </div>
         <div className="flex gap-2">
            <button 
               onClick={generateArray}
               disabled={isSorting}
               className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-50"
            >
               <RotateCcw size={16} />
            </button>
            <button 
               onClick={handleSort}
               disabled={isSorting}
               className="px-4 py-2 bg-purple-600 text-white font-bold uppercase tracking-widest text-[10px] rounded hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2"
            >
               <Play size={14} /> Sort
            </button>
         </div>
      </div>

      <div className="flex-1 p-6 flex items-end justify-center gap-1 z-10 w-full overflow-hidden">
         {array.map((val, idx) => {
            const isActive = activeIndices.includes(idx);
            const isSorted = !isSorting && historyRef.current.length > 0;
            
            return (
               <motion.div
                  key={idx} // Not using stable ID to intentionally force layout animations or re-renders
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex-1 flex flex-col justify-end items-center max-w-8 rounded-t-sm transition-colors ${
                     isActive ? 'bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)]' : 
                     isSorted ? 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                     'bg-gray-800'
                  }`}
                  style={{ height: `${val}%` }}
               >
                  <span className={`text-[8px] mb-1 font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                     {val}
                  </span>
               </motion.div>
            );
         })}
      </div>

    </div>
  );
}
