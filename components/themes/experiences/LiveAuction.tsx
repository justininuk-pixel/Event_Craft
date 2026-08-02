"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

export function LiveAuction({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"bidding" | "sold">("bidding");
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentBid, setCurrentBid] = useState(100);
  const [highestBidder, setHighestBidder] = useState("Guest_102");
  const [bidHistory, setBidHistory] = useState<{name: string, amount: number}[]>([
    {name: "Guest_102", amount: 100}
  ]);

  const mockOpponents = ["ArtLover99", "RichUncle", "MysteriousBidder", "GalleryOwner", "Guest_402"];

  const phaseRef = useRef(phase);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    phaseRef.current = phase;
    timeLeftRef.current = timeLeft;
  }, [phase, timeLeft]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playBid = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playGavel = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const handleEnd = useCallback(() => {
    setPhase("sold");
    playGavel();
    
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  }, [playGavel, onComplete]);

  const handleBid = () => {
    if (phase !== "bidding") return;
    initAudio();
    playBid();
    
    const newBid = currentBid + 10;
    setCurrentBid(newBid);
    setHighestBidder("You");
    setTimeLeft(10);
    setBidHistory(prev => [{name: "You", amount: newBid}, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (phase !== "bidding") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, handleEnd]);

  useEffect(() => {
    if (phase !== "bidding") return;

    const ghostInterval = setInterval(() => {
      if (phaseRef.current !== "bidding") return;
      
      if (timeLeftRef.current <= 4 && highestBidder === "You" && Math.random() > 0.3) {
         const opponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
         setCurrentBid(prev => {
           const next = prev + 10;
           setBidHistory(h => [{name: opponent, amount: next}, ...h].slice(0, 5));
           return next;
         });
         setHighestBidder(opponent);
         setTimeLeft(10);
         if (audioCtxRef.current) playBid();
      } else if (Math.random() > 0.8) {
         const opponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
         setCurrentBid(prev => {
           const next = prev + 10;
           setBidHistory(h => [{name: opponent, amount: next}, ...h].slice(0, 5));
           return next;
         });
         setHighestBidder(opponent);
         setTimeLeft(10);
         if (audioCtxRef.current) playBid();
      }

    }, 1000);

    return () => clearInterval(ghostInterval);
  }, [phase, highestBidder, mockOpponents, playBid]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 touch-none select-none flex flex-col items-center justify-center font-mono">
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: phase === "sold" ? 1 : 0.1,
          transform: phase === "sold" ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: phase === "sold" ? (palette.background as string) : 'transparent'
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 border-4 border-amber-900/30 rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <h2 className="text-3xl font-heading text-amber-900 mb-8 border-b-2 border-amber-900/50 pb-4 inline-block">SOLD TO: {highestBidder.toUpperCase()}</h2>
          
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 border-8 border-white rounded-sm"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-amber-950">
            {config.title}
          </h1>
          <p className="text-lg font-body text-amber-900 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground Auction UI */}
      <AnimatePresence>
        {phase === "bidding" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            
            {/* Top Bar: Timer */}
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 flex flex-col items-center pointer-events-auto">
              <div className="text-zinc-500 tracking-widest text-sm mb-2">TIME REMAINING</div>
              <div className={`text-6xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </div>
            </div>

            {/* Center: Current Bid */}
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md pointer-events-auto">
              <div className="text-amber-500/80 tracking-widest text-lg mb-2">CURRENT BID</div>
              <motion.div 
                key={currentBid}
                initial={{ scale: 1.5, color: '#f59e0b' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-7xl font-black mb-4"
              >
                ${currentBid}
              </motion.div>
              <div className="text-zinc-400">
                Highest Bidder: <span className={highestBidder === "You" ? "text-green-400 font-bold" : "text-white"}>{highestBidder}</span>
              </div>
              
              {/* Bid History */}
              <div className="mt-8 w-full max-w-xs bg-black/40 rounded-lg p-4 h-32 overflow-hidden flex flex-col gap-2 relative" style={{ WebkitMaskImage: 'linear-gradient(to bottom, white 50%, transparent)', maskImage: 'linear-gradient(to bottom, white 50%, transparent)' }}>
                <AnimatePresence>
                  {bidHistory.map((b, i) => (
                    <motion.div 
                      key={`${b.amount}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-zinc-500">{b.name}</span>
                      <span className="text-white">${b.amount}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom: Bid Button */}
            <div className="w-full max-w-md pointer-events-auto">
              <button
                className="w-full py-6 rounded-2xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 active:scale-95 transition-all text-white font-black text-3xl shadow-[0_0_40px_rgba(217,119,6,0.3)]"
                onPointerDown={handleBid}
              >
                BID +$10
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
