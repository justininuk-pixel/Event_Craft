"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Link as LinkIcon, Loader2 } from "lucide-react";

export function EndlessWikipedia({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [topic, setTopic] = useState("The Great Emu War of 1922");
  const [history, setHistory] = useState<string[]>(["The Great Emu War of 1922"]);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePage = (queryTopic: string) => {
     setIsLoading(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        // Mock LLM generation of fake wikipedia page with markdown links
        let markdown = "";
        const t = queryTopic.toLowerCase();

        if (t.includes("emu")) {
           markdown = `The **${queryTopic}** was a military operation undertaken in Australia. The armed forces deployed Major [Meredith's Royal Artillery](fake-meredith) to combat the emus, but they were defeated by the birds' [Guerrilla Tactics](fake-tactics). The emus were led by the notorious [Emperor Beak](fake-emperor), a massive flightless bird of unusual intelligence.`;
        } else if (t.includes("meredith") || t.includes("artillery")) {
           markdown = `Major [Meredith's Royal Artillery](fake-meredith) was a highly decorated unit known mostly for their devastating loss against avian combatants. Founded by [Sir Arthur Meredith](fake-arthur) in 1899, they pioneered the use of the [Feather-Piercing Shell](fake-shell), which ironically proved useless.`;
        } else if (t.includes("emperor")) {
           markdown = `[Emperor Beak](fake-emperor) is widely considered the greatest avian military tactician in history. According to [Avian Lore](fake-lore), he united the fragmented tribes of the Outback under a single banner using a complex series of clicks and [Throat Pouches](fake-pouches).`;
        } else {
           markdown = `**${queryTopic}** is a complex and highly debated subject within the field of [Pseudo-History](fake-pseudo). Experts at the [Institute of Hallucination](fake-institute) believe it originated during the [Era of Confabulation](fake-era), though definitive proof is lacking.`;
        }

        setContent(markdown);
        setIsLoading(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 20, 20]);
        if (onComplete && history.length > 3) setTimeout(onComplete, 8000);
     }, 1500);
  };

  const handleInitialSearch = (e: React.FormEvent) => {
     e.preventDefault();
     if (!topic.trim() || isLoading) return;
     setHistory([topic]);
     generatePage(topic);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, newTopic: string) => {
     e.preventDefault();
     if (isLoading) return;
     setTopic(newTopic);
     setHistory(prev => [...prev, newTopic]);
     generatePage(newTopic);
  };

  // Simple markdown parser to render links
  const renderMarkdown = (text: string) => {
     const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
     
     return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
           return <b key={i} className="font-sans font-bold text-black">{part.slice(2, -2)}</b>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
           const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
           if (match) {
              const [_, linkText] = match;
              return (
                 <a 
                    key={i} 
                    href="#" 
                    onClick={(e) => handleLinkClick(e, linkText)}
                    className="text-[#0645ad] hover:underline decoration-1 cursor-pointer"
                 >
                    {linkText}
                 </a>
              );
           }
        }
        return <span key={i}>{part}</span>;
     });
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-auto bg-white text-black" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Fake Wikipedia Header */}
      <div className="p-4 border-b border-[#a2a9b1] flex items-center gap-4 bg-[#f8f9fa] z-10 shrink-0">
         <div className="flex items-center gap-2 text-black">
            <Globe size={24} className="text-black opacity-80" />
            <span className="font-serif text-xl tracking-tight hidden sm:inline">Pseudopedia</span>
         </div>
         <div className="text-[10px] uppercase font-bold text-[#72777d] mt-1 mr-auto hidden sm:block">The Free Hallucination</div>
         
         <form onSubmit={handleInitialSearch} className="flex-1 max-w-sm relative ml-auto">
            <input 
               type="text" 
               value={topic}
               onChange={e => setTopic(e.target.value)}
               placeholder="Search Pseudopedia"
               className="w-full border border-[#a2a9b1] rounded-sm py-1.5 px-3 text-sm outline-none focus:border-[#3366cc] bg-white transition-colors"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#72777d]">
               <Search size={14} />
            </button>
         </form>
      </div>

      <div className="flex-1 flex overflow-hidden">
         
         {/* Fake Sidebar */}
         <div className="w-48 bg-[#f8f9fa] border-r border-[#a2a9b1] p-4 hidden md:block shrink-0 overflow-y-auto">
            <div className="text-xs text-[#0645ad] space-y-2 mb-6">
               <div className="hover:underline cursor-pointer">Main page</div>
               <div className="hover:underline cursor-pointer">Contents</div>
               <div className="hover:underline cursor-pointer">Current events</div>
               <div className="hover:underline cursor-pointer">Random hallucination</div>
            </div>
            <div className="border-t border-[#a2a9b1] pt-2 mt-4 text-[10px] font-bold text-[#54595d] uppercase tracking-wider mb-2">History</div>
            <div className="space-y-1 text-xs text-[#0645ad] truncate">
               {history.slice().reverse().slice(0, 10).map((h, i) => (
                  <div key={i} className="truncate opacity-70" title={h}>{h}</div>
               ))}
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <AnimatePresence mode="wait">
               
               {!content && !isLoading && (
                  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl">
                     <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4 font-normal">Welcome to Pseudopedia</h1>
                     <p className="text-sm text-[#202122] mb-4">
                        Search for any concept, and an LLM will recursively generate a highly structured Wikipedia page complete with fake citations and blue links. Click a blue link to fall down the rabbit hole.
                     </p>
                  </motion.div>
               )}

               {isLoading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl flex flex-col items-center justify-center py-20">
                     <Loader2 size={32} className="animate-spin text-[#3366cc] mb-4" />
                     <div className="text-xs font-bold text-[#72777d] uppercase tracking-widest">Hallucinating Lore...</div>
                  </motion.div>
               )}

               {content && !isLoading && (
                  <motion.div key="article" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                     <div className="text-[11px] text-[#72777d] mb-1">From Pseudopedia, the free hallucination</div>
                     <h1 className="text-3xl font-serif border-b border-[#a2a9b1] pb-2 mb-4 font-normal">{history[history.length-1]}</h1>
                     
                     <div className="text-sm text-[#202122] leading-relaxed font-sans mb-8">
                        {renderMarkdown(content)}
                     </div>

                     <div className="border border-[#a2a9b1] bg-[#f8f9fa] p-4 text-xs text-[#202122]">
                        <div className="font-bold border-b border-[#a2a9b1] pb-1 mb-2">Fake Contents</div>
                        <ol className="list-decimal list-inside text-[#0645ad] space-y-1">
                           <li className="hover:underline cursor-pointer">Origins</li>
                           <li className="hover:underline cursor-pointer">Development</li>
                           <li className="hover:underline cursor-pointer">Controversy</li>
                           <li className="hover:underline cursor-pointer">See also</li>
                        </ol>
                     </div>

                     <div className="mt-12 border-t border-[#a2a9b1] pt-2 text-[10px] text-[#72777d]">
                        This page was last hallucinated just now. <br/>
                        Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may not apply because none of this is real.
                     </div>
                  </motion.div>
               )}

            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
