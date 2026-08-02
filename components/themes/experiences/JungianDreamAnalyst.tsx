"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Moon, Loader2 } from "lucide-react";

type JungianAnalysis = {
  archetypes: string[];
  summary: string;
  psychological_meaning: string;
};

export function JungianDreamAnalyst({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const [dream, setDream] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JungianAnalysis | null>(null);

  const handleAnalyze = () => {
     if (!dream.trim() || isAnalyzing) return;
     
     setIsAnalyzing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        // Mock LLM forced JSON output parsing abstract input
        const mockResponse: JungianAnalysis = {
           archetypes: ["The Shadow", "The Labyrinth", "The Trickster"],
           summary: "The dreamer finds themselves navigating a shifting maze, pursued by an unseen entity, only to discover the entity mirrors their own movements.",
           psychological_meaning: "This manifests a confrontation with the Shadow archetype. The maze represents the unconscious mind, disorganized and frightening. The pursuing entity is the repressed aspects of the self. The realization of mirrored movement suggests an impending integration—the dreamer is ready to acknowledge and assimilate these hidden traits."
        };

        const lower = dream.toLowerCase();
        if (lower.includes("fall") || lower.includes("fly")) {
           mockResponse.archetypes = ["The Puer Aeternus", "The Abyss"];
           mockResponse.psychological_meaning = "Falling or flying without control often signifies a disconnect from grounded reality or an overwhelming fear of failure in waking life, tied to the Puer Aeternus (eternal child) archetype avoiding adult responsibility.";
        } else if (lower.includes("teeth") || lower.includes("naked")) {
           mockResponse.archetypes = ["The Persona", "The Vulnerable Child"];
           mockResponse.psychological_meaning = "Losing teeth or appearing naked in public relates strictly to the decay or stripping away of the Persona—the social mask worn for others. It reveals deep-seated anxieties about inadequacy and loss of social power.";
        }

        setAnalysis(mockResponse);
        setIsAnalyzing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (onComplete) setTimeout(onComplete, 8000);

     }, 2500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-slate-900 text-slate-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 border-b border-slate-800 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-indigo-400 font-sans">
            <Moon size={16} /> Psychoanalytic Engine
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12">
         
         <div className="max-w-2xl mx-auto space-y-12">
            
            <div className="text-center space-y-4">
               <h1 className="text-3xl md:text-5xl font-normal text-indigo-100">Jungian Dream Analyst</h1>
               <p className="text-sm font-sans uppercase tracking-widest text-slate-500 font-bold">
                  Extracting Psychological Architecture
               </p>
            </div>

            <AnimatePresence mode="wait">
               {!analysis && !isAnalyzing && (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                     <textarea 
                        value={dream}
                        onChange={e => setDream(e.target.value)}
                        placeholder="Describe the dream..."
                        className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-lg leading-relaxed outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 resize-none shadow-inner"
                     />
                     <button 
                        onClick={handleAnalyze}
                        disabled={!dream.trim()}
                        className="w-full py-4 bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500/30 text-indigo-200 disabled:opacity-50 disabled:hover:bg-indigo-900/50 rounded-xl font-sans font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all"
                     >
                        <Brain size={16} /> Process via LLM
                     </button>
                  </motion.div>
               )}

               {isAnalyzing && (
                  <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 space-y-6">
                     <Loader2 size={40} className="animate-spin text-indigo-500" />
                     <div className="text-center font-sans">
                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Mapping to Framework</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Forcing strict JSON schema output...</div>
                     </div>
                  </motion.div>
               )}

               {analysis && !isAnalyzing && (
                  <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-slate-800/30 border border-slate-700 p-8 rounded-2xl">
                     
                     <div>
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-indigo-500 mb-4 border-b border-slate-700 pb-2">Identified Archetypes</h3>
                        <div className="flex flex-wrap gap-2">
                           {analysis.archetypes.map((a, i) => (
                              <span key={i} className="px-3 py-1 bg-indigo-950 border border-indigo-500/30 rounded-full text-xs font-sans uppercase tracking-widest text-indigo-300">
                                 {a}
                              </span>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-indigo-500 mb-2">Structural Summary</h3>
                        <p className="text-lg leading-relaxed text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 italic">
                           "{analysis.summary}"
                        </p>
                     </div>

                     <div>
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-indigo-500 mb-2">Deep Psychological Meaning</h3>
                        <p className="text-xl leading-relaxed text-indigo-100">
                           {analysis.psychological_meaning}
                        </p>
                     </div>

                     <div className="pt-8 flex justify-center">
                        <button 
                           onClick={() => { setAnalysis(null); setDream(""); }}
                           className="text-xs font-sans uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                           Analyze Another Sequence
                        </button>
                     </div>

                  </motion.div>
               )}
            </AnimatePresence>

         </div>

      </div>

    </div>
  );
}
