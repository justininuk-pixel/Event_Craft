"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Send, Cpu, User } from "lucide-react";

export function InfiniteCoAuthorStorybook({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // indigo-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // parchment

  const [story, setStory] = useState<{author: "human" | "ai", text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const aiResponses = [
     "Suddenly, the heavy oak door swung open, revealing nothing but a pitch-black corridor.",
     "A strange, glowing symbol etched into the floor began to pulse with a faint blue light.",
     "Before anyone could speak, a massive tremor shook the foundation of the ancient building.",
     "The air grew unbearably cold, and the sound of distant whispering echoed through the hall.",
     "Without hesitation, the figure stepped out of the shadows, revealing a face I hadn't seen in ten years."
  ];

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [story, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isGenerating) return;

     setStory(prev => [...prev, { author: "human", text: input }]);
     setInput("");
     setIsGenerating(true);

     // Mock LLM generation delay
     setTimeout(() => {
        const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        setStory(prev => [...prev, { author: "ai", text: response }]);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
        
        // After 10 turns, end the experience
        if (story.length >= 8 && onComplete) {
           setTimeout(onComplete, 5000);
        }
     }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-slate-200/50 flex justify-center items-center z-10 bg-white/50 backdrop-blur-md">
         <h2 className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2 opacity-50">
            Chapter 1
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 w-full max-w-2xl mx-auto pb-32">
         
         <div className="space-y-6">
            {story.length === 0 && (
               <div className="text-center text-slate-400 italic mt-20">
                  The page is blank. Write the first sentence.
               </div>
            )}

            {story.map((block, idx) => (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`text-lg leading-relaxed ${block.author === "ai" ? "text-indigo-900 font-medium" : "text-slate-800"}`}
               >
                  {block.text}
               </motion.div>
            ))}

            {isGenerating && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-indigo-400 italic text-sm">
                  <Cpu size={14} className="animate-pulse" /> The AI is writing...
               </motion.div>
            )}
            <div ref={endRef} />
         </div>

      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7] to-transparent">
         <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative flex items-center shadow-2xl rounded-full bg-white border border-slate-200 p-1">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 ml-1">
               <User size={18} />
            </div>
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               disabled={isGenerating}
               placeholder="Write the next sentence..."
               className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 font-serif placeholder:text-slate-300 disabled:opacity-50"
               autoFocus
            />
            <button 
               type="submit" 
               disabled={!input.trim() || isGenerating}
               className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white flex items-center justify-center shrink-0 transition-colors"
            >
               <Send size={16} />
            </button>
         </form>
      </div>

    </div>
  );
}
