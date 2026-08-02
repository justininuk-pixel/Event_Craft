"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { Play, Pause, Phone, PhoneForwarded } from "lucide-react";

type Voicemail = {
  id: string;
  sender: string;
  date: string;
  duration: string;
  transcription: string;
  isHeard: boolean;
};

export function VoicemailInbox({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];
  const textPrimary = palette.text || "#0f172a";
  const textSecondary = palette.textSecondary || "#64748b";

  // Mock data representing the out-of-order narrative
  const [messages, setMessages] = useState<Voicemail[]>([
    { id: "msg1", sender: "Unknown", date: "Tuesday 4:12 PM", duration: "0:24", transcription: "I don't know if you're getting these, but I found the box.", isHeard: false },
    { id: "msg2", sender: "Unknown", date: "Monday 9:00 AM", duration: "0:15", transcription: "Hey, it's me. Just calling to say I'm on my way.", isHeard: false },
    { id: "msg3", sender: "Unknown", date: "Wednesday 1:45 AM", duration: "0:42", transcription: "Listen to me very carefully. Do not open the door.", isHeard: false },
    { id: "msg4", sender: "Unknown", date: "Tuesday 8:30 PM", duration: "0:09", transcription: "Where are you?! You were supposed to be here an hour ago.", isHeard: false },
    { id: "msg5", sender: "Unknown", date: "Monday 10:15 AM", duration: "0:30", transcription: "I think someone is following me. I'm going to take the long way around.", isHeard: false },
  ]);

  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Playback simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeMessage) {
      timer = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            // Message finished
            setMessages(currentMessages => 
               currentMessages.map(m => m.id === activeMessage ? { ...m, isHeard: true } : m)
            );
            setActiveMessage(null);
            return 0;
          }
          return prev + 2; // Arbitrary speed for mockup
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeMessage]);

  // Check completion
  useEffect(() => {
    if (messages.every(m => m.isHeard) && onComplete) {
      onComplete();
    }
  }, [messages, onComplete]);

  const handlePlay = (id: string) => {
    if (activeMessage === id) {
      setActiveMessage(null); // Pause
    } else {
      setActiveMessage(id);
      setPlaybackProgress(0);
      
      // Mark as heard immediately upon playing
      setMessages(currentMessages => 
         currentMessages.map(m => m.id === id ? { ...m, isHeard: true } : m)
      );
    }
  };

  return (
    <div 
      className="w-full h-full relative font-sans flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* iOS-style Header */}
      <div className="pt-12 pb-4 px-6 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex flex-col items-center shadow-sm">
         <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: textPrimary }}>
            {config.title || "Voicemail"}
         </h1>
         <div className="flex gap-4 w-full justify-around mt-2">
            <button className="flex flex-col items-center gap-1 opacity-50">
               <Phone size={20} />
               <span className="text-[10px] font-medium uppercase tracking-wider">Keypad</span>
            </button>
            <button className="flex flex-col items-center gap-1" style={{ color: primaryColor }}>
               <div className="relative">
                  <PhoneForwarded size={20} />
                  {messages.some(m => !m.isHeard) && (
                     <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                  )}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-wider">Voicemail</span>
            </button>
         </div>
      </div>

      {/* Voicemail List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10 pb-24">
         {messages.map((msg) => {
            const isActive = activeMessage === msg.id;
            
            return (
               <div 
                  key={msg.id} 
                  className={`bg-white rounded-2xl p-4 shadow-sm border border-black/5 transition-all ${isActive ? 'ring-2' : ''}`}
                  style={{ '--tw-ring-color': isActive ? primaryColor : 'transparent' } as React.CSSProperties}
               >
                  <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => handlePlay(msg.id)}>
                     <div className="flex items-center gap-3">
                        {!msg.isHeard && (
                           <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        )}
                        <div>
                           <div className="font-semibold text-base" style={{ color: textPrimary }}>{msg.sender}</div>
                           <div className="text-xs" style={{ color: textSecondary }}>{msg.date}</div>
                        </div>
                     </div>
                     <div className="text-xs font-mono opacity-60" style={{ color: textSecondary }}>
                        {msg.duration}
                     </div>
                  </div>

                  {isActive && (
                     <div className="mt-4 border-t border-black/5 pt-4">
                        
                        {/* Scrubber */}
                        <div className="w-full h-1 bg-gray-200 rounded-full mb-4 relative overflow-hidden">
                           <div 
                              className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear"
                              style={{ width: `${playbackProgress}%`, backgroundColor: primaryColor }}
                           />
                        </div>
                        
                        {/* Controls */}
                        <div className="flex justify-center mb-6">
                           <button 
                              onClick={() => handlePlay(msg.id)}
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
                              style={{ backgroundColor: primaryColor }}
                           >
                              <Pause size={20} fill="currentColor" />
                           </button>
                        </div>

                        {/* Transcription */}
                        <div className="px-4 text-center">
                           <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50" style={{ color: textSecondary }}>
                              Transcription
                           </h4>
                           <p className="text-sm font-medium italic leading-relaxed" style={{ color: textPrimary }}>
                              "{msg.transcription}"
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            );
         })}
      </div>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && messages.some(m => !m.isHeard) && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 p-2 rounded shadow z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setMessages(m => m.map(msg => ({ ...msg, isHeard: true })));
                  if (onComplete) onComplete();
               }}
               className="text-[10px] uppercase font-bold text-black"
            >
               Listen to All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
