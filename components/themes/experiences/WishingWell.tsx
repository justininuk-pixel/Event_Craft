"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Circle, Droplets, CircleDollarSign } from "lucide-react";

type Ripple = {
   id: string;
   x: number;
   y: number;
   size: number;
};

export function WishingWell({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // sky-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const [ripples, setRipples] = useState<Ripple[]>(() => 
    (((config.experience as any)?.items) || []).map((f: any, i: number) => ({
       id: `init-${i}`,
       x: 20 + Math.random() * 60,
       y: 20 + Math.random() * 60,
       size: 1 + Math.random() * 2
    }))
  );
  const [wishText, setWishText] = useState("");
  const [isCoinReady, setIsCoinReady] = useState(false);
  
  const coinControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = async (e: any, info: any) => {
     // If dragged upward significantly
     if (info.offset.y < -50) {
        // Calculate where it "lands" relative to center width and offset height
        const targetY = -200 + (Math.random() * 100 - 50);
        
        await coinControls.start({
           y: targetY,
           scale: 0.1,
           opacity: 0,
           rotateX: 720,
           transition: { duration: 0.8, ease: "easeIn" }
        });

        // Add ripple
        const newRipple: Ripple = {
           id: Date.now().toString(),
           x: 50 + (Math.random() * 20 - 10), // Approx center X
           y: 30 + (Math.random() * 20 - 10), // Approx upper Y
           size: 1.5
        };
        setRipples(prev => [...prev, newRipple]);

        // Play splash (vibrate)
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 20]);

        // Reset coin
        setIsCoinReady(false);
        setWishText("");
        coinControls.set({ y: 0, scale: 1, opacity: 1, rotateX: 0 });

        if (onComplete && ripples.length > 2) {
           setTimeout(onComplete, 1000);
        }

     } else {
        // Snap back
        coinControls.start({ y: 0, x: 0 });
     }
  };

  const handleCreateCoin = (e: React.FormEvent) => {
     e.preventDefault();
     if (wishText.trim()) {
        setIsCoinReady(true);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* The Water / Well Background */}
      <div 
         className="absolute inset-0 z-0 flex items-center justify-center opacity-80"
         style={{
            background: `radial-gradient(circle at 50% 30%, ${primaryColor}40 0%, transparent 60%)`
         }}
      >
         {/* Permanent Ripples */}
         {ripples.map((r, i) => (
            <motion.div
               key={r.id}
               className="absolute rounded-full border border-white/20"
               style={{
                  left: `${r.x}%`,
                  top: `${r.y}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: primaryColor
               }}
               initial={{ width: 0, height: 0, opacity: 1, borderWidth: 4 }}
               animate={{ 
                  width: [0, 100 * r.size, 150 * r.size], 
                  height: [0, 100 * r.size, 150 * r.size],
                  opacity: [1, 0.5, 0.1],
                  borderWidth: [4, 1, 1]
               }}
               transition={{ duration: 4, ease: "easeOut", repeat: Infinity, repeatDelay: 2 + (i % 3) }}
            />
         ))}
      </div>

      <div className="flex-1 flex flex-col z-10 p-6 relative">
         
         <div className="text-center mt-8 mb-auto pointer-events-none drop-shadow-md">
            <h2 className="text-2xl font-serif italic text-white/90 mb-2">
               The Wishing Well
            </h2>
            <p className="text-white/50 text-sm">
               {ripples.length} hopes cast into the dark.
            </p>
         </div>

         {/* Interaction Area */}
         <div className="mt-auto mb-8 w-full max-w-sm mx-auto flex flex-col items-center">
            
            <AnimatePresence mode="wait">
               {!isCoinReady ? (
                  <motion.form 
                     key="form"
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                     onSubmit={handleCreateCoin}
                     className="w-full flex flex-col items-center gap-4 bg-black/40 p-6 rounded-3xl backdrop-blur-md border border-white/10"
                  >
                     <div className="flex items-center gap-2 text-white/70 mb-2">
                        <Droplets size={16} /> Write a wish
                     </div>
                     <input 
                        type="text"
                        value={wishText}
                        onChange={e => setWishText(e.target.value)}
                        placeholder="I wish for..."
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-white placeholder-white/30 outline-none focus:border-white/50 transition-colors"
                        maxLength={40}
                     />
                     <button 
                        type="submit"
                        disabled={!wishText.trim()}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${wishText.trim() ? 'bg-white text-black hover:bg-slate-200' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                     >
                        Forge Coin
                     </button>
                  </motion.form>
               ) : (
                  <motion.div
                     key="coin"
                     initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                     className="relative flex flex-col items-center"
                     ref={containerRef}
                  >
                     <div className="absolute -top-12 text-white/50 text-xs uppercase tracking-widest animate-bounce">
                        Flick up to toss
                     </div>

                     <motion.div 
                        className="w-32 h-32 rounded-full border-4 border-yellow-500 bg-yellow-400 flex items-center justify-center p-4 shadow-[0_0_30px_rgba(234,179,8,0.5)] cursor-grab active:cursor-grabbing"
                        style={{
                           background: 'radial-gradient(circle at 30% 30%, #fde047 0%, #eab308 50%, #a16207 100%)'
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        animate={coinControls}
                     >
                        <div className="w-full h-full rounded-full border-2 border-yellow-600/30 flex items-center justify-center text-center leading-tight">
                           <span className="text-yellow-900 font-serif italic text-sm font-bold opacity-80 line-clamp-3">
                              {wishText}
                           </span>
                        </div>
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>

      </div>

    </div>
  );
}
