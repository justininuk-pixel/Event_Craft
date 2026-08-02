"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, FlaskConical, Dna, Loader2 } from "lucide-react";

export function GenerativePlantBreeder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#166534"; // green-800
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdfbf7"]; // warm off-white

  const [plantA, setPlantA] = useState("");
  const [plantB, setPlantB] = useState("");
  const [isBreeding, setIsBreeding] = useState(false);
  const [hybrid, setHybrid] = useState<{image: string, stats: any} | null>(null);

  const handleBreed = (e: React.FormEvent) => {
     e.preventDefault();
     if (!plantA.trim() || !plantB.trim() || isBreeding) return;

     setIsBreeding(true);
     setHybrid(null);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Simulate parallel API calls (Image + Text Stats)
     setTimeout(() => {
        // We use a generic strange plant image
        const image = "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"; 
        
        // Mock LLM generation of stats based on inputs
        const stats = {
           scientificName: `${plantA.substring(0, 4)}us ${plantB.substring(0, 5)}ia`,
           waterNeeds: plantA.toLowerCase().includes("cactus") || plantB.toLowerCase().includes("cactus") ? "Extremely Low" : "Moderate to High",
           sunlight: "Full Sun",
           toxicity: Math.random() > 0.5 ? "Mildly Toxic to Pets" : "Non-Toxic",
           growthRate: Math.random() > 0.5 ? "Aggressively Invasive" : "Slow and deliberate",
           description: `A bizarre genetic intersection combining the structural integrity of a ${plantA} with the aesthetic foliage of a ${plantB}.`
        };

        setHybrid({ image, stats });
        setIsBreeding(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 3000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-[#fdfbf7] text-[#2c3e35]" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Botanical Paper Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-40 pointer-events-none mix-blend-multiply" />

      <div className="p-6 border-b border-[#2c3e35]/20 flex justify-between items-center z-10 shrink-0">
         <h2 className="text-2xl font-normal tracking-tight flex items-center gap-2 text-[#166534]">
            <Leaf size={24} /> Botanical Synthesis
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative flex flex-col lg:flex-row gap-12">
         
         {/* Controls */}
         <div className="flex-1 max-w-sm space-y-8 z-10">
            <div className="space-y-4">
               <h1 className="text-3xl font-black tracking-tight leading-none text-[#166534]">Multimodal Hybridization</h1>
               <p className="text-sm font-sans font-medium text-[#2c3e35]/70">
                  Select two parent genetics. The system executes parallel queries: an Image API generates the visual morphology, while an LLM hallucinates the taxonomic data.
               </p>
            </div>

            <form onSubmit={handleBreed} className="space-y-6 bg-white/50 p-6 border border-[#2c3e35]/20 shadow-sm relative">
               
               {/* Connecting lines aesthetic */}
               <div className="absolute left-10 top-20 bottom-24 w-px bg-[#166534]/30" />

               <div className="space-y-2 relative">
                  <div className="w-6 h-6 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold absolute -left-3 top-6 z-10">A</div>
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#166534] ml-6 block">Parent Genetic A</label>
                  <input 
                     type="text" 
                     value={plantA}
                     onChange={e => setPlantA(e.target.value)}
                     placeholder="e.g. Venus Flytrap"
                     className="w-full ml-6 bg-white border border-[#2c3e35]/20 p-3 outline-none focus:border-[#166534] font-sans transition-colors"
                  />
               </div>

               <div className="space-y-2 relative">
                  <div className="w-6 h-6 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold absolute -left-3 top-6 z-10">B</div>
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#166534] ml-6 block">Parent Genetic B</label>
                  <input 
                     type="text" 
                     value={plantB}
                     onChange={e => setPlantB(e.target.value)}
                     placeholder="e.g. Weeping Willow"
                     className="w-full ml-6 bg-white border border-[#2c3e35]/20 p-3 outline-none focus:border-[#166534] font-sans transition-colors"
                  />
               </div>

               <div className="pt-4 ml-6">
                  <button 
                     type="submit"
                     disabled={!plantA.trim() || !plantB.trim() || isBreeding}
                     className="w-full py-4 bg-[#166534] hover:bg-[#14532d] disabled:bg-[#166534]/30 text-white font-sans font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-colors shadow-md disabled:shadow-none"
                  >
                     {isBreeding ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />} 
                     Execute Parallel Synthesis
                  </button>
               </div>
            </form>
         </div>

         {/* Results */}
         <div className="flex-1 min-h-[400px] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
               
               {!hybrid && !isBreeding && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#2c3e35]/30 flex flex-col items-center">
                     <Dna size={64} className="mb-4" />
                     <div className="font-sans font-bold uppercase tracking-[0.2em] text-sm">Awaiting Genetic Inputs</div>
                  </motion.div>
               )}

               {isBreeding && (
                  <motion.div key="breeding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                     <div className="relative">
                        <Loader2 size={48} className="animate-spin text-[#166534]" />
                        <Dna size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#166534] animate-pulse" />
                     </div>
                     <div className="text-center font-sans">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#166534] mb-1">Synthesizing Modalities</div>
                        <div className="text-[10px] uppercase tracking-widest text-[#2c3e35]/50">Image API & LLM processing...</div>
                     </div>
                  </motion.div>
               )}

               {hybrid && !isBreeding && (
                  <motion.div 
                     key="result" 
                     initial={{ opacity: 0, scale: 0.95 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="bg-white p-6 border border-[#2c3e35]/20 shadow-xl flex flex-col md:flex-row gap-8 w-full max-w-2xl"
                  >
                     {/* Image Modality */}
                     <div className="w-full md:w-1/2 relative">
                        <img src={hybrid.image} className="w-full h-auto aspect-[3/4] object-cover border border-[#2c3e35]/10 filter contrast-110 saturate-50 sepia-[0.2]" alt="Hybrid Plant" />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-widest text-[#166534]">
                           Visual Morphology
                        </div>
                     </div>

                     {/* Text Modality */}
                     <div className="w-full md:w-1/2 flex flex-col">
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#166534] mb-4 border-b border-[#2c3e35]/10 pb-2">
                           Taxonomic Data (LLM Generated)
                        </div>
                        
                        <h3 className="text-2xl italic font-serif mb-6 text-[#166534] capitalize">
                           {hybrid.stats.scientificName}
                        </h3>

                        <div className="space-y-4 flex-1">
                           <div>
                              <div className="text-[10px] font-sans uppercase text-[#2c3e35]/60 mb-0.5">Description</div>
                              <div className="text-sm leading-relaxed">{hybrid.stats.description}</div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 border-t border-[#2c3e35]/10 pt-4 mt-auto">
                              <div>
                                 <div className="text-[9px] font-sans uppercase text-[#2c3e35]/60">Water Needs</div>
                                 <div className="text-sm font-medium">{hybrid.stats.waterNeeds}</div>
                              </div>
                              <div>
                                 <div className="text-[9px] font-sans uppercase text-[#2c3e35]/60">Toxicity</div>
                                 <div className="text-sm font-medium">{hybrid.stats.toxicity}</div>
                              </div>
                              <div>
                                 <div className="text-[9px] font-sans uppercase text-[#2c3e35]/60">Sunlight</div>
                                 <div className="text-sm font-medium">{hybrid.stats.sunlight}</div>
                              </div>
                              <div>
                                 <div className="text-[9px] font-sans uppercase text-[#2c3e35]/60">Growth</div>
                                 <div className="text-sm font-medium">{hybrid.stats.growthRate}</div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </motion.div>
               )}

            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
