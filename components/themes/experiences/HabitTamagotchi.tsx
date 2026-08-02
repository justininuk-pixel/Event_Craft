"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Skull, Check, Plus, Heart, AlertCircle } from "lucide-react";

export function HabitTamagotchi({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f5f3ff"]; // violet-50

  // The habit we're tracking
  const habitName = config.title || "Practice Guitar";
  
  // State machine logic
  const [lastLogDate, setLastLogDate] = useState<number>(Date.now() - (1000 * 60 * 60 * 24 * 0.5)); // Half a day ago
  const [petState, setPetState] = useState<"happy" | "sad" | "dead">("happy");
  const [fedJustNow, setFedJustNow] = useState(false);

  useEffect(() => {
     const checkState = () => {
        const now = Date.now();
        const diffMs = now - lastLogDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays >= 3) {
           setPetState("dead");
        } else if (diffDays >= 1.5) {
           setPetState("sad");
        } else {
           setPetState("happy");
        }
     };

     // Check immediately and then every minute
     checkState();
     const interval = setInterval(checkState, 60000);
     return () => clearInterval(interval);
  }, [lastLogDate]);

  const handleLogHabit = () => {
     if (petState === "dead") return; // Can't feed a dead pet directly without reviving
     
     setLastLogDate(Date.now());
     setPetState("happy");
     setFedJustNow(true);
     
     setTimeout(() => setFedJustNow(false), 2000);
     if (onComplete) onComplete();
  };

  const handleRevive = () => {
     setLastLogDate(Date.now());
     setPetState("happy");
  };

  // -------------------------
  // Sub-components for states
  // -------------------------
  
  const renderHappyPet = () => (
     <motion.div 
        animate={{ 
           y: [0, -20, 0],
           scaleY: [1, 1.1, 0.95, 1],
           rotate: [-5, 5, -5]
        }}
        transition={{ 
           repeat: Infinity, 
           duration: 1.5,
           ease: "easeInOut" 
        }}
        className="w-32 h-32 bg-violet-400 rounded-3xl rounded-t-[50%] flex flex-col items-center justify-center relative shadow-xl shadow-violet-200"
     >
        {/* Face */}
        <div className="flex gap-4 mb-2">
           <div className="w-4 h-4 bg-violet-900 rounded-full" />
           <div className="w-4 h-4 bg-violet-900 rounded-full" />
        </div>
        {/* Smile */}
        <div className="w-8 h-4 border-b-4 border-violet-900 rounded-b-full mt-1" />
        
        {/* Feeding Animation */}
        <AnimatePresence>
           {fedJustNow && (
              <motion.div 
                 initial={{ opacity: 0, y: 50, scale: 0 }}
                 animate={{ opacity: 1, y: -80, scale: 1 }}
                 exit={{ opacity: 0, scale: 0 }}
                 className="absolute text-pink-500 flex gap-2"
              >
                 <Heart fill="currentColor" size={24} />
                 <Heart fill="currentColor" size={32} />
              </motion.div>
           )}
        </AnimatePresence>
     </motion.div>
  );

  const renderSadPet = () => (
     <motion.div 
        animate={{ 
           y: [0, 5, 0],
           rotate: [-2, 2, -2]
        }}
        transition={{ 
           repeat: Infinity, 
           duration: 3,
           ease: "easeInOut" 
        }}
        className="w-32 h-32 bg-violet-300 rounded-3xl rounded-b-[40%] flex flex-col items-center justify-center relative shadow-xl shadow-violet-200 opacity-80"
     >
        {/* Sweating */}
        <motion.div 
           animate={{ y: [0, 10], opacity: [0, 1, 0] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute -right-2 top-4 w-3 h-4 bg-blue-300 rounded-full rounded-t-sm"
        />

        {/* Face */}
        <div className="flex gap-4 mb-4">
           <div className="w-4 h-2 bg-violet-900 rounded-t-full mt-2" />
           <div className="w-4 h-2 bg-violet-900 rounded-t-full mt-2" />
        </div>
        {/* Frown */}
        <div className="w-6 h-3 border-t-4 border-violet-900 rounded-t-full" />
     </motion.div>
  );

  const renderDeadPet = () => (
     <motion.div 
        initial={{ rotate: 90, y: 20 }}
        className="w-32 h-32 bg-slate-300 rounded-3xl flex flex-col items-center justify-center relative shadow-xl shadow-slate-200"
     >
        <div className="absolute -top-12 opacity-50">
           <Ghost size={48} className="text-slate-400 animate-bounce" />
        </div>
        {/* Face */}
        <div className="flex gap-4 mb-2">
           <div className="text-slate-600 font-black text-xl">X</div>
           <div className="text-slate-600 font-black text-xl">X</div>
        </div>
        {/* Frown */}
        <div className="w-8 h-2 bg-slate-600 mt-2" />
     </motion.div>
  );

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-violet-950 items-center justify-center p-6"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* HUD Info */}
      <div className="absolute top-8 text-center max-w-sm w-full px-6">
         <h2 className="text-2xl font-black tracking-tight mb-2">
            {habitName}
         </h2>
         <p className="text-violet-500/80 font-bold uppercase tracking-widest text-xs">
            {config.body || "Keep it alive by logging daily"}
         </p>
      </div>

      {/* Pet Container */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
         <AnimatePresence mode="wait">
            <motion.div 
               key={petState}
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
            >
               {petState === "happy" && renderHappyPet()}
               {petState === "sad" && renderSadPet()}
               {petState === "dead" && renderDeadPet()}
            </motion.div>
         </AnimatePresence>

         {/* Status Message */}
         <div className="mt-12 h-8 text-center font-bold text-sm tracking-wide">
            {petState === "happy" && <span className="text-violet-600">Doing great! I am well fed.</span>}
            {petState === "sad" && <span className="text-amber-500 flex items-center justify-center gap-1"><AlertCircle size={16} /> I'm getting hungry...</span>}
            {petState === "dead" && <span className="text-slate-500 flex items-center justify-center gap-1"><Skull size={16} /> The habit died.</span>}
         </div>
      </div>

      {/* Action Area */}
      <div className="w-full max-w-sm mb-12">
         {petState !== "dead" ? (
            <button
               onClick={handleLogHabit}
               className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
               style={{ backgroundColor: primaryColor }}
            >
               <Check strokeWidth={3} /> I Did It Today!
            </button>
         ) : (
            <button
               onClick={handleRevive}
               className="w-full py-4 rounded-2xl font-black text-white bg-slate-800 text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
               <Plus strokeWidth={3} /> Start Over
            </button>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
            <button 
               onClick={() => setLastLogDate(Date.now() - (1000 * 60 * 60 * 24 * 2))} // 2 days ago = sad
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Force Sad
            </button>
            <button 
               onClick={() => setLastLogDate(Date.now() - (1000 * 60 * 60 * 24 * 4))} // 4 days ago = dead
               className="bg-black/50 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-white/20"
            >
               Force Dead
            </button>
         </div>
      )}

    </div>
  );
}
