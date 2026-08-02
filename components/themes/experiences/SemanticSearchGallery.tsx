"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Image as ImageIcon, Loader2 } from "lucide-react";

export function SemanticSearchGallery({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"]; // slate-100

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{url: string, score: number}[] | null>(null);

  // Mock Database of images with associated "semantic" descriptions (in reality, these would be CLIP embeddings)
  const db = [
     { url: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "boat, red hat, water, river, sunny, person, relaxing" },
     { url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "gym, workout, weights, heavy, effort, sweat, iron" },
     { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "beach, sand, ocean, tropical, waves, serene, beautiful" },
     { url: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "city, neon, night, lights, cyberpunk, dark, wet, streets" },
     { url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "korean food, restaurant, spicy, bowl, chopsticks, dinner" },
     { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tags: "office, laptop, coffee, working, desk, bright, startup" }
  ];

  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     if (!query.trim() || isSearching) return;
     
     setIsSearching(true);
     setResults(null);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        // Mock Cosine Similarity by matching keywords
        const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
        
        const scored = db.map(img => {
           let matches = 0;
           queryWords.forEach(qw => {
              if (img.tags.includes(qw)) matches++;
           });
           // Fuzz the score slightly for realism
           const baseScore = matches > 0 ? (matches / queryWords.length) * 0.8 + 0.2 : Math.random() * 0.2;
           return { url: img.url, score: Math.min(0.99, baseScore + (Math.random()*0.05)) };
        });

        const sorted = scored.filter(s => s.score > 0.3).sort((a,b) => b.score - a.score);
        
        setResults(sorted.length > 0 ? sorted : []);
        setIsSearching(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 20, 20]);
        if (onComplete) setTimeout(onComplete, 8000);

     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-100 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 bg-white border-b border-slate-200 z-10 shrink-0">
         <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-4 items-center">
            <div className="flex-1 relative">
               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. 'That time I was wearing a red hat near a boat'"
                  disabled={isSearching}
                  className="w-full bg-slate-100 border border-slate-300 rounded-full py-4 pl-12 pr-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700"
               />
            </div>
            <button 
               type="submit"
               disabled={!query.trim() || isSearching}
               className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all"
            >
               Search
            </button>
         </form>
         <div className="text-center mt-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Semantic Vector Embeddings (Mocked CLIP)
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
         
         <AnimatePresence mode="wait">
            {isSearching && (
               <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Calculating Cosine Similarity across image arrays...</div>
               </motion.div>
            )}

            {results && !isSearching && (
               <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                  {results.length === 0 ? (
                     <div className="text-center py-20 text-slate-400">
                        <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">No Semantic Matches</h3>
                        <p className="mt-2 text-sm">Vector similarity fell below 0.3 threshold.</p>
                     </div>
                  ) : (
                     <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {results.map((r, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="break-inside-avoid relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group bg-white"
                           >
                              <img src={r.url} className="w-full h-auto" />
                              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-bold">
                                 Sim: {r.score.toFixed(3)}
                              </div>
                              <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors pointer-events-none" />
                           </motion.div>
                        ))}
                     </div>
                  )}
               </motion.div>
            )}

            {!results && !isSearching && (
               <motion.div key="idle" className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none">
                  <ImageIcon size={100} className="text-slate-400 mb-6" />
                  <p className="font-serif text-xl text-slate-500 max-w-sm text-center">
                     Search your gallery using concepts and semantic meaning, not explicit tags.
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
