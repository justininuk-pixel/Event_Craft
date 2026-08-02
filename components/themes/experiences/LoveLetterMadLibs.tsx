"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Wand2 } from "lucide-react";

export function LoveLetterMadLibs({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6"; // violet-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f5f3ff"]; // violet-50

  // The template and required fields
  const template = "My dearest [Name], you are the most [Adjective 1] person I have ever met. Every time I see your [Body Part], my heart [Verb]s. I will always remember the time we went to [Place] and you accidentally [Verb (Past Tense)] on the [Noun]. It was so [Adjective 2]. I love you more than [Plural Noun].";
  
  const requiredFields = [
     "Name", "Adjective 1", "Body Part", "Verb", "Place", "Verb (Past Tense)", "Noun", "Adjective 2", "Plural Noun"
  ];

  const [step, setStep] = useState<"filling" | "revealed">("filling");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setAnswers({ ...answers, [requiredFields[activeFieldIndex]]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
     e.preventDefault();
     const currentVal = answers[requiredFields[activeFieldIndex]] || "";
     if (!currentVal.trim()) return;

     if (activeFieldIndex < requiredFields.length - 1) {
        setActiveFieldIndex(activeFieldIndex + 1);
     } else {
        setStep("revealed");
    onComplete?.();
        if (onComplete) {
           setTimeout(onComplete, 8000);
        }
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
     }
  };

  const generateLetter = () => {
     let result = template;
     requiredFields.forEach(field => {
        const val = answers[field] || `[${field}]`;
        result = result.replace(`[${field}]`, `<span style="color: ${primaryColor}; font-weight: 900; text-decoration: underline;">${val}</span>`);
     });
     return result;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto relative">
         
         <AnimatePresence mode="wait">
            {step === "filling" ? (
               <motion.div 
                  key="filling"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center"
               >
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6 text-violet-500 shadow-inner">
                     <PenTool size={24} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2 text-slate-800">
                     Blind Love Letter
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mb-8">
                     Fill in the blank without knowing the context.
                  </p>

                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                     Word {activeFieldIndex + 1} of {requiredFields.length}
                  </div>
                  <h3 className="text-xl font-black mb-6" style={{ color: primaryColor }}>
                     {requiredFields[activeFieldIndex]}
                  </h3>

                  <form onSubmit={handleNext} className="w-full flex flex-col gap-4">
                     <input
                        type="text"
                        autoFocus
                        value={answers[requiredFields[activeFieldIndex]] || ""}
                        onChange={handleInputChange}
                        placeholder="Type here..."
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-violet-500 rounded-xl px-4 py-4 text-center font-bold text-lg outline-none transition-colors"
                     />
                     <button
                        type="submit"
                        disabled={!(answers[requiredFields[activeFieldIndex]]?.trim())}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${!(answers[requiredFields[activeFieldIndex]]?.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        style={{ backgroundColor: primaryColor }}
                     >
                        Next Word
                     </button>
                  </form>
               </motion.div>
            ) : (
               <motion.div 
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center"
               >
                  <Wand2 size={40} className="mb-6 drop-shadow-md" style={{ color: primaryColor }} />
                  
                  <div className="bg-[#fff9e6] rounded-sm p-8 shadow-2xl relative w-full border border-[#fde047] rotate-[-2deg]">
                     {/* Paper texture/lines */}
                     <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)' }} />
                     
                     <h2 className="text-sm font-bold uppercase tracking-widest text-amber-900/50 mb-6 text-center border-b border-amber-900/20 pb-4">
                        The Final Result
                     </h2>
                     
                     <p 
                        className="text-2xl font-serif text-slate-800 leading-[32px]"
                        dangerouslySetInnerHTML={{ __html: generateLetter() }}
                     />
                  </div>

                  <button
                     onClick={() => {
                        setAnswers({});
                        setActiveFieldIndex(0);
                        setStep("filling");
                     }}
                     className="mt-12 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                     Try Again
                  </button>

               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
