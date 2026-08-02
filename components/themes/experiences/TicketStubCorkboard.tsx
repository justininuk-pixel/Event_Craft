"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit3, MapPin } from "lucide-react";

type Ticket = {
   id: string;
   frontImg: string;
   backText: string;
   x: number; // initial x offset %
   y: number; // initial y offset %
   rotation: number;
};

const defaultTickets: Ticket[] = [
   { 
      id: "1", 
      frontImg: "https://images.unsplash.com/photo-1541086082042-4911029c7875?q=80&w=400&auto=format&fit=crop", 
      backText: "My very first concert. We waited in line for 4 hours just to get to the front row. Unforgettable.",
      x: 10, y: 15, rotation: -5
   },
   { 
      id: "2", 
      frontImg: "https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=400&auto=format&fit=crop", 
      backText: "The summer festival where it rained all weekend. Mud everywhere, but best weekend ever.",
      x: 50, y: 40, rotation: 12
   },
   { 
      id: "3", 
      frontImg: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop", 
      backText: "Front row symphony seats for our anniversary.",
      x: 20, y: 60, rotation: -8
   },
];

export function TicketStubCorkboard({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#d97706"]; // amber-600 (cork color)
  
  const [tickets, setTickets] = useState<Ticket[]>((config.experience as any)?.tickets || defaultTickets);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track dragging state to prevent flip on drag end
  const isDragging = useRef(false);

  const handleTicketClick = (id: string) => {
     if (isDragging.current) return;
     setFlippedId(flippedId === id ? null : id);
     
     // Only trigger complete when they flip the last unexplored ticket, 
     // but for simplicity, trigger if they flip any ticket to the back.
     if (onComplete && flippedId !== id) {
        // Debounced complete to let them read
        setTimeout(onComplete, 4000);
     }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-amber-950 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Corkboard Texture */}
      <div 
         className="absolute inset-0 opacity-80 pointer-events-none mix-blend-multiply"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Corkboard Frame */}
      <div className="absolute inset-0 border-[16px] border-[#3e2723] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none z-30" />

      {/* Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center bg-white/10 px-6 py-2 rounded shadow-sm backdrop-blur-sm border border-white/20">
         <h2 className="text-2xl font-black uppercase tracking-widest text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {config.title || "Ticket Stubs"}
         </h2>
         <p className="text-amber-100/70 text-xs mt-1 drop-shadow-md">
            Drag to rearrange. Tap to flip and read memories.
         </p>
      </div>

      {/* Tickets Area */}
      <div className="absolute inset-4 z-10 overflow-hidden">
         {tickets.map((ticket) => {
            const isFlipped = flippedId === ticket.id;

            return (
               <motion.div
                  key={ticket.id}
                  drag
                  dragConstraints={containerRef}
                  dragElastic={0.1}
                  onDragStart={() => { isDragging.current = true; }}
                  onDragEnd={() => { setTimeout(() => isDragging.current = false, 100); }}
                  initial={{ 
                     x: `${ticket.x}vw`, 
                     y: `${ticket.y}vh`, 
                     rotate: ticket.rotation 
                  }}
                  whileDrag={{ scale: 1.05, zIndex: 50, rotate: 0 }}
                  className="absolute w-48 aspect-[1/2] sm:aspect-video sm:w-64 cursor-grab active:cursor-grabbing"
                  style={{ perspective: "1000px" }}
               >
                  
                  {/* Push Pin (Decorative) */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-red-600 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.5),2px_5px_5px_rgba(0,0,0,0.5)] flex justify-center border border-red-800">
                     <div className="w-1 h-1 bg-white/50 rounded-full mt-0.5 ml-1" />
                  </div>

                  <motion.div
                     className="w-full h-full relative"
                     style={{ transformStyle: "preserve-3d" }}
                     animate={{ rotateY: isFlipped ? 180 : 0 }}
                     transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                     onClick={() => handleTicketClick(ticket.id)}
                  >
                     
                     {/* Front of Ticket */}
                     <div 
                        className="absolute inset-0 w-full h-full backface-hidden bg-white shadow-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200"
                        style={{ backfaceVisibility: "hidden" }}
                     >
                        <img 
                           src={ticket.frontImg} 
                           alt="Ticket Stub" 
                           className="w-full h-full object-cover opacity-90 sepia-[0.3]"
                        />
                        {/* Fake perforated edge decoration */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 border-r-2 border-dashed border-black/20" />
                     </div>

                     {/* Back of Ticket */}
                     <div 
                        className="absolute inset-0 w-full h-full backface-hidden bg-[#fdfbf7] shadow-xl p-4 flex flex-col border border-slate-300"
                        style={{ 
                           backfaceVisibility: "hidden", 
                           transform: "rotateY(180deg)",
                           backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
                           backgroundSize: "10px 10px"
                        }}
                     >
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-slate-200 text-slate-400">
                           <Edit3 size={16} />
                           <span className="font-marker handwriting text-lg">Memory</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                           <p className="font-marker handwriting text-slate-700 text-lg leading-relaxed pt-1">
                              {ticket.backText}
                           </p>
                        </div>

                        {mode === "editor-preview" && (
                           <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-sans uppercase">
                              <span>Drag to move</span>
                              <span>Tap to flip</span>
                           </div>
                        )}
                     </div>

                  </motion.div>
               </motion.div>
            );
         })}
      </div>

    </div>
  );
}
