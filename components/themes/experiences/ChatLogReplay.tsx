"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, FastForward, Phone, Video, Info } from "lucide-react";

type ChatMessage = {
   id: string;
   sender: "me" | "them";
   timestamp: number;
   text: string;
};

// Base timestamp for realistic deltas
const baseTime = new Date("2020-05-14T20:00:00").getTime();

const defaultMessages: ChatMessage[] = [
   { id: "1", sender: "me", timestamp: baseTime, text: "Hey! I had a really great time tonight." },
   { id: "2", sender: "them", timestamp: baseTime + 45000, text: "Hey! Me too. The food was amazing." },
   { id: "3", sender: "them", timestamp: baseTime + 52000, text: "Sorry if I talked too much about my dog haha" },
   { id: "4", sender: "me", timestamp: baseTime + 120000, text: "No way, I loved it. I want to meet him!" },
   { id: "5", sender: "them", timestamp: baseTime + 300000, text: "Maybe next time? :)" }
];

export function ChatLogReplay({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // iMessage Blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const messages = (config.experience as any)?.messages || defaultMessages;
  const contactName = config.title || "Sarah";
  const speedMultiplier = (config.experience as any)?.speedMultiplier || 10; // e.g. 10x faster for demo purposes

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [renderedMessages, setRenderedMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<"me" | "them" | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startReplay = () => {
     setIsPlaying(true);
     setRenderedMessages([]);
     setIsFinished(false);
     playNext(0, []);
  };

  const playNext = (index: number, currentList: ChatMessage[]) => {
     if (index >= messages.length) {
        setIsTyping(null);
        setIsFinished(true);
    onComplete?.();
        if (onComplete) setTimeout(onComplete, 2000);
        return;
     }

     const nextMsg = messages[index];
     
     // Calculate delay based on timestamp delta from previous message
     let delayMs = 1000; // default initial delay
     if (index > 0) {
        const delta = Math.max(0, nextMsg.timestamp - messages[index - 1].timestamp);
        delayMs = delta / speedMultiplier;
     }
     
     // Cap delay at something reasonable for UI (e.g. max 4 seconds) so user isn't waiting forever
     delayMs = Math.min(delayMs, 4000);
     
     // Start typing indicator slightly before message arrives if it's "them"
     const typingDelay = Math.max(0, delayMs - 1500);

     if (nextMsg.sender === "them") {
        timeoutRef.current = setTimeout(() => {
           setIsTyping("them");
        }, typingDelay);
     }

     timeoutRef.current = setTimeout(() => {
        setIsTyping(null);
        const newList = [...currentList, nextMsg];
        setRenderedMessages(newList);
        
        if (typeof navigator !== "undefined" && navigator.vibrate) {
           navigator.vibrate(nextMsg.sender === "me" ? 10 : 30);
        }

        // Auto-scroll
        setTimeout(() => {
           if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 50);

        playNext(index + 1, newList);
     }, delayMs);
  };

  useEffect(() => {
     return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
     };
  }, []);

  const formatTime = (ts: number) => {
     return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-black touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* iOS-style Header */}
      <div className="w-full bg-slate-50/90 backdrop-blur-md border-b border-slate-200 p-4 pt-10 flex items-center justify-between z-20">
         <div className="flex items-center gap-2 text-blue-500">
            <span className="text-xl">⟨</span>
            <span className="text-sm">Back</span>
         </div>
         <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white text-lg font-bold mb-1 shadow-sm">
               {contactName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-800">{contactName}</span>
         </div>
         <div className="flex gap-4 text-blue-500">
            <Video size={20} />
            <Phone size={20} />
         </div>
      </div>

      {/* Play Controls overlay if not started */}
      <AnimatePresence>
         {!isPlaying && (
            <motion.div 
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8"
            >
               <h2 className="text-2xl font-black mb-2 text-slate-900 text-center">
                  {config.title || "Chat Replay"}
               </h2>
               <p className="text-slate-500 text-sm mb-8 text-center max-w-[250px]">
                  {config.body || "Experience this conversation exactly how it unfolded in real time."}
               </p>
               <button 
                  onClick={startReplay}
                  className="px-8 py-3 rounded-full text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-transform"
                  style={{ backgroundColor: primaryColor }}
               >
                  <Play size={18} fill="currentColor" /> Play ({speedMultiplier}x speed)
               </button>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Chat Transcript Area */}
      <div 
         ref={scrollRef}
         className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scroll-smooth pb-20 custom-scrollbar"
      >
         
         <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest my-4">
            {formatTime(messages[0]?.timestamp || baseTime)}
         </div>

         {renderedMessages.map((msg) => (
            <motion.div 
               key={msg.id}
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={`flex w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
               <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-[15px] leading-snug shadow-sm ${
                     msg.sender === "me" 
                        ? "text-white rounded-br-sm" 
                        : "bg-slate-200 text-black rounded-bl-sm"
                  }`}
                  style={msg.sender === "me" ? { backgroundColor: primaryColor } : {}}
               >
                  {msg.text}
               </div>
            </motion.div>
         ))}

         {/* Typing Indicator */}
         <AnimatePresence>
            {isTyping === "them" && (
               <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex w-full justify-start mt-2"
               >
                  <div className="bg-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center h-[34px]">
                     <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                     <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                     <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Input Bar mock */}
      <div className="w-full bg-slate-50/90 backdrop-blur-md border-t border-slate-200 p-2 flex items-center gap-3 absolute bottom-0 z-20 pb-safe">
         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="text-slate-500 font-bold">+</span>
         </div>
         <div className="flex-1 h-9 rounded-full border border-slate-300 bg-white px-4 flex items-center text-sm text-slate-400">
            iMessage
         </div>
      </div>

    </div>
  );
}
