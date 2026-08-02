"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Shrink, Type, Loader2 } from "lucide-react";

export function EmojiNarrativeCompressor({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf4ff"]; // fuchsia-50

  const [input, setInput] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [emojis, setEmojis] = useState<string | null>(null);

  const mockNarrative = "Today started out terrible. I spilled hot coffee all over my brand new white shirt right before my massive presentation to the board. I was panicking and almost crying in the bathroom trying to clean it. But then, I just owned it. I walked in, made a joke about it, and absolutely crushed the presentation. They loved it. Afterwards, my boss bought me a celebratory drink. I am so relieved and happy.";

  const handleCompress = () => {
     const textToCompress = input.trim() || mockNarrative;
     setIsCompressing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM extreme lossy compression
     setTimeout(() => {
        let result = "☕👕😭📈🥂"; // default for the mock narrative

        if (input.trim()) {
           const lower = input.toLowerCase();
           if (lower.includes("car") || lower.includes("drive") || lower.includes("traffic")) result = "🚗🚦🤬⏳🏢";
           else if (lower.includes("love") || lower.includes("date") || lower.includes("kiss")) result = "👀😳🌹🍷💋";
           else if (lower.includes("sick") || lower.includes("hospital") || lower.includes("pain")) result = "🤢🤒🏥💉😌";
        }

        setEmojis(result);
        setIsCompressing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (onComplete) setTimeout(onComplete, 8000);
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-fuchsia-50 text-fuchsia-950" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-fuchsia-200 flex justify-between items-center z-10 shrink-0 bg-white shadow-sm">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-fuchsia-800">
            <Shrink size={16} className="text-fuchsia-600" /> Lossy Narrative Compression
         </h2>
      </div>

      <div className="flex-1 relative flex flex-col p-6 w-full max-w-2xl mx-auto overflow-y-auto space-y-6">
         
         <AnimatePresence mode="wait">
            {!emojis && !isCompressing && (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-center space-y-2 mt-8">
                     <h3 className="text-2xl font-black">Data Distillation</h3>
                     <p className="text-sm text-fuchsia-700/80 max-w-md mx-auto">
                        Paste a complex, multi-paragraph story. The LLM will discard all syntax and grammar, retaining only the core chronological emotional arc, outputting exactly 5 unicode characters.
                     </p>
                  </div>

                  <div className="relative bg-white rounded-2xl shadow-sm border border-fuchsia-200 overflow-hidden">
                     <div className="absolute top-4 left-4 text-fuchsia-300">
                        <Type size={20} />
                     </div>
                     <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={mockNarrative}
                        className="w-full h-64 bg-transparent p-6 pl-12 text-lg resize-none outline-none focus:bg-fuchsia-100/30 transition-colors placeholder:text-fuchsia-300/60 leading-relaxed"
                     />
                  </div>

                  <button 
                     onClick={handleCompress}
                     className="w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-fuchsia-600/30 flex items-center justify-center gap-3"
                  >
                     <Shrink size={20} /> Execute Extreme Compression
                  </button>
               </motion.div>
            )}

            {isCompressing && (
               <motion.div key="compressing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center space-y-8">
                  <motion.div 
                     animate={{ scale: [1, 0.5, 0.2] }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                     className="w-32 h-32 border-4 border-fuchsia-300 border-dashed rounded-full flex items-center justify-center"
                  >
                     <Loader2 size={32} className="animate-spin text-fuchsia-500" />
                  </motion.div>
                  <div className="text-center">
                     <div className="text-sm font-black uppercase tracking-widest text-fuchsia-600 mb-2">Stripping Syntax</div>
                     <div className="text-[10px] uppercase tracking-widest text-fuchsia-400">Extracting Emotional Arc...</div>
                  </div>
               </motion.div>
            )}

            {emojis && !isCompressing && (
               <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center space-y-12 py-12">
                  
                  <div className="text-center space-y-2">
                     <h3 className="text-xs font-black uppercase tracking-widest text-fuchsia-500">Compression Complete</h3>
                     <p className="text-[10px] text-fuchsia-400 uppercase tracking-widest">Original Size: {input.trim() ? input.length : mockNarrative.length} bytes | Compressed: 20 bytes</p>
                  </div>

                  <div className="text-5xl md:text-6xl text-center flex flex-wrap justify-center gap-2 md:gap-3 drop-shadow-2xl">
                     {emojis.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\S/g)?.map((e, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, y: 50, scale: 0.5 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           transition={{ delay: i * 0.2, type: "spring" }}
                           className="hover:scale-125 transition-transform cursor-pointer"
                        >
                           {e}
                        </motion.div>
                     ))}
                  </div>

                  <div className="max-w-md text-center p-6 bg-white/50 border border-fuchsia-200 rounded-2xl shadow-sm text-fuchsia-800 italic text-sm">
                     "{input.trim() ? input : mockNarrative}"
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
