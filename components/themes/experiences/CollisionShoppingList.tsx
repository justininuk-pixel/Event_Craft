"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";

type Item = {
  id: string;
  name: string;
  checkedBy: "me" | "roommate" | null;
};

export function CollisionShoppingList({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [items, setItems] = useState<Item[]>([
     { id: "i1", name: "Almond Milk", checkedBy: null },
     { id: "i2", name: "Free-Range Eggs", checkedBy: null },
     { id: "i3", name: "Sourdough Bread", checkedBy: null },
     { id: "i4", name: "Avocados (3)", checkedBy: null },
     { id: "i5", name: "Coffee Beans", checkedBy: null },
  ]);

  const [collisionTarget, setCollisionTarget] = useState<string | null>(null);
  
  // Track roommate action intent
  const roommateIntentRef = useRef<{ id: string, timestamp: number } | null>(null);

  // Simulate remote roommate interacting
  useEffect(() => {
     const interval = setInterval(() => {
        const unchecked = items.filter(i => !i.checkedBy);
        if (unchecked.length > 0 && Math.random() > 0.5) {
           // Roommate targets a random item
           const target = unchecked[Math.floor(Math.random() * unchecked.length)];
           roommateIntentRef.current = { id: target.id, timestamp: performance.now() };
           
           // If we don't collide within 600ms, roommate successfully checks it
           setTimeout(() => {
              if (roommateIntentRef.current?.id === target.id) {
                 setItems(prev => prev.map(i => i.id === target.id && !i.checkedBy ? { ...i, checkedBy: "roommate" } : i));
                 roommateIntentRef.current = null;
                 if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
              }
           }, 600);
        }
     }, 3000); // Roommate checks an item every 3 seconds

     return () => clearInterval(interval);
  }, [items]);

  const handleCheck = (id: string) => {
     const now = performance.now();
     const intent = roommateIntentRef.current;

     if (intent && intent.id === id && now - intent.timestamp < 600) {
        // COLLISION! We both tried to check it at the same time
        setCollisionTarget(id);
        roommateIntentRef.current = null;
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        
        setTimeout(() => {
           setCollisionTarget(null);
           // After collision, nobody gets it, or it remains unchecked
        }, 2000);
        return;
     }

     // Success
     setItems(prev => prev.map(i => i.id === id ? { ...i, checkedBy: "me" } : i));
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  };

  const isComplete = items.every(i => i.checkedBy);
  useEffect(() => {
     if (isComplete && onComplete) {
        setTimeout(onComplete, 3000);
     }
  }, [isComplete, onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-50 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-slate-200 bg-white">
         <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex justify-center items-center gap-2">
            <ShoppingCart size={24} className="text-emerald-500" /> Live Cart
         </h2>
         <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Roommate is active
         </p>
      </div>

      <div className="flex-1 relative p-6 w-full max-w-md mx-auto overflow-y-auto">
         
         <div className="space-y-4 relative">
            {/* Connection line */}
            <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 -z-10" />

            {items.map((item) => {
               const isCollision = collisionTarget === item.id;
               
               return (
                  <motion.div 
                     key={item.id}
                     animate={isCollision ? { x: [-10, 10, -10, 10, 0], backgroundColor: "#fee2e2", borderColor: "#ef4444" } : { backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}
                     transition={isCollision ? { duration: 0.4 } : { duration: 0.2 }}
                     className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all relative ${item.checkedBy ? 'opacity-50 grayscale' : 'hover:border-slate-300'}`}
                  >
                     <button 
                        onClick={() => !item.checkedBy && handleCheck(item.id)}
                        disabled={!!item.checkedBy}
                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                           item.checkedBy === "me" ? 'bg-emerald-500 border-emerald-500 text-white' : 
                           item.checkedBy === "roommate" ? 'bg-blue-500 border-blue-500 text-white' : 
                           isCollision ? 'bg-red-500 border-red-500 text-white' :
                           'border-slate-300 bg-slate-50 hover:bg-slate-100'
                        }`}
                     >
                        {item.checkedBy && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2 h-2 bg-white rounded-full" />}
                     </button>
                     
                     <span className={`font-bold text-sm ${item.checkedBy ? 'line-through text-slate-400' : 'text-slate-700'} ${isCollision ? 'text-red-700' : ''}`}>
                        {item.name}
                     </span>

                     <div className="flex-1 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {item.checkedBy === "me" && <span className="text-emerald-500">You got it</span>}
                        {item.checkedBy === "roommate" && <span className="text-blue-500">Alex got it</span>}
                     </div>

                     {/* Collision Overlay Alert */}
                     <AnimatePresence>
                        {isCollision && (
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.5, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded shadow-xl flex items-center gap-1 whitespace-nowrap z-20"
                           >
                              <Zap size={12} className="text-yellow-300" />
                              Collision! Both grabbed!
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </motion.div>
               )
            })}
         </div>

      </div>

    </div>
  );
}
