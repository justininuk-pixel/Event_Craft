"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Heart, LockOpen } from "lucide-react";
import Image from "next/image";

export function VirtualLocket({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#fbbf24"; // amber-400 (gold)
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const [isOpen, setIsOpen] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const images = ((config.experience as any)?.items as any[])?.map((f: any) => f.imageUrl).filter(Boolean) || [
     "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop",
     "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=400&auto=format&fit=crop"
  ];

  const handleDrag = (e: any, info: any) => {
     if (isOpen) return;
     // Map x drag distance to progress (0 to 100)
     const progress = Math.min(Math.max((info.offset.x / 100) * 100, 0), 100);
     setSwipeProgress(progress);
  };

  const handleDragEnd = (e: any, info: any) => {
     if (isOpen) return;
     if (info.offset.x > 80) {
        setIsOpen(true);
        if (onComplete) {
           setTimeout(onComplete, 5000);
        }
        if (typeof navigator !== "undefined" && navigator.vibrate) {
           navigator.vibrate([50, 50, 50]);
        }
     } else {
        setSwipeProgress(0);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background ambient light */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[500px] h-[500px] rounded-full blur-[100px]" style={{ backgroundColor: primaryColor }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 w-full max-w-md mx-auto relative perspective-[1000px]">
         
         {/* The Chain */}
         <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-4 h-[200px] flex justify-center z-0">
            <svg width="20" height="200" viewBox="0 0 20 200" className="opacity-50">
               <path d="M10,0 L10,200" stroke={primaryColor} strokeWidth="4" strokeDasharray="8 4" />
            </svg>
         </div>

         {/* The Locket Assembly */}
         <div className="relative w-64 h-64 mt-16 z-10" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* Back Plate (Inside center) */}
            <div 
               className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[12px]"
               style={{ 
                  backgroundColor: '#000',
                  borderColor: primaryColor,
                  transform: 'translateZ(-1px)'
               }}
            >
               <div className="absolute inset-0 rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full relative opacity-50">
                     <Image src={images[0]} alt="Locket left" fill className="object-cover object-left" />
                  </div>
               </div>
            </div>

            {/* Left Door */}
            <motion.div 
               className="absolute top-0 bottom-0 left-0 right-1/2 origin-left"
               style={{ transformStyle: 'preserve-3d' }}
               animate={{ rotateY: isOpen ? -130 : 0 }}
               transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
               {/* Inside Left */}
               <div 
                  className="absolute inset-0 bg-black overflow-hidden border-y-[12px] border-l-[12px] rounded-l-full backface-hidden"
                  style={{ borderColor: primaryColor, transform: 'rotateY(180deg)' }}
               >
                  <div className="absolute top-0 bottom-0 right-0 w-[200%]">
                     <Image src={images[0]} alt="Inside Left" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 shadow-[inset_-20px_0_30px_rgba(0,0,0,0.8)]" />
               </div>

               {/* Outside Left */}
               <div 
                  className="absolute inset-0 overflow-hidden border-y-[12px] border-l-[12px] rounded-l-full backface-hidden"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
               >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-32 h-32 opacity-20 border-4 border-black/50 rounded-full" />
               </div>
            </motion.div>

            {/* Right Door */}
            <motion.div 
               className="absolute top-0 bottom-0 left-1/2 right-0 origin-right"
               style={{ transformStyle: 'preserve-3d' }}
               animate={{ rotateY: isOpen ? 130 : 0 }}
               transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
               {/* Inside Right */}
               <div 
                  className="absolute inset-0 bg-black overflow-hidden border-y-[12px] border-r-[12px] rounded-r-full backface-hidden"
                  style={{ borderColor: primaryColor, transform: 'rotateY(180deg)' }}
               >
                  <div className="absolute top-0 bottom-0 left-0 w-[200%]">
                     <Image src={images[1] || images[0]} alt="Inside Right" fill className="object-cover" />
                  </div>
                  <div className="absolute inset-0 shadow-[inset_20px_0_30px_rgba(0,0,0,0.8)]" />
               </div>

               {/* Outside Right */}
               <div 
                  className="absolute inset-0 overflow-hidden border-y-[12px] border-r-[12px] rounded-r-full backface-hidden"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
               >
                  <div className="absolute inset-0 bg-gradient-to-tl from-black/40 to-white/20" />
                  <div className="absolute top-1/2 right-1/2 translate-x-1/4 -translate-y-1/2 w-32 h-32 opacity-20 border-4 border-black/50 rounded-full" />
               </div>
            </motion.div>

            {/* The Clasp Interaction */}
            {!isOpen && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center z-20">
                  
                  {/* Swiping Indicator Track */}
                  <div className="absolute -bottom-16 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                     <div className="h-full bg-white transition-all" style={{ width: `${swipeProgress}%` }} />
                  </div>
                  <div className="absolute -bottom-24 w-32 text-center text-xs font-bold text-white/50 uppercase tracking-widest flex items-center justify-center gap-2">
                     Swipe to open
                  </div>

                  <motion.div
                     drag="x"
                     dragConstraints={{ left: 0, right: 100 }}
                     dragElastic={0.1}
                     onDrag={handleDrag}
                     onDragEnd={handleDragEnd}
                     className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border-2 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                     style={{ borderColor: primaryColor }}
                     whileTap={{ scale: 0.9 }}
                     animate={{ x: swipeProgress === 0 ? 0 : undefined }}
                  >
                     <LockOpen size={16} className="text-white" />
                  </motion.div>
               </div>
            )}
            
         </div>
         
         {/* Hidden Text Revealed after opening */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center text-white"
         >
            <h3 className="text-2xl font-black mb-2" style={{ color: primaryColor }}>
               {config.title || "Always with me"}
            </h3>
            <p className="text-sm font-medium text-white/70 max-w-[250px] mx-auto italic">
               {config.body || "No matter how far apart we are."}
            </p>
         </motion.div>

      </div>

    </div>
  );
}
