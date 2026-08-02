"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Sword, Map, Send, Loader2 } from "lucide-react";

export function LLMDungeonCartographer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e"; // green-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{author: "system"|"player", text: string}[]>([
     { author: "system", text: "You stand at the entrance of a dark dungeon. The stone walls are cold. There is a path leading North." }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<{x: number, y: number}>({ x: 5, y: 5 });
  const [visited, setVisited] = useState<{x: number, y: number}[]>([{ x: 5, y: 5 }]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSend = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isProcessing) return;

     const userMsg = input.trim();
     setMessages(prev => [...prev, { author: "player", text: userMsg }]);
     setInput("");
     setIsProcessing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        const lower = userMsg.toLowerCase();
        let newPos = { ...playerPosition };
        let response = "";

        // Mock LLM JSON output parsing
        // The LLM would normally output: { "narrative": "You move North.", "coordinates": [5, 4] }
        if (lower.includes("north") || lower.includes("forward")) {
           newPos.y -= 1;
           response = "You move North into a damp corridor. Water drips from the ceiling.";
        } else if (lower.includes("south") || lower.includes("back")) {
           newPos.y += 1;
           response = "You move South. The air grows warmer here.";
        } else if (lower.includes("east") || lower.includes("right")) {
           newPos.x += 1;
           response = "You head East. You see a faint light at the end of the hall.";
        } else if (lower.includes("west") || lower.includes("left")) {
           newPos.x -= 1;
           response = "You head West into a narrow passage. It's difficult to squeeze through.";
        } else if (lower.includes("look") || lower.includes("search")) {
           response = "You look around but see nothing of immediate interest.";
        } else {
           response = "You cannot do that here.";
        }

        setMessages(prev => [...prev, { author: "system", text: response }]);
        
        if (newPos.x !== playerPosition.x || newPos.y !== playerPosition.y) {
           setPlayerPosition(newPos);
           setVisited(prev => {
              if (!prev.find(p => p.x === newPos.x && p.y === newPos.y)) {
                 return [...prev, newPos];
              }
              return prev;
           });
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 30]);
        }

        setIsProcessing(false);
        if (messages.length > 8 && onComplete) setTimeout(onComplete, 8000);
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col md:flex-row font-mono overflow-hidden select-none bg-black text-green-500" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Narrative Console */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-green-900/50 relative">
         <div className="p-4 border-b border-green-900/50 bg-green-950/20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest shrink-0">
            <Sword size={16} /> Text Interface
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
               <div key={i} className={`text-sm leading-relaxed ${m.author === "player" ? "text-green-300" : "text-green-500"}`}>
                  {m.author === "player" && <span className="mr-2 opacity-50">{">"}</span>}
                  {m.text}
               </div>
            ))}
            {isProcessing && (
               <div className="text-sm text-green-700 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Awaiting LLM JSON response...
               </div>
            )}
            <div ref={endRef} />
         </div>

         <div className="p-4 border-t border-green-900/50 bg-green-950/10 shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
               <span className="opacity-50">{">"}</span>
               <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g. Go North"
                  className="flex-1 bg-transparent outline-none disabled:opacity-50"
                  autoFocus
               />
               <button type="submit" disabled={!input.trim() || isProcessing} className="hidden">Send</button>
            </form>
         </div>
      </div>

      {/* Cartography Map */}
      <div className="w-full md:w-1/3 min-h-[300px] flex flex-col relative bg-[#0a0f0a]">
         <div className="p-4 border-b border-green-900/50 bg-green-950/20 flex justify-between items-center text-xs font-bold uppercase tracking-widest shrink-0">
            <div className="flex items-center gap-2"><Map size={16} /> Cartography</div>
            <div className="text-[9px] text-green-700">JSON Coordinate Mapping</div>
         </div>

         <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative" style={{ width: '200px', height: '200px' }}>
               {/* 11x11 Grid (0-10) */}
               {Array.from({length: 11}).map((_, y) => (
                  <div key={y} className="flex">
                     {Array.from({length: 11}).map((_, x) => {
                        const isVisited = visited.find(p => p.x === x && p.y === y);
                        const isPlayer = playerPosition.x === x && playerPosition.y === y;
                        return (
                           <div 
                              key={`${x}-${y}`} 
                              className={`w-[18px] h-[18px] border border-green-900/20 flex items-center justify-center ${
                                 isPlayer ? 'bg-green-500' : isVisited ? 'bg-green-900/40' : 'bg-transparent'
                              }`}
                           >
                              {isPlayer && <div className="w-2 h-2 bg-black rounded-full animate-pulse" />}
                           </div>
                        );
                     })}
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
