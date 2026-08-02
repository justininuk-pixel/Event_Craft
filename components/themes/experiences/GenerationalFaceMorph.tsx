"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Users, GripHorizontal } from "lucide-react";

export function GenerationalFaceMorph({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#92400e"; // amber-800
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"]; // amber-50

  const [sliderValue, setSliderValue] = useState(0);

  const images = (config.experience as any)?.images || [
     { id: "gen1", label: "Grandmother", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
     { id: "gen2", label: "Mother", src: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98a?q=80&w=400&auto=format&fit=crop" },
     { id: "gen3", label: "Daughter", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" }
  ];

  // Opacity calculations for 3-way crossfade
  // Gen 1 (0-50): Fades from 1 to 0
  const getOpGen1 = () => Math.max(0, 1 - (sliderValue / 50));
  
  // Gen 2 (0-100): Peaks at 50
  const getOpGen2 = () => {
     if (sliderValue <= 50) return sliderValue / 50;
     return 1 - ((sliderValue - 50) / 50);
  };
  
  // Gen 3 (50-100): Fades from 0 to 1
  const getOpGen3 = () => Math.max(0, (sliderValue - 50) / 50);

  // Determine which generation is most active for label highlighting
  let activeIndex = 0;
  if (sliderValue > 33 && sliderValue <= 66) activeIndex = 1;
  if (sliderValue > 66) activeIndex = 2;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = parseInt(e.target.value);
     setSliderValue(val);
     if (val === 100 && onComplete) {
        onComplete();
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden text-amber-950"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Vintage Background Texture */}
      <div 
         className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
         
         <div className="w-full text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
               {config.title || "The Lineage"}
            </h2>
            <p className="text-amber-900/60 text-sm mt-2 italic">
               {config.body || "Three generations, at age twenty-five."}
            </p>
         </div>

         {/* Antique Frame Container */}
         <div className="w-64 h-80 relative p-4 bg-[#e5e5e5] rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-[#3e2723]">
            {/* Inner Matte */}
            <div className="w-full h-full relative bg-black shadow-inner overflow-hidden border-2 border-[#1a110a] rounded-sm">
               
               {/* Gen 1 (Bottom Layer) */}
               <img 
                  src={images[0].src} 
                  alt={images[0].label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
                  style={{ opacity: getOpGen1(), filter: "sepia(0.8) contrast(1.2)" }}
               />
               
               {/* Gen 2 (Middle Layer) */}
               <img 
                  src={images[1].src} 
                  alt={images[1].label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75 mix-blend-screen"
                  style={{ opacity: getOpGen2(), filter: "sepia(0.3) contrast(1.1)" }}
               />
               
               {/* Gen 3 (Top Layer) */}
               <img 
                  src={images[2].src} 
                  alt={images[2].label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
                  style={{ opacity: getOpGen3() }}
               />

               {/* Frame Glass Glare */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 pointer-events-none" />
            </div>
         </div>

         {/* Slider Controls */}
         <div className="w-full max-w-sm mt-12 px-6 flex flex-col gap-6 bg-white/40 p-6 rounded-xl border border-amber-900/10 shadow-lg backdrop-blur-sm">
            
            <div className="flex justify-between items-center w-full">
               {images.map((img: any, idx: number) => (
                  <div 
                     key={idx} 
                     className={`flex flex-col items-center transition-all duration-300 ${
                        activeIndex === idx ? "scale-110 opacity-100" : "scale-90 opacity-40"
                     }`}
                  >
                     <Users size={16} className="mb-1" style={{ color: activeIndex === idx ? primaryColor : "inherit" }} />
                     <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: activeIndex === idx ? primaryColor : "inherit" }}>
                        {img.label}
                     </span>
                  </div>
               ))}
            </div>

            <div className="relative w-full flex items-center">
               <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-amber-900/20 rounded-full appearance-none outline-none cursor-pointer relative z-10"
                  style={{
                     accentColor: primaryColor,
                     background: `linear-gradient(to right, ${primaryColor} ${sliderValue}%, rgba(146,64,14,0.2) ${sliderValue}%)`
                  }}
               />
               {/* Custom Thumb visual hint */}
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-amber-900">
                  <GripHorizontal size={24} />
               </div>
            </div>

         </div>

      </div>

    </div>
  );
}
