"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { DollarSign, GripVertical, AlertTriangle } from "lucide-react";

export function BlockSorter503020({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];
  
  // Custom colors for the 3 blocks
  const colorNeeds = "#3b82f6"; // blue-500
  const colorWants = "#ec4899"; // pink-500
  const colorSavings = "#10b981"; // emerald-500

  const [income, setIncome] = useState(5000);
  
  // The two dividers that split the 100% width into 3 chunks
  // Initial: Needs (0-50), Wants (50-80), Savings (80-100)
  const [divider1, setDivider1] = useState(50); // Boundary between Needs and Wants
  const [divider2, setDivider2] = useState(80); // Boundary between Wants and Savings

  const [isDragging, setIsDragging] = useState<1 | 2 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate percentages based on dividers
  const pctNeeds = divider1;
  const pctWants = divider2 - divider1;
  const pctSavings = 100 - divider2;

  // Handle Dragging
  useEffect(() => {
     if (!isDragging) return;

     const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate raw percentage of mouse X relative to container
        let rawPct = ((e.clientX - rect.left) / rect.width) * 100;
        
        // Constraints
        rawPct = Math.max(5, Math.min(95, rawPct)); // Global min/max to prevent squishing to 0
        
        if (isDragging === 1) {
           // Divider 1 must stay behind Divider 2 (minus a buffer)
           const max = divider2 - 5;
           setDivider1(Math.min(rawPct, max));
        } else if (isDragging === 2) {
           // Divider 2 must stay ahead of Divider 1 (plus a buffer)
           const min = divider1 + 5;
           setDivider2(Math.max(rawPct, min));
        }
     };

     const handleMouseUp = () => {
        setIsDragging(null);
        if (onComplete) onComplete(); // Trigger onComplete after they drag something
     };

     window.addEventListener("mousemove", handleMouseMove);
     window.addEventListener("mouseup", handleMouseUp);
     
     // Touch support
     window.addEventListener("touchmove", (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let rawPct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        rawPct = Math.max(5, Math.min(95, rawPct));
        
        if (isDragging === 1) {
           const max = divider2 - 5;
           setDivider1(Math.min(rawPct, max));
        } else if (isDragging === 2) {
           const min = divider1 + 5;
           setDivider2(Math.max(rawPct, min));
        }
     });
     window.addEventListener("touchend", handleMouseUp);

     return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        // Clean up touch
     };
  }, [isDragging, divider1, divider2, onComplete]);

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const isWarningSavings = pctSavings < 10;

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white bg-black select-none"
    >
      
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none pb-12">
         
         <div className="pointer-events-auto">
            <h2 className="text-xl md:text-3xl font-black tracking-tight mb-1">
               {config.title || "The 50/30/20 Rule"}
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">
               {config.body || "Drag the borders to redistribute your income"}
            </p>
         </div>

         <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 pointer-events-auto">
            <div className="flex items-center gap-1 text-white/50 pl-3">
               <DollarSign size={20} />
            </div>
            <input
               type="number"
               value={income}
               onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
               className="bg-transparent border-none text-2xl font-black focus:ring-0 w-32"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-white/50 pr-3">/mo</span>
         </div>
         
      </div>

      {/* Main Drag Area */}
      <div 
         ref={containerRef}
         className="flex-1 flex flex-row w-full relative pt-32 pb-8 px-4 gap-2 sm:gap-4 md:px-8"
      >
         
         {/* Block 1: Needs */}
         <div 
            className="h-full rounded-3xl flex flex-col justify-end p-6 relative overflow-hidden transition-all duration-75 ease-out shadow-2xl"
            style={{ width: `calc(${pctNeeds}%)`, backgroundColor: colorNeeds }}
         >
            <div className="absolute top-6 left-6 text-white/40 font-black text-6xl tracking-tighter mix-blend-overlay hidden sm:block">
               {Math.round(pctNeeds)}%
            </div>
            <div className="relative z-10">
               <h3 className="font-black text-2xl md:text-4xl tracking-tight mb-1">Needs</h3>
               <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-4">Rent, Bills, Food</p>
               <div className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter">
                  {formatCurrency((pctNeeds / 100) * income)}
               </div>
            </div>
         </div>

         {/* Block 2: Wants */}
         <div 
            className="h-full rounded-3xl flex flex-col justify-end p-6 relative overflow-hidden transition-all duration-75 ease-out shadow-2xl"
            style={{ width: `calc(${pctWants}%)`, backgroundColor: colorWants }}
         >
            <div className="absolute top-6 left-6 text-white/40 font-black text-6xl tracking-tighter mix-blend-overlay hidden sm:block">
               {Math.round(pctWants)}%
            </div>
            <div className="relative z-10">
               <h3 className="font-black text-2xl md:text-4xl tracking-tight mb-1">Wants</h3>
               <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-4">Fun, Dining, Hobby</p>
               <div className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter">
                  {formatCurrency((pctWants / 100) * income)}
               </div>
            </div>
         </div>

         {/* Block 3: Savings */}
         <div 
            className="h-full rounded-3xl flex flex-col justify-end p-6 relative overflow-hidden transition-all duration-75 ease-out shadow-2xl"
            style={{ width: `calc(${pctSavings}%)`, backgroundColor: colorSavings }}
         >
            <div className="absolute top-6 left-6 text-white/40 font-black text-6xl tracking-tighter mix-blend-overlay hidden sm:block">
               {Math.round(pctSavings)}%
            </div>
            <div className="relative z-10">
               <h3 className="font-black text-2xl md:text-4xl tracking-tight mb-1">Savings</h3>
               <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-4">Investing, Debt</p>
               
               {isWarningSavings && (
                  <div className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 mb-2">
                     <AlertTriangle size={12} /> Dangerously Low
                  </div>
               )}

               <div className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter">
                  {formatCurrency((pctSavings / 100) * income)}
               </div>
            </div>
         </div>

         {/* Draggable Divider 1 */}
         <div 
            className="absolute top-32 bottom-8 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-30 group"
            style={{ left: `calc(${divider1}%)` }}
            onMouseDown={() => setIsDragging(1)}
            onTouchStart={() => setIsDragging(1)}
         >
            <div className={`w-1.5 h-1/3 max-h-32 bg-white/50 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all ${isDragging === 1 ? 'bg-white h-1/2 scale-110' : ''}`}>
               <GripVertical size={16} className={`text-black/50 ${isDragging === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </div>
         </div>

         {/* Draggable Divider 2 */}
         <div 
            className="absolute top-32 bottom-8 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-30 group"
            style={{ left: `calc(${divider2}%)` }}
            onMouseDown={() => setIsDragging(2)}
            onTouchStart={() => setIsDragging(2)}
         >
            <div className={`w-1.5 h-1/3 max-h-32 bg-white/50 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all ${isDragging === 2 ? 'bg-white h-1/2 scale-110' : ''}`}>
               <GripVertical size={16} className={`text-black/50 ${isDragging === 2 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </div>
         </div>

      </div>

      {/* Mobile Hint */}
      <div className="text-center pb-6 sm:hidden opacity-50 text-xs font-bold uppercase tracking-widest">
         Tap and drag the spaces between blocks
      </div>

    </div>
  );
}
