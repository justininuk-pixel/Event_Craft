"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

type Droplet = {
  id: string;
  x: number; // 0-100%
  y: number; // 0-100%
  r: number; // size
  color: string;
  label: string;
};

const defaultDroplets: Droplet[] = [
  { id: "d1", x: 30, y: 30, r: 15, color: "#3b82f6", label: "Me" },
  { id: "d2", x: 70, y: 60, r: 20, color: "#a855f7", label: "You" },
];

export function WaterDropletMerger({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f0f9ff"]; // sky-50
  
  const title = config.title || "The Convergence";
  const finalMessage = config.body || "Two distinct lives, merging into one beautiful, unpredictable ocean.";
  
  const [droplets, setDroplets] = useState<Droplet[]>(defaultDroplets);
  const [merged, setMerged] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0); // 0 to 1

  const containerRef = useRef<HTMLDivElement>(null);

  // Use a gooey SVG filter to make them merge organically
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setDroplets(prev => {
        const d1 = prev[0];
        const d2 = prev[1];
        if (!d1 || !d2) return prev;

        const dx = d2.x - d1.x;
        const dy = d2.y - d1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Attraction force
        const force = 0.05 * (100 / Math.max(dist, 10)); // stronger as they get closer

        // Move towards each other
        const newD1 = { ...d1, x: d1.x + dx * force, y: d1.y + dy * force };
        const newD2 = { ...d2, x: d2.x - dx * force, y: d2.y - dy * force };

        if (dist < 5) {
          if (!merged) {
             setMerged(true);
             if (onComplete) setTimeout(onComplete, 4000);
             if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 100, 50]);
          }
          // Lock them together
          return [{...newD1, x: (d1.x + d2.x)/2, y: (d1.y + d2.y)/2, r: 30, color: primaryColor, label: "Us"}, { ...newD2, x: (d1.x + d2.x)/2, y: (d1.y + d2.y)/2, r: 0 }];
        } else {
          setMergeProgress(Math.max(0, 1 - (dist / 50)));
        }

        return [newD1, newD2];
      });

      if (!merged) {
        animId = requestAnimationFrame(animate);
      }
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [merged, primaryColor, onComplete]);

  return (
    <div className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-sky-50" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="absolute top-10 text-center w-full z-20 pointer-events-none">
        <h2 className="text-xl font-black text-sky-900 tracking-tight flex items-center justify-center gap-2">
           <Droplets size={20} className="text-sky-500" /> {title}
        </h2>
        <p className="text-sm text-sky-600/70 mt-1 font-sans italic max-w-xs mx-auto">
           Tilt your device to guide the droplets together
        </p>
      </div>

      <div className="flex-1 w-full relative z-10" ref={containerRef}>
        
        {/* Gooey Filter Definition */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* Droplets container with Gooey Filter */}
        <div className="absolute inset-0" style={{ filter: "url('#goo')" }}>
          {droplets.map((d, i) => {
            if (d.r === 0) return null;
            return (
              <motion.div
                key={d.id}
                className="absolute rounded-full flex items-center justify-center shadow-inner"
                style={{ 
                  left: `${d.x}%`, 
                  top: `${d.y}%`, 
                  width: `${d.r * 2}px`, 
                  height: `${d.r * 2}px`,
                  marginLeft: `-${d.r}px`,
                  marginTop: `-${d.r}px`,
                  backgroundColor: merged ? primaryColor : d.color,
                  // Mix colors slightly as they approach
                  boxShadow: `inset 0 -5px 10px rgba(0,0,0,0.2), inset 0 5px 10px rgba(255,255,255,0.8)`
                }}
                animate={{
                   scale: [1, 1.05, 0.95, 1],
                }}
                transition={{ repeat: Infinity, duration: 2 + i }}
              />
            );
          })}
        </div>

        {/* Labels (outside filter to stay crisp) */}
        <div className="absolute inset-0 pointer-events-none">
          {droplets.map(d => {
             if (d.r === 0) return null;
             return (
                <div 
                  key={d.id + "-label"} 
                  className="absolute text-white font-bold text-xs tracking-wider flex items-center justify-center transition-all duration-1000"
                  style={{ 
                    left: `${d.x}%`, 
                    top: `${d.y}%`, 
                    width: `${d.r * 2}px`, 
                    height: `${d.r * 2}px`,
                    marginLeft: `-${d.r}px`,
                    marginTop: `-${d.r}px`,
                    opacity: merged ? (d.id === "d1" ? 1 : 0) : 0.8
                  }}
                >
                  {d.label}
                </div>
             );
          })}
        </div>

      </div>

      {/* Merged Content Reveal */}
      <motion.div 
        className="absolute bottom-12 left-8 right-8 z-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: merged ? 1 : 0, y: merged ? 0 : 20 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="text-sky-900 text-lg leading-relaxed italic border-t border-sky-200 pt-6">
          "{finalMessage}"
        </p>
      </motion.div>

    </div>
  );
}
