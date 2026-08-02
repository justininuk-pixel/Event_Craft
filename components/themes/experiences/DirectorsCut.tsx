"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Camera, Check } from "lucide-react";

export function DirectorsCut({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const [activeCamera, setActiveCamera] = useState<number>(1);
  const [progress, setProgress] = useState(0); // 0 to 100 timeline
  const [camerasUsed, setCamerasUsed] = useState<Record<number, boolean>>({ 1: true });

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#e11d48";
  
  // Animate the scene timeline automatically
  useEffect(() => {
     let frame = 0;
     const maxFrames = 1000; // arbitrary length of the "scene"
     
     const loop = () => {
        frame++;
        if (frame > maxFrames) frame = 0; // loop the scene
        setProgress((frame / maxFrames) * 100);
        requestAnimationFrame(loop);
     };
     
     const raf = requestAnimationFrame(loop);
     return () => cancelAnimationFrame(raf);
  }, []);

  const switchCamera = (camNum: number) => {
     setActiveCamera(camNum);
     setCamerasUsed(prev => {
        const next = { ...prev, [camNum]: true };
        
        // Completion condition: if all 3 cameras have been used
        if (Object.keys(next).length === 3 && onComplete) {
           onComplete();
        }
        
        return next;
     });
  };

  // We build a simulated 3D space using 2D transforms and CSS perspective.
  // The 'scene' consists of two characters (blocks) and some environment props.
  // The different "cameras" just apply different global transforms to the scene container.
  
  const getCameraTransform = () => {
     switch (activeCamera) {
        case 1: // Cam 1: Side view (Profile)
           return { rotateX: 10, rotateY: -80, scale: 1.2, x: 100, y: 50 };
        case 2: // Cam 2: Over the shoulder (Angled)
           return { rotateX: 5, rotateY: -20, scale: 1.5, x: -50, y: 20 };
        case 3: // Cam 3: Overhead (God's eye view)
           return { rotateX: 85, rotateY: 0, scale: 0.8, x: 0, y: -100 };
        default:
           return { rotateX: 0, rotateY: 0, scale: 1, x: 0, y: 0 };
     }
  };

  const transform = getCameraTransform();

  // Derived animation states based on timeline (progress 0 to 100)
  // Character 1 paces back and forth
  const char1X = Math.sin((progress / 100) * Math.PI * 4) * 50 - 50; 
  // Character 2 bobs up and down slightly
  const char2Y = Math.sin((progress / 100) * Math.PI * 10) * 5;

  return (
    <div className="w-full h-full bg-zinc-950 relative flex flex-col items-center justify-center font-mono overflow-hidden select-none">
      
      {/* 3D Scene Viewport */}
      <div 
         className="w-full flex-1 relative perspective-[800px] overflow-hidden"
         style={{ perspective: "800px" }}
      >
         {/* Letterbox borders */}
         <div className="absolute top-0 w-full h-12 bg-black z-50 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center px-4 justify-between">
            <span className="text-red-500 font-bold text-xs uppercase flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               REC
            </span>
            <span className="text-zinc-500 text-xs">
               00:00:{Math.floor(progress / 1.6).toString().padStart(2, '0')}
            </span>
         </div>
         <div className="absolute bottom-0 w-full h-12 bg-black z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" />

         {/* The Scene Container (Camera applied here) */}
         <motion.div 
            className="absolute inset-0 flex items-center justify-center transform-style-3d"
            animate={{
               rotateX: transform.rotateX,
               rotateY: transform.rotateY,
               scale: transform.scale,
               x: transform.x,
               y: transform.y,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
         >
            
            {/* The Floor */}
            <div 
               className="absolute w-[600px] h-[600px] bg-zinc-900 border border-zinc-800"
               style={{ 
                  transform: "rotateX(90deg) translateZ(-100px)", 
                  backgroundImage: "linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)", 
                  backgroundSize: "50px 50px" 
               }}
            >
               {/* Hidden Message on the floor (Only readable from Overhead Cam 3) */}
               <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white font-bold text-4xl uppercase tracking-[1em] -rotate-45 pointer-events-none">
                  {config.body || "THEY NEVER KNEW"}
               </div>
            </div>

            {/* Back Wall */}
            <div 
               className="absolute w-[600px] h-[300px] bg-zinc-800 border-b border-black"
               style={{ transform: "translateZ(-300px) translateY(-50px)" }}
            />

            {/* Hidden Message on the back wall (Readable from Cam 2) */}
            <div 
               className="absolute w-[200px] h-[100px] bg-black border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 text-center p-2 shadow-2xl"
               style={{ transform: "translateZ(-299px) translateY(-100px) translateX(100px)" }}
            >
               "I've been leaving these notes everywhere. Hope you find them."
            </div>

            {/* Hidden item in the foreground (Readable from Cam 1) */}
            <div 
               className="absolute w-[100px] h-[150px] bg-zinc-700 flex flex-col justify-end p-2 border-l border-zinc-600"
               style={{ transform: "translateZ(200px) translateX(-200px) translateY(-25px)" }}
            >
               <span className="text-[8px] text-zinc-400 rotate-90 origin-bottom-left whitespace-nowrap">
                  EVIDENCE TAG #402
               </span>
            </div>

            {/* Character 1 */}
            <motion.div 
               className="absolute w-12 h-32 bg-blue-500 shadow-2xl rounded-sm"
               style={{ 
                  transformStyle: "preserve-3d",
                  backgroundColor: primaryColor,
                  border: "2px solid rgba(255,255,255,0.2)"
               }}
               animate={{ 
                  x: char1X, 
                  y: -40,
                  rotateY: (progress * 10) % 360 // slowly spinning? or just pacing
               }}
            >
               {/* "Face" */}
               <div className="absolute top-2 right-2 w-4 h-4 bg-white/50 rounded-full" style={{ transform: "translateZ(1px)" }} />
            </motion.div>

            {/* Character 2 */}
            <motion.div 
               className="absolute w-16 h-24 bg-zinc-600 shadow-2xl rounded-sm"
               style={{ 
                  transformStyle: "preserve-3d",
               }}
               animate={{ 
                  x: 100, 
                  z: -100,
                  y: -12 + char2Y 
               }}
            >
               {/* "Face" */}
               <div className="absolute top-2 left-2 w-6 h-4 bg-white/20 rounded-full" style={{ transform: "translateZ(1px)" }} />
            </motion.div>

         </motion.div>
      </div>

      {/* Control Deck */}
      <div className="w-full h-32 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4 z-50 p-4">
         
         {[
            { id: 1, name: "CAM 1", desc: "Profile" },
            { id: 2, name: "CAM 2", desc: "Over Shoulder" },
            { id: 3, name: "CAM 3", desc: "Overhead" }
         ].map(cam => {
            const isActive = activeCamera === cam.id;
            const isUsed = camerasUsed[cam.id];

            return (
               <button
                  key={cam.id}
                  onClick={() => switchCamera(cam.id)}
                  className={`relative flex flex-col items-center justify-center w-24 h-20 rounded-md border-2 transition-colors ${
                     isActive 
                        ? `border-[${primaryColor}] bg-zinc-800` 
                        : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800'
                  }`}
                  style={{ borderColor: isActive ? primaryColor : undefined }}
               >
                  <Camera size={20} className={isActive ? "text-white" : "text-zinc-500"} />
                  <span className={`text-xs font-bold mt-2 ${isActive ? "text-white" : "text-zinc-400"}`}>
                     {cam.name}
                  </span>
                  
                  {/* Indicator if this view revealed something (already visited) */}
                  {isUsed && !isActive && (
                     <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
               </button>
            )
         })}
         
      </div>

      {/* Status Overlay */}
      {Object.keys(camerasUsed).length === 3 && (
         <div className="absolute top-16 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 z-50 backdrop-blur-sm">
            <Check size={12} />
            All angles covered
         </div>
      )}

      {/* Editor Bypass */}
      {mode === "editor-preview" && Object.keys(camerasUsed).length < 3 && (
         <div className="absolute top-16 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setCamerasUsed({ 1: true, 2: true, 3: true });
                  if (onComplete) onComplete();
               }}
               className="bg-zinc-800 text-white border border-zinc-700 px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Check All Cams (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
