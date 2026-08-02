"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning, Loader2, X } from "lucide-react";

export function InlineCritiqueDM({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"]; // white

  const [selection, setSelection] = useState("");
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);
  const [critique, setCritique] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const handleMouseUp = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
           // We do not clear tooltip here to let user read the critique
           return;
        }

        const text = sel.toString().trim();
        if (text.length > 20) {
           const range = sel.getRangeAt(0);
           const rect = range.getBoundingClientRect();
           const containerRect = containerRef.current?.getBoundingClientRect();

           if (containerRect) {
              setSelection(text);
              setCritique(null);
              // Position tooltip above the selection, centered
              setTooltipPos({
                 x: rect.left + rect.width / 2 - containerRect.left,
                 y: rect.top - containerRect.top - 10
              });
           }
        }
     };

     document.addEventListener("mouseup", handleMouseUp);
     return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCritique = () => {
     setIsAnalyzing(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     setTimeout(() => {
        setIsAnalyzing(false);
        // Mock LLM critique based on selection length
        setCritique("• Begging the Question: Assumes the premise without providing empirical evidence.\n• False Dilemma: Presents the situation as a binary choice when other alternatives exist.\n• Appeal to Emotion: Uses loaded language rather than objective facts to persuade.");
        
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 30, 30]);
        if (onComplete) setTimeout(onComplete, 8000);
     }, 1500);
  };

  const closeTooltip = () => {
     setTooltipPos(null);
     setSelection("");
     setCritique(null);
     window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={containerRef} className="w-full h-full relative flex flex-col font-serif overflow-y-auto select-auto bg-white text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="max-w-3xl mx-auto w-full px-6 md:px-12 py-16 space-y-6">
         
         <div className="mb-12 border-b-2 border-slate-900 pb-8">
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">The Fallacy of the Modern Attention Economy</h1>
            <p className="text-slate-500 font-sans text-sm uppercase tracking-widest font-bold">Highlight any paragraph for an instant adversarial critique.</p>
         </div>

         <p className="text-xl leading-relaxed text-slate-700">
            We are living in an era where human attention is the most heavily traded commodity on earth. Every algorithm, every notification, and every infinitely scrolling feed is designed with a single, malicious intent: to hijack your neurological reward pathways. This is not hyperbole; it is a fundamental truth of the digital age. If we do not immediately dismantle these systems, we will lose our collective ability to think deeply, resulting in the collapse of rational discourse.
         </p>
         
         <p className="text-xl leading-relaxed text-slate-700">
            Furthermore, the argument that technology is a "neutral tool" is a convenient lie peddled by billionaires to avoid regulation. Tools do not have autonomous optimization functions designed to maximize anger and engagement. By continuing to use these platforms, you are actively participating in the degradation of society and endorsing the psychological manipulation of billions of people. The only ethical choice is total abstention.
         </p>

         <p className="text-xl leading-relaxed text-slate-700">
            Critics of this view argue that these platforms connect us and democratize information. However, this is a naive perspective that willfully ignores the overwhelming evidence of harm. They focus on the rare exceptions—a reunion of long-lost friends, a successful crowdfunding campaign—while turning a blind eye to the systemic radicalization and polarization tearing at the fabric of our democracies.
         </p>

      </div>

      {/* Tooltip Overlay */}
      <AnimatePresence>
         {tooltipPos && (
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute z-50 flex flex-col items-center select-none"
               style={{ 
                  left: tooltipPos.x, 
                  top: tooltipPos.y,
                  transform: "translate(-50%, -100%)", // shift up and center
                  width: "320px"
               }}
            >
               <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden w-full relative">
                  
                  <button onClick={closeTooltip} className="absolute top-2 right-2 text-slate-400 hover:text-white p-1">
                     <X size={14} />
                  </button>

                  <div className="p-4">
                     {!critique && !isAnalyzing ? (
                        <div className="text-center">
                           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold mb-3">Selected {selection.split(' ').length} words</div>
                           <button 
                              onClick={handleCritique}
                              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-colors"
                           >
                              <MessageSquareWarning size={14} /> Request Adversarial Critique
                           </button>
                        </div>
                     ) : isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-4">
                           <Loader2 size={24} className="animate-spin text-red-500 mb-2" />
                           <div className="text-[10px] text-red-400 uppercase tracking-widest font-sans font-bold">LLM Evaluating Logic...</div>
                        </div>
                     ) : (
                        <div className="text-sm font-sans">
                           <div className="text-[10px] text-red-500 uppercase tracking-widest font-black mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
                              <MessageSquareWarning size={12} /> Flaws Detected
                           </div>
                           <div className="space-y-2 text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {critique}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
               {/* Arrow pointing down */}
               <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-900 mt-[-1px]" />
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
