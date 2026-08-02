"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, Smartphone, RefreshCw, CheckCircle, Clock } from "lucide-react";

type Entry = {
   id: string;
   author: "me" | "them";
   timestamp: number; // Unix timestamp for sorting
   text: string;
};

const defaultMyEntries: Entry[] = [
   { id: "m1", author: "me", timestamp: 1680300000000, text: "Thinking about our trip next week." },
   { id: "m2", author: "me", timestamp: 1680472800000, text: "Packed the bags. I can't wait." },
];

const defaultTheirEntries: Entry[] = [
   { id: "t1", author: "them", timestamp: 1680386400000, text: "Just bought the tickets!" },
   { id: "t2", author: "them", timestamp: 1680559200000, text: "At the airport. See you soon." },
];

export function ProximitySyncJournal({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // indigo-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // In a real app, these would come from local storage, and the other person's from a P2P connection.
  const myEntries = (config.experience as any)?.myEntries || defaultMyEntries;
  const theirEntries = (config.experience as any)?.theirEntries || defaultTheirEntries;

  const combinedEntries = [...myEntries, ...theirEntries].sort((a, b) => a.timestamp - b.timestamp);

  const startSync = () => {
     if (isSynced || isSyncing) return;
     setIsSyncing(true);
     setSyncProgress(0);
     
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 50, 30]);

     // Simulate Bluetooth handshake & transfer
     const interval = setInterval(() => {
        setSyncProgress(prev => {
           if (prev >= 100) {
              clearInterval(interval);
              finishSync();
              return 100;
           }
           return prev + 5;
        });
     }, 100);
  };

  const finishSync = () => {
     setIsSyncing(false);
     setIsSynced(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     if (onComplete) {
        setTimeout(onComplete, 4000);
     }
  };

  const formatDate = (ts: number) => {
     const d = new Date(ts);
     return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-200"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="w-full text-center p-6 border-b border-white/5 relative z-20 bg-slate-900/80 backdrop-blur-sm shadow-md">
         <h2 className="text-xl font-black tracking-tight" style={{ color: primaryColor }}>
            {config.title || "Proximity Journal"}
         </h2>
         <p className="text-white/50 text-xs mt-1">
            {isSynced ? "Timelines Merged." : "Waiting for physical proximity to sync."}
         </p>
      </div>

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
         
         <AnimatePresence mode="wait">
            {!isSynced ? (
               <motion.div 
                  key="split"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 flex w-full relative"
               >
                  {/* Left: My Journal */}
                  <div className="w-1/2 h-full flex flex-col items-center border-r border-white/5 relative p-4">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 mt-4">My Device</h3>
                     <div className="w-full max-w-[200px] flex flex-col gap-4">
                        {myEntries.map((entry: Entry) => (
                           <div key={entry.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm">
                              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                                 <Clock size={10} /> {formatDate(entry.timestamp)}
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed">{entry.text}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Right: Empty/Their Journal Placeholder */}
                  <div className="w-1/2 h-full flex flex-col items-center relative p-4 bg-slate-950/50">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-6 mt-4 opacity-50">Remote Device</h3>
                     
                     <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                        <Smartphone size={32} className="text-slate-500 mb-4" />
                        <div className="flex gap-2">
                           <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                           <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                           <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                     </div>
                  </div>

                  {/* Sync Button UI */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                     <button
                        onClick={startSync}
                        disabled={isSyncing}
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-transform active:scale-95 disabled:opacity-80"
                        style={{ backgroundColor: primaryColor }}
                     >
                        {isSyncing ? (
                           <RefreshCw size={24} className="text-white animate-spin" />
                        ) : (
                           <Bluetooth size={24} className="text-white" />
                        )}
                     </button>
                     
                     {isSyncing && (
                        <div className="mt-4 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
                           <span className="text-indigo-400">Pairing...</span> 
                           <span className="text-slate-400">{syncProgress}%</span>
                        </div>
                     )}
                     
                     {!isSyncing && mode === "editor-preview" && (
                        <div className="mt-4 bg-slate-800 px-3 py-1 rounded text-[10px] text-slate-400 uppercase tracking-widest border border-slate-700">
                           Simulate Proximity
                        </div>
                     )}
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="merged"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center w-full relative p-6 overflow-y-auto custom-scrollbar"
               >
                  <div className="text-green-400 flex items-center gap-2 mb-8 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 text-xs font-bold uppercase tracking-widest">
                     <CheckCircle size={14} /> Data Synchronized
                  </div>

                  <div className="w-full max-w-md relative flex flex-col gap-6 pl-4 border-l-2 border-slate-800">
                     {combinedEntries.map((entry, idx) => (
                        <motion.div 
                           key={entry.id}
                           initial={{ opacity: 0, x: entry.author === "me" ? -20 : 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className={`relative w-[90%] p-4 rounded-xl border shadow-sm ${
                              entry.author === "me" 
                                 ? "bg-slate-800 border-slate-700 mr-auto" 
                                 : "bg-indigo-900/30 border-indigo-500/30 ml-auto"
                           }`}
                        >
                           {/* Timeline Dot */}
                           <div 
                              className="absolute w-3 h-3 rounded-full top-1/2 -translate-y-1/2 shadow-[0_0_10px_currentColor]"
                              style={{ 
                                 left: entry.author === "me" ? "-22.5px" : "auto",
                                 right: entry.author === "them" ? "auto" : undefined, // actually always attach to left line
                                 // Overriding left for both since the line is on the far left:
                                 ...(entry.author === "them" && { left: 'auto' }),
                              }}
                           />
                           
                           {/* Simplified line attachment point */}
                           <div 
                              className={`absolute w-3 h-3 rounded-full top-6 -left-[23.5px] border-2 border-slate-900 ${
                                 entry.author === "me" ? "bg-slate-500" : "bg-indigo-400"
                              }`} 
                           />

                           <div className="flex items-center gap-2 mb-2">
                              <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                                 entry.author === "me" ? "bg-slate-700 text-slate-300" : "bg-indigo-800 text-indigo-200"
                              }`}>
                                 {entry.author === "me" ? "You" : "Them"}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                 <Clock size={10} /> {formatDate(entry.timestamp)}
                              </div>
                           </div>
                           
                           <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
                              "{entry.text}"
                           </p>
                        </motion.div>
                     ))}
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
