"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface Track {
  id: string;
  title: string;
  artist: string;
  score: number;
  hasVoted: boolean;
  cover: string;
}

const INITIAL_TRACKS: Track[] = [
  { id: "t1", title: "Midnight City", artist: "M83", score: 42, hasVoted: false, cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&w=150&q=80" },
  { id: "t2", title: "Blinding Lights", artist: "The Weeknd", score: 38, hasVoted: false, cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&w=150&q=80" },
  { id: "t3", title: "Levitating", artist: "Dua Lipa", score: 35, hasVoted: false, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80" },
  { id: "t4", title: "Get Lucky", artist: "Daft Punk", score: 20, hasVoted: false, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80" },
  { id: "t5", title: "Watermelon Sugar", artist: "Harry Styles", score: 18, hasVoted: false, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80" }
];

export function JukeboxQueue({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"voting" | "revealed">("voting");
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [hasVotedAny, setHasVotedAny] = useState(false);
  
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

  const playBlip = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (phase !== "voting") return;
    
    const interval = setInterval(() => {
       if (phaseRef.current !== "voting") return;
       
       setTracks(prev => {
          const newTracks = [...prev];
          const idx = Math.floor(Math.random() * (newTracks.length - 1)) + 1;
          newTracks[idx] = { ...newTracks[idx], score: newTracks[idx].score + 1 };
          return newTracks;
       });
       
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  const handleUpvote = (id: string) => {
     if (phase !== "voting") return;
     initAudio();
     playBlip();
     
     setTracks(prev => prev.map(t => 
        t.id === id ? { ...t, score: t.score + 1, hasVoted: true } : t
     ));
     setHasVotedAny(true);
  };

  const handleRevealClick = () => {
     setPhase("revealed");
     if (onComplete) onComplete();
  };

  const sortedTracks = [...tracks].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white touch-none flex flex-col font-sans">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "revealed" ? 1 : 0.05,
          filter: phase === "revealed" ? 'blur(0px)' : 'blur(20px)',
          transform: phase === "revealed" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "revealed" ? (palette.background as string) : 'transparent',
          pointerEvents: phase === "revealed" ? "auto" : "none"
        }}
      >
        <div className="w-full max-w-lg bg-zinc-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-zinc-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-lg mb-6 rounded-3xl"
            />
          )}
          <h1 className="text-4xl font-heading mb-4" style={{ color: palette.primary }}>
            {config.title}
          </h1>
          <p className="text-lg font-body text-zinc-400 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase === "voting" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col bg-zinc-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
          >
            
            {/* Now Playing Header */}
            <div className="w-full bg-zinc-900 border-b border-zinc-800 p-6 flex items-center gap-6 shadow-2xl z-30">
               <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg relative">
                  <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80" alt="Now Playing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <div className="flex gap-1 items-end h-6">
                        <motion.div className="w-1 bg-green-400 rounded-full" animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} />
                        <motion.div className="w-1 bg-green-400 rounded-full" animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 0.7 }} />
                        <motion.div className="w-1 bg-green-400 rounded-full" animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                     </div>
                  </div>
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Now Playing</p>
                  <h2 className="text-xl font-bold truncate">Get Lucky</h2>
                  <p className="text-sm text-zinc-400 truncate">Daft Punk</p>
               </div>
            </div>

            {/* Queue */}
            <div className="flex-1 w-full overflow-y-auto p-4 md:p-8 hide-scrollbar">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2">Up Next</h3>
               
               <LayoutGroup>
                  <motion.div className="flex flex-col gap-3">
                     <AnimatePresence>
                        {sortedTracks.map((track, i) => (
                           <motion.div
                              layout
                              key={track.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center gap-4 shadow-sm"
                           >
                              <div className="w-8 text-center text-zinc-600 font-black text-xl shrink-0">
                                 {i + 1}
                              </div>
                              <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 overflow-hidden">
                                 <h4 className="font-bold truncate text-zinc-200">{track.title}</h4>
                                 <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                              </div>
                              <div className="flex flex-col items-center shrink-0 w-16">
                                 <button
                                    onClick={() => !track.hasVoted && handleUpvote(track.id)}
                                    disabled={track.hasVoted}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                       track.hasVoted 
                                          ? "bg-green-500/20 text-green-400" 
                                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                                    }`}
                                 >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                 </button>
                                 <span className="text-xs font-bold mt-1 text-zinc-400">{track.score}</span>
                              </div>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </motion.div>
               </LayoutGroup>
               
               <div className="h-24" /> {/* spacer for bottom fade */}
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-zinc-950 to-transparent flex justify-center z-40 pointer-events-none">
               <AnimatePresence>
                  {hasVotedAny && (
                     <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={handleRevealClick}
                        className="bg-white text-black font-bold text-sm tracking-widest px-8 py-4 rounded-full shadow-2xl pointer-events-auto hover:bg-zinc-200 transition-colors"
                     >
                        VIEW CONTENT
                     </motion.button>
                  )}
               </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
