"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Map, MapPin, FastForward } from "lucide-react";

export function CalorieMileageMap({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e2e8f0"]; // slate-200

  const [food, setFood] = useState("Cheeseburger");
  const [calories, setCalories] = useState(850);
  const [mapped, setMapped] = useState(false);

  // Math: Approx 100 calories per mile of walking (simplified)
  const miles = calories / 100;

  const handleMap = () => {
     setMapped(true);
     if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([10, 50, 10]);
     if (onComplete) setTimeout(onComplete, 6000);
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-200 text-slate-900" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Fake Map Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=1200")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) contrast(120%)' }} />

      <div className="relative z-20 p-6 flex-1 flex flex-col pointer-events-none">
         
         <AnimatePresence mode="wait">
            {!mapped ? (
               <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="bg-white p-6 rounded-3xl shadow-2xl pointer-events-auto border border-slate-100"
               >
                  <div className="flex items-center gap-2 text-slate-400 mb-6 border-b border-slate-100 pb-4">
                     <Map size={20} />
                     <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Caloric Routing</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Food Logged</label>
                        <input type="text" value={food} onChange={e => setFood(e.target.value)} className="w-full text-2xl font-black bg-transparent outline-none border-b-2 border-slate-200 focus:border-red-500 transition-colors py-1" />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Calories</label>
                        <input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-full text-2xl font-black bg-transparent outline-none border-b-2 border-slate-200 focus:border-red-500 transition-colors py-1 text-red-500" />
                     </div>
                  </div>

                  <button 
                     onClick={handleMap}
                     className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95"
                  >
                     <FastForward size={18} /> Generate Route
                  </button>
               </motion.div>
            ) : (
               <motion.div 
                  key="mapUI"
                  className="flex-1 flex flex-col justify-between"
               >
                  {/* Top HUD */}
                  <motion.div 
                     initial={{ y: -50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center"
                  >
                     <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Burn</div>
                        <div className="text-xl font-black text-red-400">{calories} kcal</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Required Distance</div>
                        <div className="text-xl font-black">{miles.toFixed(1)} mi</div>
                     </div>
                  </motion.div>

                  {/* Route Drawing (SVG over background) */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                     <svg width="200" height="200" viewBox="0 0 100 100" className="overflow-visible">
                        {/* Fake map route line */}
                        <motion.path 
                           d="M 50 50 Q 20 20 10 50 T 50 90 T 90 50 Q 80 20 50 50" 
                           fill="none" 
                           stroke="#ef4444" 
                           strokeWidth="4"
                           strokeLinecap="round"
                           strokeDasharray="4 4"
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1 }}
                           transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        <motion.circle cx="50" cy="50" r="4" fill="#3b82f6" stroke="white" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                        
                        {/* Destination pin */}
                        <motion.g 
                           initial={{ opacity: 0, y: -20 }} 
                           animate={{ opacity: 1, y: 0 }} 
                           transition={{ delay: 2, type: "spring" }}
                        >
                           <circle cx="50" cy="90" r="3" fill="#ef4444" />
                           <path d="M 50 90 L 50 80" stroke="#ef4444" strokeWidth="2" />
                           <rect x="40" y="70" width="20" height="10" rx="2" fill="#ef4444" />
                        </motion.g>
                     </svg>
                  </div>

                  {/* Bottom HUD */}
                  <motion.div 
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 2.2 }}
                     className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 mt-auto text-center pointer-events-auto"
                  >
                     <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={24} />
                     </div>
                     <h3 className="text-lg font-black text-slate-800 mb-1">Start Walking</h3>
                     <p className="text-sm text-slate-500 font-medium">To burn off the {food}, you must walk the highlighted {miles.toFixed(1)} mile route.</p>
                  </motion.div>

               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
