"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Receipt, DollarSign, GripHorizontal } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

export function TipCalculatorDial({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3f6212"; // lime-800
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f7fee7"]; // lime-50

  const [billAmount, setBillAmount] = useState(85.50);
  const [rotation, setRotation] = useState(0); // 0 degrees = 15% tip. 1 degree = 0.1% tip. Max = +150 deg (30%), Min = -150 deg (0%)
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Math mapping
  const baseTipPct = 15;
  // rotation to tip: baseTipPct + (rotation / 10). So +50deg = +5% = 20%.
  let currentTipPct = baseTipPct + (rotation / 10);
  currentTipPct = Math.max(0, Math.min(30, currentTipPct)); // Clamp 0 to 30%

  const tipAmount = billAmount * (currentTipPct / 100);
  const totalAmount = billAmount + tipAmount;

  // Handle Dragging
  useEffect(() => {
     if (!isDragging) return;

     const handlePointerMove = (e: PointerEvent) => {
        if (!dialRef.current) return;
        
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        
        // Calculate angle in degrees
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        // atan2 is 0 at 3 o'clock, 90 at 6 o'clock, 180/-180 at 9 o'clock, -90 at 12 o'clock.
        // Let's normalize it so we just track delta rotation, but a simple hack for an absolute dial:
        // We want 12 o'clock to be the "zero" resting point. 12 o'clock is -90 in atan2.
        angle += 90; 
        if (angle > 180) angle -= 360;
        
        // Clamp rotation
        angle = Math.max(-150, Math.min(150, angle));
        setRotation(angle);
     };

     const handlePointerUp = () => {
        setIsDragging(false);
        if (onComplete) onComplete();
     };

     window.addEventListener("pointermove", handlePointerMove);
     window.addEventListener("pointerup", handlePointerUp);

     return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
     };
  }, [isDragging, onComplete]);

  const formatCurrency = (val: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleRoundUp = () => {
     const nextDollar = Math.ceil(totalAmount);
     if (nextDollar > billAmount) {
        const requiredTip = nextDollar - billAmount;
        const requiredPct = (requiredTip / billAmount) * 100;
        const targetRot = (requiredPct - baseTipPct) * 10;
        setRotation(Math.max(-150, Math.min(150, targetRot)));
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-slate-800 touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Receipt Paper */}
      <div className="w-full max-w-sm mx-auto bg-white flex-1 relative shadow-2xl flex flex-col items-center pt-8 border-x border-slate-200">
         
         {/* Jagged Bottom Edge */}
         <div 
            className="absolute bottom-0 left-0 right-0 h-4 bg-repeat-x pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 10px 10px, transparent 10px, white 10px)", backgroundSize: "20px 20px" }}
         />
         
         <div className="absolute top-0 left-0 right-0 h-4 bg-slate-100 flex items-center justify-between px-2 opacity-50">
            {Array.from({length: 15}).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />)}
         </div>

         {/* Header */}
         <div className="text-center mt-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
               {config.title || "The Grille"}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
               {config.body || "Server: Emily • Table 4"}
            </p>
         </div>

         {/* Bill Input */}
         <div className="w-full px-8 mb-8">
            <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 border-dashed">
               <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Subtotal</span>
               <div className="flex items-center">
                  <span className="text-xl font-black text-slate-400">$</span>
                  <input
                     type="number"
                     value={billAmount}
                     onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                     className="bg-transparent border-none text-2xl font-black text-right w-32 focus:ring-0 p-0 text-slate-800"
                     step="0.01"
                  />
               </div>
            </div>
         </div>

         {/* Tip Output */}
         <div className="w-full px-8 mb-12">
            <div className="flex justify-between items-end pb-2 mb-2">
               <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Tip ({currentTipPct.toFixed(1)}%)</span>
               <span className="text-2xl font-black text-slate-600">{formatCurrency(tipAmount)}</span>
            </div>
            
            <div className="flex justify-between items-end bg-slate-100 p-4 rounded-xl">
               <span className="text-sm font-black uppercase tracking-widest text-slate-800">Total</span>
               <span className="text-4xl font-black" style={{ color: primaryColor }}>{formatCurrency(totalAmount)}</span>
            </div>
         </div>

         {/* The Dial */}
         <div className="flex-1 w-full flex items-center justify-center relative min-h-[300px]">
            
            {/* Round Up Button */}
            <button 
               onClick={handleRoundUp}
               className="absolute top-0 right-8 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95"
            >
               Round Up
            </button>

            {/* Outer Ring */}
            <div className="absolute w-64 h-64 rounded-full border-8 border-slate-100 flex items-center justify-center pointer-events-none">
               <div className="absolute -top-4 bg-white px-2 font-bold text-slate-400 text-xs">15%</div>
               <div className="absolute -bottom-4 bg-white px-2 font-bold text-slate-400 text-xs">0 / 30%</div>
            </div>

            {/* The Knob */}
            <motion.div 
               ref={dialRef}
               className="w-48 h-48 rounded-full bg-slate-800 shadow-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-4 border-slate-900 relative z-10"
               style={{ rotate: rotation }}
               onPointerDown={() => setIsDragging(true)}
            >
               {/* Grip Textures */}
               {Array.from({length: 12}).map((_, i) => (
                  <div 
                     key={i} 
                     className="absolute w-2 h-4 bg-slate-700 rounded-full opacity-50"
                     style={{
                        transform: `rotate(${i * 30}deg) translateY(-22px)`,
                        top: '5px'
                     }}
                  />
               ))}

               {/* Inner Indicator */}
               <div className="absolute top-4 w-4 h-4 bg-white rounded-full shadow-inner pointer-events-none" />
               <div className="absolute top-8 w-1 h-12 bg-slate-700/50 rounded-full pointer-events-none" />

               {/* Center Label (Counter-rotated to stay upright) */}
               <motion.div 
                  className="bg-white/10 w-24 h-24 rounded-full flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm border border-white/5"
                  style={{ rotate: -rotation }}
               >
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Tip</span>
                  <span className="text-white text-2xl font-black tabular-nums">{currentTipPct.toFixed(0)}%</span>
               </motion.div>

            </motion.div>

         </div>

      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-5 mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

    </div>
  );
}
