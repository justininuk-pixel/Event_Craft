"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { MessageSquare, Wand2 } from "lucide-react";

export function MarkovChainPredictor({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  // Synthetic historical data mimicking a user's text messages
  const historicalTexts = [
     "I am going to the store.",
     "I am going to sleep early tonight.",
     "Are we going to the movie?",
     "Let me know when you are ready.",
     "I am ready for the weekend.",
     "The movie was really good.",
     "Let me know if you need anything.",
     "I need to buy some groceries.",
     "Are we ready to leave?",
  ];

  const [chain, setChain] = useState<Record<string, string[]>>({});
  const [input, setInput] = useState("");
  const [prediction, setPrediction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Build Markov Chain (Bigram)
  useEffect(() => {
     const tempChain: Record<string, string[]> = {};
     historicalTexts.forEach(sentence => {
        const words = sentence.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
        for (let i = 0; i < words.length - 1; i++) {
           const currentWord = words[i];
           const nextWord = words[i + 1];
           if (!tempChain[currentWord]) tempChain[currentWord] = [];
           tempChain[currentWord].push(nextWord);
        }
     });
     setChain(tempChain);
  }, []);

  const handlePredict = () => {
     if (!input) return;
     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Get the last word of the input to start the chain
     const words = input.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(' ');
     let currentWord = words[words.length - 1];
     
     let generated = [input];
     let count = 0;

     // Generate up to 8 words
     while (chain[currentWord] && count < 8) {
        const nextWords = chain[currentWord];
        // Pick a random next word weighted by frequency
        const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
        generated.push(nextWord);
        currentWord = nextWord;
        count++;
     }

     setTimeout(() => {
        setPrediction(generated.join(' '));
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
        if (onComplete) setTimeout(onComplete, 6000);
     }, 1500); // Artificial delay to simulate processing
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center z-10">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
               <MessageSquare size={16} className="text-blue-500" /> Markov Predictor
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Trained on {historicalTexts.length} messages</p>
         </div>
      </div>

      <div className="flex-1 relative flex flex-col p-6 w-full max-w-md mx-auto">
         
         <div className="mb-8">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Start a sentence...</label>
            <input 
               type="text" 
               value={input} 
               onChange={e => setInput(e.target.value)}
               placeholder="e.g. I am"
               className="w-full text-2xl font-bold bg-transparent outline-none border-b-2 border-slate-200 focus:border-blue-500 py-2 transition-colors placeholder:text-slate-300"
            />
         </div>

         <button 
            onClick={handlePredict}
            disabled={!input || isGenerating}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
         >
            <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} /> {isGenerating ? "Analyzing Probabilities..." : "Auto-Complete Sentences"}
         </button>

         {prediction && !isGenerating && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-12 bg-slate-100 border border-slate-200 rounded-2xl p-6 relative"
            >
               <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-blue-500 border border-slate-200 rounded">AI Prediction</div>
               
               <p className="text-xl font-serif text-slate-700 italic">
                  "{prediction}..."
               </p>
               
               <div className="mt-4 text-[10px] text-slate-400 font-mono">Generated via n-gram probability chain</div>
            </motion.div>
         )}

      </div>

    </div>
  );
}
