"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Play, ListMusic, Speaker, Check } from "lucide-react";

type Song = { id: string; title: string; artist: string; albumArt: string; addedBy?: string };

const mockDatabase: Song[] = [
  { id: "s1", title: "Blinding Lights", artist: "The Weeknd", albumArt: "https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36" },
  { id: "s2", title: "Levitating", artist: "Dua Lipa", albumArt: "https://i.scdn.co/image/ab67616d00001e02bd26cbceadc3c01d6046e01a" },
  { id: "s3", title: "Watermelon Sugar", artist: "Harry Styles", albumArt: "https://i.scdn.co/image/ab67616d00001e0277fdcfda6535601aff1818fa" },
  { id: "s4", title: "Good 4 U", artist: "Olivia Rodrigo", albumArt: "https://i.scdn.co/image/ab67616d00001e02a91c10fe9472d9bd89802e5a" },
  { id: "s5", title: "Stay", artist: "The Kid LAROI, Justin Bieber", albumArt: "https://i.scdn.co/image/ab67616d00001e023dc86178873bfdb5fbfb6e51" }
];

export function SharedSpotifyQueue({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#1db954"; // spotify green
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#121212"]; // deep black

  const [queue, setQueue] = useState<Song[]>([
     { ...mockDatabase[0], addedBy: "Host" },
     { ...mockDatabase[1], addedBy: "Sarah" }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const currentUser = config.recipient || "Guest";

  const searchResults = searchQuery 
     ? mockDatabase.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
     : mockDatabase;

  const handleAdd = (song: Song) => {
     setQueue(prev => [...prev, { ...song, addedBy: currentUser }]);
     setSearchQuery("");
     setIsSearching(false);
     setRecentlyAdded(song.id);
     
     setTimeout(() => setRecentlyAdded(null), 2000);
     
     if (queue.length >= 4 && onComplete) {
        onComplete();
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-white"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Decorative Blur */}
      <div 
         className="absolute top-0 left-0 right-0 h-64 opacity-20 pointer-events-none blur-3xl transition-colors duration-1000"
         style={{ backgroundColor: primaryColor }}
      />

      {/* Header */}
      <div className="pt-10 px-6 pb-4 relative z-10 flex flex-col items-center">
         <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 drop-shadow-md">
            <Speaker size={24} style={{ color: primaryColor }} />
            {config.title || "The Jukebox"}
         </h2>
         <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-1 text-center">
            {config.body || "Add songs to the host's speakers"}
         </p>
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-md mx-auto overflow-hidden">
         
         {/* Search Bar */}
         <div className="px-6 mb-4 relative z-20">
            <div className={`flex items-center bg-zinc-800/80 backdrop-blur border border-zinc-700/50 rounded-full px-4 py-3 transition-all ${isSearching ? 'ring-2 ring-emerald-500/50 bg-zinc-800' : ''}`}>
               <Search size={20} className="text-zinc-400 mr-3" />
               <input 
                  type="text"
                  placeholder="Search songs or artists..."
                  className="bg-transparent border-none outline-none text-white w-full placeholder-zinc-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
               />
               {isSearching && (
                  <button onClick={() => { setIsSearching(false); setSearchQuery(""); }} className="text-xs font-bold text-zinc-400 ml-2 uppercase">
                     Cancel
                  </button>
               )}
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
            
            <AnimatePresence mode="wait">
               {isSearching ? (
                  // SEARCH RESULTS
                  <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Results</h3>
                     <div className="flex flex-col gap-2">
                        {searchResults.map(song => (
                           <div key={`s-${song.id}`} className="flex items-center gap-4 bg-zinc-800/40 p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                              <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover bg-zinc-800" />
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-white truncate text-sm">{song.title}</h4>
                                 <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                              </div>
                              <button
                                 onClick={() => handleAdd(song)}
                                 className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-black hover:scale-105 active:scale-95"
                              >
                                 <Plus size={20} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               ) : (
                  // CURRENT QUEUE
                  <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     
                     {/* Now Playing */}
                     <div className="mb-8 mt-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3 text-emerald-400 px-2">
                           <Play size={12} fill="currentColor" /> Now Playing
                        </div>
                        <div className="flex items-center gap-4 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 p-3 rounded-2xl border border-zinc-700/50 shadow-xl">
                           <div className="relative">
                              <img src={queue[0].albumArt} alt={queue[0].title} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                              {/* Fake equalizer bars */}
                              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-1 backdrop-blur-[1px]">
                                 <motion.div animate={{ height: [4, 12, 6, 16, 4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-emerald-400 rounded-full" />
                                 <motion.div animate={{ height: [8, 16, 4, 10, 8] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-emerald-400 rounded-full" />
                                 <motion.div animate={{ height: [6, 10, 16, 6, 6] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 bg-emerald-400 rounded-full" />
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-black text-white truncate text-lg">{queue[0].title}</h4>
                              <p className="text-zinc-400 text-sm truncate">{queue[0].artist}</p>
                              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">Added by {queue[0].addedBy}</p>
                           </div>
                        </div>
                     </div>

                     {/* Up Next */}
                     <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">
                           <ListMusic size={14} /> Up Next
                        </div>
                        
                        <div className="flex flex-col gap-3 relative">
                           <AnimatePresence>
                              {queue.slice(1).map((song, i) => (
                                 <motion.div 
                                    key={`${song.id}-${i}`}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-xl"
                                 >
                                    <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md object-cover opacity-80" />
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-zinc-200 truncate text-sm">{song.title}</h4>
                                       <p className="text-zinc-500 text-xs truncate flex items-center gap-2">
                                          {song.artist}
                                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                          <span className="text-emerald-500/70">{song.addedBy}</span>
                                       </p>
                                    </div>
                                 </motion.div>
                              ))}
                           </AnimatePresence>
                        </div>
                     </div>

                  </motion.div>
               )}
            </AnimatePresence>
            
         </div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
         {recentlyAdded && (
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 z-50 text-sm whitespace-nowrap"
            >
               <Check size={16} className="text-emerald-500" /> Added to Queue
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
