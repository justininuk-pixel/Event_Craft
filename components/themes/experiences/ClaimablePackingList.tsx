"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Backpack, User, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UserProfile = {
  id: string;
  name: string;
  color: string;
};

type PackingItem = {
  id: string;
  name: string;
  claimedBy: string | null; // null if unclaimed, UserProfile.id if claimed
};

const MOCK_USERS: UserProfile[] = [
   { id: "u1", name: "Alex", color: "#3b82f6" }, // Blue
   { id: "u2", name: "Jordan", color: "#ef4444" }, // Red
   { id: "u3", name: "Sam", color: "#10b981" }, // Green
   { id: "u4", name: "Taylor", color: "#8b5cf6" }, // Purple
];

export function ClaimablePackingList({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [items, setItems] = useState<PackingItem[]>([
     { id: "i1", name: "Tent (4 Person)", claimedBy: "u2" },
     { id: "i2", name: "Cooler with Ice", claimedBy: null },
     { id: "i3", name: "Bluetooth Speaker", claimedBy: null },
     { id: "i4", name: "First Aid Kit", claimedBy: "u4" },
     { id: "i5", name: "Marshmallows & Graham Crackers", claimedBy: null },
     { id: "i6", name: "Firewood", claimedBy: null },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
     if (items.every(i => i.claimedBy !== null) && onComplete) {
        onComplete();
     }
  }, [items, onComplete]);

  const handleClaim = (itemId: string) => {
     if (!currentUser) {
        setNotification("Please select your name first!");
        setTimeout(() => setNotification(null), 2000);
        return;
     }

     setItems(prev => prev.map(item => {
        if (item.id === itemId) {
           if (item.claimedBy === null) {
              return { ...item, claimedBy: currentUser.id };
           } else if (item.claimedBy === currentUser.id) {
              return { ...item, claimedBy: null }; // Unclaim your own
           } else {
              // Someone else claimed it, shouldn't be clickable, but just in case
              return item;
           }
        }
        return item;
     }));
  };

  const simulateOtherUserClaim = () => {
     const unclaimed = items.filter(i => i.claimedBy === null);
     if (unclaimed.length > 0) {
        const randomItem = unclaimed[Math.floor(Math.random() * unclaimed.length)];
        const randomOtherUser = MOCK_USERS.find(u => u.id !== currentUser?.id) || MOCK_USERS[0];
        
        setItems(prev => prev.map(item => 
           item.id === randomItem.id ? { ...item, claimedBy: randomOtherUser.id } : item
        ));
     }
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Background Ambience */}
      <div 
         className="absolute inset-0 opacity-5 pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/topography.png')" }} 
      />

      <div className="w-full max-w-lg mx-auto bg-white shadow-xl flex flex-col h-full z-10 sm:border-x sm:border-slate-200">
         
         {/* Header */}
         <div className="p-6 bg-slate-900 text-white flex flex-col relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
               <Backpack size={160} />
            </div>
            
            <h2 className="text-2xl font-black tracking-tight mb-1 relative z-10">
               {config.title || "Camping Trip"}
            </h2>
            <p className="text-slate-400 font-medium text-sm relative z-10">
               {config.body || "Claim what you're bringing so we don't double up."}
            </p>

            {/* User Selection */}
            {!currentUser && (
               <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 relative z-10">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                     <User size={16} />
                     <span>Who are you?</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     {MOCK_USERS.map(user => (
                        <button
                           key={user.id}
                           onClick={() => setCurrentUser(user)}
                           className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 transition-colors"
                        >
                           <div className="w-4 h-4 rounded-full" style={{ backgroundColor: user.color }} />
                           <span className="text-sm font-medium">{user.name}</span>
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {currentUser && (
               <div className="mt-4 flex items-center justify-between relative z-10 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-inner" style={{ backgroundColor: currentUser.color }}>
                        {currentUser.name.charAt(0)}
                     </div>
                     <span className="font-bold text-slate-200">{currentUser.name}</span>
                  </div>
                  <button 
                     onClick={() => setCurrentUser(null)}
                     className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                  >
                     Change
                  </button>
               </div>
            )}
         </div>

         {/* Notification Area */}
         <AnimatePresence>
            {notification && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center gap-2 text-red-600 font-bold text-sm"
               >
                  <AlertCircle size={16} />
                  {notification}
               </motion.div>
            )}
         </AnimatePresence>

         {/* Packing List */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-3">
            {items.map(item => {
               const isClaimedByMe = item.claimedBy === currentUser?.id;
               const isClaimedByOther = item.claimedBy !== null && !isClaimedByMe;
               const claimingUser = MOCK_USERS.find(u => u.id === item.claimedBy);

               return (
                  <motion.div 
                     layout
                     key={item.id}
                     onClick={() => !isClaimedByOther && handleClaim(item.id)}
                     className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        isClaimedByOther 
                           ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                           : isClaimedByMe
                              ? 'bg-white shadow-md'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'
                     }`}
                     style={{
                        borderColor: isClaimedByMe && claimingUser ? claimingUser.color : undefined
                     }}
                  >
                     <div className="flex items-center gap-4 flex-1">
                        <div 
                           className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                              isClaimedByMe 
                                 ? 'text-white' 
                                 : isClaimedByOther
                                    ? 'bg-slate-300 text-slate-50'
                                    : 'border-2 border-slate-300'
                           }`}
                           style={{ backgroundColor: (isClaimedByMe && claimingUser) ? claimingUser.color : undefined }}
                        >
                           {item.claimedBy !== null && <Check size={14} strokeWidth={3} />}
                        </div>
                        
                        <span className={`font-semibold ${isClaimedByOther ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                           {item.name}
                        </span>
                     </div>
                     
                     {/* Indicator of who claimed it */}
                     {claimingUser && (
                        <div className="flex items-center gap-2 pl-4 border-l border-slate-200/50">
                           <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: claimingUser.color }}>
                              {claimingUser.name.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-500 hidden sm:inline-block w-12 truncate">
                              {claimingUser.name}
                           </span>
                        </div>
                     )}
                  </motion.div>
               )
            })}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
            <button 
               onClick={simulateOtherUserClaim}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded shadow-sm hover:bg-black/30 transition-colors"
            >
               Other User Claims (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
