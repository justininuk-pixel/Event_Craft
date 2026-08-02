"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Server, Globe, Loader2, ExternalLink, Check } from "lucide-react";

export function AINamingAgency({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [idea, setIdea] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<"idle" | "llm" | "api" | "results">("idle");
  const [results, setResults] = useState<{name: string, available: boolean}[] | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
     e.preventDefault();
     if (!idea.trim() || isProcessing) return;

     setIsProcessing(true);
     setPhase("llm");
     setResults(null);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Phase 1: LLM Generation
     setTimeout(() => {
        setPhase("api");
        
        // Phase 2: Domain API Check (Mocked)
        setTimeout(() => {
           const lower = idea.toLowerCase();
           let generatedNames = ["AeroVance", "Fluxion", "NovaCore", "Veloce", "OmniSync"];
           
           if (lower.includes("food") || lower.includes("eat")) {
              generatedNames = ["CraveSync", "BiteFlow", "NourishKit", "FlavorOps", "SavorHQ"];
           } else if (lower.includes("ai") || lower.includes("tech")) {
              generatedNames = ["SynthCore", "NeuralNode", "LogicLoop", "QuantumMind", "AetherOS"];
           }

           // Mock API randomly deciding availability, ensuring at least some are available
           const checked = generatedNames.map((name, i) => ({
              name: `${name}.com`,
              available: i % 2 === 0 || Math.random() > 0.5 // guarantee some are true
           }));

           setResults(checked.filter(r => r.available));
           setPhase("results");
           setIsProcessing(false);
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 100]);
           if (onComplete) setTimeout(onComplete, 8000);

        }, 2000);
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-white text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 border-b border-slate-200 z-10 shrink-0">
         <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-slate-800">
            <Globe className="text-blue-600" /> NamingAgency.ai
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative flex flex-col">
         
         <AnimatePresence mode="wait">
            
            {(phase === "idle" || phase === "llm" || phase === "api") && (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl mx-auto space-y-12 mt-12">
                  <div className="text-center space-y-4">
                     <h1 className="text-4xl font-light text-slate-800">Rapid Ideation & Validation</h1>
                     <p className="text-sm font-medium text-slate-500">
                        Describe your startup. The LLM will generate abstract names, immediately pass them through a Domain Registration API, and only return names where the .com is available.
                     </p>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-6">
                     <textarea 
                        value={idea}
                        onChange={e => setIdea(e.target.value)}
                        placeholder="e.g. A B2B SaaS platform for managing drone fleets."
                        disabled={isProcessing}
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-6 text-lg outline-none focus:border-blue-500 transition-colors resize-none shadow-sm disabled:opacity-50"
                     />
                     <button 
                        type="submit"
                        disabled={!idea.trim() || isProcessing}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center shadow-lg disabled:shadow-none"
                     >
                        Generate & Validate
                     </button>
                  </form>

                  {isProcessing && (
                     <div className="flex justify-center pt-8">
                        {phase === "llm" ? (
                           <div className="flex flex-col items-center gap-3 text-blue-600">
                              <Loader2 size={24} className="animate-spin" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">LLM: Ideating brand concepts...</span>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center gap-3 text-emerald-600">
                              <Server size={24} className="animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">API: Querying Whois Databases...</span>
                           </div>
                        )}
                     </div>
                  )}
               </motion.div>
            )}

            {phase === "results" && results && (
               <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-8">
                  
                  <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                     <div>
                        <h2 className="text-2xl font-light text-slate-800">Available Domains</h2>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mt-1 flex items-center gap-1">
                           <Check size={12} /> Verified via Domain API
                        </div>
                     </div>
                     <button 
                        onClick={() => { setPhase("idle"); setIdea(""); }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                     >
                        Start Over
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {results.map((r, i) => (
                        <motion.div 
                           key={i}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group flex justify-between items-center cursor-pointer"
                        >
                           <div className="text-2xl font-medium text-slate-800 tracking-tight">{r.name}</div>
                           <div className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest border border-emerald-200 bg-emerald-50 px-2 py-1 rounded">
                              Available
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  {results.length === 0 && (
                     <div className="text-center py-12 text-slate-500">
                        No domains were available for the generated concepts. Try a different idea.
                     </div>
                  )}

               </motion.div>
            )}

         </AnimatePresence>

      </div>

    </div>
  );
}
