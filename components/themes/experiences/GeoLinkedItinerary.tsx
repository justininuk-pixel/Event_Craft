"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, CheckCircle2, Navigation2 } from "lucide-react";

type ItineraryItem = {
  id: string;
  time: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  completed: boolean;
};

const DEFAULT_ITEMS: ItineraryItem[] = [
   { id: "i1", time: "09:00 AM", title: "Breakfast at Cafe", address: "123 Main St, New York, NY", lat: 40.7128, lng: -74.0060, completed: false },
   { id: "i2", time: "11:30 AM", title: "Museum Tour", address: "Central Park West, New York, NY", lat: 40.7812, lng: -73.9665, completed: false },
   { id: "i3", time: "02:00 PM", title: "Lunch with Team", address: "456 Broadway, New York, NY", lat: 40.7222, lng: -73.9983, completed: false },
   { id: "i4", time: "05:00 PM", title: "Airport Departure", address: "JFK Airport, Queens, NY", lat: 40.6413, lng: -73.7781, completed: false },
];

export function GeoLinkedItinerary({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"];

  const [items, setItems] = useState<ItineraryItem[]>(DEFAULT_ITEMS);

  const toggleComplete = (id: string) => {
     setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
     
     // Check if all complete
     const allComplete = items.every(item => item.id === id ? !item.completed : item.completed);
     if (allComplete && onComplete) onComplete();
  };

  const getGoogleMapsLink = (lat: number, lng: number) => {
     return `comgooglemaps://?q=${lat},${lng}`;
  };
  
  const getAppleMapsLink = (lat: number, lng: number) => {
     return `maps://?q=${lat},${lng}`;
  };
  
  // Fallback to web if native scheme fails (standard URL)
  const getWebMapsLink = (lat: number, lng: number) => {
     return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Map Texture Background */}
      <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none"
         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cartographer.png')" }} 
      />

      <div className="w-full max-w-xl mx-auto flex flex-col h-full z-10 sm:border-x sm:border-slate-200 bg-white/50 backdrop-blur-sm">
         
         {/* Header */}
         <div className="p-8 pb-6 border-b border-slate-200 bg-white relative shadow-sm">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900 flex items-center gap-3">
               <MapPin size={28} style={{ color: primaryColor }} />
               {config.title || "Travel Itinerary"}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
               {config.body || "Tap any location to instantly launch your maps app for directions."}
            </p>
         </div>

         {/* Timeline */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
            {items.map((item, idx) => {
               const isFirst = idx === 0;
               const isLast = idx === items.length - 1;
               
               return (
                  <div key={item.id} className="flex gap-4 relative">
                     
                     {/* Timeline Line & Node */}
                     <div className="flex flex-col items-center mt-1">
                        <button 
                           onClick={() => toggleComplete(item.id)}
                           className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                              item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 hover:border-blue-400'
                           }`}
                        >
                           {item.completed && <CheckCircle2 size={14} />}
                        </button>
                        {!isLast && (
                           <div className={`w-0.5 flex-1 mt-2 mb-2 ${item.completed ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                        )}
                     </div>

                     {/* Content Card */}
                     <motion.div 
                        className={`flex-1 bg-white p-5 rounded-2xl shadow-sm border transition-all ${
                           item.completed ? 'border-emerald-100 opacity-60' : 'border-slate-200 hover:shadow-md hover:border-blue-200'
                        }`}
                        whileHover={{ x: item.completed ? 0 : 4 }}
                     >
                        <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                              <Clock size={14} />
                              {item.time}
                           </div>
                           
                           {/* Deep Links Menu - Hidden on Desktop typically, but shown for demo */}
                           <div className="flex gap-2">
                              <a 
                                 href={getWebMapsLink(item.lat, item.lng)}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                                 title="Open in Web Maps"
                              >
                                 <Navigation size={16} />
                              </a>
                              <a 
                                 href={getAppleMapsLink(item.lat, item.lng)}
                                 className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors sm:hidden"
                                 title="Open in Apple Maps"
                              >
                                 <Navigation2 size={16} />
                              </a>
                           </div>
                        </div>

                        <h3 className={`text-xl font-black tracking-tight mb-1 ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                           {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                           <MapPin size={14} className="shrink-0" />
                           {item.address}
                        </p>

                        {/* Primary Call to Action Deep Link */}
                        {!item.completed && (
                           <a
                              href={getWebMapsLink(item.lat, item.lng)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                              style={{ backgroundColor: primaryColor }}
                           >
                              <Navigation size={16} className="fill-white" />
                              Navigate Here
                           </a>
                        )}

                     </motion.div>
                  </div>
               )
            })}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !items.every(i => i.completed) && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => setItems(items.map(i => ({...i, completed: true})))}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded hover:bg-black/30"
            >
               Complete All (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
