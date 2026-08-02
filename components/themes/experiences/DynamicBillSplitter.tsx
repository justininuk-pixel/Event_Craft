"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { DollarSign, Users, CheckCircle } from "lucide-react";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  percentage: number;
};

export function DynamicBillSplitter({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [totalBill, setTotalBill] = useState(100);
  const [friends, setFriends] = useState<Friend[]>([
     { id: "1", name: "Alice", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alice&backgroundColor=b6e3f4", percentage: 25 },
     { id: "2", name: "Bob", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Bob&backgroundColor=ffdfbf", percentage: 25 },
     { id: "3", name: "Charlie", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Charlie&backgroundColor=d1d4f9", percentage: 25 },
     { id: "4", name: "Diana", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Diana&backgroundColor=c0aede", percentage: 25 },
  ]);
  const [isSettled, setIsSettled] = useState(false);

  const handlePercentageChange = (id: string, newPercentage: number) => {
     // Ensure within bounds
     newPercentage = Math.max(0, Math.min(100, newPercentage));

     setFriends(prev => {
        const targetFriendIndex = prev.findIndex(f => f.id === id);
        if (targetFriendIndex === -1) return prev;
        
        const oldPercentage = prev[targetFriendIndex].percentage;
        const diff = newPercentage - oldPercentage;
        
        // Find how many other friends have room to absorb the diff
        let otherFriends = prev.map((f, i) => ({ ...f, index: i })).filter(f => f.id !== id);
        
        // If we are increasing a percentage, others must decrease
        if (diff > 0) {
           // We need to subtract `diff` from the others
           let remainingDiff = diff;
           let iterations = 0; // prevent infinite loops in floating point weirdness
           
           while (remainingDiff > 0.01 && otherFriends.length > 0 && iterations < 100) {
              const slice = remainingDiff / otherFriends.length;
              const nextOthers = [];
              
              for (const f of otherFriends) {
                 if (f.percentage >= slice) {
                    f.percentage -= slice;
                    remainingDiff -= slice;
                    nextOthers.push(f);
                 } else {
                    remainingDiff -= f.percentage;
                    f.percentage = 0;
                 }
              }
              otherFriends = nextOthers;
              iterations++;
           }
        } 
        // If we are decreasing a percentage, others must increase
        else if (diff < 0) {
           let remainingDiff = Math.abs(diff);
           let iterations = 0;
           
           while (remainingDiff > 0.01 && otherFriends.length > 0 && iterations < 100) {
              const slice = remainingDiff / otherFriends.length;
              const nextOthers = [];
              
              for (const f of otherFriends) {
                 const availableSpace = 100 - f.percentage;
                 if (availableSpace >= slice) {
                    f.percentage += slice;
                    remainingDiff -= slice;
                    nextOthers.push(f);
                 } else {
                    remainingDiff -= availableSpace;
                    f.percentage = 100;
                 }
              }
              otherFriends = nextOthers;
              iterations++;
           }
        }

        // Reconstruct the array
        const newFriends = [...prev];
        newFriends[targetFriendIndex].percentage = newPercentage;
        
        // Ensure total is 100 to fix any floating point rounding errors at the end
        const total = newFriends.reduce((sum, f) => sum + f.percentage, 0);
        if (Math.abs(total - 100) > 0.1) {
           // just jam the remainder onto the first non-target friend
           const firstOther = newFriends.find(f => f.id !== id);
           if (firstOther) {
              firstOther.percentage += (100 - total);
           }
        }
        
        return newFriends;
     });
  };

  const handleSettle = () => {
     setIsSettled(true);
     if (onComplete) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center p-4 sm:p-8 font-sans overflow-y-auto text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col z-10 border border-slate-100">
         
         {/* Header / Total Bill */}
         <div className="text-center mb-8 relative">
            <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">
               {config.title || "Split the Bill"}
            </h2>
            <div className="relative inline-flex items-center justify-center">
               <DollarSign size={32} className="text-slate-400 absolute left-2" />
               <input 
                  type="number" 
                  value={totalBill}
                  onChange={(e) => setTotalBill(Math.max(0, Number(e.target.value)))}
                  disabled={isSettled}
                  className="text-5xl font-black text-center pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl w-48 focus:border-purple-500 focus:outline-none transition-colors"
                  style={{ color: primaryColor }}
               />
            </div>
         </div>

         {/* Sliders Area */}
         <div className="space-y-6 mb-8">
            {friends.map(friend => {
               const dollarAmount = (totalBill * (friend.percentage / 100)).toFixed(2);
               return (
                  <div key={friend.id} className={`flex flex-col gap-3 p-4 rounded-xl border ${isSettled ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                     
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full shadow-sm" />
                           <span className="font-bold text-lg">{friend.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-xl font-black text-slate-700">${dollarAmount}</span>
                           <span className="text-xs font-bold text-slate-400">{friend.percentage.toFixed(0)}%</span>
                        </div>
                     </div>

                     <input 
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={friend.percentage}
                        onChange={(e) => handlePercentageChange(friend.id, Number(e.target.value))}
                        disabled={isSettled}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                           background: `linear-gradient(to right, ${primaryColor} ${friend.percentage}%, #e2e8f0 ${friend.percentage}%)`
                        }}
                     />
                  </div>
               )
            })}
         </div>

         {/* Action */}
         <button 
            onClick={handleSettle}
            disabled={isSettled}
            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
               isSettled 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                  : 'text-white hover:opacity-90 shadow-xl'
            }`}
            style={{ backgroundColor: isSettled ? undefined : primaryColor }}
         >
            {isSettled ? (
               <><CheckCircle size={24} /> Settled</>
            ) : (
               <><Users size={24} /> Settle Up</>
            )}
         </button>

      </div>
      
      {/* Custom styles for range thumb */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${primaryColor};
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        input[type=range]:disabled::-webkit-slider-thumb {
           cursor: not-allowed;
           border-color: #cbd5e1;
        }
      `}} />

      {/* Editor Bypass */}
      {mode === "editor-preview" && !isSettled && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={handleSettle}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Settle (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
