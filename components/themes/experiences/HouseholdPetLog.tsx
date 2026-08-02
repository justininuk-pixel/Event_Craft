"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Dog, Bone, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function HouseholdPetLog({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f97316"; // orange
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff7ed"]; // orange-50

  const petName = config.title || "Buster";
  const currentUser = "Mom"; // Mocking the current user session
  
  // Set initial state to exactly 2 hours ago to match the prompt's example
  const [lastFedTime, setLastFedTime] = useState<number>(Date.now() - 2 * 60 * 60 * 1000);
  const [lastFedBy, setLastFedBy] = useState<string>("Dad");
  const [now, setNow] = useState<number>(Date.now());
  const [isFeeding, setIsFeeding] = useState(false);

  useEffect(() => {
     const interval = setInterval(() => {
        setNow(Date.now());
     }, 60000); // update every minute
     return () => clearInterval(interval);
  }, []);

  const handleFeed = () => {
     if (isFeeding) return;
     
     setIsFeeding(true);
     // Simulate network delay
     setTimeout(() => {
        setLastFedTime(Date.now());
        setLastFedBy(currentUser);
        setNow(Date.now());
        setIsFeeding(false);
        if (onComplete) onComplete();
     }, 1000);
  };

  // Calculate delta
  const msElapsed = now - lastFedTime;
  const hoursElapsed = Math.floor(msElapsed / (1000 * 60 * 60));
  const minutesElapsed = Math.floor((msElapsed % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = "";
  if (hoursElapsed > 0) {
     timeString += `${hoursElapsed} ${hoursElapsed === 1 ? 'hr' : 'hrs'}`;
     if (minutesElapsed > 0) timeString += ` ${minutesElapsed} min`;
  } else if (minutesElapsed > 0) {
     timeString += `${minutesElapsed} ${minutesElapsed === 1 ? 'min' : 'mins'}`;
  } else {
     timeString = "Just now";
  }

  // Determine status (hungry after 8 hours)
  const isHungry = hoursElapsed >= 8;
  const isStarving = hoursElapsed >= 12;

  let statusColor = "#10b981"; // green
  if (isHungry) statusColor = "#f59e0b"; // yellow
  if (isStarving) statusColor = "#ef4444"; // red

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-8 p-8 overflow-hidden justify-center items-center">
         {Array.from({ length: 20 }).map((_, i) => (
            <Bone key={i} size={48} className="rotate-45" />
         ))}
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col h-full z-10 relative">
         
         <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
            
            <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-orange-200 flex items-center justify-center text-orange-500 shadow-xl relative">
               <Dog size={64} />
               
               {isStarving && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                     <AlertTriangle size={24} />
                  </div>
               )}
            </div>

            <div className="space-y-2">
               <h1 className="text-4xl font-black tracking-tight text-slate-800">
                  Did {petName} eat?
               </h1>
               
               <div className="flex items-center justify-center gap-2 text-lg font-bold" style={{ color: statusColor }}>
                  {isHungry ? (
                     <>Yes, but it's time again.</>
                  ) : (
                     <>Yes, {petName} is full.</>
                  )}
               </div>
            </div>

            <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
               {/* Accent line */}
               <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: statusColor }} />
               
               <div className="flex flex-col items-center gap-4">
                  <Clock size={32} className="text-slate-300" />
                  
                  <div className="text-center">
                     <div className="text-5xl font-black tracking-tighter text-slate-800 mb-2">
                        {timeString === "Just now" ? timeString : `${timeString} ago`}
                     </div>
                     <div className="text-xl text-slate-500 font-medium flex items-center justify-center gap-2">
                        by <span className="font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-full">{lastFedBy}</span>
                     </div>
                  </div>
               </div>
            </div>

         </div>

         {/* Action Area */}
         <div className="p-6 pb-12">
            <button
               onClick={handleFeed}
               disabled={isFeeding || (msElapsed < 60000)} // Can't feed again within 1 minute
               className={`w-full py-6 rounded-3xl font-black text-2xl uppercase tracking-widest text-white shadow-2xl transition-all flex items-center justify-center gap-4 ${
                  (isFeeding || (msElapsed < 60000)) 
                     ? 'opacity-80 scale-95 cursor-not-allowed' 
                     : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.5)] active:scale-95'
               }`}
               style={{ backgroundColor: primaryColor }}
            >
               {isFeeding ? (
                  <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                     <CheckCircle2 size={32} />
                  </motion.div>
               ) : (
                  <>
                     <Bone size={32} />
                     I fed {petName}
                  </>
               )}
            </button>
         </div>

      </div>

      {/* Editor Bypass / Simulation */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
            <button 
               onClick={() => {
                  setLastFedTime(Date.now() - 9 * 60 * 60 * 1000); // 9 hours ago
                  setNow(Date.now());
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               Simulate Hungry (Editor)
            </button>
            <button 
               onClick={() => {
                  setLastFedTime(Date.now() - 13 * 60 * 60 * 1000); // 13 hours ago
                  setNow(Date.now());
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               Simulate Starving (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
