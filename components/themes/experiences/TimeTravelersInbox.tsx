"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { format, addYears, differenceInSeconds } from "date-fns";

export function TimeTravelersInbox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [simulatedYears, setSimulatedYears] = useState(0);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb"; // Blue 600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // Slate 50

  const baseCreationDate = new Date(); // Simulating creation date as "now"
  const simulatedCurrentDate = addYears(currentDate, simulatedYears);

  // Live timer tick for UI realism
  useEffect(() => {
     const interval = setInterval(() => setCurrentDate(new Date()), 1000);
     return () => clearInterval(interval);
  }, []);

  const messages = [
     {
        id: 1,
        title: config.title,
        preview: "Unlocked today.",
        unlockDate: baseCreationDate,
        isUnlocked: true,
        body: config.body
     },
     {
        id: 2,
        title: "Subject: 1 Year Later",
        preview: "A year has passed...",
        unlockDate: addYears(baseCreationDate, 1),
        isUnlocked: simulatedCurrentDate >= addYears(baseCreationDate, 1),
        body: "A full year has passed since this inbox was created. So much can change in 365 days. I hope this message finds you well, exactly where you need to be."
     },
     {
        id: 3,
        title: "Subject: A Decade Complete",
        preview: "Ten years from the start.",
        unlockDate: addYears(baseCreationDate, 10),
        isUnlocked: simulatedCurrentDate >= addYears(baseCreationDate, 10),
        body: "Ten years. A decade. An entire chapter of a life. Who are you now? Do you remember who you were when this was first written? The wait is finally over."
     }
  ];

  const selectedMessage = messages.find(m => m.id === selectedId) || messages[0];

  const formatCountdown = (targetDate: Date, currentSimDate: Date) => {
     const diffSecs = differenceInSeconds(targetDate, currentSimDate);
     if (diffSecs <= 0) return "Unlocked";

     const days = Math.floor(diffSecs / (3600 * 24));
     const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
     const mins = Math.floor((diffSecs % 3600) / 60);
     const secs = diffSecs % 60;

     if (days > 365) {
        const years = Math.floor(days / 365);
        const remDays = days % 365;
        return `${years}y ${remDays}d ${hours}h ${mins}m ${secs}s`;
     }
     return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
     if (selectedId === 3 && selectedMessage.isUnlocked && onComplete) {
        // In the editor or reality, reading the final decade message triggers completion
        const timer = setTimeout(onComplete, 10000);
        return () => clearTimeout(timer);
     }
  }, [selectedId, selectedMessage.isUnlocked, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col md:flex-row transition-colors duration-1000"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Sidebar Inbox List */}
      <div className="w-full md:w-80 h-1/3 md:h-full border-b md:border-b-0 md:border-r border-slate-200 bg-white/50 backdrop-blur-md overflow-y-auto z-10 flex flex-col">
         
         <div className="p-6 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-20">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Inbox</h2>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
               Time Capsule
            </div>
         </div>

         <div className="flex-1 flex flex-col p-2 space-y-2">
            {messages.map(msg => (
               <button
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                     selectedId === msg.id 
                        ? "bg-blue-50 border border-blue-200 shadow-sm" 
                        : "hover:bg-slate-50 border border-transparent"
                  } ${!msg.isUnlocked ? "opacity-60" : ""}`}
               >
                  <div className="flex justify-between items-baseline mb-1">
                     <div className={`font-semibold truncate pr-2 ${!msg.isUnlocked ? "text-slate-500" : "text-slate-900"}`}>
                        {msg.isUnlocked ? msg.title : "Encrypted Message"}
                     </div>
                     <div className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {format(msg.unlockDate, "MMM yyyy")}
                     </div>
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                     {msg.isUnlocked ? msg.preview : "Locked until scheduled date"}
                  </div>
                  {!msg.isUnlocked && (
                     <div className="mt-3 text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block border border-amber-100">
                        ⏱ {formatCountdown(msg.unlockDate, simulatedCurrentDate)}
                     </div>
                  )}
               </button>
            ))}
         </div>

      </div>

      {/* Main Reading Pane */}
      <div className="flex-1 h-2/3 md:h-full bg-white relative overflow-y-auto">
         <AnimatePresence mode="wait">
            <motion.div
               key={selectedId}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="p-8 md:p-16 max-w-3xl mx-auto min-h-full flex flex-col"
            >
               {selectedMessage.isUnlocked ? (
                  <>
                     <div className="mb-12 border-b border-slate-100 pb-8">
                        <div className="text-sm text-slate-400 font-mono mb-4 uppercase tracking-widest">
                           Decrypted: {format(selectedMessage.unlockDate, "MMMM do, yyyy")}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                           {selectedMessage.title}
                        </h1>
                        <div className="mt-6 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                              {config.recipient ? config.recipient.charAt(0).toUpperCase() : "?"}
                           </div>
                           <div className="text-sm text-slate-600">
                              To: <span className="font-semibold text-slate-900">{config.recipient || "You"}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-700 leading-relaxed">
                        {selectedMessage.body}
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <div className="w-24 h-24 mb-8 text-slate-200">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 mb-4">Message Locked</h2>
                     <p className="text-slate-500 max-w-md mx-auto mb-8">
                        This message is securely encrypted and cannot be opened until its scheduled delivery date.
                     </p>
                     
                     <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner w-full max-w-sm">
                        <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">
                           Time Remaining
                        </div>
                        <div className="font-mono text-2xl text-slate-700 font-bold">
                           {formatCountdown(selectedMessage.unlockDate, simulatedCurrentDate)}
                        </div>
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 p-5 flex flex-col items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-50 rounded-2xl">
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">
               Simulation: Fast Forward Time
            </h2>
            <div className="flex w-full items-center gap-4">
               <span className="text-slate-400 text-xs font-mono w-12 text-right">Now</span>
               <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  step="1"
                  value={simulatedYears} 
                  onChange={(e) => setSimulatedYears(parseInt(e.target.value))}
                  className="flex-1 accent-blue-600"
               />
               <span className="text-slate-400 text-xs font-mono w-16">+15 Yrs</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-3 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
               Current Simulation: {simulatedYears} Years into the future
            </div>
         </div>
      )}
      
    </div>
  );
}
