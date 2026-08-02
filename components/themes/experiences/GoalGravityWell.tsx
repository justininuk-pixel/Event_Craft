"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Orbit } from "lucide-react";

type SubTask = {
  id: string;
  name: string;
  completed: boolean;
  angle: number;
  radius: number;
};

export function GoalGravityWell({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#c084fc"; // purple-400
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#020617"]; // slate-950

  const [tasks, setTasks] = useState<SubTask[]>([
     { id: "t1", name: "Design DB", completed: false, angle: 0, radius: 120 },
     { id: "t2", name: "Build API", completed: false, angle: 72, radius: 140 },
     { id: "t3", name: "Auth Flow", completed: false, angle: 144, radius: 110 },
     { id: "t4", name: "UI Components", completed: false, angle: 216, radius: 130 },
     { id: "t5", name: "Deployment", completed: false, angle: 288, radius: 150 },
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  const isFinished = completedCount === tasks.length;
  
  // Base mass = 50. Each task adds 30.
  const coreMass = 50 + (completedCount * 30);
  const gravityStrength = 1 + (completedCount * 0.5);

  const handleComplete = (id: string) => {
     setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 50, 100]);
     
     if (completedCount + 1 === tasks.length) {
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 300, 100, 500]);
        if (onComplete) setTimeout(onComplete, 5000);
     }
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-950 text-purple-200" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      <div className="p-6 text-center z-10">
         <h2 className="text-xl font-black uppercase tracking-widest text-purple-300 flex justify-center items-center gap-2">
            <Orbit size={24} className="text-purple-500" /> Gravity Well
         </h2>
         <p className="text-xs text-purple-500/50 mt-1">Completing tasks increases the mass of the core.</p>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 w-full z-10 overflow-hidden">
         
         <div className="relative w-80 h-80 flex items-center justify-center">
            
            {/* The Core Goal */}
            <motion.div 
               className="absolute rounded-full bg-purple-600 shadow-[0_0_50px_rgba(192,132,252,0.6)] flex items-center justify-center border-4 border-purple-400 z-20"
               animate={{ 
                  width: coreMass, 
                  height: coreMass,
                  boxShadow: `0 0 ${50 + coreMass}px rgba(192,132,252,${0.4 + completedCount*0.1})`
               }}
               transition={{ type: "spring", bounce: 0.4 }}
            >
               <span className="text-white font-black uppercase tracking-widest text-xs z-30 drop-shadow-md">
                  {isFinished ? "Launched" : "Launch App"}
               </span>
               {/* Pulsing gravity waves */}
               <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-purple-500"
                  animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                  transition={{ duration: 2 / gravityStrength, repeat: Infinity, ease: "linear" }}
               />
            </motion.div>

            {/* Orbiting Tasks */}
            {tasks.map(task => {
               
               if (task.completed) {
                  // Wait, if it's completed, it's sucked into the center. 
                  // It's removed from orbit.
                  return null;
               }

               // Faster rotation based on gravity strength
               const orbitDuration = 20 / gravityStrength;

               return (
                  <motion.div
                     key={task.id}
                     className="absolute w-full h-full pointer-events-none"
                     animate={{ rotate: 360 }}
                     transition={{ duration: orbitDuration, repeat: Infinity, ease: "linear" }}
                     style={{ transformOrigin: "center" }}
                  >
                     <motion.div 
                        className="absolute w-12 h-12 bg-slate-800 rounded-full border border-purple-500/50 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-slate-700 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
                        style={{ 
                           left: `calc(50% + ${Math.cos(task.angle * Math.PI / 180) * task.radius}px - 24px)`,
                           top: `calc(50% + ${Math.sin(task.angle * Math.PI / 180) * task.radius}px - 24px)`
                        }}
                        onClick={() => handleComplete(task.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                     >
                        <div className="absolute -top-6 whitespace-nowrap text-[10px] uppercase font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded">
                           {task.name}
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500 group-hover:bg-purple-500 transition-colors" />
                     </motion.div>
                  </motion.div>
               );
            })}

         </div>

      </div>

    </div>
  );
}
