"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, useScroll, useTransform } from "framer-motion";

export function ReceiptRoll({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#000000";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8f9fa"];
  const paperColor = bgColors[0];

  // Derive receipt items from the body text by splitting on double newlines
  const lines = (config.body || "").split(/\n\n+/).filter(l => l.trim() !== "");
  if (lines.length === 0) {
    lines.push("ITEM 1 ..................... $0.00");
    lines.push("ITEM 2 ..................... $0.00");
    lines.push("THANK YOU FOR YOUR PATRONAGE");
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  // Map scroll progress to the rotation of the 3D roll at the top
  const rollRotation = useTransform(scrollYProgress, [0, 1], [0, -720]);
  // Map scroll progress to the thickness (scale) of the roll
  const rollScale = useTransform(scrollYProgress, [0, 1], [1, 2]);

  // Complete when scrolled to bottom
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (v > 0.95 && onComplete) {
        onComplete();
      }
    });
  }, [scrollYProgress, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-mono flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: "#27272a" }} // Dark background around the receipt
    >
      
      {/* 3D Paper Roll at the Top */}
      <div className="absolute top-8 z-20 perspective-[1000px] w-full max-w-sm flex justify-center pointer-events-none">
         <motion.div 
            className="w-full h-12 relative shadow-2xl"
            style={{ 
               rotateX: rollRotation,
               scale: rollScale,
               transformStyle: "preserve-3d"
            }}
         >
            {/* Cylinder representation */}
            <div className="absolute inset-0 bg-white border border-gray-300 rounded-full flex items-center justify-center overflow-hidden"
                 style={{ backgroundColor: paperColor, boxShadow: "inset 0 10px 20px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.5)" }}>
               <div className="w-full h-[1px] bg-gray-200/50 absolute top-1/4" />
               <div className="w-full h-[1px] bg-gray-200/50 absolute top-2/4" />
               <div className="w-full h-[1px] bg-gray-200/50 absolute top-3/4" />
            </div>
         </motion.div>
      </div>

      {/* The Scrollable Receipt */}
      <div 
         ref={containerRef}
         className="w-full max-w-sm h-full overflow-y-auto no-scrollbar relative z-10 pt-20 pb-32"
         style={{ perspective: "1000px" }}
      >
         <div 
            className="w-full bg-white shadow-xl min-h-[150%] p-6 relative origin-top flex flex-col"
            style={{ 
               backgroundColor: paperColor,
               backgroundImage: "radial-gradient(#00000010 1px, transparent 1px)",
               backgroundSize: "20px 20px"
            }}
         >
            {/* Serrated Top Edge */}
            <div className="absolute top-[-10px] left-0 w-full h-[10px] bg-repeat-x flex" style={{ backgroundColor: "transparent" }}>
               {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-[5%] h-full bg-transparent border-b-[10px] border-b-white border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent" 
                       style={{ borderBottomColor: paperColor }} />
               ))}
            </div>

            {/* Receipt Header */}
            <div className="text-center mb-8 border-b-2 border-dashed border-gray-400 pb-6 mt-4">
               <h1 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ color: primaryColor }}>
                  {config.title || "CVS / PHARMACY"}
               </h1>
               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Store #{(Math.random() * 9000 + 1000).toFixed(0)} • {new Date().toLocaleDateString()}
               </div>
               <div className="text-xs text-gray-500 font-bold mt-1 uppercase">
                  Cashier: {config.recipient || "Guest"}
               </div>
            </div>

            {/* Receipt Items (Story Lines) */}
            <div className="flex-grow flex flex-col space-y-6">
               {lines.map((line, idx) => (
                  <div key={idx} className="flex flex-col text-sm leading-relaxed text-black/80 font-medium">
                     <div className="flex justify-between items-start">
                        <span className="pr-4">{line}</span>
                        <span className="font-bold tracking-tighter shrink-0">${(Math.random() * 90 + 10).toFixed(2)}</span>
                     </div>
                     <div className="text-[10px] text-gray-400 mt-1 uppercase">
                        SKU {Math.random().toString(36).substring(2, 10).toUpperCase()}
                     </div>
                  </div>
               ))}
            </div>

            {/* Receipt Footer */}
            <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-400 text-center">
               <div className="flex justify-between text-lg font-black mb-4 uppercase">
                  <span>Total</span>
                  <span>PRICELESS</span>
               </div>
               
               {/* Barcode Mock */}
               <div className="w-full h-16 flex items-center justify-center opacity-80 mb-4 px-4 gap-1">
                  {[...Array(40)].map((_, i) => (
                     <div key={i} className="h-full bg-black" style={{ width: `${Math.random() * 4 + 1}px` }} />
                  ))}
               </div>

               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Thanks for shopping!
               </div>
            </div>

            {/* Serrated Bottom Edge */}
            <div className="absolute bottom-[-10px] left-0 w-full h-[10px] bg-repeat-x flex" style={{ backgroundColor: "transparent", transform: "rotate(180deg)" }}>
               {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-[5%] h-full bg-transparent border-b-[10px] border-b-white border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent" 
                       style={{ borderBottomColor: paperColor }} />
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
