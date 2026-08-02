"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, GripHorizontal } from "lucide-react";

type LineItem = {
  id: string;
  name: string;
  price: number;
};

type PlateData = {
  id: string;
  name: string;
  color: string;
  items: LineItem[];
};

export function SplitTheBillPlate({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const taxRate = 0.08;
  const tipRate = 0.20;

  const [unassigned, setUnassigned] = useState<LineItem[]>([
    { id: "i1", name: "Steak Frites", price: 42.00 },
    { id: "i2", name: "Vegan Burger", price: 24.00 },
    { id: "i3", name: "Truffle Fries", price: 12.00 },
    { id: "i4", name: "House Wine (3)", price: 36.00 },
  ]);

  const [plates, setPlates] = useState<PlateData[]>([
    { id: "p1", name: "Alex", color: "#3b82f6", items: [] },
    { id: "p2", name: "Sam", color: "#10b981", items: [] },
    { id: "p3", name: "Jordan", color: "#f59e0b", items: [] },
  ]);

  const [draggedItem, setDraggedItem] = useState<LineItem | null>(null);

  const handleDragStart = (item: LineItem, fromPlateId: string | null = null) => {
     setDraggedItem(item);
  };

  const handleDropOnPlate = (plateId: string) => {
     if (!draggedItem) return;
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);

     // Remove from unassigned
     setUnassigned(prev => prev.filter(i => i.id !== draggedItem.id));
     
     // Remove from any other plate
     setPlates(prev => prev.map(p => ({
        ...p,
        items: p.items.filter(i => i.id !== draggedItem.id)
     })));

     // Add to this plate
     setPlates(prev => prev.map(p => {
        if (p.id === plateId) {
           return { ...p, items: [...p.items, draggedItem] };
        }
        return p;
     }));

     setDraggedItem(null);
  };

  const handleDropOnUnassigned = () => {
     if (!draggedItem) return;
     
     // If it was already unassigned, do nothing. But if it came from a plate, move it back
     if (!unassigned.find(i => i.id === draggedItem.id)) {
        setUnassigned(prev => [...prev, draggedItem]);
        setPlates(prev => prev.map(p => ({
           ...p,
           items: p.items.filter(i => i.id !== draggedItem.id)
        })));
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
     }
     
     setDraggedItem(null);
  };

  // Prevent default to allow drop
  const onDragOver = (e: React.DragEvent) => {
     e.preventDefault();
  };

  const calculateSubtotal = (items: LineItem[]) => items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-slate-50 text-slate-800 p-4" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Table Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800&h=1200')] bg-cover bg-center" />

      <div className="text-center z-10 mb-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200">
         <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800 flex items-center justify-center gap-2">
            <Receipt size={24} className="text-slate-500" /> The Bill
         </h2>
         <p className="text-xs text-slate-500 mt-1 font-sans">Drag items to plates. Tax (8%) & Tip (20%) auto-split.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 relative z-10 overflow-hidden">
         
         {/* Unassigned Items (Receipt) */}
         <div 
            className="w-full md:w-1/3 bg-white shadow-xl rounded-b-sm rounded-t-sm border-t-8 border-slate-200 p-4 flex flex-col border border-x-slate-200 border-b-slate-200"
            style={{ filter: "drop-shadow(0 20px 13px rgb(0 0 0 / 0.05))" }}
            onDragOver={onDragOver}
            onDrop={handleDropOnUnassigned}
         >
            <div className="text-[10px] uppercase font-bold text-slate-400 text-center mb-4 border-b border-dashed border-slate-300 pb-2">Receipt</div>
            <div className="flex-1 overflow-y-auto space-y-2">
               {unassigned.map(item => (
                  <div 
                     key={item.id}
                     draggable
                     onDragStart={() => handleDragStart(item)}
                     className="bg-slate-50 p-3 rounded flex justify-between items-center cursor-grab active:cursor-grabbing border border-slate-100 hover:border-slate-300 transition-colors"
                  >
                     <GripHorizontal size={16} className="text-slate-300 mr-2" />
                     <span className="font-sans text-sm font-medium flex-1">{item.name}</span>
                     <span className="font-mono text-sm">${item.price.toFixed(2)}</span>
                  </div>
               ))}
               {unassigned.length === 0 && (
                  <div className="text-center text-xs text-slate-400 font-sans italic mt-8">All items assigned!</div>
               )}
            </div>
         </div>

         {/* Plates Area */}
         <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-fr">
            {plates.map((plate) => {
               const subtotal = calculateSubtotal(plate.items);
               const tax = subtotal * taxRate;
               const tip = subtotal * tipRate;
               const total = subtotal + tax + tip;

               return (
                  <div 
                     key={plate.id}
                     onDragOver={onDragOver}
                     onDrop={() => handleDropOnPlate(plate.id)}
                     className="bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 flex flex-col items-center justify-center relative shadow-sm"
                  >
                     <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest" style={{ color: plate.color }}>
                        {plate.name}
                     </div>

                     {/* The Physical Plate */}
                     <div 
                        className="w-32 h-32 rounded-full bg-white shadow-md border border-slate-100 flex flex-col items-center justify-center mt-4 p-4 overflow-hidden relative"
                        style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)" }}
                     >
                        <div className="absolute inset-2 rounded-full border border-slate-100/50 pointer-events-none" />
                        
                        <div className="flex flex-col gap-1 w-full text-center">
                           {plate.items.map(item => (
                              <div key={item.id} className="text-[10px] font-sans truncate px-2 text-slate-600 bg-slate-50 rounded">
                                 {item.name}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Totals */}
                     <div className="mt-4 w-full bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                        <div className="flex justify-between text-[10px] font-sans text-slate-500 mb-1">
                           <span>Subtotal</span>
                           <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-sans text-slate-400 mb-2 pb-2 border-b border-dashed border-slate-200">
                           <span>Tax & Tip</span>
                           <span>+${(tax+tip).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-sans font-bold">
                           <span>Total</span>
                           <span style={{ color: plate.color }}>${total.toFixed(2)}</span>
                        </div>
                     </div>

                  </div>
               );
            })}
         </div>

      </div>

    </div>
  );
}
