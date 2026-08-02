"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Sparkles, Image as ImageIcon } from "lucide-react";

export function HallucinatedRecipeGenerator({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#f59e0b"; // amber-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"]; // amber-50

  const [ingredients, setIngredients] = useState(["", "", ""]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<{title: string, steps: string[], imageUrl: string} | null>(null);

  const handleGenerate = () => {
     if (ingredients.some(i => !i.trim()) || isGenerating) return;
     
     setIsGenerating(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        // Mock LLM generation
        setRecipe({
           title: "Deconstructed " + ingredients[0] + " Mille-Feuille with " + ingredients[1] + " Gastrique",
           steps: [
              `Create a delicate emulsion using the ${ingredients[0]} and mount it with cold butter.`,
              `Sous-vide the ${ingredients[1]} at exactly 64°C to preserve its structural integrity.`,
              `Flash-fry the ${ingredients[2]} until crispy, utilizing it as a textural counterpoint.`,
              `Plate using tweezers, finishing with micro-greens and a drizzle of the gastrique.`
           ],
           imageUrl: "https://images.unsplash.com/photo-1544025162-811114b7e908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        });
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 3000);
  };

  const updateIngredient = (index: number, value: string) => {
     const newArr = [...ingredients];
     newArr[index] = value;
     setIngredients(newArr);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-amber-50 text-amber-950" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 text-center z-10 border-b border-amber-200 bg-white">
         <h2 className="text-xl font-black uppercase tracking-widest text-amber-800 flex justify-center items-center gap-2">
            <ChefHat size={24} className="text-amber-500" /> Hallucinated Haute Cuisine
         </h2>
      </div>

      <div className="flex-1 relative overflow-y-auto p-6 w-full max-w-2xl mx-auto">
         
         <AnimatePresence mode="wait">
            {!recipe && !isGenerating && (
               <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 mt-12">
                  <div className="text-center text-sm font-medium text-amber-700">
                     Enter 3 random ingredients you have right now.<br/>The LLM will hallucinate a Michelin-star recipe.
                  </div>
                  
                  <div className="space-y-4">
                     {[0,1,2].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                           <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800 shrink-0">{i+1}</div>
                           <input 
                              type="text"
                              value={ingredients[i]}
                              onChange={e => updateIngredient(i, e.target.value)}
                              placeholder={`Ingredient ${i+1} (e.g. Peanut Butter)`}
                              className="flex-1 bg-white border border-amber-200 py-3 px-4 rounded-xl outline-none focus:border-amber-500 shadow-sm"
                           />
                        </div>
                     ))}
                  </div>

                  <button 
                     onClick={handleGenerate}
                     disabled={ingredients.some(i => !i.trim())}
                     className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-200 disabled:text-amber-500 text-white rounded-xl font-bold uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl shadow-amber-500/20 transition-all"
                  >
                     <Sparkles size={18} /> Synthesize Recipe
                  </button>
               </motion.div>
            )}

            {isGenerating && (
               <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center mt-32 space-y-6">
                  <div className="relative">
                     <ChefHat size={64} className="text-amber-300" />
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-2 border-amber-500 border-t-transparent rounded-full"
                     />
                  </div>
                  <div className="text-center">
                     <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Synthesizing Text Payload...</div>
                     <div className="text-[10px] uppercase tracking-widest text-amber-400 flex items-center justify-center gap-2">
                        <ImageIcon size={10} /> Prompting Image Generator
                     </div>
                  </div>
               </motion.div>
            )}

            {recipe && !isGenerating && (
               <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-12">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl mb-8 border border-amber-200">
                     <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded">AI Rendered</div>
                  </div>

                  <h3 className="text-3xl font-black mb-8 text-amber-900 leading-tight">
                     {recipe.title}
                  </h3>

                  <div className="space-y-6">
                     {recipe.steps.map((step, i) => (
                        <div key={i} className="flex gap-6">
                           <div className="font-sans font-bold text-amber-400 text-xl">{i+1}.</div>
                           <p className="text-amber-950 leading-relaxed text-lg">{step}</p>
                        </div>
                     ))}
                  </div>

                  <div className="mt-12 p-4 bg-amber-100 rounded-xl border border-amber-200 text-xs font-sans text-amber-800 flex items-center justify-center gap-2">
                     <Sparkles size={14} className="text-amber-500" /> 
                     This recipe does not exist. It was hallucinated purely from structural constraints.
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
