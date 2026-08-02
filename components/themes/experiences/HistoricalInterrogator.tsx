"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { History, Send, AlertTriangle } from "lucide-react";

export function HistoricalInterrogator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // parchment

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{author: "human" | "lincoln", text: string, isAnachronism: boolean}[]>([
     { author: "lincoln", text: "Greetings, citizen. I am Abraham Lincoln. The year is 1863, and our nation is engaged in a great civil war. How may I be of service to you this day?", isAnachronism: false }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isTyping) return;

     const userMsg = input;
     setMessages(prev => [...prev, { author: "human", text: userMsg, isAnachronism: false }]);
     setInput("");
     setIsTyping(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM anachronism filter
     setTimeout(() => {
        const lower = userMsg.toLowerCase();
        let response = "";
        let isAnachronism = false;

        const anachronisms = ["internet", "iphone", "computer", "tv", "television", "car", "plane", "wifi", "app", "smartphone"];
        
        if (anachronisms.some(word => lower.includes(word))) {
           isAnachronism = true;
           response = "I... I do not understand what words you are speaking. 'Inter-net'? 'Wi-Fi'? Are these newfangled telegraph devices the Confederacy employs? You speak in riddles, my friend. Please, the Union depends on clear communication.";
        } else if (lower.includes("war") || lower.includes("civil")) {
           response = "The war is a heavy burden on us all. We are testing whether that nation, or any nation so conceived and so dedicated, can long endure.";
        } else if (lower.includes("hello") || lower.includes("hi")) {
           response = "Good day to you. The affairs of state are pressing, but I always have time for a fellow citizen.";
        } else {
           response = "Your words are thoughtful, but I must confess my mind is heavily occupied with the troop movements near Gettysburg. Let us hope for Providence's favor.";
        }

        setMessages(prev => [...prev, { author: "lincoln", text: response, isAnachronism }]);
        setIsTyping(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 20, 20]);

        if (messages.length > 5 && onComplete) {
           setTimeout(onComplete, 8000);
        }
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-[#fdfbf7] text-[#3e2723]" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Sepia/Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(62,39,35,0.2)] mix-blend-multiply" />

      <div className="p-4 border-b border-[#3e2723]/20 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <History size={16} /> Temporal Containment
         </h2>
         <div className="text-[10px] font-bold uppercase tracking-widest bg-[#3e2723] text-[#fdfbf7] px-2 py-1 rounded">
            Target: 1863
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
         
         <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto bg-[#eaddcf] border-4 border-[#3e2723] rounded-full overflow-hidden mb-4 shadow-lg">
               {/* Realistic vintage silhouette portrait mock */}
               <img src="https://images.unsplash.com/photo-1616082487447-9759d57a2dfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover filter sepia contrast-125" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest">A. Lincoln</h3>
            <p className="text-xs text-[#3e2723]/60 italic font-medium mt-1">Strict Negative Constraints Applied</p>
         </div>

         {messages.map((m, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex ${m.author === "human" ? "justify-end" : "justify-start"}`}
            >
               <div className={`max-w-[85%] p-4 rounded-xl shadow-sm ${
                  m.author === "human" 
                     ? "bg-[#3e2723] text-[#fdfbf7] rounded-br-none" 
                     : "bg-[#f5ebd8] border border-[#3e2723]/20 text-[#3e2723] rounded-bl-none"
               }`}>
                  {m.isAnachronism && (
                     <div className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2 border-b border-red-600/20 pb-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Anachronism Detected
                     </div>
                  )}
                  <div className="text-lg leading-relaxed">{m.text}</div>
               </div>
            </motion.div>
         ))}
         
         {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-[#f5ebd8] border border-[#3e2723]/20 p-4 rounded-xl rounded-bl-none text-xs uppercase font-bold tracking-widest text-[#3e2723]/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3e2723]/50 animate-pulse" />
                  Writing letter...
               </div>
            </motion.div>
         )}
         <div ref={endRef} />

      </div>

      <div className="p-4 bg-[#fdfbf7] border-t border-[#3e2723]/20 shrink-0 z-10">
         <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Speak with the President..."
               disabled={isTyping}
               className="flex-1 bg-[#f5ebd8] border border-[#3e2723]/30 rounded px-4 py-3 text-lg outline-none focus:border-[#3e2723] transition-colors placeholder:text-[#3e2723]/40 disabled:opacity-50"
            />
            <button 
               type="submit"
               disabled={!input.trim() || isTyping}
               className="px-6 py-3 bg-[#3e2723] hover:bg-[#2c1b18] disabled:bg-[#3e2723]/30 text-[#fdfbf7] rounded font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
            >
               <Send size={16} /> Send
            </button>
         </form>
         <div className="text-center mt-2 text-[10px] uppercase font-bold text-[#3e2723]/40">Try asking him about an iPhone</div>
      </div>

    </div>
  );
}
