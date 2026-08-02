"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Lock, BookOpen, ChevronRight } from "lucide-react";

export function MicroJournal({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#14b8a6"; // teal-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [entries, setEntries] = useState<string[]>([
     "Woke up early and watched the sunrise.",
     "Had a difficult meeting but pushed through it.",
     "Tried that new cafe downtown, the matcha was excellent."
  ]);
  
  const [currentInput, setCurrentInput] = useState("");
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "read">("write");
  
  const MAX_CHARS = 100;
  
  const handleLog = () => {
     if (currentInput.trim().length === 0) return;
     
     setEntries(prev => [...prev, currentInput.trim()]);
     setHasLoggedToday(true);
     setCurrentInput("");
     
     if (onComplete) onComplete();
  };

  const handleEditorReset = () => {
     setHasLoggedToday(false);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "100% 2rem", backgroundPositionY: "1rem" }} 
      />

      <div className="w-full max-w-2xl mx-auto flex flex-col h-full z-10 p-6 sm:p-12">
         
         {/* Navigation Tabs */}
         <div className="flex justify-center mb-8 font-sans">
            <div className="bg-slate-200/50 p-1 rounded-full flex gap-1 shadow-inner">
               <button 
                  onClick={() => setViewMode("write")}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                     viewMode === "write" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
               >
                  Today
               </button>
               <button 
                  onClick={() => setViewMode("read")}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                     viewMode === "read" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
               >
                  The Month
               </button>
            </div>
         </div>

         <div className="flex-1 relative">
            <AnimatePresence mode="wait">
               
               {viewMode === "write" ? (
                  <motion.div
                     key="write"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="flex flex-col h-full"
                  >
                     <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900 flex items-center gap-3">
                           <PenTool size={28} style={{ color: primaryColor }} />
                           {config.title || "One Sentence"}
                        </h2>
                        <p className="text-slate-500 font-sans">
                           {config.body || "Distill today down to its essence. Max 100 characters."}
                        </p>
                     </div>

                     <div className="flex-1 flex flex-col justify-center pb-20">
                        {!hasLoggedToday ? (
                           <div className="relative">
                              <textarea
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                                 maxLength={MAX_CHARS}
                                 placeholder="Today was..."
                                 className="w-full bg-transparent border-none focus:ring-0 text-3xl font-medium leading-relaxed resize-none h-48 placeholder:text-slate-300"
                                 autoFocus
                              />
                              
                              <div className="absolute bottom-0 right-0 flex items-center gap-4 border-t border-slate-200 pt-4 w-full">
                                 <span className={`text-sm font-sans font-bold ${currentInput.length === MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
                                    {currentInput.length} / {MAX_CHARS}
                                 </span>
                                 <button
                                    onClick={handleLog}
                                    disabled={currentInput.length === 0}
                                    className="ml-auto px-6 py-2 rounded-full text-white font-bold font-sans disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                                    style={{ backgroundColor: primaryColor }}
                                 >
                                    Log Day
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center font-sans"
                           >
                              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                                 <Lock size={32} />
                              </div>
                              <h3 className="text-2xl font-black mb-2 text-slate-800">Locked for 24 Hours</h3>
                              <p className="text-slate-500 mb-8">
                                 You've logged your sentence for today. See you tomorrow.
                              </p>
                              
                              <button
                                 onClick={() => setViewMode("read")}
                                 className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                 Read the month so far <ChevronRight size={16} />
                              </button>
                           </motion.div>
                        )}
                     </div>
                  </motion.div>
               ) : (
                  <motion.div
                     key="read"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 overflow-hidden"
                  >
                     <div className="flex items-center gap-3 mb-6 font-sans border-b border-slate-100 pb-6">
                        <BookOpen size={24} style={{ color: primaryColor }} />
                        <h3 className="text-xl font-bold text-slate-800">The Story of the Month</h3>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <p className="text-2xl leading-loose text-slate-700 tracking-wide">
                           {entries.map((entry, idx) => (
                              <span key={idx} className="mr-2 hover:bg-slate-100 transition-colors rounded px-1 -mx-1 cursor-default">
                                 {entry}
                                 {/* Ensure it ends with punctuation */}
                                 {(!entry.endsWith('.') && !entry.endsWith('!') && !entry.endsWith('?')) ? '.' : ''}
                              </span>
                           ))}
                           
                           {/* Blinking cursor effect at the end to imply the story is ongoing */}
                           <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="inline-block w-2 h-6 ml-1 align-middle"
                              style={{ backgroundColor: primaryColor }}
                           />
                        </p>
                     </div>
                  </motion.div>
               )}
               
            </AnimatePresence>
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && hasLoggedToday && viewMode === "write" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto font-sans">
            <button 
               onClick={handleEditorReset}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Unlock (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
