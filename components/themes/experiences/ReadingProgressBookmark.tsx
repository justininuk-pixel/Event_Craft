"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, ChevronDown, CheckCircle2 } from "lucide-react";

export function ReadingProgressBookmark({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#dc2626"; // red-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f5f5f4"]; // stone-100

  const bookTitle = config.title || "The Count of Monte Cristo";
  const totalPages = 1276;
  const [currentPage, setCurrentPage] = useState<number>(315);
  const [inputValue, setInputValue] = useState<string>("315");
  
  // Percentage from 0 to 100
  const progressPercent = Math.min(100, Math.max(0, (currentPage / totalPages) * 100));
  const isFinished = currentPage >= totalPages;

  useEffect(() => {
     if (isFinished && onComplete) {
        onComplete();
     }
  }, [isFinished, onComplete]);

  const handleUpdate = () => {
     const val = parseInt(inputValue, 10);
     if (!isNaN(val)) {
        setCurrentPage(Math.min(totalPages, Math.max(0, val)));
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden text-stone-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Decor */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/paper.png')" }} 
      />

      <div className="w-full max-w-lg mx-auto flex flex-col h-full z-10 p-6 sm:p-10">
         
         {/* Header */}
         <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-stone-900 flex items-center justify-center gap-3">
               <BookOpen size={28} style={{ color: primaryColor }} />
               Current Read
            </h2>
            <p className="text-stone-500 font-sans font-medium uppercase tracking-widest text-sm">
               {bookTitle}
            </p>
         </div>

         {/* The Book Container */}
         <div className="flex-1 flex gap-8 items-stretch justify-center relative max-h-[600px]">
            
            {/* The Book Spine */}
            <div className="w-32 bg-stone-800 rounded-lg shadow-2xl relative border-l-4 border-stone-900 border-r-2 border-r-stone-700 flex flex-col overflow-hidden">
               
               {/* Spine Texture */}
               <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
               
               {/* Spine Text */}
               <div className="flex-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-stone-400 font-black tracking-widest uppercase text-xl transform -rotate-90 whitespace-nowrap opacity-50">
                        {bookTitle}
                     </span>
                  </div>
               </div>
               
               {/* Pages indicator (right side of spine) */}
               <div className="absolute top-0 bottom-0 right-0 w-2 bg-stone-300 opacity-80 border-l border-stone-400" />

               {/* The Bookmark Ribbon */}
               <motion.div 
                  className="absolute left-1/2 w-8 -translate-x-1/2 drop-shadow-lg z-20 origin-top"
                  initial={{ height: "0%" }}
                  animate={{ height: `${progressPercent}%` }}
                  transition={{ type: "spring", stiffness: 40, damping: 15 }}
                  style={{ backgroundColor: primaryColor }}
               >
                  {/* Ribbon V-Cut at bottom */}
                  <div 
                     className="absolute -bottom-4 left-0 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px]"
                     style={{ borderTopColor: primaryColor }}
                  />
                  
                  {/* Bookmark Icon */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/50">
                     <Bookmark size={16} />
                  </div>
               </motion.div>
               
            </div>

            {/* Input & Stats Area */}
            <div className="flex flex-col justify-center gap-6 w-48">
               
               <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-200 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
                  
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2 font-sans">
                     Progress
                  </span>
                  <div className="text-4xl font-black text-stone-800 mb-1">
                     {progressPercent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-stone-500 font-medium font-sans">
                     {currentPage} / {totalPages} pgs
                  </div>
               </div>

               {!isFinished ? (
                  <div className="bg-white p-5 rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-3 font-sans relative">
                     <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Update Page
                     </label>
                     <div className="flex gap-2">
                        <input 
                           type="number" 
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                           className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-center font-bold text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all"
                        />
                     </div>
                     <button
                        onClick={handleUpdate}
                        className="w-full py-2 rounded-xl text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-transform active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                     >
                        Update
                     </button>
                  </div>
               ) : (
                  <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="bg-emerald-500 p-5 rounded-2xl shadow-xl border border-emerald-600 flex flex-col items-center gap-2 text-white text-center font-sans"
                  >
                     <CheckCircle2 size={32} />
                     <span className="font-bold">Book Finished!</span>
                  </motion.div>
               )}

            </div>
         </div>

         {/* Down Indicator */}
         {!isFinished && (
            <div className="mt-8 flex justify-center text-stone-400 animate-bounce">
               <ChevronDown size={24} />
            </div>
         )}

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isFinished && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setCurrentPage(totalPages);
                  setInputValue(totalPages.toString());
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded border border-black/10"
            >
               Finish Book (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
