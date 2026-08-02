"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, DollarSign } from "lucide-react";

type Debt = {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
};

export function DebtSnowball({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9"; // sky-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0f9ff"]; // sky-50

  const [debts, setDebts] = useState<Debt[]>([
    { id: "d1", name: "Credit Card", balance: 500, initialBalance: 500 },
    { id: "d2", name: "Car Loan", balance: 3000, initialBalance: 3000 },
    { id: "d3", name: "Student Loan", balance: 10000, initialBalance: 10000 },
  ]);

  const [paymentAmount, setPaymentAmount] = useState(100);

  const activeDebts = debts.filter(d => d.balance > 0);
  const smallestDebt = activeDebts[0]; // Assuming ordered small to large

  const handlePay = () => {
     if (!smallestDebt) return;

     setDebts(prev => {
        let remainingPayment = paymentAmount;
        const next = [...prev];

        for (let i = 0; i < next.length; i++) {
           if (next[i].balance > 0 && remainingPayment > 0) {
              const toPay = Math.min(next[i].balance, remainingPayment);
              next[i].balance -= toPay;
              remainingPayment -= toPay;

              if (next[i].balance === 0) {
                 if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 200]);
              } else {
                 if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
              }
           }
        }
        
        // If all paid off
        if (next.every(d => d.balance === 0) && onComplete) {
           setTimeout(onComplete, 4000);
        }

        return next;
     });
  };

  // Calculate sizes relative to screen (max size for 10k)
  const getSnowballSize = (balance: number) => {
     const minSize = 40;
     const maxSize = 250;
     const maxBalance = 10000;
     
     if (balance === 0) return 0;
     
     const scale = Math.sqrt(balance / maxBalance); // Square root for area scaling
     return Math.max(minSize, scale * maxSize);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-sky-50 text-sky-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Snowy Background */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-sky-100 to-sky-200" />
      
      {/* Falling Snow Effect (Simple CSS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay">
         {Array.from({ length: 20 }).map((_, i) => (
            <motion.div 
               key={i}
               className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
               initial={{ top: -10, left: `${Math.random() * 100}%`, opacity: Math.random() }}
               animate={{ top: "100%", left: `${Math.random() * 100}%` }}
               transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
            />
         ))}
      </div>

      <div className="p-6 text-center z-10 flex flex-col items-center">
         <div className="bg-white p-3 rounded-full shadow-lg text-sky-500 mb-2">
            <Snowflake size={24} />
         </div>
         <h2 className="text-xl font-black uppercase tracking-widest text-sky-800">Debt Snowball</h2>
         <p className="text-xs text-sky-600 mt-1 font-medium">Knock out the smallest first. Roll the momentum.</p>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-end pb-24 z-10">
         
         <div className="flex items-end justify-center gap-4 px-6 w-full h-[300px] relative">
            <AnimatePresence>
               {debts.map((d, index) => {
                  const size = getSnowballSize(d.balance);
                  const isPaid = d.balance === 0;
                  
                  // If paid, it logically "merges" into the next one by moving to its position and disappearing
                  // We simulate this by animating its scale to 0 and moving it right
                  
                  return (
                     <motion.div
                        key={d.id}
                        layout
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ 
                           width: size, 
                           height: size,
                           opacity: isPaid ? 0 : 1,
                           scale: isPaid ? 0 : 1,
                           x: isPaid ? 50 : 0 // Roll right into next
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                        className={`bg-white rounded-full flex flex-col items-center justify-center text-center relative ${isPaid ? 'pointer-events-none' : 'shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),_0_10px_20px_rgba(14,165,233,0.2)]'}`}
                     >
                        {!isPaid && size > 60 && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-1">{d.name}</span>
                              <span className="text-lg font-black text-sky-700">${d.balance}</span>
                           </motion.div>
                        )}
                        {!isPaid && size <= 60 && size > 0 && (
                           <span className="text-[10px] font-black text-sky-700">${d.balance}</span>
                        )}
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>

         {activeDebts.length === 0 && (
            <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-sky-600 px-8 py-4 rounded-full shadow-2xl font-black text-3xl uppercase tracking-widest whitespace-nowrap"
            >
               Debt Free!
            </motion.div>
         )}

      </div>

      <div className="p-6 bg-white/80 backdrop-blur-md z-20 border-t border-sky-100 flex gap-4">
         <div className="flex items-center bg-sky-50 border border-sky-200 rounded-xl px-4 w-1/3">
            <DollarSign size={16} className="text-sky-500" />
            <input 
               type="number" 
               value={paymentAmount} 
               onChange={e => setPaymentAmount(Number(e.target.value))}
               className="w-full bg-transparent outline-none text-lg font-black text-sky-900 py-4"
            />
         </div>
         <button 
            onClick={handlePay}
            disabled={activeDebts.length === 0}
            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
               activeDebts.length === 0 ? 'bg-sky-200 text-sky-400' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] active:scale-95'
            }`}
         >
            Make Payment
         </button>
      </div>

    </div>
  );
}
