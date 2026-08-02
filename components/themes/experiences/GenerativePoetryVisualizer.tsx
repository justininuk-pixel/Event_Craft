"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Image as ImageIcon, AlignLeft, Loader2 } from "lucide-react";

export function GenerativePoetryVisualizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [topic, setTopic] = useState("The passage of time in a forgotten city");
  const [isGenerating, setIsGenerating] = useState(false);
  const [poemData, setPoemData] = useState<{text: string, img: string}[] | null>(null);
  const [activeLine, setActiveLine] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
     if (!topic.trim() || isGenerating) return;
     
     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM generation pipelined into parallel Image API generation
     setTimeout(() => {
        
        // Mocked LLM array
        const lines = [
           "Cobblestones whisper to the wind, devoid of steps.",
           "Iron rusts in quiet defiance of the eternal sky.",
           "A single clockface, shattered, ignores the sun.",
           "Nature reclaims the throne built by mortal hands."
        ];

        // Mocked Image API fetches based on each string
        const images = [
           "https://images.unsplash.com/photo-1519011985187-444d62641929?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // street
           "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // rust
           "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // clock
           "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"  // nature reclaiming
        ];

        const mapped = lines.map((text, i) => ({ text, img: images[i] }));
        setPoemData(mapped);
        setIsGenerating(false);
        setActiveLine(0);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 15000); // longer time since they need to scroll
     }, 3000);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
     if (!poemData) return;
     const target = e.currentTarget;
     
     // Very rough intersection logic based on scroll position
     // Each block is 100vh.
     const scrollY = target.scrollTop;
     const vh = target.clientHeight;
     const index = Math.round(scrollY / vh);
     
     if (index !== activeLine && index >= 0 && index < poemData.length) {
        setActiveLine(index);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-black text-white" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Background Images Crossfading */}
      {poemData && (
         <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
            {poemData.map((pd, i) => (
               <div 
                  key={i} 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                  style={{ 
                     backgroundImage: `url(${pd.img})`,
                     opacity: i === activeLine ? 0.6 : 0
                  }}
               />
            ))}
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
         </div>
      )}

      {/* Setup UI */}
      {!poemData && (
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black">
            <div className="max-w-md w-full space-y-6 text-center">
               <div className="space-y-2">
                  <h1 className="text-3xl font-normal">Iterative Visualization</h1>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-sans font-bold">
                     LLM Pipeline → Parallel Image API Fetches
                  </p>
               </div>

               <div className="space-y-4">
                  <input 
                     type="text" 
                     value={topic}
                     onChange={e => setTopic(e.target.value)}
                     disabled={isGenerating}
                     className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center outline-none focus:border-white/50 transition-colors"
                  />
                  <button 
                     onClick={handleGenerate}
                     disabled={isGenerating}
                     className="w-full py-4 bg-white text-black font-sans font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50"
                  >
                     {isGenerating ? (
                        <><Loader2 size={16} className="animate-spin" /> Chaining API Requests...</>
                     ) : (
                        <><ImageIcon size={16} /> Generate Sequence</>
                     )}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Scrollable Poem Content */}
      {poemData && (
         <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="absolute inset-0 z-10 overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar"
         >
            {/* Hint overlay */}
            <div className="fixed top-6 left-0 right-0 pointer-events-none flex justify-center z-50">
               <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full text-[10px] font-sans uppercase tracking-widest text-white/70 flex items-center gap-2">
                  <AlignLeft size={12} /> Scroll to traverse the array
               </div>
            </div>

            {poemData.map((pd, i) => (
               <div 
                  key={i} 
                  className="w-full h-full snap-start snap-always flex items-center justify-center p-8 md:p-20 relative"
               >
                  <motion.div 
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ amount: 0.5 }}
                     transition={{ duration: 1 }}
                     className="text-2xl md:text-5xl lg:text-6xl text-center leading-relaxed md:leading-snug max-w-4xl text-white/90 drop-shadow-2xl font-medium tracking-wide"
                  >
                     "{pd.text}"
                  </motion.div>
                  
                  {/* Line indicator */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                     {poemData.map((_, dotIdx) => (
                        <div key={dotIdx} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${dotIdx === i ? 'bg-white scale-150' : 'bg-white/30'}`} />
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )}

    </div>
  );
}
