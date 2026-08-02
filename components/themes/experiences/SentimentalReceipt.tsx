"use client";

import React, { useEffect, useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

type LineItem = {
   item: string;
   cost: string;
};

const defaultItems: LineItem[] = [
   { item: "2x Black Coffee", cost: "$8.50" },
   { item: "Shared Pastry", cost: "$4.00" },
   { item: "Nervous Laughter", cost: "$0.00" },
   { item: "Holding Hands", cost: "Priceless" },
   { item: "Late Train Ride Home", cost: "$2.75" },
];

export function SentimentalReceipt({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const items = (config.experience as any)?.items || defaultItems;
  const storeName = config.title || "First Date";
  const dateStr = (config as any).date || "10/24/2018 19:42";
  const footerText = config.body || "TOTAL: Incalculable";

  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
     // Trigger complete when animation finishes
     const t = setTimeout(() => {
        setIsPrinting(false);
        if (onComplete) onComplete();
     }, 3000);
     return () => clearTimeout(t);
  }, []);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-black touch-none select-none items-center justify-start p-4 pt-12"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Receipt Printer Slot */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-slate-800 border-b border-black shadow-[0_5px_10px_rgba(0,0,0,0.5)] z-20 flex justify-center items-end pb-1">
         <div className="w-64 h-1 bg-black rounded-full shadow-inner opacity-50" />
      </div>

      {/* The Receipt */}
      <motion.div 
         initial={{ y: -500, opacity: 0.5 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 2.5, ease: "easeOut" }}
         className="relative w-full max-w-[280px] bg-[#fdfcfa] z-10 flex flex-col pt-8 pb-12 px-6 shadow-2xl"
         style={{
            // Thermal paper texture
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
         }}
      >
         
         {/* Store Header */}
         <div className="text-center font-mono uppercase tracking-widest border-b-2 border-dashed border-black/30 pb-4 mb-4">
            <h2 className="text-2xl font-bold mb-1 tracking-tighter">*** {storeName} ***</h2>
            <p className="text-xs text-black/60">Date: {dateStr}</p>
            <p className="text-[10px] text-black/40 mt-1">Transaction ID: 90210-42</p>
         </div>

         {/* Line Items */}
         <div className="flex flex-col gap-3 font-mono text-sm border-b-2 border-dashed border-black/30 pb-6 mb-4">
            {items.map((item: LineItem, idx: number) => (
               <div key={idx} className="flex justify-between items-end gap-4 w-full">
                  <span className="uppercase text-black/80 flex-1 border-b border-dotted border-black/20 leading-tight">
                     {item.item}
                  </span>
                  <span className="font-bold whitespace-nowrap">
                     {item.cost}
                  </span>
               </div>
            ))}
         </div>

         {/* Footer */}
         <div className="text-center font-mono uppercase tracking-widest mt-2">
            <h3 className="text-xl font-bold border-y-4 border-black/80 py-2 mb-6">
               {footerText}
            </h3>
            
            <p className="text-[10px] text-black/50 mb-4 leading-relaxed">
               Returns are not accepted.<br/>
               Memories are final sale.
            </p>

            {/* Barcode Mock */}
            <div className="w-full flex justify-center mt-6 h-12 opacity-80 mix-blend-multiply">
               <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full fill-black">
                  <rect x="0" y="0" width="2" height="20" />
                  <rect x="4" y="0" width="1" height="20" />
                  <rect x="7" y="0" width="3" height="20" />
                  <rect x="12" y="0" width="1" height="20" />
                  <rect x="15" y="0" width="2" height="20" />
                  <rect x="19" y="0" width="4" height="20" />
                  <rect x="25" y="0" width="1" height="20" />
                  <rect x="28" y="0" width="2" height="20" />
                  <rect x="32" y="0" width="1" height="20" />
                  <rect x="35" y="0" width="3" height="20" />
                  <rect x="40" y="0" width="1" height="20" />
                  <rect x="44" y="0" width="4" height="20" />
                  <rect x="50" y="0" width="2" height="20" />
                  <rect x="54" y="0" width="1" height="20" />
                  <rect x="58" y="0" width="3" height="20" />
                  <rect x="63" y="0" width="1" height="20" />
                  <rect x="66" y="0" width="2" height="20" />
                  <rect x="70" y="0" width="1" height="20" />
                  <rect x="73" y="0" width="4" height="20" />
                  <rect x="79" y="0" width="1" height="20" />
                  <rect x="82" y="0" width="2" height="20" />
                  <rect x="86" y="0" width="3" height="20" />
                  <rect x="91" y="0" width="1" height="20" />
                  <rect x="95" y="0" width="2" height="20" />
                  <rect x="99" y="0" width="1" height="20" />
               </svg>
            </div>
         </div>

         {/* Jagged Bottom Edge */}
         <div 
            className="absolute -bottom-2 left-0 right-0 h-4 w-full bg-[#fdfcfa]"
            style={{
               clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%, 100% 0%, 0% 0%)",
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            }}
         />
      </motion.div>

    </div>
  );
}
