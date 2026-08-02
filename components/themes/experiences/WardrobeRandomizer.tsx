"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, Box, Footprints, Lock, Unlock, Shuffle, Smartphone } from "lucide-react";

type ClothingItem = { id: string; name: string; icon: React.ReactNode; color: string };

export function WardrobeRandomizer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f43f5e"; // rose-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fff1f2"]; // rose-50

  const shirts: ClothingItem[] = [
     { id: "s1", name: "Red Flannel", icon: <Shirt size={48} />, color: "#ef4444" },
     { id: "s2", name: "White Tee", icon: <Shirt size={48} />, color: "#f8fafc" },
     { id: "s3", name: "Denim Jacket", icon: <Shirt size={48} />, color: "#3b82f6" },
     { id: "s4", name: "Black Hoodie", icon: <Shirt size={48} />, color: "#1e293b" },
     { id: "s5", name: "Green Sweater", icon: <Shirt size={48} />, color: "#22c55e" }
  ];

  const pants: ClothingItem[] = [
     { id: "p1", name: "Blue Jeans", icon: <Box size={48} />, color: "#2563eb" },
     { id: "p2", name: "Black Chinos", icon: <Box size={48} />, color: "#0f172a" },
     { id: "p3", name: "Khaki Shorts", icon: <Box size={48} />, color: "#d97706" },
     { id: "p4", name: "Grey Sweats", icon: <Box size={48} />, color: "#64748b" },
     { id: "p5", name: "Olive Cargos", icon: <Box size={48} />, color: "#4d7c0f" }
  ];

  const shoes: ClothingItem[] = [
     { id: "f1", name: "White Sneakers", icon: <Footprints size={48} />, color: "#ffffff" },
     { id: "f2", name: "Brown Boots", icon: <Footprints size={48} />, color: "#a16207" },
     { id: "f3", name: "Black Loafers", icon: <Footprints size={48} />, color: "#1e293b" },
     { id: "f4", name: "Red High-Tops", icon: <Footprints size={48} />, color: "#b91c1c" },
     { id: "f5", name: "Running Shoes", icon: <Footprints size={48} />, color: "#14b8a6" }
  ];

  const [topIdx, setTopIdx] = useState(0);
  const [botIdx, setBotIdx] = useState(0);
  const [shoeIdx, setShoeIdx] = useState(0);

  const [locks, setLocks] = useState({ top: false, bot: false, shoe: false });
  const [isSpinning, setIsSpinning] = useState(false);

  // Device Shake Detection
  useEffect(() => {
     let lastX = 0, lastY = 0, lastZ = 0;
     let lastUpdate = 0;
     const SHAKE_THRESHOLD = 15;

     const handleDeviceMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;
        
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;

        const currentTime = new Date().getTime();
        
        if ((currentTime - lastUpdate) > 100) {
           const diffTime = (currentTime - lastUpdate);
           lastUpdate = currentTime;

           const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
           
           if (speed > SHAKE_THRESHOLD) {
              triggerRandomize();
           }

           lastX = x; lastY = y; lastZ = z;
        }
     };

     if (typeof window !== "undefined" && (window as any).DeviceMotionEvent) {
        window.addEventListener("devicemotion", handleDeviceMotion, false);
     }

     return () => {
        if (typeof window !== "undefined" && (window as any).DeviceMotionEvent) {
           window.removeEventListener("devicemotion", handleDeviceMotion, false);
        }
     };
  }, [locks]); // Re-bind if locks change so the closure has fresh state

  const triggerRandomize = () => {
     if (isSpinning) return;
     setIsSpinning(true);

     // Spin effect
     let spins = 0;
     const maxSpins = 10;
     
     const spinInterval = setInterval(() => {
        if (!locks.top) setTopIdx(Math.floor(Math.random() * shirts.length));
        if (!locks.bot) setBotIdx(Math.floor(Math.random() * pants.length));
        if (!locks.shoe) setShoeIdx(Math.floor(Math.random() * shoes.length));
        
        spins++;
        if (spins >= maxSpins) {
           clearInterval(spinInterval);
           setIsSpinning(false);
           if (onComplete) onComplete();
        }
     }, 100);
  };

  const toggleLock = (section: 'top' | 'bot' | 'shoe') => {
     setLocks(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSlot = (item: ClothingItem, isLocked: boolean, section: 'top' | 'bot' | 'shoe') => (
     <div className="relative group w-full h-32 md:h-40 bg-white rounded-3xl shadow-md border-2 border-slate-100 flex items-center p-4 overflow-hidden mb-4">
        
        {/* Item Content */}
        <AnimatePresence mode="popLayout">
           <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: isSpinning ? -50 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isSpinning ? 50 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center gap-6"
           >
              <div 
                 className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-inner"
                 style={{ backgroundColor: item.color }}
              >
                 {item.icon}
              </div>
              <div className="flex-1 text-left hidden sm:block">
                 <h3 className="font-black text-xl text-slate-800">{item.name}</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    {section === 'top' ? 'Top' : section === 'bot' ? 'Bottom' : 'Footwear'}
                 </p>
              </div>
           </motion.div>
        </AnimatePresence>

        {/* Lock Button */}
        <button 
           onClick={() => toggleLock(section)}
           className={`absolute right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isLocked 
                 ? 'bg-slate-800 text-white hover:bg-slate-700' 
                 : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
           }`}
        >
           {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        </button>

     </div>
  );

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 bg-slate-50"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Header */}
      <div className="pt-8 px-6 pb-4 flex flex-col items-center text-center">
         <h2 className="text-3xl font-black tracking-tight mb-2 uppercase" style={{ color: primaryColor }}>
            {config.title || "The Wardrobe"}
         </h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-[200px] flex items-center justify-center gap-2">
            <Smartphone size={14} /> Shake device to randomize
         </p>
      </div>

      {/* Main Slots Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-md mx-auto">
         {renderSlot(shirts[topIdx], locks.top, 'top')}
         {renderSlot(pants[botIdx], locks.bot, 'bot')}
         {renderSlot(shoes[shoeIdx], locks.shoe, 'shoe')}
      </div>

      {/* Manual Randomize Button (for desktop / no shake) */}
      <div className="p-6 w-full max-w-md mx-auto">
         <button
            onClick={triggerRandomize}
            disabled={isSpinning}
            className={`w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${
               isSpinning ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'
            }`}
            style={{ backgroundColor: primaryColor }}
         >
            <Shuffle size={20} /> {isSpinning ? 'Randomizing...' : 'Shuffle Outfit'}
         </button>
      </div>

    </div>
  );
}
