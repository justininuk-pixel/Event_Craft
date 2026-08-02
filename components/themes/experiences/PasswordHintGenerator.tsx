"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ShieldCheck, KeyRound, ChevronRight, Eye, EyeOff } from "lucide-react";

export function PasswordHintGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0f172a"; // slate-900
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  // Mock data - In a real app this would come from config.features
  const initialHints = [
     { id: 1, service: "Netflix", hint: "Dog's name + Childhood zip code" },
     { id: 2, service: "Bank App", hint: "First car model reversed + 42!" },
     { id: 3, service: "Work Email", hint: "Favorite teacher's last name + Current year" },
     { id: 4, service: "WiFi Router", hint: "The name of that weird street we lived on in college" }
  ];

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const requiredPin = "1234"; // Hardcoded for demo
  const [error, setError] = useState(false);

  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const handlePinEntry = (num: string) => {
     if (pinEntry.length < 4) {
        const newPin = pinEntry + num;
        setPinEntry(newPin);
        setError(false);

        if (newPin.length === 4) {
           setTimeout(() => {
              if (newPin === requiredPin) {
                 setIsUnlocked(true);
                 if (onComplete) onComplete();
              } else {
                 setError(true);
                 setPinEntry("");
              }
           }, 200);
        }
     }
  };

  const toggleHint = (id: number) => {
     setRevealedHints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none border-b border-slate-200/50 bg-white/50 backdrop-blur-md">
         <div>
            <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2" style={{ color: primaryColor }}>
               <ShieldCheck size={20} />
               {config.title || "Memory Vault"}
            </h2>
            <p className="text-slate-500 font-medium text-xs">
               {config.body || "Abstract hints only. No passwords stored."}
            </p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 pt-24 px-4 sm:px-6 md:px-8">
         <AnimatePresence mode="wait">
            {!isUnlocked ? (
               // LOCKED STATE
               <motion.div 
                  key="locked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full"
               >
                  <div className="mb-8 p-6 rounded-full bg-slate-100 shadow-inner">
                     <Lock size={48} className="text-slate-400" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-6 text-center tracking-tight">Enter Master PIN</h3>
                  
                  {/* PIN Dots */}
                  <div className="flex gap-4 mb-12">
                     {[0, 1, 2, 3].map(i => (
                        <div 
                           key={i} 
                           className={`w-4 h-4 rounded-full transition-all duration-200 ${
                              pinEntry.length > i 
                                 ? "bg-slate-800 scale-110" 
                                 : "bg-slate-200"
                           } ${error ? "bg-red-500" : ""}`}
                        />
                     ))}
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-4 w-full">
                     {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                           key={num}
                           onClick={() => handlePinEntry(num.toString())}
                           className="bg-white hover:bg-slate-50 aspect-square rounded-2xl text-2xl font-bold text-slate-700 shadow-sm border border-slate-100 active:scale-95 transition-transform"
                        >
                           {num}
                        </button>
                     ))}
                     <div />
                     <button
                        onClick={() => handlePinEntry("0")}
                        className="bg-white hover:bg-slate-50 aspect-square rounded-2xl text-2xl font-bold text-slate-700 shadow-sm border border-slate-100 active:scale-95 transition-transform"
                     >
                        0
                     </button>
                     <div />
                  </div>
               </motion.div>
            ) : (
               // UNLOCKED STATE
               <motion.div 
                  key="unlocked"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-2xl mx-auto flex flex-col h-full pb-8"
               >
                  
                  <div className="flex items-center gap-2 mb-6 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 self-start">
                     <Unlock size={16} />
                     <span className="text-xs font-bold uppercase tracking-widest">Vault Unlocked</span>
                  </div>

                  <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-12">
                     {initialHints.map((item) => {
                        const isRevealed = revealedHints[item.id];
                        
                        return (
                           <div 
                              key={item.id}
                              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow group"
                           >
                              <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-bold text-lg flex items-center gap-2">
                                    <KeyRound size={16} className="text-slate-400" />
                                    {item.service}
                                 </h4>
                                 <button 
                                    onClick={() => toggleHint(item.id)}
                                    className="p-2 text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 rounded-lg"
                                 >
                                    {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                              </div>
                              
                              <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                                 {isRevealed ? (
                                    <motion.span 
                                       initial={{ opacity: 0 }} 
                                       animate={{ opacity: 1 }}
                                       className="text-slate-700"
                                    >
                                       {item.hint}
                                    </motion.span>
                                 ) : (
                                    <div className="text-slate-300 flex items-center gap-2">
                                       <span className="tracking-[0.5em] font-black">••••••••••••••••</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isUnlocked && (
         <div className="absolute bottom-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setIsUnlocked(true)}
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Bypass Lock (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
