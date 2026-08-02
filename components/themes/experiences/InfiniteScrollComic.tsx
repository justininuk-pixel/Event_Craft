"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { RefreshCcw, Loader2 } from "lucide-react";

export function InfiniteScrollComic({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafafa"]; // neutral-50

  type Panel = { id: string, image: string, text: string };

  const [panels, setPanels] = useState<Panel[]>([
     { id: "1", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "It started as a normal Tuesday in the metropolis..." },
     { id: "2", image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "Until the sky cracked open like a broken eggshell." },
     { id: "3", image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "And they descended." }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const generateNextPanels = () => {
     if (isGenerating) return;
     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM + Image API async sequence
     setTimeout(() => {
        const newPanels: Panel[] = [
           { id: Date.now() + "1", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "The government tried to hide the truth, but the signals were clear." },
           { id: Date.now() + "2", image: "https://images.unsplash.com/photo-1540198163009-7afda7da2945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "Ancient machinery hummed back to life beneath the streets." },
           { id: Date.now() + "3", image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", text: "We weren't alone. We never were." }
        ];
        
        setPanels(prev => [...prev, ...newPanels]);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 20]);
     }, 2000);
  };

  useEffect(() => {
     const target = observerTarget.current;
     if (!target) return;

     const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isGenerating) {
           generateNextPanels();
        }
     }, { threshold: 0.1 });

     observer.observe(target);

     return () => observer.unobserve(target);
  }, [isGenerating]);

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-y-auto overflow-x-hidden bg-neutral-100 text-neutral-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-12">
         
         <div className="text-center mb-12">
            <h1 className="text-4xl font-black uppercase tracking-tighter">The Infinite Comic</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mt-2">Scroll down to procedurally generate the next narrative sequence</p>
         </div>

         {panels.map((p, i) => (
            <motion.div 
               key={p.id}
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="bg-white border-2 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative"
            >
               {/* Comic Panel Number */}
               <div className="absolute -top-3 -left-3 bg-black text-white w-8 h-8 flex items-center justify-center font-bold font-sans text-sm z-10">
                  {i + 1}
               </div>

               <div className="aspect-[16/9] border-2 border-black overflow-hidden mb-4 bg-neutral-200">
                  <img src={p.image} className="w-full h-full object-cover filter contrast-125 saturate-50" />
               </div>
               <div className="font-bold text-lg leading-snug">
                  {p.text}
               </div>
            </motion.div>
         ))}

         {/* Observer Target / Loader */}
         <div ref={observerTarget} className="h-32 flex flex-col items-center justify-center text-neutral-400">
            {isGenerating ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin text-neutral-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Prompting AI for next panels...</span>
               </motion.div>
            ) : (
               <div className="flex flex-col items-center gap-2 opacity-50">
                  <RefreshCcw size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Keep Scrolling</span>
               </div>
            )}
         </div>

      </div>

    </div>
  );
}
