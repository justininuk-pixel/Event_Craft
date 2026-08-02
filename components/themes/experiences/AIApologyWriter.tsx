"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, AlertCircle, Copy, Check, Loader2 } from "lucide-react";

export function AIApologyWriter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const [recipient, setRecipient] = useState("");
  const [offense, setOffense] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apology, setApology] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
     e.preventDefault();
     if (!recipient.trim() || !offense.trim() || isGenerating) return;

     setIsGenerating(true);
     setCopied(false);
     setApology(null);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

     // Mock LLM psychological de-escalation generation
     setTimeout(() => {
        const text = `Hey ${recipient},\n\nI want to sincerely apologize for ${offense.toLowerCase()}. I know my actions caused you frustration and pain, and there is no excuse for it.\n\nI realize that my behavior broke your trust. It was not fair to you, and I am taking full responsibility. I am actively working to ensure I don't repeat this mistake, because I value our relationship too much to let my carelessness jeopardize it.\n\nI'm not expecting immediate forgiveness, but I wanted to own up to this and let you know how sorry I am.`;
        
        setApology(text);
        setIsGenerating(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (onComplete) setTimeout(onComplete, 8000);
     }, 2500);
  };

  const handleCopy = () => {
     if (!apology) return;
     navigator.clipboard.writeText(apology);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-50 text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shrink-0 shadow-sm">
         <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-600">
            <MessageCircle size={16} /> Conflict Resolution Engine
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-2xl mx-auto w-full space-y-8">
         
         <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight">Emotional Labor Outsourcing</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
               This algorithm utilizes psychological de-escalation frameworks (acknowledgment without excuses, taking full responsibility, and outlining behavioral change) to generate a perfectly calibrated apology.
            </p>
         </div>

         <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={14} /> Who did you hurt?
               </label>
               <input 
                  type="text" 
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. My girlfriend, John, The Marketing Team"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-blue-500 transition-colors"
               />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <AlertCircle size={14} /> What did you do?
               </label>
               <textarea 
                  value={offense}
                  onChange={e => setOffense(e.target.value)}
                  placeholder="e.g. I forgot our anniversary and lied about it."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-blue-500 transition-colors resize-none"
               />
            </div>

            <button 
               type="submit"
               disabled={!recipient.trim() || !offense.trim() || isGenerating}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-200 text-white rounded-lg font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 transition-colors shadow-md disabled:shadow-none"
            >
               {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />} 
               Synthesize Apology
            </button>
         </form>

         <AnimatePresence mode="wait">
            {isGenerating && (
               <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <div className="text-center">
                     <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Applying Frameworks</div>
                     <div className="text-[10px] uppercase tracking-widest text-slate-400">Removing defensive phrasing...</div>
                  </div>
               </motion.div>
            )}

            {apology && !isGenerating && (
               <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generated Output (iMessage Format)</div>
                     <button 
                        onClick={handleCopy}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                     >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy"}
                     </button>
                  </div>
                  
                  <div className="bg-[#e9e9eb] text-black p-4 rounded-2xl rounded-tl-sm text-[15px] leading-snug whitespace-pre-wrap max-w-[85%] shadow-sm self-start">
                     {apology}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
