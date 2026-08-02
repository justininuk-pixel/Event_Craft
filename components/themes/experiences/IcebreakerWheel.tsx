"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

const USERS = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Sam", "Jamie"];
const QUESTIONS = [
  "What is your most used emoji?",
  "What's a weird fact you happen to know?",
  "What was your favorite childhood TV show?",
  "If you could have any superpower, what would it be?",
  "What is the best piece of advice you've ever received?",
  "What's your go-to karaoke song?",
  "If you had to eat one meal every day for the rest of your life, what would it be?",
  "What's your most controversial food opinion?"
];

const COLORS = [
  "#ef4444", 
  "#f97316", 
  "#f59e0b", 
  "#84cc16", 
  "#10b981", 
  "#06b6d4", 
  "#3b82f6", 
  "#8b5cf6", 
];

export function IcebreakerWheel({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "result" | "revealed">("idle");
  const [rotation, setRotation] = useState(0);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  
  const wheelRef = useRef<SVGSVGElement>(null);
  const prevTickAngleRef = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {}
  }, []);

  const playTick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  const playFanfare = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const freqs = [523.25, 659.25, 783.99, 1046.50]; 
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1 + (i*0.05));
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    });
  }, []);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "spinning") return;
    
    const checkTick = () => {
       if (wheelRef.current) {
          const st = window.getComputedStyle(wheelRef.current);
          const tr = st.getPropertyValue("transform");
          if (tr !== 'none') {
             const values = tr.split('(')[1].split(')')[0].split(',');
             const a = parseFloat(values[0]);
             const b = parseFloat(values[1]);
             let angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
             if (angle < 0) angle += 360;
             
             const wedgeAngle = 360 / USERS.length;
             const currentTickAngle = Math.floor(angle / wedgeAngle) * wedgeAngle;
             
             if (currentTickAngle !== prevTickAngleRef.current) {
                playTick();
                prevTickAngleRef.current = currentTickAngle;
             }
          }
       }
       if (phaseRef.current === "spinning") {
          requestAnimationFrame(checkTick);
       }
    };
    
    requestAnimationFrame(checkTick);
  }, [phase, playTick]);

  const spin = () => {
    if (phase !== "idle") return;
    initAudio();
    
    const spins = 5;
    const wedgeAngle = 360 / USERS.length;
    const targetWedge = Math.floor(Math.random() * USERS.length);
    
    const middleAngle = (targetWedge * wedgeAngle) + (wedgeAngle / 2);
    const targetRotation = (270 - middleAngle) + (360 * spins);
    
    setRotation(targetRotation);
    setPhase("spinning");
    
    setTimeout(() => {
       setPhase("result");
       setSelectedUser(USERS[targetWedge]);
       setSelectedQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);
       playFanfare();
    }, 4500);
  };

  const handleReveal = () => {
    setPhase("revealed");
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 touch-none select-none flex flex-col items-center justify-center font-sans">
      
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
        <div className="w-full max-w-lg bg-black/60 p-8 rounded-3xl backdrop-blur flex flex-col items-center border border-slate-800">
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Revealed" 
              className="w-48 h-48 object-cover shadow-2xl mb-6 rounded-3xl border-4 border-slate-600"
            />
          )}
          <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
            {config.title}
          </h1>
          <p className="text-lg font-body text-slate-300 whitespace-pre-wrap max-w-sm">
            {config.body}
          </p>
        </div>
      </div>

      {/* Foreground UI */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            
            <h2 className="text-4xl font-heading text-white mb-8 text-center drop-shadow-lg uppercase tracking-widest">
              Icebreaker Wheel
            </h2>

            {/* Wheel Container */}
            <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
               
               {/* The Pointer */}
               <div className="absolute -top-4 z-30 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-white drop-shadow-md" />

               {/* The SVG Wheel */}
               <svg 
                 ref={wheelRef}
                 viewBox="-100 -100 200 200" 
                 className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform"
                 style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: phase === 'spinning' ? '4s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                 }}
               >
                  {USERS.map((user, i) => {
                     const total = USERS.length;
                     const wedgeAngle = (Math.PI * 2) / total;
                     const startAngle = i * wedgeAngle;
                     const endAngle = (i + 1) * wedgeAngle;
                     
                     const r = 100;
                     const x1 = Math.cos(startAngle) * r;
                     const y1 = Math.sin(startAngle) * r;
                     const x2 = Math.cos(endAngle) * r;
                     const y2 = Math.sin(endAngle) * r;
                     const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                     const pathData = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                     
                     const midAngle = startAngle + (wedgeAngle / 2);
                     const tx = Math.cos(midAngle) * 60;
                     const ty = Math.sin(midAngle) * 60;
                     const textRotation = (midAngle * (180/Math.PI));
                     
                     return (
                        <g key={user}>
                           <path d={pathData} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                           <text 
                              x={tx} 
                              y={ty} 
                              fill="white" 
                              fontSize="12" 
                              fontWeight="bold" 
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                           >
                              {user}
                           </text>
                        </g>
                     );
                  })}
                  
                  {/* Center Hub */}
                  <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="white" strokeWidth="3" />
               </svg>

               {/* Center SPIN button overlay */}
               {phase === "idle" && (
                  <button 
                     onPointerDown={spin}
                     className="absolute z-30 w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-black text-sm tracking-widest shadow-xl border-2 border-white/50"
                  >
                     SPIN
                  </button>
               )}
            </div>

            {/* Result Popup */}
            <AnimatePresence>
               {phase === "result" && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.8, y: 50 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="absolute z-40 bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-sm w-11/12 text-center"
                  >
                     <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-2">
                        It landed on
                     </h3>
                     <h2 className="text-4xl font-black text-rose-600 mb-6 font-heading">
                        {selectedUser}!
                     </h2>
                     
                     <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6">
                        <p className="text-slate-800 font-medium text-lg leading-snug">
                           "{selectedQuestion}"
                        </p>
                     </div>

                     <button 
                        onClick={handleReveal}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                     >
                        DONE
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>

            {phase === "idle" && (
              <button
                onClick={handleReveal}
                className="absolute bottom-12 text-slate-500/50 hover:text-slate-300 transition-colors text-xs font-bold tracking-widest border border-slate-700 px-4 py-2 rounded-full"
              >
                SKIP / REVEAL CONTENT
              </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
