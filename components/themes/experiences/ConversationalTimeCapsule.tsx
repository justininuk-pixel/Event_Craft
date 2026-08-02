"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { History, Search } from "lucide-react";

export function ConversationalTimeCapsule({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#059669"; // emerald-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ecfdf5"]; // emerald-50

  const [messages, setMessages] = useState<{sender: "me" | "past-self", text: string}[]>([
     { sender: "past-self", text: "Retrieval system online. I only know what you wrote in your 2015 diaries. What do you want to ask your younger self?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isTyping) return;

     const userMsg = input;
     setMessages(prev => [...prev, { sender: "me", text: userMsg }]);
     setInput("");
     setIsTyping(true);

     // Simulate LLM + RAG query
     setTimeout(() => {
        let response = "";
        const lower = userMsg.toLowerCase();
        
        if (lower.includes("worry") || lower.includes("worried") || lower.includes("scared")) {
           response = "[October 14, 2015] I'm really worried about whether this new job is a mistake. I feel like an impostor every day.";
        } else if (lower.includes("happy") || lower.includes("best")) {
           response = "[June 3, 2015] Today was perfect. We just drove around with the windows down listening to that one album on repeat.";
        } else if (lower.includes("goal") || lower.includes("want")) {
           response = "[January 1, 2015] My main goal this year is just to stop caring so much about what other people think. Not sure how to do that yet.";
        } else {
           response = "I'm sorry, I don't have any records in the 2015 vector database related to that. I only know what I wrote back then.";
        }

        setMessages(prev => [...prev, { sender: "past-self", text: response }]);
        setIsTyping(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

        if (messages.length >= 7 && onComplete) {
           setTimeout(onComplete, 6000);
        }
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-emerald-50 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-emerald-200/50 flex flex-col items-center z-10 bg-white/80 backdrop-blur-md shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
            <History size={16} /> Me (2015)
         </h2>
         <p className="text-[10px] text-emerald-600 mt-1 uppercase flex items-center gap-1">
            <Search size={10} /> RAG Vector DB: 2015_Diaries.bin
         </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-md mx-auto space-y-4">
         
         {messages.map((msg, idx) => (
            <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
               <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.sender === "me" 
                     ? "bg-emerald-600 text-white rounded-br-none" 
                     : "bg-white border border-emerald-100 text-slate-700 rounded-bl-none shadow-sm"
               }`}>
                  {msg.text}
               </div>
            </motion.div>
         ))}

         {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-white border border-emerald-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
               </div>
            </motion.div>
         )}
         <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-emerald-100 shrink-0">
         <form onSubmit={handleSend} className="max-w-md mx-auto flex gap-2">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Ask 2015 you something..."
               className="flex-1 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-sm outline-none focus:border-emerald-500 transition-colors"
               disabled={isTyping}
            />
            <button 
               type="submit"
               disabled={!input.trim() || isTyping}
               className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-200 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
               Send
            </button>
         </form>
      </div>

    </div>
  );
}
