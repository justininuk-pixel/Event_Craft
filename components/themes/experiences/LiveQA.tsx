"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: string;
  text: string;
  upvotes: number;
  hasUpvoted: boolean;
};

const INITIAL_QUESTIONS: Question[] = [
  { id: "q1", text: "Will this session be recorded?", upvotes: 12, hasUpvoted: false },
  { id: "q2", text: "Can we get the slides after?", upvotes: 8, hasUpvoted: false },
  { id: "q3", text: "What is the timeline for Q3?", upvotes: 5, hasUpvoted: false },
  { id: "q4", text: "Are there any plans to expand to Europe?", upvotes: 3, hasUpvoted: false }
];

export function LiveQA({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"qa" | "revealed">("qa");
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [myQuestion, setMyQuestion] = useState("");
  
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playUpvote = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playUnlock = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); 
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }, []);

  const checkWin = useCallback(() => {
    if (hasSubmitted && hasVoted && phaseRef.current === "qa") {
      setPhase("revealed");
      playUnlock();
      onComplete?.();
    }
  }, [hasSubmitted, hasVoted, playUnlock, onComplete]);

  useEffect(() => {
    checkWin();
  }, [hasSubmitted, hasVoted, checkWin]);

  const handleUpvote = (id: string) => {
    initAudio();
    playUpvote();
    setQuestions(prev => prev.map(q => {
      if (q.id === id && !q.hasUpvoted) {
        return { ...q, upvotes: q.upvotes + 1, hasUpvoted: true };
      }
      return q;
    }));
    setHasVoted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myQuestion.trim()) return;
    
    initAudio();
    playUpvote(); 
    
    setQuestions(prev => [
      ...prev,
      { id: `user-${Date.now()}`, text: myQuestion, upvotes: 1, hasUpvoted: true }
    ]);
    setMyQuestion("");
    setHasSubmitted(true);
  };

  useEffect(() => {
    if (phase !== "qa") return;

    const interval = setInterval(() => {
      if (phaseRef.current !== "qa") return;
      
      setQuestions(prev => {
        const next = [...prev];
        if (next.length > 0) {
           const idx = Math.floor(Math.random() * next.length);
           next[idx] = { ...next[idx], upvotes: next[idx].upvotes + 1 };
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [phase]);

  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-50 touch-none select-none flex flex-col items-center font-sans">
      
      {/* Revealed Content Header */}
      <motion.div 
        className="w-full flex flex-col items-center justify-center p-6 text-center z-10 shadow-md shrink-0"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: phase === "revealed" ? 'auto' : 0, 
          opacity: phase === "revealed" ? 1 : 0,
          backgroundColor: phase === "revealed" ? (palette.background as string || '#ffffff') : '#ffffff'
        }}
        transition={{ duration: 0.8 }}
      >
        {phase === "revealed" && (
          <>
            {config.mediaUrl && (
              <img 
                src={config.mediaUrl} 
                alt="Revealed" 
                className="w-24 h-24 object-cover shadow-xl mb-4 rounded-full"
              />
            )}
            <h1 className="text-3xl font-heading mb-2 text-[var(--exp-primary)]">
              {config.title}
            </h1>
            <p className="text-sm font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-sm">
              {config.body}
            </p>
          </>
        )}
      </motion.div>

      {/* Main List Area */}
      <div className="flex-1 w-full max-w-md overflow-y-auto p-4 pb-32" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence>
          {phase === "qa" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
              Live Q&A
              <br/>
              <span className="text-[10px] font-normal lowercase opacity-70">(ask a question & upvote to unlock)</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {sortedQuestions.map((q) => (
              <motion.div 
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex gap-4 items-start"
              >
                {/* Upvote Box */}
                <button 
                  onClick={() => handleUpvote(q.id)}
                  disabled={q.hasUpvoted || phase === "revealed"}
                  className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border-2 transition-colors shrink-0
                    ${q.hasUpvoted ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-zinc-300'}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 -mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="font-bold text-sm">{q.upvotes}</span>
                </button>
                
                {/* Text */}
                <div className="pt-1 text-zinc-800 text-sm leading-relaxed">
                  {q.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Bar */}
      <AnimatePresence>
        {phase === "qa" && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20 flex justify-center"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2">
              <input 
                type="text"
                placeholder="Ask a question..."
                value={myQuestion}
                onChange={(e) => setMyQuestion(e.target.value)}
                className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800"
                maxLength={100}
              />
              <button 
                type="submit"
                disabled={!myQuestion.trim()}
                className="bg-blue-600 text-white px-6 font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-all"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
