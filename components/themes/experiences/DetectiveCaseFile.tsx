"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type OSFile = {
   id: string;
   name: string;
   content: string;
   iconType: "text" | "image";
};

const FILES: OSFile[] = [
   { id: "f1", name: "Report.txt", iconType: "text", content: "Incident occurred at 03:00 hours. The subject was seen leaving the premises in a hurry. Key evidence was left behind." },
   { id: "f2", name: "Evidence.jpg", iconType: "image", content: "[ IMAGE DATA CORRUPTED - View textual analysis instead ]\nThe image shows a footprint matching a size 10 boot, embedded deep in the mud." },
   { id: "f3", name: "Memo.txt", iconType: "text", content: "Do NOT let anyone else access the payload until the case is solved. Signed, The Chief." }
];

export function DetectiveCaseFile({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#008080"; // Teal background standard for Win95
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#c0c0c0"]; // Standard gray

  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [showPayload, setShowPayload] = useState(false);
  
  // OS State
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [readFiles, setReadFiles] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const desktopRef = useRef<HTMLDivElement>(null);

  const openFile = (id: string) => {
     if (gameState !== "playing") return;
     if (!openWindows.includes(id)) {
        setOpenWindows(prev => [...prev, id]);
     }
     if (!readFiles.includes(id)) {
        setReadFiles(prev => [...prev, id]);
     }
     setActiveWindow(id);
  };

  const closeFile = (id: string, e: React.MouseEvent | React.TouchEvent) => {
     e.stopPropagation();
     setOpenWindows(prev => prev.filter(w => w !== id));
     if (activeWindow === id) {
        setActiveWindow(null);
     }
  };

  const attemptSolve = () => {
     if (readFiles.length >= FILES.length) {
        // Unlock
        setGameState("won");
    onComplete?.();
        setTimeout(() => setShowPayload(true), 1500);
     } else {
        // Access Denied
        setAccessDenied(true);
        setTimeout(() => setAccessDenied(false), 2000);
     }
  };

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      style={{ backgroundColor: "#000" }}
    >
      
      {/* Game Viewport Container - The "Monitor" */}
      <div 
         ref={desktopRef}
         className={`relative w-[320px] h-[480px] rounded-lg shadow-[0_0_50px_rgba(0,128,128,0.3)] overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 blur-[1px]" : "scale-100"}`}
         style={{ backgroundColor: primaryColor }}
      >
         
         {/* Desktop Icons */}
         {gameState === "playing" && (
            <div className="absolute top-4 left-4 flex flex-col gap-6">
               {FILES.map((file) => (
                  <button 
                     key={file.id} 
                     onClick={() => openFile(file.id)}
                     className="flex flex-col items-center gap-1 group w-16"
                  >
                     <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none transition-all">
                        {file.iconType === "text" ? (
                           <div className="w-4 h-5 border border-black relative">
                              <div className="absolute top-1 left-1 right-1 h-[1px] bg-black" />
                              <div className="absolute top-2 left-1 right-1 h-[1px] bg-black" />
                              <div className="absolute top-3 left-1 w-2 h-[1px] bg-black" />
                           </div>
                        ) : (
                           <div className="w-5 h-4 border border-black relative overflow-hidden">
                              <div className="absolute bottom-0 left-0 w-3 h-2 border-t border-r border-black rotate-45 translate-y-1 -translate-x-1" />
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-t border-l border-black -rotate-45 translate-y-1 translate-x-1" />
                              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full" />
                           </div>
                        )}
                     </div>
                     <span className="text-white text-[10px] text-center leading-tight drop-shadow-md px-1 bg-transparent group-hover:bg-[#0000AA] group-hover:text-white">
                        {file.name}
                     </span>
                  </button>
               ))}

               {/* Solve Case Icon */}
               <button 
                  onClick={attemptSolve}
                  className="flex flex-col items-center gap-1 group w-16 mt-8"
               >
                  <div className="w-8 h-8 bg-[#ff0000] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none transition-all">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <span className="text-white text-[10px] text-center font-bold leading-tight drop-shadow-md px-1 bg-transparent group-hover:bg-[#0000AA] group-hover:text-white">
                     Solve.exe
                  </span>
               </button>
            </div>
         )}

         {/* Draggable Windows */}
         <AnimatePresence>
            {openWindows.map((id) => {
               const file = FILES.find(f => f.id === id)!;
               const isActive = activeWindow === id;
               
               return (
                  <motion.div
                     key={id}
                     drag
                     dragConstraints={desktopRef}
                     dragMomentum={false}
                     onPointerDown={() => setActiveWindow(id)}
                     initial={{ scale: 0.9, opacity: 0, x: 50, y: 50 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     className="absolute w-[220px] border-2 border-white border-r-black border-b-black bg-[#c0c0c0] flex flex-col shadow-xl"
                     style={{ zIndex: isActive ? 30 : 20 }}
                  >
                     {/* Title Bar */}
                     <div className={`h-6 flex items-center justify-between px-1 border-b border-black cursor-grab active:cursor-grabbing ${isActive ? 'bg-[#0000AA]' : 'bg-[#808080]'}`}>
                        <span className={`text-[10px] font-bold truncate ${isActive ? 'text-white' : 'text-[#c0c0c0]'}`}>
                           {file.name}
                        </span>
                        <button 
                           onClick={(e) => closeFile(id, e)}
                           className="w-4 h-4 bg-[#c0c0c0] border border-white border-r-black border-b-black flex items-center justify-center text-black text-[8px] font-bold active:border-black active:border-r-white active:border-b-white"
                        >
                           x
                        </button>
                     </div>
                     
                     {/* Content Area */}
                     <div className="p-2 bg-white m-1 border-2 border-black border-r-white border-b-white min-h-[100px] text-xs font-mono text-black">
                        {file.content}
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>

         {/* Access Denied Alert */}
         <AnimatePresence>
            {accessDenied && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] border-2 border-white border-r-black border-b-black bg-[#c0c0c0] flex flex-col shadow-2xl z-50"
               >
                  <div className="h-6 bg-[#0000AA] flex items-center px-1 border-b border-black">
                     <span className="text-white text-[10px] font-bold">Error</span>
                  </div>
                  <div className="p-4 flex flex-col items-center gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white border-r-black border-b-black flex items-center justify-center text-white font-bold">X</div>
                        <span className="text-xs text-black font-sans">You have not examined all the evidence.</span>
                     </div>
                     <button 
                        onClick={() => setAccessDenied(false)}
                        className="px-4 py-1 bg-[#c0c0c0] border-2 border-white border-r-black border-b-black text-xs font-bold text-black active:border-black active:border-r-white active:border-b-white"
                     >
                        OK
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Start Overlay */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black"
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
               >
                  <div className="font-mono text-[#00ff00] text-xs mb-8 whitespace-pre-line text-left w-full px-8">
                     {`Booting OS...
Memory Check: OK
Loading UI...
User: DETECTIVE
Access: GRANTED`}
                  </div>
                  <button 
                     onClick={() => setGameState("playing")}
                     className="px-8 py-2 border-2 border-[#00ff00] text-[#00ff00] font-mono text-xs hover:bg-[#00ff00] hover:text-black transition-colors"
                  >
                     ENTER DESKTOP
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-sm"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5 }}
            >
               {/* Final System Window */}
               <motion.div 
                  className="w-full max-w-sm border-2 border-white border-r-black border-b-black bg-[#c0c0c0] flex flex-col shadow-2xl relative"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
               >
                  <div className="h-6 bg-[#0000AA] flex items-center px-1 border-b border-black">
                     <span className="text-white text-[10px] font-bold uppercase tracking-widest">Case Solved - Payload Unlocked</span>
                  </div>
                  <div className="p-6 flex flex-col items-center">
                     
                     <div className="w-12 h-12 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                     </div>

                     <h1 className="text-xl md:text-2xl font-black mb-4 text-center text-black">
                        {config.title}
                     </h1>
                     
                     <div className="w-full p-3 bg-white border-2 border-black border-r-white border-b-white text-xs font-mono text-black leading-relaxed">
                        {config.body}
                     </div>

                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col items-center shadow-2xl z-50 rounded pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-3">
               Simulation: Bypass Reading
            </h2>
            <button 
               onClick={() => {
                  setReadFiles(FILES.map(f => f.id));
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full text-white font-black uppercase tracking-widest py-2 rounded active:scale-95 transition-transform shadow-md border border-white/30"
            >
               Hack System
            </button>
         </div>
      )}
      
    </div>
  );
}
