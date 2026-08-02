"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Scissors, Cloud } from "lucide-react";

export function FinalGoodbye({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const balloonColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#bae6fd"]; // sky-200

  const [isCut, setIsCut] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  const controls = useAnimation();

  // Detect swipe across string
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
     if (isCut) return;
     setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
     if (!dragStart || isCut) return;
     
     const dx = e.clientX - dragStart.x;
     
     // If dragged horizontally across the string more than 50px
     if (Math.abs(dx) > 50) {
        cutString();
     }
  };

  const handlePointerUp = () => {
     setDragStart(null);
  };

  const cutString = async () => {
     setIsCut(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100]);
     
     // Fly away animation
     await controls.start({
        y: -1000,
        x: (Math.random() - 0.5) * 200,
        rotate: (Math.random() - 0.5) * 45,
        transition: { duration: 3, ease: "easeIn" }
     });

     // Wait a bit, then "delete"
     setTimeout(() => {
        setIsDeleted(true);
        // Simulate API call to delete record
        console.log("API CALL: DELETING RECORD PERMANENTLY");
        
        if (onComplete) setTimeout(onComplete, 3000);
     }, 1000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Clouds */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
         <Cloud size={120} className="absolute top-10 left-10 text-white" />
         <Cloud size={80} className="absolute top-40 right-20 text-white" />
         <Cloud size={150} className="absolute bottom-32 left-[-20px] text-white" />
      </div>

      <AnimatePresence>
         {!isDeleted ? (
            <motion.div 
               exit={{ opacity: 0 }}
               className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full"
            >
               
               <motion.div 
                  className="relative flex flex-col items-center"
                  animate={controls}
                  initial={{ y: 0 }}
               >
                  {/* The Balloon */}
                  <motion.div 
                     className="w-48 h-56 rounded-[50%] flex items-center justify-center p-6 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),_0_20px_30px_rgba(0,0,0,0.1)] relative z-20"
                     style={{ backgroundColor: balloonColor }}
                     animate={!isCut ? { y: [-5, 5, -5], rotate: [-1, 1, -1] } : {}}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                     <div className="absolute top-4 left-6 w-12 h-16 bg-white/20 rounded-[50%] blur-md rotate-[-45deg]" />
                     
                     <div className="text-center text-white z-10">
                        <h2 className="text-xl font-bold tracking-tight mb-2 drop-shadow-md">
                           {config.title || "Goodbye."}
                        </h2>
                        <p className="text-sm font-medium leading-tight opacity-90 drop-shadow-sm line-clamp-4">
                           {config.body || "Some things just aren't meant to be held onto forever."}
                        </p>
                     </div>

                     {/* Balloon knot */}
                     <div 
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4"
                        style={{
                           borderLeft: '8px solid transparent',
                           borderRight: '8px solid transparent',
                           borderBottom: `12px solid ${balloonColor}`,
                           filter: 'brightness(0.8)'
                        }}
                     />
                  </motion.div>

                  {/* The String */}
                  <div className="relative w-full flex justify-center h-[40vh]">
                     {!isCut ? (
                        <div 
                           className="w-1 h-full bg-white shadow-sm"
                           style={{ transformOrigin: 'top center' }}
                        />
                     ) : (
                        <div className="w-1 h-16 bg-white shadow-sm origin-top animate-ping opacity-0" />
                     )}
                     
                     {/* Cut interaction zone */}
                     {!isCut && (
                        <div 
                           className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-24 bg-red-500/0 flex items-center justify-center cursor-crosshair z-30"
                           onPointerDown={handlePointerDown}
                           onPointerMove={handlePointerMove}
                           onPointerUp={handlePointerUp}
                           onPointerLeave={handlePointerUp}
                        >
                           <div className="flex items-center gap-2 text-white/50 animate-pulse pointer-events-none bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                              <Scissors size={14} /> <span>Swipe to cut</span>
                           </div>
                        </div>
                     )}
                  </div>

               </motion.div>

            </motion.div>
         ) : (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white z-50 p-8 text-center"
            >
               <h3 className="text-3xl font-black uppercase tracking-widest text-slate-500 mb-4">
                  Record Deleted
               </h3>
               <p className="text-slate-400 font-medium">
                  This card and its contents have been permanently erased from the server. It can never be viewed again.
               </p>
               {mode === "editor-preview" && (
                  <button 
                     onClick={() => {
                        setIsDeleted(false);
                        setIsCut(false);
                        controls.set({ y: 0, x: 0, rotate: 0 });
                     }}
                     className="mt-8 px-6 py-2 border border-slate-600 rounded-full text-slate-300 hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs font-bold"
                  >
                     Reset (Editor Only)
                  </button>
               )}
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
