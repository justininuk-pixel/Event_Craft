"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Gift, Unlock, CalendarX, EyeOff, ShieldAlert } from "lucide-react";

export function TimeLockedGiftVault({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#eab308"; // yellow-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#000000"];

  // Configuration for locked months (e.g., December and their birth month, say July (6))
  const lockedMonths = [6, 11]; // 0-indexed: July, December
  const currentMonth = new Date().getMonth();
  
  const [editorOverride, setEditorOverride] = useState<boolean>(false);
  const [attemptedUnlock, setAttemptedUnlock] = useState(false);

  const isLocked = lockedMonths.includes(currentMonth) && !editorOverride;

  const mockGifts = [
     { id: "g1", name: "Vintage Turntable", price: "$299" },
     { id: "g2", name: "Weekend Trip to Cabin", price: "$450" },
     { id: "g3", name: "Leather Jacket", price: "$180" },
     { id: "g4", name: "Custom Mix Tape", price: "Priceless" },
  ];

  const handleUnlockAttempt = () => {
     setAttemptedUnlock(true);
     setTimeout(() => setAttemptedUnlock(false), 2000);
     if (onComplete) onComplete();
  };

  const getMonthName = (monthIndex: number) => {
     return new Date(2000, monthIndex, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background vault texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)"
           }}
      />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 md:p-12">
         
         <AnimatePresence mode="wait">
            {isLocked ? (
               // LOCKED STATE
               <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  className="flex flex-col items-center justify-center text-center max-w-lg mx-auto h-full"
               >
                  <motion.div 
                     animate={attemptedUnlock ? { x: [-10, 10, -10, 10, 0] } : {}}
                     transition={{ duration: 0.4 }}
                     className="relative mb-8"
                  >
                     <div className="absolute inset-0 blur-2xl opacity-20 bg-red-500 rounded-full" />
                     <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-full shadow-2xl relative">
                        <Lock size={64} className="text-red-500" />
                        <ShieldAlert size={24} className="absolute bottom-4 right-4 text-red-400" />
                     </div>
                  </motion.div>

                  <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white uppercase drop-shadow-lg">
                     Vault Locked
                  </h2>
                  
                  <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl mb-8 flex items-start gap-4 text-left">
                     <EyeOff size={24} className="text-red-400 shrink-0 mt-1" />
                     <div>
                        <p className="font-bold text-red-300 mb-1 uppercase tracking-widest text-xs">Anti-Snooping Protocol Active</p>
                        <p className="text-sm">
                           Access to the gift list is restricted during the months of {lockedMonths.map(getMonthName).join(" and ")}.
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={handleUnlockAttempt}
                     className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-neutral-400 transition-colors shadow-lg active:scale-95 flex items-center gap-3"
                  >
                     <Lock size={18} />
                     Force Open
                  </button>
                  
                  {attemptedUnlock && (
                     <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 font-bold mt-4 text-sm uppercase tracking-widest"
                     >
                        Access Denied. Nice try.
                     </motion.p>
                  )}

               </motion.div>
            ) : (
               // UNLOCKED STATE
               <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  className="w-full max-w-2xl mx-auto h-full flex flex-col"
               >
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-emerald-500">
                              <Unlock size={24} />
                           </div>
                           <h2 className="text-3xl font-black tracking-tight text-white">Gift Ideas</h2>
                        </div>
                        <p className="text-neutral-400 font-medium">
                           {config.body || "Safe to view. No snooping expected this month."}
                        </p>
                     </div>
                     <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-1">Status</span>
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Unlocked</span>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {mockGifts.map((gift, i) => (
                        <motion.div 
                           key={gift.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-neutral-900/80 backdrop-blur border border-neutral-800 p-6 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-colors group"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors">
                                 <Gift size={20} />
                              </div>
                              <div>
                                 <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{gift.name}</h3>
                                 <p className="text-neutral-500 text-sm font-medium">Idea #{i+1}</p>
                              </div>
                           </div>
                           <div className="font-mono font-bold text-neutral-400 bg-black/50 px-3 py-1 rounded-lg border border-neutral-800">
                              {gift.price}
                           </div>
                        </motion.div>
                     ))}
                  </div>

               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && lockedMonths.includes(currentMonth) && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setEditorOverride(!editorOverride)}
               className="bg-black/50 text-white backdrop-blur px-3 py-2 text-[10px] font-bold uppercase rounded border border-white/20 hover:bg-black"
            >
               {editorOverride ? "Lock Vault (Editor)" : "Bypass Lock (Editor)"}
            </button>
         </div>
      )}

    </div>
  );
}
