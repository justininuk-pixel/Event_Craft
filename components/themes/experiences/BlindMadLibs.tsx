"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_STORY = "The [Adjective] [Noun] decided to [Verb] all the way to the [Noun] because it was feeling very [Adjective].";

export function BlindMadLibs({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const storyTemplate = config.body || DEFAULT_STORY;
  
  // Extract prompts (e.g. "Adjective", "Noun", "Verb")
  // Using a regex to find all [Bracketed] words.
  const regex = /\[(.*?)\]/g;
  const matches = [...storyTemplate.matchAll(regex)];
  const prompts = matches.map(m => m[1]);

  const [phase, setPhase] = useState<"prompting" | "revealed">(prompts.length > 0 ? "prompting" : "revealed");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"];

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!inputValue.trim()) return;

     const newAnswers = [...answers, inputValue.trim()];
     setAnswers(newAnswers);
     setInputValue("");

     if (currentPromptIndex + 1 < prompts.length) {
        setCurrentPromptIndex(prev => prev + 1);
     } else {
        setPhase("revealed");
        setTimeout(() => {
           if (onComplete) onComplete();
        }, 2000);
     }
  };

  // Generate the final rich text elements
  const generateFinalText = () => {
     const parts = storyTemplate.split(regex);
     // parts will be: [text, variable, text, variable, text]
     const elements: React.ReactNode[] = [];
     
     let answerIndex = 0;
     for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
           elements.push(<span key={i} className="text-zinc-300">{parts[i]}</span>);
        } else {
           elements.push(
              <span 
                 key={i} 
                 className="font-black px-1 rounded-sm mx-1 uppercase shadow-sm"
                 style={{ color: primaryColor, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                 {answers[answerIndex] || `[${parts[i]}]`}
              </span>
           );
           answerIndex++;
        }
     }
     
     return elements;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white items-center justify-center bg-zinc-950 p-6"
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }} />
      
      <AnimatePresence mode="wait">
         {phase === "prompting" && (
            <motion.div
               key="prompting"
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="relative z-10 w-full max-w-sm flex flex-col items-center"
            >
               <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8">
                  Word {currentPromptIndex + 1} of {prompts.length}
               </h2>
               
               <h1 className="text-4xl md:text-5xl font-black uppercase text-center mb-12 text-white">
                  Give me an
                  <br />
                  <span style={{ color: primaryColor }}>{prompts[currentPromptIndex]}</span>
               </h1>

               <form onSubmit={handleSubmit} className="w-full">
                  <input
                     autoFocus
                     type="text"
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}
                     className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl p-6 text-3xl font-bold text-center text-white focus:outline-none transition-colors mb-6 shadow-xl"
                     style={{ focusWithin: { borderColor: primaryColor } } as any}
                     placeholder="Type here..."
                  />
                  <button
                     type="submit"
                     disabled={!inputValue.trim()}
                     className="w-full py-4 rounded-xl font-black text-xl text-zinc-900 transition-transform active:scale-95 disabled:opacity-50"
                     style={{ backgroundColor: primaryColor }}
                  >
                     SUBMIT
                  </button>
               </form>
            </motion.div>
         )}

         {phase === "revealed" && (
            <motion.div
               key="revealed"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
            >
               <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
               >
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 text-center mb-2">
                     The Collaborative Story
                  </h2>
                  <h1 className="text-3xl font-black text-white text-center">
                     {config.title || "The Absurd Tale"}
                  </h1>
               </motion.div>

               <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-2xl md:text-3xl font-serif leading-relaxed text-center"
               >
                  {generateFinalText()}
               </motion.p>
               
               {config.mediaUrl && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 1.5 }}
                     className="mt-12 w-full h-48 rounded-xl overflow-hidden shadow-xl"
                  >
                     <img src={config.mediaUrl} className="w-full h-full object-cover" alt="Story art" />
                  </motion.div>
               )}
            </motion.div>
         )}
      </AnimatePresence>
      
    </div>
  );
}
