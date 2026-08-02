"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Monitor, BookOpen, Coffee, Box, Package, Move } from "lucide-react";

type RoomItem = {
   id: string;
   type: "bed" | "desk" | "shelf" | "box";
   name: string;
   memory: string;
   icon: React.ElementType;
   color: string;
};

const defaultInventory: RoomItem[] = [
   { id: "1", type: "bed", name: "My Old Bed", memory: "Where I spent hours reading and staring at the ceiling.", icon: Bed, color: "#3b82f6" }, // blue
   { id: "2", type: "desk", name: "Study Desk", memory: "The site of many late-night cram sessions.", icon: Monitor, color: "#10b981" }, // green
   { id: "3", type: "shelf", name: "Bookshelf", memory: "Filled with sci-fi novels I never actually finished.", icon: BookOpen, color: "#f59e0b" }, // amber
   { id: "4", type: "box", name: "Mystery Box", memory: "Just old cables and empty promises.", icon: Package, color: "#8b5cf6" }, // violet
];

export function IsometricRoomBuilder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e293b"]; // slate-800

  const inventory = (config.experience as any)?.inventory || defaultInventory;
  const gridSize = 4; // 4x4 grid

  const [placedItems, setPlacedItems] = useState<{ [cellId: string]: string }>({}); // cellId -> itemId
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeMemory, setActiveMemory] = useState<string | null>(null);

  const availableInventory = inventory.filter((item: RoomItem) => !Object.values(placedItems).includes(item.id));

  const handleCellClick = (cellId: string) => {
     // If clicking an empty cell while an item is selected from inventory
     if (selectedItem && !placedItems[cellId]) {
        setPlacedItems(prev => ({ ...prev, [cellId]: selectedItem }));
        setSelectedItem(null);
        setActiveMemory(null);
        
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
        
        // If all items placed, trigger complete
        if (Object.keys(placedItems).length + 1 === inventory.length && onComplete) {
           setTimeout(onComplete, 3000);
        }
     } 
     // If clicking a placed item
     else if (placedItems[cellId]) {
        const item = inventory.find((i: RoomItem) => i.id === placedItems[cellId]);
        if (item) {
           setActiveMemory(item.memory);
        }
     }
  };

  const handleRemove = (cellId: string) => {
     setPlacedItems(prev => {
        const next = { ...prev };
        delete next[cellId];
        return next;
     });
     setActiveMemory(null);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-100 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 z-50 pointer-events-none text-center">
         <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
            {config.title || "The Old Room"}
         </h2>
         <p className="text-white/60 text-sm mt-2 max-w-[250px] mx-auto">
            {config.body || "Reconstruct the room from memory to unlock the stories."}
         </p>
      </div>

      {/* 3D Isometric Viewport */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden mt-16 mb-32 z-10">
         
         <div 
            className="relative"
            style={{
               // The core isometric transformation
               transform: 'rotateX(60deg) rotateZ(-45deg)',
               transformStyle: 'preserve-3d',
               width: '240px',
               height: '240px',
            }}
         >
            {/* Floor Plane */}
            <div 
               className="absolute inset-0 grid shadow-[20px_20px_60px_rgba(0,0,0,0.5)] border-2 border-white/10 bg-slate-800/80"
               style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`,
               }}
            >
               {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                  const x = i % gridSize;
                  const y = Math.floor(i / gridSize);
                  const cellId = `${x}-${y}`;
                  const isHovered = selectedItem && !placedItems[cellId];
                  const itemId = placedItems[cellId];
                  const item = inventory.find((inv: RoomItem) => inv.id === itemId);

                  return (
                     <div 
                        key={cellId}
                        onClick={() => handleCellClick(cellId)}
                        className={`relative border border-white/5 transition-colors duration-200 cursor-pointer ${
                           isHovered ? 'hover:bg-white/20' : ''
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        
                        <AnimatePresence>
                           {item && (
                              <motion.div 
                                 initial={{ z: 100, opacity: 0 }}
                                 animate={{ z: 0, opacity: 1 }}
                                 exit={{ z: 50, opacity: 0 }}
                                 className="absolute inset-0 flex items-center justify-center group"
                                 style={{ 
                                    // Make the item stand up from the floor
                                    transform: 'rotateZ(45deg) rotateX(-90deg) translateY(-20px)',
                                    transformOrigin: 'bottom center',
                                 }}
                              >
                                 <div 
                                    className="w-16 h-16 flex items-center justify-center rounded-lg shadow-2xl relative"
                                    style={{ backgroundColor: item.color }}
                                 >
                                    <item.icon size={24} className="text-white drop-shadow-md" />
                                    
                                    {/* Remove button (only visible on hover/tap in real app, simplified here) */}
                                    <div 
                                       className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                       onClick={(e) => { e.stopPropagation(); handleRemove(cellId); }}
                                    >
                                       ×
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>

                     </div>
                  );
               })}
            </div>
            
            {/* Walls (Decorative) */}
            <div className="absolute top-0 left-0 w-full h-[120px] bg-slate-700/50 border border-white/10 origin-bottom shadow-inner" style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top' }} />
            <div className="absolute top-0 left-0 w-[120px] h-full bg-slate-600/50 border border-white/10 origin-right shadow-inner" style={{ transform: 'rotateY(90deg) translateX(-100%)', transformOrigin: 'left' }} />
         </div>

      </div>

      {/* Inventory & Memory Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-white/10 p-6 backdrop-blur-md rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         
         <AnimatePresence mode="wait">
            {activeMemory ? (
               <motion.div 
                  key="memory"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="w-full flex flex-col items-center text-center"
               >
                  <p className="font-serif italic text-lg leading-relaxed text-slate-200 mb-4 max-w-sm">
                     "{activeMemory}"
                  </p>
                  <button 
                     onClick={() => setActiveMemory(null)}
                     className="px-6 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                  >
                     Close
                  </button>
               </motion.div>
            ) : (
               <motion.div 
                  key="inventory"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
               >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                     <Box size={14} /> Inventory ({availableInventory.length} left)
                  </h3>
                  
                  {availableInventory.length > 0 ? (
                     <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                        {availableInventory.map((item: RoomItem) => (
                           <button
                              key={item.id}
                              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                              className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                                 selectedItem === item.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: item.color }}
                           >
                              <item.icon size={24} className="text-white" />
                           </button>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-slate-400 text-sm py-4">
                        All items placed.
                     </div>
                  )}

                  {selectedItem && (
                     <div className="mt-4 text-center text-xs font-bold text-amber-400 animate-pulse flex justify-center items-center gap-2">
                        <Move size={14} /> Tap a grid cell to place
                     </div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
