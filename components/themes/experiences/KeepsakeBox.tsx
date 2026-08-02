"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Shell, Gem, Book, X } from "lucide-react";

export function KeepsakeBox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#92400e"; // amber-800
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#27272a"]; // zinc-800

  const [boxOpen, setBoxOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Parse custom features or use defaults
  const items = ((config.experience as any)?.items) || [
     { id: 1, type: "ticket", title: "First Movie", text: "We saw that awful sci-fi movie and laughed the whole time." },
     { id: 2, type: "shell", title: "Beach Day", text: "Found this shell on our trip to the coast." },
     { id: 3, type: "ring", title: "The Promise", text: "A cheap plastic ring from the arcade, but it meant everything." },
     { id: 4, type: "book", title: "That Book", text: "You read the first chapter to me before I fell asleep." }
  ];

  const renderIcon = (type: string, size = 40) => {
     switch(type) {
        case 'ticket': return <Ticket size={size} />;
        case 'shell': return <Shell size={size} />;
        case 'ring': return <Gem size={size} />;
        case 'book': return <Book size={size} />;
        default: return <Shell size={size} />;
     }
  };

  const handleItemClick = (e: React.MouseEvent, index: number) => {
     e.stopPropagation();
     setSelectedItem(index);
  };

  const handleCloseItem = () => {
     setSelectedItem(null);
     // Optional: complete experience after viewing an item
     if (onComplete && Math.random() > 0.5) {
        setTimeout(onComplete, 5000);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Scene Container with perspective */}
      <div 
         className="flex-1 flex items-center justify-center relative w-full h-full"
         style={{ perspective: "1000px" }}
      >
         
         {/* The Box */}
         <motion.div 
            className="relative w-64 h-48 cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ 
               rotateX: boxOpen ? 20 : 30,
               rotateY: boxOpen ? 0 : -10,
               y: boxOpen ? 20 : 0
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            onClick={() => !boxOpen && setBoxOpen(true)}
         >
            {/* Box Shadow */}
            <div className="absolute -bottom-10 left-4 right-4 h-8 bg-black/50 blur-xl rounded-full" />

            {/* Bottom/Inside of the box */}
            <div 
               className="absolute inset-0 shadow-inner"
               style={{ 
                  backgroundColor: '#3f200c', 
                  border: '12px solid #5c2c10',
                  transform: 'translateZ(-20px)' 
               }}
            >
               {/* Items inside */}
               {boxOpen && (
                  <div className="absolute inset-0 p-4 grid grid-cols-2 gap-4">
                     {items.map((item: any, idx: number) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 20, scale: 0.5 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           transition={{ delay: 0.3 + idx * 0.1 }}
                           onClick={(e) => handleItemClick(e, idx)}
                           className="flex items-center justify-center text-amber-300 hover:text-white hover:scale-110 transition-all cursor-pointer z-10"
                        >
                           {renderIcon(item.type)}
                        </motion.div>
                     ))}
                  </div>
               )}
            </div>

            {/* Front Wall */}
            <div 
               className="absolute inset-0 border-t-0"
               style={{ 
                  backgroundColor: primaryColor,
                  border: '4px solid #78350f',
                  transform: 'translateZ(20px) translateY(100px) rotateX(90deg)',
                  height: '40px',
                  transformOrigin: 'bottom'
               }}
            />
            {/* Left Wall */}
            <div 
               className="absolute inset-0"
               style={{ 
                  backgroundColor: '#78350f',
                  transform: 'translateX(-128px) translateZ(0px) rotateY(-90deg)',
                  width: '40px',
               }}
            />
            {/* Right Wall */}
            <div 
               className="absolute inset-0"
               style={{ 
                  backgroundColor: '#78350f',
                  transform: 'translateX(128px) translateZ(0px) rotateY(90deg)',
                  width: '40px',
                  left: 'auto', right: 0
               }}
            />

            {/* The Lid */}
            <motion.div 
               className="absolute inset-0 shadow-lg flex items-center justify-center"
               style={{ 
                  backgroundColor: primaryColor, 
                  border: '4px solid #78350f',
                  transformOrigin: 'top',
                  backfaceVisibility: 'hidden'
               }}
               animate={{ rotateX: boxOpen ? -110 : 0 }}
               transition={{ type: "spring", stiffness: 40, damping: 15 }}
            >
               {/* Label on the lid */}
               <div className="px-4 py-2 bg-amber-100/10 border border-amber-900/30 rounded text-amber-900/50 font-bold uppercase tracking-widest text-xs">
                  {config.title || "Memories"}
               </div>
            </motion.div>

         </motion.div>

         {/* Instructions */}
         {!boxOpen && (
            <motion.div 
               className="absolute bottom-20 text-white/50 font-bold uppercase tracking-widest text-xs"
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
            >
               Tap box to open
            </motion.div>
         )}

         {/* Selected Item Overlay (3D inspection mode) */}
         <AnimatePresence>
            {selectedItem !== null && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
                  onClick={handleCloseItem}
               >
                  <button 
                     className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                     onClick={handleCloseItem}
                  >
                     <X size={32} />
                  </button>

                  <motion.div 
                     initial={{ scale: 0, rotateY: -180 }}
                     animate={{ scale: 1, rotateY: 0 }}
                     exit={{ scale: 0, rotateY: 180 }}
                     transition={{ type: "spring", stiffness: 60, damping: 15 }}
                     className="text-white mb-12 flex items-center justify-center"
                     style={{ perspective: 1000 }}
                  >
                     {/* Rotate slowly for inspection */}
                     <motion.div
                        animate={{ rotateY: 360, rotateX: [0, 10, -10, 0] }}
                        transition={{ 
                           rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
                           rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                     >
                        {renderIcon(items[selectedItem].type, 120)}
                     </motion.div>
                  </motion.div>

                  <motion.div 
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     className="bg-white rounded-2xl p-6 text-center max-w-sm shadow-2xl relative"
                  >
                     <h3 className="text-xl font-black text-slate-800 mb-2">
                        {items[selectedItem].title}
                     </h3>
                     <p className="text-slate-600 font-medium">
                        {items[selectedItem].text}
                     </p>
                  </motion.div>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
