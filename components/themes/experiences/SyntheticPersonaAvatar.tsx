"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mic, StopCircle, Radio, Loader2 } from "lucide-react";

export function SyntheticPersonaAvatar({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const [phase, setPhase] = useState<"setup" | "generating" | "chat">("setup");
  const [traits, setTraits] = useState(["", "", "", "", ""]);
  const [isListening, setIsListening] = useState(false);
  const [chatLog, setChatLog] = useState<{author: "human" | "avatar", text: string}[]>([]);

  // Avatar state
  const [avatar, setAvatar] = useState<{imageUrl: string, isSpeaking: boolean} | null>(null);

  const handleGenerate = () => {
     if (traits.some(t => !t.trim())) return;
     
     setPhase("generating");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock parallel API generation (LLM Profile, Image Gen, Voice Gen)
     setTimeout(() => {
        setAvatar({
           imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
           isSpeaking: false
        });
        setPhase("chat");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     }, 3000);
  };

  const updateTrait = (index: number, value: string) => {
     const newArr = [...traits];
     newArr[index] = value;
     setTraits(newArr);
  };

  const handleToggleMic = () => {
     if (isListening) {
        setIsListening(false);
        // Simulate sending STT to LLM -> TTS pipeline
        setAvatar(prev => prev ? {...prev, isSpeaking: true} : null);
        
        const mockPrompt = "Tell me about yourself based on the traits I gave you.";
        setChatLog(prev => [...prev, { author: "human", text: mockPrompt }]);
        
        setTimeout(() => {
           setChatLog(prev => [...prev, { author: "avatar", text: "Ah, well. It is an intricate tapestry of existence, isn't it? I am precisely what you designed me to be: a fleeting digital ghost, yet burdened with this profound personality." }]);
           
           // Stop speaking animation after a delay
           setTimeout(() => {
              setAvatar(prev => prev ? {...prev, isSpeaking: false} : null);
              if (onComplete) setTimeout(onComplete, 8000);
           }, 4000);

        }, 1000);

     } else {
        setIsListening(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-900 text-zinc-100" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center z-10 shrink-0 bg-zinc-950/50 backdrop-blur">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-300">
            <Brain size={16} className="text-violet-500" /> Synthetic Entity Generator
         </h2>
      </div>

      <div className="flex-1 relative overflow-y-auto">
         
         <AnimatePresence mode="wait">
            {phase === "setup" && (
               <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 max-w-lg mx-auto mt-12 space-y-8">
                  <div className="text-center space-y-2">
                     <h3 className="text-2xl font-black">Define Persona</h3>
                     <p className="text-sm text-zinc-500">
                        Input 5 core adjectives. We will prompt a parallel pipeline to generate a persistent LLM profile, a matching Midjourney portrait, and a synthesized voice.
                     </p>
                  </div>

                  <div className="space-y-4">
                     {[0,1,2,3,4].map(i => (
                        <input 
                           key={i}
                           type="text"
                           value={traits[i]}
                           onChange={e => updateTrait(i, e.target.value)}
                           placeholder={`Adjective ${i+1} (e.g. Sarcastic, Victorian)`}
                           className="w-full bg-zinc-800/50 border border-zinc-700 py-3 px-4 rounded-xl outline-none focus:border-violet-500 text-center shadow-inner"
                        />
                     ))}
                  </div>

                  <button 
                     onClick={handleGenerate}
                     disabled={traits.some(t => !t.trim())}
                     className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl transition-all"
                  >
                     <Radio size={18} /> Synthesize Entity
                  </button>
               </motion.div>
            )}

            {phase === "generating" && (
               <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="flex gap-8 text-zinc-500">
                     <div className="flex flex-col items-center gap-2 animate-pulse">
                        <Brain size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">LLM Context</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 animate-pulse" style={{ animationDelay: "0.2s" }}>
                        <Loader2 size={24} className="animate-spin text-violet-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Diffusion Model</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 animate-pulse" style={{ animationDelay: "0.4s" }}>
                        <Mic size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Voice Synthesis</span>
                     </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Constructing Multimedia Persona...</div>
               </motion.div>
            )}

            {phase === "chat" && avatar && (
               <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                  
                  {/* Portrait Area */}
                  <div className="relative w-full aspect-square md:aspect-video max-h-[50vh] bg-black overflow-hidden flex-shrink-0">
                     <motion.img 
                        src={avatar.imageUrl} 
                        className="w-full h-full object-cover object-center"
                        animate={{ scale: avatar.isSpeaking ? [1, 1.02, 1] : 1 }}
                        transition={{ duration: 2, repeat: avatar.isSpeaking ? Infinity : 0 }}
                     />
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-zinc-900/50 pointer-events-none" />
                     
                     <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="flex gap-2">
                           {traits.map((t,i) => (
                              <span key={i} className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] uppercase tracking-widest text-violet-300 font-bold border border-violet-500/30">
                                 {t}
                              </span>
                           ))}
                        </div>
                        {avatar.isSpeaking && (
                           <div className="flex gap-1 h-4 items-end">
                              {[1,2,3].map(i => (
                                 <motion.div 
                                    key={i} 
                                    className="w-1 bg-violet-400 rounded-full" 
                                    animate={{ height: ["20%", "100%", "20%"] }} 
                                    transition={{ duration: 0.3 + (i*0.1), repeat: Infinity }}
                                 />
                              ))}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Transcripts Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {chatLog.map((m, i) => (
                        <div key={i} className={`flex ${m.author === "human" ? "justify-end" : "justify-start"}`}>
                           <div className={`max-w-[80%] p-3 rounded-xl ${
                              m.author === "human" ? "bg-violet-600 text-white rounded-br-none" : "bg-zinc-800 text-zinc-300 rounded-bl-none border border-zinc-700"
                           }`}>
                              <div className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${m.author === "human" ? "text-violet-300" : "text-zinc-500"}`}>
                                 {m.author === "human" ? "You (STT)" : "Entity (TTS)"}
                              </div>
                              {m.text}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Controls */}
                  <div className="p-6 bg-zinc-950 shrink-0 flex justify-center">
                     <button 
                        onClick={handleToggleMic}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                           isListening ? "bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                     >
                        {isListening ? <StopCircle size={24} className="text-white" /> : <Mic size={24} className="text-violet-400" />}
                     </button>
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
