"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { ChefHat, CheckCircle } from "lucide-react";

type Ingredient = {
  id: string;
  name: string;
  amount: number;
  unit: string;
};

// Simplified conversion logic for demonstration
// Tries to convert up from small units to larger units if threshold is met
const formatMeasurement = (amount: number, unit: string) => {
   // Just to keep it simple, we won't build a full bi-directional unit conversion matrix here.
   // We'll just handle basic scaling and display formatting (fractions, etc).
   
   let displayAmount = amount;
   let displayUnit = unit;

   // Simple tbsp to cup conversion (16 tbsp = 1 cup)
   if (unit === "tbsp" && amount >= 16) {
      displayAmount = amount / 16;
      displayUnit = "cup";
   }
   
   // Simple tsp to tbsp conversion (3 tsp = 1 tbsp)
   if (unit === "tsp" && amount >= 3) {
      displayAmount = amount / 3;
      displayUnit = "tbsp";
   }
   
   // Format cleanly (e.g., 1.5 -> 1 1/2) for common fractions
   const intPart = Math.floor(displayAmount);
   const decimal = displayAmount - intPart;
   
   let fractionStr = "";
   // Add some fuzziness to avoid floating point issues
   if (Math.abs(decimal - 0.25) < 0.05) fractionStr = "1/4";
   else if (Math.abs(decimal - 0.33) < 0.05) fractionStr = "1/3";
   else if (Math.abs(decimal - 0.5) < 0.05) fractionStr = "1/2";
   else if (Math.abs(decimal - 0.66) < 0.05) fractionStr = "2/3";
   else if (Math.abs(decimal - 0.75) < 0.05) fractionStr = "3/4";
   else if (decimal > 0) fractionStr = decimal.toFixed(1); // fallback to decimal if not a clean fraction
   
   // Pluralize units
   if (displayAmount > 1 || displayAmount === 0) {
      if (displayUnit === "cup") displayUnit = "cups";
      if (displayUnit === "egg") displayUnit = "eggs";
      // tbsp and tsp are usually fine as is or we can add 's'
   }

   const formattedValue = `${intPart > 0 ? intPart : ''} ${fractionStr}`.trim();

   return { value: formattedValue, unit: displayUnit };
};

export function RecipeMultiplier({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"]; // amber-50

  const baseServings = 4;
  const [servings, setServings] = useState(baseServings);
  const [isDone, setIsDone] = useState(false);

  // Mock recipe
  const baseIngredients: Ingredient[] = [
     { id: "i1", name: "Flour", amount: 2, unit: "cup" },
     { id: "i2", name: "Sugar", amount: 1.5, unit: "cup" },
     { id: "i3", name: "Baking Powder", amount: 1, unit: "tbsp" },
     { id: "i4", name: "Salt", amount: 1, unit: "tsp" },
     { id: "i5", name: "Egg", amount: 2, unit: "egg" },
     { id: "i6", name: "Milk", amount: 1.5, unit: "cup" },
     { id: "i7", name: "Butter", amount: 4, unit: "tbsp" },
  ];

  const multiplier = servings / baseServings;

  const handleStartCooking = () => {
     setIsDone(true);
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center p-4 sm:p-8 font-serif overflow-y-auto text-amber-900"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Ambience */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/notebook.png')" }} 
      />

      <div className="w-full max-w-lg bg-[#fffdfa] rounded-xl shadow-2xl overflow-hidden z-10 border border-amber-200/50 flex flex-col relative">
         
         {/* Tape aesthetic at top */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/50 border border-white/20 shadow-sm transform -translate-y-3 -rotate-2 mix-blend-overlay" />

         <div className="p-8 pb-4 border-b border-amber-100 flex flex-col items-center text-center relative">
            
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
               <ChefHat size={32} />
            </div>

            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase" style={{ color: primaryColor }}>
               {config.title || "Grandma's Pancakes"}
            </h2>
            <p className="text-amber-700/60 font-sans text-sm font-medium uppercase tracking-widest">
               Dynamic Recipe Scaling
            </p>
         </div>

         {/* Servings Slider */}
         <div className="p-8 bg-amber-50/50 border-b border-amber-100 font-sans flex flex-col gap-6">
            <div className="flex items-center justify-between text-amber-900 font-bold">
               <span className="uppercase tracking-widest text-xs">Servings</span>
               <span className="text-3xl font-black">{servings}</span>
            </div>
            
            <input 
               type="range"
               min="1"
               max="24"
               step="1"
               value={servings}
               onChange={(e) => setServings(Number(e.target.value))}
               className="w-full h-3 rounded-full appearance-none bg-amber-200 cursor-pointer shadow-inner"
               style={{
                  background: `linear-gradient(to right, ${primaryColor} ${(servings / 24) * 100}%, #fde68a ${(servings / 24) * 100}%)`
               }}
            />
            
            <div className="flex justify-between text-xs font-bold text-amber-400">
               <span>1</span>
               <span>24</span>
            </div>
         </div>

         {/* Ingredients List */}
         <div className="p-8 space-y-4 font-sans text-amber-900 flex-1">
            <h3 className="font-bold text-lg mb-6 border-b-2 border-amber-200 inline-block pb-1">Ingredients</h3>
            
            {baseIngredients.map(ing => {
               const scaledAmount = ing.amount * multiplier;
               const { value, unit } = formatMeasurement(scaledAmount, ing.unit);

               return (
                  <div key={ing.id} className="flex items-baseline justify-between group">
                     
                     <div className="flex items-baseline gap-2">
                        {/* Amount */}
                        <span 
                           className="font-black text-lg transition-all duration-300 w-16 text-right"
                           style={{ color: primaryColor }}
                        >
                           {value}
                        </span>
                        
                        {/* Unit */}
                        <span className="font-bold text-amber-600/70 text-sm uppercase tracking-wider w-12">
                           {unit}
                        </span>
                     </div>
                     
                     <div className="flex-1 mx-4 border-b border-dashed border-amber-200 opacity-30 group-hover:opacity-100 transition-opacity" />
                     
                     {/* Name */}
                     <span className="font-semibold text-lg">{ing.name}</span>

                  </div>
               )
            })}
         </div>

         {/* Action */}
         <div className="p-8 pt-0 mt-4">
            <button
               onClick={handleStartCooking}
               disabled={isDone}
               className={`w-full py-4 rounded-xl font-bold font-sans uppercase tracking-widest text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isDone ? 'opacity-90 cursor-not-allowed scale-95' : 'hover:-translate-y-1 hover:shadow-2xl'
               }`}
               style={{ backgroundColor: primaryColor }}
            >
               {isDone ? <><CheckCircle size={20} /> Ready to Cook</> : "Start Cooking"}
            </button>
         </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 4px solid ${primaryColor};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}} />

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isDone && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto font-sans">
            <button 
               onClick={handleStartCooking}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Start (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
