"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, UtensilsCrossed, Loader2 } from "lucide-react";

export function AISommelier({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1c1917"]; // stone-900

  const [food, setFood] = useState("");
  const [isPairing, setIsPairing] = useState(false);
  const [pairing, setPairing] = useState<{wine: string, reasoning: string} | null>(null);

  const handlePair = (e: React.FormEvent) => {
     e.preventDefault();
     if (!food.trim() || isPairing) return;
     
     setIsPairing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM generation parsing junk food into high-end wine pairing
     setTimeout(() => {
        let wine = "NV Billecart-Salmon Brut Rosé";
        let reasoning = "The austere effervescence and subtle notes of wild strawberry provide a necessary foil to the pedestrian chaos of your meal. The bubbles act as a palate cleanser, aggressively scrubbing the unrefined fats from your tongue, elevating an otherwise tragic culinary choice.";

        const lower = food.toLowerCase();
        if (lower.includes("dorito") || lower.includes("spicy") || lower.includes("chip")) {
           wine = "2018 J.J. Prüm Wehlener Sonnenuhr Riesling Kabinett";
           reasoning = "To combat the aggressive, engineered capsaicin heat and dense corn-dust of the Dorito, we must turn to the Mosel. The residual sugar of this Riesling Kabinett acts as a fire blanket against the spice, while the laser-sharp acidity cuts directly through the industrial fats, creating an exquisite tension on the mid-palate.";
        } else if (lower.includes("hot dog") || lower.includes("burger") || lower.includes("meat")) {
           wine = "2015 Domaine Tempier Bandol Rouge";
           reasoning = "A hot dog is a triumph of industrialized meat. To honor this, we demand the rugged, animalistic Mourvèdre from Bandol. Its notes of dried blood, saddle leather, and dark bramble fruit perfectly echo the aggressive sodium and char of the sausage, elevating the nitrate-heavy meat into the realm of the sublime.";
        } else if (lower.includes("cereal") || lower.includes("milk") || lower.includes("sweet")) {
           wine = "1998 Château d'Yquem Sauternes";
           reasoning = "When confronted with infantile carbohydrates drowning in homogenized lactose, one must counter with absolute decadence. The profound botrytis notes of honey and saffron in the Yquem wrap themselves around the artificial sweetness of the cereal, mocking its simplicity while transforming the milk into liquid gold.";
        }

        setPairing({ wine, reasoning });
        setIsPairing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-stone-900 text-stone-300" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 flex justify-between items-center z-10 shrink-0">
         <div className="flex flex-col">
            <h2 className="text-xl font-normal text-stone-100 flex items-center gap-3">
               <Wine size={20} className="text-red-900" /> Le Sommelier Numérique
            </h2>
            <div className="text-[9px] uppercase tracking-[0.3em] text-stone-500 font-sans mt-1">
               Associative Logic Retrieval
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col justify-center items-center relative">
         
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

         <AnimatePresence mode="wait">
            
            {!pairing && !isPairing && (
               <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg space-y-12 z-10">
                  <div className="text-center space-y-4">
                     <UtensilsCrossed size={32} className="mx-auto text-stone-700" />
                     <p className="text-lg italic text-stone-400">
                        Present the exact nature of your meal, no matter how unrefined. We shall find the perfect viticultural expression to accompany it.
                     </p>
                  </div>

                  <form onSubmit={handlePair} className="space-y-6">
                     <div className="relative">
                        <input 
                           type="text" 
                           value={food}
                           onChange={e => setFood(e.target.value)}
                           placeholder="e.g. Spicy Doritos and a hot dog"
                           className="w-full bg-transparent border-b border-stone-600 py-4 text-center text-xl text-stone-100 outline-none focus:border-red-900 transition-colors placeholder:text-stone-700"
                        />
                     </div>
                     <div className="flex justify-center">
                        <button 
                           type="submit"
                           disabled={!food.trim()}
                           className="px-12 py-3 border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-stone-100 disabled:opacity-30 disabled:hover:bg-transparent uppercase tracking-[0.2em] text-xs font-sans transition-all"
                        >
                           Request Pairing
                        </button>
                     </div>
                  </form>
               </motion.div>
            )}

            {isPairing && (
               <motion.div key="pairing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-6 z-10">
                  <Loader2 size={40} className="animate-spin text-red-900" />
                  <div className="text-center font-sans">
                     <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Consulting the Cellar</div>
                     <div className="text-[10px] uppercase tracking-widest text-stone-600">Cross-referencing chaotic inputs against structured taxonomy...</div>
                  </div>
               </motion.div>
            )}

            {pairing && !isPairing && (
               <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-stone-950 border border-stone-800 p-8 md:p-12 shadow-2xl relative z-10">
                  
                  <div className="text-center mb-10">
                     <div className="text-[10px] font-sans uppercase tracking-[0.3em] text-stone-500 mb-4">Recommended Pairing</div>
                     <h3 className="text-2xl md:text-3xl text-red-100 font-normal leading-tight">
                        {pairing.wine}
                     </h3>
                  </div>

                  <div className="relative">
                     <div className="absolute left-0 top-0 text-6xl text-stone-800 leading-none -mt-4 -ml-4 pointer-events-none">"</div>
                     <p className="text-lg leading-relaxed text-stone-400 relative z-10 pl-6 indent-8 text-justify">
                        {pairing.reasoning}
                     </p>
                  </div>

                  <div className="mt-12 pt-6 border-t border-stone-800 flex justify-between items-center font-sans">
                     <div className="text-[10px] uppercase tracking-widest text-stone-600">
                        Input: {food}
                     </div>
                     <button 
                        onClick={() => { setPairing(null); setFood(""); }}
                        className="text-[10px] uppercase tracking-widest text-red-900 hover:text-red-700 transition-colors font-bold"
                     >
                        New Pairing
                     </button>
                  </div>

               </motion.div>
            )}

         </AnimatePresence>

      </div>

    </div>
  );
}
