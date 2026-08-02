"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Smartphone } from "lucide-react";

export function VirtualHug({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ec4899"; // pink-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fce7f3"]; // pink-100

  const [isHugging, setIsHugging] = useState(false);
  const [hugProgress, setHugProgress] = useState(0); // 0 to 100
  const [hugComplete, setHugComplete] = useState(false);

  // We need to detect two touches on extreme left and right
  const [leftTouched, setLeftTouched] = useState(false);
  const [rightTouched, setRightTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const bothTouched = leftTouched && rightTouched;
     setIsHugging(bothTouched);

     if (bothTouched && !hugComplete) {
        if (hugProgress < 100) {
           const timer = setTimeout(() => {
              setHugProgress(prev => Math.min(prev + 5, 100)); // Increase progress
           }, 100); // 2 seconds total hold
           return () => clearTimeout(timer);
        } else {
           setHugComplete(true);
           if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate([100, 50, 100, 50, 200]);
           }
           if (onComplete) {
              setTimeout(onComplete, 3000);
           }
        }
     } else if (!bothTouched && !hugComplete) {
        // Reset progress if they let go
        if (hugProgress > 0) {
           const timer = setTimeout(() => {
              setHugProgress(prev => Math.max(prev - 10, 0));
           }, 50);
           return () => clearTimeout(timer);
        }
     }
  }, [leftTouched, rightTouched, hugProgress, hugComplete, onComplete]);

  const handleTouch = (e: React.TouchEvent) => {
     let l = false;
     let r = false;
     
     const rect = containerRef.current?.getBoundingClientRect();
     const width = rect?.width || 320;
     const leftEdge = rect?.left || 0;
     const edgeThreshold = width * 0.25; // 25% from edge

     for (let i = 0; i < e.touches.length; i++) {
        const x = e.touches[i].clientX - leftEdge;
        if (x < edgeThreshold) l = true;
        if (x > width - edgeThreshold) r = true;
     }

     setLeftTouched(l);
     setRightTouched(r);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
     // Re-evaluate current touches
     handleTouch(e);
  };

  // Allow editor bypass using mouse down/up on the whole screen for testing
  const handleEditorMouseDown = () => {
     if (mode === "editor-preview") {
        setLeftTouched(true);
        setRightTouched(true);
     }
  };

  const handleEditorMouseUp = () => {
     if (mode === "editor-preview") {
        setLeftTouched(false);
        setRightTouched(false);
     }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleEditorMouseDown}
      onMouseUp={handleEditorMouseUp}
      onMouseLeave={handleEditorMouseUp}
    >
      
      {/* Background glow that increases with hug progress */}
      <motion.div 
         className="absolute inset-0 pointer-events-none"
         style={{ backgroundColor: primaryColor }}
         animate={{ opacity: (hugProgress / 100) * 0.8 }}
         transition={{ duration: 0.1 }}
      />

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
         
         <AnimatePresence mode="wait">
            {!hugComplete ? (
               <motion.div 
                  key="waiting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  className="flex flex-col items-center text-center"
               >
                  <motion.div 
                     animate={{ scale: isHugging ? 1.1 : 1 }}
                     transition={{ type: "spring", bounce: 0.5 }}
                     className="mb-8 relative"
                  >
                     <Smartphone size={80} strokeWidth={1} className="text-slate-400" />
                     {/* Left/Right grip indicators */}
                     <motion.div 
                        animate={{ x: isHugging ? 5 : -5, opacity: leftTouched ? 1 : 0.5 }} 
                        className="absolute top-1/2 -left-8 -translate-y-1/2 w-4 h-16 bg-pink-400 rounded-full blur-sm"
                     />
                     <motion.div 
                        animate={{ x: isHugging ? -5 : 5, opacity: rightTouched ? 1 : 0.5 }} 
                        className="absolute top-1/2 -right-8 -translate-y-1/2 w-4 h-16 bg-pink-400 rounded-full blur-sm"
                     />
                  </motion.div>

                  <h2 className="text-3xl font-black tracking-tight mb-4 text-slate-800">
                     Squeeze to Hug
                  </h2>
                  <p className="text-slate-500 font-medium">
                     {mode === "editor-preview" 
                        ? "Click and hold anywhere to simulate squeezing the edges."
                        : "Grip the left and right edges of your screen and hold tight."}
                  </p>
               </motion.div>
            ) : (
               <motion.div 
                  key="complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center"
               >
                  <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                     <Heart size={100} fill={primaryColor} color={primaryColor} className="drop-shadow-[0_0_30px_rgba(236,72,153,0.8)] mb-8" />
                  </motion.div>
                  <h2 className="text-4xl font-black tracking-tight mb-4 text-white drop-shadow-md">
                     {config.title || "Sending Love"}
                  </h2>
                  <p className="text-white text-lg font-medium drop-shadow max-w-xs">
                     {config.body || "A virtual hug just for you."}
                  </p>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Progress Bar Indicators at edges */}
      <div className="absolute top-0 bottom-0 left-0 w-2 bg-black/10 pointer-events-none">
         <motion.div 
            className="absolute bottom-0 left-0 right-0"
            style={{ backgroundColor: primaryColor }}
            animate={{ height: `${hugProgress}%` }}
         />
      </div>
      <div className="absolute top-0 bottom-0 right-0 w-2 bg-black/10 pointer-events-none">
         <motion.div 
            className="absolute bottom-0 left-0 right-0"
            style={{ backgroundColor: primaryColor }}
            animate={{ height: `${hugProgress}%` }}
         />
      </div>

    </div>
  );
}
