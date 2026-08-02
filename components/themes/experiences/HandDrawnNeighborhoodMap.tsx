"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin } from "lucide-react";

type MapLocation = {
  id: string;
  label: string;
  story: string;
  cx: number;
  cy: number;
};

const defaultLocations: MapLocation[] = [
  { id: "loc1", label: "Miller's House", story: "This is where we broke the window playing baseball. Mrs. Miller was furious but made us lemonade afterwards.", cx: 120, cy: 100 },
  { id: "loc2", label: "The Big Oak", story: "We carved our initials into this tree in 1997. I wonder if they're still there.", cx: 280, cy: 180 },
  { id: "loc3", label: "Corner Store", story: "Mr. Park always let us grab penny candy on credit. We still owe him $3.40.", cx: 60, cy: 280 },
  { id: "loc4", label: "Our House", story: "The yellow house with the crooked mailbox. Dad never did fix that.", cx: 200, cy: 60 },
  { id: "loc5", label: "The Creek", story: "We built a dam here every spring. It never lasted more than a week.", cx: 340, cy: 300 },
];

export function HandDrawnNeighborhoodMap({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#8b5cf6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef9ef"];

  const locations: MapLocation[] = (config.experience as any)?.locations || defaultLocations;
  const title = config.title || "Maple Street, 1995";

  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);

  const handleLocationClick = (loc: MapLocation) => {
    setActiveLocation(loc);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    if (onComplete) onComplete();
  };

  return (
    <div
      className="w-full h-full relative flex flex-col font-sans overflow-hidden touch-none select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* Title */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h2 className="text-2xl font-black tracking-tight text-amber-900 drop-shadow-sm" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          {title}
        </h2>
        <p className="text-xs text-amber-700/60 mt-1 italic">Tap a location to read its story</p>
      </div>

      {/* SVG Map */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full z-10">
        {/* Hand-drawn roads */}
        <path d="M 20,200 C 80,195 120,210 200,200 C 280,190 340,205 380,200" fill="none" stroke="#a8a29e" strokeWidth="18" strokeLinecap="round" opacity="0.5" />
        <path d="M 200,20 C 195,80 210,140 200,200 C 190,260 205,320 200,380" fill="none" stroke="#a8a29e" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
        <path d="M 20,200 C 80,195 120,210 200,200 C 280,190 340,205 380,200" fill="none" stroke="#d6d3d1" strokeWidth="12" strokeLinecap="round" strokeDasharray="2 6" opacity="0.8" />

        {/* Dashed lane lines */}
        <path d="M 200,20 C 195,80 210,140 200,200 C 190,260 205,320 200,380" fill="none" stroke="#d6d3d1" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 6" opacity="0.6" />

        {/* Sketchy houses as simple shapes */}
        <rect x="90" y="70" width="30" height="25" rx="2" fill="none" stroke="#78716c" strokeWidth="1.5" opacity="0.6" />
        <polygon points="90,70 105,55 120,70" fill="none" stroke="#78716c" strokeWidth="1.5" opacity="0.6" />

        <rect x="250" y="140" width="35" height="30" rx="2" fill="none" stroke="#78716c" strokeWidth="1.5" opacity="0.6" />
        <polygon points="250,140 267,122 285,140" fill="none" stroke="#78716c" strokeWidth="1.5" opacity="0.6" />

        <rect x="40" y="250" width="25" height="20" rx="2" fill="none" stroke="#78716c" strokeWidth="1.5" opacity="0.6" />

        {/* Trees */}
        <circle cx="310" cy="100" r="12" fill="none" stroke="#65a30d" strokeWidth="1.5" opacity="0.5" />
        <line x1="310" y1="112" x2="310" y2="125" stroke="#78716c" strokeWidth="1.5" opacity="0.5" />

        <circle cx="150" cy="320" r="10" fill="none" stroke="#65a30d" strokeWidth="1.5" opacity="0.4" />
        <line x1="150" y1="330" x2="150" y2="340" stroke="#78716c" strokeWidth="1.5" opacity="0.4" />

        {/* Wavy creek */}
        <path d="M 300,260 C 310,270 330,265 340,280 C 350,295 360,290 370,310" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Interactive location markers */}
        {locations.map((loc) => (
          <g key={loc.id} className="cursor-pointer" onClick={() => handleLocationClick(loc)}>
            <circle cx={loc.cx} cy={loc.cy} r="14" fill={primaryColor} opacity="0.2" className="animate-pulse" />
            <circle cx={loc.cx} cy={loc.cy} r="8" fill={primaryColor} stroke="white" strokeWidth="2" opacity="0.9" />
            <text x={loc.cx} y={loc.cy - 18} textAnchor="middle" fill="#44403c" fontSize="9" fontWeight="bold" opacity="0.8" style={{ fontFamily: "'Patrick Hand', cursive" }}>
              {loc.label}
            </text>
          </g>
        ))}

        {/* Compass rose */}
        <g transform="translate(360, 50)">
          <text x="0" y="0" textAnchor="middle" fill="#a8a29e" fontSize="12" fontWeight="bold">N</text>
          <line x1="0" y1="4" x2="0" y2="18" stroke="#a8a29e" strokeWidth="1.5" />
          <polygon points="-4,18 0,8 4,18" fill="#a8a29e" opacity="0.5" />
        </g>
      </svg>

      {/* Story Modal */}
      <AnimatePresence>
        {activeLocation && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-amber-50 border-t-2 border-amber-900/30 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] p-6 pb-8"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: primaryColor }} />
                <h3 className="font-black text-lg text-amber-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                  {activeLocation.label}
                </h3>
              </div>
              <button onClick={() => setActiveLocation(null)} className="text-amber-700 p-1 hover:bg-amber-200 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-amber-800 leading-relaxed" style={{ fontFamily: "'Patrick Hand', cursive", fontSize: "1.1rem" }}>
              {activeLocation.story}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
