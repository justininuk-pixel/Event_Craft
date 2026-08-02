"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Plane, Car, Zap } from "lucide-react";

type City = { name: string; lat: number; lng: number };

const cities: City[] = [
  { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437 },
];

// Haversine formula
function getDistanceFromLatLonInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in miles
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function DistanceLineGPS({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1"; // indigo-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#e0e7ff"]; // indigo-50

  // Assume Sender is in NY by default
  const senderCity = cities[0];
  const [receiverCity, setReceiverCity] = useState<City | null>(null);
  const [calculating, setCalculating] = useState(false);

  const handleSelectCity = (city: City) => {
     setCalculating(true);
     setTimeout(() => {
        setReceiverCity(city);
        setCalculating(false);
        if (onComplete) {
           setTimeout(onComplete, 5000);
        }
     }, 1500);
  };

  const distanceMiles = receiverCity ? getDistanceFromLatLonInMiles(senderCity.lat, senderCity.lng, receiverCity.lat, receiverCity.lng) : 0;
  
  // Playful metrics
  const flights = Math.max(1, Math.round(distanceMiles / 2500)); // ~2500 miles per long flight
  const drivingHours = Math.round(distanceMiles / 65); // 65 mph avg
  const lightSeconds = (distanceMiles / 186282).toFixed(4); // speed of light is 186282 miles/sec

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800 bg-slate-900"
    >
      
      {/* Starry Background */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto">
         
         <AnimatePresence mode="wait">
            {!receiverCity && !calculating ? (
               <motion.div 
                  key="setup"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="w-full bg-slate-800/80 backdrop-blur rounded-3xl p-8 shadow-2xl border border-slate-700 text-center"
               >
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                     <MapPin size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                     Where are you?
                  </h2>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
                     {config.recipient ? `${config.recipient} is in ${senderCity.name}` : `Sender is in ${senderCity.name}`}
                  </p>

                  <div className="flex flex-col gap-3">
                     {cities.slice(1).map((c, i) => (
                        <button
                           key={i}
                           onClick={() => handleSelectCity(c)}
                           className="py-4 px-6 rounded-xl bg-slate-700 text-white font-bold text-sm hover:bg-slate-600 transition-colors flex items-center justify-between group"
                        >
                           {c.name}
                           <Navigation size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                     ))}
                  </div>
               </motion.div>
            ) : calculating ? (
               <motion.div 
                  key="calc"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center justify-center text-white"
               >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
                     <Navigation size={48} style={{ color: primaryColor }} />
                  </motion.div>
                  <h3 className="text-xl font-black mb-2">Calculating Distance</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Triangulating coordinates</p>
               </motion.div>
            ) : (
               <motion.div 
                  key="result"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="w-full flex flex-col items-center text-center h-full pt-12 pb-6"
               >
                  <div className="flex-1 flex flex-col items-center w-full relative pt-12">
                     
                     {/* Simplified 2D Abstract Map/Line Visual */}
                     <div className="w-full max-w-sm h-32 relative flex items-center justify-between px-8 mb-12">
                        
                        {/* Sender Node */}
                        <div className="relative flex flex-col items-center">
                           <div className="w-4 h-4 rounded-full bg-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.5)] relative z-10" />
                           <span className="absolute top-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              {senderCity.name}
                           </span>
                        </div>
                        
                        {/* Glowing Line */}
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-px bg-slate-700">
                           <motion.div 
                              className="h-full"
                              style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }}
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                           />
                           {/* Traveling blip */}
                           <motion.div 
                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"
                              initial={{ left: 0, opacity: 0 }}
                              animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                              transition={{ duration: 1.5, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
                           />
                        </div>

                        {/* Receiver Node */}
                        <div className="relative flex flex-col items-center">
                           <motion.div 
                              className="w-4 h-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10" 
                              style={{ backgroundColor: primaryColor }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.5, type: "spring" }}
                           />
                           <motion.span 
                              className="absolute top-6 text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.5 }}
                           >
                              {receiverCity?.name}
                           </motion.span>
                        </div>

                     </div>

                     {/* Distance Output */}
                     <motion.div 
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                     >
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
                           {new Intl.NumberFormat().format(Math.round(distanceMiles))} <span className="text-xl text-slate-400">mi</span>
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                           {config.body || "Physical separation distance"}
                        </p>
                     </motion.div>

                     {/* Comparative Metrics */}
                     <motion.div 
                        className="w-full bg-slate-800/80 backdrop-blur rounded-3xl p-6 border border-slate-700 flex flex-col gap-4 text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                     >
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">That's only...</h3>
                        
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"><Plane size={18}/></div>
                           <div>
                              <div className="font-black text-white">{flights} flight{flights > 1 ? 's' : ''}</div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Away</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"><Car size={18}/></div>
                           <div>
                              <div className="font-black text-white">{new Intl.NumberFormat().format(drivingHours)} hours</div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Of driving</div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"><Zap size={18}/></div>
                           <div>
                              <div className="font-black text-white">{lightSeconds} seconds</div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">For this message to reach you</div>
                           </div>
                        </div>
                     </motion.div>

                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

    </div>
  );
}
