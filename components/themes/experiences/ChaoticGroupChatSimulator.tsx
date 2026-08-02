"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";

type ChatMessage = {
  id: string;
  sender: string;
  color: string;
  text: string;
  delay: number; // MS before it appears after previous
  isTypingIndicator?: boolean;
};

const defaultChat: ChatMessage[] = [
  { id: "c1", sender: "Mom", color: "#ec4899", text: "Is anyone bringing potato salad?", delay: 1000 },
  { id: "c2", sender: "Uncle Dave", color: "#3b82f6", text: "I can bring store bought.", delay: 2000 },
  { id: "c3", sender: "Mom", color: "#ec4899", text: "Absolutely not.", delay: 800 },
  { id: "c4", sender: "Sarah", color: "#8b5cf6", text: "I'll make it! Same recipe as Thanksgiving.", delay: 1500 },
  { id: "c5", sender: "Uncle Dave", color: "#3b82f6", text: "Okay fine, I'll just bring ice.", delay: 1200 },
  { id: "c6", sender: "Grandma", color: "#10b981", text: "Who is this", delay: 3000 },
];

export function ChaoticGroupChatSimulator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb"; // blue-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const title = config.title || "Family Reunion Planning";
  const messages: ChatMessage[] = (config.experience as any)?.messages || defaultChat;

  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<{name: string, color: string} | null>(null);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIdx = 0;
    
    const playNext = () => {
      if (currentIdx >= messages.length) {
        setTypingUser(null);
        if (onComplete) setTimeout(onComplete, 3000);
        return;
      }

      const msg = messages[currentIdx];
      
      // Show typing indicator
      setTypingUser({ name: msg.sender, color: msg.color });
      
      // Simulate typing duration
      const typingDuration = Math.max(500, Math.min(msg.text.length * 50, 2000));
      
      setTimeout(() => {
        // Remove typing, add message
        setTypingUser(null);
        setVisibleMessages(prev => [...prev, msg]);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
        
        currentIdx++;
        
        // Wait before next person starts typing
        setTimeout(playNext, messages[currentIdx]?.delay || 1000);
      }, typingDuration);
    };

    // Start simulation
    const initialDelay = setTimeout(playNext, 1000);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, typingUser]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-100" style={{ backgroundColor: bgColors[0] }}>
      
      {/* iOS style header */}
      <div className="bg-white/90 backdrop-blur-md pt-12 pb-3 px-4 border-b border-gray-200 flex flex-col items-center z-20 shadow-sm relative">
         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-1 border-2 border-white shadow-sm overflow-hidden">
            <Users size={20} />
         </div>
         <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
            {title}
         </h2>
         <p className="text-[10px] text-gray-400">12 People</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 space-y-4">
        <AnimatePresence initial={false}>
           {visibleMessages.map((msg, i) => {
              // Group consecutive messages by same sender
              const isFirst = i === 0 || visibleMessages[i-1].sender !== msg.sender;
              return (
                 <motion.div 
                   key={msg.id}
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   className={`flex flex-col items-start w-full ${isFirst ? 'mt-4' : 'mt-1'}`}
                 >
                    {isFirst && (
                       <span className="text-[10px] ml-2 mb-1 font-bold tracking-wide" style={{ color: msg.color }}>
                          {msg.sender}
                       </span>
                    )}
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[80%] text-gray-800 text-sm leading-snug">
                       {msg.text}
                    </div>
                 </motion.div>
              );
           })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
           {typingUser && (
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="flex flex-col items-start w-full mt-4"
              >
                 <span className="text-[10px] ml-2 mb-1 font-bold tracking-wide" style={{ color: typingUser.color }}>
                    {typingUser.name}
                 </span>
                 <div className="bg-gray-200/60 px-4 py-3 rounded-full rounded-tl-sm w-16 flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-gray-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-gray-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-gray-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
        
        <div ref={endRef} className="h-4" />
      </div>

    </div>
  );
}
