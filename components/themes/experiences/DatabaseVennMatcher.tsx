"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Film, CheckCircle } from "lucide-react";

export function DatabaseVennMatcher({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#18181b"]; // zinc-900

  const [phase, setPhase] = useState<"input" | "fetching" | "result">("input");

  const [a1, setA1] = useState("Robert Downey Jr.");
  const [a2, setA2] = useState("Chris Evans");
  const [a3, setA3] = useState("Scarlett Johansson");

  const handleFetch = () => {
     if (!a1 || !a2 || !a3) return;
     setPhase("fetching");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
     
     // Simulate multi-API fetch & intersection calculation
     setTimeout(() => {
        setPhase("result");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 200]);
        if (onComplete) setTimeout(onComplete, 6000);
     }, 3000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-zinc-900 text-zinc-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-zinc-800 bg-zinc-950">
         <h2 className="text-xl font-black uppercase tracking-widest text-white flex justify-center items-center gap-2">
            <Film size={24} className="text-rose-500" /> Venn Matcher
         </h2>
         <p className="text-xs text-zinc-500 mt-1">Find the single movie linking 3 actors.</p>
      </div>

      <div className="flex-1 flex flex-col relative z-10 justify-center p-6 w-full max-w-sm mx-auto">
         
         <AnimatePresence mode="wait">
            {phase === "input" ? (
               <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full space-y-4">
                  <div className="bg-zinc-800 p-2 rounded-xl border border-zinc-700">
                     <input type="text" value={a1} onChange={e=>setA1(e.target.value)} className="w-full bg-transparent outline-none p-2 text-white font-bold" />
                  </div>
                  <div className="bg-zinc-800 p-2 rounded-xl border border-zinc-700">
                     <input type="text" value={a2} onChange={e=>setA2(e.target.value)} className="w-full bg-transparent outline-none p-2 text-white font-bold" />
                  </div>
                  <div className="bg-zinc-800 p-2 rounded-xl border border-zinc-700">
                     <input type="text" value={a3} onChange={e=>setA3(e.target.value)} className="w-full bg-transparent outline-none p-2 text-white font-bold" />
                  </div>

                  <button 
                     onClick={handleFetch}
                     className="mt-8 w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-900/50"
                  >
                     Query Databases
                  </button>
               </motion.div>
            ) : phase === "fetching" ? (
               <motion.div key="fetching" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="w-full flex flex-col items-center">
                  
                  {/* CSS Venn Diagram Animation */}
                  <div className="relative w-48 h-48 mb-8">
                     <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-2 border-blue-500 mix-blend-screen bg-blue-500/20"
                        animate={{ rotate: 360, transformOrigin: '50% 100%' }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                     <motion.div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-rose-500 mix-blend-screen bg-rose-500/20"
                        animate={{ rotate: 360, transformOrigin: '100% 50%' }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                     <motion.div className="absolute bottom-4 right-4 w-24 h-24 rounded-full border-2 border-emerald-500 mix-blend-screen bg-emerald-500/20"
                        animate={{ rotate: 360, transformOrigin: '0% 50%' }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                  </div>
                  
                  <div className="text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">Calculating Intersections...</div>

               </motion.div>
            ) : (
               <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
                  
                  <div className="flex justify-center mb-6">
                     <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full border border-emerald-500/50">
                        <CheckCircle size={24} />
                     </div>
                  </div>
                  
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">1 Exact Match Found</div>
                  
                  <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.3)] border border-zinc-700 group">
                     <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600&h=900" alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/50 to-transparent flex flex-col justify-end p-6">
                        <h3 className="text-4xl font-black text-white leading-none">The Avengers</h3>
                        <p className="text-zinc-400 font-medium mt-2">2012</p>
                     </div>
                  </div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
