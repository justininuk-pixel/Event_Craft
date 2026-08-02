"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Droplet, Sprout, Plus, Check } from "lucide-react";

// Mock database of plant watering frequencies in seconds (for demo purposes)
// Realistically these would be days
const PLANT_DB: Record<string, number> = {
  "Succulent": 30,
  "Fern": 10,
  "Monstera": 20,
  "Snake Plant": 40,
  "Orchid": 15,
};

type PlantInstance = {
  id: string;
  species: string;
  lastWatered: number; // timestamp
};

export function PlantHydrationAlgorithm({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#10b981"; // green
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [plants, setPlants] = useState<PlantInstance[]>([
     { id: "1", species: "Fern", lastWatered: Date.now() - 5000 },
     { id: "2", species: "Succulent", lastWatered: Date.now() - 15000 },
  ]);

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedSpecies, setSelectedSpecies] = useState("Monstera");

  useEffect(() => {
     const interval = setInterval(() => {
        setCurrentTime(Date.now());
     }, 1000);
     return () => clearInterval(interval);
  }, []);

  // Completion check
  useEffect(() => {
     if (plants.length >= 4 && onComplete) {
        onComplete();
     }
  }, [plants.length, onComplete]);

  const addPlant = () => {
     setPlants(prev => [...prev, {
        id: Date.now().toString(),
        species: selectedSpecies,
        lastWatered: Date.now()
     }]);
  };

  const waterPlant = (id: string) => {
     setPlants(prev => prev.map(p => 
        p.id === id ? { ...p, lastWatered: Date.now() } : p
     ));
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-y-auto text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Ambience */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none z-0"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/leaf.png')" }} 
      />

      <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 z-10">
         
         {/* Header */}
         <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-slate-100">
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Sprout className="text-emerald-500" />
                  {config.title || "Plant Hydration"}
               </h2>
               <p className="text-slate-500 font-medium text-sm mt-1">
                  Algorithmic care tracking based on species needs.
               </p>
            </div>
            
            {/* Add Plant Form */}
            <div className="flex items-center gap-2">
               <select 
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="bg-slate-100 border-none rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none"
               >
                  {Object.keys(PLANT_DB).map(s => (
                     <option key={s} value={s}>{s}</option>
                  ))}
               </select>
               <button 
                  onClick={addPlant}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
               >
                  <Plus size={20} />
               </button>
            </div>
         </div>

         {/* Plants Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {plants.map(plant => {
               const frequencyMs = PLANT_DB[plant.species] * 1000;
               const elapsed = currentTime - plant.lastWatered;
               
               // Ratio from 0 (just watered) to 1 (needs water)
               const thirstRatio = Math.min(1, elapsed / frequencyMs);
               
               // Interpolate color from Blue (watered) to Brown (thirsty)
               // Blue: #3b82f6 (59, 130, 246)
               // Brown: #92400e (146, 64, 14)
               const r = Math.round(59 + (146 - 59) * thirstRatio);
               const g = Math.round(130 + (64 - 130) * thirstRatio);
               const b = Math.round(246 + (14 - 246) * thirstRatio);
               
               const bgColor = `rgb(${r}, ${g}, ${b})`;
               const needsWater = thirstRatio >= 0.9;

               return (
                  <div 
                     key={plant.id} 
                     className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white"
                  >
                     {/* Dynamic Background */}
                     <div 
                        className="absolute inset-0 opacity-20 transition-colors duration-1000"
                        style={{ backgroundColor: bgColor }}
                     />

                     <div className="relative p-6 flex flex-col h-full">
                        
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h3 className="font-bold text-lg">{plant.species}</h3>
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                 Cycle: {PLANT_DB[plant.species]}s
                              </span>
                           </div>
                           
                           {/* Status indicator */}
                           <div className={`w-3 h-3 rounded-full shadow-sm ${needsWater ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                           <div 
                              className="h-full transition-all duration-1000"
                              style={{ 
                                 width: `${thirstRatio * 100}%`,
                                 backgroundColor: bgColor 
                              }}
                           />
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                           <span className="text-sm font-bold" style={{ color: bgColor }}>
                              {needsWater ? "Thirsty!" : "Hydrated"}
                           </span>
                           <button 
                              onClick={() => waterPlant(plant.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur shadow-sm rounded-lg border border-slate-200 hover:bg-white transition-colors text-blue-600 font-bold text-sm"
                           >
                              <Droplet size={16} className={needsWater ? "animate-bounce" : ""} />
                              Water
                           </button>
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && plants.length < 4 && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setPlants(prev => [
                     ...prev, 
                     { id: "e1", species: "Orchid", lastWatered: Date.now() },
                     { id: "e2", species: "Snake Plant", lastWatered: Date.now() }
                  ]);
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Add Plants (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
