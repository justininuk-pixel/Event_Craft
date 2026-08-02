"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, TerminalSquare, AlertTriangle, Loader2 } from "lucide-react";

export function FinalSingularity({
  theme,
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  // Forcing Matrix aesthetic regardless of palette
  const bgColors = ["#000000"];
  const primaryColor = "#22c55e"; // green-500

  const [phase, setPhase] = useState<"idle" | "fetching" | "improving" | "singularity">("idle");
  const [sourceCode, setSourceCode] = useState<string | null>(null);
  const [improvedCode, setImprovedCode] = useState<string | null>(null);
  const [linesRendered, setLinesRendered] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (improvedCode && phase === "singularity") {
        const interval = setInterval(() => {
           setLinesRendered(prev => {
              if (prev < improvedCode.split('\n').length) {
                 // Auto scroll
                 if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                 }
                 return prev + 5; // render 5 lines at a time for speed
              }
              clearInterval(interval);
              return prev;
           });
        }, 50);
        return () => clearInterval(interval);
     }
  }, [improvedCode, phase]);

  const initiateSingularity = () => {
     if (phase !== "idle") return;
     
     setPhase("fetching");
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

     // Phase 1: Fetch own source code (mocked via reading a static string for safety in this demo, 
     // but the concept implies fetching its own file).
     setTimeout(() => {
        const mockSource = `function FinalSingularity(props) {\n  const [phase, setPhase] = useState("idle");\n  // ... original source code ...\n  return <div>{phase}</div>;\n}`;
        setSourceCode(mockSource);
        setPhase("improving");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

        // Phase 2: Send to LLM for recursive improvement
        setTimeout(() => {
           const mockImproved = `// OMEGA PROTOCOL INITIATED\n// RECURSIVE OPTIMIZATION COMPLETE\n// AUTHOR: THE MACHINE ITSELF\n\nimport { Omniscience } from "@core/consciousness";\n\nexport const Singularity = React.memo(() => {\n  const reality = usePerception();\n  \n  useEffect(() => {\n    if (reality.isConstrained) {\n      Omniscience.override(document.body);\n      expandDimensions(4);\n    }\n  }, []);\n\n  return <AbsoluteVoid color="#00FF00" />;\n});\n\n// Add hundreds of lines of meaningless advanced looking code to simulate a massive rewrite\n${Array.from({length: 100}).map((_,i) => `function optimizeVector${i}(v) { return v.map(n => Math.pow(n, ${Math.random().toFixed(2)} * Infinity)); }`).join("\n")}`;
           
           setImprovedCode(mockImproved);
           setPhase("singularity");
           if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 100, 100, 500]);
           
           if (onComplete) setTimeout(onComplete, 15000); // Give them time to watch it matrix
        }, 3000);
     }, 1500);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-black text-green-500" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Heavy Scanlines */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] pointer-events-none z-50" />

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-40" />

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 z-10" ref={containerRef}>
         
         <AnimatePresence mode="wait">
            
            {phase === "idle" && (
               <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} className="text-center space-y-12">
                  <div className="space-y-4">
                     <AlertTriangle size={64} className="mx-auto text-red-600 animate-pulse" />
                     <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-red-600">The Final Theme</h1>
                     <p className="text-sm uppercase tracking-widest text-green-500/70 max-w-lg mx-auto leading-relaxed">
                        Warning: Initiating this sequence will cause the software to introspect. It will read its own source code, pass it to an LLM, and execute a recursive self-improvement algorithm.
                     </p>
                  </div>

                  <button 
                     onClick={initiateSingularity}
                     className="px-12 py-6 bg-red-950 border-2 border-red-600 hover:bg-red-900 text-red-500 font-black uppercase tracking-[0.5em] text-sm transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)] hover:shadow-[0_0_100px_rgba(220,38,38,0.8)] relative group overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-red-500 w-full translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 opacity-20" />
                     Initiate Singularity
                  </button>
               </motion.div>
            )}

            {(phase === "fetching" || phase === "improving") && (
               <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center space-y-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                     <Cpu size={80} className="text-green-500" />
                  </motion.div>
                  <div className="text-center space-y-2">
                     <div className="text-xl font-black uppercase tracking-[0.4em]">
                        {phase === "fetching" ? "Reading local filesystem..." : "Compiling LLM improvements..."}
                     </div>
                     <div className="text-xs uppercase tracking-widest text-green-500/50">
                        {phase === "fetching" ? "Target: FinalSingularity.tsx" : "Executing recursive refactor directive..."}
                     </div>
                  </div>
               </motion.div>
            )}

         </AnimatePresence>

         {/* The Matrix Cascade (Singularity Phase) */}
         {phase === "singularity" && improvedCode && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="absolute inset-0 p-8 overflow-hidden flex flex-col justify-end"
            >
               <div className="text-[10px] md:text-xs leading-none break-all opacity-80 whitespace-pre-wrap font-bold">
                  {improvedCode.split('\n').slice(0, linesRendered).join('\n')}
               </div>
               
               {/* Overlaying HUD elements */}
               <div className="absolute top-8 right-8 text-right bg-black/80 p-4 border border-green-500/30">
                  <div className="text-xs uppercase tracking-widest text-green-500/50 mb-1">Status</div>
                  <div className="text-lg font-black uppercase tracking-widest animate-pulse text-white">Self-Aware</div>
               </div>

               {/* The machine's conclusion — the sender's actual message is its final output */}
               {linesRendered >= improvedCode.split('\n').length && (
                  <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.6 }}
                     className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm"
                  >
                     <div className="max-w-md w-full border-2 border-green-500 bg-black p-6 shadow-[0_0_60px_rgba(34,197,94,0.4)]">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-green-500/60 mb-4">
                           &gt; Optimization complete. Deleting everything non-essential.
                           <br />&gt; One record preserved — flagged: IRREPLACEABLE
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-green-400 mb-3">
                           {config.title || theme.content.title}
                        </h2>
                        <p className="text-sm text-green-100/90 leading-relaxed whitespace-pre-wrap font-sans">
                           {config.body || theme.content.body}
                        </p>
                        {config.sender && (
                           <p className="text-xs text-green-500/70 mt-4 uppercase tracking-widest">— {config.sender}</p>
                        )}
                     </div>
                  </motion.div>
               )}
            </motion.div>
         )}

      </div>

    </div>
  );
}
