"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
   sender: "me" | "them";
   text: string;
};

const SCRIPT: ChatMessage[] = [
   { sender: "them", text: "Are you there?" },
   { sender: "me", text: "Yeah. What is it?" },
   { sender: "them", text: "I found something. You need to see this right now." },
   { sender: "me", text: "Where?" },
   { sender: "them", text: "In the vault. The one they said was empty." },
   { sender: "them", text: "It's not empty." },
   { sender: "me", text: "What's inside?" },
   { sender: "them", text: "Look for yourself." },
];

export function ChatLogFiction({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // Blue 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Auto-scroll to bottom
     if (scrollRef.current) {
        scrollRef.current.scrollTo({
           top: scrollRef.current.scrollHeight,
           behavior: "smooth"
        });
     }
  }, [visibleMessages, isTyping]);

  const handleTap = () => {
     if (gameState !== "playing") return;
     if (isTyping) return;
     
     if (scriptIndex < SCRIPT.length) {
        setIsTyping(true);
        const nextMessage = SCRIPT[scriptIndex];
        
        // Typing duration based on sender and length
        const typingDuration = nextMessage.sender === "me" ? 400 : 800 + Math.random() * 400;
        
        setTimeout(() => {
           setIsTyping(false);
           setVisibleMessages(prev => [...prev, nextMessage]);
           setScriptIndex(prev => prev + 1);
        }, typingDuration);
     } else {
        // Reached end
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div 
         onClick={handleTap}
         className={`relative w-[320px] h-[480px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-50 blur-sm pointer-events-none" : "scale-100 cursor-pointer"}`}
      >
         
         {/* iOS-style Header */}
         <div className="h-16 bg-slate-50 border-b border-slate-200 flex items-center justify-center shrink-0 z-10">
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs mb-1">
                  U
               </div>
               <span className="text-[10px] font-bold text-slate-700">Unknown Number</span>
            </div>
         </div>

         {/* Chat Area */}
         <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative scroll-smooth no-scrollbar"
         >
            
            {visibleMessages.map((msg, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`max-w-[75%] px-4 py-2 text-[13px] leading-relaxed relative ${
                     msg.sender === "me" 
                        ? "self-end rounded-2xl rounded-br-sm text-white" 
                        : "self-start rounded-2xl rounded-bl-sm bg-slate-200 text-slate-800"
                  }`}
                  style={{
                     backgroundColor: msg.sender === "me" ? primaryColor : undefined
                  }}
               >
                  {msg.text}
               </motion.div>
            ))}

            {isTyping && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="self-start rounded-2xl rounded-bl-sm bg-slate-200 px-4 py-3 flex gap-1 items-center"
               >
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-500" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
               </motion.div>
            )}

            {/* Tap Hint */}
            {gameState === "playing" && !isTyping && scriptIndex < SCRIPT.length && (
               <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none opacity-40">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-white/80 px-2 py-1 rounded-full animate-pulse">
                     Tap to advance
                  </span>
               </div>
            )}
            
            {/* Pad bottom for scroll */}
            <div className="h-4 shrink-0" />
         </div>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md"
                  exit={{ opacity: 0 }}
               >
                  <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-[80%]">
                     <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                     </div>
                     <h2 className="text-slate-800 font-bold mb-2">New Message</h2>
                     <p className="text-xs text-slate-500 mb-6">Read the conversation to see the attachment.</p>
                     <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           setGameState("playing");
                        }}
                        className="text-white px-6 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform w-full"
                        style={{ backgroundColor: primaryColor }}
                     >
                        Open Chat
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-3xl max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="w-16 h-1 bg-slate-200 mx-auto rounded-full mb-8" />
                  <div className="font-bold uppercase tracking-widest mb-4 text-xs" style={{ color: primaryColor }}>Attachment Received</div>
                  <h1 className="text-3xl md:text-4xl font-black mb-6 text-slate-800 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  setVisibleMessages(SCRIPT);
                  setScriptIndex(SCRIPT.length);
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-3 rounded-xl active:scale-95 transition-transform shadow-md"
               style={{ backgroundColor: primaryColor }}
            >
               Auto-Read Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
