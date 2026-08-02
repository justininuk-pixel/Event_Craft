"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export function TextAdventureAIDM({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"]; // black

  const [history, setHistory] = useState<{type: "dm" | "user", text: string}[]>([
     { type: "dm", text: "You awaken in a damp, cobblestone cellar. A single wooden door is bound in heavy iron chains. To your left is a small rusty key just out of reach behind an iron grate. To your right is a sleeping dire rat." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  const handleCommand = (e: React.FormEvent) => {
     e.preventDefault();
     if (!input.trim() || isTyping) return;

     const userCmd = input;
     setHistory(prev => [...prev, { type: "user", text: `> ${userCmd}` }]);
     setInput("");
     setIsTyping(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock AI DM logic
     setTimeout(() => {
        let response = "";
        const lower = userCmd.toLowerCase();

        if (lower.includes("rat")) {
           response = "The dire rat awakens, sniffs the air, and squeaks aggressively. It seems hungry. It eyes you with malevolent intent.";
        } else if (lower.includes("key") && lower.includes("reach")) {
           response = "Your fingers strain, but the grate is too narrow. You cannot reach the key barehanded. You need some sort of tool or stick.";
        } else if (lower.includes("door") || lower.includes("chain")) {
           response = "The chains are thick and cold. They are locked tightly with a rusted padlock. You cannot break them.";
        } else if (lower.includes("lint") || lower.includes("pocket")) {
           response = "You check your pockets and find some lint and a single dried piece of jerky. The dire rat twitches its nose.";
        } else {
           response = `You attempt to ${lower}, but the cellar environment makes it difficult. The dampness chills you to the bone. What do you do?`;
        }

        setHistory(prev => [...prev, { type: "dm", text: response }]);
        setIsTyping(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 20, 20]);

        if (history.length > 8 && onComplete) {
           setTimeout(onComplete, 8000);
        }
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-green-500" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-green-900/30 flex items-center gap-2 z-10 shrink-0">
         <Terminal size={16} />
         <h2 className="text-sm font-black uppercase tracking-widest">
            ZORK-AI.EXE
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
         
         <div className="text-green-800 text-xs mb-8 whitespace-pre-wrap font-bold">
            {`=========================================
 AI DUNGEON MASTER INITIALIZED
 V 1.0 - UNCONSTRAINED NARRATIVE ENGINE
=========================================\n\n`}
         </div>

         {history.map((h, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className={`leading-relaxed ${h.type === "user" ? "text-green-300 font-bold" : "text-green-500"}`}
            >
               {h.text}
            </motion.div>
         ))}

         {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-700">
               <div className="w-2 h-4 bg-green-700 animate-pulse" />
               <span className="text-xs uppercase tracking-widest">Generating State...</span>
            </motion.div>
         )}
         <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 shrink-0 bg-black">
         <form onSubmit={handleCommand} className="flex gap-2 items-center">
            <span className="text-green-500 font-bold">{`>`}</span>
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="What do you do?"
               disabled={isTyping}
               className="flex-1 bg-transparent border-none text-green-500 outline-none placeholder:text-green-900 uppercase font-bold"
               autoFocus
            />
         </form>
      </div>

    </div>
  );
}
