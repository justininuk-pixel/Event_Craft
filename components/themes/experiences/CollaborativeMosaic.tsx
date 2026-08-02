"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const MOCK_MESSAGES = [
  "Can't wait!", "Looks awesome", "So excited", "Hello from NY", 
  "Here for it", "Nice!", "Love this", "Greetings!", "Count me in"
];

interface TileData {
  index: number;
  isFilled: boolean;
  message: string;
  author: string;
}

export function CollaborativeMosaic({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"gathering" | "revealed">("gathering");
  const [tiles, setTiles] = useState<TileData[]>(() => 
     Array.from({ length: TOTAL_TILES }).map((_, i) => ({
        index: i,
        isFilled: false,
        message: "",
        author: ""
     }))
  );
  
  const [selectedEmptyTile, setSelectedEmptyTile] = useState<number | null>(null);
  const [viewingTileMessage, setViewingTileMessage] = useState<TileData | null>(null);
  
  const [inputText, setInputText] = useState("");
  const [inputName, setInputName] = useState("");

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playSound = useCallback((type: "click" | "pop" | "fanfare") => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === "click") {
       osc.type = "sine";
       osc.frequency.setValueAtTime(600, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
       gain.gain.setValueAtTime(0.1, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
       osc.start();
       osc.stop(ctx.currentTime + 0.05);
    } else if (type === "pop") {
       osc.type = "sine";
       osc.frequency.setValueAtTime(300, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
       gain.gain.setValueAtTime(0.3, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
       osc.start();
       osc.stop(ctx.currentTime + 0.1);
    } else {
       osc.type = "square";
       osc.frequency.setValueAtTime(440, ctx.currentTime);
       osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
       osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
       gain.gain.setValueAtTime(0.2, ctx.currentTime);
       gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
       osc.start();
       osc.stop(ctx.currentTime + 0.5);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
  }, []);

  useEffect(() => {
    if (phase !== "gathering") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "gathering") return;
       
       setTiles(prev => {
          const empty = prev.filter(t => !t.isFilled);
          if (empty.length === 0) return prev;
          
          const target = empty[Math.floor(Math.random() * empty.length)];
          const newTiles = [...prev];
          newTiles[target.index] = {
             ...target,
             isFilled: true,
             message: MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
             author: "Guest_" + Math.floor(Math.random() * 9999)
          };
          playSound("pop");
          return newTiles;
       });
       
    }, Math.random() * 3000 + 1000);

    return () => clearInterval(interval);
  }, [phase, playSound]);

  useEffect(() => {
    if (phase !== "gathering") return;
    
    if (tiles.every(t => t.isFilled)) {
       setPhase("revealed");
       playSound("fanfare");
       if (onComplete) onComplete();
    }
  }, [tiles, phase, playSound, onComplete]);

  const handleTileClick = (t: TileData) => {
     initAudio();
     playSound("click");
     if (!t.isFilled) {
        setSelectedEmptyTile(t.index);
     } else {
        setViewingTileMessage(t);
     }
  };

  const submitClaim = (e: React.FormEvent) => {
     e.preventDefault();
     if (selectedEmptyTile === null) return;
     if (!inputText.trim() || !inputName.trim()) return;
     
     setTiles(prev => {
        const arr = [...prev];
        arr[selectedEmptyTile] = {
           ...arr[selectedEmptyTile],
           isFilled: true,
           message: inputText,
           author: inputName
        };
        return arr;
     });
     
     playSound("pop");
     setSelectedEmptyTile(null);
     setInputText("");
     setInputName("");
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };
  
  const imgUrl = config.mediaUrl || "https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=800&q=80";

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-900 touch-none select-none flex flex-col items-center justify-center font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-indigo-900/50">
          <img 
            src={imgUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-indigo-400"
          />
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-indigo-100 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "gathering" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            
            <h2 className="text-2xl font-heading text-white mb-2 text-center drop-shadow-md">
               Collaborative Mosaic
            </h2>
            <p className="text-slate-300 text-sm mb-6 text-center">
               Claim a tile to reveal a piece of the picture. We need {tiles.filter(t => !t.isFilled).length} more!
            </p>

            {/* The Grid */}
            <div 
               className="grid gap-1 w-full max-w-md aspect-square bg-slate-800 p-1 border-4 border-slate-700 rounded-xl shadow-2xl relative"
               style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
               {tiles.map((t) => {
                  const col = t.index % GRID_SIZE;
                  const row = Math.floor(t.index / GRID_SIZE);
                  
                  const bgPosX = (col / (GRID_SIZE - 1)) * 100;
                  const bgPosY = (row / (GRID_SIZE - 1)) * 100;
                  
                  return (
                     <div
                        key={t.index}
                        onPointerDown={() => handleTileClick(t)}
                        className={`relative w-full h-full rounded-sm cursor-pointer transition-all duration-500 overflow-hidden ${
                           t.isFilled ? 'shadow-inner' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                     >
                        {t.isFilled && (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-0"
                              style={{
                                 backgroundImage: `url(${imgUrl})`,
                                 backgroundSize: `${GRID_SIZE * 100}%`,
                                 backgroundPosition: `${bgPosX}% ${bgPosY}%`
                              }}
                           />
                        )}
                        
                        {!t.isFilled && (
                           <div className="absolute inset-0 flex items-center justify-center opacity-10">
                              +
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            <button
               onClick={handleReveal}
               className="mt-12 text-slate-400 hover:text-white transition-colors text-xs font-bold tracking-widest border border-slate-700 px-6 py-2 rounded-full"
            >
               SKIP / REVEAL CONTENT
            </button>

            {/* Claim Dialog */}
            <AnimatePresence>
               {selectedEmptyTile !== null && (
                  <motion.div 
                     className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                  >
                     <motion.div 
                        className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl text-slate-800"
                        initial={{ y: 50, scale: 0.9 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: 50, scale: 0.9 }}
                     >
                        <h3 className="font-bold text-xl mb-4">Claim Tile #{selectedEmptyTile + 1}</h3>
                        <form onSubmit={submitClaim} className="flex flex-col gap-3">
                           <input 
                              type="text" 
                              placeholder="Your Name" 
                              value={inputName}
                              onChange={e => setInputName(e.target.value)}
                              className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-sm outline-none focus:border-indigo-500"
                              required
                           />
                           <textarea 
                              placeholder="A short message..." 
                              value={inputText}
                              onChange={e => setInputText(e.target.value)}
                              className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-sm outline-none focus:border-indigo-500 resize-none h-20"
                              required
                           />
                           <div className="flex gap-2 mt-2">
                              <button 
                                 type="button" 
                                 onClick={() => setSelectedEmptyTile(null)}
                                 className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded"
                              >
                                 Cancel
                              </button>
                              <button 
                                 type="submit"
                                 className="flex-1 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                              >
                                 Place Tile
                              </button>
                           </div>
                        </form>
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Read Dialog */}
            <AnimatePresence>
               {viewingTileMessage !== null && (
                  <motion.div 
                     className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onPointerDown={(e) => {
                        if (e.target === e.currentTarget) setViewingTileMessage(null);
                     }}
                  >
                     <motion.div 
                        className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl text-slate-800 text-center"
                        initial={{ scale: 0.8, rotateY: 90 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                     >
                        <div className="text-3xl mb-2">💬</div>
                        <p className="font-bold text-lg mb-1 leading-tight">
                           "{viewingTileMessage.message}"
                        </p>
                        <p className="text-slate-500 text-sm mb-6">
                          , {viewingTileMessage.author}
                        </p>
                        <button 
                           onClick={() => setViewingTileMessage(null)}
                           className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                        >
                           Close
                        </button>
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
