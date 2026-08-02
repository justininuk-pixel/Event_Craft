"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export function EightBitQuest({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  // Game State
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 }); // percentages
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [activeDialogue, setActiveDialogue] = useState<{ id: number, text: string } | null>(null);
  
  // NPC state tracking
  const [npcsTalkedTo, setNpcsTalkedTo] = useState<Record<number, boolean>>({});

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#4ade80";

  // Mock NPCs with parts of the story
  const npcs = [
    { id: 1, x: 20, y: 30, text: "Welcome to the village! I hear someone left a message for you." },
    { id: 2, x: 80, y: 40, text: "The message said: 'I'll be waiting by the old ruins.'" },
    { id: 3, x: 50, y: 80, text: "Ah, the ruins are just south of here. Good luck!" },
  ];

  const mapRef = useRef<HTMLDivElement>(null);

  // Click to move logic
  const handleMapClick = (e: React.MouseEvent) => {
    if (activeDialogue) return; // Don't move while talking

    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const percentX = (clickX / rect.width) * 100;
      const percentY = (clickY / rect.height) * 100;

      setFacing(percentX > playerPos.x ? "right" : "left");
      setTargetPos({ x: percentX, y: percentY });
      setIsMoving(true);
    }
  };

  // Movement interpolation loop
  useEffect(() => {
    if (!isMoving) return;

    const speed = 1.0; // speed in percentage per frame
    const interval = setInterval(() => {
      setPlayerPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < speed) {
          setIsMoving(false);
          return targetPos;
        }

        const ratio = speed / dist;
        return {
          x: prev.x + dx * ratio,
          y: prev.y + dy * ratio
        };
      });
    }, 30); // roughly 30fps

    return () => clearInterval(interval);
  }, [isMoving, targetPos]);

  // Check NPC proximity
  useEffect(() => {
    if (!isMoving) {
      // Find nearby NPC
      const nearbyNpc = npcs.find(npc => {
        const dx = npc.x - playerPos.x;
        const dy = npc.y - playerPos.y;
        return Math.sqrt(dx * dx + dy * dy) < 8; // proximity threshold
      });

      if (nearbyNpc && !activeDialogue) {
         // Auto-talk if close enough and stopped
         setActiveDialogue({ id: nearbyNpc.id, text: nearbyNpc.text });
         setNpcsTalkedTo(prev => ({ ...prev, [nearbyNpc.id]: true }));
      }
    }
  }, [isMoving, playerPos, npcs, activeDialogue]);

  // Check completion
  useEffect(() => {
    if (Object.keys(npcsTalkedTo).length === npcs.length && onComplete) {
      onComplete();
    }
  }, [npcsTalkedTo, npcs.length, onComplete]);

  return (
    <div className="w-full h-full bg-[#1a1a2e] relative flex items-center justify-center font-mono select-none overflow-hidden" style={{ imageRendering: "pixelated" }}>
      
      {/* The 2D Map */}
      <div 
         ref={mapRef}
         className="w-full max-w-2xl aspect-square relative bg-[#2a9d8f] cursor-crosshair overflow-hidden border-4 border-[#264653] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
         onClick={handleMapClick}
         style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"
         }}
      >
         
         {/* Simple Environment Decor (Trees/Houses) */}
         <div className="absolute top-[10%] left-[10%] w-[15%] h-[15%] bg-[#264653] rounded" />
         <div className="absolute top-[15%] left-[60%] w-[20%] h-[15%] bg-[#264653] rounded" />
         <div className="absolute top-[60%] left-[20%] w-[10%] h-[10%] bg-[#264653] rounded-full" />
         <div className="absolute top-[75%] left-[70%] w-[12%] h-[12%] bg-[#264653] rounded-full" />

         {/* NPCs */}
         {npcs.map(npc => (
            <div 
               key={npc.id}
               className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
               style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
            >
               {/* NPC Sprite */}
               <div className="w-6 h-6 bg-red-400 rounded-sm border-2 border-red-900 shadow-sm" />
               <div className="absolute -top-6 text-yellow-300 animate-bounce">
                  {!npcsTalkedTo[npc.id] && <MessageSquare size={16} fill="currentColor" />}
               </div>
            </div>
         ))}

         {/* Player Character */}
         <div 
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ 
               left: `${playerPos.x}%`, 
               top: `${playerPos.y}%`,
               transform: `translate(-50%, -50%) scaleX(${facing === "left" ? -1 : 1})`
            }}
         >
            {/* Player Sprite */}
            <div className="w-6 h-6 bg-white rounded-sm border-2 border-blue-900 shadow-sm flex items-center justify-center relative">
               {/* Eyes */}
               <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full" />
               {isMoving && (
                  <div className="absolute -bottom-1 w-full h-1 bg-black/20 rounded-full blur-sm" />
               )}
            </div>
         </div>

         {/* Target Indicator */}
         {isMoving && (
            <div 
               className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 border-2 border-white/50 rounded-full animate-ping pointer-events-none"
               style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            />
         )}

         {/* Dialogue Box Overlay */}
         {activeDialogue && (
            <div className="absolute bottom-4 left-4 right-4 bg-blue-950 border-4 border-white p-4 text-white rounded shadow-xl z-50 animate-in fade-in slide-in-from-bottom-4">
               <p className="text-sm sm:text-base leading-relaxed mb-4">
                  {activeDialogue.text}
               </p>
               <div className="flex justify-end">
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        setActiveDialogue(null);
                     }}
                     className="px-4 py-1 bg-white text-blue-950 font-bold uppercase text-xs hover:bg-gray-200 active:scale-95"
                  >
                     Next ►
                  </button>
               </div>
            </div>
         )}
      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && Object.keys(npcsTalkedTo).length < npcs.length && (
         <div className="absolute top-4 right-4 z-50">
            <button 
               onClick={() => {
                  const all = npcs.reduce((acc, npc) => ({...acc, [npc.id]: true}), {});
                  setNpcsTalkedTo(all);
                  if (onComplete) onComplete();
               }}
               className="bg-white/10 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Auto-Complete (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
