"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Pause, Play } from "lucide-react";

export function ProceduralNPCRoutine({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#15803d"];

  const [isRunning, setIsRunning] = useState(true);
  const [conversation, setConversation] = useState<{a: string, b: string} | null>(null);
  
  // Use refs for high-frequency animation to avoid 60FPS React re-renders
  const agentsRef = useRef([
     { id: 1, role: "Baker", color: "bg-orange-500", x: 20, y: 20, dx: 1, dy: 1, stopped: false },
     { id: 2, role: "Mayor", color: "bg-blue-500", x: 80, y: 80, dx: -1, dy: -1, stopped: false }
  ]);
  const agentNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const animationRef = useRef<number>(0);
  const convTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
     if (!isRunning) {
        cancelAnimationFrame(animationRef.current);
        return;
     }

     const loop = () => {
        let newAgents = agentsRef.current;
        
        // If they are stopped (talking), don't move them
        if (newAgents[0].stopped || newAgents[1].stopped) {
           animationRef.current = requestAnimationFrame(loop);
           return;
        }

        // Move
        newAgents.forEach((a, i) => {
           let nx = a.x + a.dx * 0.5;
           let ny = a.y + a.dy * 0.5;
           
           // Bounce bounds
           if (nx < 5 || nx > 95) a.dx *= -1;
           if (ny < 5 || ny > 95) a.dy *= -1;

           a.x = nx;
           a.y = ny;
           
           // Direct DOM update for performance
           const node = agentNodesRef.current[i];
           if (node) {
               node.style.left = `${a.x}%`;
               node.style.top = `${a.y}%`;
           }
        });

        // Collision detection
        const dx = newAgents[0].x - newAgents[1].x;
        const dy = newAgents[0].y - newAgents[1].y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 10 && !newAgents[0].stopped) {
           // Collision! Stop them and trigger conversation
           newAgents[0].stopped = true;
           newAgents[1].stopped = true;

           // Mock LLM Conversation generation between Agent A and Agent B
           setTimeout(() => {
              setConversation({
                 a: "The weather is terrible for my dough. It won't rise!",
                 b: "Yes, well, vote for me and I'll see what we can do about the clouds."
              });

              // End conversation after a bit and resume
              convTimeoutRef.current = setTimeout(() => {
                 setConversation(null);
                 agentsRef.current.forEach(a => {
                    a.stopped = false;
                    a.dx = a.dx * -1;
                    a.dy = a.dy * -1;
                 });
                 
                 if (onComplete) setTimeout(onComplete, 5000);
              }, 4000);
           }, 500);
        }

        animationRef.current = requestAnimationFrame(loop);
     };

     animationRef.current = requestAnimationFrame(loop);

     return () => {
        cancelAnimationFrame(animationRef.current);
        if (convTimeoutRef.current) clearTimeout(convTimeoutRef.current);
     };
  }, [isRunning, onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none bg-green-700 text-white" style={{ backgroundColor: bgColors[0] }}>
      {/* 16-bit Grass Texture Mock */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23000000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
         backgroundSize: '40px 40px'
      }} />

      <div className="p-4 bg-black/60 border-b border-black/40 flex justify-between items-center z-10 shrink-0 backdrop-blur-sm">
         <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-green-400">
               <Users size={16} /> Autonomy Engine
            </h2>
            <div className="text-[9px] uppercase tracking-widest text-green-200/50 mt-1">Zero User Input Required</div>
         </div>
         <button 
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
         >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
         </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[80%] aspect-square max-w-lg border-4 border-white/20 rounded-3xl relative overflow-hidden bg-green-600 shadow-inner">
               
               {/* Rendering Agents */}
               {agentsRef.current.map((agent, i) => (
                  <div 
                     key={agent.id}
                     ref={(el) => { agentNodesRef.current[i] = el; }}
                     className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                     style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
                  >
                     {/* Chat Bubble if talking */}
                     <AnimatePresence>
                        {conversation && agent.stopped && (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute bottom-full mb-2 w-48 bg-white text-black p-3 rounded-lg rounded-bl-none shadow-xl border-2 border-black z-30"
                           >
                              <div className="text-[10px] font-black uppercase tracking-widest border-b border-black/10 pb-1 mb-1 text-black/50">
                                 {agent.role} LLM Output
                              </div>
                              <div className="text-xs font-sans font-medium leading-tight">
                                 {i === 0 ? conversation.a : conversation.b}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

                     {/* The Sprite */}
                     <div className={`w-full h-full ${agent.color} rounded-sm border-2 border-black shadow-md flex items-center justify-center relative`}>
                        <div className="absolute top-2 left-1.5 w-1 h-1 bg-black rounded-full" />
                        <div className="absolute top-2 right-1.5 w-1 h-1 bg-black rounded-full" />
                     </div>
                     <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md">
                        {agent.role}
                     </div>
                  </div>
               ))}

            </div>
         </div>
      </div>
    </div>
  );
}

