"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Scale, MessageSquare, AlertCircle } from "lucide-react";

export function InfiniteDevilsAdvocate({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fafafa"]; // neutral-50

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{author: "human" | "ai", text: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [round, setRound] = useState(0);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const generateCounterargument = (userText: string) => {
     const text = userText.toLowerCase();
     
     // Mock adversarial LLM logic
     if (text.includes("remote work") || text.includes("wfh")) {
        return "While remote work offers individual flexibility, it objectively disintegrates the osmotic learning and spontaneous collaboration critical to long-term organizational innovation. You are trading collective future growth for immediate personal comfort.";
     }
     if (text.includes("ai") || text.includes("artificial intelligence")) {
        return "Your optimism ignores the historical precedent of automation. AI doesn't just augment labor; it commoditizes human creativity, leading to an inevitable hollowing out of the middle class and an unprecedented concentration of wealth.";
     }
     if (text.includes("pizza") || text.includes("food")) {
        return "Culinary hedonism distracts from the fundamental purpose of sustenance. Elevating comfort food to a cultural pillar simply justifies mass consumption of nutritionally void, metabolically destructive carbohydrates.";
     }

     return "That premise relies on a deeply flawed assumption about human nature. When you extrapolate that logic globally, it collapses under the weight of resource scarcity and misaligned incentives.";
  };

  const handleSend = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isThinking || round >= 3) return;

     const userMsg = input;
     setMessages(prev => [...prev, { author: "human", text: userMsg }]);
     setInput("");
     setIsThinking(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const response = generateCounterargument(userMsg);
        setMessages(prev => [...prev, { author: "ai", text: response }]);
        setIsThinking(false);
        const newRound = round + 1;
        setRound(newRound);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 30, 30]);

        if (newRound >= 3 && onComplete) {
           setTimeout(onComplete, 5000);
        }
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-neutral-50 text-neutral-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center z-10 bg-white shrink-0">
         <div>
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <Scale size={16} className="text-red-600" /> Devil's Advocate
            </h2>
         </div>
         <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 bg-neutral-100 px-3 py-1 rounded">
            Round {round}/3
         </div>
      </div>

      {messages.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={48} className="text-red-500/50 mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest mb-2">State Your Opinion</h3>
            <p className="text-sm text-neutral-500 max-w-sm">
               Type a strong opinion below. The Adversarial Agent is programmed to systematically dismantle your argument. Defend your stance for 3 rounds.
            </p>
         </div>
      ) : (
         <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((m, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.author === "human" ? "justify-end" : "justify-start"}`}
               >
                  <div className={`max-w-[85%] p-4 rounded-xl ${
                     m.author === "human" 
                        ? "bg-neutral-900 text-white rounded-br-none" 
                        : "bg-red-50 border border-red-200 text-red-950 rounded-bl-none shadow-sm font-medium"
                  }`}>
                     {m.author === "ai" && <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2 border-b border-red-200/50 pb-1">Opposing Agent</div>}
                     {m.text}
                  </div>
               </motion.div>
            ))}
            
            {isThinking && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl rounded-bl-none flex gap-2 items-center text-xs uppercase font-bold tracking-widest">
                     <MessageSquare size={14} className="animate-pulse" /> Formulating Counterargument...
                  </div>
               </motion.div>
            )}

            {round >= 3 && !isThinking && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <div className="inline-block bg-neutral-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                     Debate Terminated
                  </div>
               </motion.div>
            )}
            <div ref={endRef} />
         </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
         <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={round >= 3 ? "Debate over." : "State your argument..."}
               disabled={isThinking || round >= 3}
               className="flex-1 bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors disabled:opacity-50"
            />
            <button 
               type="submit"
               disabled={!input.trim() || isThinking || round >= 3}
               className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-neutral-300 disabled:text-neutral-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
               Submit
            </button>
         </form>
      </div>

    </div>
  );
}
