"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCcw } from "lucide-react";

type TarotCard = {
  name: string;
  image: string;
};

export function GenerativeTarotReader({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#2e1065"]; // purple-950

  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"input" | "drawing" | "reading">("input");
  const [cards, setCards] = useState<TarotCard[] | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  const mockTarotDeck: TarotCard[] = [
     { name: "The Fool", image: "https://images.unsplash.com/photo-1601004147055-635293297a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // cliff/jump
     { name: "The Magician", image: "https://images.unsplash.com/photo-1544027414-b6c8916365a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // mystic/magic
     { name: "The High Priestess", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // moon/mystery
     { name: "The Tower", image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // lightning/destruction
     { name: "Death", image: "https://images.unsplash.com/photo-1509211756534-118838d21278?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // skull/change
     { name: "The Sun", image: "https://images.unsplash.com/photo-1532040675891-5991e7e3d0cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // sun/joy
     { name: "The Moon", image: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }, // moon/illusion
     { name: "Wheel of Fortune", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" } // wheel/fate
  ];

  const handleDraw = (e: React.FormEvent) => {
     e.preventDefault();
     if (!question.trim() || phase !== "input") return;

     setPhase("drawing");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Simulate drawing cards and LLM reading
     setTimeout(() => {
        // Random array selection
        const drawn: TarotCard[] = [];
        const deckCopy = [...mockTarotDeck];
        for (let i=0; i<3; i++) {
           const randIdx = Math.floor(Math.random() * deckCopy.length);
           drawn.push(deckCopy[randIdx]);
           deckCopy.splice(randIdx, 1); // remove to avoid duplicates
        }
        setCards(drawn);

        // Mock LLM Synthesis
        const cardNames = drawn.map(c => c.name);
        setTimeout(() => {
           setReading(`The cards speak to your query: "${question}".\n\nIn the Past position, ${cardNames[0]} reveals the foundation of your current situation, indicating forces you have recently left behind.\n\nThe Present is marked by ${cardNames[1]}, showing the immediate energies surrounding you. It demands your attention now.\n\nLooking to the Future, ${cardNames[2]} suggests the outcome if you remain on your current path. The synthesis of these abstract symbols points toward an inevitable transformation.`);
           setPhase("reading");
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 100]);

           if (onComplete) setTimeout(onComplete, 12000);
        }, 2000);

     }, 1500);
  };

  const reset = () => {
     setPhase("input");
     setQuestion("");
     setCards(null);
     setReading(null);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-purple-950 text-purple-100" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Velvet Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen" />
      
      <div className="p-6 text-center z-10 shrink-0">
         <h2 className="text-xl font-normal text-purple-200 tracking-widest uppercase flex justify-center items-center gap-3">
            <Sparkles size={20} className="text-amber-400" /> Synthesized Divination
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto space-y-12">
         
         <AnimatePresence mode="wait">
            
            {phase === "input" && (
               <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg space-y-8 text-center">
                  <div className="text-sm font-sans uppercase tracking-widest text-purple-400 font-bold border-b border-purple-800 pb-4">
                     Random Array Selection Seeding LLM Narrative
                  </div>
                  <form onSubmit={handleDraw} className="space-y-6">
                     <textarea 
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="What guidance do you seek?"
                        className="w-full h-32 bg-purple-900/50 border border-purple-700/50 rounded-xl p-4 text-center text-lg outline-none focus:border-amber-400 transition-colors placeholder:text-purple-400/50 resize-none shadow-inner text-amber-100 italic"
                     />
                     <button 
                        type="submit"
                        disabled={!question.trim()}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-purple-900 text-purple-950 disabled:text-purple-700 rounded-full font-sans font-black uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)] disabled:shadow-none"
                     >
                        Draw Three Cards
                     </button>
                  </form>
               </motion.div>
            )}

            {(phase === "drawing" || phase === "reading") && cards && (
               <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-12">
                  
                  {/* Card Display */}
                  <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 perspective-1000">
                     {cards.map((c, i) => (
                        <motion.div 
                           key={i}
                           initial={{ rotateY: 180, y: 50, opacity: 0 }}
                           animate={{ rotateY: 0, y: 0, opacity: 1 }}
                           transition={{ delay: i * 0.5, duration: 0.8, type: "spring" }}
                           className="flex flex-col items-center gap-4"
                        >
                           <div className="text-[10px] font-sans uppercase tracking-widest text-purple-400 font-bold">
                              {i === 0 ? "Past" : i === 1 ? "Present" : "Future"}
                           </div>
                           <div className="w-40 h-64 md:w-48 md:h-72 bg-purple-900 border-2 border-amber-600/50 rounded-xl overflow-hidden shadow-2xl relative">
                              <img src={c.image} className="w-full h-full object-cover filter contrast-125 sepia-[0.3]" alt={c.name} />
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur text-center py-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                 {c.name}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  {/* Reading Output */}
                  <div className="max-w-2xl mx-auto min-h-[200px] flex flex-col items-center justify-center">
                     {phase === "drawing" ? (
                        <div className="flex flex-col items-center gap-4 text-purple-400">
                           <Loader2 size={32} className="animate-spin" />
                           <div className="text-xs font-sans uppercase tracking-widest font-bold">LLM synthesizing abstract symbols...</div>
                        </div>
                     ) : (
                        <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }} 
                           className="bg-purple-900/40 border border-purple-800/50 p-8 rounded-2xl shadow-inner text-center space-y-6"
                        >
                           <p className="text-lg leading-relaxed text-purple-100 font-medium">
                              {reading}
                           </p>
                           <button 
                              onClick={reset}
                              className="mt-6 flex items-center justify-center gap-2 mx-auto text-xs font-sans uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
                           >
                              <RefreshCcw size={14} /> Read Again
                           </button>
                        </motion.div>
                     )}
                  </div>

               </motion.div>
            )}

         </AnimatePresence>
      </div>

    </div>
  );
}
