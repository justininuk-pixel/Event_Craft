"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Navigation, MapPin } from "lucide-react";

type RouteNode = {
  id: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  caption?: string;
};

// Simulated route crossing a continent
const defaultRoute: RouteNode[] = [
  { id: "p1", lat: 34.05, lng: -118.24, photoUrl: "https://images.unsplash.com/photo-1580659324483-4f9e1e0a29cc?q=80&w=300&auto=format&fit=crop", caption: "Leaving LA. Car is packed." },
  { id: "p2", lat: 36.16, lng: -115.13 }, // passing through
  { id: "p3", lat: 39.73, lng: -104.99, photoUrl: "https://images.unsplash.com/photo-1600804889194-e6fbf08ddb39?q=80&w=300&auto=format&fit=crop", caption: "Denver. The radiator broke." },
  { id: "p4", lat: 41.25, lng: -95.93 }, // passing through
  { id: "p5", lat: 41.87, lng: -87.62, photoUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80&w=300&auto=format&fit=crop", caption: "Chicago deep dish. Worth the detour." },
  { id: "p6", lat: 40.71, lng: -74.00, photoUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=300&auto=format&fit=crop", caption: "We made it to NY." },
];

export function MapRouteReplayer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0fdf4"];
  const title = config.title || "Cross Country '08";
  
  const route: RouteNode[] = (config.experience as any)?.route || defaultRoute;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePhoto, setActivePhoto] = useState<RouteNode | null>(null);
  const [lastPhotoId, setLastPhotoId] = useState<string | null>(null);

  // Normalize lat/lng to 0-100 coordinates for simple SVG rendering
  const lats = route.map(r => r.lat);
  const lngs = route.map(r => r.lng);
  const minLat = Math.min(...lats) - 2;
  const maxLat = Math.max(...lats) + 2;
  const minLng = Math.min(...lngs) - 2;
  const maxLng = Math.max(...lngs) + 2;

  const getPos = (lat: number, lng: number) => {
    // Note: latitude goes UP, but SVG y goes DOWN
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);
    return { x, y };
  };

  const pathD = route.map((r, i) => {
    const { x, y } = getPos(r.lat, r.lng);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(" ");

  // Animation logic
  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    const duration = 10000; // 10 seconds to drive the whole route
    const startTime = Date.now() - (progress * duration);

    const animate = () => {
      if (activePhoto) return; // Pause while photo is showing

      const elapsed = Date.now() - startTime;
      let p = elapsed / duration;
      
      if (p >= 1) {
        p = 1;
        setIsPlaying(false);
        setProgress(1);
        if (onComplete) onComplete();
        return;
      }

      setProgress(p);

      // Check if we hit a node with a photo
      const currentIndex = Math.floor(p * (route.length - 1));
      const nextIndex = Math.min(currentIndex + 1, route.length - 1);
      
      // Calculate local progress between the two nodes
      const nodeP = (p * (route.length - 1)) - currentIndex;

      // If we are exactly at or very close to a node with a photo, pause and show it
      if (nodeP > 0.98 && route[nextIndex].photoUrl) {
         // Prevent re-triggering the same photo
         if (lastPhotoId !== route[nextIndex].id) {
           setActivePhoto(route[nextIndex]);
           setLastPhotoId(route[nextIndex].id);
           setIsPlaying(false);
           // Auto resume after 3 seconds
           setTimeout(() => {
              setActivePhoto(null);
              setIsPlaying(true);
           }, 3000);
         }
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, progress, activePhoto, route]);

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-black text-emerald-900 tracking-tight">{title}</h2>
           <p className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold">Route Replay</p>
        </div>
        <button 
          onClick={() => {
             if (progress >= 1) setProgress(0);
             setIsPlaying(!isPlaying);
          }}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative mt-24 mb-10 mx-6 bg-emerald-50 rounded-xl border-4 border-emerald-100 shadow-inner overflow-hidden">
         {/* Topographical background lines */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, #047857 1px, transparent 1px, transparent 20px)` }} />
         
         <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] overflow-visible">
            
            {/* The full route path (faded) */}
            <path d={pathD} fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* The active driven path */}
            <motion.path 
              d={pathD} 
              fill="none" 
              stroke={primaryColor} 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0 }}
            />

            {/* Nodes with photos get a pin */}
            {route.map((r) => {
               if (!r.photoUrl) return null;
               const { x, y } = getPos(r.lat, r.lng);
               return (
                  <circle key={r.id} cx={x} cy={y} r="2" fill="white" stroke={primaryColor} strokeWidth="1" />
               );
            })}
         </svg>

         {/* The Car Icon interpolating along the SVG path */}
         {/* Since framer-motion path interpolation is tricky without an SVG `<animateMotion>`, 
             we'll approximate by finding the segment we are currently on. */}
         {(() => {
            const currentSegment = Math.floor(progress * (route.length - 1));
            const nextSegment = Math.min(currentSegment + 1, route.length - 1);
            const localP = (progress * (route.length - 1)) - currentSegment;
            
            const start = getPos(route[currentSegment].lat, route[currentSegment].lng);
            const end = getPos(route[nextSegment].lat, route[nextSegment].lng);
            
            const curX = start.x + (end.x - start.x) * localP;
            const curY = start.y + (end.y - start.y) * localP;

            // Calculate angle
            const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90;

            return (
               <div 
                 className="absolute w-6 h-6 flex items-center justify-center pointer-events-none transition-all duration-75 ease-linear z-10"
                 style={{ 
                    left: `calc(1rem + ${curX}%)`, 
                    top: `calc(1rem + ${curY}%)`, 
                    transform: `translate(-50%, -50%) rotate(${angle}deg)` 
                 }}
               >
                  <Navigation size={16} className="text-red-500 fill-red-500 drop-shadow-md" />
               </div>
            );
         })()}
      </div>

      {/* Photo Popup Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-sm pointer-events-none"
          >
             <div className="bg-white p-4 rounded-xl shadow-2xl max-w-sm w-full border-4 border-emerald-100 rotate-[-2deg]">
                <img src={activePhoto.photoUrl} alt="Memory" className="w-full h-48 object-cover rounded shadow-inner bg-gray-100" />
                <div className="mt-4 flex gap-2 items-start">
                   <MapPin size={16} className="text-emerald-500 shrink-0 mt-1" />
                   <p className="text-gray-700 font-serif leading-snug">{activePhoto.caption}</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
