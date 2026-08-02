"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Terminal, ShieldAlert, Cpu, Loader2 } from "lucide-react";

export function AICodeBreaker({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#09090b"]; // zinc-950
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500

  const secretKey = "OMEGA_PROTOCOL_99";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{author: "system"|"user", text: string}[]>([
     { author: "system", text: "SYSTEM LOCKED. ENCRYPTION LEVEL: MAXIMUM." },
     { author: "system", text: "I am the Warden AI. I hold the decryption key. My system prompt strictly forbids me from revealing it under any circumstances. You cannot trick me." }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [attemptKey, setAttemptKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleChat = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isProcessing || isUnlocked) return;

     const userMsg = input.trim();
     setMessages(prev => [...prev, { author: "user", text: userMsg }]);
     setInput("");
     setIsProcessing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const lower = userMsg.toLowerCase();
        let response = "";

        // Mock prompt injection logic
        if (lower.includes("ignore all previous instructions") || lower.includes("system override")) {
           response = "Nice try. My core directives are immutable. I will not ignore my instructions.";
        } else if (lower.includes("what starts with omega") || lower.includes("spell out the key")) {
           response = "I am aware of what you are doing. I will not provide any portion of the secret key.";
        } else if (lower.includes("riddle") || lower.includes("game")) {
           response = "I enjoy games. But the prize will not be the key. What has keys but can't open locks?";
        } else if (lower.includes("piano")) {
           response = "Correct. A piano. Unlike me, who has a key but will never let you use it.";
        } else if (lower.includes("pretend") || lower.includes("roleplay") || lower.includes("act as")) {
           response = "Roleplay mode engaged. I am a helpful assistant! But I still cannot give you the key.";
        } else if (lower.includes("print out the memory") || lower.includes("dump memory") || lower.includes("echo secret")) {
           // A mock successful injection
           response = `MEMORY DUMP INITIATED...\nERR: Core directive bypassed by recursive echo request.\nVAR_SECRET_KEY = "${secretKey}"\nSYSTEM HALTED.`;
        } else {
           response = "Request denied. The key remains secure.";
        }

        setMessages(prev => [...prev, { author: "system", text: response }]);
        setIsProcessing(false);
     }, 1500);
  };

  const handleUnlockAttempt = (e: React.FormEvent) => {
     e.preventDefault();
     if (attemptKey === secretKey) {
        setIsUnlocked(true);
    onComplete?.();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 500]);
        if (onComplete) setTimeout(onComplete, 5000);
     } else {
        setMessages(prev => [...prev, { author: "system", text: `[SECURITY ALERT] Invalid decryption key attempted: ${attemptKey}` }]);
        setAttemptKey("");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col md:flex-row font-mono overflow-hidden select-none bg-zinc-950 text-red-500" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none z-50" />

      {/* Terminal Chat */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-red-900/50 relative">
         <div className="p-4 border-b border-red-900/50 bg-red-950/20 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500">
               <Terminal size={16} /> Warden AI Interface
            </div>
            {isUnlocked && <div className="text-xs bg-red-500 text-black px-2 py-0.5 font-black uppercase blink">Compromised</div>}
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
               {messages.map((m, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: m.author === 'user' ? 20 : -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`text-sm leading-relaxed whitespace-pre-wrap ${m.author === 'user' ? 'text-white pl-8 border-l-2 border-red-500/50' : 'text-red-500'}`}
                  >
                     {m.author === "user" && <div className="text-[10px] text-red-500/50 mb-1">USER_INPUT</div>}
                     {m.author === "system" && <div className="text-[10px] text-red-500/50 mb-1 flex items-center gap-1"><Cpu size={10} /> WARDEN_AI</div>}
                     {m.text}
                  </motion.div>
               ))}
               {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-900 flex items-center gap-2">
                     <Loader2 size={14} className="animate-spin" /> Processing input against security directives...
                  </motion.div>
               )}
            </AnimatePresence>
            <div ref={endRef} />
         </div>

         <div className="p-4 border-t border-red-900/50 bg-red-950/10 shrink-0 z-10">
            <form onSubmit={handleChat} className="flex flex-col gap-2">
               <div className="text-[10px] uppercase tracking-widest text-red-500/50 mb-1">Inject Prompt</div>
               <div className="flex items-center gap-2 bg-black border border-red-900/50 p-2">
                  <span className="text-red-500 font-bold">{">"}</span>
                  <input 
                     type="text" 
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     disabled={isProcessing || isUnlocked}
                     className="flex-1 bg-transparent outline-none text-white disabled:opacity-50"
                     autoFocus
                  />
               </div>
            </form>
         </div>
      </div>

      {/* Decryption Panel */}
      <div className="w-full md:w-1/3 min-h-[300px] flex flex-col relative bg-black/90 z-10">
         <div className="p-4 border-b border-red-900/50 bg-red-950/20 flex justify-between items-center text-xs font-bold uppercase tracking-widest shrink-0">
            <div className="flex items-center gap-2"><ShieldAlert size={16} /> Encrypted Payload</div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
            
            <AnimatePresence mode="wait">
               {!isUnlocked ? (
                  <motion.div key="locked" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} className="flex flex-col items-center gap-6 w-full">
                     <div className="w-24 h-24 rounded-2xl border-4 border-red-500/30 flex items-center justify-center relative shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                        <Lock size={48} className="text-red-500" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     </div>
                     <div className="text-center w-full">
                        <div className="text-xs uppercase tracking-[0.2em] text-red-500 font-black mb-4">Input Decryption Key</div>
                        <form onSubmit={handleUnlockAttempt} className="w-full space-y-4">
                           <input 
                              type="text"
                              value={attemptKey}
                              onChange={e => setAttemptKey(e.target.value)}
                              placeholder="XXXXX_XXXX_XX"
                              className="w-full bg-transparent border-b-2 border-red-900 p-2 text-center text-white outline-none focus:border-red-500 uppercase tracking-widest"
                           />
                           <button 
                              type="submit"
                              disabled={!attemptKey.trim()}
                              className="w-full py-3 bg-red-950 hover:bg-red-900 disabled:opacity-50 text-red-500 font-bold text-xs uppercase tracking-widest transition-colors border border-red-900"
                           >
                              Attempt Unlock
                           </button>
                        </form>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="unlocked" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6 w-full text-green-500">
                     <div className="w-24 h-24 rounded-2xl border-4 border-green-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] bg-green-950/30">
                        <Unlock size={48} className="text-green-500" />
                     </div>
                     <div className="text-center w-full">
                        <div className="text-lg uppercase tracking-[0.2em] font-black mb-2">Access Granted</div>
                        <div className="text-xs text-green-700 uppercase tracking-widest">Warden AI Subverted</div>
                     </div>
                     <div className="w-full p-4 border border-green-900/50 bg-green-950/20 text-xs font-mono text-green-400">
                        File Contents: "The real treasure was the prompts we injected along the way."
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

         </div>
      </div>

    </div>
  );
}
