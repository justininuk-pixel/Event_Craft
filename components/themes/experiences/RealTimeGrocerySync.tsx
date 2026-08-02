"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Wifi, WifiOff } from "lucide-react";

type GroceryItem = {
  id: string;
  text: string;
  completed: boolean;
};

export function RealTimeGrocerySync({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const fallbackItems = ["Milk", "Eggs", "Bread", "Coffee", "Apples"];
  const sourceItems = config.body ? config.body.split("\n").filter(Boolean) : fallbackItems;

  const initialItems: GroceryItem[] = sourceItems.map((text, i) => ({
     id: `item_${i}`,
     text,
     completed: false
  }));

  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  // Check completion
  useEffect(() => {
     if (items.length > 0 && items.every(item => item.completed)) {
        if (onComplete) onComplete();
     }
  }, [items, onComplete]);

  const toggleItem = (id: string) => {
     setItems(prev => prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
     ));
  };

  const addItem = (e: React.FormEvent) => {
     e.preventDefault();
     if (!newItemText.trim()) return;
     
     const newItem: GroceryItem = {
        id: `item_${Date.now()}`,
        text: newItemText.trim(),
        completed: false
     };
     
     setItems(prev => [...prev, newItem]);
     setNewItemText("");
  };

  const deleteItem = (id: string) => {
     setItems(prev => prev.filter(item => item.id !== id));
  };

  const simulatePartnerUpdate = () => {
     const incomplete = items.filter(i => !i.completed);
     if (incomplete.length > 0) {
        // Randomly check off an item
        const randomItem = incomplete[Math.floor(Math.random() * incomplete.length)];
        toggleItem(randomItem.id);
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center p-4 sm:p-8 font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Ambience */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} 
      />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full z-10 relative">
         
         {/* Header */}
         <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
               <h2 className="text-2xl font-bold tracking-tight">
                  {config.title || "Shared List"}
               </h2>
               <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  {isConnected ? (
                     <><Wifi size={14} className="text-green-500" /> Synced across devices</>
                  ) : (
                     <><WifiOff size={14} className="text-red-500" /> Offline mode</>
                  )}
               </p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-blue-500/20">
               <span className="text-blue-600 font-bold text-sm">US</span>
            </div>
         </div>

         {/* List Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
               {items.length === 0 && (
                  <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     className="text-center p-8 text-slate-400 italic"
                  >
                     List is empty. Add something below.
                  </motion.div>
               )}
               
               {items.map(item => (
                  <motion.div
                     key={item.id}
                     layout
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className={`group flex items-center justify-between p-4 rounded-xl border ${item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'} transition-colors duration-200`}
                  >
                     <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                     >
                        {/* Checkbox */}
                        <div 
                           className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-300 ${item.completed ? 'text-white' : 'border-2 border-slate-300'}`}
                           style={{ backgroundColor: item.completed ? primaryColor : 'transparent' }}
                        >
                           {item.completed && <Check size={16} strokeWidth={3} />}
                        </div>
                        
                        {/* Text */}
                        <span className={`text-lg transition-all duration-300 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                           {item.text}
                        </span>
                     </div>

                     {/* Delete Button */}
                     <button 
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         {/* Add Item Input */}
         <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={addItem} className="relative">
               <input 
                  type="text"
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  placeholder="Add an item..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:border-transparent text-slate-700"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
               />
               <button 
                  type="submit"
                  disabled={!newItemText.trim()}
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: primaryColor }}
               >
                  <Plus size={20} />
               </button>
            </form>
         </div>
      </div>

      {/* Editor Bypass / Simulation Controls */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
            <button 
               onClick={simulatePartnerUpdate}
               className="bg-black/80 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/90 shadow-lg"
            >
               Simulate Partner Check
            </button>
            <button 
               onClick={() => setIsConnected(!isConnected)}
               className="bg-black/80 text-white backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/90 shadow-lg"
            >
               Toggle Connection
            </button>
         </div>
      )}

    </div>
  );
}
